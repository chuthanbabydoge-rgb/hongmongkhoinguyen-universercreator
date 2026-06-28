import { createHash } from "crypto";
import type { DrizzlePetRepository } from "../repositories/pet-repository";

export class PetExporter {
  constructor(private repo: DrizzlePetRepository) {}

  async exportJson(petId: number, exportedBy: number) {
    const full = await this.repo.getFullPet(petId);
    if (!full) throw new Error("Pet not found");
    const payload = { format: "json", version: 1, exportedAt: new Date().toISOString(), ...full };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.addExport({ petId, format: "json", payload, checksum, exportedBy } as any);
    return { payload, checksum };
  }

  async exportTemplate(petId: number, exportedBy: number) {
    const full = await this.repo.getFullPet(petId);
    if (!full) throw new Error("Pet not found");
    const payload = { format: "template", version: 1, exportedAt: new Date().toISOString(), ...full };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.addExport({ petId, format: "template", payload, checksum, exportedBy } as any);
    return { payload, checksum };
  }

  async exportPackage(petId: number, exportedBy: number) {
    const full = await this.repo.getFullPet(petId);
    if (!full) throw new Error("Pet not found");
    const versions = await this.repo.getVersions(petId);
    const history = await this.repo.getHistory(petId);
    const payload = { format: "package", version: 1, exportedAt: new Date().toISOString(), ...full, versions, history };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.addExport({ petId, format: "package", payload, checksum, exportedBy } as any);
    return { payload, checksum };
  }
}
