import { Router } from "express";
import { sportsEditorService } from "../services/sports-editor-service";
import { sportsValidator } from "../validators/sports-validator";
import { sportsExporter } from "../exporters/sports-exporter";
import { sportsImporter } from "../importers/sports-importer";
import { sportsRuntimeBridge } from "../runtime/sports-runtime-bridge";

const router = Router();

// Sports CRUD
router.get("/", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await sportsEditorService.listSports(Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getSport(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await sportsEditorService.createSport(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateSport(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteSport(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Leagues CRUD
router.get("/leagues", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await sportsEditorService.listLeagues(Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/leagues/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getLeague(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/leagues", async (req, res) => {
  try {
    const result = await sportsEditorService.createLeague(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/leagues/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateLeague(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/leagues/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteLeague(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// League Actions
router.post("/leagues/:id/publish", async (req, res) => {
  try {
    const result = await sportsEditorService.publishLeague(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:id/archive", async (req, res) => {
  try {
    const result = await sportsEditorService.archiveLeague(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:id/duplicate", async (req, res) => {
  try {
    const { createdBy } = req.body;
    const result = await sportsEditorService.duplicateLeague(req.params.id, createdBy);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:id/version", async (req, res) => {
  try {
    const { createdBy, changelog } = req.body;
    const result = await sportsEditorService.saveVersion(req.params.id, createdBy, changelog);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/leagues/:id/stats", async (req, res) => {
  try {
    const result = await sportsEditorService.getStats(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/leagues/:id/stats/recalculate", async (req, res) => {
  try {
    const result = await sportsEditorService.recalculateStats(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/leagues/:id/history", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await sportsEditorService.getHistory(req.params.id, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get("/leagues/:id/runtime", async (req, res) => {
  try {
    const result = await sportsEditorService.getRuntime(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/leagues/:id/validate", async (req, res) => {
  try {
    const result = await sportsValidator.validate(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:id/export", async (req, res) => {
  try {
    const { format, exportedBy } = req.body;
    const result = await sportsExporter.exportLeague(req.params.id, format, exportedBy);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Seasons
router.get("/leagues/:leagueId/seasons", async (req, res) => {
  try {
    const result = await sportsEditorService.listSeasons(req.params.leagueId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/seasons/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getSeason(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/leagues/:leagueId/seasons", async (req, res) => {
  try {
    const result = await sportsEditorService.createSeason(req.params.leagueId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/seasons/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateSeason(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/seasons/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteSeason(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Clubs
router.get("/leagues/:leagueId/clubs", async (req, res) => {
  try {
    const result = await sportsEditorService.listClubs(req.params.leagueId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/clubs/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getClub(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/leagues/:leagueId/clubs", async (req, res) => {
  try {
    const result = await sportsEditorService.createClub(req.params.leagueId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/clubs/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateClub(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/clubs/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteClub(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Teams
router.get("/clubs/:clubId/teams", async (req, res) => {
  try {
    const result = await sportsEditorService.listTeams(req.params.clubId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/seasons/:seasonId/teams", async (req, res) => {
  try {
    const result = await sportsEditorService.listTeamsBySeason(req.params.seasonId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/teams/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getTeam(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/clubs/:clubId/teams", async (req, res) => {
  try {
    const result = await sportsEditorService.createTeam(req.params.clubId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/teams/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateTeam(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/teams/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteTeam(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Players
router.get("/teams/:teamId/players", async (req, res) => {
  try {
    const result = await sportsEditorService.listPlayers(req.params.teamId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/players/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getPlayer(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/teams/:teamId/players", async (req, res) => {
  try {
    const result = await sportsEditorService.createPlayer(req.params.teamId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/players/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updatePlayer(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/players/:id", async (req, res) => {
  try {
    await sportsEditorService.deletePlayer(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Coaches
router.get("/teams/:teamId/coaches", async (req, res) => {
  try {
    const result = await sportsEditorService.listCoaches(req.params.teamId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/coaches/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getCoach(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/teams/:teamId/coaches", async (req, res) => {
  try {
    const result = await sportsEditorService.createCoach(req.params.teamId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/coaches/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateCoach(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/coaches/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteCoach(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Stadiums
router.get("/clubs/:clubId/stadiums", async (req, res) => {
  try {
    const result = await sportsEditorService.listStadiums(req.params.clubId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stadiums/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getStadium(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/clubs/:clubId/stadiums", async (req, res) => {
  try {
    const result = await sportsEditorService.createStadium(req.params.clubId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/stadiums/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateStadium(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/stadiums/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteStadium(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Matches
router.get("/seasons/:seasonId/matches", async (req, res) => {
  try {
    const result = await sportsEditorService.listMatches(req.params.seasonId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/teams/:teamId/matches", async (req, res) => {
  try {
    const result = await sportsEditorService.listMatchesByTeam(req.params.teamId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getMatch(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/seasons/:seasonId/matches", async (req, res) => {
  try {
    const result = await sportsEditorService.createMatch(req.params.seasonId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/matches/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateMatch(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/matches/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteMatch(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Match Events
router.get("/matches/:matchId/events", async (req, res) => {
  try {
    const result = await sportsEditorService.listMatchEvents(req.params.matchId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/matches/events", async (req, res) => {
  try {
    const result = await sportsEditorService.createMatchEvent(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/matches/events/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteMatchEvent(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Rankings
router.get("/seasons/:seasonId/rankings", async (req, res) => {
  try {
    const result = await sportsEditorService.listRankings(req.params.seasonId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/seasons/:seasonId/teams/:teamId/ranking", async (req, res) => {
  try {
    const result = await sportsEditorService.getRanking(req.params.seasonId, req.params.teamId);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/rankings", async (req, res) => {
  try {
    const result = await sportsEditorService.createRanking(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/rankings/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateRanking(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/rankings/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteRanking(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Training
router.get("/teams/:teamId/training", async (req, res) => {
  try {
    const result = await sportsEditorService.listTraining(req.params.teamId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/players/:playerId/training", async (req, res) => {
  try {
    const result = await sportsEditorService.listTrainingByPlayer(req.params.playerId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/training", async (req, res) => {
  try {
    const result = await sportsEditorService.createTraining(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/training/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateTraining(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/training/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteTraining(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Transfers
router.get("/players/:playerId/transfers", async (req, res) => {
  try {
    const result = await sportsEditorService.listTransfersByPlayer(req.params.playerId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/clubs/:clubId/transfers", async (req, res) => {
  try {
    const result = await sportsEditorService.listTransfersByClub(req.params.clubId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/transfers", async (req, res) => {
  try {
    const result = await sportsEditorService.createTransfer(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/transfers/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateTransfer(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/transfers/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteTransfer(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Awards
router.get("/seasons/:seasonId/awards", async (req, res) => {
  try {
    const result = await sportsEditorService.listAwards(req.params.seasonId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/players/:playerId/awards", async (req, res) => {
  try {
    const result = await sportsEditorService.listAwardsByPlayer(req.params.playerId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/awards", async (req, res) => {
  try {
    const result = await sportsEditorService.createAward(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/awards/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteAward(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Templates
router.get("/templates", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await sportsEditorService.listTemplates(Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/templates/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.getTemplate(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const result = await sportsEditorService.createTemplate(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/templates/:id", async (req, res) => {
  try {
    const result = await sportsEditorService.updateTemplate(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/templates/:id", async (req, res) => {
  try {
    await sportsEditorService.deleteTemplate(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Import
router.post("/import", async (req, res) => {
  try {
    const { importedBy } = req.body;
    const result = await sportsImporter.importLeague(req.body, importedBy);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Runtime Simulation
router.post("/leagues/:leagueId/runtime/start-season", async (req, res) => {
  try {
    const { seasonId } = req.body;
    const result = await sportsRuntimeBridge.startSeason(req.params.leagueId, seasonId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:leagueId/runtime/end-season", async (req, res) => {
  try {
    const { seasonId } = req.body;
    const result = await sportsRuntimeBridge.endSeason(req.params.leagueId, seasonId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/schedule-match", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.scheduleMatch(req.body.seasonId, req.body.homeTeamId, req.body.awayTeamId, req.body.scheduledDate, req.body.stadiumId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/matches/:id/start", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.startMatch(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/matches/:id/pause", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.pauseMatch(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/matches/:id/resume", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.resumeMatch(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/matches/:id/finish", async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const result = await sportsRuntimeBridge.finishMatch(req.params.id, homeScore, awayScore);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/record-goal", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.recordGoal(req.body.matchId, req.body.playerId, req.body.teamId, req.body.minute, req.body.assistPlayerId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/record-assist", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.recordAssist(req.body.matchId, req.body.playerId, req.body.minute);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/record-card", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.recordCard(req.body.matchId, req.body.playerId, req.body.cardType, req.body.minute);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/record-substitution", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.recordSubstitution(req.body.matchId, req.body.substitutionInId, req.body.substitutionOutId, req.body.minute);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/update-ranking", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.updateRanking(req.body.seasonId, req.body.teamId, req.body.goalsFor, req.body.goalsAgainst);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/transfer-player", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.transferPlayer(req.body.playerId, req.body.fromClubId, req.body.toClubId, req.body.transferFee, req.body.contractLength, req.body.salary);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/train-player", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.trainPlayer(req.body.teamId, req.body.playerId, req.body.trainingType, req.body.duration, req.body.focus);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/award-champion", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.awardChampion(req.body.seasonId, req.body.teamId, req.body.awardType);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/leagues/:leagueId/runtime/simulate", async (req, res) => {
  try {
    const result = await sportsRuntimeBridge.simulateLeague(req.params.leagueId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
