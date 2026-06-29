import { sportsRepository } from "../repositories/sports-repository";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SportsValidator {
  async validate(leagueId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const league = await sportsRepository.findLeagueById(leagueId);
    if (!league) {
      return { valid: false, errors: ["League not found"], warnings };
    }

    // Check for duplicate teams
    const clubs = await sportsRepository.findClubsByLeague(leagueId);
    const teamNames = new Set<string>();
    for (const club of clubs) {
      const teams = await sportsRepository.findTeamsByClub(club.id);
      for (const team of teams) {
        if (teamNames.has(team.name)) {
          errors.push(`Duplicate team name: ${team.name}`);
        }
        teamNames.add(team.name);
      }
    }

    // Check for duplicate players
    const allTeams = await Promise.all(clubs.map(c => sportsRepository.findTeamsByClub(c.id))).then(arr => arr.flat());
    const playerNames = new Map<string, string>();
    for (const team of allTeams) {
      const players = await sportsRepository.findPlayersByTeam(team.id);
      for (const player of players) {
        const key = `${player.name}-${player.jerseyNumber}`;
        if (playerNames.has(key)) {
          errors.push(`Duplicate player: ${player.name} #${player.jerseyNumber}`);
        }
        playerNames.set(key, team.id);
      }
    }

    // Check for invalid player positions
    const validPositions = ["goalkeeper", "defender", "midfielder", "forward", "coach", "substitute"];
    for (const team of allTeams) {
      const players = await sportsRepository.findPlayersByTeam(team.id);
      for (const player of players) {
        if (!validPositions.includes(player.position)) {
          errors.push(`Invalid position for player ${player.name}: ${player.position}`);
        }
      }
    }

    // Check for missing coach
    for (const team of allTeams) {
      const coaches = await sportsRepository.findCoachesByTeam(team.id);
      if (coaches.length === 0) {
        warnings.push(`Team ${team.name} has no coach assigned`);
      }
    }

    // Check for invalid stadium capacity
    for (const club of clubs) {
      const stadium = club.stadiumId ? await sportsRepository.findStadiumById(club.stadiumId) : null;
      if (stadium && stadium.capacity <= 0) {
        errors.push(`Stadium ${stadium.name} has invalid capacity: ${stadium.capacity}`);
      }
    }

    // Check for empty league
    if (clubs.length === 0) {
      warnings.push("League has no clubs");
    }

    // Check for empty stadiums
    for (const club of clubs) {
      const stadium = club.stadiumId ? await sportsRepository.findStadiumById(club.stadiumId) : null;
      if (!stadium) {
        warnings.push(`Club ${club.name} has no stadium assigned`);
      }
    }

    // Check for club without players
    for (const club of clubs) {
      const teams = await sportsRepository.findTeamsByClub(club.id);
      for (const team of teams) {
        const players = await sportsRepository.findPlayersByTeam(team.id);
        if (players.length === 0) {
          warnings.push(`Team ${team.name} has no players`);
        }
      }
    }

    // Check for broken schedules (matches with same teams at same time)
    const seasons = await sportsRepository.findSeasonsByLeague(leagueId);
    for (const season of seasons) {
      const matches = await sportsRepository.findMatchesBySeason(season.id);
      const matchKeys = new Set<string>();
      for (const match of matches) {
        if (match.matchStatus !== "cancelled") {
          const key = `${match.homeTeamId}-${match.awayTeamId}-${match.scheduledDate}`;
          if (matchKeys.has(key)) {
            errors.push(`Duplicate match scheduled: ${match.homeTeamId} vs ${match.awayTeamId} on ${match.scheduledDate}`);
          }
          matchKeys.add(key);
        }
      }
    }

    // Check for circular season references
    for (const season of seasons) {
      if (season.year < 1900 || season.year > 2100) {
        errors.push(`Invalid year for season ${season.name}: ${season.year}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const sportsValidator = new SportsValidator();
