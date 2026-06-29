import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, decimal, index } from "drizzle-orm/pg-core";

// Enums
export const sportTypeEnum = ["football", "basketball", "baseball", "volleyball", "tennis", "martial_art", "racing", "esports"] as const;
export const leagueStatusEnum = ["draft", "active", "completed", "archived"] as const;
export const matchStatusEnum = ["scheduled", "live", "paused", "finished", "cancelled"] as const;
export const playerPositionEnum = ["goalkeeper", "defender", "midfielder", "forward", "coach", "substitute"] as const;
export const competitionTypeEnum = ["league", "cup", "tournament", "friendly"] as const;
export const transferStatusEnum = ["pending", "approved", "rejected", "completed"] as const;
export const trainingTypeEnum = ["fitness", "technical", "tactical", "mental", "recovery"] as const;
export const awardTypeEnum = ["champion", "runner_up", "mvp", "golden_boot", "golden_glove"] as const;

// Tables
export const creatorSports = pgTable("creator_sports", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  sportType: text("sport_type").notNull().$type<typeof sportTypeEnum[number]>(),
  description: text("description"),
  rules: text("rules"),
  isTeamSport: boolean("is_team_sport").default(true),
  teamSize: integer("team_size"),
  matchDuration: integer("match_duration").default(90),
  isTemplate: boolean("is_template").default(false),
  isPublished: boolean("is_published").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  typeIdx: index("sport_type_idx").on(table.sportType),
}));

export const creatorLeagues = pgTable("creator_leagues", {
  id: uuid("id").defaultRandom().primaryKey(),
  sportId: uuid("sport_id").notNull().references(() => creatorSports.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  leagueStatus: text("league_status").notNull().$type<typeof leagueStatusEnum[number]>().default("draft"),
  nationId: uuid("nation_id"),
  cityId: uuid("city_id"),
  foundedYear: integer("founded_year"),
  numberOfTeams: integer("number_of_teams"),
  promotionSlots: integer("promotion_slots").default(0),
  relegationSlots: integer("relegation_slots").default(0),
  isTemplate: boolean("is_template").default(false),
  isPublished: boolean("is_published").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  sportIdx: index("league_sport_idx").on(table.sportId),
  nationIdx: index("league_nation_idx").on(table.nationId),
  statusIdx: index("league_status_idx").on(table.leagueStatus),
}));

export const creatorSeasons = pgTable("creator_seasons", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").notNull().references(() => creatorLeagues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(false),
  isCompleted: boolean("is_completed").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("season_league_idx").on(table.leagueId),
  yearIdx: index("season_year_idx").on(table.year),
}));

export const creatorClubs = pgTable("creator_clubs", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").references(() => creatorLeagues.id),
  name: text("name").notNull(),
  shortName: text("short_name"),
  description: text("description"),
  logo: text("logo"),
  colors: jsonb("colors").$type<string[]>(),
  foundedYear: integer("founded_year"),
  cityId: uuid("city_id"),
  stadiumId: uuid("stadium_id"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  isProfessional: boolean("is_professional").default(true),
  isTemplate: boolean("is_template").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("club_league_idx").on(table.leagueId),
  cityIdx: index("club_city_idx").on(table.cityId),
  stadiumIdx: index("club_stadium_idx").on(table.stadiumId),
}));

export const creatorTeams = pgTable("creator_teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").notNull().references(() => creatorClubs.id, { onDelete: "cascade" }),
  seasonId: uuid("season_id").references(() => creatorSeasons.id),
  name: text("name").notNull(),
  ageGroup: text("age_group"),
  division: text("division"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  clubIdx: index("team_club_idx").on(table.clubId),
  seasonIdx: index("team_season_idx").on(table.seasonId),
}));

export const creatorPlayers = pgTable("creator_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => creatorTeams.id, { onDelete: "set null" }),
  npcId: uuid("npc_id"),
  name: text("name").notNull(),
  position: text("position").notNull().$type<typeof playerPositionEnum[number]>(),
  jerseyNumber: integer("jersey_number"),
  height: integer("height"),
  weight: integer("weight"),
  dateOfBirth: timestamp("date_of_birth"),
  nationality: text("nationality"),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  contractExpiry: timestamp("contract_expiry"),
  isRetired: boolean("is_retired").default(false),
  isInjured: boolean("is_injured").default(false),
  injuryType: text("injury_type"),
  injuryRecoveryDate: timestamp("injury_recovery_date"),
  stats: jsonb("stats").$type<Record<string, unknown>>(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  teamIdx: index("player_team_idx").on(table.teamId),
  npcIdx: index("player_npc_idx").on(table.npcId),
  positionIdx: index("player_position_idx").on(table.position),
}));

export const creatorCoaches = pgTable("creator_coaches", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => creatorTeams.id, { onDelete: "set null" }),
  npcId: uuid("npc_id"),
  name: text("name").notNull(),
  role: text("role"),
  specialization: text("specialization"),
  experience: integer("experience"),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  contractExpiry: timestamp("contract_expiry"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  teamIdx: index("coach_team_idx").on(table.teamId),
  npcIdx: index("coach_npc_idx").on(table.npcId),
}));

export const creatorStadiums = pgTable("creator_stadiums", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubId: uuid("club_id").references(() => creatorClubs.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  cityId: uuid("city_id"),
  buildingId: uuid("building_id"),
  capacity: integer("capacity").notNull(),
  surface: text("surface"),
  hasLights: boolean("has_lights").default(true),
  hasRoof: boolean("has_roof").default(false),
  yearBuilt: integer("year_built"),
  isTemplate: boolean("is_template").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  clubIdx: index("stadium_club_idx").on(table.clubId),
  cityIdx: index("stadium_city_idx").on(table.cityId),
}));

export const creatorMatches = pgTable("creator_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonId: uuid("season_id").references(() => creatorSeasons.id),
  homeTeamId: uuid("home_team_id").notNull().references(() => creatorTeams.id),
  awayTeamId: uuid("away_team_id").notNull().references(() => creatorTeams.id),
  stadiumId: uuid("stadium_id").references(() => creatorStadiums.id),
  competitionType: text("competition_type").notNull().$type<typeof competitionTypeEnum[number]>(),
  matchStatus: text("match_status").notNull().$type<typeof matchStatusEnum[number]>().default("scheduled"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  kickoffTime: text("kickoff_time"),
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  attendance: integer("attendance"),
  refereeId: uuid("referee_id"),
  weather: text("weather"),
  matchDay: integer("match_day"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  seasonIdx: index("match_season_idx").on(table.seasonId),
  homeTeamIdx: index("match_home_team_idx").on(table.homeTeamId),
  awayTeamIdx: index("match_away_team_idx").on(table.awayTeamId),
  stadiumIdx: index("match_stadium_idx").on(table.stadiumId),
  statusIdx: index("match_status_idx").on(table.matchStatus),
  dateIdx: index("match_date_idx").on(table.scheduledDate),
}));

export const creatorMatchEvents = pgTable("creator_match_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id").notNull().references(() => creatorMatches.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").references(() => creatorPlayers.id),
  eventType: text("event_type").notNull(),
  eventTime: integer("event_time").notNull(),
  description: text("description"),
  assistPlayerId: uuid("assist_player_id").references(() => creatorPlayers.id),
  cardType: text("card_type"),
  substitutionInId: uuid("substitution_in_id").references(() => creatorPlayers.id),
  substitutionOutId: uuid("substitution_out_id").references(() => creatorPlayers.id),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  matchIdx: index("match_event_match_idx").on(table.matchId),
  playerIdx: index("match_event_player_idx").on(table.playerId),
}));

export const creatorRankings = pgTable("creator_rankings", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonId: uuid("season_id").notNull().references(() => creatorSeasons.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").notNull().references(() => creatorTeams.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  points: integer("points").default(0),
  matchesPlayed: integer("matches_played").default(0),
  wins: integer("wins").default(0),
  draws: integer("draws").default(0),
  losses: integer("losses").default(0),
  goalsFor: integer("goals_for").default(0),
  goalsAgainst: integer("goals_against").default(0),
  goalDifference: integer("goal_difference").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  seasonIdx: index("ranking_season_idx").on(table.seasonId),
  teamIdx: index("ranking_team_idx").on(table.teamId),
  positionIdx: index("ranking_position_idx").on(table.seasonId, table.position),
}));

export const creatorTraining = pgTable("creator_training", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => creatorTeams.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").references(() => creatorPlayers.id),
  trainingType: text("training_type").notNull().$type<typeof trainingTypeEnum[number]>(),
  date: timestamp("date").notNull(),
  duration: integer("duration").default(60),
  intensity: text("intensity"),
  focus: text("focus"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  teamIdx: index("training_team_idx").on(table.teamId),
  playerIdx: index("training_player_idx").on(table.playerId),
  dateIdx: index("training_date_idx").on(table.date),
}));

export const creatorTransfers = pgTable("creator_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id").notNull().references(() => creatorPlayers.id, { onDelete: "cascade" }),
  fromClubId: uuid("from_club_id").references(() => creatorClubs.id),
  toClubId: uuid("to_club_id").references(() => creatorClubs.id),
  transferFee: decimal("transfer_fee", { precision: 15, scale: 2 }),
  transferStatus: text("transfer_status").notNull().$type<typeof transferStatusEnum[number]>().default("pending"),
  requestDate: timestamp("request_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  contractLength: integer("contract_length"),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  playerIdx: index("transfer_player_idx").on(table.playerId),
  fromClubIdx: index("transfer_from_club_idx").on(table.fromClubId),
  toClubIdx: index("transfer_to_club_idx").on(table.toClubId),
  statusIdx: index("transfer_status_idx").on(table.transferStatus),
}));

export const creatorAwards = pgTable("creator_awards", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonId: uuid("season_id").references(() => creatorSeasons.id),
  matchId: uuid("match_id").references(() => creatorMatches.id),
  playerId: uuid("player_id").references(() => creatorPlayers.id),
  teamId: uuid("team_id").references(() => creatorTeams.id),
  awardType: text("award_type").notNull().$type<typeof awardTypeEnum[number]>(),
  title: text("title").notNull(),
  description: text("description"),
  awardDate: timestamp("award_date").defaultNow(),
  season: text("season"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  seasonIdx: index("award_season_idx").on(table.seasonId),
  playerIdx: index("award_player_idx").on(table.playerId),
  teamIdx: index("award_team_idx").on(table.teamId),
  typeIdx: index("award_type_idx").on(table.awardType),
}));

export const creatorSportsTemplates = pgTable("creator_sports_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sportType: text("sport_type").notNull().$type<typeof sportTypeEnum[number]>(),
  templateData: jsonb("template_data").notNull().$type<Record<string, unknown>>(),
  isPublic: boolean("is_public").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  typeIdx: index("sports_template_type_idx").on(table.sportType),
}));

export const creatorSportsVersions = pgTable("creator_sports_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").notNull().references(() => creatorLeagues.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  changelog: text("changelog"),
  snapshot: jsonb("snapshot").notNull().$type<Record<string, unknown>>(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("sports_version_league_idx").on(table.leagueId),
  versionIdx: index("sports_version_version_idx").on(table.leagueId, table.version),
}));

export const creatorSportsHistory = pgTable("creator_sports_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").references(() => creatorLeagues.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("sports_history_league_idx").on(table.leagueId),
  entityIdx: index("sports_history_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("sports_history_created_idx").on(table.createdAt),
}));

export const creatorSportsStatistics = pgTable("creator_sports_statistics", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").notNull().references(() => creatorLeagues.id, { onDelete: "cascade" }),
  totalClubs: integer("total_clubs").default(0),
  totalPlayers: integer("total_players").default(0),
  totalMatches: integer("total_matches").default(0),
  totalGoals: integer("total_goals").default(0),
  averageAttendance: decimal("average_attendance", { precision: 10, scale: 2 }),
  totalTransfers: integer("total_transfers").default(0),
  totalTransferValue: decimal("total_transfer_value", { precision: 15, scale: 2 }),
  activeSeasons: integer("active_seasons").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("sports_statistics_league_idx").on(table.leagueId),
}));

export const creatorSportsExports = pgTable("creator_sports_exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").notNull().references(() => creatorLeagues.id, { onDelete: "cascade" }),
  format: text("format").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  checksum: text("checksum").notNull(),
  exportedBy: uuid("exported_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("sports_export_league_idx").on(table.leagueId),
}));

export const creatorSportsRuntime = pgTable("creator_sports_runtime", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id").notNull().references(() => creatorLeagues.id, { onDelete: "cascade" }),
  isSimulating: boolean("is_simulating").default(false),
  currentSeasonId: uuid("current_season_id").references(() => creatorSeasons.id),
  currentMatchDay: integer("current_match_day").default(1),
  simulationTick: integer("simulation_tick").default(0),
  seasonProgress: decimal("season_progress", { precision: 5, scale: 2 }).default("0"),
  lastSimulatedAt: timestamp("last_simulated_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leagueIdx: index("sports_runtime_league_idx").on(table.leagueId),
}));
