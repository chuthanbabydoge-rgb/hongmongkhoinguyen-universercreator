import { socialRepository } from "../repositories/social-repository";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SocialValidator {
  async validate(groupId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const group = await socialRepository.findGroupById(groupId);
    if (!group) {
      return { valid: false, errors: ["Group not found"], warnings };
    }

    // Check for duplicate group names
    const allGroups = await socialRepository.findAllGroups();
    const duplicateNames = allGroups.filter(g => g.name === group.name && g.id !== groupId);
    if (duplicateNames.length > 0) {
      errors.push("Duplicate group name detected");
    }

    // Check for orphan members
    const members = await socialRepository.findMembersByGroup(groupId);
    for (const member of members) {
      if (member.userId === group.ownerId && member.role !== "owner") {
        errors.push(`Group owner is not marked as owner in member list`);
      }
    }

    // Check for invalid role hierarchy
    const roleHierarchy = { owner: 5, admin: 4, moderator: 3, manager: 2, member: 1, guest: 0 };
    for (const member of members) {
      if (member.userId === group.ownerId && member.role !== "owner") {
        errors.push(`Owner has invalid role: ${member.role}`);
      }
    }

    // Check for invalid friendship
    const friendships = await socialRepository.findFriendshipsByUser(group.ownerId);
    for (const friendship of friendships) {
      if (friendship.status === "accepted") {
        const requesterMember = members.find(m => m.userId === friendship.requesterId);
        const receiverMember = members.find(m => m.userId === friendship.receiverId);
        if (!requesterMember || !receiverMember) {
          errors.push(`Friendship exists between non-members`);
        }
      }
    }

    // Check for invalid notification target
    const notifications = await socialRepository.findHistoryByGroup(groupId, 10, 0);
    for (const notification of notifications) {
      const member = members.find(m => m.userId === notification.userId);
      if (!member) {
        errors.push(`Notification target is not a group member`);
      }
    }

    // Check for broken party references
    const parties = await socialRepository.findPartiesByLeader(group.ownerId);
    for (const party of parties) {
      if (party.disbandedAt && party.currentMembers && party.currentMembers > 0) {
        errors.push(`Disbanded party still has members`);
      }
    }

    // Check for invalid voice room
    const channels = await socialRepository.findChannelsByGroup(groupId);
    for (const channel of channels) {
      if (channel.isVoice) {
        const voiceRooms = await socialRepository.findVoiceRoomsByChannel(channel.id);
        for (const room of voiceRooms) {
          if (room.currentParticipants && room.maxParticipants && room.currentParticipants > room.maxParticipants) {
            errors.push(`Voice room exceeds max participants`);
          }
        }
      }
    }

    // Check for circular group references
    // This would require checking if any group references itself through nested structures

    // Warnings
    if (members.length === 0) {
      warnings.push("Group has no members");
    }

    if (members.filter(m => m.isOnline).length === 0 && members.length > 0) {
      warnings.push("No members are currently online");
    }

    const inactiveChannels = channels.filter(c => {
      const messages = socialRepository.findMessagesByChannel(c.id, 1, 0);
      return messages.then(m => m.length === 0);
    });
    if (inactiveChannels.length > 0) {
      warnings.push(`${inactiveChannels.length} channels have no messages`);
    }

    const reputation = await socialRepository.listReputation(group.ownerId);
    const totalScore = reputation.reduce((sum, r) => sum + (r.score || 0), 0);
    if (Math.abs(totalScore) > 10000) {
      warnings.push("Reputation score is unusually high");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const socialValidator = new SocialValidator();
