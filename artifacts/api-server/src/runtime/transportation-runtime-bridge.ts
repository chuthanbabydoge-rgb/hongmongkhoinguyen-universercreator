import { transportationRepository } from "../repositories/transportation-repository";

export class TransportationRuntimeBridge {
  async getNetworkState(networkId: number) {
    const [runtime, network, roads, routes, stations, vehicles, signals] = await Promise.all([
      transportationRepository.findRuntimeByNetwork(networkId),
      transportationRepository.findNetworkById(networkId),
      transportationRepository.findRoadsByNetwork(networkId),
      transportationRepository.findRoutesByNetwork(networkId),
      transportationRepository.findStationsByNetwork(networkId),
      transportationRepository.findVehiclesByNetwork(networkId),
      transportationRepository.findSignalsByNetwork(networkId),
    ]);
    return { runtime, network, summary: { roads: roads.length, routes: routes.length, stations: stations.length, vehicles: vehicles.length, signals: signals.length } };
  }

  async startSimulation(networkId: number) {
    return transportationRepository.upsertRuntime(networkId, {
      isStreaming: true,
      roadNetworkStatus: "online",
      railNetworkStatus: "online",
      airNetworkStatus: "online",
      seaNetworkStatus: "online",
    });
  }

  async stopSimulation(networkId: number) {
    return transportationRepository.upsertRuntime(networkId, {
      isStreaming: false,
      roadNetworkStatus: "offline",
      railNetworkStatus: "offline",
      airNetworkStatus: "offline",
      seaNetworkStatus: "offline",
    });
  }

  async simulateTrafficTick(networkId: number) {
    const runtime = await transportationRepository.findRuntimeByNetwork(networkId);
    const tick = (runtime?.simulationTick ?? 0) + 1;
    const vehicles = await transportationRepository.findVehiclesByNetwork(networkId);
    const trafficDensity = Math.min(1, vehicles.length / 100);
    const congestionLevel = trafficDensity * 0.8;
    const avgSpeed = 60 * (1 - congestionLevel * 0.5);
    return transportationRepository.upsertRuntime(networkId, { simulationTick: tick, trafficDensity, congestionLevel, avgSpeed, activeVehicles: vehicles.length });
  }

  async simulateVehicleMovement(networkId: number) {
    const vehicles = await transportationRepository.findVehiclesByNetwork(networkId);
    return { networkId, tick: Date.now(), vehiclesProcessed: vehicles.length, status: "simulated" };
  }

  async simulateRailNetwork(networkId: number) {
    const railways = await transportationRepository.findRailwaysByNetwork(networkId);
    return { networkId, railwayCount: railways.length, status: "rail_simulated" };
  }

  async simulateAirNetwork(networkId: number) {
    const airports = await transportationRepository.findAirportsByNetwork(networkId);
    return { networkId, airportCount: airports.length, status: "air_simulated" };
  }

  async simulateSeaNetwork(networkId: number) {
    const ports = await transportationRepository.findPortsByNetwork(networkId);
    return { networkId, portCount: ports.length, status: "sea_simulated" };
  }

  async simulateSignalCycle(networkId: number) {
    const signals = await transportationRepository.findSignalsByNetwork(networkId);
    return { networkId, signalsProcessed: signals.length, nextState: "green", status: "signal_cycled" };
  }

  async planRoute(networkId: number, from: number, to: number) {
    const routes = await transportationRepository.findRoutesByNetwork(networkId);
    const matching = routes.filter(r => {
      const waypoints = (r.waypoints as number[]) ?? [];
      return waypoints.includes(from) || waypoints.includes(to);
    });
    return { networkId, from, to, candidateRoutes: matching.length, routes: matching.slice(0, 3) };
  }

  async calculateCongestion(networkId: number) {
    const runtime = await transportationRepository.findRuntimeByNetwork(networkId);
    return { networkId, congestionLevel: runtime?.congestionLevel ?? 0, trafficDensity: runtime?.trafficDensity ?? 0 };
  }

  async streamingPreview(networkId: number) {
    return this.getNetworkState(networkId);
  }
}

export const transportationRuntimeBridge = new TransportationRuntimeBridge();
