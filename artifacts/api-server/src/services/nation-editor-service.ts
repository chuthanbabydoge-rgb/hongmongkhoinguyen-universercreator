import { NationRepository } from "../repositories/nation-repository";
import crypto from "crypto";

const nationRepository = new NationRepository();

export class NationEditorService {
  async listNations(limit = 50, offset = 0) {
    return nationRepository.findAllNations(limit, offset);
  }

  async getNation(id: number) {
    const nation = await nationRepository.findNationById(id);
    if (!nation) throw new Error(`Nation ${id} not found`);
    return nation;
  }

  async searchNations(q: string) {
    return nationRepository.searchNations(q);
  }

  async createNation(data: Record<string, unknown>) {
    const nation = await nationRepository.createNation(data as any);
    await nationRepository.createNationHistory({ nationId: nation.id, action: "create", entityType: "nation", entityId: nation.id, performedBy: (data.createdBy as number) ?? 0 });
    return nation;
  }

  async updateNation(id: number, data: Record<string, unknown>) {
    const nation = await nationRepository.updateNation(id, data as any);
    if (!nation) throw new Error(`Nation ${id} not found`);
    await nationRepository.createNationHistory({ nationId: id, action: "update", entityType: "nation", entityId: id, performedBy: 0 });
    return nation;
  }

  async deleteNation(id: number) {
    await this.getNation(id);
    await nationRepository.deleteNation(id);
    return { deleted: true };
  }

  async duplicateNation(id: number, createdBy: number) {
    const copy = await nationRepository.duplicateNation(id, createdBy);
    if (copy) {
      await nationRepository.createNationHistory({ nationId: copy.id, action: "duplicate", entityType: "nation", entityId: copy.id, performedBy: createdBy });
    }
    return copy;
  }

  async publishNation(id: number) {
    const nation = await nationRepository.publishNation(id);
    await nationRepository.createNationHistory({ nationId: id, action: "publish", entityType: "nation", entityId: id, performedBy: 0 });
    return nation;
  }

  async archiveNation(id: number) {
    const nation = await nationRepository.archiveNation(id);
    await nationRepository.createNationHistory({ nationId: id, action: "archive", entityType: "nation", entityId: id, performedBy: 0 });
    return nation;
  }

  async restoreNation(id: number) {
    const nation = await nationRepository.updateNation(id, { isTemplate: true });
    await nationRepository.createNationHistory({ nationId: id, action: "restore", entityType: "nation", entityId: id, performedBy: 0 });
    return nation;
  }

  async saveVersion(nationId: number, createdBy: number, changelog?: string) {
    const nation = await this.getNation(nationId);
    const versions = await nationRepository.findVersionsByNation(nationId);
    const version = (versions[0]?.version ?? 0) + 1;
    return nationRepository.createNationVersion({ nationId, version, snapshot: nation as any, changelog: changelog ?? null, createdBy });
  }

  async getStats(nationId: number) {
    return nationRepository.findStatisticsByNation(nationId);
  }

  async recalculateStats(nationId: number) {
    const [governments, laws, taxRules, elections, parties, borders, diplomaticRelations] = await Promise.all([
      nationRepository.findGovernmentsByNation(nationId),
      nationRepository.findLawsByNation(nationId),
      nationRepository.findTaxRulesByNation(nationId),
      nationRepository.findElectionsByNation(nationId),
      nationRepository.findPoliticalPartiesByNation(nationId),
      nationRepository.findBordersByNation(nationId),
      nationRepository.findDiplomaticRelationsByNation(nationId),
    ]);
    const nation = await this.getNation(nationId);
    const stats = await nationRepository.findStatisticsByNation(nationId);
    if (stats) {
      return nationRepository.updateNationStatistics(nationId, {
        totalGovernments: governments.length,
        totalLaws: laws.length,
        totalPoliticalParties: parties.length,
        totalBorders: borders.length,
        totalDiplomaticRelations: diplomaticRelations.length,
        gdp: nation.gdp ?? 0,
        gdpPerCapita: nation.population && nation.population > 0 ? (nation.gdp ?? 0) / nation.population : 0,
      });
    }
    return nationRepository.createNationStatistics({
      nationId,
      totalGovernments: governments.length,
      totalLaws: laws.length,
      totalPoliticalParties: parties.length,
      totalBorders: borders.length,
      totalDiplomaticRelations: diplomaticRelations.length,
      gdp: nation.gdp ?? 0,
      gdpPerCapita: nation.population && nation.population > 0 ? (nation.gdp ?? 0) / nation.population : 0,
    });
  }

  // Governments
  async listGovernments(nationId: number) {
    return nationRepository.findGovernmentsByNation(nationId);
  }

  async getGovernment(id: number) {
    const government = await nationRepository.findGovernmentById(id);
    if (!government) throw new Error(`Government ${id} not found`);
    return government;
  }

  async createGovernment(nationId: number, data: Record<string, unknown>) {
    const government = await nationRepository.createGovernment({ ...data, nationId } as any);
    await nationRepository.createNationHistory({ nationId, action: "create_government", entityType: "government", entityId: government.id, performedBy: 0 });
    return government;
  }

  async updateGovernment(id: number, data: Record<string, unknown>) {
    const government = await nationRepository.updateGovernment(id, data as any);
    if (!government) throw new Error(`Government ${id} not found`);
    await nationRepository.createNationHistory({ nationId: government.nationId, action: "update_government", entityType: "government", entityId: id, performedBy: 0 });
    return government;
  }

  async deleteGovernment(id: number) {
    const government = await this.getGovernment(id);
    await nationRepository.deleteGovernment(id);
    await nationRepository.createNationHistory({ nationId: government.nationId, action: "delete_government", entityType: "government", entityId: id, performedBy: 0 });
    return { deleted: true };
  }

  // Ministries
  async listMinistries(nationId: number) {
    return nationRepository.findMinistriesByNation(nationId);
  }

  async getMinistry(id: number) {
    const ministry = await nationRepository.findMinistryById(id);
    if (!ministry) throw new Error(`Ministry ${id} not found`);
    return ministry;
  }

  async createMinistry(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createMinistry({ ...data, nationId } as any);
  }

  async updateMinistry(id: number, data: Record<string, unknown>) {
    const ministry = await nationRepository.updateMinistry(id, data as any);
    if (!ministry) throw new Error(`Ministry ${id} not found`);
    return ministry;
  }

  async deleteMinistry(id: number) {
    await this.getMinistry(id);
    await nationRepository.deleteMinistry(id);
    return { deleted: true };
  }

  // Laws
  async listLaws(nationId: number) {
    return nationRepository.findLawsByNation(nationId);
  }

  async getLaw(id: number) {
    const law = await nationRepository.findLawById(id);
    if (!law) throw new Error(`Law ${id} not found`);
    return law;
  }

  async createLaw(nationId: number, data: Record<string, unknown>) {
    const law = await nationRepository.createLaw({ ...data, nationId } as any);
    await nationRepository.createNationHistory({ nationId, action: "create_law", entityType: "law", entityId: law.id, performedBy: 0 });
    return law;
  }

  async updateLaw(id: number, data: Record<string, unknown>) {
    const law = await nationRepository.updateLaw(id, data as any);
    if (!law) throw new Error(`Law ${id} not found`);
    await nationRepository.createNationHistory({ nationId: law.nationId, action: "update_law", entityType: "law", entityId: id, performedBy: 0 });
    return law;
  }

  async deleteLaw(id: number) {
    const law = await this.getLaw(id);
    await nationRepository.deleteLaw(id);
    await nationRepository.createNationHistory({ nationId: law.nationId, action: "delete_law", entityType: "law", entityId: id, performedBy: 0 });
    return { deleted: true };
  }

  // Tax Rules
  async listTaxRules(nationId: number) {
    return nationRepository.findTaxRulesByNation(nationId);
  }

  async getTaxRule(id: number) {
    const taxRule = await nationRepository.findTaxRuleById(id);
    if (!taxRule) throw new Error(`Tax rule ${id} not found`);
    return taxRule;
  }

  async createTaxRule(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createTaxRule({ ...data, nationId } as any);
  }

  async updateTaxRule(id: number, data: Record<string, unknown>) {
    const taxRule = await nationRepository.updateTaxRule(id, data as any);
    if (!taxRule) throw new Error(`Tax rule ${id} not found`);
    return taxRule;
  }

  async deleteTaxRule(id: number) {
    await this.getTaxRule(id);
    await nationRepository.deleteTaxRule(id);
    return { deleted: true };
  }

  // Elections
  async listElections(nationId: number) {
    return nationRepository.findElectionsByNation(nationId);
  }

  async getElection(id: number) {
    const election = await nationRepository.findElectionById(id);
    if (!election) throw new Error(`Election ${id} not found`);
    return election;
  }

  async createElection(nationId: number, data: Record<string, unknown>) {
    const election = await nationRepository.createElection({ ...data, nationId } as any);
    await nationRepository.createNationHistory({ nationId, action: "create_election", entityType: "election", entityId: election.id, performedBy: 0 });
    return election;
  }

  async updateElection(id: number, data: Record<string, unknown>) {
    const election = await nationRepository.updateElection(id, data as any);
    if (!election) throw new Error(`Election ${id} not found`);
    await nationRepository.createNationHistory({ nationId: election.nationId, action: "update_election", entityType: "election", entityId: id, performedBy: 0 });
    return election;
  }

  async deleteElection(id: number) {
    const election = await this.getElection(id);
    await nationRepository.deleteElection(id);
    await nationRepository.createNationHistory({ nationId: election.nationId, action: "delete_election", entityType: "election", entityId: id, performedBy: 0 });
    return { deleted: true };
  }

  // Political Parties
  async listPoliticalParties(nationId: number) {
    return nationRepository.findPoliticalPartiesByNation(nationId);
  }

  async getPoliticalParty(id: number) {
    const party = await nationRepository.findPoliticalPartyById(id);
    if (!party) throw new Error(`Political party ${id} not found`);
    return party;
  }

  async createPoliticalParty(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createPoliticalParty({ ...data, nationId } as any);
  }

  async updatePoliticalParty(id: number, data: Record<string, unknown>) {
    const party = await nationRepository.updatePoliticalParty(id, data as any);
    if (!party) throw new Error(`Political party ${id} not found`);
    return party;
  }

  async deletePoliticalParty(id: number) {
    await this.getPoliticalParty(id);
    await nationRepository.deletePoliticalParty(id);
    return { deleted: true };
  }

  // Citizenships
  async listCitizenships(nationId: number) {
    return nationRepository.findCitizenshipsByNation(nationId);
  }

  async getCitizenship(id: number) {
    const citizenship = await nationRepository.findCitizenshipById(id);
    if (!citizenship) throw new Error(`Citizenship ${id} not found`);
    return citizenship;
  }

  async createCitizenship(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createCitizenship({ ...data, nationId } as any);
  }

  async updateCitizenship(id: number, data: Record<string, unknown>) {
    const citizenship = await nationRepository.updateCitizenship(id, data as any);
    if (!citizenship) throw new Error(`Citizenship ${id} not found`);
    return citizenship;
  }

  async deleteCitizenship(id: number) {
    await this.getCitizenship(id);
    await nationRepository.deleteCitizenship(id);
    return { deleted: true };
  }

  // Passports
  async listPassports(nationId: number) {
    return nationRepository.findPassportsByNation(nationId);
  }

  async getPassport(id: number) {
    const passport = await nationRepository.findPassportById(id);
    if (!passport) throw new Error(`Passport ${id} not found`);
    return passport;
  }

  async createPassport(nationId: number, data: Record<string, unknown>) {
    const passportNumber = data.passportNumber as string || this.generatePassportNumber();
    return nationRepository.createPassport({ ...data, nationId, passportNumber } as any);
  }

  async updatePassport(id: number, data: Record<string, unknown>) {
    const passport = await nationRepository.updatePassport(id, data as any);
    if (!passport) throw new Error(`Passport ${id} not found`);
    return passport;
  }

  async deletePassport(id: number) {
    await this.getPassport(id);
    await nationRepository.deletePassport(id);
    return { deleted: true };
  }

  private generatePassportNumber(): string {
    return crypto.randomBytes(9).toString("hex").toUpperCase();
  }

  // Visas
  async listVisas(nationId: number) {
    return nationRepository.findVisasByNation(nationId);
  }

  async getVisa(id: number) {
    const visa = await nationRepository.findVisaById(id);
    if (!visa) throw new Error(`Visa ${id} not found`);
    return visa;
  }

  async createVisa(nationId: number, data: Record<string, unknown>) {
    const visaNumber = data.visaNumber as string || this.generateVisaNumber();
    return nationRepository.createVisa({ ...data, nationId, visaNumber } as any);
  }

  async updateVisa(id: number, data: Record<string, unknown>) {
    const visa = await nationRepository.updateVisa(id, data as any);
    if (!visa) throw new Error(`Visa ${id} not found`);
    return visa;
  }

  async deleteVisa(id: number) {
    await this.getVisa(id);
    await nationRepository.deleteVisa(id);
    return { deleted: true };
  }

  private generateVisaNumber(): string {
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  // Borders
  async listBorders(nationId: number) {
    return nationRepository.findBordersByNation(nationId);
  }

  async getBorder(id: number) {
    const border = await nationRepository.findBorderById(id);
    if (!border) throw new Error(`Border ${id} not found`);
    return border;
  }

  async createBorder(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createBorder({ ...data, nationId } as any);
  }

  async updateBorder(id: number, data: Record<string, unknown>) {
    const border = await nationRepository.updateBorder(id, data as any);
    if (!border) throw new Error(`Border ${id} not found`);
    return border;
  }

  async deleteBorder(id: number) {
    await this.getBorder(id);
    await nationRepository.deleteBorder(id);
    return { deleted: true };
  }

  // Border Checkpoints
  async listBorderCheckpoints(nationId: number) {
    return nationRepository.findBorderCheckpointsByNation(nationId);
  }

  async getBorderCheckpoint(id: number) {
    const checkpoint = await nationRepository.findBorderCheckpointById(id);
    if (!checkpoint) throw new Error(`Border checkpoint ${id} not found`);
    return checkpoint;
  }

  async createBorderCheckpoint(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createBorderCheckpoint({ ...data, nationId } as any);
  }

  async updateBorderCheckpoint(id: number, data: Record<string, unknown>) {
    const checkpoint = await nationRepository.updateBorderCheckpoint(id, data as any);
    if (!checkpoint) throw new Error(`Border checkpoint ${id} not found`);
    return checkpoint;
  }

  async deleteBorderCheckpoint(id: number) {
    await this.getBorderCheckpoint(id);
    await nationRepository.deleteBorderCheckpoint(id);
    return { deleted: true };
  }

  // Diplomatic Relations
  async listDiplomaticRelations(nationId: number) {
    return nationRepository.findDiplomaticRelationsByNation(nationId);
  }

  async getDiplomaticRelation(id: number) {
    const relation = await nationRepository.findDiplomaticRelationById(id);
    if (!relation) throw new Error(`Diplomatic relation ${id} not found`);
    return relation;
  }

  async createDiplomaticRelation(nationId: number, data: Record<string, unknown>) {
    return nationRepository.createDiplomaticRelation({ ...data, nationId } as any);
  }

  async updateDiplomaticRelation(id: number, data: Record<string, unknown>) {
    const relation = await nationRepository.updateDiplomaticRelation(id, data as any);
    if (!relation) throw new Error(`Diplomatic relation ${id} not found`);
    return relation;
  }

  async deleteDiplomaticRelation(id: number) {
    await this.getDiplomaticRelation(id);
    await nationRepository.deleteDiplomaticRelation(id);
    return { deleted: true };
  }

  // Treaties
  async listTreaties(limit = 50, offset = 0) {
    return nationRepository.findAllTreaties(limit, offset);
  }

  async getTreaty(id: number) {
    const treaty = await nationRepository.findTreatyById(id);
    if (!treaty) throw new Error(`Treaty ${id} not found`);
    return treaty;
  }

  async createTreaty(data: Record<string, unknown>) {
    return nationRepository.createTreaty(data as any);
  }

  async updateTreaty(id: number, data: Record<string, unknown>) {
    const treaty = await nationRepository.updateTreaty(id, data as any);
    if (!treaty) throw new Error(`Treaty ${id} not found`);
    return treaty;
  }

  async deleteTreaty(id: number) {
    await this.getTreaty(id);
    await nationRepository.deleteTreaty(id);
    return { deleted: true };
  }

  // Templates
  async listTemplates(limit = 50, offset = 0) {
    return nationRepository.findAllNationTemplates(limit, offset);
  }

  async getTemplate(id: number) {
    const template = await nationRepository.findNationTemplateById(id);
    if (!template) throw new Error(`Template ${id} not found`);
    return template;
  }

  async createTemplate(data: Record<string, unknown>) {
    return nationRepository.createNationTemplate(data as any);
  }

  async updateTemplate(id: number, data: Record<string, unknown>) {
    const template = await nationRepository.updateNationTemplate(id, data as any);
    if (!template) throw new Error(`Template ${id} not found`);
    return template;
  }

  async deleteTemplate(id: number) {
    await this.getTemplate(id);
    await nationRepository.deleteNationTemplate(id);
    return { deleted: true };
  }

  // History
  async getHistory(nationId: number, limit = 50, offset = 0) {
    return nationRepository.findHistoryByNation(nationId, limit, offset);
  }

  // Runtime
  async getRuntime(nationId: number) {
    return nationRepository.findRuntimeByNation(nationId);
  }

  async updateRuntime(nationId: number, data: Record<string, unknown>) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    if (runtime) {
      return nationRepository.updateNationRuntime(nationId, data as any);
    }
    return nationRepository.createNationRuntime({ nationId, ...data } as any);
  }
}

export const nationEditorService = new NationEditorService();
