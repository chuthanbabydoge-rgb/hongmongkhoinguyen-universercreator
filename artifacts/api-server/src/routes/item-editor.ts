import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { ItemEditorService } from "../services/item-editor-service";

const router = Router();
const service = new ItemEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get("/api/item-editor/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDashboard(req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Templates ────────────────────────────────────────────────────────────────

router.get("/api/item-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listTemplates(limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { itemId, name } = req.body as { itemId: number; name: string };
    if (!itemId || !name) { res.status(400).json({ error: "ValidationError", message: "itemId and name are required" }); return; }
    res.status(201).json(await service.createTemplate(itemId, req.auth!.userId, name));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Loot Tables ──────────────────────────────────────────────────────────────

router.get("/api/item-editor/loot-tables", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.getLootTables(req.auth!.userId, limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/loot-tables", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tableName } = req.body as { tableName: string };
    if (!tableName) { res.status(400).json({ error: "ValidationError", message: "tableName is required" }); return; }
    res.status(201).json(await service.createLootTable({ ...req.body as any, createdBy: req.auth!.userId }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/loot-tables/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const tbl = await service.getLootTable(Number(req.params["id"]));
    if (!tbl) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(tbl);
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/loot-tables/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await service.updateLootTable(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/loot-tables/:id", requireAuth, async (_req: AuthRequest, res) => {
  try { await service.deleteLootTable(Number(_req.params["id"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/loot-tables/:id/drops", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDrops(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/loot-tables/:id/drops", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createDrop({ ...req.body as any, lootTableId: Number(req.params["id"]) }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/drops/:dropId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDrop(Number(req.params["dropId"]), req.body as any)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/drops/:dropId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDrop(Number(req.params["dropId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Inventories ──────────────────────────────────────────────────────────────

router.get("/api/item-editor/inventories", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getInventories(req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/inventories", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createInventory({ ...req.body as any, createdBy: req.auth!.userId }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/inventories/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateInventory(Number(req.params["id"]), req.body as any)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Import ───────────────────────────────────────────────────────────────────

router.post("/api/item-editor/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { templateId, name, projectId } = req.body as { templateId: number; name: string; projectId?: number };
    if (!templateId || !name) { res.status(400).json({ error: "ValidationError", message: "templateId and name are required" }); return; }
    res.status(201).json(await service.importer.importFromTemplate(req.auth!.userId, templateId, { name, projectId }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Item CRUD ────────────────────────────────────────────────────────────────

router.get("/api/item-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const search = req.query["search"] as string | undefined;
    res.json(await service.listItems(req.auth!.userId, limit, offset, search));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createItem(req.auth!.userId, req.body as object));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getItem(Number(req.params["id"]))); }
  catch (err) { res.status(404).json({ error: "NotFound", message: String(err) }); }
});

router.patch("/api/item-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await service.updateItem(Number(req.params["id"]), req.auth!.userId, req.body as object));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteItem(Number(req.params["id"]), req.auth!.userId); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.duplicateItem(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.publishItem(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.archiveItem(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.restoreItem(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/stats", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getStats(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.upsertStat(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/stats/:statId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteStat(Number(req.params["statId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Attributes ───────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/attributes", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getAttributes(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/attributes", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.upsertAttribute(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/attributes/:attrId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteAttribute(Number(req.params["attrId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Effects ──────────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/effects", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getEffects(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/effects", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createEffect(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/effects/:effectId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateEffect(Number(req.params["effectId"]), req.body as any)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/effects/:effectId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteEffect(Number(req.params["effectId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Equipment Slots ──────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/equipment-slots", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getEquipmentSlots(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/equipment-slots", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createEquipmentSlot(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/equipment-slots/:slotId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteEquipmentSlot(Number(req.params["slotId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Crafting Recipes ─────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/recipes", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getRecipes(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/recipes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { recipeName } = req.body as { recipeName: string };
    if (!recipeName) { res.status(400).json({ error: "ValidationError", message: "recipeName is required" }); return; }
    res.status(201).json(await service.createRecipe({
      ...req.body as any, outputItemId: Number(req.params["id"]), createdBy: req.auth!.userId,
    }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/recipes/:recipeId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateRecipe(Number(req.params["recipeId"]), req.body as any)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/recipes/:recipeId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteRecipe(Number(req.params["recipeId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/recipes/:recipeId/components", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getComponents(Number(req.params["recipeId"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/recipes/:recipeId/components", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createComponent({ ...req.body as any, recipeId: Number(req.params["recipeId"]) }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/components/:componentId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteComponent(Number(req.params["componentId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Pricing ──────────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/pricing", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getPricing(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/pricing", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.upsertPricing(Number(req.params["id"]), req.body as any));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/pricing/:pricingId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deletePricing(Number(req.params["pricingId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Restrictions ─────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/restrictions", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getRestrictions(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/restrictions", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createRestriction({ ...req.body as any, itemId: Number(req.params["id"]) }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/restrictions/:restrictionId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteRestriction(Number(req.params["restrictionId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Visuals ──────────────────────────────────────────────────────────────────

router.get("/api/item-editor/:id/visuals", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getVisuals(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/visuals", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.status(201).json(await service.createVisual({ ...req.body as object, itemId: Number(req.params["id"]) }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/item-editor/visuals/:visualId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateVisual(Number(req.params["visualId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/item-editor/visuals/:visualId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteVisual(Number(req.params["visualId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Versions & History ───────────────────────────────────────────────────────

router.get("/api/item-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getVersions(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.getHistory(Number(req.params["id"]), limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Validation ───────────────────────────────────────────────────────────────

router.post("/api/item-editor/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.validator.validate(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Export ───────────────────────────────────────────────────────────────────

router.post("/api/item-editor/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try { res.json({ payload: await service.exporter.exportToJson(Number(req.params["id"]), req.auth!.userId) }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/item-editor/:id/exports", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getExports(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Runtime / Simulation ─────────────────────────────────────────────────────

router.post("/api/item-editor/:id/simulate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const ctx = req.body as Parameters<typeof service.runtime.simulateItemUsage>[1];
    res.json(await service.runtime.simulateItemUsage(Number(req.params["id"]), ctx));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/preview-combat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const ctx = req.body as Parameters<typeof service.runtime.previewCombatEffect>[1];
    res.json(await service.runtime.previewCombatEffect(Number(req.params["id"]), ctx));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/:id/test-crafting", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { playerLevel } = req.body as { playerLevel?: number };
    res.json(await service.runtime.testCraftingResult(Number(req.params["id"]), playerLevel));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/item-editor/inventories/:inventoryId/simulate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body as { items: Array<{ itemId: number; quantity: number }> };
    res.json(await service.runtime.simulateInventory(Number(req.params["inventoryId"]), items ?? []));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

export default router;
