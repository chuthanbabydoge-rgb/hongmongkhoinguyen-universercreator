import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import Layout from "@/components/layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ProjectMembers from "@/pages/project-members";
import Assets from "@/pages/assets";
import Templates from "@/pages/templates";
import Plugins from "@/pages/plugins";
import Packages from "@/pages/packages";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Organizations from "@/pages/organizations";
import OrgDetail from "@/pages/org-detail";
import Invitations from "@/pages/invitations";
import Notifications from "@/pages/notifications";
import ActivityPage from "@/pages/activity";
import Documents from "@/pages/documents";
import DocumentDetail from "@/pages/document-detail";
import DocumentHistory from "@/pages/document-history";
import Folders from "@/pages/folders";
import Bookmarks from "@/pages/bookmarks";
import AssetDashboard from "@/pages/asset-dashboard";
import AssetBrowser from "@/pages/asset-browser";
import AssetDetail from "@/pages/asset-detail";
import AssetCollections from "@/pages/asset-collections";
import AssetFolders from "@/pages/asset-folders";
import UploadCenter from "@/pages/upload-center";
import ProcessingQueue from "@/pages/processing-queue";
import VisualScriptDashboard from "@/pages/visual-script-dashboard";
import GraphEditor from "@/pages/graph-editor";
import GraphBrowser from "@/pages/graph-browser";
import GraphTemplates from "@/pages/graph-templates";
import ExecutionConsole from "@/pages/execution-console";
import MacroLibrary from "@/pages/macro-library";
import CompilerPanel from "@/pages/compiler-panel";
import RuntimeMonitor from "@/pages/runtime-monitor";
import RuntimeDashboard from "@/pages/runtime-dashboard";
import PlayMode from "@/pages/runtime-play";
import SimulationCenter from "@/pages/simulation-center";
import RuntimeProfiler from "@/pages/runtime-profiler";
import RuntimeLogs from "@/pages/runtime-logs";
import RuntimeInspector from "@/pages/runtime-inspector";
import EntityExplorer from "@/pages/entity-explorer";
import ComponentExplorer from "@/pages/component-explorer";
import SystemMonitor from "@/pages/system-monitor";
import EventMonitor from "@/pages/event-monitor";
import DebugConsole from "@/pages/debug-console";
import SnapshotManager from "@/pages/snapshot-manager";
import WorldDashboard from "@/pages/world-dashboard";
import WorldBrowser from "@/pages/world-browser";
import WorldEditorPage from "@/pages/world-editor";
import WorldTemplates from "@/pages/world-templates";
import WorldRegions from "@/pages/world-regions";
import WorldLayers from "@/pages/world-layers";
import WorldEnvironment from "@/pages/world-environment";
import WorldWeather from "@/pages/world-weather";
import WorldLighting from "@/pages/world-lighting";
import WorldSpawnManager from "@/pages/world-spawn-manager";
import WorldPortalManager from "@/pages/world-portal-manager";
import WorldNavigation from "@/pages/world-navigation";
import WorldStatistics from "@/pages/world-statistics";
import WorldImportExport from "@/pages/world-import-export";
import NpcDashboard from "@/pages/npc-dashboard";
import NpcBrowser from "@/pages/npc-browser";
import NpcEditorPage from "@/pages/npc-editor-page";
import NpcTemplates from "@/pages/npc-templates";
import NpcBehaviorEditor from "@/pages/npc-behavior-editor";
import NpcDialogueEditor from "@/pages/npc-dialogue-editor";
import NpcScheduleEditor from "@/pages/npc-schedule-editor";
import NpcInventoryEditor from "@/pages/npc-inventory-editor";
import NpcEquipmentEditor from "@/pages/npc-equipment-editor";
import NpcSkillEditor from "@/pages/npc-skill-editor";
import NpcSpawnManager from "@/pages/npc-spawn-manager";
import NpcPatrolEditor from "@/pages/npc-patrol-editor";
import NpcRelationEditor from "@/pages/npc-relation-editor";
import NpcFactionManager from "@/pages/npc-faction-manager";
import NpcHistory from "@/pages/npc-history";
import NpcStatistics from "@/pages/npc-statistics";
import NpcImportExport from "@/pages/npc-import-export";
import NpcPreview from "@/pages/npc-preview";
import QuestDashboard from "@/pages/quest-dashboard";
import QuestBrowser from "@/pages/quest-browser";
import QuestEditorPage from "@/pages/quest-editor-page";
import QuestTemplates from "@/pages/quest-templates";
import QuestObjectives from "@/pages/quest-objectives";
import QuestConditions from "@/pages/quest-conditions";
import QuestRewards from "@/pages/quest-rewards";
import QuestDialogues from "@/pages/quest-dialogues";
import QuestBranches from "@/pages/quest-branches";
import QuestVariables from "@/pages/quest-variables";
import QuestFlags from "@/pages/quest-flags";
import QuestStatistics from "@/pages/quest-statistics";
import QuestHistory from "@/pages/quest-history";
import QuestImportExport from "@/pages/quest-import-export";
import QuestValidatorPage from "@/pages/quest-validator-page";
import ItemDashboard from "@/pages/item-dashboard";
import ItemBrowser from "@/pages/item-browser";
import ItemEditorPage from "@/pages/item-editor-page";
import ItemTemplates from "@/pages/item-templates";
import ItemStatsEditor from "@/pages/item-stats-editor";
import ItemEffectsEditor from "@/pages/item-effects-editor";
import ItemCraftingEditor from "@/pages/item-crafting-editor";
import ItemLootEditor from "@/pages/item-loot-editor";
import ItemInventoryEditor from "@/pages/item-inventory-editor";
import ItemPricingEditor from "@/pages/item-pricing-editor";
import ItemRestrictionsEditor from "@/pages/item-restrictions-editor";
import ItemVisualEditor from "@/pages/item-visual-editor";
import ItemHistory from "@/pages/item-history";
import ItemImportExport from "@/pages/item-import-export";
import ItemSimulator from "@/pages/item-simulator";
import SkillDashboard from "@/pages/skill-dashboard";
import SkillBrowser from "@/pages/skill-browser";
import SkillEditorPage from "@/pages/skill-editor-page";
import SkillTemplates from "@/pages/skill-templates";
import SkillEffectsEditor from "@/pages/skill-effects-editor";
import SkillBuffEditor from "@/pages/skill-buff-editor";
import SkillDebuffEditor from "@/pages/skill-debuff-editor";
import SkillProjectileEditor from "@/pages/skill-projectile-editor";
import SkillAnimationEditor from "@/pages/skill-animation-editor";
import SkillCooldownEditor from "@/pages/skill-cooldown-editor";
import SkillCostEditor from "@/pages/skill-cost-editor";
import SkillStatistics from "@/pages/skill-statistics";
import SkillHistory from "@/pages/skill-history";
import SkillImportExport from "@/pages/skill-import-export";
import SkillValidatorPage from "@/pages/skill-validator-page";
import SkillSimulator from "@/pages/skill-simulator";
import CombatDashboard from "@/pages/combat-dashboard";
import CombatBrowser from "@/pages/combat-browser";
import CombatEditorPage from "@/pages/combat-editor-page";
import CombatSimulator from "@/pages/combat-simulator";
import CombatValidatorPage from "@/pages/combat-validator-page";
import CombatImportExport from "@/pages/combat-import-export";
import CombatTemplates from "@/pages/combat-templates";
import CombatHistory from "@/pages/combat-history";
import CombatDamageEditor from "@/pages/combat-damage-editor";
import CombatDefenseEditor from "@/pages/combat-defense-editor";
import CombatResistanceEditor from "@/pages/combat-resistance-editor";
import CombatCriticalEditor from "@/pages/combat-critical-editor";
import CombatComboEditor from "@/pages/combat-combo-editor";
import CombatStatusEditor from "@/pages/combat-status-editor";
import CombatAggroEditor from "@/pages/combat-aggro-editor";
import CombatRespawnEditor from "@/pages/combat-respawn-editor";
import PetDashboard from "@/pages/pet/pet-dashboard";
import PetBrowser from "@/pages/pet/pet-browser";
import PetEditorPage from "@/pages/pet/pet-editor-page";
import PetSpeciesEditor from "@/pages/pet/pet-species-editor";
import PetGrowthEditor from "@/pages/pet/pet-growth-editor";
import PetStatsEditor from "@/pages/pet/pet-stats-editor";
import PetEquipmentEditor from "@/pages/pet/pet-equipment-editor";
import PetSkillEditor from "@/pages/pet/pet-skill-editor";
import PetEvolutionEditor from "@/pages/pet/pet-evolution-editor";
import PetBreedingEditor from "@/pages/pet/pet-breeding-editor";
import PetTemplates from "@/pages/pet/pet-templates";
import PetHistory from "@/pages/pet/pet-history";
import PetStatistics from "@/pages/pet/pet-statistics";
import PetImportExport from "@/pages/pet/pet-import-export";
import PetValidator from "@/pages/pet/pet-validator";
import PetSimulator from "@/pages/pet/pet-simulator";
import BossDashboard from "@/pages/boss/boss-dashboard";
import BossBrowser from "@/pages/boss/boss-browser";
import BossEditorPage from "@/pages/boss/boss-editor-page";
import BossPhaseEditor from "@/pages/boss/boss-phase-editor";
import BossSkillEditor from "@/pages/boss/boss-skill-editor";
import BossPatternEditor from "@/pages/boss/boss-pattern-editor";
import BossArenaEditor from "@/pages/boss/boss-arena-editor";
import BossLootEditor from "@/pages/boss/boss-loot-editor";
import BossRewardEditor from "@/pages/boss/boss-reward-editor";
import BossSimulator from "@/pages/boss/boss-simulator";
import BossTemplates from "@/pages/boss/boss-templates";
import BossHistory from "@/pages/boss/boss-history";
import BossStatistics from "@/pages/boss/boss-statistics";
import BossImportExport from "@/pages/boss/boss-import-export";
import BossValidatorPage from "@/pages/boss/boss-validator";
import BossRuntime from "@/pages/boss/boss-runtime";
import CityDashboard from "@/pages/city/city-dashboard";
import CityBrowser from "@/pages/city/city-browser";
import CityEditorPage from "@/pages/city/city-editor-page";
import CityDistrictEditor from "@/pages/city/city-district-editor";
import CityZoneEditor from "@/pages/city/city-zone-editor";
import CityRoadEditor from "@/pages/city/city-road-editor";
import CityBuildingManager from "@/pages/city/city-building-manager";
import CityUtilityManager from "@/pages/city/city-utility-manager";
import CityTransportManager from "@/pages/city/city-transport-manager";
import CityPopulationManager from "@/pages/city/city-population-manager";
import CityServiceManager from "@/pages/city/city-service-manager";
import CitySpawnManager from "@/pages/city/city-spawn-manager";
import CitySimulator from "@/pages/city/city-simulator";
import CityHistory from "@/pages/city/city-history";
import CityImportExport from "@/pages/city/city-import-export";
import CityValidatorPage from "@/pages/city/city-validator";
import CityTemplates from "@/pages/city/city-templates";
import CityStatistics from "@/pages/city/city-statistics";
import DungeonDashboard from "@/pages/dungeon/dungeon-dashboard";
import DungeonBrowser from "@/pages/dungeon/dungeon-browser";
import DungeonEditorPage from "@/pages/dungeon/dungeon-editor-page";
import DungeonTemplates from "@/pages/dungeon/dungeon-templates";
import DungeonSimulator from "@/pages/dungeon/dungeon-simulator";
import DungeonStatistics from "@/pages/dungeon/dungeon-statistics";
import DungeonHistory from "@/pages/dungeon/dungeon-history";
import DungeonImportExport from "@/pages/dungeon/dungeon-import-export";
import RoomEditor from "@/pages/dungeon/room-editor";
import ConnectionEditor from "@/pages/dungeon/connection-editor";
import SpawnEditor from "@/pages/dungeon/spawn-editor";
import BossEditor from "@/pages/dungeon/boss-editor";
import MonsterEditor from "@/pages/dungeon/monster-editor";
import TrapEditor from "@/pages/dungeon/trap-editor";
import PuzzleEditor from "@/pages/dungeon/puzzle-editor";
import RewardEditor from "@/pages/dungeon/reward-editor";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

setAuthTokenGetter(() => localStorage.getItem("creator_token") ?? "");

function Router() {
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const token = localStorage.getItem("creator_token");
    const isPublic = location === "/login" || location === "/register";

    if (!token && !isPublic) {
      setLocation("/login");
    } else if (token && (isPublic || location === "/")) {
      setLocation("/dashboard");
    }
  }, [location, setLocation, isReady]);

  if (!isReady) return null;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/:rest*">
        <Layout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:id/members" component={ProjectMembers} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/assets" component={Assets} />
            <Route path="/templates" component={Templates} />
            <Route path="/plugins" component={Plugins} />
            <Route path="/packages" component={Packages} />
            <Route path="/settings" component={Settings} />
            <Route path="/profile" component={Profile} />
            <Route path="/organizations" component={Organizations} />
            <Route path="/organizations/:id" component={OrgDetail} />
            <Route path="/invitations" component={Invitations} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/activity" component={ActivityPage} />
            <Route path="/documents" component={Documents} />
            <Route path="/documents/:id/history" component={DocumentHistory} />
            <Route path="/documents/:id" component={DocumentDetail} />
            <Route path="/folders" component={Folders} />
            <Route path="/bookmarks" component={Bookmarks} />
            <Route path="/asset-pipeline" component={AssetDashboard} />
            <Route path="/asset-browser" component={AssetBrowser} />
            <Route path="/asset-detail/:id" component={AssetDetail} />
            <Route path="/asset-collections" component={AssetCollections} />
            <Route path="/asset-folders" component={AssetFolders} />
            <Route path="/upload-center" component={UploadCenter} />
            <Route path="/processing-queue" component={ProcessingQueue} />
            <Route path="/visual-scripting" component={VisualScriptDashboard} />
            <Route path="/graph-editor/:id" component={GraphEditor} />
            <Route path="/graph-browser" component={GraphBrowser} />
            <Route path="/graph-templates" component={GraphTemplates} />
            <Route path="/execution-console" component={ExecutionConsole} />
            <Route path="/macro-library" component={MacroLibrary} />
            <Route path="/compiler-panel" component={CompilerPanel} />
            <Route path="/runtime-monitor" component={RuntimeMonitor} />
            <Route path="/runtime" component={RuntimeDashboard} />
            <Route path="/runtime-play/:id" component={PlayMode} />
            <Route path="/simulation-center" component={SimulationCenter} />
            <Route path="/runtime-profiler/:id" component={RuntimeProfiler} />
            <Route path="/runtime-logs/:id" component={RuntimeLogs} />
            <Route path="/runtime-inspector/:id" component={RuntimeInspector} />
            <Route path="/entity-explorer/:id" component={EntityExplorer} />
            <Route path="/component-explorer/:id" component={ComponentExplorer} />
            <Route path="/system-monitor/:id" component={SystemMonitor} />
            <Route path="/event-monitor/:id" component={EventMonitor} />
            <Route path="/debug-console/:id" component={DebugConsole} />
            <Route path="/runtime-snapshots/:id" component={SnapshotManager} />
            {/* CREATOR-07: World Editor */}
            <Route path="/world-editor-dashboard" component={WorldDashboard} />
            <Route path="/world-browser" component={WorldBrowser} />
            <Route path="/world-editor/:id" component={WorldEditorPage} />
            <Route path="/world-templates" component={WorldTemplates} />
            <Route path="/world-regions/:id" component={WorldRegions} />
            <Route path="/world-layers/:id" component={WorldLayers} />
            <Route path="/world-environment/:id" component={WorldEnvironment} />
            <Route path="/world-weather/:id" component={WorldWeather} />
            <Route path="/world-lighting/:id" component={WorldLighting} />
            <Route path="/world-spawn-manager/:id" component={WorldSpawnManager} />
            <Route path="/world-portal-manager/:id" component={WorldPortalManager} />
            <Route path="/world-navigation/:id" component={WorldNavigation} />
            <Route path="/world-statistics/:id" component={WorldStatistics} />
            <Route path="/world-import-export/:id" component={WorldImportExport} />
            {/* CREATOR-08: NPC Editor */}
            <Route path="/npc-dashboard" component={NpcDashboard} />
            <Route path="/npc-browser" component={NpcBrowser} />
            <Route path="/npc-editor/:id" component={NpcEditorPage} />
            <Route path="/npc-templates" component={NpcTemplates} />
            <Route path="/npc-behavior/:id" component={NpcBehaviorEditor} />
            <Route path="/npc-dialogue/:id" component={NpcDialogueEditor} />
            <Route path="/npc-schedule/:id" component={NpcScheduleEditor} />
            <Route path="/npc-inventory/:id" component={NpcInventoryEditor} />
            <Route path="/npc-equipment/:id" component={NpcEquipmentEditor} />
            <Route path="/npc-skills/:id" component={NpcSkillEditor} />
            <Route path="/npc-spawn/:id" component={NpcSpawnManager} />
            <Route path="/npc-patrol/:id" component={NpcPatrolEditor} />
            <Route path="/npc-relations/:id" component={NpcRelationEditor} />
            <Route path="/npc-faction-manager" component={NpcFactionManager} />
            <Route path="/npc-history/:id" component={NpcHistory} />
            <Route path="/npc-statistics/:id" component={NpcStatistics} />
            <Route path="/npc-import-export" component={NpcImportExport} />
            <Route path="/npc-preview/:id" component={NpcPreview} />
            {/* CREATOR-09: Quest Editor */}
            <Route path="/quest-dashboard" component={QuestDashboard} />
            <Route path="/quest-browser" component={QuestBrowser} />
            <Route path="/quest-editor/:id" component={QuestEditorPage} />
            <Route path="/quest-templates" component={QuestTemplates} />
            <Route path="/quest-objectives/:id" component={QuestObjectives} />
            <Route path="/quest-conditions/:id" component={QuestConditions} />
            <Route path="/quest-rewards/:id" component={QuestRewards} />
            <Route path="/quest-dialogues/:id" component={QuestDialogues} />
            <Route path="/quest-branches/:id" component={QuestBranches} />
            <Route path="/quest-variables/:id" component={QuestVariables} />
            <Route path="/quest-flags/:id" component={QuestFlags} />
            <Route path="/quest-statistics/:id" component={QuestStatistics} />
            <Route path="/quest-history/:id" component={QuestHistory} />
            <Route path="/quest-import-export" component={QuestImportExport} />
            <Route path="/quest-validator" component={QuestValidatorPage} />
            {/* CREATOR-10: Item Editor */}
            <Route path="/item-dashboard" component={ItemDashboard} />
            <Route path="/item-browser" component={ItemBrowser} />
            <Route path="/item-editor/:id" component={ItemEditorPage} />
            <Route path="/item-templates" component={ItemTemplates} />
            <Route path="/item-stats/:id" component={ItemStatsEditor} />
            <Route path="/item-effects/:id" component={ItemEffectsEditor} />
            <Route path="/item-crafting/:id" component={ItemCraftingEditor} />
            <Route path="/item-loot-tables" component={ItemLootEditor} />
            <Route path="/item-inventory" component={ItemInventoryEditor} />
            <Route path="/item-pricing/:id" component={ItemPricingEditor} />
            <Route path="/item-restrictions/:id" component={ItemRestrictionsEditor} />
            <Route path="/item-visuals/:id" component={ItemVisualEditor} />
            <Route path="/item-history/:id" component={ItemHistory} />
            <Route path="/item-import-export" component={ItemImportExport} />
            <Route path="/item-simulator" component={ItemSimulator} />
            {/* CREATOR-11: Skill Editor */}
            <Route path="/skill-dashboard" component={SkillDashboard} />
            <Route path="/skill-browser" component={SkillBrowser} />
            <Route path="/skill-editor/:id" component={SkillEditorPage} />
            <Route path="/skill-templates" component={SkillTemplates} />
            <Route path="/skill-effects/:id" component={SkillEffectsEditor} />
            <Route path="/skill-buffs/:id" component={SkillBuffEditor} />
            <Route path="/skill-debuffs/:id" component={SkillDebuffEditor} />
            <Route path="/skill-projectile/:id" component={SkillProjectileEditor} />
            <Route path="/skill-animation/:id" component={SkillAnimationEditor} />
            <Route path="/skill-cooldown/:id" component={SkillCooldownEditor} />
            <Route path="/skill-cost/:id" component={SkillCostEditor} />
            <Route path="/skill-statistics/:id" component={SkillStatistics} />
            <Route path="/skill-history/:id" component={SkillHistory} />
            <Route path="/skill-import-export" component={SkillImportExport} />
            <Route path="/skill-validator" component={SkillValidatorPage} />
            <Route path="/skill-simulator" component={SkillSimulator} />
            {/* CREATOR-12: Combat Editor */}
            <Route path="/combat-dashboard" component={CombatDashboard} />
            <Route path="/combat-browser" component={CombatBrowser} />
            <Route path="/combat-editor/:id" component={CombatEditorPage} />
            <Route path="/combat-simulator" component={CombatSimulator} />
            <Route path="/combat-validator" component={CombatValidatorPage} />
            <Route path="/combat-import-export" component={CombatImportExport} />
            <Route path="/combat-templates" component={CombatTemplates} />
            <Route path="/combat-history" component={CombatHistory} />
            <Route path="/combat-damage/:id" component={CombatDamageEditor} />
            <Route path="/combat-defense/:id" component={CombatDefenseEditor} />
            <Route path="/combat-resistance/:id" component={CombatResistanceEditor} />
            <Route path="/combat-critical/:id" component={CombatCriticalEditor} />
            <Route path="/combat-combo/:id" component={CombatComboEditor} />
            <Route path="/combat-status/:id" component={CombatStatusEditor} />
            <Route path="/combat-aggro/:id" component={CombatAggroEditor} />
            <Route path="/combat-respawn/:id" component={CombatRespawnEditor} />
            {/* CREATOR-13: Dungeon Editor */}
            {/* CREATOR-14: Pet Editor */}
            <Route path="/pet-dashboard" component={PetDashboard} />
            <Route path="/pet-browser" component={PetBrowser} />
            <Route path="/pet-editor/:id" component={PetEditorPage} />
            <Route path="/pet-species-editor" component={PetSpeciesEditor} />
            <Route path="/pet-growth-editor/:id" component={PetGrowthEditor} />
            <Route path="/pet-stats-editor/:id" component={PetStatsEditor} />
            <Route path="/pet-equipment-editor/:id" component={PetEquipmentEditor} />
            <Route path="/pet-skill-editor/:id" component={PetSkillEditor} />
            <Route path="/pet-evolution-editor/:id" component={PetEvolutionEditor} />
            <Route path="/pet-breeding-editor/:id" component={PetBreedingEditor} />
            <Route path="/pet-templates" component={PetTemplates} />
            <Route path="/pet-history/:id" component={PetHistory} />
            <Route path="/pet-statistics/:id" component={PetStatistics} />
            <Route path="/pet-import-export" component={PetImportExport} />
            <Route path="/pet-validator" component={PetValidator} />
            <Route path="/pet-simulator" component={PetSimulator} />
            <Route path="/dungeon-dashboard" component={DungeonDashboard} />
            <Route path="/dungeon-browser" component={DungeonBrowser} />
            <Route path="/dungeon-editor/:id" component={DungeonEditorPage} />
            <Route path="/dungeon-templates" component={DungeonTemplates} />
            <Route path="/dungeon-simulator" component={DungeonSimulator} />
            <Route path="/dungeon-statistics/:id" component={DungeonStatistics} />
            <Route path="/dungeon-history/:id" component={DungeonHistory} />
            <Route path="/dungeon-import-export" component={DungeonImportExport} />
            <Route path="/dungeon-room-editor/:id" component={RoomEditor} />
            <Route path="/dungeon-connection-editor/:id" component={ConnectionEditor} />
            <Route path="/dungeon-spawn-editor/:id" component={SpawnEditor} />
            <Route path="/dungeon-boss-editor/:id" component={BossEditor} />
            <Route path="/dungeon-monster-editor/:id" component={MonsterEditor} />
            <Route path="/dungeon-trap-editor/:id" component={TrapEditor} />
            <Route path="/dungeon-puzzle-editor/:id" component={PuzzleEditor} />
            <Route path="/dungeon-reward-editor/:id" component={RewardEditor} />
            {/* CREATOR-15: Boss Editor */}
            <Route path="/boss-dashboard" component={BossDashboard} />
            <Route path="/boss-browser" component={BossBrowser} />
            <Route path="/boss-editor/:id" component={BossEditorPage} />
            <Route path="/boss-phase-editor/:id" component={BossPhaseEditor} />
            <Route path="/boss-skill-editor/:id" component={BossSkillEditor} />
            <Route path="/boss-pattern-editor/:id" component={BossPatternEditor} />
            <Route path="/boss-arena-editor/:id" component={BossArenaEditor} />
            <Route path="/boss-loot-editor/:id" component={BossLootEditor} />
            <Route path="/boss-reward-editor/:id" component={BossRewardEditor} />
            <Route path="/boss-simulator" component={BossSimulator} />
            <Route path="/boss-templates" component={BossTemplates} />
            <Route path="/boss-history/:id" component={BossHistory} />
            <Route path="/boss-statistics" component={BossStatistics} />
            <Route path="/boss-import-export" component={BossImportExport} />
            <Route path="/boss-validator" component={BossValidatorPage} />
            <Route path="/boss-runtime/:id" component={BossRuntime} />
            {/* CREATOR-16: City Editor */}
            <Route path="/city-dashboard" component={CityDashboard} />
            <Route path="/city-browser" component={CityBrowser} />
            <Route path="/city-editor/:id" component={CityEditorPage} />
            <Route path="/city-district-editor/:id" component={CityDistrictEditor} />
            <Route path="/city-zone-editor/:id" component={CityZoneEditor} />
            <Route path="/city-road-editor/:id" component={CityRoadEditor} />
            <Route path="/city-building-manager/:id" component={CityBuildingManager} />
            <Route path="/city-utility-manager/:id" component={CityUtilityManager} />
            <Route path="/city-transport-manager/:id" component={CityTransportManager} />
            <Route path="/city-population-manager/:id" component={CityPopulationManager} />
            <Route path="/city-service-manager/:id" component={CityServiceManager} />
            <Route path="/city-spawn-manager/:id" component={CitySpawnManager} />
            <Route path="/city-simulator" component={CitySimulator} />
            <Route path="/city-history/:id" component={CityHistory} />
            <Route path="/city-import-export" component={CityImportExport} />
            <Route path="/city-validator" component={CityValidatorPage} />
            <Route path="/city-templates" component={CityTemplates} />
            <Route path="/city-statistics" component={CityStatistics} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
