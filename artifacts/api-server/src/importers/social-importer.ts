import { socialRepository } from "../repositories/social-repository";

export class SocialImporter {
  async importGroup(payload: Record<string, unknown>, importedBy: string) {
    const { group, members, channels, messages, posts, comments, reactions, events, parties, voiceRooms } = payload as any;

    if (!group) throw new Error("Invalid group export: missing group");

    const { id: _id, createdAt, updatedAt, ...groupData } = group;
    const created = await socialRepository.createGroup({ ...groupData, createdBy: importedBy, isPublished: false });

    const errors: string[] = [];
    const importGroup = async (items: unknown[], fn: (data: Record<string, unknown>) => Promise<unknown>, label: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        try {
          const { id: _id2, createdAt: _c, updatedAt: _u, ...rest } = item as any;
          await fn({ ...rest, groupId: created.id });
        } catch (e: any) {
          errors.push(`${label}: ${e.message}`);
        }
      }
    };

    await importGroup(members ?? [], d => socialRepository.createMember(d as any), "member");
    await importGroup(channels ?? [], d => socialRepository.createChannel(d as any), "channel");
    await importGroup(messages ?? [], d => socialRepository.createMessage(d as any), "message");
    await importGroup(posts ?? [], d => socialRepository.createPost(d as any), "post");
    await importGroup(comments ?? [], d => socialRepository.createComment(d as any), "comment");
    await importGroup(reactions ?? [], d => socialRepository.createReaction(d as any), "reaction");
    await importGroup(events ?? [], d => socialRepository.createSocialEvent(d as any), "event");
    await importGroup(parties ?? [], d => socialRepository.createParty(d as any), "party");
    await importGroup(voiceRooms ?? [], d => socialRepository.createVoiceRoom(d as any), "voice_room");

    await socialRepository.createSocialImport({
      groupId: created.id,
      format: "json",
      payload: payload as any,
      checksum: "pending",
      importedBy,
      errors,
    });

    return { groupId: created.id, errors };
  }
}

export const socialImporter = new SocialImporter();
