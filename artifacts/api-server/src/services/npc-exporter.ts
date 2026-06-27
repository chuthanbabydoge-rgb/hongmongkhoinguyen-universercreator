import type { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";
import { NpcSerializer } from "./npc-serializer";

export class NpcExporter {
  private serializer: NpcSerializer;

  constructor(private repo: DrizzleNpcEditorRepository) {
    this.serializer = new NpcSerializer(repo);
  }

  async exportAsJson(npcId: number, userId: number): Promise<{ data: Record<string, unknown> }> {
    const data = await this.serializer.serialize(npcId, userId);
    return { data };
  }

  async exportAsTemplate(npcId: number, userId: number, name: string, description?: string) {
    const data = await this.serializer.serialize(npcId, userId);
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");
    return this.repo.createTemplate({
      userId,
      sourceNpcId: npcId,
      name,
      description: description ?? null,
      thumbnail: npc.thumbnail ?? null,
      npcType: npc.npcType,
      tags: npc.tags as string[],
      isPublic: false,
      templateData: data as Record<string, unknown>,
    });
  }

  async exportNpcPackage(npcIds: number[], userId: number): Promise<Record<string, unknown>> {
    const npcs = await Promise.all(npcIds.map((id) => this.serializer.serialize(id, userId)));
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      npcs,
    };
  }
}
