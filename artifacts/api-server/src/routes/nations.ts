import { Router } from "express";
import { nationEditorService } from "../services/nation-editor-service";
import { nationValidator } from "../validators/nation-validator";
import { nationExporter } from "../exporters/nation-exporter";
import { nationImporter } from "../importers/nation-importer";
import { nationRuntimeBridge } from "../runtime/nation-runtime-bridge";

const router = Router();
const ok = (res: any, data: unknown) => res.json({ success: true, data });
const err = (res: any, e: any, status = 500) => res.status(status).json({ success: false, error: e?.message ?? String(e) });

// Nations
router.get("/nations", async (req, res) => { try { const { limit, offset } = req.query; ok(res, await nationEditorService.listNations(Number(limit ?? 50), Number(offset ?? 0))); } catch (e) { err(res, e); } });
router.get("/nations/search", async (req, res) => { try { ok(res, await nationEditorService.searchNations(String(req.query.q ?? ""))); } catch (e) { err(res, e); } });
router.get("/nations/:id", async (req, res) => { try { ok(res, await nationEditorService.getNation(Number(req.params.id))); } catch (e) { err(res, e, 404); } });
router.post("/nations", async (req, res) => { try { ok(res, await nationEditorService.createNation(req.body)); } catch (e) { err(res, e); } });
router.put("/nations/:id", async (req, res) => { try { ok(res, await nationEditorService.updateNation(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.delete("/nations/:id", async (req, res) => { try { ok(res, await nationEditorService.deleteNation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/duplicate", async (req, res) => { try { ok(res, await nationEditorService.duplicateNation(Number(req.params.id), Number(req.body.createdBy ?? 0))); } catch (e) { err(res, e); } });
router.post("/nations/:id/publish", async (req, res) => { try { ok(res, await nationEditorService.publishNation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/archive", async (req, res) => { try { ok(res, await nationEditorService.archiveNation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/restore", async (req, res) => { try { ok(res, await nationEditorService.restoreNation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/version", async (req, res) => { try { ok(res, await nationEditorService.saveVersion(Number(req.params.id), Number(req.body.createdBy ?? 0), req.body.changelog)); } catch (e) { err(res, e); } });
router.get("/nations/:id/stats", async (req, res) => { try { ok(res, await nationEditorService.getStats(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/stats/recalculate", async (req, res) => { try { ok(res, await nationEditorService.recalculateStats(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/nations/:id/history", async (req, res) => { try { const { limit, offset } = req.query; ok(res, await nationEditorService.getHistory(Number(req.params.id), Number(limit ?? 50), Number(offset ?? 0))); } catch (e) { err(res, e); } });
router.post("/nations/:id/validate", async (req, res) => { try { ok(res, await nationValidator.validate(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/export", async (req, res) => { try { const { format } = req.body; ok(res, await nationExporter.exportNation(Number(req.params.id), format ?? "json", Number(req.body.exportedBy ?? 0))); } catch (e) { err(res, e); } });
router.post("/nations/import", async (req, res) => { try { ok(res, await nationImporter.importNation(req.body, Number(req.body.importedBy ?? 0))); } catch (e) { err(res, e); } });

// Governments
router.get("/nations/:id/governments", async (req, res) => { try { ok(res, await nationEditorService.listGovernments(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/governments/:govId", async (req, res) => { try { ok(res, await nationEditorService.getGovernment(Number(req.params.govId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/governments", async (req, res) => { try { ok(res, await nationEditorService.createGovernment(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/governments/:govId", async (req, res) => { try { ok(res, await nationEditorService.updateGovernment(Number(req.params.govId), req.body)); } catch (e) { err(res, e); } });
router.delete("/governments/:govId", async (req, res) => { try { ok(res, await nationEditorService.deleteGovernment(Number(req.params.govId))); } catch (e) { err(res, e); } });

// Ministries
router.get("/nations/:id/ministries", async (req, res) => { try { ok(res, await nationEditorService.listMinistries(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/ministries/:minId", async (req, res) => { try { ok(res, await nationEditorService.getMinistry(Number(req.params.minId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/ministries", async (req, res) => { try { ok(res, await nationEditorService.createMinistry(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/ministries/:minId", async (req, res) => { try { ok(res, await nationEditorService.updateMinistry(Number(req.params.minId), req.body)); } catch (e) { err(res, e); } });
router.delete("/ministries/:minId", async (req, res) => { try { ok(res, await nationEditorService.deleteMinistry(Number(req.params.minId))); } catch (e) { err(res, e); } });

// Laws
router.get("/nations/:id/laws", async (req, res) => { try { ok(res, await nationEditorService.listLaws(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/laws/:lawId", async (req, res) => { try { ok(res, await nationEditorService.getLaw(Number(req.params.lawId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/laws", async (req, res) => { try { ok(res, await nationEditorService.createLaw(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/laws/:lawId", async (req, res) => { try { ok(res, await nationEditorService.updateLaw(Number(req.params.lawId), req.body)); } catch (e) { err(res, e); } });
router.delete("/laws/:lawId", async (req, res) => { try { ok(res, await nationEditorService.deleteLaw(Number(req.params.lawId))); } catch (e) { err(res, e); } });

// Tax Rules
router.get("/nations/:id/tax-rules", async (req, res) => { try { ok(res, await nationEditorService.listTaxRules(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/tax-rules/:taxId", async (req, res) => { try { ok(res, await nationEditorService.getTaxRule(Number(req.params.taxId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/tax-rules", async (req, res) => { try { ok(res, await nationEditorService.createTaxRule(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/tax-rules/:taxId", async (req, res) => { try { ok(res, await nationEditorService.updateTaxRule(Number(req.params.taxId), req.body)); } catch (e) { err(res, e); } });
router.delete("/tax-rules/:taxId", async (req, res) => { try { ok(res, await nationEditorService.deleteTaxRule(Number(req.params.taxId))); } catch (e) { err(res, e); } });

// Elections
router.get("/nations/:id/elections", async (req, res) => { try { ok(res, await nationEditorService.listElections(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/elections/:elecId", async (req, res) => { try { ok(res, await nationEditorService.getElection(Number(req.params.elecId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/elections", async (req, res) => { try { ok(res, await nationEditorService.createElection(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/elections/:elecId", async (req, res) => { try { ok(res, await nationEditorService.updateElection(Number(req.params.elecId), req.body)); } catch (e) { err(res, e); } });
router.delete("/elections/:elecId", async (req, res) => { try { ok(res, await nationEditorService.deleteElection(Number(req.params.elecId))); } catch (e) { err(res, e); } });

// Political Parties
router.get("/nations/:id/parties", async (req, res) => { try { ok(res, await nationEditorService.listPoliticalParties(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/parties/:partyId", async (req, res) => { try { ok(res, await nationEditorService.getPoliticalParty(Number(req.params.partyId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/parties", async (req, res) => { try { ok(res, await nationEditorService.createPoliticalParty(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/parties/:partyId", async (req, res) => { try { ok(res, await nationEditorService.updatePoliticalParty(Number(req.params.partyId), req.body)); } catch (e) { err(res, e); } });
router.delete("/parties/:partyId", async (req, res) => { try { ok(res, await nationEditorService.deletePoliticalParty(Number(req.params.partyId))); } catch (e) { err(res, e); } });

// Citizenships
router.get("/nations/:id/citizenships", async (req, res) => { try { ok(res, await nationEditorService.listCitizenships(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/citizenships/:citId", async (req, res) => { try { ok(res, await nationEditorService.getCitizenship(Number(req.params.citId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/citizenships", async (req, res) => { try { ok(res, await nationEditorService.createCitizenship(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/citizenships/:citId", async (req, res) => { try { ok(res, await nationEditorService.updateCitizenship(Number(req.params.citId), req.body)); } catch (e) { err(res, e); } });
router.delete("/citizenships/:citId", async (req, res) => { try { ok(res, await nationEditorService.deleteCitizenship(Number(req.params.citId))); } catch (e) { err(res, e); } });

// Passports
router.get("/nations/:id/passports", async (req, res) => { try { ok(res, await nationEditorService.listPassports(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/passports/:passId", async (req, res) => { try { ok(res, await nationEditorService.getPassport(Number(req.params.passId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/passports", async (req, res) => { try { ok(res, await nationEditorService.createPassport(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/passports/:passId", async (req, res) => { try { ok(res, await nationEditorService.updatePassport(Number(req.params.passId), req.body)); } catch (e) { err(res, e); } });
router.delete("/passports/:passId", async (req, res) => { try { ok(res, await nationEditorService.deletePassport(Number(req.params.passId))); } catch (e) { err(res, e); } });

// Visas
router.get("/nations/:id/visas", async (req, res) => { try { ok(res, await nationEditorService.listVisas(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/visas/:visaId", async (req, res) => { try { ok(res, await nationEditorService.getVisa(Number(req.params.visaId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/visas", async (req, res) => { try { ok(res, await nationEditorService.createVisa(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/visas/:visaId", async (req, res) => { try { ok(res, await nationEditorService.updateVisa(Number(req.params.visaId), req.body)); } catch (e) { err(res, e); } });
router.delete("/visas/:visaId", async (req, res) => { try { ok(res, await nationEditorService.deleteVisa(Number(req.params.visaId))); } catch (e) { err(res, e); } });

// Borders
router.get("/nations/:id/borders", async (req, res) => { try { ok(res, await nationEditorService.listBorders(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/borders/:borderId", async (req, res) => { try { ok(res, await nationEditorService.getBorder(Number(req.params.borderId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/borders", async (req, res) => { try { ok(res, await nationEditorService.createBorder(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/borders/:borderId", async (req, res) => { try { ok(res, await nationEditorService.updateBorder(Number(req.params.borderId), req.body)); } catch (e) { err(res, e); } });
router.delete("/borders/:borderId", async (req, res) => { try { ok(res, await nationEditorService.deleteBorder(Number(req.params.borderId))); } catch (e) { err(res, e); } });

// Border Checkpoints
router.get("/nations/:id/checkpoints", async (req, res) => { try { ok(res, await nationEditorService.listBorderCheckpoints(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/checkpoints/:checkId", async (req, res) => { try { ok(res, await nationEditorService.getBorderCheckpoint(Number(req.params.checkId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/checkpoints", async (req, res) => { try { ok(res, await nationEditorService.createBorderCheckpoint(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/checkpoints/:checkId", async (req, res) => { try { ok(res, await nationEditorService.updateBorderCheckpoint(Number(req.params.checkId), req.body)); } catch (e) { err(res, e); } });
router.delete("/checkpoints/:checkId", async (req, res) => { try { ok(res, await nationEditorService.deleteBorderCheckpoint(Number(req.params.checkId))); } catch (e) { err(res, e); } });

// Diplomatic Relations
router.get("/nations/:id/diplomacy", async (req, res) => { try { ok(res, await nationEditorService.listDiplomaticRelations(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/diplomacy/:dipId", async (req, res) => { try { ok(res, await nationEditorService.getDiplomaticRelation(Number(req.params.dipId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/:id/diplomacy", async (req, res) => { try { ok(res, await nationEditorService.createDiplomaticRelation(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.put("/diplomacy/:dipId", async (req, res) => { try { ok(res, await nationEditorService.updateDiplomaticRelation(Number(req.params.dipId), req.body)); } catch (e) { err(res, e); } });
router.delete("/diplomacy/:dipId", async (req, res) => { try { ok(res, await nationEditorService.deleteDiplomaticRelation(Number(req.params.dipId))); } catch (e) { err(res, e); } });

// Treaties
router.get("/treaties", async (req, res) => { try { const { limit, offset } = req.query; ok(res, await nationEditorService.listTreaties(Number(limit ?? 50), Number(offset ?? 0))); } catch (e) { err(res, e); } });
router.get("/treaties/:treatyId", async (req, res) => { try { ok(res, await nationEditorService.getTreaty(Number(req.params.treatyId))); } catch (e) { err(res, e, 404); } });
router.post("/treaties", async (req, res) => { try { ok(res, await nationEditorService.createTreaty(req.body)); } catch (e) { err(res, e); } });
router.put("/treaties/:treatyId", async (req, res) => { try { ok(res, await nationEditorService.updateTreaty(Number(req.params.treatyId), req.body)); } catch (e) { err(res, e); } });
router.delete("/treaties/:treatyId", async (req, res) => { try { ok(res, await nationEditorService.deleteTreaty(Number(req.params.treatyId))); } catch (e) { err(res, e); } });

// Templates
router.get("/nations/templates", async (req, res) => { try { const { limit, offset } = req.query; ok(res, await nationEditorService.listTemplates(Number(limit ?? 50), Number(offset ?? 0))); } catch (e) { err(res, e); } });
router.get("/nations/templates/:templateId", async (req, res) => { try { ok(res, await nationEditorService.getTemplate(Number(req.params.templateId))); } catch (e) { err(res, e, 404); } });
router.post("/nations/templates", async (req, res) => { try { ok(res, await nationEditorService.createTemplate(req.body)); } catch (e) { err(res, e); } });
router.put("/nations/templates/:templateId", async (req, res) => { try { ok(res, await nationEditorService.updateTemplate(Number(req.params.templateId), req.body)); } catch (e) { err(res, e); } });
router.delete("/nations/templates/:templateId", async (req, res) => { try { ok(res, await nationEditorService.deleteTemplate(Number(req.params.templateId))); } catch (e) { err(res, e); } });

// Runtime
router.get("/nations/:id/runtime", async (req, res) => { try { ok(res, await nationEditorService.getRuntime(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/nations/:id/runtime/state", async (req, res) => { try { ok(res, await nationRuntimeBridge.getNationState(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/start", async (req, res) => { try { ok(res, await nationRuntimeBridge.startSimulation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/stop", async (req, res) => { try { ok(res, await nationRuntimeBridge.stopSimulation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/tick", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulationTick(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/government", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateGovernment(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/election", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateElection(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/tax", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateTaxCollection(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/citizenship", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateCitizenship(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/passport", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulatePassport(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/visa", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateVisa(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/border", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateBorder(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/diplomacy", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateDiplomacy(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/treaty", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateTreaty(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/economy", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateEconomy(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/nations/:id/runtime/migration", async (req, res) => { try { ok(res, await nationRuntimeBridge.simulateMigration(Number(req.params.id))); } catch (e) { err(res, e); } });

export default router;
