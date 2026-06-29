import { NationRepository } from "../repositories/nation-repository";

const nationRepository = new NationRepository();

export class NationImporter {
  async importNation(payload: Record<string, unknown>, importedBy: number) {
    const { nation, governments, ministries, laws, taxRules, elections, parties, borders, diplomaticRelations } = payload as any;

    if (!nation) throw new Error("Invalid nation export: missing nation");

    const { id: _id, createdAt, updatedAt, ...nationData } = nation;
    const created = await nationRepository.createNation({ ...nationData, createdBy: importedBy, isPublished: false });

    const errors: string[] = [];
    const importGroup = async (items: unknown[], fn: (data: Record<string, unknown>) => Promise<unknown>, label: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        try {
          const { id: _id2, createdAt: _c, updatedAt: _u, ...rest } = item as any;
          await fn({ ...rest, nationId: created.id });
        } catch (e: any) {
          errors.push(`${label}: ${e.message}`);
        }
      }
    };

    await importGroup(governments ?? [], d => nationRepository.createGovernment(d as any), "government");
    await importGroup(ministries ?? [], d => nationRepository.createMinistry(d as any), "ministry");
    await importGroup(laws ?? [], d => nationRepository.createLaw(d as any), "law");
    await importGroup(taxRules ?? [], d => nationRepository.createTaxRule(d as any), "taxRule");
    await importGroup(elections ?? [], d => nationRepository.createElection(d as any), "election");
    await importGroup(parties ?? [], d => nationRepository.createPoliticalParty(d as any), "politicalParty");
    await importGroup(borders ?? [], d => nationRepository.createBorder(d as any), "border");
    await importGroup(diplomaticRelations ?? [], d => nationRepository.createDiplomaticRelation(d as any), "diplomaticRelation");

    return { nationId: created.id, errors };
  }
}

export const nationImporter = new NationImporter();
