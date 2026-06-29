import { Router } from "express";
import { socialEditorService } from "../services/social-editor-service";
import { socialValidator } from "../validators/social-validator";
import { socialExporter } from "../exporters/social-exporter";
import { socialImporter } from "../importers/social-importer";
import { socialRuntimeBridge } from "../runtime/social-runtime-bridge";

const router = Router();

// Social Groups CRUD
router.get("/", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listGroups(Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getGroup(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await socialEditorService.createGroup(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateGroup(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await socialEditorService.deleteGroup(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Group Actions
router.post("/:id/publish", async (req, res) => {
  try {
    const result = await socialEditorService.publishGroup(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const { createdBy } = req.body;
    const result = await socialEditorService.duplicateGroup(req.params.id, createdBy);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/version", async (req, res) => {
  try {
    const { createdBy, changelog } = req.body;
    const result = await socialEditorService.saveVersion(req.params.id, createdBy, changelog);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const result = await socialEditorService.getStats(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:id/stats/recalculate", async (req, res) => {
  try {
    const result = await socialEditorService.recalculateStats(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.getHistory(req.params.id, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get("/:id/runtime", async (req, res) => {
  try {
    const result = await socialEditorService.getRuntime(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:id/validate", async (req, res) => {
  try {
    const result = await socialValidator.validate(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/export", async (req, res) => {
  try {
    const { format, exportedBy } = req.body;
    const result = await socialExporter.exportGroup(req.params.id, format, exportedBy);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Members
router.get("/:groupId/members", async (req, res) => {
  try {
    const result = await socialEditorService.listMembers(req.params.groupId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/members/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getMember(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:groupId/members", async (req, res) => {
  try {
    const result = await socialEditorService.createMember(req.params.groupId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/members/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateMember(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/members/:id", async (req, res) => {
  try {
    await socialEditorService.deleteMember(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Friendships
router.get("/friendships/:userId", async (req, res) => {
  try {
    const result = await socialEditorService.listFriendships(req.params.userId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/friendships/id/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getFriendship(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/friendships", async (req, res) => {
  try {
    const result = await socialEditorService.createFriendship(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/friendships/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateFriendship(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/friendships/:id", async (req, res) => {
  try {
    await socialEditorService.deleteFriendship(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Messages
router.get("/channels/:channelId/messages", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listMessages(req.params.channelId, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/messages/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getMessage(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/channels/:channelId/messages", async (req, res) => {
  try {
    const result = await socialEditorService.createMessage(req.params.channelId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/messages/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateMessage(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    await socialEditorService.deleteMessage(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Channels
router.get("/:groupId/channels", async (req, res) => {
  try {
    const result = await socialEditorService.listChannels(req.params.groupId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/channels/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getChannel(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:groupId/channels", async (req, res) => {
  try {
    const result = await socialEditorService.createChannel(req.params.groupId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/channels/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateChannel(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/channels/:id", async (req, res) => {
  try {
    await socialEditorService.deleteChannel(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Posts
router.get("/posts/author/:authorId", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listPosts(req.params.authorId, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/posts/group/:groupId", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listPostsByGroup(req.params.groupId, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getPost(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const result = await socialEditorService.createPost(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updatePost(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    await socialEditorService.deletePost(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Comments
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const result = await socialEditorService.listComments(req.params.postId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/comments/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getComment(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const result = await socialEditorService.createComment(req.params.postId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/comments/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateComment(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/comments/:id", async (req, res) => {
  try {
    await socialEditorService.deleteComment(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Reactions
router.get("/reactions/:targetType/:targetId", async (req, res) => {
  try {
    const result = await socialEditorService.listReactions(req.params.targetType, req.params.targetId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reactions/id/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getReaction(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/reactions", async (req, res) => {
  try {
    const result = await socialEditorService.createReaction(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/reactions/:id", async (req, res) => {
  try {
    await socialEditorService.deleteReaction(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Notifications
router.get("/notifications/:userId", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listNotifications(req.params.userId, Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/notifications/:userId/unread", async (req, res) => {
  try {
    const result = await socialEditorService.listUnreadNotifications(req.params.userId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/notifications/id/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getNotification(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const result = await socialEditorService.createNotification(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    const result = await socialEditorService.markAsRead(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/notifications/:id", async (req, res) => {
  try {
    await socialEditorService.deleteNotification(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Reputation
router.get("/reputation/:userId", async (req, res) => {
  try {
    const result = await socialEditorService.listReputation(req.params.userId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reputation/id/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getReputation(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/reputation", async (req, res) => {
  try {
    const result = await socialEditorService.createReputation(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/reputation/:id", async (req, res) => {
  try {
    await socialEditorService.deleteReputation(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Social Events
router.get("/:groupId/events", async (req, res) => {
  try {
    const result = await socialEditorService.listSocialEvents(req.params.groupId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getSocialEvent(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:groupId/events", async (req, res) => {
  try {
    const result = await socialEditorService.createSocialEvent(req.params.groupId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateSocialEvent(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    await socialEditorService.deleteSocialEvent(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Parties
router.get("/parties/leader/:leaderId", async (req, res) => {
  try {
    const result = await socialEditorService.listParties(req.params.leaderId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/parties/looking", async (req, res) => {
  try {
    const result = await socialEditorService.listLookingForParties();
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/parties/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getParty(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/parties", async (req, res) => {
  try {
    const result = await socialEditorService.createParty(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/parties/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateParty(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/parties/:id", async (req, res) => {
  try {
    await socialEditorService.deleteParty(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Voice Rooms
router.get("/channels/:channelId/voice-rooms", async (req, res) => {
  try {
    const result = await socialEditorService.listVoiceRooms(req.params.channelId);
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/voice-rooms/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getVoiceRoom(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/channels/:channelId/voice-rooms", async (req, res) => {
  try {
    const result = await socialEditorService.createVoiceRoom(req.params.channelId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/voice-rooms/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateVoiceRoom(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/voice-rooms/:id", async (req, res) => {
  try {
    await socialEditorService.deleteVoiceRoom(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Templates
router.get("/templates", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await socialEditorService.listTemplates(Number(limit), Number(offset));
    res.json({ items: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/templates/:id", async (req, res) => {
  try {
    const result = await socialEditorService.getTemplate(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const result = await socialEditorService.createTemplate(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/templates/:id", async (req, res) => {
  try {
    const result = await socialEditorService.updateTemplate(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/templates/:id", async (req, res) => {
  try {
    await socialEditorService.deleteTemplate(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Import
router.post("/import", async (req, res) => {
  try {
    const { importedBy } = req.body;
    const result = await socialImporter.importGroup(req.body, importedBy);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Runtime Simulation
router.post("/runtime/create-guild", async (req, res) => {
  try {
    const { name, ownerId, description } = req.body;
    const result = await socialRuntimeBridge.createGuild(name, ownerId, description);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/guilds/:groupId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.joinGuild(req.params.groupId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/guilds/:groupId/leave", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.leaveGuild(req.params.groupId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/guilds/:groupId/invite", async (req, res) => {
  try {
    const { inviterId, invitedUserId } = req.body;
    const result = await socialRuntimeBridge.inviteMember(req.params.groupId, inviterId, invitedUserId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/guilds/:groupId/kick", async (req, res) => {
  try {
    const { kickerId, kickedUserId } = req.body;
    const result = await socialRuntimeBridge.kickMember(req.params.groupId, kickerId, kickedUserId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/create-party", async (req, res) => {
  try {
    const { leaderId, name, maxMembers } = req.body;
    const result = await socialRuntimeBridge.createParty(leaderId, name, maxMembers);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/parties/:partyId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.joinParty(req.params.partyId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/parties/:partyId/leave", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.leaveParty(req.params.partyId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/send-message", async (req, res) => {
  try {
    const { channelId, senderId, content, messageType } = req.body;
    const result = await socialRuntimeBridge.sendMessage(channelId, senderId, content, messageType);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/messages/:messageId/edit", async (req, res) => {
  try {
    const { newContent } = req.body;
    const result = await socialRuntimeBridge.editMessage(req.params.messageId, newContent);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/messages/:messageId/delete", async (req, res) => {
  try {
    const result = await socialRuntimeBridge.deleteMessage(req.params.messageId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/create-channel", async (req, res) => {
  try {
    const { groupId, name, channelType, isPrivate } = req.body;
    const result = await socialRuntimeBridge.createChannel(groupId, name, channelType, isPrivate);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/channels/:channelId/join-voice", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.joinVoice(req.params.channelId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/channels/:channelId/leave-voice", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await socialRuntimeBridge.leaveVoice(req.params.channelId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/create-post", async (req, res) => {
  try {
    const { authorId, groupId, content, visibility } = req.body;
    const result = await socialRuntimeBridge.createPost(authorId, groupId, content, visibility);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/posts/:postId/add-comment", async (req, res) => {
  try {
    const { authorId, content } = req.body;
    const result = await socialRuntimeBridge.addComment(req.params.postId, authorId, content);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/posts/:postId/react", async (req, res) => {
  try {
    const { userId, emoji } = req.body;
    const result = await socialRuntimeBridge.reactPost(req.params.postId, userId, emoji);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/update-reputation", async (req, res) => {
  try {
    const { userId, fromUserId, reputationType, score, reason } = req.body;
    const result = await socialRuntimeBridge.updateReputation(userId, fromUserId, reputationType, score, reason);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/start-event", async (req, res) => {
  try {
    const { groupId, organizerId, name, scheduledDate, location } = req.body;
    const result = await socialRuntimeBridge.startCommunityEvent(groupId, organizerId, name, scheduledDate, location);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/events/:eventId/end", async (req, res) => {
  try {
    const result = await socialRuntimeBridge.endCommunityEvent(req.params.eventId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/runtime/:groupId/simulate", async (req, res) => {
  try {
    const result = await socialRuntimeBridge.simulateSocialActivity(req.params.groupId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
