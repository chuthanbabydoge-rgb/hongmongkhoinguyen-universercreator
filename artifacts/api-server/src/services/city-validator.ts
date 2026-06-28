export class CityValidator {
  validate(city: Record<string, unknown>) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const districts = (city.districts as Record<string, unknown>[]) ?? [];
    const zones = (city.zones as Record<string, unknown>[]) ?? [];
    const roads = (city.roads as Record<string, unknown>[]) ?? [];
    const buildings = (city.buildings as Record<string, unknown>[]) ?? [];
    const utilities = (city.utilities as Record<string, unknown>[]) ?? [];
    const spawnpoints = (city.spawnpoints as Record<string, unknown>[]) ?? [];
    const transport = (city.transport as Record<string, unknown>[]) ?? [];
    const services = (city.services as Record<string, unknown>[]) ?? [];

    // Duplicate districts
    const districtNames = districts.map((d) => d.name as string);
    const dupDistricts = districtNames.filter((n, i) => districtNames.indexOf(n) !== i);
    if (dupDistricts.length > 0) errors.push(`Duplicate district names: ${dupDistricts.join(", ")}`);

    // Disconnected roads
    if (roads.length > 0) {
      const connectedRoads = roads.filter((r) => r.startX !== r.endX || r.startY !== r.endY);
      if (connectedRoads.length < roads.length) warnings.push("Some roads have identical start/end points (disconnected)");
    }

    // Overlapping zones
    for (let i = 0; i < zones.length; i++) {
      for (let j = i + 1; j < zones.length; j++) {
        const a = zones[i] as { positionX: number; positionY: number; radius: number };
        const b = zones[j] as { positionX: number; positionY: number; radius: number };
        const dist = Math.sqrt(Math.pow(a.positionX - b.positionX, 2) + Math.pow(a.positionY - b.positionY, 2));
        if (dist < (a.radius + b.radius) * 0.5) warnings.push(`Zones ${zones[i].name} and ${zones[j].name} may overlap`);
      }
    }

    // Invalid spawn
    if (spawnpoints.length === 0) warnings.push("No spawnpoints defined — players will spawn at world origin");
    const defaultSpawns = spawnpoints.filter((s) => s.isDefault);
    if (defaultSpawns.length === 0 && spawnpoints.length > 0) warnings.push("No default spawnpoint set");

    // Missing utilities
    if (utilities.length === 0) warnings.push("No utilities configured — city simulation will lack power/water");
    const powerUtils = utilities.filter((u) => u.utilityType === "electricity");
    const waterUtils = utilities.filter((u) => u.utilityType === "water");
    if (powerUtils.length === 0) warnings.push("No electricity utility — buildings may not function");
    if (waterUtils.length === 0) warnings.push("No water utility — population happiness may suffer");

    // Invalid building references
    const invalidBuildings = buildings.filter((b) => !b.name || (b.name as string).length < 1);
    if (invalidBuildings.length > 0) errors.push(`${invalidBuildings.length} buildings have invalid names`);

    // Orphan transport
    const orphanTransport = transport.filter((t) => !t.routePoints || (t.routePoints as unknown[]).length < 2);
    if (orphanTransport.length > 0) warnings.push(`${orphanTransport.length} transport routes have insufficient route points`);

    // Services warnings
    const hospitalCount = services.filter((s) => s.serviceType === "hospital").length;
    const policeCount = services.filter((s) => s.serviceType === "police").length;
    if (hospitalCount === 0 && buildings.length > 5) warnings.push("No hospital service — injured NPCs cannot be treated");
    if (policeCount === 0 && (city.population as number ?? 0) > 100) warnings.push("No police service — crime rate may increase");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        districts: districts.length,
        zones: zones.length,
        roads: roads.length,
        buildings: buildings.length,
        utilities: utilities.length,
        spawnpoints: spawnpoints.length,
        transport: transport.length,
        services: services.length,
      },
    };
  }
}
