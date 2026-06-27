import type { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";

export interface NpcValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class NpcValidator {
  constructor(private repo: DrizzleNpcEditorRepository) {}

  async validate(npcId: number, userId: number): Promise<NpcValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) {
      return { valid: false, errors: ["NPC not found"], warnings: [] };
    }

    // Duplicate name check (same user)
    const allNpcs = await this.repo.listNpcs(userId, 200, 0);
    const duplicates = allNpcs.filter((n) => n.name === npc.name && n.id !== npc.id);
    if (duplicates.length > 0) {
      errors.push(`Duplicate NPC name: "${npc.name}" already exists`);
    }

    // Missing spawn points
    const spawns = await this.repo.listSpawnPoints(npcId);
    if (spawns.length === 0) {
      warnings.push("NPC has no spawn points defined");
    }

    // Broken dialogue check
    const dialogues = await this.repo.listDialogues(npcId);
    for (const d of dialogues) {
      const nodes = await this.repo.listDialogueNodes(d.id);
      const startNodes = nodes.filter((n) => n.isStart);
      if (nodes.length > 0 && startNodes.length === 0) {
        errors.push(`Dialogue "${d.name}" has nodes but no start node`);
      }
      if (nodes.length === 0) {
        warnings.push(`Dialogue "${d.name}" has no nodes`);
      }
      // check next node references are valid
      const nodeKeys = new Set(nodes.map((n) => n.nodeKey));
      for (const node of nodes) {
        const choices = await this.repo.listDialogueChoices(node.id);
        for (const choice of choices) {
          if (choice.nextNodeKey && !nodeKeys.has(choice.nextNodeKey)) {
            errors.push(`Dialogue "${d.name}" → node "${node.nodeKey}" → choice references missing node key "${choice.nextNodeKey}"`);
          }
        }
      }
    }

    // Missing behavior
    const behaviors = await this.repo.listBehaviors(npcId);
    if (behaviors.length === 0) {
      warnings.push("NPC has no behaviors defined");
    }

    // Invalid patrol paths
    const patrols = await this.repo.listPatrolPaths(npcId);
    for (const p of patrols) {
      const waypoints = p.waypoints as unknown[];
      if (!Array.isArray(waypoints) || waypoints.length < 2) {
        errors.push(`Patrol path "${p.name}" needs at least 2 waypoints`);
      }
    }

    // Circular relation check
    const relations = await this.repo.listRelations(npcId);
    for (const r of relations) {
      if (r.targetNpcId === npcId) {
        errors.push("NPC has a self-referential relation (circular)");
      }
    }

    // Missing faction when NPC has faction-related behavior
    if (!npc.factionId) {
      warnings.push("NPC is not assigned to any faction");
    }

    // Invalid equipment (slot with no item name)
    const equipment = await this.repo.listEquipment(npcId);
    for (const eq of equipment) {
      if (!eq.itemName) {
        errors.push(`Equipment slot "${eq.slot}" has no item assigned`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
