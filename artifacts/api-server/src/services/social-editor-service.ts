import { socialRepository } from "../repositories/social-repository";

export class SocialEditorService {
  // Social Groups
  async listGroups(limit = 50, offset = 0) {
    return socialRepository.findAllGroups(limit, offset);
  }

  async getGroup(id: string) {
    const group = await socialRepository.findGroupById(id);
    if (!group) throw new Error("Group not found");
    return group;
  }

  async createGroup(data: any) {
    return socialRepository.createGroup(data);
  }

  async updateGroup(id: string, data: any) {
    return socialRepository.updateGroup(id, data);
  }

  async deleteGroup(id: string) {
    await socialRepository.deleteGroup(id);
  }

  async publishGroup(id: string) {
    return socialRepository.updateGroup(id, { isPublished: true });
  }

  async archiveGroup(id: string) {
    return socialRepository.deleteGroup(id);
  }

  async duplicateGroup(id: string, createdBy: string) {
    const original = await socialRepository.findGroupById(id);
    if (!original) throw new Error("Group not found");
    const { id: _, createdAt, updatedAt, ...data } = original;
    return socialRepository.createGroup({ ...data, name: `${data.name} (Copy)`, createdBy, isPublished: false });
  }

  async saveVersion(id: string, createdBy: string, changelog?: string) {
    const group = await socialRepository.findGroupById(id);
    if (!group) throw new Error("Group not found");
    const versions = await socialRepository.findVersionsByGroup(id);
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;
    return socialRepository.createVersion({
      groupId: id,
      version: nextVersion,
      changelog,
      snapshot: group,
      createdBy,
    });
  }

  async getStats(id: string) {
    return socialRepository.findStatisticsByGroup(id);
  }

  async recalculateStats(id: string) {
    const [members, messages, posts, events, voiceRooms] = await Promise.all([
      socialRepository.findMembersByGroup(id),
      socialRepository.findChannelsByGroup(id).then(channels => Promise.all(channels.map(c => socialRepository.findMessagesByChannel(c.id))).then(arr => arr.flat())),
      socialRepository.findPostsByGroup(id),
      socialRepository.findSocialEventsByGroup(id),
      socialRepository.findChannelsByGroup(id).then(channels => Promise.all(channels.filter(c => c.isVoice).map(c => socialRepository.findVoiceRoomsByChannel(c.id))).then(arr => arr.flat())),
    ]);
    const onlineMembers = members.filter(m => m.isOnline).length;
    const activeVoiceRooms = voiceRooms.filter(v => !v.endedAt).length;
    return socialRepository.updateStatistics(id, {
      totalMembers: members.length,
      onlineMembers,
      totalMessages: messages.length,
      totalPosts: posts.length,
      totalEvents: events.length,
      activeVoiceRooms,
    });
  }

  async getHistory(id: string, limit = 50, offset = 0) {
    return socialRepository.findHistoryByGroup(id, limit, offset);
  }

  async getRuntime(id: string) {
    return socialRepository.findRuntimeByGroup(id);
  }

  // Social Members
  async listMembers(groupId: string) {
    return socialRepository.findMembersByGroup(groupId);
  }

  async getMember(id: string) {
    const member = await socialRepository.findMemberById(id);
    if (!member) throw new Error("Member not found");
    return member;
  }

  async createMember(groupId: string, data: any) {
    return socialRepository.createMember({ ...data, groupId });
  }

  async updateMember(id: string, data: any) {
    return socialRepository.updateMember(id, data);
  }

  async deleteMember(id: string) {
    await socialRepository.deleteMember(id);
  }

  // Friendships
  async listFriendships(userId: string) {
    return socialRepository.findFriendshipsByUser(userId);
  }

  async getFriendship(id: string) {
    const friendship = await socialRepository.findFriendshipById(id);
    if (!friendship) throw new Error("Friendship not found");
    return friendship;
  }

  async createFriendship(data: any) {
    return socialRepository.createFriendship(data);
  }

  async updateFriendship(id: string, data: any) {
    return socialRepository.updateFriendship(id, data);
  }

  async deleteFriendship(id: string) {
    await socialRepository.deleteFriendship(id);
  }

  // Messages
  async listMessages(channelId: string, limit = 50, offset = 0) {
    return socialRepository.findMessagesByChannel(channelId, limit, offset);
  }

  async getMessage(id: string) {
    const message = await socialRepository.findMessageById(id);
    if (!message) throw new Error("Message not found");
    return message;
  }

  async createMessage(channelId: string, data: any) {
    return socialRepository.createMessage({ ...data, channelId });
  }

  async updateMessage(id: string, data: any) {
    return socialRepository.updateMessage(id, { ...data, isEdited: true });
  }

  async deleteMessage(id: string) {
    await socialRepository.deleteMessage(id);
  }

  // Channels
  async listChannels(groupId: string) {
    return socialRepository.findChannelsByGroup(groupId);
  }

  async getChannel(id: string) {
    const channel = await socialRepository.findChannelById(id);
    if (!channel) throw new Error("Channel not found");
    return channel;
  }

  async createChannel(groupId: string, data: any) {
    return socialRepository.createChannel({ ...data, groupId });
  }

  async updateChannel(id: string, data: any) {
    return socialRepository.updateChannel(id, data);
  }

  async deleteChannel(id: string) {
    await socialRepository.deleteChannel(id);
  }

  // Posts
  async listPosts(authorId: string, limit = 50, offset = 0) {
    return socialRepository.findPostsByAuthor(authorId, limit, offset);
  }

  async listPostsByGroup(groupId: string, limit = 50, offset = 0) {
    return socialRepository.findPostsByGroup(groupId, limit, offset);
  }

  async getPost(id: string) {
    const post = await socialRepository.findPostById(id);
    if (!post) throw new Error("Post not found");
    return post;
  }

  async createPost(data: any) {
    return socialRepository.createPost(data);
  }

  async updatePost(id: string, data: any) {
    return socialRepository.updatePost(id, data);
  }

  async deletePost(id: string) {
    await socialRepository.deletePost(id);
  }

  // Comments
  async listComments(postId: string) {
    return socialRepository.findCommentsByPost(postId);
  }

  async getComment(id: string) {
    const comment = await socialRepository.findCommentById(id);
    if (!comment) throw new Error("Comment not found");
    return comment;
  }

  async createComment(postId: string, data: any) {
    return socialRepository.createComment({ ...data, postId });
  }

  async updateComment(id: string, data: any) {
    return socialRepository.updateComment(id, data);
  }

  async deleteComment(id: string) {
    await socialRepository.deleteComment(id);
  }

  // Reactions
  async listReactions(targetType: string, targetId: string) {
    return socialRepository.findReactionsByTarget(targetType, targetId);
  }

  async getReaction(id: string) {
    const reaction = await socialRepository.findReactionById(id);
    if (!reaction) throw new Error("Reaction not found");
    return reaction;
  }

  async createReaction(data: any) {
    return socialRepository.createReaction(data);
  }

  async deleteReaction(id: string) {
    await socialRepository.deleteReaction(id);
  }

  // Notifications
  async listNotifications(userId: string, limit = 50, offset = 0) {
    return socialRepository.findNotificationsByUser(userId, limit, offset);
  }

  async listUnreadNotifications(userId: string) {
    return socialRepository.findUnreadNotificationsByUser(userId);
  }

  async getNotification(id: string) {
    const notification = await socialRepository.findNotificationById(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  }

  async createNotification(data: any) {
    return socialRepository.createNotification(data);
  }

  async markAsRead(id: string) {
    return socialRepository.markNotificationAsRead(id);
  }

  async deleteNotification(id: string) {
    await socialRepository.deleteNotification(id);
  }

  // Reputation
  async listReputation(userId: string) {
    return socialRepository.findReputationByUser(userId);
  }

  async getReputation(id: string) {
    const reputation = await socialRepository.findReputationById(id);
    if (!reputation) throw new Error("Reputation not found");
    return reputation;
  }

  async createReputation(data: any) {
    return socialRepository.createReputation(data);
  }

  async deleteReputation(id: string) {
    await socialRepository.deleteReputation(id);
  }

  // Social Events
  async listSocialEvents(groupId: string) {
    return socialRepository.findSocialEventsByGroup(groupId);
  }

  async getSocialEvent(id: string) {
    const event = await socialRepository.findSocialEventById(id);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async createSocialEvent(groupId: string, data: any) {
    return socialRepository.createSocialEvent({ ...data, groupId });
  }

  async updateSocialEvent(id: string, data: any) {
    return socialRepository.updateSocialEvent(id, data);
  }

  async deleteSocialEvent(id: string) {
    await socialRepository.deleteSocialEvent(id);
  }

  // Parties
  async listParties(leaderId: string) {
    return socialRepository.findPartiesByLeader(leaderId);
  }

  async listLookingForParties() {
    return socialRepository.findLookingForParties();
  }

  async getParty(id: string) {
    const party = await socialRepository.findPartyById(id);
    if (!party) throw new Error("Party not found");
    return party;
  }

  async createParty(data: any) {
    return socialRepository.createParty(data);
  }

  async updateParty(id: string, data: any) {
    return socialRepository.updateParty(id, data);
  }

  async deleteParty(id: string) {
    await socialRepository.deleteParty(id);
  }

  // Voice Rooms
  async listVoiceRooms(channelId: string) {
    return socialRepository.findVoiceRoomsByChannel(channelId);
  }

  async getVoiceRoom(id: string) {
    const room = await socialRepository.findVoiceRoomById(id);
    if (!room) throw new Error("Voice room not found");
    return room;
  }

  async createVoiceRoom(channelId: string, data: any) {
    return socialRepository.createVoiceRoom({ ...data, channelId });
  }

  async updateVoiceRoom(id: string, data: any) {
    return socialRepository.updateVoiceRoom(id, data);
  }

  async deleteVoiceRoom(id: string) {
    await socialRepository.deleteVoiceRoom(id);
  }

  // Templates
  async listTemplates(limit = 50, offset = 0) {
    return socialRepository.findAllTemplates(limit, offset);
  }

  async getTemplate(id: string) {
    const template = await socialRepository.findTemplateById(id);
    if (!template) throw new Error("Template not found");
    return template;
  }

  async createTemplate(data: any) {
    return socialRepository.createTemplate(data);
  }

  async updateTemplate(id: string, data: any) {
    return socialRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string) {
    await socialRepository.deleteTemplate(id);
  }
}

export const socialEditorService = new SocialEditorService();
