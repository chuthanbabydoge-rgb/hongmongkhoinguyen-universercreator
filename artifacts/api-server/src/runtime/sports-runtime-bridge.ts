import { sportsRepository } from "../repositories/sports-repository";

export class SportsRuntimeBridge {
  async startSeason(leagueId: string, seasonId: string) {
    const season = await sportsRepository.findSeasonById(seasonId);
    if (!season) throw new Error("Season not found");
    await sportsRepository.updateSeason(seasonId, { isActive: true, isCompleted: false });
    await sportsRepository.updateSportsRuntime(leagueId, { isSimulating: true, currentSeasonId: seasonId, currentMatchDay: 1 });
    return { success: true, seasonId };
  }

  async endSeason(leagueId: string, seasonId: string) {
    await sportsRepository.updateSeason(seasonId, { isActive: false, isCompleted: true });
    await sportsRepository.updateSportsRuntime(leagueId, { isSimulating: false });
    return { success: true, seasonId };
  }

  async scheduleMatch(seasonId: string, homeTeamId: string, awayTeamId: string, scheduledDate: Date, stadiumId?: string) {
    return sportsRepository.createMatch({
      seasonId,
      homeTeamId,
      awayTeamId,
      stadiumId,
      scheduledDate,
      competitionType: "league",
      matchStatus: "scheduled",
      createdBy: "system",
    });
  }

  async startMatch(matchId: string) {
    return sportsRepository.updateMatch(matchId, { matchStatus: "live" });
  }

  async pauseMatch(matchId: string) {
    return sportsRepository.updateMatch(matchId, { matchStatus: "paused" });
  }

  async resumeMatch(matchId: string) {
    return sportsRepository.updateMatch(matchId, { matchStatus: "live" });
  }

  async finishMatch(matchId: string, homeScore: number, awayScore: number) {
    await sportsRepository.updateMatch(matchId, { matchStatus: "finished", homeScore, awayScore });
    const match = await sportsRepository.findMatchById(matchId);
    if (match) {
      if (match.seasonId && match.homeTeamId) await this.updateRanking(match.seasonId, match.homeTeamId, homeScore, awayScore);
      if (match.seasonId && match.awayTeamId) await this.updateRanking(match.seasonId, match.awayTeamId, awayScore, homeScore);
    }
    return { success: true, matchId, homeScore, awayScore };
  }

  async recordGoal(matchId: string, playerId: string, teamId: string, minute: number, assistPlayerId?: string) {
    return sportsRepository.createMatchEvent({
      matchId,
      playerId,
      eventType: "goal",
      eventTime: minute,
      assistPlayerId,
      createdBy: "system",
    });
  }

  async recordAssist(matchId: string, playerId: string, minute: number) {
    return sportsRepository.createMatchEvent({
      matchId,
      playerId,
      eventType: "assist",
      eventTime: minute,
      createdBy: "system",
    });
  }

  async recordCard(matchId: string, playerId: string, cardType: string, minute: number) {
    return sportsRepository.createMatchEvent({
      matchId,
      playerId,
      eventType: "card",
      eventTime: minute,
      cardType,
      createdBy: "system",
    });
  }

  async recordSubstitution(matchId: string, substitutionInId: string, substitutionOutId: string, minute: number) {
    return sportsRepository.createMatchEvent({
      matchId,
      eventType: "substitution",
      eventTime: minute,
      substitutionInId,
      substitutionOutId,
      createdBy: "system",
    });
  }

  async updateRanking(seasonId: string, teamId: string, goalsFor: number, goalsAgainst: number) {
    const existing = await sportsRepository.findRankingByTeam(seasonId, teamId);
    if (existing) {
      const points = goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
      return sportsRepository.updateRanking(existing.id, {
        points: (existing.points ?? 0) + points,
        matchesPlayed: (existing.matchesPlayed ?? 0) + 1,
        wins: (existing.wins ?? 0) + (goalsFor > goalsAgainst ? 1 : 0),
        draws: (existing.draws ?? 0) + (goalsFor === goalsAgainst ? 1 : 0),
        losses: (existing.losses ?? 0) + (goalsFor < goalsAgainst ? 1 : 0),
        goalsFor: (existing.goalsFor ?? 0) + goalsFor,
        goalsAgainst: (existing.goalsAgainst ?? 0) + goalsAgainst,
        goalDifference: (existing.goalDifference ?? 0) + (goalsFor - goalsAgainst),
      });
    }
    const points = goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
    return sportsRepository.createRanking({
      seasonId,
      teamId,
      position: 1,
      points,
      matchesPlayed: 1,
      wins: goalsFor > goalsAgainst ? 1 : 0,
      draws: goalsFor === goalsAgainst ? 1 : 0,
      losses: goalsFor < goalsAgainst ? 1 : 0,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
    });
  }

  async transferPlayer(playerId: string, fromClubId: string, toClubId: string, transferFee?: number, contractLength?: number, salary?: number) {
    const player = await sportsRepository.findPlayerById(playerId);
    if (!player) throw new Error("Player not found");
    await sportsRepository.updatePlayer(playerId, { teamId: null });
    const transfer = await sportsRepository.createTransfer({
      playerId,
      fromClubId,
      toClubId,
      transferFee: transferFee ? String(transferFee) : null,
      transferStatus: "completed",
      completionDate: new Date(),
      contractLength,
      salary: salary ? String(salary) : null,
      createdBy: "system",
    });
    return transfer;
  }

  async trainPlayer(teamId: string, playerId: string, trainingType: string, duration: number, focus?: string) {
    return sportsRepository.createTraining({
      teamId,
      playerId,
      trainingType: trainingType as any,
      date: new Date(),
      duration,
      focus,
      completed: true,
      createdBy: "system",
    });
  }

  async awardChampion(seasonId: string, teamId: string, awardType: string = "champion") {
    return sportsRepository.createAward({
      seasonId,
      teamId,
      awardType: awardType as any,
      title: awardType === "champion" ? "Champion" : awardType,
      description: `Awarded for outstanding performance in season`,
      awardDate: new Date(),
      createdBy: "system",
    });
  }

  async simulateLeague(leagueId: string) {
    const runtime = await sportsRepository.findRuntimeByLeague(leagueId);
    if (!runtime) throw new Error("Runtime not initialized");
    const seasons = await sportsRepository.findSeasonsByLeague(leagueId);
    const activeSeason = seasons.find(s => s.id === runtime.currentSeasonId);
    if (!activeSeason) throw new Error("No active season");
    const matches = await sportsRepository.findMatchesBySeason(activeSeason.id);
    const pendingMatches = matches.filter(m => m.matchStatus === "scheduled");
    for (const match of pendingMatches.slice(0, 5)) {
      const homeScore = Math.floor(Math.random() * 5);
      const awayScore = Math.floor(Math.random() * 5);
      await this.finishMatch(match.id, homeScore, awayScore);
    }
    await sportsRepository.updateSportsRuntime(leagueId, {
      currentMatchDay: (runtime.currentMatchDay ?? 0) + 1,
      simulationTick: (runtime.simulationTick ?? 0) + 1,
    });
    return { simulated: Math.min(pendingMatches.length, 5), currentMatchDay: (runtime.currentMatchDay ?? 0) + 1 };
  }
}

export const sportsRuntimeBridge = new SportsRuntimeBridge();
