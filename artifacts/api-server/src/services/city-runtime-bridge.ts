import type { CityRepository } from "../repositories/city-repository";

export class CityRuntimeBridge {
  async startSimulation(cityId: number, sessionId: string, repo: CityRepository) {
    const existing = await repo.getRuntime(sessionId);
    if (existing) return existing;
    return repo.createRuntime({
      cityId,
      sessionId,
      isRunning: true,
      simulationTick: 0,
      currentHour: 8,
      currentDay: 1,
      weather: "clear",
      activeCitizens: 0,
      activeVehicles: 0,
      economyBalance: 0,
      powerLoad: 0,
      waterLoad: 0,
      crimeLevel: 0,
      emergencyActive: false,
      startedAt: new Date(),
    });
  }

  async stopSimulation(sessionId: string, _userId: number, repo: CityRepository) {
    const rt = await repo.getRuntime(sessionId);
    if (!rt) throw new Error("Runtime session not found");
    return repo.updateRuntime(sessionId, { isRunning: false, stoppedAt: new Date() });
  }

  async tick(sessionId: string, repo: CityRepository) {
    const rt = await repo.getRuntime(sessionId);
    if (!rt) throw new Error("Runtime session not found");
    const newTick = (rt.simulationTick ?? 0) + 1;
    const newHour = ((rt.currentHour ?? 8) + 0.25) % 24;
    const newDay = newHour < (rt.currentHour ?? 8) ? (rt.currentDay ?? 1) + 1 : (rt.currentDay ?? 1);
    const economyDelta = Math.random() * 10 - 3;
    const powerLoad = Math.min(100, (rt.powerLoad ?? 0) + (Math.random() * 5 - 2));
    const waterLoad = Math.min(100, (rt.waterLoad ?? 0) + (Math.random() * 3 - 1));
    const crimeLevel = Math.max(0, Math.min(100, (rt.crimeLevel ?? 0) + (Math.random() * 2 - 1)));
    return repo.updateRuntime(sessionId, {
      simulationTick: newTick,
      currentHour: newHour,
      currentDay: newDay,
      economyBalance: (rt.economyBalance ?? 0) + economyDelta,
      powerLoad,
      waterLoad,
      crimeLevel,
    });
  }

  async spawnCitizens(sessionId: string, count: number, repo: CityRepository) {
    const rt = await repo.getRuntime(sessionId);
    if (!rt) throw new Error("Runtime session not found");
    const newCount = (rt.activeCitizens ?? 0) + count;
    return repo.updateRuntime(sessionId, { activeCitizens: newCount });
  }

  async simulateTraffic(sessionId: string, repo: CityRepository) {
    const rt = await repo.getRuntime(sessionId);
    if (!rt) throw new Error("Runtime session not found");
    const vehicles = Math.floor(Math.random() * 50 + (rt.activeCitizens ?? 0) * 0.1);
    return repo.updateRuntime(sessionId, { activeVehicles: vehicles });
  }

  async simulateEconomy(cityId: number, repo: CityRepository) {
    const stats = await repo.getStatistics(cityId);
    if (!stats) return { revenue: 0, expenses: 0, balance: 0 };
    const services = await repo.listServices(cityId);
    const revenue = services.reduce((sum, s) => sum + (s.cost ?? 0), 0) + Math.random() * 1000;
    const expenses = services.length * 50 + Math.random() * 200;
    await repo.upsertStatistics(cityId, {
      totalRevenue: (stats.totalRevenue ?? 0) + revenue,
      totalExpenses: (stats.totalExpenses ?? 0) + expenses,
      totalTransactions: (stats.totalTransactions ?? 0) + Math.floor(Math.random() * 20),
    });
    return { revenue, expenses, balance: revenue - expenses };
  }

  async simulateEmergency(sessionId: string, type: string, repo: CityRepository) {
    const rt = await repo.getRuntime(sessionId);
    if (!rt) throw new Error("Runtime session not found");
    const log = [...((rt.runtimeLog as unknown[]) ?? []), { type, timestamp: new Date().toISOString(), resolved: false }];
    return repo.updateRuntime(sessionId, { emergencyActive: true, runtimeLog: log as unknown as Record<string, unknown> });
  }
}
