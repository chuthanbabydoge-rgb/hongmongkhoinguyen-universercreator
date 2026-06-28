import crypto from "crypto";
import { BossRepository } from "../repositories/boss-repository";

export class BossExporter {
  private repo = new BossRepository();

  async exportJson(bossId: number, exportedBy: number) {
    const boss = await this.repo.getFull(bossId);
    if (!boss) throw new Error("Boss not found");
    const payload = { type: "boss_json", version: 1, exportedAt: new Date().toISOString(), data: boss };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.createExport({ bossId, exportType: "json", payload, checksum, exportedBy });
    return { payload, checksum };
  }

  async exportTemplate(bossId: number, name: string, description: string, createdBy: number) {
    const boss = await this.repo.getFull(bossId);
    if (!boss) throw new Error("Boss not found");
    const payload = { type: "boss_template", version: 1, exportedAt: new Date().toISOString(), data: boss };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.createExport({ bossId, exportType: "template", payload, checksum, exportedBy: createdBy });
    const template = await this.repo.createTemplate({ bossId, name, description, payload, isPublic: false, createdBy });
    return { template, checksum };
  }

  async exportPackage(bossId: number, exportedBy: number) {
    const boss = await this.repo.getFull(bossId);
    if (!boss) throw new Error("Boss not found");
    const stats = await this.repo.getStatistics(bossId);
    const versions = await this.repo.listVersions(bossId);
    const payload = {
      type: "boss_package",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: boss,
      statistics: stats,
      versions,
    };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await this.repo.createExport({ bossId, exportType: "package", payload, checksum, exportedBy });
    return { payload, checksum };
  }
}
