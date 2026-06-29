import { db } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import {
  creatorNationsTable,
  creatorGovernmentsTable,
  creatorMinistriesTable,
  creatorLawsTable,
  creatorTaxRulesTable,
  creatorElectionsTable,
  creatorPoliticalPartiesTable,
  creatorCitizenshipsTable,
  creatorPassportsTable,
  creatorVisasTable,
  creatorBordersTable,
  creatorBorderCheckpointsTable,
  creatorDiplomaticRelationsTable,
  creatorTreatiesTable,
  creatorNationTemplatesTable,
  creatorNationVersionsTable,
  creatorNationHistoryTable,
  creatorNationStatisticsTable,
  creatorNationExportsTable,
  creatorNationRuntimeTable,
} from "@workspace/db/schema";

export class NationRepository {
  // Nations
  async findAllNations(limit = 50, offset = 0) {
    return db.select().from(creatorNationsTable).orderBy(desc(creatorNationsTable.createdAt)).limit(limit).offset(offset);
  }
  async findNationById(id: number) {
    const rows = await db.select().from(creatorNationsTable).where(eq(creatorNationsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async searchNations(q: string) {
    return db.select().from(creatorNationsTable).where(like(creatorNationsTable.name, `%${q}%`)).limit(20);
  }
  async createNation(data: typeof creatorNationsTable.$inferInsert) {
    const rows = await db.insert(creatorNationsTable).values(data).returning();
    return rows[0];
  }
  async updateNation(id: number, data: Partial<typeof creatorNationsTable.$inferInsert>) {
    const rows = await db.update(creatorNationsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorNationsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteNation(id: number) {
    await db.delete(creatorNationsTable).where(eq(creatorNationsTable.id, id));
    return true;
  }
  async publishNation(id: number) {
    return this.updateNation(id, { isPublished: true });
  }
  async archiveNation(id: number) {
    return this.updateNation(id, { isTemplate: false });
  }
  async duplicateNation(id: number, createdBy: number) {
    const original = await this.findNationById(id);
    if (!original) return null;
    const { id: _, createdAt, updatedAt, ...data } = original;
    return this.createNation({ ...data, name: `${data.name} (Copy)`, createdBy, isPublished: false });
  }

  // Governments
  async findGovernmentsByNation(nationId: number) {
    return db.select().from(creatorGovernmentsTable).where(eq(creatorGovernmentsTable.nationId, nationId));
  }
  async findGovernmentById(id: number) {
    const rows = await db.select().from(creatorGovernmentsTable).where(eq(creatorGovernmentsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createGovernment(data: typeof creatorGovernmentsTable.$inferInsert) {
    const rows = await db.insert(creatorGovernmentsTable).values(data).returning();
    return rows[0];
  }
  async updateGovernment(id: number, data: Partial<typeof creatorGovernmentsTable.$inferInsert>) {
    const rows = await db.update(creatorGovernmentsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorGovernmentsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteGovernment(id: number) {
    await db.delete(creatorGovernmentsTable).where(eq(creatorGovernmentsTable.id, id));
    return true;
  }

  // Ministries
  async findMinistriesByNation(nationId: number) {
    return db.select().from(creatorMinistriesTable).where(eq(creatorMinistriesTable.nationId, nationId));
  }
  async findMinistryById(id: number) {
    const rows = await db.select().from(creatorMinistriesTable).where(eq(creatorMinistriesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createMinistry(data: typeof creatorMinistriesTable.$inferInsert) {
    const rows = await db.insert(creatorMinistriesTable).values(data).returning();
    return rows[0];
  }
  async updateMinistry(id: number, data: Partial<typeof creatorMinistriesTable.$inferInsert>) {
    const rows = await db.update(creatorMinistriesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorMinistriesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteMinistry(id: number) {
    await db.delete(creatorMinistriesTable).where(eq(creatorMinistriesTable.id, id));
    return true;
  }

  // Laws
  async findLawsByNation(nationId: number) {
    return db.select().from(creatorLawsTable).where(eq(creatorLawsTable.nationId, nationId));
  }
  async findLawById(id: number) {
    const rows = await db.select().from(creatorLawsTable).where(eq(creatorLawsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createLaw(data: typeof creatorLawsTable.$inferInsert) {
    const rows = await db.insert(creatorLawsTable).values(data).returning();
    return rows[0];
  }
  async updateLaw(id: number, data: Partial<typeof creatorLawsTable.$inferInsert>) {
    const rows = await db.update(creatorLawsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLawsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteLaw(id: number) {
    await db.delete(creatorLawsTable).where(eq(creatorLawsTable.id, id));
    return true;
  }

  // Tax Rules
  async findTaxRulesByNation(nationId: number) {
    return db.select().from(creatorTaxRulesTable).where(eq(creatorTaxRulesTable.nationId, nationId));
  }
  async findTaxRuleById(id: number) {
    const rows = await db.select().from(creatorTaxRulesTable).where(eq(creatorTaxRulesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createTaxRule(data: typeof creatorTaxRulesTable.$inferInsert) {
    const rows = await db.insert(creatorTaxRulesTable).values(data).returning();
    return rows[0];
  }
  async updateTaxRule(id: number, data: Partial<typeof creatorTaxRulesTable.$inferInsert>) {
    const rows = await db.update(creatorTaxRulesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTaxRulesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteTaxRule(id: number) {
    await db.delete(creatorTaxRulesTable).where(eq(creatorTaxRulesTable.id, id));
    return true;
  }

  // Elections
  async findElectionsByNation(nationId: number) {
    return db.select().from(creatorElectionsTable).where(eq(creatorElectionsTable.nationId, nationId));
  }
  async findElectionById(id: number) {
    const rows = await db.select().from(creatorElectionsTable).where(eq(creatorElectionsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createElection(data: typeof creatorElectionsTable.$inferInsert) {
    const rows = await db.insert(creatorElectionsTable).values(data).returning();
    return rows[0];
  }
  async updateElection(id: number, data: Partial<typeof creatorElectionsTable.$inferInsert>) {
    const rows = await db.update(creatorElectionsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorElectionsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteElection(id: number) {
    await db.delete(creatorElectionsTable).where(eq(creatorElectionsTable.id, id));
    return true;
  }

  // Political Parties
  async findPoliticalPartiesByNation(nationId: number) {
    return db.select().from(creatorPoliticalPartiesTable).where(eq(creatorPoliticalPartiesTable.nationId, nationId));
  }
  async findPoliticalPartyById(id: number) {
    const rows = await db.select().from(creatorPoliticalPartiesTable).where(eq(creatorPoliticalPartiesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createPoliticalParty(data: typeof creatorPoliticalPartiesTable.$inferInsert) {
    const rows = await db.insert(creatorPoliticalPartiesTable).values(data).returning();
    return rows[0];
  }
  async updatePoliticalParty(id: number, data: Partial<typeof creatorPoliticalPartiesTable.$inferInsert>) {
    const rows = await db.update(creatorPoliticalPartiesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorPoliticalPartiesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deletePoliticalParty(id: number) {
    await db.delete(creatorPoliticalPartiesTable).where(eq(creatorPoliticalPartiesTable.id, id));
    return true;
  }

  // Citizenships
  async findCitizenshipsByNation(nationId: number) {
    return db.select().from(creatorCitizenshipsTable).where(eq(creatorCitizenshipsTable.nationId, nationId));
  }
  async findCitizenshipById(id: number) {
    const rows = await db.select().from(creatorCitizenshipsTable).where(eq(creatorCitizenshipsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createCitizenship(data: typeof creatorCitizenshipsTable.$inferInsert) {
    const rows = await db.insert(creatorCitizenshipsTable).values(data).returning();
    return rows[0];
  }
  async updateCitizenship(id: number, data: Partial<typeof creatorCitizenshipsTable.$inferInsert>) {
    const rows = await db.update(creatorCitizenshipsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorCitizenshipsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteCitizenship(id: number) {
    await db.delete(creatorCitizenshipsTable).where(eq(creatorCitizenshipsTable.id, id));
    return true;
  }

  // Passports
  async findPassportsByNation(nationId: number) {
    return db.select().from(creatorPassportsTable).where(eq(creatorPassportsTable.nationId, nationId));
  }
  async findPassportById(id: number) {
    const rows = await db.select().from(creatorPassportsTable).where(eq(creatorPassportsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async findPassportByNumber(passportNumber: string) {
    const rows = await db.select().from(creatorPassportsTable).where(eq(creatorPassportsTable.passportNumber, passportNumber)).limit(1);
    return rows[0] ?? null;
  }
  async createPassport(data: typeof creatorPassportsTable.$inferInsert) {
    const rows = await db.insert(creatorPassportsTable).values(data).returning();
    return rows[0];
  }
  async updatePassport(id: number, data: Partial<typeof creatorPassportsTable.$inferInsert>) {
    const rows = await db.update(creatorPassportsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorPassportsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deletePassport(id: number) {
    await db.delete(creatorPassportsTable).where(eq(creatorPassportsTable.id, id));
    return true;
  }

  // Visas
  async findVisasByNation(nationId: number) {
    return db.select().from(creatorVisasTable).where(eq(creatorVisasTable.nationId, nationId));
  }
  async findVisaById(id: number) {
    const rows = await db.select().from(creatorVisasTable).where(eq(creatorVisasTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async findVisasByPassport(passportId: number) {
    return db.select().from(creatorVisasTable).where(eq(creatorVisasTable.passportId, passportId));
  }
  async createVisa(data: typeof creatorVisasTable.$inferInsert) {
    const rows = await db.insert(creatorVisasTable).values(data).returning();
    return rows[0];
  }
  async updateVisa(id: number, data: Partial<typeof creatorVisasTable.$inferInsert>) {
    const rows = await db.update(creatorVisasTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorVisasTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteVisa(id: number) {
    await db.delete(creatorVisasTable).where(eq(creatorVisasTable.id, id));
    return true;
  }

  // Borders
  async findBordersByNation(nationId: number) {
    return db.select().from(creatorBordersTable).where(eq(creatorBordersTable.nationId, nationId));
  }
  async findBorderById(id: number) {
    const rows = await db.select().from(creatorBordersTable).where(eq(creatorBordersTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createBorder(data: typeof creatorBordersTable.$inferInsert) {
    const rows = await db.insert(creatorBordersTable).values(data).returning();
    return rows[0];
  }
  async updateBorder(id: number, data: Partial<typeof creatorBordersTable.$inferInsert>) {
    const rows = await db.update(creatorBordersTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBordersTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteBorder(id: number) {
    await db.delete(creatorBordersTable).where(eq(creatorBordersTable.id, id));
    return true;
  }

  // Border Checkpoints
  async findBorderCheckpointsByNation(nationId: number) {
    return db.select().from(creatorBorderCheckpointsTable).where(eq(creatorBorderCheckpointsTable.nationId, nationId));
  }
  async findBorderCheckpointById(id: number) {
    const rows = await db.select().from(creatorBorderCheckpointsTable).where(eq(creatorBorderCheckpointsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createBorderCheckpoint(data: typeof creatorBorderCheckpointsTable.$inferInsert) {
    const rows = await db.insert(creatorBorderCheckpointsTable).values(data).returning();
    return rows[0];
  }
  async updateBorderCheckpoint(id: number, data: Partial<typeof creatorBorderCheckpointsTable.$inferInsert>) {
    const rows = await db.update(creatorBorderCheckpointsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBorderCheckpointsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteBorderCheckpoint(id: number) {
    await db.delete(creatorBorderCheckpointsTable).where(eq(creatorBorderCheckpointsTable.id, id));
    return true;
  }

  // Diplomatic Relations
  async findDiplomaticRelationsByNation(nationId: number) {
    return db.select().from(creatorDiplomaticRelationsTable).where(eq(creatorDiplomaticRelationsTable.nationId, nationId));
  }
  async findDiplomaticRelationById(id: number) {
    const rows = await db.select().from(creatorDiplomaticRelationsTable).where(eq(creatorDiplomaticRelationsTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async findDiplomaticRelationBetween(nationId: number, targetNationId: number) {
    const rows = await db.select().from(creatorDiplomaticRelationsTable)
      .where(and(eq(creatorDiplomaticRelationsTable.nationId, nationId), eq(creatorDiplomaticRelationsTable.targetNationId, targetNationId)))
      .limit(1);
    return rows[0] ?? null;
  }
  async createDiplomaticRelation(data: typeof creatorDiplomaticRelationsTable.$inferInsert) {
    const rows = await db.insert(creatorDiplomaticRelationsTable).values(data).returning();
    return rows[0];
  }
  async updateDiplomaticRelation(id: number, data: Partial<typeof creatorDiplomaticRelationsTable.$inferInsert>) {
    const rows = await db.update(creatorDiplomaticRelationsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorDiplomaticRelationsTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteDiplomaticRelation(id: number) {
    await db.delete(creatorDiplomaticRelationsTable).where(eq(creatorDiplomaticRelationsTable.id, id));
    return true;
  }

  // Treaties
  async findAllTreaties(limit = 50, offset = 0) {
    return db.select().from(creatorTreatiesTable).orderBy(desc(creatorTreatiesTable.createdAt)).limit(limit).offset(offset);
  }
  async findTreatyById(id: number) {
    const rows = await db.select().from(creatorTreatiesTable).where(eq(creatorTreatiesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createTreaty(data: typeof creatorTreatiesTable.$inferInsert) {
    const rows = await db.insert(creatorTreatiesTable).values(data).returning();
    return rows[0];
  }
  async updateTreaty(id: number, data: Partial<typeof creatorTreatiesTable.$inferInsert>) {
    const rows = await db.update(creatorTreatiesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTreatiesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteTreaty(id: number) {
    await db.delete(creatorTreatiesTable).where(eq(creatorTreatiesTable.id, id));
    return true;
  }

  // Templates
  async findAllNationTemplates(limit = 50, offset = 0) {
    return db.select().from(creatorNationTemplatesTable).orderBy(desc(creatorNationTemplatesTable.createdAt)).limit(limit).offset(offset);
  }
  async findNationTemplateById(id: number) {
    const rows = await db.select().from(creatorNationTemplatesTable).where(eq(creatorNationTemplatesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }
  async createNationTemplate(data: typeof creatorNationTemplatesTable.$inferInsert) {
    const rows = await db.insert(creatorNationTemplatesTable).values(data).returning();
    return rows[0];
  }
  async updateNationTemplate(id: number, data: Partial<typeof creatorNationTemplatesTable.$inferInsert>) {
    const rows = await db.update(creatorNationTemplatesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorNationTemplatesTable.id, id)).returning();
    return rows[0] ?? null;
  }
  async deleteNationTemplate(id: number) {
    await db.delete(creatorNationTemplatesTable).where(eq(creatorNationTemplatesTable.id, id));
    return true;
  }

  // Versions
  async findVersionsByNation(nationId: number) {
    return db.select().from(creatorNationVersionsTable).where(eq(creatorNationVersionsTable.nationId, nationId)).orderBy(desc(creatorNationVersionsTable.version));
  }
  async createNationVersion(data: typeof creatorNationVersionsTable.$inferInsert) {
    const rows = await db.insert(creatorNationVersionsTable).values(data).returning();
    return rows[0];
  }

  // History
  async findHistoryByNation(nationId: number, limit = 50, offset = 0) {
    return db.select().from(creatorNationHistoryTable)
      .where(eq(creatorNationHistoryTable.nationId, nationId))
      .orderBy(desc(creatorNationHistoryTable.createdAt))
      .limit(limit)
      .offset(offset);
  }
  async createNationHistory(data: typeof creatorNationHistoryTable.$inferInsert) {
    const rows = await db.insert(creatorNationHistoryTable).values(data).returning();
    return rows[0];
  }

  // Statistics
  async findStatisticsByNation(nationId: number) {
    const rows = await db.select().from(creatorNationStatisticsTable).where(eq(creatorNationStatisticsTable.nationId, nationId)).limit(1);
    return rows[0] ?? null;
  }
  async createNationStatistics(data: typeof creatorNationStatisticsTable.$inferInsert) {
    const rows = await db.insert(creatorNationStatisticsTable).values(data).returning();
    return rows[0];
  }
  async updateNationStatistics(nationId: number, data: Partial<typeof creatorNationStatisticsTable.$inferInsert>) {
    const rows = await db.update(creatorNationStatisticsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorNationStatisticsTable.nationId, nationId)).returning();
    return rows[0] ?? null;
  }

  // Exports
  async findExportsByNation(nationId: number) {
    return db.select().from(creatorNationExportsTable).where(eq(creatorNationExportsTable.nationId, nationId)).orderBy(desc(creatorNationExportsTable.createdAt));
  }
  async createNationExport(data: typeof creatorNationExportsTable.$inferInsert) {
    const rows = await db.insert(creatorNationExportsTable).values(data).returning();
    return rows[0];
  }

  // Runtime
  async findRuntimeByNation(nationId: number) {
    const rows = await db.select().from(creatorNationRuntimeTable).where(eq(creatorNationRuntimeTable.nationId, nationId)).limit(1);
    return rows[0] ?? null;
  }
  async createNationRuntime(data: typeof creatorNationRuntimeTable.$inferInsert) {
    const rows = await db.insert(creatorNationRuntimeTable).values(data).returning();
    return rows[0];
  }
  async updateNationRuntime(nationId: number, data: Partial<typeof creatorNationRuntimeTable.$inferInsert>) {
    const rows = await db.update(creatorNationRuntimeTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorNationRuntimeTable.nationId, nationId)).returning();
    return rows[0] ?? null;
  }
}
