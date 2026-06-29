import { NationRepository } from "../repositories/nation-repository";

const nationRepository = new NationRepository();

export class NationRuntimeBridge {
  async getNationState(nationId: number) {
    const [runtime, nation, governments, laws, borders, diplomaticRelations] = await Promise.all([
      nationRepository.findRuntimeByNation(nationId),
      nationRepository.findNationById(nationId),
      nationRepository.findGovernmentsByNation(nationId),
      nationRepository.findLawsByNation(nationId),
      nationRepository.findBordersByNation(nationId),
      nationRepository.findDiplomaticRelationsByNation(nationId),
    ]);
    return { runtime, nation, summary: { governments: governments.length, laws: laws.length, borders: borders.length, diplomaticRelations: diplomaticRelations.length } };
  }

  async startSimulation(nationId: number) {
    return nationRepository.updateNationRuntime(nationId, { isSimulating: true });
  }

  async stopSimulation(nationId: number) {
    return nationRepository.updateNationRuntime(nationId, { isSimulating: false });
  }

  async simulateGovernment(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const governments = await nationRepository.findGovernmentsByNation(nationId);
    const avgStability = governments.reduce((sum, g) => sum + (g.stability ?? 0), 0) / Math.max(governments.length, 1);
    return nationRepository.updateNationRuntime(nationId, { governmentStability: avgStability });
  }

  async simulateElection(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const elections = await nationRepository.findElectionsByNation(nationId);
    const cycleProgress = ((runtime?.electionCycleProgress ?? 0) + 0.01) % 1;
    return nationRepository.updateNationRuntime(nationId, { electionCycleProgress: cycleProgress });
  }

  async simulateTaxCollection(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const taxRules = await nationRepository.findTaxRulesByNation(nationId);
    const collectionRate = taxRules.reduce((sum, t) => sum + (t.rate ?? 0), 0) / Math.max(taxRules.length, 1);
    return nationRepository.updateNationRuntime(nationId, { taxCollectionRate: collectionRate });
  }

  async simulateCitizenship(nationId: number) {
    const citizenships = await nationRepository.findCitizenshipsByNation(nationId);
    return { nationId, citizenshipCount: citizenships.length, status: "citizenship_simulated" };
  }

  async simulatePassport(nationId: number) {
    const passports = await nationRepository.findPassportsByNation(nationId);
    return { nationId, passportCount: passports.length, status: "passport_simulated" };
  }

  async simulateVisa(nationId: number) {
    const visas = await nationRepository.findVisasByNation(nationId);
    return { nationId, visaCount: visas.length, status: "visa_simulated" };
  }

  async simulateBorder(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const borders = await nationRepository.findBordersByNation(nationId);
    const securityLevel = borders.filter(b => b.isControlled).length / Math.max(borders.length, 1) * 100;
    return nationRepository.updateNationRuntime(nationId, { borderSecurityLevel: securityLevel });
  }

  async simulateDiplomacy(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const relations = await nationRepository.findDiplomaticRelationsByNation(nationId);
    const avgTension = relations.reduce((sum, r) => sum + (r.tensionLevel ?? 0), 0) / Math.max(relations.length, 1);
    return nationRepository.updateNationRuntime(nationId, { diplomaticTension: avgTension });
  }

  async simulateTreaty(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const treaties = await nationRepository.findAllTreaties();
    const activeTreaties = treaties.filter(t => t.status === "active" && (t.signatories as number[])?.includes(nationId));
    return nationRepository.updateNationRuntime(nationId, { activeTreaties: activeTreaties.length });
  }

  async simulateEconomy(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const nation = await nationRepository.findNationById(nationId);
    const economyHealth = (runtime?.economyHealth ?? 50) + (Math.random() - 0.5) * 5;
    return nationRepository.updateNationRuntime(nationId, { economyHealth: Math.max(0, Math.min(100, economyHealth)) });
  }

  async simulateMigration(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const migrationRate = (Math.random() - 0.5) * 10;
    return nationRepository.updateNationRuntime(nationId, { migrationRate });
  }

  async simulationTick(nationId: number) {
    const runtime = await nationRepository.findRuntimeByNation(nationId);
    const tick = (runtime?.simulationTick ?? 0) + 1;
    await Promise.all([
      this.simulateGovernment(nationId),
      this.simulateElection(nationId),
      this.simulateTaxCollection(nationId),
      this.simulateBorder(nationId),
      this.simulateDiplomacy(nationId),
      this.simulateEconomy(nationId),
      this.simulateMigration(nationId),
    ]);
    return nationRepository.updateNationRuntime(nationId, { simulationTick: tick });
  }
}

export const nationRuntimeBridge = new NationRuntimeBridge();
