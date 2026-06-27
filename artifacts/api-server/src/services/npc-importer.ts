import type { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";
import type { CreatorNpc } from "@workspace/db";

export class NpcImporter {
  constructor(private repo: DrizzleNpcEditorRepository) {}

  async importFromJson(
    userId: number,
    jsonData: string,
    opts: { projectId?: number; nameOverride?: string } = {}
  ): Promise<CreatorNpc> {
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(jsonData) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid JSON data");
    }

    const npcData = (pkg["npc"] ?? pkg) as Record<string, unknown>;
    if (!npcData["name"]) throw new Error("NPC name is required in import data");

    const name = (opts.nameOverride ?? (npcData["name"] as string) ?? "Imported NPC") + " (Import)";
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const npc = await this.repo.createNpc({
      userId,
      projectId: opts.projectId ?? null,
      name,
      slug,
      description: (npcData["description"] as string) ?? null,
      npcType: (npcData["npcType"] as "humanoid") ?? "humanoid",
      state: "idle",
      behavior: (npcData["behavior"] as "neutral") ?? "neutral",
      level: (npcData["level"] as number) ?? 1,
      tags: (npcData["tags"] as string[]) ?? [],
      visibility: "private",
      isTemplate: false,
    });

    // import profile if present
    if (pkg["profile"]) {
      const { id: _id, npcId: _n, createdAt: _c, updatedAt: _u, ...profileRest } = pkg["profile"] as Record<string, unknown>;
      await this.repo.upsertProfile(npc.id, profileRest);
    }

    // import attributes if present
    if (pkg["attributes"]) {
      const { id: _id, npcId: _n, createdAt: _c, updatedAt: _u, ...attrRest } = pkg["attributes"] as Record<string, unknown>;
      await this.repo.upsertAttributes(npc.id, attrRest);
    }

    // import stats if present
    if (pkg["stats"]) {
      const { id: _id, npcId: _n, createdAt: _c, updatedAt: _u, ...statsRest } = pkg["stats"] as Record<string, unknown>;
      await this.repo.upsertStats(npc.id, statsRest);
    }

    // import skills
    for (const skill of (pkg["skills"] as Record<string, unknown>[]) ?? []) {
      const { id: _id, npcId: _n, createdAt: _c, updatedAt: _u, ...rest } = skill;
      await this.repo.createSkill({ npcId: npc.id, ...rest } as Parameters<typeof this.repo.createSkill>[0]);
    }

    // import spawn points
    for (const sp of (pkg["spawnPoints"] as Record<string, unknown>[]) ?? []) {
      const { id: _id, uuid: _uuid, npcId: _n, createdAt: _c, updatedAt: _u, ...rest } = sp;
      await this.repo.createSpawnPoint({ npcId: npc.id, ...rest } as Parameters<typeof this.repo.createSpawnPoint>[0]);
    }

    await this.repo.recordHistory({ npcId: npc.id, userId, action: "import", description: "NPC imported from JSON" });
    return npc;
  }

  async importFromTemplate(userId: number, templateId: number, opts: { name: string; projectId?: number }): Promise<CreatorNpc> {
    const template = await this.repo.getTemplateById(templateId);
    if (!template) throw new Error("Template not found");

    const jsonData = JSON.stringify({ npc: (template.templateData as Record<string, unknown>)["npc"] ?? template.templateData, ...(template.templateData as Record<string, unknown>) });
    const npc = await this.importFromJson(userId, jsonData, { nameOverride: opts.name, projectId: opts.projectId });
    await this.repo.incrementTemplateUseCount(templateId);
    return npc;
  }
}
