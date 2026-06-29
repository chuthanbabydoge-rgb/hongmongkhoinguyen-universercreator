import { sportsRepository } from "../repositories/sports-repository";

export class SportsEditorService {
  // Sports
  async listSports(limit = 50, offset = 0) {
    return sportsRepository.findAllSports(limit, offset);
  }

  async searchSports(query: string) {
    return sportsRepository.searchSports(query);
  }

  async getSport(id: string) {
    const sport = await sportsRepository.findSportById(id);
    if (!sport) throw new Error("Sport not found");
    return sport;
  }

  async createSport(data: any) {
    return sportsRepository.createSport(data);
  }

  async updateSport(id: string, data: any) {
    return sportsRepository.updateSport(id, data);
  }

  async deleteSport(id: string) {
    await sportsRepository.deleteSport(id);
  }

  // Leagues
  async listLeagues(limit = 50, offset = 0) {
    return sportsRepository.findAllLeagues(limit, offset);
  }

  async getLeague(id: string) {
    const league = await sportsRepository.findLeagueById(id);
    if (!league) throw new Error("League not found");
    return league;
  }

  async createLeague(data: any) {
    return sportsRepository.createLeague(data);
  }

  async updateLeague(id: string, data: any) {
    return sportsRepository.updateLeague(id, data);
  }

  async deleteLeague(id: string) {
    await sportsRepository.deleteLeague(id);
  }

  async publishLeague(id: string) {
    return sportsRepository.publishLeague(id);
  }

  async archiveLeague(id: string) {
    return sportsRepository.archiveLeague(id);
  }

  async duplicateLeague(id: string, createdBy: string) {
    return sportsRepository.duplicateLeague(id, createdBy);
  }

  async saveVersion(id: string, createdBy: string, changelog?: string) {
    const league = await sportsRepository.findLeagueById(id);
    if (!league) throw new Error("League not found");
    const versions = await sportsRepository.findVersionsByLeague(id);
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;
    return sportsRepository.createVersion({
      leagueId: id,
      version: nextVersion,
      changelog,
      snapshot: league,
      createdBy,
    });
  }

  async getStats(id: string) {
    return sportsRepository.findStatisticsByLeague(id);
  }

  async recalculateStats(id: string) {
    const clubs = await sportsRepository.findClubsByLeague(id);
    const seasons = await sportsRepository.findSeasonsByLeague(id);
    const allMatches: any[] = [];
    for (const season of seasons) {
      const matches = await sportsRepository.findMatchesBySeason(season.id);
      allMatches.push(...matches);
    }
    const allTeams: any[] = [];
    for (const club of clubs) {
      const teams = await sportsRepository.findTeamsByClub(club.id);
      allTeams.push(...teams);
    }
    const allPlayers: any[] = [];
    for (const team of allTeams) {
      const players = await sportsRepository.findPlayersByTeam(team.id);
      allPlayers.push(...players);
    }
    const totalPlayers = allPlayers.length;
    const totalMatches = allMatches.length;
    const totalGoals = allMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
    return sportsRepository.updateStatistics(id, {
      totalClubs: clubs.length,
      totalPlayers,
      totalMatches,
      totalGoals,
    });
  }

  async getHistory(id: string, limit = 50, offset = 0) {
    return sportsRepository.findHistoryByLeague(id, limit, offset);
  }

  async getRuntime(id: string) {
    return sportsRepository.findRuntimeByLeague(id);
  }

  // Seasons
  async listSeasons(leagueId: string) {
    return sportsRepository.findSeasonsByLeague(leagueId);
  }

  async getSeason(id: string) {
    const season = await sportsRepository.findSeasonById(id);
    if (!season) throw new Error("Season not found");
    return season;
  }

  async createSeason(leagueId: string, data: any) {
    return sportsRepository.createSeason({ ...data, leagueId });
  }

  async updateSeason(id: string, data: any) {
    return sportsRepository.updateSeason(id, data);
  }

  async deleteSeason(id: string) {
    await sportsRepository.deleteSeason(id);
  }

  // Clubs
  async listClubs(leagueId: string) {
    return sportsRepository.findClubsByLeague(leagueId);
  }

  async getClub(id: string) {
    const club = await sportsRepository.findClubById(id);
    if (!club) throw new Error("Club not found");
    return club;
  }

  async createClub(leagueId: string, data: any) {
    return sportsRepository.createClub({ ...data, leagueId });
  }

  async updateClub(id: string, data: any) {
    return sportsRepository.updateClub(id, data);
  }

  async deleteClub(id: string) {
    await sportsRepository.deleteClub(id);
  }

  // Teams
  async listTeams(clubId: string) {
    return sportsRepository.findTeamsByClub(clubId);
  }

  async listTeamsBySeason(seasonId: string) {
    return sportsRepository.findTeamsBySeason(seasonId);
  }

  async getTeam(id: string) {
    const team = await sportsRepository.findTeamById(id);
    if (!team) throw new Error("Team not found");
    return team;
  }

  async createTeam(clubId: string, data: any) {
    return sportsRepository.createTeam({ ...data, clubId });
  }

  async updateTeam(id: string, data: any) {
    return sportsRepository.updateTeam(id, data);
  }

  async deleteTeam(id: string) {
    await sportsRepository.deleteTeam(id);
  }

  // Players
  async listPlayers(teamId: string) {
    return sportsRepository.findPlayersByTeam(teamId);
  }

  async getPlayer(id: string) {
    const player = await sportsRepository.findPlayerById(id);
    if (!player) throw new Error("Player not found");
    return player;
  }

  async createPlayer(teamId: string, data: any) {
    return sportsRepository.createPlayer({ ...data, teamId });
  }

  async updatePlayer(id: string, data: any) {
    return sportsRepository.updatePlayer(id, data);
  }

  async deletePlayer(id: string) {
    await sportsRepository.deletePlayer(id);
  }

  // Coaches
  async listCoaches(teamId: string) {
    return sportsRepository.findCoachesByTeam(teamId);
  }

  async getCoach(id: string) {
    const coach = await sportsRepository.findCoachById(id);
    if (!coach) throw new Error("Coach not found");
    return coach;
  }

  async createCoach(teamId: string, data: any) {
    return sportsRepository.createCoach({ ...data, teamId });
  }

  async updateCoach(id: string, data: any) {
    return sportsRepository.updateCoach(id, data);
  }

  async deleteCoach(id: string) {
    await sportsRepository.deleteCoach(id);
  }

  // Stadiums
  async listStadiums(clubId: string) {
    return sportsRepository.findStadiumsByClub(clubId);
  }

  async getStadium(id: string) {
    const stadium = await sportsRepository.findStadiumById(id);
    if (!stadium) throw new Error("Stadium not found");
    return stadium;
  }

  async createStadium(clubId: string, data: any) {
    return sportsRepository.createStadium({ ...data, clubId });
  }

  async updateStadium(id: string, data: any) {
    return sportsRepository.updateStadium(id, data);
  }

  async deleteStadium(id: string) {
    await sportsRepository.deleteStadium(id);
  }

  // Matches
  async listMatches(seasonId: string) {
    return sportsRepository.findMatchesBySeason(seasonId);
  }

  async listMatchesByTeam(teamId: string) {
    return sportsRepository.findMatchesByTeam(teamId);
  }

  async getMatch(id: string) {
    const match = await sportsRepository.findMatchById(id);
    if (!match) throw new Error("Match not found");
    return match;
  }

  async createMatch(seasonId: string, data: any) {
    return sportsRepository.createMatch({ ...data, seasonId });
  }

  async updateMatch(id: string, data: any) {
    return sportsRepository.updateMatch(id, data);
  }

  async deleteMatch(id: string) {
    await sportsRepository.deleteMatch(id);
  }

  // Match Events
  async listMatchEvents(matchId: string) {
    return sportsRepository.findMatchEventsByMatch(matchId);
  }

  async createMatchEvent(data: any) {
    return sportsRepository.createMatchEvent(data);
  }

  async deleteMatchEvent(id: string) {
    await sportsRepository.deleteMatchEvent(id);
  }

  // Rankings
  async listRankings(seasonId: string) {
    return sportsRepository.findRankingsBySeason(seasonId);
  }

  async getRanking(seasonId: string, teamId: string) {
    const ranking = await sportsRepository.findRankingByTeam(seasonId, teamId);
    if (!ranking) throw new Error("Ranking not found");
    return ranking;
  }

  async createRanking(data: any) {
    return sportsRepository.createRanking(data);
  }

  async updateRanking(id: string, data: any) {
    return sportsRepository.updateRanking(id, data);
  }

  async deleteRanking(id: string) {
    await sportsRepository.deleteRanking(id);
  }

  // Training
  async listTraining(teamId: string) {
    return sportsRepository.findTrainingByTeam(teamId);
  }

  async listTrainingByPlayer(playerId: string) {
    return sportsRepository.findTrainingByPlayer(playerId);
  }

  async createTraining(data: any) {
    return sportsRepository.createTraining(data);
  }

  async updateTraining(id: string, data: any) {
    return sportsRepository.updateTraining(id, data);
  }

  async deleteTraining(id: string) {
    await sportsRepository.deleteTraining(id);
  }

  // Transfers
  async listTransfersByPlayer(playerId: string) {
    return sportsRepository.findTransfersByPlayer(playerId);
  }

  async listTransfersByClub(clubId: string) {
    return sportsRepository.findTransfersByClub(clubId);
  }

  async createTransfer(data: any) {
    return sportsRepository.createTransfer(data);
  }

  async updateTransfer(id: string, data: any) {
    return sportsRepository.updateTransfer(id, data);
  }

  async deleteTransfer(id: string) {
    await sportsRepository.deleteTransfer(id);
  }

  // Awards
  async listAwards(seasonId: string) {
    return sportsRepository.findAwardsBySeason(seasonId);
  }

  async listAwardsByPlayer(playerId: string) {
    return sportsRepository.findAwardsByPlayer(playerId);
  }

  async createAward(data: any) {
    return sportsRepository.createAward(data);
  }

  async deleteAward(id: string) {
    await sportsRepository.deleteAward(id);
  }

  // Templates
  async listTemplates(limit = 50, offset = 0) {
    return sportsRepository.findAllTemplates(limit, offset);
  }

  async getTemplate(id: string) {
    const template = await sportsRepository.findTemplateById(id);
    if (!template) throw new Error("Template not found");
    return template;
  }

  async createTemplate(data: any) {
    return sportsRepository.createTemplate(data);
  }

  async updateTemplate(id: string, data: any) {
    return sportsRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string) {
    await sportsRepository.deleteTemplate(id);
  }
}

export const sportsEditorService = new SportsEditorService();
