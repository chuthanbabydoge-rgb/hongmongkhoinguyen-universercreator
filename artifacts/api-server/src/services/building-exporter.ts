import { createHash } from "crypto";
import { BuildingRepository } from "../repositories/building-repository";

export class BuildingExporter {
  private repo = new BuildingRepository();

  async exportJson(buildingId: number, userId: number) {
    const full = await this.repo.getFull(buildingId);
    const payload = { version: 1, exportedAt: new Date().toISOString(), ...full };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.addExport(buildingId, userId, "json", payload, checksum);
    return { payload, checksum };
  }

  async exportTemplate(buildingId: number, name: string, description: string, userId: number) {
    const full = await this.repo.getFull(buildingId);
    const payload = { version: 1, type: "template", name, description, exportedAt: new Date().toISOString(), ...full };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const building = await this.repo.get(buildingId);
    const template = await this.repo.createTemplate({
      createdBy: userId,
      buildingId,
      name,
      description,
      buildingType: building?.buildingType ?? "house",
      buildingCategory: building?.buildingCategory ?? "residential",
      payload,
      checksum,
      isGlobal: false,
    });
    return { template, checksum };
  }

  async exportPackage(buildingId: number, userId: number) {
    const full = await this.repo.getFull(buildingId);
    const payload = { version: 1, type: "package", exportedAt: new Date().toISOString(), buildings: [full] };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.addExport(buildingId, userId, "package", payload, checksum);
    return { payload, checksum };
  }
}
