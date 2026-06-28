import { randomUUID } from "crypto";
import { BuildingRepository } from "../repositories/building-repository";

export class BuildingRuntimeBridge {
  private repo = new BuildingRepository();

  async startSession(buildingId: number) {
    const sessionId = randomUUID();
    const runtime = await this.repo.createRuntime(buildingId, sessionId);
    return { sessionId, runtime, started: true };
  }

  async stopSession(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Session not found");
    await this.repo.updateRuntime(sessionId, { isOpen: false });
    await this.repo.addHistory(runtime.buildingId, "simulation_stopped", userId);
    return { ok: true, sessionId };
  }

  async openBuilding(sessionId: string) {
    const r = await this.repo.updateRuntime(sessionId, { isOpen: true });
    return { ok: true, isOpen: true, runtime: r };
  }

  async closeBuilding(sessionId: string) {
    const r = await this.repo.updateRuntime(sessionId, { isOpen: false });
    return { ok: true, isOpen: false, runtime: r };
  }

  async setPower(sessionId: string, state: "on" | "off" | "emergency" | "backup" | "off_grid") {
    const r = await this.repo.updateRuntime(sessionId, {
      powerState: state,
      isPowered: state === "on" || state === "backup",
    });
    return { ok: true, powerState: state, runtime: r };
  }

  async setWater(sessionId: string, on: boolean) {
    const r = await this.repo.updateRuntime(sessionId, { isWaterOn: on });
    return { ok: true, isWaterOn: on, runtime: r };
  }

  async setLighting(sessionId: string, on: boolean) {
    const r = await this.repo.updateRuntime(sessionId, { isLightsOn: on });
    return { ok: true, isLightsOn: on, runtime: r };
  }

  async setSecurityLevel(sessionId: string, level: "none" | "basic" | "standard" | "high" | "maximum") {
    const r = await this.repo.updateRuntime(sessionId, { securityLevel: level });
    return { ok: true, securityLevel: level, runtime: r };
  }

  async triggerEmergency(sessionId: string, emergencyType: string) {
    const updates: Record<string, unknown> = {};
    if (emergencyType === "fire") updates.isOnFire = true;
    if (emergencyType === "power_cut") updates.powerState = "off";
    const r = await this.repo.updateRuntime(sessionId, updates as Partial<typeof updates>);
    return { ok: true, emergencyType, runtime: r };
  }

  async spawnVisitors(sessionId: string, count: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Session not found");
    const newOccupancy = Math.min(runtime.currentOccupancy + count, 999);
    const r = await this.repo.updateRuntime(sessionId, { currentOccupancy: newOccupancy });
    return { ok: true, spawned: count, currentOccupancy: newOccupancy, runtime: r };
  }

  async tickSimulation(sessionId: string) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Session not found");
    const r = await this.repo.updateRuntime(sessionId, { tickCount: runtime.tickCount + 1 });
    return { ok: true, tick: r?.tickCount ?? 0, runtime: r };
  }

  async streamBuilding(buildingId: number) {
    const full = await this.repo.getFull(buildingId);
    const sessions = await this.repo.listRuntime(buildingId);
    return { building: full, activeSessions: sessions.length, streamed: true };
  }
}
