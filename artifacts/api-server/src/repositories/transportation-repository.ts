import { db } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import {
  creatorTransportNetworksTable,
  creatorTransportRoadsTable,
  creatorTransportIntersectionsTable,
  creatorTransportRoutesTable,
  creatorTransportStationsTable,
  creatorTransportVehiclesTable,
  creatorTransportParkingTable,
  creatorTransportSignalsTable,
  creatorTransportBridgesTable,
  creatorTransportTunnelsTable,
  creatorTransportPortsTable,
  creatorTransportAirportsTable,
  creatorTransportRailwaysTable,
  creatorTransportCheckpointsTable,
  creatorTransportTemplatesTable,
  creatorTransportVersionsTable,
  creatorTransportHistoryTable,
  creatorTransportStatisticsTable,
  creatorTransportRuntimeTable,
  creatorTransportExportsTable,
} from "@workspace/db/schema";

export class TransportationRepository {
  // Networks
  async findAllNetworks(limit = 50, offset = 0) {
    return db.select().from(creatorTransportNetworksTable).orderBy(desc(creatorTransportNetworksTable.createdAt)).limit(limit).offset(offset);
  }
  async findNetworkById(id: number) {
    const rows = await db.select().from(creatorTransportNetworksTable).where(eq(creatorTransportNetworksTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async searchNetworks(q: string) {
    return db.select().from(creatorTransportNetworksTable).where(like(creatorTransportNetworksTable.name, `%${q}%`)).limit(20);
  }
  async createNetwork(data: typeof creatorTransportNetworksTable.$inferInsert) {
    const rows = await db.insert(creatorTransportNetworksTable).values(data).returning();
    return rows[0];
  }
  async updateNetwork(id: number, data: Partial<typeof creatorTransportNetworksTable.$inferInsert>) {
    const rows = await db.update(creatorTransportNetworksTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportNetworksTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteNetwork(id: number) {
    await db.delete(creatorTransportNetworksTable).where(eq(creatorTransportNetworksTable.id, id));
    return true;
  }
  async publishNetwork(id: number) {
    return this.updateNetwork(id, { isPublished: true, transportStatus: "active" });
  }
  async archiveNetwork(id: number) {
    return this.updateNetwork(id, { transportStatus: "archived" });
  }

  // Roads
  async findRoadsByNetwork(networkId: number) {
    return db.select().from(creatorTransportRoadsTable).where(eq(creatorTransportRoadsTable.networkId, networkId));
  }
  async findRoadById(id: number) {
    const rows = await db.select().from(creatorTransportRoadsTable).where(eq(creatorTransportRoadsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createRoad(data: typeof creatorTransportRoadsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportRoadsTable).values(data).returning();
    return rows[0];
  }
  async updateRoad(id: number, data: Partial<typeof creatorTransportRoadsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportRoadsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportRoadsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteRoad(id: number) {
    await db.delete(creatorTransportRoadsTable).where(eq(creatorTransportRoadsTable.id, id));
    return true;
  }

  // Intersections
  async findIntersectionsByNetwork(networkId: number) {
    return db.select().from(creatorTransportIntersectionsTable).where(eq(creatorTransportIntersectionsTable.networkId, networkId));
  }
  async createIntersection(data: typeof creatorTransportIntersectionsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportIntersectionsTable).values(data).returning();
    return rows[0];
  }
  async updateIntersection(id: number, data: Partial<typeof creatorTransportIntersectionsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportIntersectionsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportIntersectionsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteIntersection(id: number) {
    await db.delete(creatorTransportIntersectionsTable).where(eq(creatorTransportIntersectionsTable.id, id));
    return true;
  }

  // Routes
  async findRoutesByNetwork(networkId: number) {
    return db.select().from(creatorTransportRoutesTable).where(eq(creatorTransportRoutesTable.networkId, networkId));
  }
  async findRouteById(id: number) {
    const rows = await db.select().from(creatorTransportRoutesTable).where(eq(creatorTransportRoutesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createRoute(data: typeof creatorTransportRoutesTable.$inferInsert) {
    const rows = await db.insert(creatorTransportRoutesTable).values(data).returning();
    return rows[0];
  }
  async updateRoute(id: number, data: Partial<typeof creatorTransportRoutesTable.$inferInsert>) {
    const rows = await db.update(creatorTransportRoutesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportRoutesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteRoute(id: number) {
    await db.delete(creatorTransportRoutesTable).where(eq(creatorTransportRoutesTable.id, id));
    return true;
  }

  // Stations
  async findStationsByNetwork(networkId: number) {
    return db.select().from(creatorTransportStationsTable).where(eq(creatorTransportStationsTable.networkId, networkId));
  }
  async findStationById(id: number) {
    const rows = await db.select().from(creatorTransportStationsTable).where(eq(creatorTransportStationsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createStation(data: typeof creatorTransportStationsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportStationsTable).values(data).returning();
    return rows[0];
  }
  async updateStation(id: number, data: Partial<typeof creatorTransportStationsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportStationsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportStationsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteStation(id: number) {
    await db.delete(creatorTransportStationsTable).where(eq(creatorTransportStationsTable.id, id));
    return true;
  }

  // Vehicles
  async findVehiclesByNetwork(networkId: number) {
    return db.select().from(creatorTransportVehiclesTable).where(eq(creatorTransportVehiclesTable.networkId, networkId));
  }
  async findVehicleById(id: number) {
    const rows = await db.select().from(creatorTransportVehiclesTable).where(eq(creatorTransportVehiclesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createVehicle(data: typeof creatorTransportVehiclesTable.$inferInsert) {
    const rows = await db.insert(creatorTransportVehiclesTable).values(data).returning();
    return rows[0];
  }
  async updateVehicle(id: number, data: Partial<typeof creatorTransportVehiclesTable.$inferInsert>) {
    const rows = await db.update(creatorTransportVehiclesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportVehiclesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteVehicle(id: number) {
    await db.delete(creatorTransportVehiclesTable).where(eq(creatorTransportVehiclesTable.id, id));
    return true;
  }

  // Parking
  async findParkingByNetwork(networkId: number) {
    return db.select().from(creatorTransportParkingTable).where(eq(creatorTransportParkingTable.networkId, networkId));
  }
  async createParking(data: typeof creatorTransportParkingTable.$inferInsert) {
    const rows = await db.insert(creatorTransportParkingTable).values(data).returning();
    return rows[0];
  }
  async updateParking(id: number, data: Partial<typeof creatorTransportParkingTable.$inferInsert>) {
    const rows = await db.update(creatorTransportParkingTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportParkingTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteParking(id: number) {
    await db.delete(creatorTransportParkingTable).where(eq(creatorTransportParkingTable.id, id));
    return true;
  }

  // Signals
  async findSignalsByNetwork(networkId: number) {
    return db.select().from(creatorTransportSignalsTable).where(eq(creatorTransportSignalsTable.networkId, networkId));
  }
  async createSignal(data: typeof creatorTransportSignalsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportSignalsTable).values(data).returning();
    return rows[0];
  }
  async updateSignal(id: number, data: Partial<typeof creatorTransportSignalsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportSignalsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportSignalsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteSignal(id: number) {
    await db.delete(creatorTransportSignalsTable).where(eq(creatorTransportSignalsTable.id, id));
    return true;
  }

  // Bridges
  async findBridgesByNetwork(networkId: number) {
    return db.select().from(creatorTransportBridgesTable).where(eq(creatorTransportBridgesTable.networkId, networkId));
  }
  async createBridge(data: typeof creatorTransportBridgesTable.$inferInsert) {
    const rows = await db.insert(creatorTransportBridgesTable).values(data).returning();
    return rows[0];
  }
  async updateBridge(id: number, data: Partial<typeof creatorTransportBridgesTable.$inferInsert>) {
    const rows = await db.update(creatorTransportBridgesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportBridgesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteBridge(id: number) {
    await db.delete(creatorTransportBridgesTable).where(eq(creatorTransportBridgesTable.id, id));
    return true;
  }

  // Tunnels
  async findTunnelsByNetwork(networkId: number) {
    return db.select().from(creatorTransportTunnelsTable).where(eq(creatorTransportTunnelsTable.networkId, networkId));
  }
  async createTunnel(data: typeof creatorTransportTunnelsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportTunnelsTable).values(data).returning();
    return rows[0];
  }
  async updateTunnel(id: number, data: Partial<typeof creatorTransportTunnelsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportTunnelsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportTunnelsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteTunnel(id: number) {
    await db.delete(creatorTransportTunnelsTable).where(eq(creatorTransportTunnelsTable.id, id));
    return true;
  }

  // Ports
  async findPortsByNetwork(networkId: number) {
    return db.select().from(creatorTransportPortsTable).where(eq(creatorTransportPortsTable.networkId, networkId));
  }
  async createPort(data: typeof creatorTransportPortsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportPortsTable).values(data).returning();
    return rows[0];
  }
  async updatePort(id: number, data: Partial<typeof creatorTransportPortsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportPortsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportPortsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deletePort(id: number) {
    await db.delete(creatorTransportPortsTable).where(eq(creatorTransportPortsTable.id, id));
    return true;
  }

  // Airports
  async findAirportsByNetwork(networkId: number) {
    return db.select().from(creatorTransportAirportsTable).where(eq(creatorTransportAirportsTable.networkId, networkId));
  }
  async createAirport(data: typeof creatorTransportAirportsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportAirportsTable).values(data).returning();
    return rows[0];
  }
  async updateAirport(id: number, data: Partial<typeof creatorTransportAirportsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportAirportsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportAirportsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteAirport(id: number) {
    await db.delete(creatorTransportAirportsTable).where(eq(creatorTransportAirportsTable.id, id));
    return true;
  }

  // Railways
  async findRailwaysByNetwork(networkId: number) {
    return db.select().from(creatorTransportRailwaysTable).where(eq(creatorTransportRailwaysTable.networkId, networkId));
  }
  async createRailway(data: typeof creatorTransportRailwaysTable.$inferInsert) {
    const rows = await db.insert(creatorTransportRailwaysTable).values(data).returning();
    return rows[0];
  }
  async updateRailway(id: number, data: Partial<typeof creatorTransportRailwaysTable.$inferInsert>) {
    const rows = await db.update(creatorTransportRailwaysTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportRailwaysTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteRailway(id: number) {
    await db.delete(creatorTransportRailwaysTable).where(eq(creatorTransportRailwaysTable.id, id));
    return true;
  }

  // Checkpoints
  async findCheckpointsByNetwork(networkId: number) {
    return db.select().from(creatorTransportCheckpointsTable).where(eq(creatorTransportCheckpointsTable.networkId, networkId));
  }
  async createCheckpoint(data: typeof creatorTransportCheckpointsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportCheckpointsTable).values(data).returning();
    return rows[0];
  }
  async updateCheckpoint(id: number, data: Partial<typeof creatorTransportCheckpointsTable.$inferInsert>) {
    const rows = await db.update(creatorTransportCheckpointsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportCheckpointsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteCheckpoint(id: number) {
    await db.delete(creatorTransportCheckpointsTable).where(eq(creatorTransportCheckpointsTable.id, id));
    return true;
  }

  // Templates
  async findAllTemplates() {
    return db.select().from(creatorTransportTemplatesTable).orderBy(desc(creatorTransportTemplatesTable.createdAt));
  }
  async createTemplate(data: typeof creatorTransportTemplatesTable.$inferInsert) {
    const rows = await db.insert(creatorTransportTemplatesTable).values(data).returning();
    return rows[0];
  }
  async updateTemplate(id: number, data: Partial<typeof creatorTransportTemplatesTable.$inferInsert>) {
    const rows = await db.update(creatorTransportTemplatesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportTemplatesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteTemplate(id: number) {
    await db.delete(creatorTransportTemplatesTable).where(eq(creatorTransportTemplatesTable.id, id));
    return true;
  }

  // Versions
  async findVersionsByNetwork(networkId: number) {
    return db.select().from(creatorTransportVersionsTable).where(eq(creatorTransportVersionsTable.networkId, networkId)).orderBy(desc(creatorTransportVersionsTable.version));
  }
  async createVersion(data: typeof creatorTransportVersionsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportVersionsTable).values(data).returning();
    return rows[0];
  }

  // History
  async findHistoryByNetwork(networkId: number, limit = 50) {
    return db.select().from(creatorTransportHistoryTable).where(eq(creatorTransportHistoryTable.networkId, networkId)).orderBy(desc(creatorTransportHistoryTable.createdAt)).limit(limit);
  }
  async addHistory(data: typeof creatorTransportHistoryTable.$inferInsert) {
    const rows = await db.insert(creatorTransportHistoryTable).values(data).returning();
    return rows[0];
  }

  // Statistics
  async findStatsByNetwork(networkId: number) {
    const rows = await db.select().from(creatorTransportStatisticsTable).where(eq(creatorTransportStatisticsTable.networkId, networkId)).limit(1);
    return rows[0] ?? null;
  }
  async upsertStats(networkId: number, data: Partial<typeof creatorTransportStatisticsTable.$inferInsert>) {
    const existing = await this.findStatsByNetwork(networkId);
    if (existing) {
      const rows = await db.update(creatorTransportStatisticsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportStatisticsTable.networkId, networkId)).returning();
      return rows[0];
    }
    const rows = await db.insert(creatorTransportStatisticsTable).values({ networkId, ...data } as typeof creatorTransportStatisticsTable.$inferInsert).returning();
    return rows[0];
  }

  // Runtime
  async findRuntimeByNetwork(networkId: number) {
    const rows = await db.select().from(creatorTransportRuntimeTable).where(eq(creatorTransportRuntimeTable.networkId, networkId)).limit(1);
    return rows[0] ?? null;
  }
  async upsertRuntime(networkId: number, data: Partial<typeof creatorTransportRuntimeTable.$inferInsert>) {
    const existing = await this.findRuntimeByNetwork(networkId);
    if (existing) {
      const rows = await db.update(creatorTransportRuntimeTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransportRuntimeTable.networkId, networkId)).returning();
      return rows[0];
    }
    const rows = await db.insert(creatorTransportRuntimeTable).values({ networkId, ...data } as typeof creatorTransportRuntimeTable.$inferInsert).returning();
    return rows[0];
  }

  // Exports
  async createExport(data: typeof creatorTransportExportsTable.$inferInsert) {
    const rows = await db.insert(creatorTransportExportsTable).values(data).returning();
    return rows[0];
  }
  async findExportsByNetwork(networkId: number) {
    return db.select().from(creatorTransportExportsTable).where(eq(creatorTransportExportsTable.networkId, networkId)).orderBy(desc(creatorTransportExportsTable.createdAt));
  }
}

export const transportationRepository = new TransportationRepository();
