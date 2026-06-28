import { LandRepository } from "../repositories/land-repository";

export class LandValidator {
  private repo = new LandRepository();

  async validate(landId: number) {
    const [land, parcels, boundaries, owners, roads, buildings, teleports, utilities] = await Promise.all([
      this.repo.get(landId),
      this.repo.listParcels(landId),
      this.repo.listBoundaries(landId),
      this.repo.listOwners(landId),
      this.repo.listRoads(landId),
      this.repo.listBuildings(landId),
      this.repo.listTeleports(landId),
      this.repo.listUtilities(landId),
    ]);

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!land) { errors.push("Land not found"); return { valid: false, errors, warnings }; }

    // Overlapping parcels
    for (let i = 0; i < parcels.length; i++) {
      for (let j = i + 1; j < parcels.length; j++) {
        const a = parcels[i], b = parcels[j];
        const overlapX = Math.abs(a.posX - b.posX) < (a.width + b.width) / 2;
        const overlapZ = Math.abs(a.posZ - b.posZ) < (a.depth + b.depth) / 2;
        if (overlapX && overlapZ) errors.push(`Parcels ${a.id} and ${b.id} overlap`);
      }
    }

    // Invalid boundaries
    for (const b of boundaries) {
      const pts = (b.points as { x: number; z: number }[]) ?? [];
      if (pts.length < 3) errors.push(`Boundary ${b.id} has fewer than 3 points`);
    }

    // Orphan ownership
    for (const o of owners) {
      if (!o.ownerRef || o.ownerRef.trim() === "") errors.push(`Owner record ${o.id} has no owner reference`);
    }

    // Invalid zoning — warn if no zones
    if (buildings.length > 0 && parcels.length === 0) {
      warnings.push("Land has buildings but no defined parcels");
    }

    // Disconnected roads — warn if only one road
    if (roads.length === 1) warnings.push("Land has only one road segment — network may be disconnected");

    // Invalid building references
    for (const b of buildings) {
      if (!b.buildingId) errors.push(`Land building record ${b.id} has no building reference`);
    }

    // Teleport conflicts
    const teleportPositions = new Map<string, number>();
    for (const t of teleports) {
      const key = `${Math.round(t.posX)},${Math.round(t.posZ)}`;
      if (teleportPositions.has(key)) errors.push(`Teleports ${t.id} and ${teleportPositions.get(key)} share the same position`);
      else teleportPositions.set(key, t.id);
    }

    // Utility conflicts
    const utilOverloaded = utilities.filter((u) => u.currentLoad > u.capacity);
    for (const u of utilOverloaded) warnings.push(`Utility ${u.name} (${u.id}) is over capacity`);

    // General warnings
    if (parcels.length === 0) warnings.push("No parcels defined — land cannot be subdivided");
    if (boundaries.length === 0) warnings.push("No boundaries defined");
    if (owners.length === 0) warnings.push("Land has no registered owner");

    return { valid: errors.length === 0, errors, warnings, stats: { parcels: parcels.length, boundaries: boundaries.length, owners: owners.length, roads: roads.length, buildings: buildings.length, teleports: teleports.length, utilities: utilities.length } };
  }
}
