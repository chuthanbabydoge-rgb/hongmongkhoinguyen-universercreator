import { transportationRepository } from "../repositories/transportation-repository";
import crypto from "crypto";

export class TransportationEditorService {
  async listNetworks(limit = 50, offset = 0) {
    return transportationRepository.findAllNetworks(limit, offset);
  }

  async getNetwork(id: number) {
    const network = await transportationRepository.findNetworkById(id);
    if (!network) throw new Error(`Transport network ${id} not found`);
    return network;
  }

  async searchNetworks(q: string) {
    return transportationRepository.searchNetworks(q);
  }

  async createNetwork(data: Record<string, unknown>) {
    const network = await transportationRepository.createNetwork(data as any);
    await transportationRepository.addHistory({ networkId: network.id, action: "create", entityType: "network", entityId: network.id, performedBy: (data.createdBy as number) ?? 0 });
    return network;
  }

  async updateNetwork(id: number, data: Record<string, unknown>) {
    const network = await transportationRepository.updateNetwork(id, data as any);
    if (!network) throw new Error(`Transport network ${id} not found`);
    await transportationRepository.addHistory({ networkId: id, action: "update", entityType: "network", entityId: id, performedBy: 0 });
    return network;
  }

  async deleteNetwork(id: number) {
    await this.getNetwork(id);
    await transportationRepository.deleteNetwork(id);
    return { deleted: true };
  }

  async duplicateNetwork(id: number, createdBy: number) {
    const original = await this.getNetwork(id);
    const { id: _id, createdAt, updatedAt, ...rest } = original;
    const copy = await transportationRepository.createNetwork({ ...rest, name: `${original.name} (Copy)`, isPublished: false, version: 1, createdBy });
    await transportationRepository.addHistory({ networkId: copy.id, action: "duplicate", entityType: "network", entityId: copy.id, performedBy: createdBy });
    return copy;
  }

  async forkNetwork(id: number, createdBy: number) {
    const original = await this.getNetwork(id);
    const { id: _id, createdAt, updatedAt, ...rest } = original;
    const fork = await transportationRepository.createNetwork({ ...rest, name: `${original.name} (Fork)`, isPublished: false, version: 1, createdBy });
    await transportationRepository.addHistory({ networkId: fork.id, action: "fork", entityType: "network", entityId: fork.id, performedBy: createdBy });
    return fork;
  }

  async publishNetwork(id: number) {
    const network = await transportationRepository.publishNetwork(id);
    await transportationRepository.addHistory({ networkId: id, action: "publish", entityType: "network", entityId: id, performedBy: 0 });
    return network;
  }

  async archiveNetwork(id: number) {
    const network = await transportationRepository.archiveNetwork(id);
    await transportationRepository.addHistory({ networkId: id, action: "archive", entityType: "network", entityId: id, performedBy: 0 });
    return network;
  }

  async restoreNetwork(id: number) {
    const network = await transportationRepository.updateNetwork(id, { transportStatus: "draft" });
    await transportationRepository.addHistory({ networkId: id, action: "restore", entityType: "network", entityId: id, performedBy: 0 });
    return network;
  }

  async saveVersion(networkId: number, createdBy: number, changelog?: string) {
    const network = await this.getNetwork(networkId);
    const versions = await transportationRepository.findVersionsByNetwork(networkId);
    const version = (versions[0]?.version ?? 0) + 1;
    return transportationRepository.createVersion({ networkId, version, snapshot: network as any, changelog: changelog ?? null, createdBy });
  }

  async getStats(networkId: number) {
    return transportationRepository.findStatsByNetwork(networkId);
  }

  async recalculateStats(networkId: number) {
    const [roads, routes, stations, vehicles, parking, signals] = await Promise.all([
      transportationRepository.findRoadsByNetwork(networkId),
      transportationRepository.findRoutesByNetwork(networkId),
      transportationRepository.findStationsByNetwork(networkId),
      transportationRepository.findVehiclesByNetwork(networkId),
      transportationRepository.findParkingByNetwork(networkId),
      transportationRepository.findSignalsByNetwork(networkId),
    ]);
    const totalLength = roads.reduce((s, r) => s + (r.length ?? 0), 0);
    const totalParking = parking.reduce((s, p) => s + (p.totalSpots ?? 0), 0);
    return transportationRepository.upsertStats(networkId, {
      totalRoads: roads.length,
      totalRoutes: routes.length,
      totalStations: stations.length,
      totalVehicles: vehicles.length,
      totalParkingSpots: totalParking,
      totalSignals: signals.length,
      totalLength,
    });
  }

  // Roads
  async listRoads(networkId: number) { return transportationRepository.findRoadsByNetwork(networkId); }
  async getRoad(id: number) {
    const r = await transportationRepository.findRoadById(id);
    if (!r) throw new Error(`Road ${id} not found`);
    return r;
  }
  async createRoad(data: Record<string, unknown>) { return transportationRepository.createRoad(data as any); }
  async updateRoad(id: number, data: Record<string, unknown>) { return transportationRepository.updateRoad(id, data as any); }
  async deleteRoad(id: number) { return transportationRepository.deleteRoad(id); }

  // Intersections
  async listIntersections(networkId: number) { return transportationRepository.findIntersectionsByNetwork(networkId); }
  async createIntersection(data: Record<string, unknown>) { return transportationRepository.createIntersection(data as any); }
  async updateIntersection(id: number, data: Record<string, unknown>) { return transportationRepository.updateIntersection(id, data as any); }
  async deleteIntersection(id: number) { return transportationRepository.deleteIntersection(id); }

  // Routes
  async listRoutes(networkId: number) { return transportationRepository.findRoutesByNetwork(networkId); }
  async getRoute(id: number) {
    const r = await transportationRepository.findRouteById(id);
    if (!r) throw new Error(`Route ${id} not found`);
    return r;
  }
  async createRoute(data: Record<string, unknown>) { return transportationRepository.createRoute(data as any); }
  async updateRoute(id: number, data: Record<string, unknown>) { return transportationRepository.updateRoute(id, data as any); }
  async deleteRoute(id: number) { return transportationRepository.deleteRoute(id); }

  // Stations
  async listStations(networkId: number) { return transportationRepository.findStationsByNetwork(networkId); }
  async getStation(id: number) {
    const s = await transportationRepository.findStationById(id);
    if (!s) throw new Error(`Station ${id} not found`);
    return s;
  }
  async createStation(data: Record<string, unknown>) { return transportationRepository.createStation(data as any); }
  async updateStation(id: number, data: Record<string, unknown>) { return transportationRepository.updateStation(id, data as any); }
  async deleteStation(id: number) { return transportationRepository.deleteStation(id); }

  // Vehicles
  async listVehicles(networkId: number) { return transportationRepository.findVehiclesByNetwork(networkId); }
  async getVehicle(id: number) {
    const v = await transportationRepository.findVehicleById(id);
    if (!v) throw new Error(`Vehicle ${id} not found`);
    return v;
  }
  async createVehicle(data: Record<string, unknown>) { return transportationRepository.createVehicle(data as any); }
  async updateVehicle(id: number, data: Record<string, unknown>) { return transportationRepository.updateVehicle(id, data as any); }
  async deleteVehicle(id: number) { return transportationRepository.deleteVehicle(id); }

  // Parking
  async listParking(networkId: number) { return transportationRepository.findParkingByNetwork(networkId); }
  async createParking(data: Record<string, unknown>) { return transportationRepository.createParking(data as any); }
  async updateParking(id: number, data: Record<string, unknown>) { return transportationRepository.updateParking(id, data as any); }
  async deleteParking(id: number) { return transportationRepository.deleteParking(id); }

  // Signals
  async listSignals(networkId: number) { return transportationRepository.findSignalsByNetwork(networkId); }
  async createSignal(data: Record<string, unknown>) { return transportationRepository.createSignal(data as any); }
  async updateSignal(id: number, data: Record<string, unknown>) { return transportationRepository.updateSignal(id, data as any); }
  async deleteSignal(id: number) { return transportationRepository.deleteSignal(id); }

  // Bridges
  async listBridges(networkId: number) { return transportationRepository.findBridgesByNetwork(networkId); }
  async createBridge(data: Record<string, unknown>) { return transportationRepository.createBridge(data as any); }
  async updateBridge(id: number, data: Record<string, unknown>) { return transportationRepository.updateBridge(id, data as any); }
  async deleteBridge(id: number) { return transportationRepository.deleteBridge(id); }

  // Tunnels
  async listTunnels(networkId: number) { return transportationRepository.findTunnelsByNetwork(networkId); }
  async createTunnel(data: Record<string, unknown>) { return transportationRepository.createTunnel(data as any); }
  async updateTunnel(id: number, data: Record<string, unknown>) { return transportationRepository.updateTunnel(id, data as any); }
  async deleteTunnel(id: number) { return transportationRepository.deleteTunnel(id); }

  // Ports
  async listPorts(networkId: number) { return transportationRepository.findPortsByNetwork(networkId); }
  async createPort(data: Record<string, unknown>) { return transportationRepository.createPort(data as any); }
  async updatePort(id: number, data: Record<string, unknown>) { return transportationRepository.updatePort(id, data as any); }
  async deletePort(id: number) { return transportationRepository.deletePort(id); }

  // Airports
  async listAirports(networkId: number) { return transportationRepository.findAirportsByNetwork(networkId); }
  async createAirport(data: Record<string, unknown>) { return transportationRepository.createAirport(data as any); }
  async updateAirport(id: number, data: Record<string, unknown>) { return transportationRepository.updateAirport(id, data as any); }
  async deleteAirport(id: number) { return transportationRepository.deleteAirport(id); }

  // Railways
  async listRailways(networkId: number) { return transportationRepository.findRailwaysByNetwork(networkId); }
  async createRailway(data: Record<string, unknown>) { return transportationRepository.createRailway(data as any); }
  async updateRailway(id: number, data: Record<string, unknown>) { return transportationRepository.updateRailway(id, data as any); }
  async deleteRailway(id: number) { return transportationRepository.deleteRailway(id); }

  // Checkpoints
  async listCheckpoints(networkId: number) { return transportationRepository.findCheckpointsByNetwork(networkId); }
  async createCheckpoint(data: Record<string, unknown>) { return transportationRepository.createCheckpoint(data as any); }
  async updateCheckpoint(id: number, data: Record<string, unknown>) { return transportationRepository.updateCheckpoint(id, data as any); }
  async deleteCheckpoint(id: number) { return transportationRepository.deleteCheckpoint(id); }

  // Templates
  async listTemplates() { return transportationRepository.findAllTemplates(); }
  async createTemplate(data: Record<string, unknown>) { return transportationRepository.createTemplate(data as any); }
  async updateTemplate(id: number, data: Record<string, unknown>) { return transportationRepository.updateTemplate(id, data as any); }
  async deleteTemplate(id: number) { return transportationRepository.deleteTemplate(id); }

  // History
  async getHistory(networkId: number) { return transportationRepository.findHistoryByNetwork(networkId); }

  // Runtime
  async getRuntime(networkId: number) { return transportationRepository.findRuntimeByNetwork(networkId); }
  async updateRuntime(networkId: number, data: Record<string, unknown>) { return transportationRepository.upsertRuntime(networkId, data as any); }
}

export const transportationEditorService = new TransportationEditorService();
