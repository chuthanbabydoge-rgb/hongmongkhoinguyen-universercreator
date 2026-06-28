import { BuildingRepository } from "../repositories/building-repository";

export class BuildingValidator {
  private repo = new BuildingRepository();

  async validate(buildingId: number) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const building = await this.repo.get(buildingId);
    if (!building) return { valid: false, errors: ["Building not found"], warnings: [] };

    const [floors, rooms, doors, windows, spawnpoints, furniture] = await Promise.all([
      this.repo.listFloors(buildingId),
      this.repo.listRooms(buildingId),
      this.repo.listDoors(buildingId),
      this.repo.listWindows(buildingId),
      this.repo.listSpawnpoints(buildingId),
      this.repo.listFurniture(buildingId),
    ]);

    if (floors.length === 0) errors.push("Building has no floors defined.");
    if (rooms.length === 0) warnings.push("Building has no rooms — consider adding at least one room.");

    const floorIds = new Set(floors.map(f => f.id));
    const roomIds = new Set(rooms.map(r => r.id));

    const invalidFloorRooms = rooms.filter(r => !floorIds.has(r.floorId));
    if (invalidFloorRooms.length > 0)
      errors.push(`${invalidFloorRooms.length} room(s) reference invalid floor IDs.`);

    const roomNames = rooms.map(r => r.name);
    const dupeRooms = roomNames.filter((n, i) => roomNames.indexOf(n) !== i);
    if (dupeRooms.length > 0)
      warnings.push(`Duplicate room names detected: ${[...new Set(dupeRooms)].join(", ")}.`);

    const brokenDoors = doors.filter(d => d.roomFromId && !roomIds.has(d.roomFromId));
    if (brokenDoors.length > 0)
      errors.push(`${brokenDoors.length} door(s) reference non-existent rooms.`);

    const orphanFurniture = furniture.filter(f => f.roomId && !roomIds.has(f.roomId));
    if (orphanFurniture.length > 0)
      warnings.push(`${orphanFurniture.length} furniture item(s) placed outside any room.`);

    const invalidWindowFloors = windows.filter(w => !floorIds.has(w.floorId));
    if (invalidWindowFloors.length > 0)
      errors.push(`${invalidWindowFloors.length} window(s) reference invalid floor IDs.`);

    const defaultSpawns = spawnpoints.filter(s => s.isDefault);
    if (defaultSpawns.length === 0) warnings.push("No default spawn point defined.");
    if (defaultSpawns.length > 1) warnings.push("Multiple default spawn points — only one is recommended.");

    if (building.floorCount !== floors.length)
      warnings.push(`Building declares ${building.floorCount} floor(s) but ${floors.length} floor record(s) exist.`);

    const roomsWithOverlap: string[] = [];
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const a = rooms[i], b = rooms[j];
        if (a.floorId !== b.floorId) continue;
        const overlapX = Math.abs(a.posX - b.posX) < (a.width + b.width) / 2;
        const overlapZ = Math.abs(a.posZ - b.posZ) < (a.depth + b.depth) / 2;
        if (overlapX && overlapZ) roomsWithOverlap.push(`"${a.name}" and "${b.name}"`);
      }
    }
    if (roomsWithOverlap.length > 0)
      warnings.push(`Potentially overlapping rooms: ${roomsWithOverlap.slice(0, 3).join("; ")}.`);

    return { valid: errors.length === 0, errors, warnings };
  }
}
