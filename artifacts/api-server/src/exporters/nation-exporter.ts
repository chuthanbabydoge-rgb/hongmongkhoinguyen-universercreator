import crypto from "crypto";
import { NationRepository } from "../repositories/nation-repository";

const nationRepository = new NationRepository();

export class NationExporter {
  async exportNation(nationId: number, format: "json" | "template" | "package" = "json", exportedBy: number) {
    const [nation, governments, ministries, laws, taxRules, elections, parties, borders, diplomaticRelations] = await Promise.all([
      nationRepository.findNationById(nationId),
      nationRepository.findGovernmentsByNation(nationId),
      nationRepository.findMinistriesByNation(nationId),
      nationRepository.findLawsByNation(nationId),
      nationRepository.findTaxRulesByNation(nationId),
      nationRepository.findElectionsByNation(nationId),
      nationRepository.findPoliticalPartiesByNation(nationId),
      nationRepository.findBordersByNation(nationId),
      nationRepository.findDiplomaticRelationsByNation(nationId),
    ]);
    if (!nation) throw new Error(`Nation ${nationId} not found`);

    const payload = {
      exportVersion: "1.0.0",
      format,
      exportedAt: new Date().toISOString(),
      nation,
      governments,
      ministries,
      laws,
      taxRules,
      elections,
      parties,
      borders,
      diplomaticRelations,
    };

    const json = JSON.stringify(payload);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    const record = await nationRepository.createNationExport({ nationId, format, payload: payload as any, checksum, exportedBy });
    return { ...record, data: payload };
  }
}

export const nationExporter = new NationExporter();
