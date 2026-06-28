import crypto from "crypto";
import { LandRepository } from "../repositories/land-repository";

export class LandExporter {
  private repo = new LandRepository();

  async exportJson(landId: number) {
    const data = await this._collect(landId);
    const payload = JSON.stringify(data);
    const checksum = crypto.createHash("sha256").update(payload).digest("hex");
    await this.repo.createExport(landId, "json", data, checksum, data.land?.createdBy ?? 0);
    return { format: "json", payload: data, checksum };
  }

  async exportTemplate(landId: number, createdBy: number) {
    const data = await this._collect(landId);
    const template = { ...data, _type: "land_template", _version: 1 };
    const payload = JSON.stringify(template);
    const checksum = crypto.createHash("sha256").update(payload).digest("hex");
    await this.repo.createExport(landId, "template", template, checksum, createdBy);
    return { format: "template", payload: template, checksum };
  }

  async exportPackage(landId: number, createdBy: number) {
    const data = await this._collect(landId);
    const pkg = { ...data, _type: "land_package", _version: 1, _exportedAt: new Date().toISOString() };
    const payload = JSON.stringify(pkg);
    const checksum = crypto.createHash("sha256").update(payload).digest("hex");
    await this.repo.createExport(landId, "package", pkg, checksum, createdBy);
    return { format: "package", payload: pkg, checksum };
  }

  private async _collect(landId: number) {
    const [land, parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings] = await Promise.all([
      this.repo.get(landId),
      this.repo.listParcels(landId),
      this.repo.listBoundaries(landId),
      this.repo.listOwners(landId),
      this.repo.listZones(landId),
      this.repo.getTerrain(landId),
      this.repo.listUtilities(landId),
      this.repo.listRoads(landId),
      this.repo.listTeleports(landId),
      this.repo.listBuildings(landId),
    ]);
    return { land, parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings };
  }
}
