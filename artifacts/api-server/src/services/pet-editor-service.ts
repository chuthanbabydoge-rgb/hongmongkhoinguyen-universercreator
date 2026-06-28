import { DrizzlePetRepository } from "../repositories/pet-repository";
import { PetValidator } from "./pet-validator";
import { PetExporter } from "./pet-exporter";
import { PetImporter } from "./pet-importer";
import { PetRuntimeBridge } from "./pet-runtime-bridge";
import type { InsertPet } from "@workspace/db/schema";

const repo = new DrizzlePetRepository();
const validator = new PetValidator(repo);
const exporter = new PetExporter(repo);
const importer = new PetImporter(repo);
const bridge = new PetRuntimeBridge(repo);

export class PetEditorService {

  getDashboard(userId: number) { return repo.getDashboard(userId); }

  listPets(userId: number, limit = 20, offset = 0, search?: string) {
    return repo.listPets(userId, limit, offset, search);
  }

  async createPet(userId: number, data: Partial<InsertPet>) {
    const pet = await repo.createPet({ ...data, createdBy: userId, projectId: data.projectId ?? 0, name: data.name ?? "New Pet" });
    await repo.addHistory({ petId: pet.id, action: "created", changedBy: userId });
    return pet;
  }

  getPet(id: number) { return repo.getPet(id); }
  getFullPet(id: number) { return repo.getFullPet(id); }

  async updatePet(id: number, userId: number, data: Partial<InsertPet>) {
    const pet = await repo.updatePet(id, data);
    if (pet) await repo.addHistory({ petId: id, action: "updated", changedBy: userId });
    return pet;
  }

  async deletePet(id: number) {
    await repo.deletePet(id);
  }

  async duplicatePet(id: number, userId: number) {
    const original = await repo.getFullPet(id);
    if (!original) throw new Error("Pet not found");
    const copy = await repo.createPet({ ...original.pet, name: `${original.pet.name} (Copy)`, id: undefined as any, createdBy: userId, isPublished: false });
    await repo.addHistory({ petId: copy.id, action: "duplicated", detail: `From pet ${id}`, changedBy: userId });
    return copy;
  }

  async forkPet(id: number, userId: number) {
    const original = await repo.getFullPet(id);
    if (!original) throw new Error("Pet not found");
    const fork = await repo.createPet({ ...original.pet, name: `${original.pet.name} (Fork)`, id: undefined as any, createdBy: userId, isPublished: false });
    await repo.addHistory({ petId: fork.id, action: "forked", detail: `From pet ${id}`, changedBy: userId });
    return fork;
  }

  async publishPet(id: number, userId: number) {
    const pet = await repo.updatePet(id, { isPublished: true });
    if (pet) {
      const snap = await repo.getFullPet(id);
      await repo.addVersion({ petId: id, snapshot: snap as any, changelog: "Published", createdBy: userId });
      await repo.addHistory({ petId: id, action: "published", changedBy: userId });
    }
    return pet;
  }

  async archivePet(id: number, userId: number) {
    const pet = await repo.updatePet(id, { isArchived: true });
    if (pet) await repo.addHistory({ petId: id, action: "archived", changedBy: userId });
    return pet;
  }

  async restorePet(id: number, userId: number) {
    const pet = await repo.updatePet(id, { isArchived: false });
    if (pet) await repo.addHistory({ petId: id, action: "restored", changedBy: userId });
    return pet;
  }

  // Species
  listSpecies(projectId: number) { return repo.listSpecies(projectId); }
  getSpecies(id: number) { return repo.getSpecies(id); }
  createSpecies(data: Parameters<typeof repo.createSpecies>[0]) { return repo.createSpecies(data); }
  updateSpecies(id: number, data: Parameters<typeof repo.updateSpecies>[1]) { return repo.updateSpecies(id, data); }
  deleteSpecies(id: number) { return repo.deleteSpecies(id); }

  // Growth / Stats / Loyalty / Hunger / Personality / Breeding
  getStats(petId: number) { return repo.getStats(petId); }
  upsertStats(data: Parameters<typeof repo.upsertStats>[0]) { return repo.upsertStats(data); }
  getGrowth(petId: number) { return repo.getGrowth(petId); }
  upsertGrowth(data: Parameters<typeof repo.upsertGrowth>[0]) { return repo.upsertGrowth(data); }
  getLoyalty(petId: number) { return repo.getLoyalty(petId); }
  upsertLoyalty(data: Parameters<typeof repo.upsertLoyalty>[0]) { return repo.upsertLoyalty(data); }
  getHunger(petId: number) { return repo.getHunger(petId); }
  upsertHunger(data: Parameters<typeof repo.upsertHunger>[0]) { return repo.upsertHunger(data); }
  getPersonality(petId: number) { return repo.getPersonality(petId); }
  upsertPersonality(data: Parameters<typeof repo.upsertPersonality>[0]) { return repo.upsertPersonality(data); }
  getBreeding(petId: number) { return repo.getBreeding(petId); }
  upsertBreeding(data: Parameters<typeof repo.upsertBreeding>[0]) { return repo.upsertBreeding(data); }

  // Skills / Equipment / Levels
  getSkills(petId: number) { return repo.getSkills(petId); }
  addSkill(data: Parameters<typeof repo.addSkill>[0]) { return repo.addSkill(data); }
  updateSkill(id: number, data: Parameters<typeof repo.updateSkill>[1]) { return repo.updateSkill(id, data); }
  deleteSkill(id: number) { return repo.deleteSkill(id); }
  getEquipment(petId: number) { return repo.getEquipment(petId); }
  equipItem(data: Parameters<typeof repo.equipItem>[0]) { return repo.equipItem(data); }
  unequipItem(id: number) { return repo.unequipItem(id); }
  getLevels(petId: number) { return repo.getLevels(petId); }
  upsertLevel(data: Parameters<typeof repo.upsertLevel>[0]) { return repo.upsertLevel(data); }
  deleteLevel(id: number) { return repo.deleteLevel(id); }

  // Evolution / Spawn Rules
  getEvolutions(petId: number) { return repo.getEvolutions(petId); }
  addEvolution(data: Parameters<typeof repo.addEvolution>[0]) { return repo.addEvolution(data); }
  updateEvolution(id: number, data: Parameters<typeof repo.updateEvolution>[1]) { return repo.updateEvolution(id, data); }
  deleteEvolution(id: number) { return repo.deleteEvolution(id); }
  getSpawnRules(petId: number) { return repo.getSpawnRules(petId); }
  addSpawnRule(data: Parameters<typeof repo.addSpawnRule>[0]) { return repo.addSpawnRule(data); }
  updateSpawnRule(id: number, data: Parameters<typeof repo.updateSpawnRule>[1]) { return repo.updateSpawnRule(id, data); }
  deleteSpawnRule(id: number) { return repo.deleteSpawnRule(id); }

  // Templates / Versions / History / Statistics
  getTemplates(global?: boolean) { return repo.getTemplates(global); }
  addTemplate(data: Parameters<typeof repo.addTemplate>[0]) { return repo.addTemplate(data); }
  getVersions(petId: number) { return repo.getVersions(petId); }
  getHistory(petId: number) { return repo.getHistory(petId); }
  getStatistics(petId: number) { return repo.getStatistics(petId); }

  // Validation / Export / Import
  validate(petId: number) { return validator.validate(petId); }
  exportJson(petId: number, userId: number) { return exporter.exportJson(petId, userId); }
  exportTemplate(petId: number, userId: number) { return exporter.exportTemplate(petId, userId); }
  exportPackage(petId: number, userId: number) { return exporter.exportPackage(petId, userId); }
  importJson(petId: number, payload: Record<string, unknown>, userId: number) { return importer.importJson(petId, payload, userId); }
  importTemplate(petId: number, payload: Record<string, unknown>, userId: number) { return importer.importTemplate(petId, payload, userId); }
  importPackage(petId: number, payload: Record<string, unknown>, userId: number) { return importer.importPackage(petId, payload, userId); }

  // Runtime / Simulation
  get runtime() { return bridge; }
  spawnPet(petId: number) { return bridge.spawnPet(petId); }
  despawnPet(petId: number) { return bridge.despawnPet(petId); }
  summon(petId: number, ownerId: number) { return bridge.summon(petId, ownerId); }
  dismiss(petId: number) { return bridge.dismiss(petId); }
  feed(petId: number, foodType: string, amount?: number) { return bridge.feed(petId, foodType, amount); }
  gainExp(petId: number, amount: number) { return bridge.gainExp(petId, amount); }
  levelUp(petId: number) { return bridge.levelUp(petId); }
  evolve(petId: number, targetSpeciesId: number) { return bridge.evolve(petId, targetSpeciesId); }
  breed(petId: number, partnerId: number) { return bridge.breed(petId, partnerId); }
  simulateCombat(petId: number, opponentData: object) { return bridge.simulateCombat(petId, opponentData); }
  simulateGrowth(petId: number, levels: number) { return bridge.simulateGrowth(petId, levels); }
  simulateLoyalty(petId: number, actions: string[]) { return bridge.simulateLoyalty(petId, actions); }
}
