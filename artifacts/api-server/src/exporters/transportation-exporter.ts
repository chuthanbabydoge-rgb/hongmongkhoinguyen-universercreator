import crypto from "crypto";
import { transportationRepository } from "../repositories/transportation-repository";

export class TransportationExporter {
  async exportNetwork(networkId: number, format: "json" | "template" | "package" = "json", exportedBy: number) {
    const [network, roads, intersections, routes, stations, vehicles, parking, signals, bridges, tunnels, ports, airports, railways, checkpoints] = await Promise.all([
      transportationRepository.findNetworkById(networkId),
      transportationRepository.findRoadsByNetwork(networkId),
      transportationRepository.findIntersectionsByNetwork(networkId),
      transportationRepository.findRoutesByNetwork(networkId),
      transportationRepository.findStationsByNetwork(networkId),
      transportationRepository.findVehiclesByNetwork(networkId),
      transportationRepository.findParkingByNetwork(networkId),
      transportationRepository.findSignalsByNetwork(networkId),
      transportationRepository.findBridgesByNetwork(networkId),
      transportationRepository.findTunnelsByNetwork(networkId),
      transportationRepository.findPortsByNetwork(networkId),
      transportationRepository.findAirportsByNetwork(networkId),
      transportationRepository.findRailwaysByNetwork(networkId),
      transportationRepository.findCheckpointsByNetwork(networkId),
    ]);
    if (!network) throw new Error(`Network ${networkId} not found`);

    const payload = {
      exportVersion: "1.0.0",
      format,
      exportedAt: new Date().toISOString(),
      network,
      roads,
      intersections,
      routes,
      stations,
      vehicles,
      parking,
      signals,
      bridges,
      tunnels,
      ports,
      airports,
      railways,
      checkpoints,
    };

    const json = JSON.stringify(payload);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    const record = await transportationRepository.createExport({ networkId, format, payload: payload as any, checksum, exportedBy });
    return { ...record, data: payload };
  }
}

export const transportationExporter = new TransportationExporter();
