import type { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";

export class NpcSerializer {
  constructor(private repo: DrizzleNpcEditorRepository) {}

  async serialize(npcId: number, userId: number): Promise<Record<string, unknown>> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found");

    const [
      profile,
      attributes,
      stats,
      skills,
      inventory,
      equipment,
      behaviors,
      behaviorTree,
      dialogues,
      spawnPoints,
      patrolPaths,
      relations,
      schedule,
    ] = await Promise.all([
      this.repo.getProfile(npcId),
      this.repo.getAttributes(npcId),
      this.repo.getStats(npcId),
      this.repo.listSkills(npcId),
      this.repo.listInventory(npcId),
      this.repo.listEquipment(npcId),
      this.repo.listBehaviors(npcId),
      this.repo.getBehaviorTree(npcId),
      this.repo.listDialogues(npcId),
      this.repo.listSpawnPoints(npcId),
      this.repo.listPatrolPaths(npcId),
      this.repo.listRelations(npcId),
      this.repo.getSchedule(npcId),
    ]);

    // fetch nodes/choices for each dialogue
    const dialoguesFull = await Promise.all(
      dialogues.map(async (d) => {
        const nodes = await this.repo.listDialogueNodes(d.id);
        const nodesFull = await Promise.all(
          nodes.map(async (n) => ({
            ...n,
            choices: await this.repo.listDialogueChoices(n.id),
          }))
        );
        return { ...d, nodes: nodesFull };
      })
    );

    return {
      npc,
      profile,
      attributes,
      stats,
      skills,
      inventory,
      equipment,
      behaviors,
      behaviorTree,
      dialogues: dialoguesFull,
      spawnPoints,
      patrolPaths,
      relations,
      schedule,
    };
  }
}
