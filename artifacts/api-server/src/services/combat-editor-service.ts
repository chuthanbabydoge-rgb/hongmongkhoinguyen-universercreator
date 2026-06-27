import { DrizzleCombatRepository } from "../repositories/combat-repository";
import { CombatValidator } from "./combat-validator";
import { CombatExporter } from "./combat-exporter";
import { CombatImporter } from "./combat-importer";
import { CombatRuntimeBridge } from "./combat-runtime-bridge";
import type { InsertCombat } from "@workspace/db/schema";

export class CombatEditorService {
  private repo: DrizzleCombatRepository;
  validator: CombatValidator;
  exporter: CombatExporter;
  importer: CombatImporter;
  runtime: CombatRuntimeBridge;

  constructor() {
    this.repo = new DrizzleCombatRepository();
    this.validator = new CombatValidator(this.repo);
    this.exporter = new CombatExporter(this.repo);
    this.importer = new CombatImporter(this.repo);
    this.runtime = new CombatRuntimeBridge(this.repo);
  }

  getDashboard(userId: number) { return this.repo.getDashboard(userId); }

  listCombats(userId: number, limit: number, offset: number, search?: string) { return this.repo.listCombats(userId, limit, offset, search); }

  async createCombat(userId: number, data: Partial<InsertCombat>) {
    const combat = await this.repo.createCombat({ name: "New Combat", ...data, createdBy: userId } as InsertCombat);
    await this.repo.recordHistory({ combatId: combat.id, actionType: "created", performedBy: userId });
    return combat;
  }

  async getCombat(id: number) {
    const combat = await this.repo.getCombat(id);
    if (!combat) throw new Error("Combat not found");
    return combat;
  }

  async updateCombat(id: number, userId: number, data: Partial<InsertCombat>) {
    const combat = await this.repo.updateCombat(id, data);
    await this.repo.recordHistory({ combatId: id, actionType: "updated", performedBy: userId });
    return combat;
  }

  async deleteCombat(id: number, userId: number) {
    await this.repo.recordHistory({ combatId: id, actionType: "deleted", performedBy: userId });
    await this.repo.deleteCombat(id);
  }

  async duplicateCombat(id: number, userId: number) {
    const json = await this.exporter.exportToJson(id, userId);
    return this.importer.importFromJson(userId, json);
  }

  async publishCombat(id: number, userId: number) {
    const result = await this.validator.validate(id);
    if (!result.valid) throw new Error(`Validation failed: ${result.errors.map(e => e.message).join("; ")}`);
    const combat = await this.repo.updateCombat(id, { isPublished: true });
    await this.repo.recordHistory({ combatId: id, actionType: "published", performedBy: userId });
    return combat;
  }

  async archiveCombat(id: number, userId: number) {
    const combat = await this.repo.updateCombat(id, { isArchived: true });
    await this.repo.recordHistory({ combatId: id, actionType: "archived", performedBy: userId });
    return combat;
  }

  async restoreCombat(id: number, userId: number) {
    const combat = await this.repo.updateCombat(id, { isArchived: false });
    await this.repo.recordHistory({ combatId: id, actionType: "restored", performedBy: userId });
    return combat;
  }

  async snapshotVersion(id: number, userId: number, changelog?: string) {
    const json = await this.exporter.exportToJson(id, userId);
    const combat = await this.repo.getCombat(id);
    if (!combat) throw new Error("Combat not found");
    return this.repo.createVersion({ combatId: id, version: combat.version, snapshot: JSON.parse(json), changelog: changelog ?? null, createdBy: userId });
  }

  getRules(id: number) { return this.repo.getRules(id); }
  createRule(id: number, data: object) { return this.repo.createRule({ ...data, combatId: id } as Parameters<typeof this.repo.createRule>[0]); }
  updateRule(ruleId: number, data: object) { return this.repo.updateRule(ruleId, data as Parameters<typeof this.repo.updateRule>[1]); }
  deleteRule(ruleId: number) { return this.repo.deleteRule(ruleId); }

  getDamageFormulas(id: number) { return this.repo.getDamageFormulas(id); }
  createDamageFormula(id: number, data: object) { return this.repo.createDamageFormula({ ...data, combatId: id } as Parameters<typeof this.repo.createDamageFormula>[0]); }
  updateDamageFormula(fId: number, data: object) { return this.repo.updateDamageFormula(fId, data as Parameters<typeof this.repo.updateDamageFormula>[1]); }
  deleteDamageFormula(fId: number) { return this.repo.deleteDamageFormula(fId); }

  getDamageModifiers(id: number) { return this.repo.getDamageModifiers(id); }
  createDamageModifier(id: number, data: object) { return this.repo.createDamageModifier({ ...data, combatId: id } as Parameters<typeof this.repo.createDamageModifier>[0]); }
  updateDamageModifier(mId: number, data: object) { return this.repo.updateDamageModifier(mId, data as Parameters<typeof this.repo.updateDamageModifier>[1]); }
  deleteDamageModifier(mId: number) { return this.repo.deleteDamageModifier(mId); }

  getDefenseRules(id: number) { return this.repo.getDefenseRules(id); }
  createDefenseRule(id: number, data: object) { return this.repo.createDefenseRule({ ...data, combatId: id } as Parameters<typeof this.repo.createDefenseRule>[0]); }
  updateDefenseRule(dId: number, data: object) { return this.repo.updateDefenseRule(dId, data as Parameters<typeof this.repo.updateDefenseRule>[1]); }
  deleteDefenseRule(dId: number) { return this.repo.deleteDefenseRule(dId); }

  getResistances(id: number) { return this.repo.getResistances(id); }
  createResistance(id: number, data: object) { return this.repo.createResistance({ ...data, combatId: id } as Parameters<typeof this.repo.createResistance>[0]); }
  updateResistance(rId: number, data: object) { return this.repo.updateResistance(rId, data as Parameters<typeof this.repo.updateResistance>[1]); }
  deleteResistance(rId: number) { return this.repo.deleteResistance(rId); }

  getHitRules(id: number) { return this.repo.getHitRules(id); }
  createHitRule(id: number, data: object) { return this.repo.createHitRule({ ...data, combatId: id } as Parameters<typeof this.repo.createHitRule>[0]); }
  updateHitRule(hId: number, data: object) { return this.repo.updateHitRule(hId, data as Parameters<typeof this.repo.updateHitRule>[1]); }
  deleteHitRule(hId: number) { return this.repo.deleteHitRule(hId); }

  getCriticalRules(id: number) { return this.repo.getCriticalRules(id); }
  createCriticalRule(id: number, data: object) { return this.repo.createCriticalRule({ ...data, combatId: id } as Parameters<typeof this.repo.createCriticalRule>[0]); }
  updateCriticalRule(cId: number, data: object) { return this.repo.updateCriticalRule(cId, data as Parameters<typeof this.repo.updateCriticalRule>[1]); }
  deleteCriticalRule(cId: number) { return this.repo.deleteCriticalRule(cId); }

  getBlockRules(id: number) { return this.repo.getBlockRules(id); }
  createBlockRule(id: number, data: object) { return this.repo.createBlockRule({ ...data, combatId: id } as Parameters<typeof this.repo.createBlockRule>[0]); }
  updateBlockRule(bId: number, data: object) { return this.repo.updateBlockRule(bId, data as Parameters<typeof this.repo.updateBlockRule>[1]); }
  deleteBlockRule(bId: number) { return this.repo.deleteBlockRule(bId); }

  getDodgeRules(id: number) { return this.repo.getDodgeRules(id); }
  createDodgeRule(id: number, data: object) { return this.repo.createDodgeRule({ ...data, combatId: id } as Parameters<typeof this.repo.createDodgeRule>[0]); }
  updateDodgeRule(dId: number, data: object) { return this.repo.updateDodgeRule(dId, data as Parameters<typeof this.repo.updateDodgeRule>[1]); }
  deleteDodgeRule(dId: number) { return this.repo.deleteDodgeRule(dId); }

  getParryRules(id: number) { return this.repo.getParryRules(id); }
  createParryRule(id: number, data: object) { return this.repo.createParryRule({ ...data, combatId: id } as Parameters<typeof this.repo.createParryRule>[0]); }
  updateParryRule(pId: number, data: object) { return this.repo.updateParryRule(pId, data as Parameters<typeof this.repo.updateParryRule>[1]); }
  deleteParryRule(pId: number) { return this.repo.deleteParryRule(pId); }

  getComboRules(id: number) { return this.repo.getComboRules(id); }
  createComboRule(id: number, data: object) { return this.repo.createComboRule({ ...data, combatId: id } as Parameters<typeof this.repo.createComboRule>[0]); }
  updateComboRule(cId: number, data: object) { return this.repo.updateComboRule(cId, data as Parameters<typeof this.repo.updateComboRule>[1]); }
  deleteComboRule(cId: number) { return this.repo.deleteComboRule(cId); }

  getStatusEffects(id: number) { return this.repo.getStatusEffects(id); }
  createStatusEffect(id: number, data: object) { return this.repo.createStatusEffect({ ...data, combatId: id } as Parameters<typeof this.repo.createStatusEffect>[0]); }
  updateStatusEffect(sId: number, data: object) { return this.repo.updateStatusEffect(sId, data as Parameters<typeof this.repo.updateStatusEffect>[1]); }
  deleteStatusEffect(sId: number) { return this.repo.deleteStatusEffect(sId); }

  getStatusStacks(statusEffectId: number) { return this.repo.getStatusStacks(statusEffectId); }
  upsertStatusStack(statusEffectId: number, data: object) { return this.repo.upsertStatusStack({ ...data, statusEffectId } as Parameters<typeof this.repo.upsertStatusStack>[0]); }
  deleteStatusStack(stackId: number) { return this.repo.deleteStatusStack(stackId); }

  getThreatRules(id: number) { return this.repo.getThreatRules(id); }
  createThreatRule(id: number, data: object) { return this.repo.createThreatRule({ ...data, combatId: id } as Parameters<typeof this.repo.createThreatRule>[0]); }
  updateThreatRule(tId: number, data: object) { return this.repo.updateThreatRule(tId, data as Parameters<typeof this.repo.updateThreatRule>[1]); }
  deleteThreatRule(tId: number) { return this.repo.deleteThreatRule(tId); }

  getRespawnRules(id: number) { return this.repo.getRespawnRules(id); }
  createRespawnRule(id: number, data: object) { return this.repo.createRespawnRule({ ...data, combatId: id } as Parameters<typeof this.repo.createRespawnRule>[0]); }
  updateRespawnRule(rId: number, data: object) { return this.repo.updateRespawnRule(rId, data as Parameters<typeof this.repo.updateRespawnRule>[1]); }
  deleteRespawnRule(rId: number) { return this.repo.deleteRespawnRule(rId); }

  getCombatZones(id: number) { return this.repo.getCombatZones(id); }
  createCombatZone(id: number, data: object) { return this.repo.createCombatZone({ ...data, combatId: id } as Parameters<typeof this.repo.createCombatZone>[0]); }
  updateCombatZone(zId: number, data: object) { return this.repo.updateCombatZone(zId, data as Parameters<typeof this.repo.updateCombatZone>[1]); }
  deleteCombatZone(zId: number) { return this.repo.deleteCombatZone(zId); }

  getTargetFilters(id: number) { return this.repo.getTargetFilters(id); }
  createTargetFilter(id: number, data: object) { return this.repo.createTargetFilter({ ...data, combatId: id } as Parameters<typeof this.repo.createTargetFilter>[0]); }
  updateTargetFilter(fId: number, data: object) { return this.repo.updateTargetFilter(fId, data as Parameters<typeof this.repo.updateTargetFilter>[1]); }
  deleteTargetFilter(fId: number) { return this.repo.deleteTargetFilter(fId); }

  getVersions(id: number) { return this.repo.getVersions(id); }
  getHistory(id: number, limit: number, offset: number) { return this.repo.getHistory(id, limit, offset); }
}
