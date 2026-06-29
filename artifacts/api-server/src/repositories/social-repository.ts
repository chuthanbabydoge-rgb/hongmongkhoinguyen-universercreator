import { db } from "@workspace/db";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";
import {
  creatorSocialGroups,
  creatorSocialMembers,
  creatorFriendships,
  creatorMessages,
  creatorChannels,
  creatorPosts,
  creatorComments,
  creatorReactions,
  creatorNotifications,
  creatorReputation,
  creatorSocialEvents,
  creatorParties,
  creatorVoiceRooms,
  creatorSocialTemplates,
  creatorSocialVersions,
  creatorSocialHistory,
  creatorSocialStatistics,
  creatorSocialExports,
  creatorSocialImports,
  creatorSocialRuntime,
} from "@workspace/db";

export class SocialRepository {
  // Social Groups
  async findGroupById(id: string) {
    const [group] = await db.select().from(creatorSocialGroups).where(eq(creatorSocialGroups.id, id));
    return group;
  }

  async findAllGroups(limit = 50, offset = 0) {
    return db.select().from(creatorSocialGroups).limit(limit).offset(offset).orderBy(desc(creatorSocialGroups.createdAt));
  }

  async findGroupsByOwner(ownerId: string) {
    return db.select().from(creatorSocialGroups).where(eq(creatorSocialGroups.ownerId, ownerId));
  }

  async createGroup(data: typeof creatorSocialGroups.$inferInsert) {
    const [group] = await db.insert(creatorSocialGroups).values(data).returning();
    return group;
  }

  async updateGroup(id: string, data: Partial<typeof creatorSocialGroups.$inferInsert>) {
    const [group] = await db.update(creatorSocialGroups).set({ ...data, updatedAt: new Date() }).where(eq(creatorSocialGroups.id, id)).returning();
    return group;
  }

  async deleteGroup(id: string) {
    await db.delete(creatorSocialGroups).where(eq(creatorSocialGroups.id, id));
  }

  // Social Members
  async findMemberById(id: string) {
    const [member] = await db.select().from(creatorSocialMembers).where(eq(creatorSocialMembers.id, id));
    return member;
  }

  async findMembersByGroup(groupId: string) {
    return db.select().from(creatorSocialMembers).where(eq(creatorSocialMembers.groupId, groupId));
  }

  async findMemberByUserAndGroup(userId: string, groupId: string) {
    const [member] = await db.select().from(creatorSocialMembers).where(
      and(eq(creatorSocialMembers.userId, userId), eq(creatorSocialMembers.groupId, groupId))
    );
    return member;
  }

  async createMember(data: typeof creatorSocialMembers.$inferInsert) {
    const [member] = await db.insert(creatorSocialMembers).values(data).returning();
    return member;
  }

  async updateMember(id: string, data: Partial<typeof creatorSocialMembers.$inferInsert>) {
    const [member] = await db.update(creatorSocialMembers).set(data).where(eq(creatorSocialMembers.id, id)).returning();
    return member;
  }

  async deleteMember(id: string) {
    await db.delete(creatorSocialMembers).where(eq(creatorSocialMembers.id, id));
  }

  // Friendships
  async findFriendshipById(id: string) {
    const [friendship] = await db.select().from(creatorFriendships).where(eq(creatorFriendships.id, id));
    return friendship;
  }

  async findFriendshipsByUser(userId: string) {
    return db.select().from(creatorFriendships).where(
      or(eq(creatorFriendships.requesterId, userId), eq(creatorFriendships.receiverId, userId))
    ).orderBy(desc(creatorFriendships.requestedAt));
  }

  async findFriendshipBetweenUsers(userId1: string, userId2: string) {
    const [friendship] = await db.select().from(creatorFriendships).where(
      or(
        and(eq(creatorFriendships.requesterId, userId1), eq(creatorFriendships.receiverId, userId2)),
        and(eq(creatorFriendships.requesterId, userId2), eq(creatorFriendships.receiverId, userId1))
      )
    );
    return friendship;
  }

  async createFriendship(data: typeof creatorFriendships.$inferInsert) {
    const [friendship] = await db.insert(creatorFriendships).values(data).returning();
    return friendship;
  }

  async updateFriendship(id: string, data: Partial<typeof creatorFriendships.$inferInsert>) {
    const [friendship] = await db.update(creatorFriendships).set(data).where(eq(creatorFriendships.id, id)).returning();
    return friendship;
  }

  async deleteFriendship(id: string) {
    await db.delete(creatorFriendships).where(eq(creatorFriendships.id, id));
  }

  // Messages
  async findMessageById(id: string) {
    const [message] = await db.select().from(creatorMessages).where(eq(creatorMessages.id, id));
    return message;
  }

  async findMessagesByChannel(channelId: string, limit = 50, offset = 0) {
    return db.select().from(creatorMessages).where(eq(creatorMessages.channelId, channelId)).limit(limit).offset(offset).orderBy(desc(creatorMessages.createdAt));
  }

  async createMessage(data: typeof creatorMessages.$inferInsert) {
    const [message] = await db.insert(creatorMessages).values(data).returning();
    return message;
  }

  async updateMessage(id: string, data: Partial<typeof creatorMessages.$inferInsert>) {
    const [message] = await db.update(creatorMessages).set({ ...data, editedAt: new Date() }).where(eq(creatorMessages.id, id)).returning();
    return message;
  }

  async deleteMessage(id: string) {
    await db.update(creatorMessages).set({ isDeleted: true, deletedAt: new Date() }).where(eq(creatorMessages.id, id));
  }

  // Channels
  async findChannelById(id: string) {
    const [channel] = await db.select().from(creatorChannels).where(eq(creatorChannels.id, id));
    return channel;
  }

  async findChannelsByGroup(groupId: string) {
    return db.select().from(creatorChannels).where(eq(creatorChannels.groupId, groupId)).orderBy(asc(creatorChannels.position));
  }

  async createChannel(data: typeof creatorChannels.$inferInsert) {
    const [channel] = await db.insert(creatorChannels).values(data).returning();
    return channel;
  }

  async updateChannel(id: string, data: Partial<typeof creatorChannels.$inferInsert>) {
    const [channel] = await db.update(creatorChannels).set({ ...data, updatedAt: new Date() }).where(eq(creatorChannels.id, id)).returning();
    return channel;
  }

  async deleteChannel(id: string) {
    await db.delete(creatorChannels).where(eq(creatorChannels.id, id));
  }

  // Posts
  async findPostById(id: string) {
    const [post] = await db.select().from(creatorPosts).where(eq(creatorPosts.id, id));
    return post;
  }

  async findPostsByAuthor(authorId: string, limit = 50, offset = 0) {
    return db.select().from(creatorPosts).where(eq(creatorPosts.authorId, authorId)).limit(limit).offset(offset).orderBy(desc(creatorPosts.createdAt));
  }

  async findPostsByGroup(groupId: string, limit = 50, offset = 0) {
    return db.select().from(creatorPosts).where(eq(creatorPosts.groupId, groupId)).limit(limit).offset(offset).orderBy(desc(creatorPosts.createdAt));
  }

  async createPost(data: typeof creatorPosts.$inferInsert) {
    const [post] = await db.insert(creatorPosts).values(data).returning();
    return post;
  }

  async updatePost(id: string, data: Partial<typeof creatorPosts.$inferInsert>) {
    const [post] = await db.update(creatorPosts).set({ ...data, updatedAt: new Date() }).where(eq(creatorPosts.id, id)).returning();
    return post;
  }

  async deletePost(id: string) {
    await db.delete(creatorPosts).where(eq(creatorPosts.id, id));
  }

  // Comments
  async findCommentById(id: string) {
    const [comment] = await db.select().from(creatorComments).where(eq(creatorComments.id, id));
    return comment;
  }

  async findCommentsByPost(postId: string) {
    return db.select().from(creatorComments).where(eq(creatorComments.postId, postId)).orderBy(asc(creatorComments.createdAt));
  }

  async createComment(data: typeof creatorComments.$inferInsert) {
    const [comment] = await db.insert(creatorComments).values(data).returning();
    return comment;
  }

  async updateComment(id: string, data: Partial<typeof creatorComments.$inferInsert>) {
    const [comment] = await db.update(creatorComments).set({ ...data, updatedAt: new Date() }).where(eq(creatorComments.id, id)).returning();
    return comment;
  }

  async deleteComment(id: string) {
    await db.update(creatorComments).set({ isDeleted: true, deletedAt: new Date() }).where(eq(creatorComments.id, id));
  }

  // Reactions
  async findReactionById(id: string) {
    const [reaction] = await db.select().from(creatorReactions).where(eq(creatorReactions.id, id));
    return reaction;
  }

  async findReactionsByTarget(targetType: string, targetId: string) {
    return db.select().from(creatorReactions).where(
      and(eq(creatorReactions.targetType, targetType), eq(creatorReactions.targetId, targetId))
    );
  }

  async createReaction(data: typeof creatorReactions.$inferInsert) {
    const [reaction] = await db.insert(creatorReactions).values(data).returning();
    return reaction;
  }

  async deleteReaction(id: string) {
    await db.delete(creatorReactions).where(eq(creatorReactions.id, id));
  }

  // Notifications
  async findNotificationById(id: string) {
    const [notification] = await db.select().from(creatorNotifications).where(eq(creatorNotifications.id, id));
    return notification;
  }

  async findNotificationsByUser(userId: string, limit = 50, offset = 0) {
    return db.select().from(creatorNotifications).where(eq(creatorNotifications.userId, userId)).limit(limit).offset(offset).orderBy(desc(creatorNotifications.createdAt));
  }

  async findUnreadNotificationsByUser(userId: string) {
    return db.select().from(creatorNotifications).where(
      and(eq(creatorNotifications.userId, userId), eq(creatorNotifications.isRead, false))
    ).orderBy(desc(creatorNotifications.createdAt));
  }

  async createNotification(data: typeof creatorNotifications.$inferInsert) {
    const [notification] = await db.insert(creatorNotifications).values(data).returning();
    return notification;
  }

  async markNotificationAsRead(id: string) {
    const [notification] = await db.update(creatorNotifications).set({ isRead: true, readAt: new Date() }).where(eq(creatorNotifications.id, id)).returning();
    return notification;
  }

  async deleteNotification(id: string) {
    await db.delete(creatorNotifications).where(eq(creatorNotifications.id, id));
  }

  // Reputation
  async findReputationById(id: string) {
    const [reputation] = await db.select().from(creatorReputation).where(eq(creatorReputation.id, id));
    return reputation;
  }

  async findReputationByUser(userId: string) {
    return db.select().from(creatorReputation).where(eq(creatorReputation.userId, userId)).orderBy(desc(creatorReputation.createdAt));
  }

  async listReputation(userId: string) {
    return db.select().from(creatorReputation).where(eq(creatorReputation.userId, userId)).orderBy(desc(creatorReputation.createdAt));
  }

  async createReputation(data: typeof creatorReputation.$inferInsert) {
    const [reputation] = await db.insert(creatorReputation).values(data).returning();
    return reputation;
  }

  async deleteReputation(id: string) {
    await db.delete(creatorReputation).where(eq(creatorReputation.id, id));
  }

  // Social Events
  async findSocialEventById(id: string) {
    const [event] = await db.select().from(creatorSocialEvents).where(eq(creatorSocialEvents.id, id));
    return event;
  }

  async findSocialEventsByGroup(groupId: string) {
    return db.select().from(creatorSocialEvents).where(eq(creatorSocialEvents.groupId, groupId)).orderBy(asc(creatorSocialEvents.scheduledDate));
  }

  async createSocialEvent(data: typeof creatorSocialEvents.$inferInsert) {
    const [event] = await db.insert(creatorSocialEvents).values(data).returning();
    return event;
  }

  async updateSocialEvent(id: string, data: Partial<typeof creatorSocialEvents.$inferInsert>) {
    const [event] = await db.update(creatorSocialEvents).set({ ...data, updatedAt: new Date() }).where(eq(creatorSocialEvents.id, id)).returning();
    return event;
  }

  async deleteSocialEvent(id: string) {
    await db.delete(creatorSocialEvents).where(eq(creatorSocialEvents.id, id));
  }

  // Parties
  async findPartyById(id: string) {
    const [party] = await db.select().from(creatorParties).where(eq(creatorParties.id, id));
    return party;
  }

  async findPartiesByLeader(leaderId: string) {
    return db.select().from(creatorParties).where(eq(creatorParties.leaderId, leaderId));
  }

  async findLookingForParties() {
    return db.select().from(creatorParties).where(eq(creatorParties.isLookingForMembers, true));
  }

  async createParty(data: typeof creatorParties.$inferInsert) {
    const [party] = await db.insert(creatorParties).values(data).returning();
    return party;
  }

  async updateParty(id: string, data: Partial<typeof creatorParties.$inferInsert>) {
    const [party] = await db.update(creatorParties).set({ ...data, updatedAt: new Date() }).where(eq(creatorParties.id, id)).returning();
    return party;
  }

  async deleteParty(id: string) {
    await db.update(creatorParties).set({ disbandedAt: new Date() }).where(eq(creatorParties.id, id));
  }

  // Voice Rooms
  async findVoiceRoomById(id: string) {
    const [room] = await db.select().from(creatorVoiceRooms).where(eq(creatorVoiceRooms.id, id));
    return room;
  }

  async findVoiceRoomsByChannel(channelId: string) {
    return db.select().from(creatorVoiceRooms).where(eq(creatorVoiceRooms.channelId, channelId));
  }

  async createVoiceRoom(data: typeof creatorVoiceRooms.$inferInsert) {
    const [room] = await db.insert(creatorVoiceRooms).values(data).returning();
    return room;
  }

  async updateVoiceRoom(id: string, data: Partial<typeof creatorVoiceRooms.$inferInsert>) {
    const [room] = await db.update(creatorVoiceRooms).set(data).where(eq(creatorVoiceRooms.id, id)).returning();
    return room;
  }

  async deleteVoiceRoom(id: string) {
    await db.update(creatorVoiceRooms).set({ endedAt: new Date() }).where(eq(creatorVoiceRooms.id, id));
  }

  // Templates
  async findAllTemplates(limit = 50, offset = 0) {
    return db.select().from(creatorSocialTemplates).limit(limit).offset(offset);
  }

  async findTemplateById(id: string) {
    const [template] = await db.select().from(creatorSocialTemplates).where(eq(creatorSocialTemplates.id, id));
    return template;
  }

  async createTemplate(data: typeof creatorSocialTemplates.$inferInsert) {
    const [template] = await db.insert(creatorSocialTemplates).values(data).returning();
    return template;
  }

  async updateTemplate(id: string, data: Partial<typeof creatorSocialTemplates.$inferInsert>) {
    const [template] = await db.update(creatorSocialTemplates).set({ ...data, updatedAt: new Date() }).where(eq(creatorSocialTemplates.id, id)).returning();
    return template;
  }

  async deleteTemplate(id: string) {
    await db.delete(creatorSocialTemplates).where(eq(creatorSocialTemplates.id, id));
  }

  // Versions
  async findVersionsByGroup(groupId: string) {
    return db.select().from(creatorSocialVersions).where(eq(creatorSocialVersions.groupId, groupId)).orderBy(desc(creatorSocialVersions.version));
  }

  async createVersion(data: typeof creatorSocialVersions.$inferInsert) {
    const [version] = await db.insert(creatorSocialVersions).values(data).returning();
    return version;
  }

  // History
  async findHistoryByGroup(groupId: string, limit = 50, offset = 0) {
    return db.select().from(creatorSocialHistory).where(eq(creatorSocialHistory.groupId, groupId)).orderBy(desc(creatorSocialHistory.createdAt)).limit(limit).offset(offset);
  }

  async createHistory(data: typeof creatorSocialHistory.$inferInsert) {
    const [history] = await db.insert(creatorSocialHistory).values(data).returning();
    return history;
  }

  // Statistics
  async findStatisticsByGroup(groupId: string) {
    const [stats] = await db.select().from(creatorSocialStatistics).where(eq(creatorSocialStatistics.groupId, groupId));
    return stats;
  }

  async createStatistics(data: typeof creatorSocialStatistics.$inferInsert) {
    const [stats] = await db.insert(creatorSocialStatistics).values(data).returning();
    return stats;
  }

  async updateStatistics(groupId: string, data: Partial<typeof creatorSocialStatistics.$inferInsert>) {
    const [stats] = await db.update(creatorSocialStatistics).set({ ...data, calculatedAt: new Date() }).where(eq(creatorSocialStatistics.groupId, groupId)).returning();
    return stats;
  }

  // Exports
  async findExportsByGroup(groupId: string) {
    return db.select().from(creatorSocialExports).where(eq(creatorSocialExports.groupId, groupId)).orderBy(desc(creatorSocialExports.createdAt));
  }

  async createSocialExport(data: typeof creatorSocialExports.$inferInsert) {
    const [exportRecord] = await db.insert(creatorSocialExports).values(data).returning();
    return exportRecord;
  }

  // Imports
  async findImportsByGroup(groupId: string) {
    return db.select().from(creatorSocialImports).where(eq(creatorSocialImports.groupId, groupId)).orderBy(desc(creatorSocialImports.createdAt));
  }

  async createSocialImport(data: typeof creatorSocialImports.$inferInsert) {
    const [importRecord] = await db.insert(creatorSocialImports).values(data).returning();
    return importRecord;
  }

  // Runtime
  async findRuntimeByGroup(groupId: string) {
    const [runtime] = await db.select().from(creatorSocialRuntime).where(eq(creatorSocialRuntime.groupId, groupId));
    return runtime;
  }

  async updateSocialRuntime(groupId: string, data: Partial<typeof creatorSocialRuntime.$inferInsert>) {
    const [runtime] = await db.update(creatorSocialRuntime).set({ ...data, lastSimulatedAt: new Date() }).where(eq(creatorSocialRuntime.groupId, groupId)).returning();
    return runtime;
  }
}

export const socialRepository = new SocialRepository();
