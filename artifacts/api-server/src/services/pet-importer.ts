import type { DrizzlePetRepository } from "../repositories/pet-repository";

export class PetImporter {
  constructor(private repo: DrizzlePetRepository) {}

  async importJson(petId: number, payload: Record<string, unknown>, importedBy: number) {
    await this.repo.addImport({ petId, source: "json", payload, status: "success", importedBy });
    return { success: true, petId };
  }

  async importTemplate(petId: number, payload: Record<string, unknown>, importedBy: number) {
    await this.repo.addImport({ petId, source: "template", payload, status: "success", importedBy });
    return { success: true, petId };
  }

  async importPackage(petId: number, payload: Record<string, unknown>, importedBy: number) {
    try {
      await this.repo.addImport({ petId, source: "package", payload, status: "success", importedBy });
      return { success: true, petId };
    } catch (err) {
      await this.repo.addImport({ petId, source: "package", payload, status: "failed", error: String(err), importedBy });
      throw err;
    }
  }
}
