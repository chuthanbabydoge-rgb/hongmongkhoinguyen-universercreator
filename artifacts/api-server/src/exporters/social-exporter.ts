import crypto from "crypto";
import { socialRepository } from "../repositories/social-repository";

export class SocialExporter {
  async exportGroup(groupId: string, format: "json" | "template" | "package" = "json", exportedBy: string) {
    const group = await socialRepository.findGroupById(groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);
    const members = await socialRepository.findMembersByGroup(groupId);
    const channels = await socialRepository.findChannelsByGroup(groupId);
    const messages = await Promise.all(channels.flatMap(c => socialRepository.findMessagesByChannel(c.id)));
    const posts = await socialRepository.findPostsByGroup(groupId);
    const comments = await Promise.all(posts.flatMap(p => socialRepository.findCommentsByPost(p.id)));
    const events = await socialRepository.findSocialEventsByGroup(groupId);
    const voiceRooms = await Promise.all(channels.filter(c => c.isVoice).flatMap(c => socialRepository.findVoiceRoomsByChannel(c.id)));

    const payload = {
      exportVersion: "1.0.0",
      format,
      exportedAt: new Date().toISOString(),
      group,
      members,
      channels,
      messages,
      posts,
      comments,
      events,
      voiceRooms,
    };

    const json = JSON.stringify(payload);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    const record = await socialRepository.createSocialExport({ groupId, format, payload: payload as any, checksum, exportedBy });
    return { ...record, data: payload };
  }
}

export const socialExporter = new SocialExporter();
