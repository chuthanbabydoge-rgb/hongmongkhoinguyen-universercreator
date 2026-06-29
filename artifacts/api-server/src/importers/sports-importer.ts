import { sportsRepository } from "../repositories/sports-repository";

export class SportsImporter {
  async importLeague(payload: Record<string, unknown>, importedBy: string) {
    const { league, clubs, seasons, teams, players, coaches, stadiums, matches, rankings, training, transfers, awards } = payload as any;

    if (!league) throw new Error("Invalid league export: missing league");

    const { id: _id, createdAt, updatedAt, ...leagueData } = league;
    const created = await sportsRepository.createLeague({ ...leagueData, createdBy: importedBy, isPublished: false });

    const errors: string[] = [];
    const importGroup = async (items: unknown[], fn: (data: Record<string, unknown>) => Promise<unknown>, label: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        try {
          const { id: _id2, createdAt: _c, updatedAt: _u, ...rest } = item as any;
          await fn({ ...rest, leagueId: created.id });
        } catch (e: any) {
          errors.push(`${label}: ${e.message}`);
        }
      }
    };

    await importGroup(seasons ?? [], d => sportsRepository.createSeason(d as any), "season");
    await importGroup(clubs ?? [], d => sportsRepository.createClub(d as any), "club");
    await importGroup(stadiums ?? [], d => sportsRepository.createStadium(d as any), "stadium");
    await importGroup(teams ?? [], d => sportsRepository.createTeam(d as any), "team");
    await importGroup(players ?? [], d => sportsRepository.createPlayer(d as any), "player");
    await importGroup(coaches ?? [], d => sportsRepository.createCoach(d as any), "coach");
    await importGroup(matches ?? [], d => sportsRepository.createMatch(d as any), "match");
    await importGroup(rankings ?? [], d => sportsRepository.createRanking(d as any), "ranking");
    await importGroup(training ?? [], d => sportsRepository.createTraining(d as any), "training");
    await importGroup(transfers ?? [], d => sportsRepository.createTransfer(d as any), "transfer");
    await importGroup(awards ?? [], d => sportsRepository.createAward(d as any), "award");

    return { leagueId: created.id, errors };
  }
}

export const sportsImporter = new SportsImporter();
