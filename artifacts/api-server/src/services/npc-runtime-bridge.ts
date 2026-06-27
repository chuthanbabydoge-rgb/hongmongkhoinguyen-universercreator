import type { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";
import { NpcSerializer } from "./npc-serializer";

export class NpcRuntimeBridge {
  private serializer: NpcSerializer;

  constructor(private repo: DrizzleNpcEditorRepository) {
    this.serializer = new NpcSerializer(repo);
  }

  async preview(npcId: number, userId: number): Promise<Record<string, unknown>> {
    const pkg = await this.serializer.serialize(npcId, userId);
    const npc = pkg["npc"] as Record<string, unknown>;
    return {
      mode: "preview",
      npcId,
      name: npc["name"],
      npcType: npc["npcType"],
      state: npc["state"],
      behavior: npc["behavior"],
      level: npc["level"],
      stats: pkg["stats"],
      attributes: pkg["attributes"],
      behaviors: pkg["behaviors"],
      behaviorTree: pkg["behaviorTree"],
      spawnPoints: pkg["spawnPoints"],
      patrolPaths: pkg["patrolPaths"],
      ready: true,
    };
  }

  async previewBehavior(npcId: number, userId: number): Promise<Record<string, unknown>> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");
    const [behaviors, tree] = await Promise.all([
      this.repo.listBehaviors(npcId),
      this.repo.getBehaviorTree(npcId),
    ]);
    return {
      mode: "behavior_preview",
      npcId,
      behaviors,
      behaviorTree: tree,
      currentState: npc.state,
    };
  }

  async previewDialogue(npcId: number, userId: number, dialogueId?: number): Promise<Record<string, unknown>> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");
    const dialogues = await this.repo.listDialogues(npcId);
    const target = dialogueId ? dialogues.find((d) => d.id === dialogueId) : dialogues.find((d) => d.isDefault) ?? dialogues[0];
    if (!target) return { mode: "dialogue_preview", npcId, dialogue: null };
    const nodes = await this.repo.listDialogueNodes(target.id);
    const nodesFull = await Promise.all(
      nodes.map(async (n) => ({ ...n, choices: await this.repo.listDialogueChoices(n.id) }))
    );
    return { mode: "dialogue_preview", npcId, dialogue: { ...target, nodes: nodesFull } };
  }

  async previewAnimation(npcId: number, userId: number): Promise<Record<string, unknown>> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");
    const profile = await this.repo.getProfile(npcId);
    return {
      mode: "animation_preview",
      npcId,
      state: npc.state,
      modelAssetId: profile?.modelAssetId ?? null,
      currentAnimation: npc.state === "idle" ? "idle" : npc.state,
    };
  }

  async previewSpawn(npcId: number, userId: number): Promise<Record<string, unknown>> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");
    const spawnPoints = await this.repo.listSpawnPoints(npcId);
    return {
      mode: "spawn_preview",
      npcId,
      name: npc.name,
      spawnPoints,
    };
  }
}
