import { db } from "@workspace/db";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";
import {
  creatorSports,
  creatorLeagues,
  creatorSeasons,
  creatorClubs,
  creatorTeams,
  creatorPlayers,
  creatorCoaches,
  creatorStadiums,
  creatorMatches,
  creatorMatchEvents,
  creatorRankings,
  creatorTraining,
  creatorTransfers,
  creatorAwards,
  creatorSportsTemplates,
  creatorSportsVersions,
  creatorSportsHistory,
  creatorSportsStatistics,
  creatorSportsExports,
  creatorSportsRuntime,
} from "@workspace/db";

export class SportsRepository {
  // Sports
  async findSportById(id: string) {
    const [sport] = await db.select().from(creatorSports).where(eq(creatorSports.id, id));
    return sport;
  }

  async findAllSports(limit = 50, offset = 0) {
    return db.select().from(creatorSports).limit(limit).offset(offset).orderBy(desc(creatorSports.createdAt));
  }

  async searchSports(query: string) {
    return db.select().from(creatorSports).where(
      sql`${creatorSports.name} ILIKE ${`%${query}%`}`
    ).limit(20);
  }

  async createSport(data: typeof creatorSports.$inferInsert) {
    const [sport] = await db.insert(creatorSports).values(data).returning();
    return sport;
  }

  async updateSport(id: string, data: Partial<typeof creatorSports.$inferInsert>) {
    const [sport] = await db.update(creatorSports).set({ ...data, updatedAt: new Date() }).where(eq(creatorSports.id, id)).returning();
    return sport;
  }

  async deleteSport(id: string) {
    await db.delete(creatorSports).where(eq(creatorSports.id, id));
  }

  // Leagues
  async findLeagueById(id: string) {
    const [league] = await db.select().from(creatorLeagues).where(eq(creatorLeagues.id, id));
    return league;
  }

  async findLeaguesBySport(sportId: string) {
    return db.select().from(creatorLeagues).where(eq(creatorLeagues.sportId, sportId));
  }

  async findAllLeagues(limit = 50, offset = 0) {
    return db.select().from(creatorLeagues).limit(limit).offset(offset).orderBy(desc(creatorLeagues.createdAt));
  }

  async createLeague(data: typeof creatorLeagues.$inferInsert) {
    const [league] = await db.insert(creatorLeagues).values(data).returning();
    return league;
  }

  async updateLeague(id: string, data: Partial<typeof creatorLeagues.$inferInsert>) {
    const [league] = await db.update(creatorLeagues).set({ ...data, updatedAt: new Date() }).where(eq(creatorLeagues.id, id)).returning();
    return league;
  }

  async deleteLeague(id: string) {
    await db.delete(creatorLeagues).where(eq(creatorLeagues.id, id));
  }

  async publishLeague(id: string) {
    return this.updateLeague(id, { isPublished: true });
  }

  async archiveLeague(id: string) {
    return this.updateLeague(id, { leagueStatus: "archived" });
  }

  async duplicateLeague(id: string, createdBy: string) {
    const original = await this.findLeagueById(id);
    if (!original) throw new Error("League not found");
    const { id: _, createdAt, updatedAt, ...data } = original;
    return this.createLeague({ ...data, name: `${data.name} (Copy)`, createdBy, isPublished: false });
  }

  // Seasons
  async findSeasonById(id: string) {
    const [season] = await db.select().from(creatorSeasons).where(eq(creatorSeasons.id, id));
    return season;
  }

  async findSeasonsByLeague(leagueId: string) {
    return db.select().from(creatorSeasons).where(eq(creatorSeasons.leagueId, leagueId)).orderBy(desc(creatorSeasons.year));
  }

  async createSeason(data: typeof creatorSeasons.$inferInsert) {
    const [season] = await db.insert(creatorSeasons).values(data).returning();
    return season;
  }

  async updateSeason(id: string, data: Partial<typeof creatorSeasons.$inferInsert>) {
    const [season] = await db.update(creatorSeasons).set({ ...data, updatedAt: new Date() }).where(eq(creatorSeasons.id, id)).returning();
    return season;
  }

  async deleteSeason(id: string) {
    await db.delete(creatorSeasons).where(eq(creatorSeasons.id, id));
  }

  // Clubs
  async findClubById(id: string) {
    const [club] = await db.select().from(creatorClubs).where(eq(creatorClubs.id, id));
    return club;
  }

  async findClubsByLeague(leagueId: string) {
    return db.select().from(creatorClubs).where(eq(creatorClubs.leagueId, leagueId));
  }

  async createClub(data: typeof creatorClubs.$inferInsert) {
    const [club] = await db.insert(creatorClubs).values(data).returning();
    return club;
  }

  async updateClub(id: string, data: Partial<typeof creatorClubs.$inferInsert>) {
    const [club] = await db.update(creatorClubs).set({ ...data, updatedAt: new Date() }).where(eq(creatorClubs.id, id)).returning();
    return club;
  }

  async deleteClub(id: string) {
    await db.delete(creatorClubs).where(eq(creatorClubs.id, id));
  }

  // Teams
  async findTeamById(id: string) {
    const [team] = await db.select().from(creatorTeams).where(eq(creatorTeams.id, id));
    return team;
  }

  async findTeamsByClub(clubId: string) {
    return db.select().from(creatorTeams).where(eq(creatorTeams.clubId, clubId));
  }

  async findTeamsBySeason(seasonId: string) {
    return db.select().from(creatorTeams).where(eq(creatorTeams.seasonId, seasonId));
  }

  async createTeam(data: typeof creatorTeams.$inferInsert) {
    const [team] = await db.insert(creatorTeams).values(data).returning();
    return team;
  }

  async updateTeam(id: string, data: Partial<typeof creatorTeams.$inferInsert>) {
    const [team] = await db.update(creatorTeams).set({ ...data, updatedAt: new Date() }).where(eq(creatorTeams.id, id)).returning();
    return team;
  }

  async deleteTeam(id: string) {
    await db.delete(creatorTeams).where(eq(creatorTeams.id, id));
  }

  // Players
  async findPlayerById(id: string) {
    const [player] = await db.select().from(creatorPlayers).where(eq(creatorPlayers.id, id));
    return player;
  }

  async findPlayersByTeam(teamId: string) {
    return db.select().from(creatorPlayers).where(eq(creatorPlayers.teamId, teamId));
  }

  async createPlayer(data: typeof creatorPlayers.$inferInsert) {
    const [player] = await db.insert(creatorPlayers).values(data).returning();
    return player;
  }

  async updatePlayer(id: string, data: Partial<typeof creatorPlayers.$inferInsert>) {
    const [player] = await db.update(creatorPlayers).set({ ...data, updatedAt: new Date() }).where(eq(creatorPlayers.id, id)).returning();
    return player;
  }

  async deletePlayer(id: string) {
    await db.delete(creatorPlayers).where(eq(creatorPlayers.id, id));
  }

  // Coaches
  async findCoachById(id: string) {
    const [coach] = await db.select().from(creatorCoaches).where(eq(creatorCoaches.id, id));
    return coach;
  }

  async findCoachesByTeam(teamId: string) {
    return db.select().from(creatorCoaches).where(eq(creatorCoaches.teamId, teamId));
  }

  async createCoach(data: typeof creatorCoaches.$inferInsert) {
    const [coach] = await db.insert(creatorCoaches).values(data).returning();
    return coach;
  }

  async updateCoach(id: string, data: Partial<typeof creatorCoaches.$inferInsert>) {
    const [coach] = await db.update(creatorCoaches).set({ ...data, updatedAt: new Date() }).where(eq(creatorCoaches.id, id)).returning();
    return coach;
  }

  async deleteCoach(id: string) {
    await db.delete(creatorCoaches).where(eq(creatorCoaches.id, id));
  }

  // Stadiums
  async findStadiumById(id: string) {
    const [stadium] = await db.select().from(creatorStadiums).where(eq(creatorStadiums.id, id));
    return stadium;
  }

  async findStadiumsByClub(clubId: string) {
    return db.select().from(creatorStadiums).where(eq(creatorStadiums.clubId, clubId));
  }

  async createStadium(data: typeof creatorStadiums.$inferInsert) {
    const [stadium] = await db.insert(creatorStadiums).values(data).returning();
    return stadium;
  }

  async updateStadium(id: string, data: Partial<typeof creatorStadiums.$inferInsert>) {
    const [stadium] = await db.update(creatorStadiums).set({ ...data, updatedAt: new Date() }).where(eq(creatorStadiums.id, id)).returning();
    return stadium;
  }

  async deleteStadium(id: string) {
    await db.delete(creatorStadiums).where(eq(creatorStadiums.id, id));
  }

  // Matches
  async findMatchById(id: string) {
    const [match] = await db.select().from(creatorMatches).where(eq(creatorMatches.id, id));
    return match;
  }

  async findMatchesBySeason(seasonId: string) {
    return db.select().from(creatorMatches).where(eq(creatorMatches.seasonId, seasonId)).orderBy(asc(creatorMatches.scheduledDate));
  }

  async findMatchesByTeam(teamId: string) {
    return db.select().from(creatorMatches).where(
      or(eq(creatorMatches.homeTeamId, teamId), eq(creatorMatches.awayTeamId, teamId))
    ).orderBy(asc(creatorMatches.scheduledDate));
  }

  async createMatch(data: typeof creatorMatches.$inferInsert) {
    const [match] = await db.insert(creatorMatches).values(data).returning();
    return match;
  }

  async updateMatch(id: string, data: Partial<typeof creatorMatches.$inferInsert>) {
    const [match] = await db.update(creatorMatches).set({ ...data, updatedAt: new Date() }).where(eq(creatorMatches.id, id)).returning();
    return match;
  }

  async deleteMatch(id: string) {
    await db.delete(creatorMatches).where(eq(creatorMatches.id, id));
  }

  // Match Events
  async findMatchEventsByMatch(matchId: string) {
    return db.select().from(creatorMatchEvents).where(eq(creatorMatchEvents.matchId, matchId)).orderBy(asc(creatorMatchEvents.eventTime));
  }

  async createMatchEvent(data: typeof creatorMatchEvents.$inferInsert) {
    const [event] = await db.insert(creatorMatchEvents).values(data).returning();
    return event;
  }

  async deleteMatchEvent(id: string) {
    await db.delete(creatorMatchEvents).where(eq(creatorMatchEvents.id, id));
  }

  // Rankings
  async findRankingsBySeason(seasonId: string) {
    return db.select().from(creatorRankings).where(eq(creatorRankings.seasonId, seasonId)).orderBy(asc(creatorRankings.position));
  }

  async findRankingByTeam(seasonId: string, teamId: string) {
    const [ranking] = await db.select().from(creatorRankings).where(
      and(eq(creatorRankings.seasonId, seasonId), eq(creatorRankings.teamId, teamId))
    );
    return ranking;
  }

  async createRanking(data: typeof creatorRankings.$inferInsert) {
    const [ranking] = await db.insert(creatorRankings).values(data).returning();
    return ranking;
  }

  async updateRanking(id: string, data: Partial<typeof creatorRankings.$inferInsert>) {
    const [ranking] = await db.update(creatorRankings).set({ ...data, updatedAt: new Date() }).where(eq(creatorRankings.id, id)).returning();
    return ranking;
  }

  async deleteRanking(id: string) {
    await db.delete(creatorRankings).where(eq(creatorRankings.id, id));
  }

  // Training
  async findTrainingByTeam(teamId: string) {
    return db.select().from(creatorTraining).where(eq(creatorTraining.teamId, teamId)).orderBy(desc(creatorTraining.date));
  }

  async findTrainingByPlayer(playerId: string) {
    return db.select().from(creatorTraining).where(eq(creatorTraining.playerId, playerId)).orderBy(desc(creatorTraining.date));
  }

  async createTraining(data: typeof creatorTraining.$inferInsert) {
    const [training] = await db.insert(creatorTraining).values(data).returning();
    return training;
  }

  async updateTraining(id: string, data: Partial<typeof creatorTraining.$inferInsert>) {
    const [training] = await db.update(creatorTraining).set({ ...data, updatedAt: new Date() }).where(eq(creatorTraining.id, id)).returning();
    return training;
  }

  async deleteTraining(id: string) {
    await db.delete(creatorTraining).where(eq(creatorTraining.id, id));
  }

  // Transfers
  async findTransfersByPlayer(playerId: string) {
    return db.select().from(creatorTransfers).where(eq(creatorTransfers.playerId, playerId)).orderBy(desc(creatorTransfers.requestDate));
  }

  async findTransfersByClub(clubId: string) {
    return db.select().from(creatorTransfers).where(
      or(eq(creatorTransfers.fromClubId, clubId), eq(creatorTransfers.toClubId, clubId))
    ).orderBy(desc(creatorTransfers.requestDate));
  }

  async createTransfer(data: typeof creatorTransfers.$inferInsert) {
    const [transfer] = await db.insert(creatorTransfers).values(data).returning();
    return transfer;
  }

  async updateTransfer(id: string, data: Partial<typeof creatorTransfers.$inferInsert>) {
    const [transfer] = await db.update(creatorTransfers).set({ ...data, updatedAt: new Date() }).where(eq(creatorTransfers.id, id)).returning();
    return transfer;
  }

  async deleteTransfer(id: string) {
    await db.delete(creatorTransfers).where(eq(creatorTransfers.id, id));
  }

  // Awards
  async findAwardsBySeason(seasonId: string) {
    return db.select().from(creatorAwards).where(eq(creatorAwards.seasonId, seasonId)).orderBy(desc(creatorAwards.awardDate));
  }

  async findAwardsByPlayer(playerId: string) {
    return db.select().from(creatorAwards).where(eq(creatorAwards.playerId, playerId)).orderBy(desc(creatorAwards.awardDate));
  }

  async createAward(data: typeof creatorAwards.$inferInsert) {
    const [award] = await db.insert(creatorAwards).values(data).returning();
    return award;
  }

  async deleteAward(id: string) {
    await db.delete(creatorAwards).where(eq(creatorAwards.id, id));
  }

  // Templates
  async findAllTemplates(limit = 50, offset = 0) {
    return db.select().from(creatorSportsTemplates).limit(limit).offset(offset);
  }

  async findTemplateById(id: string) {
    const [template] = await db.select().from(creatorSportsTemplates).where(eq(creatorSportsTemplates.id, id));
    return template;
  }

  async createTemplate(data: typeof creatorSportsTemplates.$inferInsert) {
    const [template] = await db.insert(creatorSportsTemplates).values(data).returning();
    return template;
  }

  async updateTemplate(id: string, data: Partial<typeof creatorSportsTemplates.$inferInsert>) {
    const [template] = await db.update(creatorSportsTemplates).set({ ...data, updatedAt: new Date() }).where(eq(creatorSportsTemplates.id, id)).returning();
    return template;
  }

  async deleteTemplate(id: string) {
    await db.delete(creatorSportsTemplates).where(eq(creatorSportsTemplates.id, id));
  }

  // Versions
  async findVersionsByLeague(leagueId: string) {
    return db.select().from(creatorSportsVersions).where(eq(creatorSportsVersions.leagueId, leagueId)).orderBy(desc(creatorSportsVersions.version));
  }

  async createVersion(data: typeof creatorSportsVersions.$inferInsert) {
    const [version] = await db.insert(creatorSportsVersions).values(data).returning();
    return version;
  }

  // History
  async findHistoryByLeague(leagueId: string, limit = 50, offset = 0) {
    return db.select().from(creatorSportsHistory).where(eq(creatorSportsHistory.leagueId, leagueId)).orderBy(desc(creatorSportsHistory.createdAt)).limit(limit).offset(offset);
  }

  async createHistory(data: typeof creatorSportsHistory.$inferInsert) {
    const [history] = await db.insert(creatorSportsHistory).values(data).returning();
    return history;
  }

  // Statistics
  async findStatisticsByLeague(leagueId: string) {
    const [stats] = await db.select().from(creatorSportsStatistics).where(eq(creatorSportsStatistics.leagueId, leagueId));
    return stats;
  }

  async createStatistics(data: typeof creatorSportsStatistics.$inferInsert) {
    const [stats] = await db.insert(creatorSportsStatistics).values(data).returning();
    return stats;
  }

  async updateStatistics(leagueId: string, data: Partial<typeof creatorSportsStatistics.$inferInsert>) {
    const [stats] = await db.update(creatorSportsStatistics).set({ ...data, calculatedAt: new Date() }).where(eq(creatorSportsStatistics.leagueId, leagueId)).returning();
    return stats;
  }

  // Exports
  async findExportsByLeague(leagueId: string) {
    return db.select().from(creatorSportsExports).where(eq(creatorSportsExports.leagueId, leagueId)).orderBy(desc(creatorSportsExports.createdAt));
  }

  async createSportsExport(data: typeof creatorSportsExports.$inferInsert) {
    const [exportRecord] = await db.insert(creatorSportsExports).values(data).returning();
    return exportRecord;
  }

  // Runtime
  async findRuntimeByLeague(leagueId: string) {
    const [runtime] = await db.select().from(creatorSportsRuntime).where(eq(creatorSportsRuntime.leagueId, leagueId));
    return runtime;
  }

  async updateSportsRuntime(leagueId: string, data: Partial<typeof creatorSportsRuntime.$inferInsert>) {
    const [runtime] = await db.update(creatorSportsRuntime).set({ ...data, lastSimulatedAt: new Date() }).where(eq(creatorSportsRuntime.leagueId, leagueId)).returning();
    return runtime;
  }
}

export const sportsRepository = new SportsRepository();
