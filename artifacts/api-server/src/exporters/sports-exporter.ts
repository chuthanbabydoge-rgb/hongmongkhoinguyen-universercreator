import crypto from "crypto";
import { sportsRepository } from "../repositories/sports-repository";

export class SportsExporter {
  async exportLeague(leagueId: string, format: "json" | "template" | "package" = "json", exportedBy: string) {
    const league = await sportsRepository.findLeagueById(leagueId);
    if (!league) throw new Error(`League ${leagueId} not found`);
    const clubs = await sportsRepository.findClubsByLeague(leagueId);
    const seasons = await sportsRepository.findSeasonsByLeague(leagueId);
    const teamsArray = await Promise.all(clubs.flatMap(c => sportsRepository.findTeamsByClub(c.id)));
    const teams = teamsArray.flat();
    const playersArray = await Promise.all(teams.flatMap(t => sportsRepository.findPlayersByTeam(t.id)));
    const players = playersArray.flat();
    const coachesArray = await Promise.all(teams.flatMap(t => sportsRepository.findCoachesByTeam(t.id)));
    const coaches = coachesArray.flat();
    const stadiums = await Promise.all(clubs.map(c => c.stadiumId ? sportsRepository.findStadiumById(c.stadiumId) : Promise.resolve(null)));
    const matches = await Promise.all(seasons.flatMap(s => sportsRepository.findMatchesBySeason(s.id)));
    const rankings = await Promise.all(seasons.flatMap(s => sportsRepository.findRankingsBySeason(s.id)));
    const trainingArray = await Promise.all(teams.flatMap(t => sportsRepository.findTrainingByTeam(t.id)));
    const training = trainingArray.flat();
    const transfersArray = await Promise.all(players.flatMap(p => sportsRepository.findTransfersByPlayer(p.id)));
    const transfers = transfersArray.flat();
    const awards = await Promise.all(seasons.flatMap(s => sportsRepository.findAwardsBySeason(s.id)));

    const payload = {
      exportVersion: "1.0.0",
      format,
      exportedAt: new Date().toISOString(),
      league,
      clubs,
      seasons,
      teams,
      players,
      coaches,
      stadiums: stadiums.filter(s => s !== null),
      matches,
      rankings,
      training,
      transfers,
      awards,
    };

    const json = JSON.stringify(payload);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    const record = await sportsRepository.createSportsExport({ leagueId, format, payload: payload as any, checksum, exportedBy });
    return { ...record, data: payload };
  }
}

export const sportsExporter = new SportsExporter();
