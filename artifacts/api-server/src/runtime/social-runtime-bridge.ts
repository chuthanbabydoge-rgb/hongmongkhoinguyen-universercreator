import { socialRepository } from "../repositories/social-repository";

export class SocialRuntimeBridge {
  async createGuild(name: string, ownerId: string, description?: string) {
    const group = await socialRepository.createGroup({
      name,
      description,
      groupType: "guild",
      ownerId,
      isPublic: true,
      createdBy: ownerId,
    });
    await socialRepository.createMember({
      groupId: group.id,
      userId: ownerId,
      role: "owner",
      joinedAt: new Date(),
      isOnline: true,
    });
    return group;
  }

  async joinGuild(groupId: string, userId: string) {
    const existing = await socialRepository.findMemberByUserAndGroup(userId, groupId);
    if (existing) throw new Error("Already a member");
    return socialRepository.createMember({
      groupId,
      userId,
      role: "member",
      joinedAt: new Date(),
      isOnline: true,
    });
  }

  async leaveGuild(groupId: string, userId: string) {
    const member = await socialRepository.findMemberByUserAndGroup(userId, groupId);
    if (!member) throw new Error("Not a member");
    await socialRepository.deleteMember(member.id);
    return { success: true };
  }

  async inviteMember(groupId: string, inviterId: string, invitedUserId: string) {
    const inviter = await socialRepository.findMemberByUserAndGroup(inviterId, groupId);
    if (!inviter || (inviter.role !== "owner" && inviter.role !== "admin")) {
      throw new Error("No permission to invite");
    }
    return socialRepository.createMember({
      groupId,
      userId: invitedUserId,
      role: "member",
      joinedAt: new Date(),
      isOnline: false,
    });
  }

  async kickMember(groupId: string, kickerId: string, kickedUserId: string) {
    const kicker = await socialRepository.findMemberByUserAndGroup(kickerId, groupId);
    const kicked = await socialRepository.findMemberByUserAndGroup(kickedUserId, groupId);
    if (!kicker || !kicked) throw new Error("Member not found");
    if (kicker.role !== "owner" && kicker.role !== "admin") {
      throw new Error("No permission to kick");
    }
    await socialRepository.deleteMember(kicked.id);
    return { success: true };
  }

  async createParty(leaderId: string, name: string, maxMembers?: number) {
    return socialRepository.createParty({
      leaderId,
      name,
      maxMembers: maxMembers || 4,
      currentMembers: 1,
      isPublic: true,
      isLookingForMembers: true,
    });
  }

  async joinParty(partyId: string, userId: string) {
    const party = await socialRepository.findPartyById(partyId);
    if (!party) throw new Error("Party not found");
    if ((party.currentMembers ?? 0) >= (party.maxMembers ?? 0)) throw new Error("Party full");
    await socialRepository.updateParty(partyId, { currentMembers: (party.currentMembers ?? 0) + 1 });
    return { success: true };
  }

  async leaveParty(partyId: string, userId: string) {
    const party = await socialRepository.findPartyById(partyId);
    if (!party) throw new Error("Party not found");
    await socialRepository.updateParty(partyId, { currentMembers: Math.max(0, (party.currentMembers ?? 0) - 1) });
    return { success: true };
  }

  async sendMessage(channelId: string, senderId: string, content: string, messageType = "text") {
    return socialRepository.createMessage({
      channelId,
      senderId,
      messageType: messageType as any,
      content,
      isEdited: false,
      isDeleted: false,
      reactions: {},
      attachments: [],
    });
  }

  async editMessage(messageId: string, newContent: string) {
    return socialRepository.updateMessage(messageId, { content: newContent, isEdited: true });
  }

  async deleteMessage(messageId: string) {
    await socialRepository.deleteMessage(messageId);
    return { success: true };
  }

  async createChannel(groupId: string, name: string, channelType: string, isPrivate = false) {
    return socialRepository.createChannel({
      groupId,
      name,
      channelType: channelType as any,
      isPrivate,
      isVoice: channelType === "voice",
      position: 0,
    });
  }

  async joinVoice(channelId: string, userId: string) {
    const channel = await socialRepository.findChannelById(channelId);
    if (!channel || !channel.isVoice) throw new Error("Not a voice channel");
    const existingRoom = await socialRepository.findVoiceRoomsByChannel(channelId).then(rooms => rooms.find(r => !r.endedAt));
    if (existingRoom) {
      await socialRepository.updateVoiceRoom(existingRoom.id, { currentParticipants: (existingRoom.currentParticipants ?? 0) + 1 });
      return existingRoom;
    }
    return socialRepository.createVoiceRoom({
      channelId,
      name: `${channel.name} Voice`,
      maxParticipants: 10,
      currentParticipants: 1,
      isLocked: false,
    });
  }

  async leaveVoice(channelId: string, userId: string) {
    const rooms = await socialRepository.findVoiceRoomsByChannel(channelId);
    const activeRoom = rooms.find(r => !r.endedAt);
    if (activeRoom) {
      const newCount = Math.max(0, (activeRoom.currentParticipants ?? 0) - 1);
      if (newCount === 0) {
        await socialRepository.deleteVoiceRoom(activeRoom.id);
      } else {
        await socialRepository.updateVoiceRoom(activeRoom.id, { currentParticipants: newCount });
      }
    }
    return { success: true };
  }

  async createPost(authorId: string, groupId: string | null, content: string, visibility = "public") {
    return socialRepository.createPost({
      authorId,
      groupId,
      content,
      visibility: visibility as any,
      images: [],
      tags: [],
      likes: 0,
      commentsCount: 0,
      isPinned: false,
      isLocked: false,
    });
  }

  async addComment(postId: string, authorId: string, content: string) {
    const comment = await socialRepository.createComment({
      postId,
      authorId,
      content,
      likes: 0,
      isEdited: false,
      isDeleted: false,
    });
    const post = await socialRepository.findPostById(postId);
    if (post) {
      await socialRepository.updatePost(postId, { commentsCount: (post.commentsCount ?? 0) + 1 });
    }
    return comment;
  }

  async reactPost(postId: string, userId: string, emoji: string) {
    await socialRepository.createReaction({
      userId,
      targetType: "post",
      targetId: postId,
      emoji,
    });
    const post = await socialRepository.findPostById(postId);
    if (post) {
      await socialRepository.updatePost(postId, { likes: (post.likes ?? 0) + 1 });
    }
    return { action: "added" };
  }

  async updateReputation(userId: string, fromUserId: string, reputationType: string, score: number, reason?: string) {
    return socialRepository.createReputation({
      userId,
      fromUserId,
      reputationType: reputationType as any,
      score,
      reason,
    });
  }

  async startCommunityEvent(groupId: string, organizerId: string, name: string, scheduledDate: Date, location?: string) {
    return socialRepository.createSocialEvent({
      groupId,
      organizerId,
      name,
      eventStatus: "active",
      scheduledDate,
      location,
      maxAttendees: 100,
      attendeeCount: 0,
      isPublic: true,
    });
  }

  async endCommunityEvent(eventId: string) {
    return socialRepository.updateSocialEvent(eventId, { eventStatus: "completed" });
  }

  async simulateSocialActivity(groupId: string) {
    const runtime = await socialRepository.findRuntimeByGroup(groupId);
    if (!runtime) throw new Error("Runtime not initialized");
    const members = await socialRepository.findMembersByGroup(groupId);
    const channels = await socialRepository.findChannelsByGroup(groupId);
    const messages = await Promise.all(channels.slice(0, 3).map(c => socialRepository.findMessagesByChannel(c.id, 5, 0))).then(arr => arr.flat());
    const activityLevel = Math.floor(Math.random() * 100);
    const engagementScore = messages.length * 10 + members.length * 5;
    await socialRepository.updateSocialRuntime(groupId, {
      isSimulating: true,
      simulationTick: (runtime.simulationTick ?? 0) + 1,
      activityLevel,
      engagementScore,
    });
    return { activityLevel, engagementScore, simulationTick: (runtime.simulationTick ?? 0) + 1 };
  }
}

export const socialRuntimeBridge = new SocialRuntimeBridge();
