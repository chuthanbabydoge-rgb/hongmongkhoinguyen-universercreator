import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

interface SprintInfo {
  id: string;
  name: string;
  schemaFile: string;
  routeFile: string;
  tables: number;
  enums: number;
  endpoints: number;
  pages: number;
  description: string;
}

const SPRINT_CONFIG: Record<string, SprintInfo> = {
  'CREATOR-07': {
    id: 'CREATOR-07',
    name: 'World Editor',
    schemaFile: 'world-editor.ts',
    routeFile: 'world-editor.ts',
    tables: 20,
    enums: 7,
    endpoints: 55,
    pages: 16,
    description: 'Trình chỉnh sửa World để tạo toàn bộ thế giới game, bao gồm terrain, biome, chunk, region, spawn points, teleport, và world settings.'
  },
  'CREATOR-08': {
    id: 'CREATOR-08',
    name: 'NPC Editor',
    schemaFile: 'npc-editor.ts',
    routeFile: 'npc-editor.ts',
    tables: 20,
    enums: 7,
    endpoints: 50,
    pages: 16,
    description: 'Trình chỉnh sửa NPC chuyên nghiệp để tạo nhân vật NPC với profile, stats, skills, inventory, equipment, behavior tree, dialogue, patrol routes, và relationships.'
  },
  'CREATOR-09': {
    id: 'CREATOR-09',
    name: 'Quest Editor',
    schemaFile: 'quest-editor.ts',
    routeFile: 'quest-editor.ts',
    tables: 20,
    enums: 5,
    endpoints: 50,
    pages: 16,
    description: 'Trình chỉnh sửa Quest để tạo toàn bộ nhiệm vụ game với objectives, rewards, conditions, prerequisites, và quest chains.'
  },
  'CREATOR-10': {
    id: 'CREATOR-10',
    name: 'Item Editor',
    schemaFile: 'item-editor.ts',
    routeFile: 'item-editor.ts',
    tables: 20,
    enums: 6,
    endpoints: 50,
    pages: 16,
    description: 'Trình chỉnh sửa Item để tạo weapons, armor, consumables, materials, currency, quest items, và crafting items với stats, effects, attributes, crafting recipes, loot tables.'
  },
  'CREATOR-11': {
    id: 'CREATOR-11',
    name: 'Skill Editor',
    schemaFile: 'skills.ts',
    routeFile: 'skills.ts',
    tables: 20,
    enums: 7,
    endpoints: 55,
    pages: 16,
    description: 'Trình chỉnh sửa Skill để tạo active/passive skills với levels, costs, cooldowns, effects, buffs, debuffs, projectiles, animations, và visual FX.'
  },
  'CREATOR-12': {
    id: 'CREATOR-12',
    name: 'Combat Editor',
    schemaFile: 'combat.ts',
    routeFile: 'combat.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Combat để tạo combat systems với modes, states, targets, triggers, effects, damage formulas, status effects, và combat logs.'
  },
  'CREATOR-13': {
    id: 'CREATOR-13',
    name: 'Dungeon Editor',
    schemaFile: 'dungeons.ts',
    routeFile: 'dungeons.ts',
    tables: 20,
    enums: 6,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Dungeon để tạo dungeons với rooms, corridors, traps, puzzles, bosses, monsters, rewards, và difficulty scaling.'
  },
  'CREATOR-14': {
    id: 'CREATOR-14',
    name: 'Pet Editor',
    schemaFile: 'pets.ts',
    routeFile: 'pets.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Pet để tạo pets, mounts, companions với species, stats, growth, evolution, skills, equipment, training, food, breeding, và affection.'
  },
  'CREATOR-15_BOSS': {
    id: 'CREATOR-15',
    name: 'Boss Editor',
    schemaFile: 'bosses.ts',
    routeFile: 'bosses.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Boss để tạo boss encounters với phases, mechanics, enrage timers, loot tables, spawn conditions, và boss AI.'
  },
  'CREATOR-15_CITY': {
    id: 'CREATOR-15',
    name: 'City Editor',
    schemaFile: 'cities.ts',
    routeFile: 'cities.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa City để tạo thành phố với districts, zones, roads, buildings, utilities, population, economy, transportation, spawn points, và services.'
  },
  'CREATOR-16': {
    id: 'CREATOR-16',
    name: 'World System',
    schemaFile: 'world-system.ts',
    routeFile: 'world-system.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Runtime system quản lý world loading, region streaming, chunk loading, scene management, day/night cycle, weather, world events, teleport, spawn, save state, và multi-world support.'
  },
  'CREATOR-17': {
    id: 'CREATOR-17',
    name: 'Building Editor',
    schemaFile: 'buildings.ts',
    routeFile: 'buildings.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Building để tạo buildings với types, floors, rooms, furniture, utilities, occupants, economy, và building AI.'
  },
  'CREATOR-18': {
    id: 'CREATOR-18',
    name: 'Land Editor',
    schemaFile: 'land-editor.ts',
    routeFile: 'lands.ts',
    tables: 20,
    enums: 7,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Land để quản lý đất đai với parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings, bookmarks, permissions, và marketplace.'
  },
  'CREATOR-19': {
    id: 'CREATOR-19',
    name: 'Transportation Editor',
    schemaFile: 'transportation.ts',
    routeFile: 'transportation.ts',
    tables: 20,
    enums: 8,
    endpoints: 60,
    pages: 16,
    description: 'Trình chỉnh sửa Transportation để quản lý hệ thống giao thông với roads, highways, railways, metro, airports, seaports, bus routes, taxi, parking, vehicles, traffic signals, logistics, teleports, và navigation network.'
  }
};

function generateSprintMarkdown(sprint: SprintInfo): string {
  const emoji = getEmojiForSprint(sprint.id);
  return `

### ${emoji} ${sprint.id} — ${sprint.name}

> **${sprint.tables} bảng cơ sở dữ liệu · ${sprint.enums} enum** trong \`lib/db/src/schema/${sprint.schemaFile}\`

**📝 Mô tả:**
${sprint.description}

**⚙️ Backend:**
- Drizzle${sprint.name.replace(' Editor', '').replace(' System', '')}Repository
- ${sprint.name.replace(' Editor', '').replace(' System', '')}EditorService, ${sprint.name.replace(' Editor', '').replace(' System', '')}Validator
- ${sprint.name.replace(' Editor', '').replace(' System', '')}Exporter, ${sprint.name.replace(' Editor', '').replace(' System', '')}Importer, ${sprint.name.replace(' Editor', '').replace(' System', '')}RuntimeBridge

**📡 ~${sprint.endpoints} REST endpoints** dưới \`/api/${sprint.routeFile.replace('.ts', '')}\`

**🖥️ ${sprint.pages} trang Frontend:**
${generateFrontendPages(sprint)}

---

`;
}

function getEmojiForSprint(sprintId: string): string {
  const emojis: Record<string, string> = {
    'CREATOR-07': '🌍',
    'CREATOR-08': '👤',
    'CREATOR-09': '📜',
    'CREATOR-10': '🗡️',
    'CREATOR-11': '⚔️',
    'CREATOR-12': '🥊',
    'CREATOR-13': '🏰',
    'CREATOR-14': '🐾',
    'CREATOR-15_BOSS': '👹',
    'CREATOR-15_CITY': '🏙️',
    'CREATOR-16': '🌐',
    'CREATOR-17': '🏢',
    'CREATOR-18': '🗺️',
    'CREATOR-19': '🚗'
  };
  return emojis[sprintId] || '📦';
}

function generateFrontendPages(sprint: SprintInfo): string {
  const baseName = sprint.name.replace(' Editor', '').replace(' System', '');
  const pages = [
    `${baseName}Dashboard`,
    `${baseName}Browser`,
    `${baseName}Editor`,
    'Templates',
    'History',
    'ImportExport',
    'Validator',
    'Simulator'
  ];
  return pages.join(', ');
}

function checkSprintExists(sprint: SprintInfo): boolean {
  const schemaPath = path.join(rootDir, 'lib/db/src/schema', sprint.schemaFile);
  const routePath = path.join(rootDir, 'artifacts/api-server/src/routes', sprint.routeFile);
  
  return fs.existsSync(schemaPath) && fs.existsSync(routePath);
}

function updateReadme() {
  const readmePath = path.join(rootDir, 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf-8');

  // Find the latest sprint in the README
  const sprintSectionRegex = /### (🌍|👤|📜|🗡️|⚔️|🥊|🏰|🐾|👹|🏙️|🌐|🏢|🗺️|🚗) CREATOR-\d+ —/;
  const existingSprints = readmeContent.match(sprintSectionRegex) || [];
  
  // Get existing sprint IDs
  const existingSprintIds = new Set<string>();
  const sprintIdRegex = /CREATOR-(\d+)/g;
  let sprintMatch;
  while ((sprintMatch = sprintIdRegex.exec(readmeContent)) !== null) {
    existingSprintIds.add(`CREATOR-${sprintMatch[1]}`);
  }

  // Check which sprints need to be added
  const sprintsToAdd: SprintInfo[] = [];
  for (const [key, sprint] of Object.entries(SPRINT_CONFIG)) {
    const sprintId = sprint.id;
    if (!existingSprintIds.has(sprintId) && checkSprintExists(sprint)) {
      sprintsToAdd.push(sprint);
    }
  }

  if (sprintsToAdd.length === 0) {
    console.log('✅ No new sprints to add to README.md');
    return;
  }

  console.log(`📝 Adding ${sprintsToAdd.length} new sprint(s) to README.md:`);
  sprintsToAdd.forEach(s => console.log(`   - ${s.id}: ${s.name}`));

  // Find the insertion point (after CREATOR-06 section)
  const creator06EndRegex = /(### ⚡ CREATOR-06 — Runtime Engine[\s\S]*?Snapshot Manager[\s\S]*?)---\n/;
  const creator06Match = readmeContent.match(creator06EndRegex);
  
  if (!creator06Match) {
    console.error('❌ Could not find CREATOR-06 section in README.md');
    return;
  }

  // Generate markdown for new sprints
  const newSprintsMarkdown = sprintsToAdd
    .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))
    .map(generateSprintMarkdown)
    .join('\n');

  // Insert new sprints after CREATOR-06
  readmeContent = readmeContent.replace(
    creator06EndRegex,
    `$1---\n${newSprintsMarkdown}`
  );

  // Update badges at the bottom
  const latestSprint = sprintsToAdd[sprintsToAdd.length - 1];
  const totalTables = 40 + (sprintsToAdd.length * 20);
  const totalPages = 50 + (sprintsToAdd.length * 16);
  const totalEndpoints = 60 + (sprintsToAdd.reduce((sum, s) => sum + s.endpoints, 0));

  readmeContent = readmeContent.replace(
    /!\[Sprint\].*?CREATOR--\d+/,
    `![Sprint](https://img.shields.io/badge/Sprint-${latestSprint.id.replace('-', '--')}-6366f1?style=flat-square)`
  );
  readmeContent = readmeContent.replace(
    /!\[Tables\].*?\d+\+/, 
    `![Tables](https://img.shields.io/badge/DB_Tables-${totalTables}+-4169E1?style=flat-square&logo=postgresql&logoColor=white)`
  );
  readmeContent = readmeContent.replace(
    /!\[Pages\].*?\d+\+/,
    `![Pages](https://img.shields.io/badge/Trang-${totalPages}+-61DAFB?style=flat-square&logo=react&logoColor=black)`
  );
  readmeContent = readmeContent.replace(
    /!\[API\].*?\d+\+/,
    `![API](https://img.shields.io/badge/API_Endpoints-${totalEndpoints}+-339933?style=flat-square&logo=express&logoColor=white)`
  );

  // Write updated README
  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log('✅ README.md updated successfully!');
}

updateReadme();
