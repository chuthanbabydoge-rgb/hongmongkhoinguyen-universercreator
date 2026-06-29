import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";

// Enums
export const socialGroupTypeEnum = ["guild", "clan", "organization", "community", "party", "family", "school", "company"] as const;
export const memberRoleEnum = ["owner", "admin", "moderator", "manager", "member", "guest"] as const;
export const friendStatusEnum = ["pending", "accepted", "blocked", "removed"] as const;
export const messageTypeEnum = ["text", "image", "audio", "video", "system"] as const;
export const channelTypeEnum = ["global", "guild", "party", "private", "voice", "announcement"] as const;
export const postVisibilityEnum = ["private", "friends", "group", "public"] as const;
export const reputationTypeEnum = ["positive", "neutral", "negative"] as const;
export const eventStatusEnum = ["scheduled", "active", "completed", "cancelled"] as const;

// Tables
export const creatorSocialGroups = pgTable("creator_social_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  groupType: text("group_type").notNull().$type<typeof socialGroupTypeEnum[number]>(),
  icon: text("icon"),
  banner: text("banner"),
  ownerId: uuid("owner_id").notNull(),
  maxMembers: integer("max_members").default(100),
  isPublic: boolean("is_public").default(true),
  isInviteOnly: boolean("is_invite_only").default(false),
  isTemplate: boolean("is_template").default(false),
  isPublished: boolean("is_published").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  typeIdx: index("social_group_type_idx").on(table.groupType),
  ownerIdx: index("social_group_owner_idx").on(table.ownerId),
}));

export const creatorSocialMembers = pgTable("creator_social_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().$type<typeof memberRoleEnum[number]>().default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
  isOnline: boolean("is_online").default(false),
  lastSeenAt: timestamp("last_seen_at"),
  nickname: text("nickname"),
  permissions: jsonb("permissions").$type<string[]>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_member_group_idx").on(table.groupId),
  userIdx: index("social_member_user_idx").on(table.userId),
  roleIdx: index("social_member_role_idx").on(table.role),
}));

export const creatorFriendships = pgTable("creator_friendships", {
  id: uuid("id").defaultRandom().primaryKey(),
  requesterId: uuid("requester_id").notNull(),
  receiverId: uuid("receiver_id").notNull(),
  status: text("status").notNull().$type<typeof friendStatusEnum[number]>().default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  blockedAt: timestamp("blocked_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  requesterIdx: index("friendship_requester_idx").on(table.requesterId),
  receiverIdx: index("friendship_receiver_idx").on(table.receiverId),
  statusIdx: index("friendship_status_idx").on(table.status),
}));

export const creatorMessages = pgTable("creator_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  channelId: uuid("channel_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  messageType: text("message_type").notNull().$type<typeof messageTypeEnum[number]>().default("text"),
  content: text("content").notNull(),
  replyToId: uuid("reply_to_id"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  reactions: jsonb("reactions").$type<Record<string, string[]>>(),
  attachments: jsonb("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  channelIdx: index("message_channel_idx").on(table.channelId),
  senderIdx: index("message_sender_idx").on(table.senderId),
  createdAtIdx: index("message_created_idx").on(table.createdAt),
}));

export const creatorChannels = pgTable("creator_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  channelType: text("channel_type").notNull().$type<typeof channelTypeEnum[number]>(),
  isPrivate: boolean("is_private").default(false),
  isVoice: boolean("is_voice").default(false),
  position: integer("position").default(0),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("channel_group_idx").on(table.groupId),
  typeIdx: index("channel_type_idx").on(table.channelType),
  positionIdx: index("channel_position_idx").on(table.groupId, table.position),
}));

export const creatorPosts = pgTable("creator_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").notNull(),
  groupId: uuid("group_id").references(() => creatorSocialGroups.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  visibility: text("visibility").notNull().$type<typeof postVisibilityEnum[number]>().default("public"),
  images: jsonb("images").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  authorIdx: index("post_author_idx").on(table.authorId),
  groupIdx: index("post_group_idx").on(table.groupId),
  visibilityIdx: index("post_visibility_idx").on(table.visibility),
  createdAtIdx: index("post_created_idx").on(table.createdAt),
}));

export const creatorComments = pgTable("creator_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().references(() => creatorPosts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull(),
  parentId: uuid("parent_id"),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  postIdx: index("comment_post_idx").on(table.postId),
  authorIdx: index("comment_author_idx").on(table.authorId),
  parentIdx: index("comment_parent_idx").on(table.parentId),
}));

export const creatorReactions = pgTable("creator_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  userIdx: index("reaction_user_idx").on(table.userId),
  targetIdx: index("reaction_target_idx").on(table.targetType, table.targetId),
}));

export const creatorNotifications = pgTable("creator_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  userIdx: index("notification_user_idx").on(table.userId),
  isReadIdx: index("notification_read_idx").on(table.isRead),
  createdAtIdx: index("notification_created_idx").on(table.createdAt),
}));

export const creatorReputation = pgTable("creator_reputation", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  fromUserId: uuid("from_user_id").notNull(),
  reputationType: text("reputation_type").notNull().$type<typeof reputationTypeEnum[number]>(),
  score: integer("score").default(0),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  userIdx: index("reputation_user_idx").on(table.userId),
  fromUserIdx: index("reputation_from_user_idx").on(table.fromUserId),
  typeIdx: index("reputation_type_idx").on(table.reputationType),
}));

export const creatorSocialEvents = pgTable("creator_social_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  organizerId: uuid("organizer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  eventStatus: text("event_status").notNull().$type<typeof eventStatusEnum[number]>().default("scheduled"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  maxAttendees: integer("max_attendees"),
  attendeeCount: integer("attendee_count").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_event_group_idx").on(table.groupId),
  organizerIdx: index("social_event_organizer_idx").on(table.organizerId),
  statusIdx: index("social_event_status_idx").on(table.eventStatus),
  dateIdx: index("social_event_date_idx").on(table.scheduledDate),
}));

export const creatorParties = pgTable("creator_parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  leaderId: uuid("leader_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members").default(4),
  currentMembers: integer("current_members").default(1),
  isPublic: boolean("is_public").default(true),
  isLookingForMembers: boolean("is_looking_for_members").default(true),
  activityType: text("activity_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  disbandedAt: timestamp("disbanded_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  leaderIdx: index("party_leader_idx").on(table.leaderId),
  isLookingIdx: index("party_looking_idx").on(table.isLookingForMembers),
}));

export const creatorVoiceRooms = pgTable("creator_voice_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  channelId: uuid("channel_id").notNull().references(() => creatorChannels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  channelIdx: index("voice_room_channel_idx").on(table.channelId),
  isLockedIdx: index("voice_room_locked_idx").on(table.isLocked),
}));

export const creatorSocialTemplates = pgTable("creator_social_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  groupType: text("group_type").notNull().$type<typeof socialGroupTypeEnum[number]>(),
  templateData: jsonb("template_data").notNull().$type<Record<string, unknown>>(),
  isPublic: boolean("is_public").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  typeIdx: index("social_template_type_idx").on(table.groupType),
}));

export const creatorSocialVersions = pgTable("creator_social_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  changelog: text("changelog"),
  snapshot: jsonb("snapshot").notNull().$type<Record<string, unknown>>(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_version_group_idx").on(table.groupId),
  versionIdx: index("social_version_version_idx").on(table.groupId, table.version),
}));

export const creatorSocialHistory = pgTable("creator_social_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_history_group_idx").on(table.groupId),
  entityIdx: index("social_history_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("social_history_created_idx").on(table.createdAt),
}));

export const creatorSocialStatistics = pgTable("creator_social_statistics", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  totalMembers: integer("total_members").default(0),
  onlineMembers: integer("online_members").default(0),
  totalMessages: integer("total_messages").default(0),
  totalPosts: integer("total_posts").default(0),
  totalEvents: integer("total_events").default(0),
  activeVoiceRooms: integer("active_voice_rooms").default(0),
  reputationScore: integer("reputation_score").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_statistics_group_idx").on(table.groupId),
}));

export const creatorSocialExports = pgTable("creator_social_exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  format: text("format").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  checksum: text("checksum").notNull(),
  exportedBy: uuid("exported_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_export_group_idx").on(table.groupId),
}));

export const creatorSocialImports = pgTable("creator_social_imports", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => creatorSocialGroups.id, { onDelete: "set null" }),
  format: text("format").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  checksum: text("checksum").notNull(),
  importedBy: uuid("imported_by").notNull(),
  errors: jsonb("errors").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_import_group_idx").on(table.groupId),
}));

export const creatorSocialRuntime = pgTable("creator_social_runtime", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => creatorSocialGroups.id, { onDelete: "cascade" }),
  isSimulating: boolean("is_simulating").default(false),
  simulationTick: integer("simulation_tick").default(0),
  activityLevel: integer("activity_level").default(0),
  engagementScore: integer("engagement_score").default(0),
  lastSimulatedAt: timestamp("last_simulated_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  groupIdx: index("social_runtime_group_idx").on(table.groupId),
}));
