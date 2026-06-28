import { Router } from "express";
import { transportationEditorService } from "../services/transportation-editor-service";
import { transportationValidator } from "../validators/transportation-validator";
import { transportationExporter } from "../exporters/transportation-exporter";
import { transportationImporter } from "../importers/transportation-importer";
import { transportationRuntimeBridge } from "../runtime/transportation-runtime-bridge";

const router = Router();
const ok = (res: any, data: unknown) => res.json({ success: true, data });
const err = (res: any, e: any, status = 500) => res.status(status).json({ success: false, error: e?.message ?? String(e) });

// Networks
router.get("/transportation", async (req, res) => { try { const { limit, offset } = req.query; ok(res, await transportationEditorService.listNetworks(Number(limit ?? 50), Number(offset ?? 0))); } catch (e) { err(res, e); } });
router.get("/transportation/search", async (req, res) => { try { ok(res, await transportationEditorService.searchNetworks(String(req.query.q ?? ""))); } catch (e) { err(res, e); } });
router.get("/transportation/:id", async (req, res) => { try { ok(res, await transportationEditorService.getNetwork(Number(req.params.id))); } catch (e) { err(res, e, 404); } });
router.post("/transportation", async (req, res) => { try { ok(res, await transportationEditorService.createNetwork(req.body)); } catch (e) { err(res, e); } });
router.put("/transportation/:id", async (req, res) => { try { ok(res, await transportationEditorService.updateNetwork(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/:id", async (req, res) => { try { ok(res, await transportationEditorService.deleteNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/duplicate", async (req, res) => { try { ok(res, await transportationEditorService.duplicateNetwork(Number(req.params.id), Number(req.body.createdBy ?? 0))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/fork", async (req, res) => { try { ok(res, await transportationEditorService.forkNetwork(Number(req.params.id), Number(req.body.createdBy ?? 0))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/publish", async (req, res) => { try { ok(res, await transportationEditorService.publishNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/archive", async (req, res) => { try { ok(res, await transportationEditorService.archiveNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/restore", async (req, res) => { try { ok(res, await transportationEditorService.restoreNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });

// Roads
router.get("/transportation/:id/roads", async (req, res) => { try { ok(res, await transportationEditorService.listRoads(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/roads", async (req, res) => { try { ok(res, await transportationEditorService.createRoad({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/roads/:roadId", async (req, res) => { try { ok(res, await transportationEditorService.updateRoad(Number(req.params.roadId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/roads/:roadId", async (req, res) => { try { ok(res, await transportationEditorService.deleteRoad(Number(req.params.roadId))); } catch (e) { err(res, e); } });

// Intersections
router.get("/transportation/:id/intersections", async (req, res) => { try { ok(res, await transportationEditorService.listIntersections(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/intersections", async (req, res) => { try { ok(res, await transportationEditorService.createIntersection({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/intersections/:iId", async (req, res) => { try { ok(res, await transportationEditorService.updateIntersection(Number(req.params.iId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/intersections/:iId", async (req, res) => { try { ok(res, await transportationEditorService.deleteIntersection(Number(req.params.iId))); } catch (e) { err(res, e); } });

// Routes
router.get("/transportation/:id/routes", async (req, res) => { try { ok(res, await transportationEditorService.listRoutes(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/routes/:routeId", async (req, res) => { try { ok(res, await transportationEditorService.getRoute(Number(req.params.routeId))); } catch (e) { err(res, e, 404); } });
router.post("/transportation/:id/routes", async (req, res) => { try { ok(res, await transportationEditorService.createRoute({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/routes/:routeId", async (req, res) => { try { ok(res, await transportationEditorService.updateRoute(Number(req.params.routeId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/routes/:routeId", async (req, res) => { try { ok(res, await transportationEditorService.deleteRoute(Number(req.params.routeId))); } catch (e) { err(res, e); } });

// Stations
router.get("/transportation/:id/stations", async (req, res) => { try { ok(res, await transportationEditorService.listStations(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/stations/:stationId", async (req, res) => { try { ok(res, await transportationEditorService.getStation(Number(req.params.stationId))); } catch (e) { err(res, e, 404); } });
router.post("/transportation/:id/stations", async (req, res) => { try { ok(res, await transportationEditorService.createStation({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/stations/:stationId", async (req, res) => { try { ok(res, await transportationEditorService.updateStation(Number(req.params.stationId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/stations/:stationId", async (req, res) => { try { ok(res, await transportationEditorService.deleteStation(Number(req.params.stationId))); } catch (e) { err(res, e); } });

// Vehicles
router.get("/transportation/:id/vehicles", async (req, res) => { try { ok(res, await transportationEditorService.listVehicles(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/vehicles/:vehicleId", async (req, res) => { try { ok(res, await transportationEditorService.getVehicle(Number(req.params.vehicleId))); } catch (e) { err(res, e, 404); } });
router.post("/transportation/:id/vehicles", async (req, res) => { try { ok(res, await transportationEditorService.createVehicle({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/vehicles/:vehicleId", async (req, res) => { try { ok(res, await transportationEditorService.updateVehicle(Number(req.params.vehicleId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/vehicles/:vehicleId", async (req, res) => { try { ok(res, await transportationEditorService.deleteVehicle(Number(req.params.vehicleId))); } catch (e) { err(res, e); } });

// Parking
router.get("/transportation/:id/parking", async (req, res) => { try { ok(res, await transportationEditorService.listParking(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/parking", async (req, res) => { try { ok(res, await transportationEditorService.createParking({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/parking/:pId", async (req, res) => { try { ok(res, await transportationEditorService.updateParking(Number(req.params.pId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/parking/:pId", async (req, res) => { try { ok(res, await transportationEditorService.deleteParking(Number(req.params.pId))); } catch (e) { err(res, e); } });

// Signals
router.get("/transportation/:id/signals", async (req, res) => { try { ok(res, await transportationEditorService.listSignals(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/signals", async (req, res) => { try { ok(res, await transportationEditorService.createSignal({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/signals/:sId", async (req, res) => { try { ok(res, await transportationEditorService.updateSignal(Number(req.params.sId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/signals/:sId", async (req, res) => { try { ok(res, await transportationEditorService.deleteSignal(Number(req.params.sId))); } catch (e) { err(res, e); } });

// Bridges
router.get("/transportation/:id/bridges", async (req, res) => { try { ok(res, await transportationEditorService.listBridges(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/bridges", async (req, res) => { try { ok(res, await transportationEditorService.createBridge({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/bridges/:bId", async (req, res) => { try { ok(res, await transportationEditorService.updateBridge(Number(req.params.bId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/bridges/:bId", async (req, res) => { try { ok(res, await transportationEditorService.deleteBridge(Number(req.params.bId))); } catch (e) { err(res, e); } });

// Tunnels
router.get("/transportation/:id/tunnels", async (req, res) => { try { ok(res, await transportationEditorService.listTunnels(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/tunnels", async (req, res) => { try { ok(res, await transportationEditorService.createTunnel({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/tunnels/:tId", async (req, res) => { try { ok(res, await transportationEditorService.updateTunnel(Number(req.params.tId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/tunnels/:tId", async (req, res) => { try { ok(res, await transportationEditorService.deleteTunnel(Number(req.params.tId))); } catch (e) { err(res, e); } });

// Ports
router.get("/transportation/:id/ports", async (req, res) => { try { ok(res, await transportationEditorService.listPorts(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/ports", async (req, res) => { try { ok(res, await transportationEditorService.createPort({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/ports/:pId", async (req, res) => { try { ok(res, await transportationEditorService.updatePort(Number(req.params.pId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/ports/:pId", async (req, res) => { try { ok(res, await transportationEditorService.deletePort(Number(req.params.pId))); } catch (e) { err(res, e); } });

// Airports
router.get("/transportation/:id/airports", async (req, res) => { try { ok(res, await transportationEditorService.listAirports(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/airports", async (req, res) => { try { ok(res, await transportationEditorService.createAirport({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/airports/:aId", async (req, res) => { try { ok(res, await transportationEditorService.updateAirport(Number(req.params.aId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/airports/:aId", async (req, res) => { try { ok(res, await transportationEditorService.deleteAirport(Number(req.params.aId))); } catch (e) { err(res, e); } });

// Railways
router.get("/transportation/:id/railways", async (req, res) => { try { ok(res, await transportationEditorService.listRailways(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/railways", async (req, res) => { try { ok(res, await transportationEditorService.createRailway({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/railways/:rId", async (req, res) => { try { ok(res, await transportationEditorService.updateRailway(Number(req.params.rId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/railways/:rId", async (req, res) => { try { ok(res, await transportationEditorService.deleteRailway(Number(req.params.rId))); } catch (e) { err(res, e); } });

// Checkpoints
router.get("/transportation/:id/checkpoints", async (req, res) => { try { ok(res, await transportationEditorService.listCheckpoints(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/checkpoints", async (req, res) => { try { ok(res, await transportationEditorService.createCheckpoint({ ...req.body, networkId: Number(req.params.id) })); } catch (e) { err(res, e); } });
router.put("/transportation/checkpoints/:cId", async (req, res) => { try { ok(res, await transportationEditorService.updateCheckpoint(Number(req.params.cId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/checkpoints/:cId", async (req, res) => { try { ok(res, await transportationEditorService.deleteCheckpoint(Number(req.params.cId))); } catch (e) { err(res, e); } });

// Templates
router.get("/transportation/templates/all", async (req, res) => { try { ok(res, await transportationEditorService.listTemplates()); } catch (e) { err(res, e); } });
router.post("/transportation/templates", async (req, res) => { try { ok(res, await transportationEditorService.createTemplate(req.body)); } catch (e) { err(res, e); } });
router.put("/transportation/templates/:tId", async (req, res) => { try { ok(res, await transportationEditorService.updateTemplate(Number(req.params.tId), req.body)); } catch (e) { err(res, e); } });
router.delete("/transportation/templates/:tId", async (req, res) => { try { ok(res, await transportationEditorService.deleteTemplate(Number(req.params.tId))); } catch (e) { err(res, e); } });

// History & Stats
router.get("/transportation/:id/history", async (req, res) => { try { ok(res, await transportationEditorService.getHistory(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/:id/statistics", async (req, res) => { try { ok(res, await transportationEditorService.getStats(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/statistics/recalculate", async (req, res) => { try { ok(res, await transportationEditorService.recalculateStats(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/version", async (req, res) => { try { ok(res, await transportationEditorService.saveVersion(Number(req.params.id), Number(req.body.createdBy ?? 0), req.body.changelog)); } catch (e) { err(res, e); } });

// Validate
router.post("/transportation/:id/validate", async (req, res) => { try { ok(res, await transportationValidator.validate(Number(req.params.id))); } catch (e) { err(res, e); } });

// Export / Import
router.post("/transportation/:id/export", async (req, res) => { try { ok(res, await transportationExporter.exportNetwork(Number(req.params.id), req.body.format ?? "json", Number(req.body.exportedBy ?? 0))); } catch (e) { err(res, e); } });
router.post("/transportation/import", async (req, res) => { try { ok(res, await transportationImporter.importNetwork(req.body.payload, Number(req.body.importedBy ?? 0))); } catch (e) { err(res, e); } });

// Runtime & Simulation
router.get("/transportation/:id/runtime", async (req, res) => { try { ok(res, await transportationEditorService.getRuntime(Number(req.params.id))); } catch (e) { err(res, e); } });
router.put("/transportation/:id/runtime", async (req, res) => { try { ok(res, await transportationEditorService.updateRuntime(Number(req.params.id), req.body)); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/start", async (req, res) => { try { ok(res, await transportationRuntimeBridge.startSimulation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/stop", async (req, res) => { try { ok(res, await transportationRuntimeBridge.stopSimulation(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/tick", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateTrafficTick(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/vehicles", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateVehicleMovement(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/rail", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateRailNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/air", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateAirNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/sea", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateSeaNetwork(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/signals", async (req, res) => { try { ok(res, await transportationRuntimeBridge.simulateSignalCycle(Number(req.params.id))); } catch (e) { err(res, e); } });
router.post("/transportation/:id/runtime/route-plan", async (req, res) => { try { ok(res, await transportationRuntimeBridge.planRoute(Number(req.params.id), Number(req.body.from), Number(req.body.to))); } catch (e) { err(res, e); } });
router.get("/transportation/:id/runtime/congestion", async (req, res) => { try { ok(res, await transportationRuntimeBridge.calculateCongestion(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/:id/runtime/preview", async (req, res) => { try { ok(res, await transportationRuntimeBridge.streamingPreview(Number(req.params.id))); } catch (e) { err(res, e); } });
router.get("/transportation/:id/state", async (req, res) => { try { ok(res, await transportationRuntimeBridge.getNetworkState(Number(req.params.id))); } catch (e) { err(res, e); } });

export default router;
