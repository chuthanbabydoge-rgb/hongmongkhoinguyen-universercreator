CREATE TYPE "public"."asset_type" AS ENUM('image', 'audio', 'video', 'model', 'document', 'other');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('world', 'npc', 'quest', 'boss', 'dungeon', 'item', 'skill', 'pet', 'company', 'education', 'sports', 'land', 'nation', 'mount', 'dialogue', 'course', 'tournament', 'city', 'building');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('pending', 'processing', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('project_created', 'project_deleted', 'joined', 'forked', 'published', 'commented', 'asset_uploaded', 'permission_changed', 'starred', 'watched');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('invite_received', 'invite_accepted', 'role_changed', 'project_published', 'asset_uploaded');--> statement-breakpoint
CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'admin', 'developer', 'designer', 'writer', 'tester', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."project_permission" AS ENUM('view', 'comment', 'edit', 'build', 'publish', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('private', 'internal', 'public', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."export_format" AS ENUM('json', 'zip', 'package');--> statement-breakpoint
CREATE TYPE "public"."relation_type" AS ENUM('parent', 'child', 'reference', 'dependency', 'linked');--> statement-breakpoint
CREATE TYPE "public"."asset_pipeline_type" AS ENUM('image', 'audio', 'video', 'model', 'texture', 'icon', 'document', 'font', 'script', 'material', 'animation', 'prefab');--> statement-breakpoint
CREATE TYPE "public"."import_source" AS ENUM('upload', 'url', 'package', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'uploading', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_type" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."connection_type" AS ENUM('execution', 'data', 'event');--> statement-breakpoint
CREATE TYPE "public"."execution_state" AS ENUM('idle', 'running', 'paused', 'completed', 'failed', 'stopped');--> statement-breakpoint
CREATE TYPE "public"."graph_type" AS ENUM('event_graph', 'function_graph', 'macro_graph', 'animation_graph', 'behavior_tree', 'dialogue_graph', 'quest_graph', 'ai_graph', 'timeline_graph', 'custom');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('start', 'end', 'event', 'branch', 'switch', 'sequence', 'delay', 'loop', 'while', 'for_each', 'math', 'compare', 'random', 'variable', 'set_variable', 'get_variable', 'function', 'macro', 'custom_event', 'log', 'print', 'comment', 'group', 'reroute', 'cast', 'select', 'gate', 'flip_flop', 'do_once', 'custom');--> statement-breakpoint
CREATE TYPE "public"."pin_type" AS ENUM('execution', 'boolean', 'integer', 'float', 'string', 'vector', 'object', 'array', 'map', 'struct', 'enum', 'wildcard', 'event');--> statement-breakpoint
CREATE TYPE "public"."variable_scope" AS ENUM('local', 'graph', 'global', 'constant');--> statement-breakpoint
CREATE TYPE "public"."runtime_component_type" AS ENUM('transform', 'renderer', 'collider', 'rigid_body', 'script', 'health', 'inventory', 'quest', 'dialogue', 'animation', 'audio', 'navigation', 'custom');--> statement-breakpoint
CREATE TYPE "public"."runtime_event_type" AS ENUM('spawn', 'destroy', 'move', 'rotate', 'scale', 'collision', 'interaction', 'quest', 'dialogue', 'timer', 'tick', 'system', 'input', 'custom');--> statement-breakpoint
CREATE TYPE "public"."runtime_log_level" AS ENUM('trace', 'debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TYPE "public"."runtime_mode" AS ENUM('editor', 'play', 'simulation', 'debug', 'headless', 'record', 'replay');--> statement-breakpoint
CREATE TYPE "public"."runtime_resource_state" AS ENUM('unloaded', 'loading', 'loaded', 'failed', 'evicted');--> statement-breakpoint
CREATE TYPE "public"."runtime_state" AS ENUM('idle', 'initializing', 'loading', 'running', 'paused', 'stepping', 'stopping', 'stopped', 'error', 'crashed');--> statement-breakpoint
CREATE TYPE "public"."spawn_type" AS ENUM('player', 'npc', 'boss', 'pet', 'vehicle', 'item', 'custom');--> statement-breakpoint
CREATE TYPE "public"."terrain_type" AS ENUM('flat', 'hills', 'mountains', 'ocean', 'desert', 'forest', 'arctic', 'volcanic', 'custom');--> statement-breakpoint
CREATE TYPE "public"."world_environment" AS ENUM('outdoor', 'indoor', 'underground', 'underwater', 'space', 'void', 'custom');--> statement-breakpoint
CREATE TYPE "public"."world_lighting" AS ENUM('realtime', 'baked', 'mixed', 'custom');--> statement-breakpoint
CREATE TYPE "public"."world_status" AS ENUM('draft', 'active', 'archived', 'published', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."world_type" AS ENUM('fantasy', 'sci_fi', 'modern', 'historical', 'post_apocalyptic', 'underwater', 'space', 'custom');--> statement-breakpoint
CREATE TYPE "public"."world_weather" AS ENUM('clear', 'rain', 'storm', 'snow', 'fog', 'dynamic', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_animation_state" AS ENUM('idle', 'walk', 'run', 'attack', 'defend', 'death', 'emote', 'interact', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_behavior" AS ENUM('aggressive', 'defensive', 'passive', 'cowardly', 'neutral', 'friendly', 'territorial', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_dialogue_type" AS ENUM('greeting', 'quest', 'trade', 'combat', 'ambient', 'lore', 'farewell', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_relation" AS ENUM('ally', 'enemy', 'neutral', 'friend', 'rival', 'leader', 'follower', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_spawn_mode" AS ENUM('fixed', 'random', 'scripted', 'wave', 'respawn', 'one_time', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_state" AS ENUM('idle', 'patrolling', 'chasing', 'attacking', 'fleeing', 'interacting', 'dead', 'sleeping', 'working', 'custom');--> statement-breakpoint
CREATE TYPE "public"."npc_type" AS ENUM('humanoid', 'creature', 'boss', 'merchant', 'quest_giver', 'guard', 'neutral', 'companion', 'enemy', 'custom');--> statement-breakpoint
CREATE TYPE "public"."condition_type" AS ENUM('level', 'quest', 'skill', 'item', 'reputation', 'faction', 'custom');--> statement-breakpoint
CREATE TYPE "public"."quest_branch_type" AS ENUM('linear', 'choice', 'conditional', 'parallel', 'loop', 'custom');--> statement-breakpoint
CREATE TYPE "public"."quest_dialogue_type" AS ENUM('start', 'progress', 'complete', 'fail', 'branch', 'ambient', 'custom');--> statement-breakpoint
CREATE TYPE "public"."quest_objective_type" AS ENUM('kill', 'collect', 'talk', 'escort', 'explore', 'craft', 'use_item', 'reach_location', 'interact', 'custom');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."quest_type" AS ENUM('main', 'side', 'daily', 'weekly', 'event', 'story', 'tutorial', 'achievement', 'guild', 'world');--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('xp', 'gold', 'item', 'skill', 'title', 'reputation', 'pet', 'mount', 'currency');--> statement-breakpoint
CREATE TYPE "public"."item_binding_type" AS ENUM('none', 'bind_on_pickup', 'bind_on_equip', 'bind_on_use', 'account_bound');--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('melee', 'ranged', 'magic', 'shield', 'helmet', 'chest', 'legs', 'boots', 'gloves', 'ring', 'amulet', 'potion', 'food', 'ore', 'gem', 'cloth', 'wood', 'metal', 'coin', 'token', 'misc');--> statement-breakpoint
CREATE TYPE "public"."item_quality" AS ENUM('poor', 'normal', 'fine', 'superior', 'masterwork', 'artifact');--> statement-breakpoint
CREATE TYPE "public"."item_rarity" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique');--> statement-breakpoint
CREATE TYPE "public"."item_stack_type" AS ENUM('non_stackable', 'stackable', 'limited_stack');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('weapon', 'armor', 'consumable', 'material', 'currency', 'quest_item', 'crafting', 'accessory', 'tool', 'cosmetic');--> statement-breakpoint
CREATE TYPE "public"."cast_type" AS ENUM('instant', 'cast', 'channel');--> statement-breakpoint
CREATE TYPE "public"."cooldown_type" AS ENUM('global', 'local');--> statement-breakpoint
CREATE TYPE "public"."damage_type" AS ENUM('physical', 'magic', 'true', 'heal');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('mana', 'energy', 'stamina', 'rage', 'none');--> statement-breakpoint
CREATE TYPE "public"."skill_effect_type" AS ENUM('buff', 'debuff', 'dot', 'hot', 'control', 'summon', 'trigger');--> statement-breakpoint
CREATE TYPE "public"."skill_target" AS ENUM('self', 'ally', 'enemy', 'area', 'point', 'direction');--> statement-breakpoint
CREATE TYPE "public"."skill_type" AS ENUM('active', 'passive', 'toggle', 'ultimate', 'aura', 'reaction', 'summon');--> statement-breakpoint
CREATE TYPE "public"."combat_event_type" AS ENUM('attack', 'defend', 'dodge', 'block', 'parry', 'crit', 'miss', 'death', 'respawn', 'status_applied', 'status_removed');--> statement-breakpoint
CREATE TYPE "public"."combat_log_type" AS ENUM('damage', 'heal', 'status', 'death', 'respawn', 'miss', 'dodge', 'block', 'parry', 'crit', 'combo');--> statement-breakpoint
CREATE TYPE "public"."combat_mode" AS ENUM('turn_based', 'real_time', 'action', 'semi_action', 'tactical');--> statement-breakpoint
CREATE TYPE "public"."combat_state" AS ENUM('idle', 'engaging', 'fighting', 'fleeing', 'stunned', 'dead', 'respawning');--> statement-breakpoint
CREATE TYPE "public"."combat_target" AS ENUM('self', 'single_enemy', 'single_ally', 'all_enemies', 'all_allies', 'area', 'random');--> statement-breakpoint
CREATE TYPE "public"."combat_trigger" AS ENUM('on_hit', 'on_miss', 'on_crit', 'on_dodge', 'on_block', 'on_parry', 'on_kill', 'on_death', 'on_respawn', 'on_combo', 'on_turn_start', 'on_turn_end');--> statement-breakpoint
CREATE TYPE "public"."damage_formula" AS ENUM('flat', 'percentage', 'scaling', 'hybrid', 'custom');--> statement-breakpoint
CREATE TYPE "public"."status_category" AS ENUM('buff', 'debuff', 'dot', 'hot', 'cc', 'shield', 'mark', 'aura');--> statement-breakpoint
CREATE TYPE "public"."dungeon_difficulty" AS ENUM('easy', 'normal', 'hard', 'expert', 'legendary', 'nightmare');--> statement-breakpoint
CREATE TYPE "public"."dungeon_spawn_type" AS ENUM('fixed', 'random', 'wave', 'triggered', 'respawn', 'boss', 'elite', 'patrol');--> statement-breakpoint
CREATE TYPE "public"."dungeon_status" AS ENUM('draft', 'testing', 'published', 'archived', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."dungeon_type" AS ENUM('linear', 'branching', 'open', 'procedural', 'raid', 'arena', 'tower', 'maze');--> statement-breakpoint
CREATE TYPE "public"."reset_type" AS ENUM('never', 'daily', 'weekly', 'on_completion', 'on_party_wipe', 'manual', 'timed');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('entrance', 'corridor', 'chamber', 'boss_room', 'treasure_room', 'puzzle_room', 'spawn_room', 'checkpoint_room', 'exit_room', 'secret_room');--> statement-breakpoint
CREATE TYPE "public"."trap_type" AS ENUM('pressure_plate', 'arrow_trap', 'spike_trap', 'poison_gas', 'fire_trap', 'ice_trap', 'electric_trap', 'magic_trap', 'alarm_trap', 'pit_trap');--> statement-breakpoint
CREATE TABLE "creator_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"type" "asset_type" NOT NULL,
	"name" text NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"size" integer,
	"mime_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" "document_type" NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"thumbnail" text,
	"icon" text,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"folder_id" integer,
	"updated_by" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"project_id" integer,
	"action" text NOT NULL,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"description" text,
	"manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"download_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_plugins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"version" text NOT NULL,
	"description" text,
	"author_id" integer,
	"manifest_url" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_plugins_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_publish_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "publish_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"category" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_users_username_unique" UNIQUE("username"),
	CONSTRAINT "creator_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "creator_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"organization_id" integer,
	"type" "activity_type" NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"project_id" integer,
	"inviter_id" integer NOT NULL,
	"invitee_email" text NOT NULL,
	"invitee_id" integer,
	"role" "org_member_role" DEFAULT 'viewer' NOT NULL,
	"permission" "project_permission",
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "creator_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"reference_id" integer,
	"reference_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "org_member_role" DEFAULT 'viewer' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_organization_members_organization_id_user_id_unique" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"avatar_url" text,
	"website" text,
	"owner_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" text,
	"username" text,
	"avatar" text,
	"bio" text,
	"website" text,
	"location" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"creator_level" integer DEFAULT 1 NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creator_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "creator_project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"permission" "project_permission" DEFAULT 'view' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"added_by" integer,
	CONSTRAINT "creator_project_members_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_project_stars" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_project_stars_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_project_watchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_project_watchers_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_document_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_document_bookmarks_document_id_user_id_unique" UNIQUE("document_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_document_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"format" "export_format" NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"download_url" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_document_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer,
	"color" text,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_document_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"before" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_document_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"format" "export_format" NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"imported_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_document_locks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"locked_by" integer NOT NULL,
	"locked_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "creator_document_locks_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "creator_document_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"relation_type" "relation_type" NOT NULL,
	"label" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_document_relations_source_id_target_id_relation_type_unique" UNIQUE("source_id","target_id","relation_type")
);
--> statement-breakpoint
CREATE TABLE "creator_document_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_document_tags_document_id_tag_unique" UNIQUE("document_id","tag")
);
--> statement-breakpoint
CREATE TABLE "creator_document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"version" integer NOT NULL,
	"name" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"thumbnail" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_asset_collection_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_collection_items_collection_id_asset_id_unique" UNIQUE("collection_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_asset_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"depends_on_id" integer NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_dependencies_asset_id_depends_on_id_unique" UNIQUE("asset_id","depends_on_id")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"asset_ids" integer[] DEFAULT '{}' NOT NULL,
	"format" text DEFAULT 'zip' NOT NULL,
	"status" "processing_status" DEFAULT 'pending' NOT NULL,
	"download_url" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_asset_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer,
	"color" text,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_asset_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"source" "import_source" NOT NULL,
	"status" "processing_status" DEFAULT 'pending' NOT NULL,
	"filename" text,
	"url" text,
	"imported_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_asset_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"exif_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"color_palette" text[] DEFAULT '{}' NOT NULL,
	"ai_tags" text[] DEFAULT '{}' NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_metadata_asset_id_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_processing_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"step" text NOT NULL,
	"status" "processing_status" DEFAULT 'pending' NOT NULL,
	"log" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_asset_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"field_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_references_asset_id_entity_type_entity_id_unique" UNIQUE("asset_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_tags_asset_id_tag_unique" UNIQUE("asset_id","tag")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_thumbnails" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"thumbnail_type" "thumbnail_type" NOT NULL,
	"url" text NOT NULL,
	"width" integer,
	"height" integer,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_thumbnails_asset_id_thumbnail_type_unique" UNIQUE("asset_id","thumbnail_type")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_name" text,
	"used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_asset_usage_asset_id_entity_type_entity_id_unique" UNIQUE("asset_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "creator_asset_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"version" integer NOT NULL,
	"filename" text NOT NULL,
	"size" bigint,
	"checksum" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"note" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pipeline_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"folder_id" integer,
	"type" "asset_pipeline_type" NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"filename" text NOT NULL,
	"mime_type" text,
	"extension" text,
	"size" bigint,
	"checksum" text,
	"width" integer,
	"height" integer,
	"duration" integer,
	"polygon_count" integer,
	"thumbnail" text,
	"preview" text,
	"status" "processing_status" DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_breakpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"node_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"condition" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_graph_breakpoints_graph_id_node_id_unique" UNIQUE("graph_id","node_id")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"text" text NOT NULL,
	"x" real DEFAULT 0 NOT NULL,
	"y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 300 NOT NULL,
	"height" real DEFAULT 100 NOT NULL,
	"color" text DEFAULT '#333344' NOT NULL,
	"font_size" integer DEFAULT 14 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_compiler_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"checksum" text NOT NULL,
	"compiled_output" jsonb NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"compiled_at" timestamp DEFAULT now() NOT NULL,
	"error_message" text,
	CONSTRAINT "creator_graph_compiler_cache_graph_id_unique" UNIQUE("graph_id")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"connection_key" text NOT NULL,
	"type" "connection_type" DEFAULT 'execution' NOT NULL,
	"source_pin_id" integer NOT NULL,
	"target_pin_id" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_graph_connections_source_pin_id_target_pin_id_unique" UNIQUE("source_pin_id","target_pin_id")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_custom" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_execution_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"runtime_id" text NOT NULL,
	"node_id" integer,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_functions" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"inputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"name" text NOT NULL,
	"x" real DEFAULT 0 NOT NULL,
	"y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 400 NOT NULL,
	"height" real DEFAULT 300 NOT NULL,
	"color" text DEFAULT '#1a1a2e' NOT NULL,
	"node_ids" integer[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_macros" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"inputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"connections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"node_key" text NOT NULL,
	"type" "node_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"x" real DEFAULT 0 NOT NULL,
	"y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 200 NOT NULL,
	"height" real DEFAULT 80 NOT NULL,
	"collapsed" boolean DEFAULT false NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"color" text,
	"comment" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"graph_id" integer NOT NULL,
	"pin_key" text NOT NULL,
	"label" text NOT NULL,
	"type" "pin_type" NOT NULL,
	"is_input" boolean DEFAULT true NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"default_value" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "creator_graph_pins_node_id_pin_key_unique" UNIQUE("node_id","pin_key")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"snap_to_grid" boolean DEFAULT true NOT NULL,
	"grid_size" integer DEFAULT 16 NOT NULL,
	"show_mini_map" boolean DEFAULT true NOT NULL,
	"show_grid" boolean DEFAULT true NOT NULL,
	"auto_save" boolean DEFAULT true NOT NULL,
	"auto_save_interval" integer DEFAULT 30 NOT NULL,
	"default_zoom" real DEFAULT 1 NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"node_spacing" integer DEFAULT 20 NOT NULL,
	"extras" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_graph_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_runtime" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"runtime_id" text NOT NULL,
	"state" "execution_state" DEFAULT 'idle' NOT NULL,
	"current_node_id" integer,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp,
	"paused_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_graph_runtime_runtime_id_unique" UNIQUE("runtime_id")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_shortcuts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"keybinding" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_graph_shortcuts_user_id_action_unique" UNIQUE("user_id","action")
);
--> statement-breakpoint
CREATE TABLE "creator_graph_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"label" text,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "graph_type" DEFAULT 'event_graph' NOT NULL,
	"category" text,
	"thumbnail" text,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"connections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "pin_type" NOT NULL,
	"scope" "variable_scope" DEFAULT 'local' NOT NULL,
	"default_value" jsonb,
	"description" text,
	"is_array" boolean DEFAULT false NOT NULL,
	"is_exposed" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graph_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"graph_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"version" integer NOT NULL,
	"label" text,
	"description" text,
	"snapshot" jsonb NOT NULL,
	"compiled_output" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_graphs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "graph_type" DEFAULT 'event_graph' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"viewport" jsonb DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"parent_graph_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"tick" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"type" "runtime_component_type" NOT NULL,
	"name" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_debug" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"breakpoint_tick" integer,
	"watched_entities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"watched_variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_step_mode" boolean DEFAULT false NOT NULL,
	"pause_on_error" boolean DEFAULT true NOT NULL,
	"log_filter" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"session_id" integer NOT NULL,
	"world_id" integer,
	"name" text NOT NULL,
	"tag" text,
	"layer" text DEFAULT 'default' NOT NULL,
	"parent_id" integer,
	"enabled" boolean DEFAULT true NOT NULL,
	"destroyed" boolean DEFAULT false NOT NULL,
	"transform" jsonb DEFAULT '{"position":{"x":0,"y":0,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1,"y":1,"z":1}}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"spawned_at" timestamp DEFAULT now() NOT NULL,
	"destroyed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_runtime_entities_entity_uuid_unique" UNIQUE("entity_uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"system" text,
	"entity_id" integer,
	"error_type" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"type" "runtime_event_type" NOT NULL,
	"name" text,
	"source_entity_id" integer,
	"target_entity_id" integer,
	"tick" integer DEFAULT 0 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"dispatched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"level" "runtime_log_level" DEFAULT 'info' NOT NULL,
	"system" text,
	"entity_id" integer,
	"message" text NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"heap_used_mb" real DEFAULT 0 NOT NULL,
	"heap_total_mb" real DEFAULT 0 NOT NULL,
	"external_mb" real DEFAULT 0 NOT NULL,
	"array_buffers_mb" real DEFAULT 0 NOT NULL,
	"sampled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"fps" real DEFAULT 0 NOT NULL,
	"frame_time_ms" real DEFAULT 0 NOT NULL,
	"cpu_time_ms" real DEFAULT 0 NOT NULL,
	"memory_mb" real DEFAULT 0 NOT NULL,
	"entity_count" integer DEFAULT 0 NOT NULL,
	"component_count" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"system_timings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sampled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"start_tick" integer DEFAULT 0 NOT NULL,
	"end_tick" integer,
	"duration_ms" real,
	"samples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"resource_type" text NOT NULL,
	"state" "runtime_resource_state" DEFAULT 'unloaded' NOT NULL,
	"path" text,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"load_time_ms" real,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"loaded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_scheduler" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"schedule_type" text DEFAULT 'frame' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"interval_ticks" integer,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_run_tick" integer DEFAULT 0 NOT NULL,
	"run_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"name" text DEFAULT 'Runtime Session' NOT NULL,
	"state" "runtime_state" DEFAULT 'idle' NOT NULL,
	"mode" "runtime_mode" DEFAULT 'editor' NOT NULL,
	"world_id" integer,
	"tick_rate" real DEFAULT 60 NOT NULL,
	"current_tick" integer DEFAULT 0 NOT NULL,
	"elapsed_time" real DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp,
	"paused_at" timestamp,
	"stopped_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_runtime_sessions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"tick" integer DEFAULT 0 NOT NULL,
	"elapsed_time" real DEFAULT 0 NOT NULL,
	"entity_count" integer DEFAULT 0 NOT NULL,
	"state_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"world_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"system_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"update_type" text DEFAULT 'frame' NOT NULL,
	"last_tick_ms" real DEFAULT 0 NOT NULL,
	"total_ticks" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_timers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"entity_id" integer,
	"name" text NOT NULL,
	"timer_type" text DEFAULT 'delay' NOT NULL,
	"duration_ms" real DEFAULT 1000 NOT NULL,
	"remaining_ms" real DEFAULT 1000 NOT NULL,
	"interval_ms" real,
	"is_running" boolean DEFAULT false NOT NULL,
	"fire_count" integer DEFAULT 0 NOT NULL,
	"max_fires" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"entity_id" integer,
	"name" text NOT NULL,
	"value_type" text DEFAULT 'any' NOT NULL,
	"value" jsonb DEFAULT 'null'::jsonb NOT NULL,
	"scope" text DEFAULT 'session' NOT NULL,
	"is_readonly" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_runtime_worlds" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" text NOT NULL,
	"entity_count" integer DEFAULT 0 NOT NULL,
	"system_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"gravity" jsonb DEFAULT '{"x":0,"y":-9.81,"z":0}'::jsonb NOT NULL,
	"bounds" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"camera_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"region_id" integer,
	"chunk_x" integer DEFAULT 0 NOT NULL,
	"chunk_y" integer DEFAULT 0 NOT NULL,
	"chunk_z" integer DEFAULT 0 NOT NULL,
	"is_loaded" boolean DEFAULT false NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"terrain_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"object_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_environments" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"name" text DEFAULT 'Default Environment' NOT NULL,
	"skybox_type" text DEFAULT 'procedural' NOT NULL,
	"skybox_asset_id" integer,
	"sun_enabled" boolean DEFAULT true NOT NULL,
	"sun_intensity" real DEFAULT 1 NOT NULL,
	"sun_color" text DEFAULT '#fffbe6' NOT NULL,
	"sun_pos_x" real DEFAULT 45 NOT NULL,
	"sun_pos_y" real DEFAULT 75 NOT NULL,
	"moon_enabled" boolean DEFAULT true NOT NULL,
	"moon_intensity" real DEFAULT 0.3 NOT NULL,
	"fog_enabled" boolean DEFAULT false NOT NULL,
	"fog_color" text DEFAULT '#c0c8d8' NOT NULL,
	"fog_density" real DEFAULT 0.01 NOT NULL,
	"fog_start" real DEFAULT 50 NOT NULL,
	"fog_end" real DEFAULT 500 NOT NULL,
	"ambient_color" text DEFAULT '#404060' NOT NULL,
	"ambient_intensity" real DEFAULT 0.4 NOT NULL,
	"wind_speed" real DEFAULT 0 NOT NULL,
	"wind_direction" real DEFAULT 0 NOT NULL,
	"cloud_coverage" real DEFAULT 0.3 NOT NULL,
	"cloud_speed" real DEFAULT 0.01 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"format" text DEFAULT 'json' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"file_path" text,
	"file_size" integer,
	"include_assets" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"before" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target_project_id" integer,
	"format" text DEFAULT 'json' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"file_name" text,
	"file_size" integer,
	"result_world_id" integer,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_message" text,
	"validation_errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_layers" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"name" text NOT NULL,
	"layer_type" text DEFAULT 'terrain' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"opacity" real DEFAULT 1 NOT NULL,
	"blend_mode" text DEFAULT 'normal' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_lighting" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"name" text DEFAULT 'Default Lighting' NOT NULL,
	"lighting_mode" "world_lighting" DEFAULT 'realtime' NOT NULL,
	"intensity" real DEFAULT 1 NOT NULL,
	"color" text DEFAULT '#ffffff' NOT NULL,
	"shadows_enabled" boolean DEFAULT true NOT NULL,
	"shadow_distance" real DEFAULT 100 NOT NULL,
	"shadow_resolution" integer DEFAULT 2048 NOT NULL,
	"ambient_occlusion_enabled" boolean DEFAULT false NOT NULL,
	"bloom_enabled" boolean DEFAULT false NOT NULL,
	"bloom_intensity" real DEFAULT 0.5 NOT NULL,
	"tone_mapping_enabled" boolean DEFAULT true NOT NULL,
	"exposure" real DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_navigation" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"region_id" integer,
	"name" text DEFAULT 'NavMesh' NOT NULL,
	"nav_mesh_enabled" boolean DEFAULT true NOT NULL,
	"agent_height" real DEFAULT 2 NOT NULL,
	"agent_radius" real DEFAULT 0.5 NOT NULL,
	"agent_max_slope" real DEFAULT 45 NOT NULL,
	"agent_step_height" real DEFAULT 0.4 NOT NULL,
	"blocked_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"walkable_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"jump_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"water_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nav_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_generated" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_portals" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"world_id" integer NOT NULL,
	"region_id" integer,
	"name" text NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"rot_y" real DEFAULT 0 NOT NULL,
	"target_world_id" integer,
	"target_world_uuid" text,
	"target_spawn_uuid" text,
	"target_pos_x" real,
	"target_pos_y" real,
	"target_pos_z" real,
	"cooldown_seconds" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_bidirectional" boolean DEFAULT false NOT NULL,
	"graph_id" integer,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_world_portals_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_world_regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"world_id" integer NOT NULL,
	"parent_region_id" integer,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#4f8ef7' NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"size_x" real DEFAULT 100 NOT NULL,
	"size_y" real DEFAULT 100 NOT NULL,
	"size_z" real DEFAULT 100 NOT NULL,
	"terrain" "terrain_type" DEFAULT 'flat' NOT NULL,
	"graph_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_world_regions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_world_runtime" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"runtime_session_id" integer,
	"runtime_world_id" integer,
	"mode" text DEFAULT 'preview' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"loaded_at" timestamp,
	"unloaded_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_scenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"camera_pos" jsonb DEFAULT '{"x":0,"y":10,"z":20}'::jsonb NOT NULL,
	"camera_rot" jsonb DEFAULT '{"x":0,"y":0,"z":0}'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"thumbnail" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"gravity" real DEFAULT -9.81 NOT NULL,
	"world_size_x" real DEFAULT 1000 NOT NULL,
	"world_size_y" real DEFAULT 500 NOT NULL,
	"world_size_z" real DEFAULT 1000 NOT NULL,
	"chunk_size_x" real DEFAULT 16 NOT NULL,
	"chunk_size_y" real DEFAULT 16 NOT NULL,
	"chunk_size_z" real DEFAULT 16 NOT NULL,
	"max_players" integer DEFAULT 1 NOT NULL,
	"respawn_enabled" boolean DEFAULT true NOT NULL,
	"pvp_enabled" boolean DEFAULT false NOT NULL,
	"fog_enabled" boolean DEFAULT false NOT NULL,
	"ambient_sound_enabled" boolean DEFAULT true NOT NULL,
	"physics_enabled" boolean DEFAULT true NOT NULL,
	"collision_enabled" boolean DEFAULT true NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_spawnpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"world_id" integer NOT NULL,
	"region_id" integer,
	"name" text NOT NULL,
	"spawn_type" "spawn_type" DEFAULT 'player' NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"rot_y" real DEFAULT 0 NOT NULL,
	"radius" real DEFAULT 1 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"graph_id" integer,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_world_spawnpoints_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_world_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"region_count" integer DEFAULT 0 NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"spawnpoint_count" integer DEFAULT 0 NOT NULL,
	"portal_count" integer DEFAULT 0 NOT NULL,
	"layer_count" integer DEFAULT 0 NOT NULL,
	"version_count" integer DEFAULT 0 NOT NULL,
	"export_count" integer DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"last_played_at" timestamp,
	"total_edit_time_ms" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"source_world_id" integer,
	"name" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"world_type" "world_type" DEFAULT 'fantasy' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"template_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_world_templates_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_world_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"version" integer NOT NULL,
	"label" text,
	"description" text,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_world_weather" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"name" text NOT NULL,
	"weather_type" "world_weather" DEFAULT 'clear' NOT NULL,
	"intensity" real DEFAULT 0 NOT NULL,
	"wind_speed" real DEFAULT 0 NOT NULL,
	"precipitation_rate" real DEFAULT 0 NOT NULL,
	"lightning_enabled" boolean DEFAULT false NOT NULL,
	"thunder_enabled" boolean DEFAULT false NOT NULL,
	"is_dynamic" boolean DEFAULT false NOT NULL,
	"transition_duration" real DEFAULT 5 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_worlds" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"thumbnail" text,
	"world_type" "world_type" DEFAULT 'fantasy' NOT NULL,
	"status" "world_status" DEFAULT 'draft' NOT NULL,
	"environment" "world_environment" DEFAULT 'outdoor' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"parent_world_id" integer,
	"graph_id" integer,
	"seed" text,
	"version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_worlds_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"strength" integer DEFAULT 10 NOT NULL,
	"dexterity" integer DEFAULT 10 NOT NULL,
	"intelligence" integer DEFAULT 10 NOT NULL,
	"wisdom" integer DEFAULT 10 NOT NULL,
	"charisma" integer DEFAULT 10 NOT NULL,
	"constitution" integer DEFAULT 10 NOT NULL,
	"luck" integer DEFAULT 10 NOT NULL,
	"perception" integer DEFAULT 10 NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_behavior_trees" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text DEFAULT 'Main Behavior Tree' NOT NULL,
	"root_node_id" text,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"edges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_behavior_trees_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_behaviors" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text NOT NULL,
	"behavior_type" "npc_behavior" DEFAULT 'neutral' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"trigger_conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cooldown_seconds" real DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_dialogue_choices" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"text" text NOT NULL,
	"next_node_key" text,
	"order" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"effects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_dialogue_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"dialogue_id" integer NOT NULL,
	"node_key" text NOT NULL,
	"speaker" text DEFAULT 'npc' NOT NULL,
	"text" text NOT NULL,
	"animation_state" "npc_animation_state" DEFAULT 'idle' NOT NULL,
	"voice_line_id" text,
	"delay" real DEFAULT 0 NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_start" boolean DEFAULT false NOT NULL,
	"is_end" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_dialogues" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text NOT NULL,
	"dialogue_type" "npc_dialogue_type" DEFAULT 'greeting' NOT NULL,
	"trigger_conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_dialogues_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"slot" text NOT NULL,
	"item_id" integer,
	"item_name" text,
	"asset_id" integer,
	"stat_bonus" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_factions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#4f8ef7' NOT NULL,
	"icon" text,
	"is_player_faction" boolean DEFAULT false NOT NULL,
	"base_reputation" integer DEFAULT 0 NOT NULL,
	"faction_relations" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_factions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"before" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"item_id" integer,
	"item_name" text NOT NULL,
	"item_type" text DEFAULT 'misc' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"slot_index" integer DEFAULT 0 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"drop_chance" real DEFAULT 0 NOT NULL,
	"is_sellable" boolean DEFAULT false NOT NULL,
	"sell_price" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_patrol_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text DEFAULT 'Patrol Route' NOT NULL,
	"is_looping" boolean DEFAULT true NOT NULL,
	"patrol_speed" real DEFAULT 1.5 NOT NULL,
	"wait_time_seconds" real DEFAULT 2 NOT NULL,
	"waypoints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_patrol_paths_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"race" text DEFAULT 'human' NOT NULL,
	"gender" text DEFAULT 'none' NOT NULL,
	"age" integer,
	"height" real,
	"weight" real,
	"occupation" text,
	"backstory" text,
	"personality" text,
	"appearance" text,
	"voice_type" text,
	"language" text DEFAULT 'common' NOT NULL,
	"model_asset_id" integer,
	"portrait_asset_id" integer,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"target_npc_id" integer NOT NULL,
	"relation" "npc_relation" DEFAULT 'neutral' NOT NULL,
	"affinity" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text DEFAULT 'Daily Schedule' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"entries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"skill_type" text DEFAULT 'active' NOT NULL,
	"target_type" text DEFAULT 'single' NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"heal_amount" integer DEFAULT 0 NOT NULL,
	"mp_cost" integer DEFAULT 0 NOT NULL,
	"stamina_cost" integer DEFAULT 0 NOT NULL,
	"cooldown_seconds" real DEFAULT 0 NOT NULL,
	"range" real DEFAULT 1.5 NOT NULL,
	"duration" real DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_passive" boolean DEFAULT false NOT NULL,
	"effects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_spawn_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" integer NOT NULL,
	"world_id" integer,
	"region_id" integer,
	"name" text NOT NULL,
	"spawn_mode" "npc_spawn_mode" DEFAULT 'fixed' NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"rot_y" real DEFAULT 0 NOT NULL,
	"radius" real DEFAULT 0 NOT NULL,
	"max_count" integer DEFAULT 1 NOT NULL,
	"respawn_time_seconds" real DEFAULT 60 NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_spawn_points_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"current_hp" integer DEFAULT 100 NOT NULL,
	"max_mp" integer DEFAULT 50 NOT NULL,
	"current_mp" integer DEFAULT 50 NOT NULL,
	"max_stamina" integer DEFAULT 100 NOT NULL,
	"attack_power" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"magic_power" integer DEFAULT 5 NOT NULL,
	"magic_defense" integer DEFAULT 5 NOT NULL,
	"speed" real DEFAULT 3 NOT NULL,
	"attack_range" real DEFAULT 1.5 NOT NULL,
	"detection_range" real DEFAULT 10 NOT NULL,
	"experience_reward" integer DEFAULT 10 NOT NULL,
	"gold_reward" integer DEFAULT 0 NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npc_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"source_npc_id" integer,
	"name" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"npc_type" "npc_type" DEFAULT 'humanoid' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"template_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npc_templates_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_npc_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"npc_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"version" integer NOT NULL,
	"label" text,
	"description" text,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_npcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"thumbnail" text,
	"npc_type" "npc_type" DEFAULT 'humanoid' NOT NULL,
	"state" "npc_state" DEFAULT 'idle' NOT NULL,
	"behavior" "npc_behavior" DEFAULT 'neutral' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"parent_npc_id" integer,
	"faction_id" integer,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_npcs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_quest_branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"parent_id" integer,
	"branch_type" "quest_branch_type" DEFAULT 'choice' NOT NULL,
	"name" text NOT NULL,
	"label" text,
	"condition" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"step_id" integer,
	"name" text NOT NULL,
	"description" text,
	"is_final" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"condition_type" "condition_type" DEFAULT 'level' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_id" text,
	"target_value" text,
	"operator" text DEFAULT 'gte' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_dialogues" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"npc_id" integer,
	"dialogue_type" "quest_dialogue_type" DEFAULT 'start' NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"branch_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"event_name" text NOT NULL,
	"event_type" text DEFAULT 'trigger' NOT NULL,
	"trigger_condition" jsonb,
	"action" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"export_format" text DEFAULT 'json' NOT NULL,
	"filename" text,
	"data" jsonb,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"name" text NOT NULL,
	"default_value" boolean DEFAULT false NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quest_id" integer,
	"import_format" text DEFAULT 'json' NOT NULL,
	"filename" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_npcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"npc_id" text,
	"npc_name" text NOT NULL,
	"role" text DEFAULT 'quest_giver' NOT NULL,
	"region_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_objectives" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"step_id" integer,
	"objective_type" "quest_objective_type" DEFAULT 'kill' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_id" text,
	"target_name" text,
	"target_count" integer DEFAULT 1 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"world_id" text,
	"region_name" text NOT NULL,
	"description" text,
	"coordinates" jsonb,
	"radius" real,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"reward_type" "reward_type" DEFAULT 'xp' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"amount" integer DEFAULT 1 NOT NULL,
	"item_id" text,
	"data" jsonb,
	"is_optional" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"name" text NOT NULL,
	"script_type" text DEFAULT 'lua' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"trigger" text DEFAULT 'on_start' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"total_objectives" integer DEFAULT 0 NOT NULL,
	"total_rewards" integer DEFAULT 0 NOT NULL,
	"total_dialogues" integer DEFAULT 0 NOT NULL,
	"total_branches" integer DEFAULT 0 NOT NULL,
	"completion_rate" real DEFAULT 0 NOT NULL,
	"average_completion_time" integer,
	"play_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_quest_statistics_quest_id_unique" UNIQUE("quest_id")
);
--> statement-breakpoint
CREATE TABLE "creator_quest_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_optional" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quest_type" "quest_type" DEFAULT 'side' NOT NULL,
	"icon" text,
	"thumbnail" text,
	"data" jsonb NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_official" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"name" text NOT NULL,
	"variable_type" text DEFAULT 'integer' NOT NULL,
	"default_value" text,
	"description" text,
	"scope" text DEFAULT 'quest' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quest_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quest_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"label" text,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_quests" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"quest_type" "quest_type" DEFAULT 'side' NOT NULL,
	"status" "quest_status" DEFAULT 'draft' NOT NULL,
	"icon" text,
	"thumbnail" text,
	"level" integer DEFAULT 1 NOT NULL,
	"max_level" integer,
	"is_repeatable" boolean DEFAULT false NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_quests_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "creator_item_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"attribute_key" text NOT NULL,
	"attribute_value" text NOT NULL,
	"attribute_type" text DEFAULT 'string' NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"display_label" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"component_item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"can_substitute" boolean DEFAULT false NOT NULL,
	"substitute_item_id" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_crafting_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"output_item_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"recipe_name" text NOT NULL,
	"description" text,
	"crafting_station" text,
	"crafting_time" integer DEFAULT 0 NOT NULL,
	"output_quantity" integer DEFAULT 1 NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	"required_skill" text,
	"required_skill_level" integer DEFAULT 0 NOT NULL,
	"experience_gained" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_drops" (
	"id" serial PRIMARY KEY NOT NULL,
	"loot_table_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"drop_chance" real DEFAULT 0.1 NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"max_quantity" integer DEFAULT 1 NOT NULL,
	"required_condition" text,
	"weight" real DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"effect_name" text NOT NULL,
	"effect_type" text NOT NULL,
	"trigger" text DEFAULT 'on_use' NOT NULL,
	"target_type" text DEFAULT 'self' NOT NULL,
	"duration" integer,
	"magnitude" real DEFAULT 0 NOT NULL,
	"chance" real DEFAULT 1 NOT NULL,
	"cooldown" integer,
	"description" text,
	"script_ref" text,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_equipment_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"slot_name" text NOT NULL,
	"slot_group" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"exported_by" integer NOT NULL,
	"format" text DEFAULT 'json' NOT NULL,
	"payload" text NOT NULL,
	"checksum" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"performed_by" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"imported_by" integer NOT NULL,
	"source_format" text DEFAULT 'json' NOT NULL,
	"source_ref" text,
	"status" text DEFAULT 'success' NOT NULL,
	"errors" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_inventories" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"inventory_name" text NOT NULL,
	"owner_type" text DEFAULT 'npc' NOT NULL,
	"owner_id" integer,
	"max_slots" integer DEFAULT 20 NOT NULL,
	"max_weight" real DEFAULT 100 NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"allowed_types" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_loot_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"table_name" text NOT NULL,
	"description" text,
	"roll_type" text DEFAULT 'single' NOT NULL,
	"min_rolls" integer DEFAULT 1 NOT NULL,
	"max_rolls" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"currency_type" text DEFAULT 'gold' NOT NULL,
	"buy_price" integer DEFAULT 0 NOT NULL,
	"sell_price" integer DEFAULT 0 NOT NULL,
	"repair_cost" integer DEFAULT 0 NOT NULL,
	"auction_min_bid" integer DEFAULT 0 NOT NULL,
	"region_id" integer,
	"faction_id" integer,
	"discount_rate" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_restrictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"restriction_type" text NOT NULL,
	"restriction_value" text NOT NULL,
	"is_blacklist" boolean DEFAULT true NOT NULL,
	"reason" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"stat_name" text NOT NULL,
	"base_value" real DEFAULT 0 NOT NULL,
	"min_value" real DEFAULT 0 NOT NULL,
	"max_value" real DEFAULT 0 NOT NULL,
	"scaling" real DEFAULT 1 NOT NULL,
	"scaling_stat" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_item_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"template_name" text NOT NULL,
	"description" text,
	"category" text,
	"tags" text[],
	"is_public" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"snapshot" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_trade_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"rule_type" text NOT NULL,
	"condition" text,
	"value" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_usage_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"rule_type" text DEFAULT 'requirement' NOT NULL,
	"condition" text,
	"value" text,
	"fail_message" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_item_visuals" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"visual_type" text DEFAULT 'icon' NOT NULL,
	"asset_id" integer,
	"asset_url" text,
	"color_tint" text,
	"scale" real DEFAULT 1 NOT NULL,
	"offset" jsonb,
	"rotation" jsonb,
	"animation_id" text,
	"particle_effect" text,
	"shader_override" text,
	"metadata" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"flavor_text" text,
	"item_type" "item_type" DEFAULT 'material' NOT NULL,
	"category" "item_category" DEFAULT 'misc' NOT NULL,
	"rarity" "item_rarity" DEFAULT 'common' NOT NULL,
	"quality" "item_quality" DEFAULT 'normal' NOT NULL,
	"binding_type" "item_binding_type" DEFAULT 'none' NOT NULL,
	"stack_type" "item_stack_type" DEFAULT 'non_stackable' NOT NULL,
	"max_stack" integer DEFAULT 1 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	"weight" real DEFAULT 0 NOT NULL,
	"base_value" integer DEFAULT 0 NOT NULL,
	"sell_value" integer DEFAULT 0 NOT NULL,
	"is_quest_item" boolean DEFAULT false NOT NULL,
	"is_tradeable" boolean DEFAULT true NOT NULL,
	"is_droppable" boolean DEFAULT true NOT NULL,
	"is_destroyable" boolean DEFAULT true NOT NULL,
	"icon_asset_id" integer,
	"model_asset_id" integer,
	"thumbnail_url" text,
	"tags" text[],
	"metadata" jsonb,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_animations" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"animation_type" text DEFAULT 'cast' NOT NULL,
	"animation_asset_id" integer,
	"animation_ref" text,
	"blend_time" real DEFAULT 0.1 NOT NULL,
	"speed" real DEFAULT 1 NOT NULL,
	"loop" boolean DEFAULT false NOT NULL,
	"interruptible" boolean DEFAULT false NOT NULL,
	"root_motion" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_audio" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"audio_type" text DEFAULT 'cast' NOT NULL,
	"audio_asset_id" integer,
	"audio_ref" text,
	"volume" real DEFAULT 1 NOT NULL,
	"pitch" real DEFAULT 1 NOT NULL,
	"loop" boolean DEFAULT false NOT NULL,
	"min_distance" real DEFAULT 1 NOT NULL,
	"max_distance" real DEFAULT 30 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_buffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"buff_name" text NOT NULL,
	"stat_affected" text NOT NULL,
	"modifier_type" text DEFAULT 'flat' NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"value_per_level" real DEFAULT 0 NOT NULL,
	"duration" real DEFAULT 5 NOT NULL,
	"is_stackable" boolean DEFAULT false NOT NULL,
	"max_stacks" integer DEFAULT 1 NOT NULL,
	"icon_asset_id" integer,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_cooldowns" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"cooldown_type" "cooldown_type" DEFAULT 'local' NOT NULL,
	"duration" real DEFAULT 1 NOT NULL,
	"duration_per_level" real DEFAULT 0 NOT NULL,
	"global_cooldown_duration" real DEFAULT 1.5 NOT NULL,
	"can_reduce_with_stats" boolean DEFAULT true NOT NULL,
	"min_cooldown" real DEFAULT 0.5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"resource_type" "resource_type" DEFAULT 'mana' NOT NULL,
	"amount" real DEFAULT 10 NOT NULL,
	"amount_per_level" real DEFAULT 0 NOT NULL,
	"is_percentage" boolean DEFAULT false NOT NULL,
	"charge_count" integer DEFAULT 1 NOT NULL,
	"recharge_duration" real DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_debuffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"debuff_name" text NOT NULL,
	"debuff_category" text DEFAULT 'slow' NOT NULL,
	"stat_affected" text,
	"modifier_type" text DEFAULT 'flat' NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"value_per_level" real DEFAULT 0 NOT NULL,
	"duration" real DEFAULT 3 NOT NULL,
	"is_crowd_control" boolean DEFAULT false NOT NULL,
	"can_be_dispelled" boolean DEFAULT true NOT NULL,
	"icon_asset_id" integer,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"effect_name" text NOT NULL,
	"effect_type" "skill_effect_type" DEFAULT 'buff' NOT NULL,
	"trigger" text DEFAULT 'on_cast' NOT NULL,
	"target_type" text DEFAULT 'enemy' NOT NULL,
	"magnitude" real DEFAULT 0 NOT NULL,
	"magnitude_per_level" real DEFAULT 0 NOT NULL,
	"duration" real DEFAULT 0 NOT NULL,
	"duration_per_level" real DEFAULT 0 NOT NULL,
	"chance" real DEFAULT 1 NOT NULL,
	"script_ref" text,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"exported_by" integer NOT NULL,
	"format" text DEFAULT 'json' NOT NULL,
	"payload" text NOT NULL,
	"checksum" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"performed_by" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_hitboxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"hitbox_name" text NOT NULL,
	"shape" text DEFAULT 'circle' NOT NULL,
	"width" real DEFAULT 1 NOT NULL,
	"height" real DEFAULT 1 NOT NULL,
	"depth" real DEFAULT 1 NOT NULL,
	"offset_x" real DEFAULT 0 NOT NULL,
	"offset_y" real DEFAULT 0 NOT NULL,
	"offset_z" real DEFAULT 0 NOT NULL,
	"active_frame_start" integer DEFAULT 0 NOT NULL,
	"active_frame_end" integer DEFAULT 10 NOT NULL,
	"damage_multiplier" real DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"imported_by" integer NOT NULL,
	"source_format" text DEFAULT 'json' NOT NULL,
	"source_ref" text,
	"status" text DEFAULT 'success' NOT NULL,
	"errors" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"level" integer NOT NULL,
	"damage_multiplier" real DEFAULT 1 NOT NULL,
	"heal_multiplier" real DEFAULT 1 NOT NULL,
	"range_bonus" real DEFAULT 0 NOT NULL,
	"radius_bonus" real DEFAULT 0 NOT NULL,
	"cooldown_reduction" real DEFAULT 0 NOT NULL,
	"resource_cost_multiplier" real DEFAULT 1 NOT NULL,
	"duration_multiplier" real DEFAULT 1 NOT NULL,
	"description" text,
	"unlocks_effect" text,
	"xp_required" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_projectiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"projectile_name" text NOT NULL,
	"speed" real DEFAULT 10 NOT NULL,
	"max_range" real DEFAULT 20 NOT NULL,
	"hit_radius" real DEFAULT 0.5 NOT NULL,
	"is_piercing" boolean DEFAULT false NOT NULL,
	"is_homing" boolean DEFAULT false NOT NULL,
	"homing_strength" real DEFAULT 1 NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"spread_angle" real DEFAULT 0 NOT NULL,
	"gravity" real DEFAULT 0 NOT NULL,
	"model_asset_id" integer,
	"particle_effect_id" text,
	"trail_effect_id" text,
	"impact_effect_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"requirement_type" text NOT NULL,
	"requirement_value" text NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"fail_message" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL,
	"times_simulated" integer DEFAULT 0 NOT NULL,
	"avg_damage_dealt" real DEFAULT 0 NOT NULL,
	"avg_heal_dealt" real DEFAULT 0 NOT NULL,
	"last_simulated_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_skill_statistics_skill_id_unique" UNIQUE("skill_id")
);
--> statement-breakpoint
CREATE TABLE "creator_skill_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_skill_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"template_name" text NOT NULL,
	"description" text,
	"category" text,
	"tags" text[],
	"is_public" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"snapshot" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skill_visuals" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_id" integer NOT NULL,
	"visual_type" text DEFAULT 'vfx' NOT NULL,
	"asset_id" integer,
	"asset_ref" text,
	"attach_point" text DEFAULT 'caster' NOT NULL,
	"scale" real DEFAULT 1 NOT NULL,
	"color_tint" text,
	"duration" real DEFAULT 1 NOT NULL,
	"loop" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"flavor_text" text,
	"skill_type" "skill_type" DEFAULT 'active' NOT NULL,
	"skill_target" "skill_target" DEFAULT 'enemy' NOT NULL,
	"cast_type" "cast_type" DEFAULT 'instant' NOT NULL,
	"damage_type" "damage_type" DEFAULT 'physical' NOT NULL,
	"resource_type" "resource_type" DEFAULT 'mana' NOT NULL,
	"max_level" integer DEFAULT 5 NOT NULL,
	"base_range" real DEFAULT 5 NOT NULL,
	"base_radius" real DEFAULT 0 NOT NULL,
	"base_cast_time" real DEFAULT 0 NOT NULL,
	"base_cooldown" real DEFAULT 1 NOT NULL,
	"base_resource_cost" real DEFAULT 10 NOT NULL,
	"base_damage" real DEFAULT 0 NOT NULL,
	"base_heal" real DEFAULT 0 NOT NULL,
	"icon_asset_id" integer,
	"thumbnail_url" text,
	"tags" text[],
	"metadata" jsonb,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"graph_ref" text,
	"trigger_graph_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_block_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_block_chance" real DEFAULT 0.1 NOT NULL,
	"block_chance_scaling" real DEFAULT 0.005 NOT NULL,
	"block_damage_reduction" real DEFAULT 0.5 NOT NULL,
	"max_block_chance" real DEFAULT 0.75 NOT NULL,
	"requires_shield" boolean DEFAULT true NOT NULL,
	"cooldown" real DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"performed_by" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combat_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"rule_type" text DEFAULT 'general' NOT NULL,
	"trigger" "combat_trigger" DEFAULT 'on_hit' NOT NULL,
	"condition" text,
	"action" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combat_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combat_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"zone_name" text NOT NULL,
	"zone_type" text DEFAULT 'arena' NOT NULL,
	"shape" text DEFAULT 'circle' NOT NULL,
	"radius" real DEFAULT 20 NOT NULL,
	"width" real DEFAULT 20 NOT NULL,
	"height" real DEFAULT 20 NOT NULL,
	"center_x" real DEFAULT 0 NOT NULL,
	"center_y" real DEFAULT 0 NOT NULL,
	"center_z" real DEFAULT 0 NOT NULL,
	"damage_outside" boolean DEFAULT false NOT NULL,
	"damage_per_second" real DEFAULT 0 NOT NULL,
	"shrink_rate" real DEFAULT 0 NOT NULL,
	"world_ref" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combats" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"combat_mode" "combat_mode" DEFAULT 'real_time' NOT NULL,
	"turn_duration" real DEFAULT 30 NOT NULL,
	"max_rounds" integer DEFAULT 0 NOT NULL,
	"max_participants" integer DEFAULT 10 NOT NULL,
	"allow_friendly_fire" boolean DEFAULT false NOT NULL,
	"allow_flee" boolean DEFAULT true NOT NULL,
	"flee_chance" real DEFAULT 0.5 NOT NULL,
	"allow_respawn" boolean DEFAULT true NOT NULL,
	"respawn_delay" real DEFAULT 5 NOT NULL,
	"death_penalty" text DEFAULT 'none' NOT NULL,
	"aggro_radius" real DEFAULT 10 NOT NULL,
	"tags" text[],
	"metadata" jsonb,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"graph_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_combo_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"combo_name" text NOT NULL,
	"required_hits" integer DEFAULT 3 NOT NULL,
	"window_duration" real DEFAULT 2 NOT NULL,
	"bonus_damage_multiplier" real DEFAULT 1.5 NOT NULL,
	"bonus_effect" text,
	"reset_on_miss" boolean DEFAULT true NOT NULL,
	"max_combo_count" integer DEFAULT 10 NOT NULL,
	"parent_combo_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_critical_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_crit_chance" real DEFAULT 0.05 NOT NULL,
	"crit_chance_scaling" real DEFAULT 0.01 NOT NULL,
	"base_crit_multiplier" real DEFAULT 1.5 NOT NULL,
	"crit_multiplier_scaling" real DEFAULT 0.1 NOT NULL,
	"max_crit_chance" real DEFAULT 0.75 NOT NULL,
	"max_crit_multiplier" real DEFAULT 5 NOT NULL,
	"applies_status_on_crit" boolean DEFAULT false NOT NULL,
	"crit_status_ref" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_damage_formulas" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"formula_name" text NOT NULL,
	"formula_type" "damage_formula" DEFAULT 'flat' NOT NULL,
	"base_value" real DEFAULT 10 NOT NULL,
	"attack_scaling" real DEFAULT 1 NOT NULL,
	"defense_scaling" real DEFAULT 0 NOT NULL,
	"level_scaling" real DEFAULT 0 NOT NULL,
	"random_min" real DEFAULT 0.9 NOT NULL,
	"random_max" real DEFAULT 1.1 NOT NULL,
	"expression" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_damage_modifiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"modifier_name" text NOT NULL,
	"damage_type" text DEFAULT 'physical' NOT NULL,
	"modifier_value" real DEFAULT 1 NOT NULL,
	"is_percentage" boolean DEFAULT true NOT NULL,
	"applies_on_crit" boolean DEFAULT false NOT NULL,
	"condition" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_defense_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"armor_value" real DEFAULT 0 NOT NULL,
	"armor_reduction" real DEFAULT 0 NOT NULL,
	"max_reduction_pct" real DEFAULT 0.75 NOT NULL,
	"flat_reduction" real DEFAULT 0 NOT NULL,
	"defense_scaling" real DEFAULT 0.01 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dodge_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_dodge_chance" real DEFAULT 0.05 NOT NULL,
	"dodge_chance_scaling" real DEFAULT 0.005 NOT NULL,
	"max_dodge_chance" real DEFAULT 0.75 NOT NULL,
	"agility_scaling" real DEFAULT 0.01 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_hit_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_hit_chance" real DEFAULT 0.9 NOT NULL,
	"accuracy_scaling" real DEFAULT 0.01 NOT NULL,
	"evasion_scaling" real DEFAULT 0.01 NOT NULL,
	"min_hit_chance" real DEFAULT 0.05 NOT NULL,
	"max_hit_chance" real DEFAULT 0.99 NOT NULL,
	"range_modifier" real DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_parry_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_parry_chance" real DEFAULT 0.05 NOT NULL,
	"parry_chance_scaling" real DEFAULT 0.005 NOT NULL,
	"max_parry_chance" real DEFAULT 0.5 NOT NULL,
	"counter_attack_chance" real DEFAULT 0.3 NOT NULL,
	"counter_damage_multiplier" real DEFAULT 1 NOT NULL,
	"requires_melee_weapon" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_resistances" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"resistance_name" text NOT NULL,
	"damage_type" text DEFAULT 'magic' NOT NULL,
	"resist_value" real DEFAULT 0 NOT NULL,
	"max_resist_pct" real DEFAULT 0.75 NOT NULL,
	"penetration_stat" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_respawn_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"respawn_delay" real DEFAULT 5 NOT NULL,
	"hp_on_respawn" real DEFAULT 1 NOT NULL,
	"mp_on_respawn" real DEFAULT 1 NOT NULL,
	"respawn_location" text DEFAULT 'origin' NOT NULL,
	"invulnerability_duration" real DEFAULT 3 NOT NULL,
	"clear_status_on_respawn" boolean DEFAULT true NOT NULL,
	"respawn_penalty" text,
	"max_respawns" integer DEFAULT -1 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_status_effect_stacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"status_effect_id" integer NOT NULL,
	"stack_level" integer NOT NULL,
	"duration_multiplier" real DEFAULT 1 NOT NULL,
	"damage_multiplier" real DEFAULT 1 NOT NULL,
	"additional_effect" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_status_effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"effect_name" text NOT NULL,
	"category" "status_category" DEFAULT 'debuff' NOT NULL,
	"description" text,
	"duration" real DEFAULT 5 NOT NULL,
	"tick_interval" real DEFAULT 1 NOT NULL,
	"tick_damage" real DEFAULT 0 NOT NULL,
	"tick_heal" real DEFAULT 0 NOT NULL,
	"stat_modifiers" jsonb,
	"is_crowd_control" boolean DEFAULT false NOT NULL,
	"prevents_actions" boolean DEFAULT false NOT NULL,
	"can_be_dispelled" boolean DEFAULT true NOT NULL,
	"is_stackable" boolean DEFAULT false NOT NULL,
	"max_stacks" integer DEFAULT 1 NOT NULL,
	"icon_asset_id" integer,
	"trigger_ref" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_target_filters" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"filter_name" text NOT NULL,
	"target_type" "combat_target" DEFAULT 'single_enemy' NOT NULL,
	"max_targets" integer DEFAULT 1 NOT NULL,
	"range_limit" real DEFAULT 0 NOT NULL,
	"require_line_of_sight" boolean DEFAULT false NOT NULL,
	"exclude_self" boolean DEFAULT true NOT NULL,
	"faction_filter" text,
	"condition_expression" text,
	"priority_expression" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_threat_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"combat_id" integer NOT NULL,
	"rule_name" text NOT NULL,
	"base_threat_multiplier" real DEFAULT 1 NOT NULL,
	"healing_threat_multiplier" real DEFAULT 0.5 NOT NULL,
	"tanking_threat_bonus" real DEFAULT 1.5 NOT NULL,
	"aggro_decay_rate" real DEFAULT 0 NOT NULL,
	"aggro_transfer_chance" real DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_bosses" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"name" text NOT NULL,
	"npc_ref" text,
	"combat_ref" text,
	"skill_refs" text[],
	"ai_graph_ref" text,
	"hp_multiplier" real DEFAULT 1 NOT NULL,
	"damage_multiplier" real DEFAULT 1 NOT NULL,
	"phase" integer DEFAULT 1 NOT NULL,
	"phase_thresholds" jsonb,
	"enrage_timer" integer,
	"death_trigger" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"name" text NOT NULL,
	"checkpoint_index" integer DEFAULT 0 NOT NULL,
	"trigger_condition" text,
	"save_party_state" boolean DEFAULT true NOT NULL,
	"heals_party" boolean DEFAULT false NOT NULL,
	"heal_percent" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"from_room_id" integer NOT NULL,
	"to_room_id" integer NOT NULL,
	"is_bidirectional" boolean DEFAULT true NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"lock_type" text DEFAULT 'none' NOT NULL,
	"key_ref" text,
	"trigger_condition" text,
	"travel_time" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"name" text NOT NULL,
	"event_type" text DEFAULT 'trigger' NOT NULL,
	"trigger" text NOT NULL,
	"action" text NOT NULL,
	"condition" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_one_shot" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"graph_ref" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"export_type" text DEFAULT 'json' NOT NULL,
	"payload" jsonb NOT NULL,
	"checksum" text NOT NULL,
	"exported_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"action" text NOT NULL,
	"field" text,
	"old_value" text,
	"new_value" text,
	"changed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"import_type" text DEFAULT 'json' NOT NULL,
	"source_data" jsonb NOT NULL,
	"imported_by" integer NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"errors" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_monsters" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"spawnpoint_id" integer,
	"npc_ref" text,
	"combat_ref" text,
	"skill_refs" text[],
	"hp_multiplier" real DEFAULT 1 NOT NULL,
	"damage_multiplier" real DEFAULT 1 NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"loot_table_ref" text,
	"aggro_range" real DEFAULT 10 NOT NULL,
	"patrol_path" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"puzzle_graph_ref" text,
	"solution" jsonb,
	"hints" jsonb,
	"time_limit" integer,
	"failure_penalty" text,
	"success_trigger" text,
	"reward_ref" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"requirement_type" text DEFAULT 'level' NOT NULL,
	"min_value" integer,
	"max_value" integer,
	"item_ref" text,
	"quest_ref" text,
	"skill_ref" text,
	"description" text,
	"is_hard_requirement" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"name" text NOT NULL,
	"dungeon_reward_type" "dungeon_reward_type" DEFAULT 'item' NOT NULL,
	"item_ref" text,
	"loot_table_ref" text,
	"currency_amount" integer DEFAULT 0 NOT NULL,
	"xp_amount" integer DEFAULT 0 NOT NULL,
	"trigger_condition" text DEFAULT 'on_completion' NOT NULL,
	"is_guaranteed" boolean DEFAULT false NOT NULL,
	"drop_chance" real DEFAULT 1 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"room_type" "room_type" DEFAULT 'chamber' NOT NULL,
	"width" real DEFAULT 10 NOT NULL,
	"height" real DEFAULT 10 NOT NULL,
	"depth" real DEFAULT 10 NOT NULL,
	"position_x" real DEFAULT 0 NOT NULL,
	"position_y" real DEFAULT 0 NOT NULL,
	"position_z" real DEFAULT 0 NOT NULL,
	"is_entrance" boolean DEFAULT false NOT NULL,
	"is_exit" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"lock_condition" text,
	"mesh_asset_ref" text,
	"texture_asset_ref" text,
	"sfx_asset_ref" text,
	"tags" text[],
	"metadata" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_runtime" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"party_ids" jsonb,
	"current_room_id" integer,
	"checkpoint_id" integer,
	"state" text DEFAULT 'idle' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"run_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"name" text NOT NULL,
	"script_type" text DEFAULT 'lua' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"entrypoint" text DEFAULT 'main' NOT NULL,
	"trigger_on" text DEFAULT 'on_enter' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_spawnpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"name" text NOT NULL,
	"dungeon_spawn_type" "dungeon_spawn_type" DEFAULT 'fixed' NOT NULL,
	"npc_ref" text,
	"monster_ref" text,
	"count" integer DEFAULT 1 NOT NULL,
	"max_count" integer DEFAULT 1 NOT NULL,
	"respawn_delay" real DEFAULT 30 NOT NULL,
	"trigger_condition" text,
	"wave_number" integer DEFAULT 1 NOT NULL,
	"position_x" real DEFAULT 0 NOT NULL,
	"position_y" real DEFAULT 0 NOT NULL,
	"position_z" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"total_runs" integer DEFAULT 0 NOT NULL,
	"completed_runs" integer DEFAULT 0 NOT NULL,
	"failed_runs" integer DEFAULT 0 NOT NULL,
	"average_completion_time" real,
	"fastest_completion_time" real,
	"total_boss_kills" integer DEFAULT 0 NOT NULL,
	"total_deaths" integer DEFAULT 0 NOT NULL,
	"average_party_size" real,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"thumbnail_ref" text,
	"payload" jsonb NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_traps" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"name" text NOT NULL,
	"trap_type" "trap_type" DEFAULT 'pressure_plate' NOT NULL,
	"skill_ref" text,
	"damage_formula" text DEFAULT 'flat' NOT NULL,
	"damage_amount" real DEFAULT 10 NOT NULL,
	"status_effect_ref" text,
	"trigger_condition" text,
	"reset_condition" text,
	"can_disarm" boolean DEFAULT true NOT NULL,
	"disarm_difficulty" integer DEFAULT 10 NOT NULL,
	"position_x" real DEFAULT 0 NOT NULL,
	"position_y" real DEFAULT 0 NOT NULL,
	"sfx_asset_ref" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeon_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"dungeon_id" integer NOT NULL,
	"version" integer NOT NULL,
	"label" text,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dungeons" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_by" integer NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"dungeon_type" "dungeon_type" DEFAULT 'linear' NOT NULL,
	"status" "dungeon_status" DEFAULT 'draft' NOT NULL,
	"difficulty" "dungeon_difficulty" DEFAULT 'normal' NOT NULL,
	"reset_type" "reset_type" DEFAULT 'daily' NOT NULL,
	"reset_interval_hours" real DEFAULT 24 NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"max_level" integer DEFAULT 100 NOT NULL,
	"min_party_size" integer DEFAULT 1 NOT NULL,
	"max_party_size" integer DEFAULT 5 NOT NULL,
	"time_limit" integer,
	"world_ref" text,
	"region_ref" text,
	"portal_ref" text,
	"graph_ref" text,
	"runtime_ref" text,
	"music_asset_ref" text,
	"icon_asset_ref" text,
	"tags" text[],
	"metadata" jsonb,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_assets" ADD CONSTRAINT "creator_assets_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_assets" ADD CONSTRAINT "creator_assets_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_documents" ADD CONSTRAINT "creator_documents_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_documents" ADD CONSTRAINT "creator_documents_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_documents" ADD CONSTRAINT "creator_documents_updated_by_creator_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_logs" ADD CONSTRAINT "creator_logs_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_logs" ADD CONSTRAINT "creator_logs_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_packages" ADD CONSTRAINT "creator_packages_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_plugins" ADD CONSTRAINT "creator_plugins_author_id_creator_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_projects" ADD CONSTRAINT "creator_projects_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_publish_jobs" ADD CONSTRAINT "creator_publish_jobs_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_publish_jobs" ADD CONSTRAINT "creator_publish_jobs_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_settings" ADD CONSTRAINT "creator_settings_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_activity" ADD CONSTRAINT "creator_activity_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_activity" ADD CONSTRAINT "creator_activity_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_activity" ADD CONSTRAINT "creator_activity_organization_id_creator_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."creator_organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_invitations" ADD CONSTRAINT "creator_invitations_organization_id_creator_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."creator_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_invitations" ADD CONSTRAINT "creator_invitations_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_invitations" ADD CONSTRAINT "creator_invitations_inviter_id_creator_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_invitations" ADD CONSTRAINT "creator_invitations_invitee_id_creator_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_notifications" ADD CONSTRAINT "creator_notifications_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_organization_members" ADD CONSTRAINT "creator_organization_members_organization_id_creator_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."creator_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_organization_members" ADD CONSTRAINT "creator_organization_members_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_organizations" ADD CONSTRAINT "creator_organizations_owner_id_creator_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."creator_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_members" ADD CONSTRAINT "creator_project_members_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_members" ADD CONSTRAINT "creator_project_members_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_members" ADD CONSTRAINT "creator_project_members_added_by_creator_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_stars" ADD CONSTRAINT "creator_project_stars_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_stars" ADD CONSTRAINT "creator_project_stars_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_watchers" ADD CONSTRAINT "creator_project_watchers_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_project_watchers" ADD CONSTRAINT "creator_project_watchers_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_bookmarks" ADD CONSTRAINT "creator_document_bookmarks_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_bookmarks" ADD CONSTRAINT "creator_document_bookmarks_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_exports" ADD CONSTRAINT "creator_document_exports_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_exports" ADD CONSTRAINT "creator_document_exports_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_exports" ADD CONSTRAINT "creator_document_exports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_folders" ADD CONSTRAINT "creator_document_folders_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_folders" ADD CONSTRAINT "creator_document_folders_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_history" ADD CONSTRAINT "creator_document_history_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_history" ADD CONSTRAINT "creator_document_history_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_imports" ADD CONSTRAINT "creator_document_imports_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_imports" ADD CONSTRAINT "creator_document_imports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_locks" ADD CONSTRAINT "creator_document_locks_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_locks" ADD CONSTRAINT "creator_document_locks_locked_by_creator_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_relations" ADD CONSTRAINT "creator_document_relations_source_id_creator_documents_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_relations" ADD CONSTRAINT "creator_document_relations_target_id_creator_documents_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_relations" ADD CONSTRAINT "creator_document_relations_created_by_creator_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_tags" ADD CONSTRAINT "creator_document_tags_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_versions" ADD CONSTRAINT "creator_document_versions_document_id_creator_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."creator_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_document_versions" ADD CONSTRAINT "creator_document_versions_created_by_creator_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_collection_items" ADD CONSTRAINT "creator_asset_collection_items_collection_id_creator_asset_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."creator_asset_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_collection_items" ADD CONSTRAINT "creator_asset_collection_items_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_collections" ADD CONSTRAINT "creator_asset_collections_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_collections" ADD CONSTRAINT "creator_asset_collections_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_dependencies" ADD CONSTRAINT "creator_asset_dependencies_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_dependencies" ADD CONSTRAINT "creator_asset_dependencies_depends_on_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("depends_on_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_exports" ADD CONSTRAINT "creator_asset_exports_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_exports" ADD CONSTRAINT "creator_asset_exports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_folders" ADD CONSTRAINT "creator_asset_folders_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_folders" ADD CONSTRAINT "creator_asset_folders_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_imports" ADD CONSTRAINT "creator_asset_imports_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_imports" ADD CONSTRAINT "creator_asset_imports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_metadata" ADD CONSTRAINT "creator_asset_metadata_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_processing_jobs" ADD CONSTRAINT "creator_asset_processing_jobs_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_references" ADD CONSTRAINT "creator_asset_references_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_tags" ADD CONSTRAINT "creator_asset_tags_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_thumbnails" ADD CONSTRAINT "creator_asset_thumbnails_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_usage" ADD CONSTRAINT "creator_asset_usage_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_versions" ADD CONSTRAINT "creator_asset_versions_asset_id_creator_pipeline_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."creator_pipeline_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_asset_versions" ADD CONSTRAINT "creator_asset_versions_created_by_creator_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_pipeline_assets" ADD CONSTRAINT "creator_pipeline_assets_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_pipeline_assets" ADD CONSTRAINT "creator_pipeline_assets_folder_id_creator_asset_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."creator_asset_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_pipeline_assets" ADD CONSTRAINT "creator_pipeline_assets_created_by_creator_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_pipeline_assets" ADD CONSTRAINT "creator_pipeline_assets_updated_by_creator_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_breakpoints" ADD CONSTRAINT "creator_graph_breakpoints_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_breakpoints" ADD CONSTRAINT "creator_graph_breakpoints_node_id_creator_graph_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."creator_graph_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_comments" ADD CONSTRAINT "creator_graph_comments_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_compiler_cache" ADD CONSTRAINT "creator_graph_compiler_cache_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_connections" ADD CONSTRAINT "creator_graph_connections_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_connections" ADD CONSTRAINT "creator_graph_connections_source_pin_id_creator_graph_pins_id_fk" FOREIGN KEY ("source_pin_id") REFERENCES "public"."creator_graph_pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_connections" ADD CONSTRAINT "creator_graph_connections_target_pin_id_creator_graph_pins_id_fk" FOREIGN KEY ("target_pin_id") REFERENCES "public"."creator_graph_pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_events" ADD CONSTRAINT "creator_graph_events_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_execution_logs" ADD CONSTRAINT "creator_graph_execution_logs_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_execution_logs" ADD CONSTRAINT "creator_graph_execution_logs_node_id_creator_graph_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."creator_graph_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_functions" ADD CONSTRAINT "creator_graph_functions_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_groups" ADD CONSTRAINT "creator_graph_groups_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_history" ADD CONSTRAINT "creator_graph_history_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_history" ADD CONSTRAINT "creator_graph_history_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_macros" ADD CONSTRAINT "creator_graph_macros_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_macros" ADD CONSTRAINT "creator_graph_macros_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_nodes" ADD CONSTRAINT "creator_graph_nodes_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_pins" ADD CONSTRAINT "creator_graph_pins_node_id_creator_graph_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."creator_graph_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_pins" ADD CONSTRAINT "creator_graph_pins_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_preferences" ADD CONSTRAINT "creator_graph_preferences_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_runtime" ADD CONSTRAINT "creator_graph_runtime_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_shortcuts" ADD CONSTRAINT "creator_graph_shortcuts_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_snapshots" ADD CONSTRAINT "creator_graph_snapshots_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_snapshots" ADD CONSTRAINT "creator_graph_snapshots_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_templates" ADD CONSTRAINT "creator_graph_templates_created_by_creator_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."creator_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_variables" ADD CONSTRAINT "creator_graph_variables_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_versions" ADD CONSTRAINT "creator_graph_versions_graph_id_creator_graphs_id_fk" FOREIGN KEY ("graph_id") REFERENCES "public"."creator_graphs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graph_versions" ADD CONSTRAINT "creator_graph_versions_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graphs" ADD CONSTRAINT "creator_graphs_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_graphs" ADD CONSTRAINT "creator_graphs_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_checkpoints" ADD CONSTRAINT "creator_runtime_checkpoints_snapshot_id_creator_runtime_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."creator_runtime_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_checkpoints" ADD CONSTRAINT "creator_runtime_checkpoints_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_components" ADD CONSTRAINT "creator_runtime_components_entity_id_creator_runtime_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."creator_runtime_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_components" ADD CONSTRAINT "creator_runtime_components_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_debug" ADD CONSTRAINT "creator_runtime_debug_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_entities" ADD CONSTRAINT "creator_runtime_entities_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_entities" ADD CONSTRAINT "creator_runtime_entities_world_id_creator_runtime_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_runtime_worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_errors" ADD CONSTRAINT "creator_runtime_errors_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_events" ADD CONSTRAINT "creator_runtime_events_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_history" ADD CONSTRAINT "creator_runtime_history_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_history" ADD CONSTRAINT "creator_runtime_history_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_jobs" ADD CONSTRAINT "creator_runtime_jobs_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_logs" ADD CONSTRAINT "creator_runtime_logs_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_memory" ADD CONSTRAINT "creator_runtime_memory_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_performance" ADD CONSTRAINT "creator_runtime_performance_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_profiles" ADD CONSTRAINT "creator_runtime_profiles_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_resources" ADD CONSTRAINT "creator_runtime_resources_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_scheduler" ADD CONSTRAINT "creator_runtime_scheduler_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_sessions" ADD CONSTRAINT "creator_runtime_sessions_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_sessions" ADD CONSTRAINT "creator_runtime_sessions_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_snapshots" ADD CONSTRAINT "creator_runtime_snapshots_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_systems" ADD CONSTRAINT "creator_runtime_systems_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_timers" ADD CONSTRAINT "creator_runtime_timers_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_variables" ADD CONSTRAINT "creator_runtime_variables_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_runtime_worlds" ADD CONSTRAINT "creator_runtime_worlds_session_id_creator_runtime_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."creator_runtime_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_bookmarks" ADD CONSTRAINT "creator_world_bookmarks_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_bookmarks" ADD CONSTRAINT "creator_world_bookmarks_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_chunks" ADD CONSTRAINT "creator_world_chunks_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_chunks" ADD CONSTRAINT "creator_world_chunks_region_id_creator_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."creator_world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_environments" ADD CONSTRAINT "creator_world_environments_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_exports" ADD CONSTRAINT "creator_world_exports_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_exports" ADD CONSTRAINT "creator_world_exports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_history" ADD CONSTRAINT "creator_world_history_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_history" ADD CONSTRAINT "creator_world_history_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_imports" ADD CONSTRAINT "creator_world_imports_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_imports" ADD CONSTRAINT "creator_world_imports_target_project_id_creator_projects_id_fk" FOREIGN KEY ("target_project_id") REFERENCES "public"."creator_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_layers" ADD CONSTRAINT "creator_world_layers_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_lighting" ADD CONSTRAINT "creator_world_lighting_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_navigation" ADD CONSTRAINT "creator_world_navigation_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_navigation" ADD CONSTRAINT "creator_world_navigation_region_id_creator_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."creator_world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_portals" ADD CONSTRAINT "creator_world_portals_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_portals" ADD CONSTRAINT "creator_world_portals_region_id_creator_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."creator_world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_regions" ADD CONSTRAINT "creator_world_regions_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_runtime" ADD CONSTRAINT "creator_world_runtime_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_scenes" ADD CONSTRAINT "creator_world_scenes_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_settings" ADD CONSTRAINT "creator_world_settings_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_spawnpoints" ADD CONSTRAINT "creator_world_spawnpoints_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_spawnpoints" ADD CONSTRAINT "creator_world_spawnpoints_region_id_creator_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."creator_world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_statistics" ADD CONSTRAINT "creator_world_statistics_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_templates" ADD CONSTRAINT "creator_world_templates_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_templates" ADD CONSTRAINT "creator_world_templates_source_world_id_creator_worlds_id_fk" FOREIGN KEY ("source_world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_versions" ADD CONSTRAINT "creator_world_versions_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_versions" ADD CONSTRAINT "creator_world_versions_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_world_weather" ADD CONSTRAINT "creator_world_weather_world_id_creator_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."creator_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_worlds" ADD CONSTRAINT "creator_worlds_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_worlds" ADD CONSTRAINT "creator_worlds_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_attributes" ADD CONSTRAINT "creator_npc_attributes_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_behavior_trees" ADD CONSTRAINT "creator_npc_behavior_trees_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_behaviors" ADD CONSTRAINT "creator_npc_behaviors_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_dialogue_choices" ADD CONSTRAINT "creator_npc_dialogue_choices_node_id_creator_npc_dialogue_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."creator_npc_dialogue_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_dialogue_nodes" ADD CONSTRAINT "creator_npc_dialogue_nodes_dialogue_id_creator_npc_dialogues_id_fk" FOREIGN KEY ("dialogue_id") REFERENCES "public"."creator_npc_dialogues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_dialogues" ADD CONSTRAINT "creator_npc_dialogues_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_equipment" ADD CONSTRAINT "creator_npc_equipment_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_factions" ADD CONSTRAINT "creator_npc_factions_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_factions" ADD CONSTRAINT "creator_npc_factions_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_history" ADD CONSTRAINT "creator_npc_history_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_history" ADD CONSTRAINT "creator_npc_history_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_inventory" ADD CONSTRAINT "creator_npc_inventory_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_patrol_paths" ADD CONSTRAINT "creator_npc_patrol_paths_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_profiles" ADD CONSTRAINT "creator_npc_profiles_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_relations" ADD CONSTRAINT "creator_npc_relations_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_relations" ADD CONSTRAINT "creator_npc_relations_target_npc_id_creator_npcs_id_fk" FOREIGN KEY ("target_npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_schedules" ADD CONSTRAINT "creator_npc_schedules_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_skills" ADD CONSTRAINT "creator_npc_skills_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_spawn_points" ADD CONSTRAINT "creator_npc_spawn_points_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_stats" ADD CONSTRAINT "creator_npc_stats_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_templates" ADD CONSTRAINT "creator_npc_templates_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_templates" ADD CONSTRAINT "creator_npc_templates_source_npc_id_creator_npcs_id_fk" FOREIGN KEY ("source_npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_versions" ADD CONSTRAINT "creator_npc_versions_npc_id_creator_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."creator_npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npc_versions" ADD CONSTRAINT "creator_npc_versions_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npcs" ADD CONSTRAINT "creator_npcs_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_npcs" ADD CONSTRAINT "creator_npcs_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_branches" ADD CONSTRAINT "creator_quest_branches_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_checkpoints" ADD CONSTRAINT "creator_quest_checkpoints_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_checkpoints" ADD CONSTRAINT "creator_quest_checkpoints_step_id_creator_quest_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."creator_quest_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_conditions" ADD CONSTRAINT "creator_quest_conditions_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_dialogues" ADD CONSTRAINT "creator_quest_dialogues_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_events" ADD CONSTRAINT "creator_quest_events_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_exports" ADD CONSTRAINT "creator_quest_exports_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_flags" ADD CONSTRAINT "creator_quest_flags_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_history" ADD CONSTRAINT "creator_quest_history_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_imports" ADD CONSTRAINT "creator_quest_imports_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_npcs" ADD CONSTRAINT "creator_quest_npcs_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_objectives" ADD CONSTRAINT "creator_quest_objectives_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_objectives" ADD CONSTRAINT "creator_quest_objectives_step_id_creator_quest_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."creator_quest_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_regions" ADD CONSTRAINT "creator_quest_regions_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_rewards" ADD CONSTRAINT "creator_quest_rewards_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_scripts" ADD CONSTRAINT "creator_quest_scripts_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_statistics" ADD CONSTRAINT "creator_quest_statistics_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_steps" ADD CONSTRAINT "creator_quest_steps_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_variables" ADD CONSTRAINT "creator_quest_variables_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quest_versions" ADD CONSTRAINT "creator_quest_versions_quest_id_creator_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."creator_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quests" ADD CONSTRAINT "creator_quests_user_id_creator_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."creator_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_quests" ADD CONSTRAINT "creator_quests_project_id_creator_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."creator_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creator_item_versions_item_version" ON "creator_item_versions" USING btree ("item_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_skill_levels_skill_level" ON "creator_skill_levels" USING btree ("skill_id","level");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_skill_versions_skill_version" ON "creator_skill_versions" USING btree ("skill_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_combat_versions_unique" ON "creator_combat_versions" USING btree ("combat_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_status_stacks_unique" ON "creator_status_effect_stacks" USING btree ("status_effect_id","stack_level");