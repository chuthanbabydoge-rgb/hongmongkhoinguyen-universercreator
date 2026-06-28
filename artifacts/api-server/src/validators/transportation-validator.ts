import { transportationRepository } from "../repositories/transportation-repository";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class TransportationValidator {
  async validate(networkId: number): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const [network, roads, intersections, routes, stations, signals, railways, airports, bridges, tunnels] = await Promise.all([
      transportationRepository.findNetworkById(networkId),
      transportationRepository.findRoadsByNetwork(networkId),
      transportationRepository.findIntersectionsByNetwork(networkId),
      transportationRepository.findRoutesByNetwork(networkId),
      transportationRepository.findStationsByNetwork(networkId),
      transportationRepository.findSignalsByNetwork(networkId),
      transportationRepository.findRailwaysByNetwork(networkId),
      transportationRepository.findAirportsByNetwork(networkId),
      transportationRepository.findBridgesByNetwork(networkId),
      transportationRepository.findTunnelsByNetwork(networkId),
    ]);

    if (!network) { errors.push("Network not found"); return { valid: false, errors, warnings }; }

    // Disconnected roads check
    const roadIds = new Set(roads.map(r => r.id));
    const connectedRoadIds = new Set(intersections.flatMap(i => (i.connectedRoads as number[]) ?? []));
    const disconnected = roads.filter(r => !connectedRoadIds.has(r.id));
    if (disconnected.length > 0) warnings.push(`${disconnected.length} road(s) not connected to any intersection`);

    // Orphan intersections check
    const orphanIntersections = intersections.filter(i => ((i.connectedRoads as number[]) ?? []).length < 2);
    if (orphanIntersections.length > 0) warnings.push(`${orphanIntersections.length} intersection(s) have fewer than 2 road connections`);

    // Invalid routes
    const invalidRoutes = routes.filter(r => ((r.waypoints as unknown[]) ?? []).length < 2);
    if (invalidRoutes.length > 0) errors.push(`${invalidRoutes.length} route(s) have fewer than 2 waypoints`);

    // Unreachable stations
    const stationRouteRefs = new Set(routes.flatMap(r => (r.stationIds as number[]) ?? []));
    const unreachableStations = stations.filter(s => !stationRouteRefs.has(s.id));
    if (unreachableStations.length > 0) warnings.push(`${unreachableStations.length} station(s) not linked to any route`);

    // Broken rail networks
    const emptyRailways = railways.filter(r => ((r.points as unknown[]) ?? []).length < 2);
    if (emptyRailways.length > 0) errors.push(`${emptyRailways.length} railway(s) have fewer than 2 track points`);

    // Airport conflicts (duplicate IATA codes)
    const iataCodes = airports.map(a => a.iataCode).filter(Boolean);
    const duplicateIata = iataCodes.filter((code, i) => iataCodes.indexOf(code) !== i);
    if (duplicateIata.length > 0) errors.push(`Duplicate IATA codes: ${[...new Set(duplicateIata)].join(", ")}`);

    // Bridge loop check
    const bridgeRoadRefs = bridges.map(b => b.roadId).filter(Boolean);
    const duplicateBridgeRoads = bridgeRoadRefs.filter((id, i) => bridgeRoadRefs.indexOf(id) !== i);
    if (duplicateBridgeRoads.length > 0) warnings.push(`${duplicateBridgeRoads.length} road(s) have multiple bridge entries (potential loop)`);

    // Tunnel conflicts
    const tunnelRoadRefs = tunnels.map(t => t.roadId).filter(Boolean);
    const duplicateTunnelRoads = tunnelRoadRefs.filter((id, i) => tunnelRoadRefs.indexOf(id) !== i);
    if (duplicateTunnelRoads.length > 0) warnings.push(`${duplicateTunnelRoads.length} road(s) assigned to multiple tunnels`);

    // Invalid traffic signals
    const orphanSignals = signals.filter(s => !s.intersectionId);
    if (orphanSignals.length > 0) warnings.push(`${orphanSignals.length} traffic signal(s) not assigned to any intersection`);

    // General warnings
    if (roads.length === 0) warnings.push("Network has no roads defined");
    if (routes.length === 0) warnings.push("Network has no routes defined");
    if (stations.length === 0) warnings.push("Network has no stations defined");

    return { valid: errors.length === 0, errors, warnings };
  }
}

export const transportationValidator = new TransportationValidator();
