import crypto from "crypto";
import type { CityRepository } from "../repositories/city-repository";

export class CityExporter {
  async toJson(city: Record<string, unknown>, repo: CityRepository, cityId: number, exportedBy: number) {
    const payload = { ...city, exportedAt: new Date().toISOString(), format: "json", version: "1.0" };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await repo.createExport({ cityId, exportType: "json", payload: payload as Record<string, unknown>, checksum, exportedBy });
    return { payload, checksum };
  }

  async toTemplate(city: Record<string, unknown>, name: string, description: string, repo: CityRepository, cityId: number, exportedBy: number) {
    const { id: _, createdAt, updatedAt, ...rest } = city;
    const payload = { ...rest, templateName: name, templateDescription: description, format: "template", version: "1.0" };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await repo.createTemplate({ cityId, name, description, payload: payload as Record<string, unknown>, isPublic: false, createdBy: exportedBy });
    await repo.createExport({ cityId, exportType: "template", payload: payload as Record<string, unknown>, checksum, exportedBy });
    return { payload, checksum };
  }

  async toPackage(city: Record<string, unknown>, repo: CityRepository, cityId: number, exportedBy: number) {
    const payload = {
      ...city,
      package: {
        name: city.name,
        version: city.version,
        exportedAt: new Date().toISOString(),
        format: "package",
        schemaVersion: "1.0",
      },
    };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await repo.createExport({ cityId, exportType: "package", payload: payload as Record<string, unknown>, checksum, exportedBy });
    return { payload, checksum };
  }
}
