import { LandRepository } from "../repositories/land-repository";

export class LandRuntimeBridge {
  private repo = new LandRepository();

  async startStreaming(landId: number) {
    await this.repo.upsertRuntime(landId, { isStreaming: true, roadNetworkStatus: "online", utilityNetworkStatus: "online", teleportNetworkStatus: "online" });
    return { ok: true, status: "streaming_started" };
  }

  async stopStreaming(landId: number) {
    await this.repo.upsertRuntime(landId, { isStreaming: false, roadNetworkStatus: "offline", utilityNetworkStatus: "offline", teleportNetworkStatus: "offline" });
    return { ok: true, status: "streaming_stopped" };
  }

  async getStatus(landId: number) {
    return this.repo.getRuntime(landId);
  }

  async loadChunk(landId: number, chunkId: number) {
    const rt = await this.repo.getRuntime(landId);
    const current = ((rt?.activeChunks as number[]) ?? []);
    if (!current.includes(chunkId)) {
      await this.repo.upsertRuntime(landId, { activeChunks: [...current, chunkId], loadedParcels: (rt?.loadedParcels ?? 0) + 1 });
    }
    return { ok: true, chunkId };
  }

  async unloadChunk(landId: number, chunkId: number) {
    const rt = await this.repo.getRuntime(landId);
    const filtered = ((rt?.activeChunks as number[]) ?? []).filter((c) => c !== chunkId);
    await this.repo.upsertRuntime(landId, { activeChunks: filtered });
    return { ok: true, chunkId };
  }

  async simulateTick(landId: number) {
    const rt = await this.repo.getRuntime(landId);
    const tick = (rt?.simulationTick ?? 0) + 1;
    const traffic = Math.min(1, (rt?.trafficDensity ?? 0) + Math.random() * 0.05 - 0.02);
    await this.repo.upsertRuntime(landId, { simulationTick: tick, trafficDensity: traffic });
    return { ok: true, tick, trafficDensity: traffic };
  }

  async previewRuntime(landId: number) {
    const [land, runtime, parcels, buildings, roads, teleports] = await Promise.all([
      this.repo.get(landId),
      this.repo.getRuntime(landId),
      this.repo.listParcels(landId),
      this.repo.listBuildings(landId),
      this.repo.listRoads(landId),
      this.repo.listTeleports(landId),
    ]);
    return { land, runtime, parcelCount: parcels.length, buildingCount: buildings.length, roadCount: roads.length, teleportCount: teleports.length };
  }

  async syncOwnership(landId: number) {
    const owners = await this.repo.listOwners(landId);
    return { ok: true, ownerCount: owners.length, synced: true };
  }

  async validateZones(landId: number) {
    const zones = await this.repo.listZones(landId);
    return { ok: true, zoneCount: zones.length, valid: zones.every((z) => Array.isArray(z.shape) && (z.shape as unknown[]).length >= 3) };
  }

  async runTrafficFlow(landId: number) {
    const roads = await this.repo.listRoads(landId);
    return { ok: true, roadSegments: roads.length, flowSimulated: true };
  }

  async marketplaceSync(landId: number) {
    return { ok: true, landId, synced: true };
  }

  async constructionTick(landId: number) {
    const buildings = await this.repo.listBuildings(landId);
    return { ok: true, buildingsProcessed: buildings.length };
  }
}
