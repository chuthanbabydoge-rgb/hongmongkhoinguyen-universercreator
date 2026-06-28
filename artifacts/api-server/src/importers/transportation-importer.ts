import { transportationRepository } from "../repositories/transportation-repository";

export class TransportationImporter {
  async importNetwork(payload: Record<string, unknown>, importedBy: number) {
    const { network, roads, routes, stations, vehicles, signals, railways, airports, ports, parking, bridges, tunnels, checkpoints, intersections } = payload as any;

    if (!network) throw new Error("Invalid transport export: missing network");

    const { id: _id, createdAt, updatedAt, ...networkData } = network;
    const created = await transportationRepository.createNetwork({ ...networkData, createdBy: importedBy, isPublished: false });

    const errors: string[] = [];
    const importGroup = async (items: unknown[], fn: (data: Record<string, unknown>) => Promise<unknown>, label: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        try {
          const { id: _id2, createdAt: _c, updatedAt: _u, ...rest } = item as any;
          await fn({ ...rest, networkId: created.id });
        } catch (e: any) {
          errors.push(`${label}: ${e.message}`);
        }
      }
    };

    await importGroup(roads ?? [], d => transportationRepository.createRoad(d as any), "road");
    await importGroup(intersections ?? [], d => transportationRepository.createIntersection(d as any), "intersection");
    await importGroup(routes ?? [], d => transportationRepository.createRoute(d as any), "route");
    await importGroup(stations ?? [], d => transportationRepository.createStation(d as any), "station");
    await importGroup(vehicles ?? [], d => transportationRepository.createVehicle(d as any), "vehicle");
    await importGroup(parking ?? [], d => transportationRepository.createParking(d as any), "parking");
    await importGroup(signals ?? [], d => transportationRepository.createSignal(d as any), "signal");
    await importGroup(bridges ?? [], d => transportationRepository.createBridge(d as any), "bridge");
    await importGroup(tunnels ?? [], d => transportationRepository.createTunnel(d as any), "tunnel");
    await importGroup(ports ?? [], d => transportationRepository.createPort(d as any), "port");
    await importGroup(airports ?? [], d => transportationRepository.createAirport(d as any), "airport");
    await importGroup(railways ?? [], d => transportationRepository.createRailway(d as any), "railway");
    await importGroup(checkpoints ?? [], d => transportationRepository.createCheckpoint(d as any), "checkpoint");

    return { networkId: created.id, errors };
  }
}

export const transportationImporter = new TransportationImporter();
