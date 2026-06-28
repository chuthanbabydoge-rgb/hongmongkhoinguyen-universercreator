CREATE TYPE "public"."pet_food_type" AS ENUM('meat', 'fish', 'berries', 'vegetables', 'candy', 'special', 'potion', 'crystal', 'none');--> statement-breakpoint
CREATE TYPE "public"."pet_growth_type" AS ENUM('fast', 'normal', 'slow', 'erratic', 'fluctuating', 'medium_fast');--> statement-breakpoint
CREATE TYPE "public"."pet_personality" AS ENUM('brave', 'timid', 'jolly', 'modest', 'bold', 'calm', 'gentle', 'hasty', 'impish', 'lax', 'lonely', 'mild', 'naive', 'naughty', 'quiet', 'quirky', 'rash', 'relaxed', 'sassy', 'serious');--> statement-breakpoint
CREATE TYPE "public"."pet_rarity" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');--> statement-breakpoint
CREATE TYPE "public"."pet_size" AS ENUM('tiny', 'small', 'medium', 'large', 'huge', 'gigantic');--> statement-breakpoint
CREATE TYPE "public"."pet_state" AS ENUM('idle', 'following', 'fighting', 'resting', 'hungry', 'happy', 'evolving', 'breeding', 'sleeping', 'exploring');--> statement-breakpoint
CREATE TYPE "public"."pet_type" AS ENUM('beast', 'dragon', 'elemental', 'mechanical', 'undead', 'spirit', 'aquatic', 'flying', 'insect', 'plant', 'humanoid', 'demon');--> statement-breakpoint
CREATE TABLE "creator_pet_breeding" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"partner_id" integer,
	"offspring_species_id" integer,
	"breeding_cooldown" integer DEFAULT 3600 NOT NULL,
	"last_bred_at" timestamp,
	"max_breeds" integer DEFAULT 10 NOT NULL,
	"current_breeds" integer DEFAULT 0 NOT NULL,
	"inheritance_rules" jsonb,
	"special_traits" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"slot" text NOT NULL,
	"item_ref" text,
	"attack_bonus" integer DEFAULT 0 NOT NULL,
	"defense_bonus" integer DEFAULT 0 NOT NULL,
	"speed_bonus" integer DEFAULT 0 NOT NULL,
	"hp_bonus" integer DEFAULT 0 NOT NULL,
	"special_bonus" jsonb,
	"equipped_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_evolution" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"target_species_id" integer NOT NULL,
	"required_level" integer DEFAULT 20 NOT NULL,
	"required_item" text,
	"required_loyalty" integer,
	"required_condition" text,
	"evolution_order" integer DEFAULT 1 NOT NULL,
	"is_reversible" boolean DEFAULT false NOT NULL,
	"stat_boost_on_evolve" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"format" text DEFAULT 'json' NOT NULL,
	"payload" jsonb NOT NULL,
	"checksum" text,
	"exported_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_growth" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"growth_type" "pet_growth_type" DEFAULT 'normal' NOT NULL,
	"exp_multiplier" real DEFAULT 1 NOT NULL,
	"stat_multiplier" real DEFAULT 1 NOT NULL,
	"loyalty_growth" real DEFAULT 1 NOT NULL,
	"hunger_rate" real DEFAULT 1 NOT NULL,
	"evolution_eligible" boolean DEFAULT false NOT NULL,
	"max_level" integer DEFAULT 100 NOT NULL,
	"notes" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"action" text NOT NULL,
	"detail" text,
	"changed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_hunger" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"current_hunger" integer DEFAULT 100 NOT NULL,
	"max_hunger" integer DEFAULT 100 NOT NULL,
	"hunger_decay_rate" real DEFAULT 1 NOT NULL,
	"preferred_food" "pet_food_type" DEFAULT 'meat' NOT NULL,
	"disliked_food" "pet_food_type",
	"feed_cooldown" integer DEFAULT 300 NOT NULL,
	"last_fed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"source" text DEFAULT 'json' NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"imported_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"exp_required" integer DEFAULT 0 NOT NULL,
	"hp_bonus" integer DEFAULT 0 NOT NULL,
	"attack_bonus" integer DEFAULT 0 NOT NULL,
	"defense_bonus" integer DEFAULT 0 NOT NULL,
	"speed_bonus" integer DEFAULT 0 NOT NULL,
	"skill_unlocked" text,
	"reward" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_loyalty" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"current_loyalty" integer DEFAULT 50 NOT NULL,
	"max_loyalty" integer DEFAULT 100 NOT NULL,
	"min_loyalty" integer DEFAULT 0 NOT NULL,
	"loyalty_per_feed" integer DEFAULT 5 NOT NULL,
	"loyalty_per_combat" integer DEFAULT 3 NOT NULL,
	"loyalty_decay_rate" real DEFAULT 0.1 NOT NULL,
	"loyalty_thresholds" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_personality" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"personality" "pet_personality" DEFAULT 'quirky' NOT NULL,
	"stat_bonus_stat" text,
	"stat_penalty_stat" text,
	"preferred_activity" text,
	"flavor_text" text,
	"behavior_flags" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_runtime" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"is_spawned" boolean DEFAULT false NOT NULL,
	"is_summoned" boolean DEFAULT false NOT NULL,
	"owner_id" integer,
	"current_hp" integer DEFAULT 100 NOT NULL,
	"current_exp" integer DEFAULT 0 NOT NULL,
	"current_loyalty" integer DEFAULT 50 NOT NULL,
	"current_hunger" integer DEFAULT 100 NOT NULL,
	"runtime_state" "pet_state" DEFAULT 'idle' NOT NULL,
	"simulation_data" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"skill_ref" text NOT NULL,
	"slot_index" integer DEFAULT 0 NOT NULL,
	"learned_at_level" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uses" integer,
	"max_uses" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_spawn_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"region_ref" text,
	"spawn_weight" real DEFAULT 1 NOT NULL,
	"spawn_condition" text,
	"min_level" integer DEFAULT 1 NOT NULL,
	"max_level" integer DEFAULT 10 NOT NULL,
	"spawn_time_start" integer,
	"spawn_time_end" integer,
	"max_concurrent" integer DEFAULT 5 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "creator_pet_species" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"pet_type" "pet_type" DEFAULT 'beast' NOT NULL,
	"rarity" "pet_rarity" DEFAULT 'common' NOT NULL,
	"size" "pet_size" DEFAULT 'medium' NOT NULL,
	"food_type" "pet_food_type" DEFAULT 'meat' NOT NULL,
	"base_hp" integer DEFAULT 100 NOT NULL,
	"base_attack" integer DEFAULT 10 NOT NULL,
	"base_defense" integer DEFAULT 5 NOT NULL,
	"base_speed" integer DEFAULT 10 NOT NULL,
	"base_special_attack" integer DEFAULT 5 NOT NULL,
	"base_special_defense" integer DEFAULT 5 NOT NULL,
	"growth_type" "pet_growth_type" DEFAULT 'normal' NOT NULL,
	"capture_rate" integer DEFAULT 45 NOT NULL,
	"description" text,
	"icon_asset_id" text,
	"portrait_asset_id" text,
	"model_asset_id" text,
	"animation_asset_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"total_battles" integer DEFAULT 0 NOT NULL,
	"total_wins" integer DEFAULT 0 NOT NULL,
	"total_feeds" integer DEFAULT 0 NOT NULL,
	"total_evolutions" integer DEFAULT 0 NOT NULL,
	"total_breeds" integer DEFAULT 0 NOT NULL,
	"total_exp_gained" integer DEFAULT 0 NOT NULL,
	"highest_level" integer DEFAULT 1 NOT NULL,
	"playtime" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"speed" integer DEFAULT 10 NOT NULL,
	"special_attack" integer DEFAULT 5 NOT NULL,
	"special_defense" integer DEFAULT 5 NOT NULL,
	"crit_rate" real DEFAULT 0.05 NOT NULL,
	"evasion" real DEFAULT 0.05 NOT NULL,
	"accuracy" real DEFAULT 0.95 NOT NULL,
	"elemental_bonus" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_global" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pet_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"changelog" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"species_id" integer,
	"pet_type" "pet_type" DEFAULT 'beast' NOT NULL,
	"rarity" "pet_rarity" DEFAULT 'common' NOT NULL,
	"state" "pet_state" DEFAULT 'idle' NOT NULL,
	"personality" "pet_personality" DEFAULT 'quirky' NOT NULL,
	"size" "pet_size" DEFAULT 'medium' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"loyalty" integer DEFAULT 50 NOT NULL,
	"hunger" integer DEFAULT 100 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"icon_asset_id" text,
	"portrait_asset_id" text,
	"model_asset_id" text,
	"animation_asset_id" text,
	"audio_asset_id" text,
	"world_ref" text,
	"npc_ref" text,
	"combat_ref" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
