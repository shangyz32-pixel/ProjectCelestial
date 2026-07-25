// runtime/dungeon/index.js
// v2.1 Sprint 9 — Procedural Dungeon Framework
// World-driven, seed-based generation. Deterministic. Replay-compatible.

import { WorldRandom } from "../random/index.js";
import { createEquipment } from "../equipment/index.js";

// ══════════════════════════════════════
// Dungeon Templates
// ══════════════════════════════════════
export const DUNGEON_TYPES = {
  mystic_realm:  { name:"秘境",     rooms:{min:4,max:8},  difficulty:3, env:"forest",      treasure:"equipment",  bossChance:0.3, collapseChance:0.1 },
  cave_dwelling: { name:"洞府",     rooms:{min:3,max:6},  difficulty:2, env:"mountain",    treasure:"herbs",      bossChance:0.2, collapseChance:0.05 },
  ancient_ruins: { name:"远古遗迹", rooms:{min:5,max:10}, difficulty:5, env:"desert",      treasure:"artifact",   bossChance:0.5, collapseChance:0.15 },
  inheritance:   { name:"传承之地", rooms:{min:3,max:5},  difficulty:4, env:"palace",      treasure:"inheritance",bossChance:0.4, collapseChance:0.0 },
  immortal_tomb: { name:"仙墓",     rooms:{min:6,max:12}, difficulty:8, env:"underground", treasure:"legendary",  bossChance:0.7, collapseChance:0.2 },
  demon_realm:   { name:"魔域",     rooms:{min:4,max:9},  difficulty:6, env:"void",        treasure:"rare_mats",  bossChance:0.6, collapseChance:0.1 },
};

// ══════════════════════════════════════
// Room Types
// ══════════════════════════════════════
const ROOM_TYPES = ["entrance","combat","treasure","rest","puzzle","boss","hidden","empty"];

// ══════════════════════════════════════
// Environment Modifiers
// ══════════════════════════════════════
const ENVIRONMENTS = {
  forest:      { name:"密林",   monsterTypes:["beast","poison"], resourceBonus:0.2 },
  mountain:    { name:"山岳",   monsterTypes:["golem","bird"],   resourceBonus:0.3 },
  ice:         { name:"冰窟",   monsterTypes:["ice","ancient"],  resourceBonus:0.15 },
  volcano:     { name:"火山",   monsterTypes:["fire","demon"],   resourceBonus:0.25 },
  desert:      { name:"沙漠",   monsterTypes:["golem","ancient"],resourceBonus:0.1 },
  underground: { name:"地底",   monsterTypes:["demon","golem"],  resourceBonus:0.35 },
  void:        { name:"虚空",   monsterTypes:["void","ancient"], resourceBonus:0.4 },
  palace:      { name:"仙宫",   monsterTypes:["spirit","ancient"],resourceBonus:0.5 },
};

// ══════════════════════════════════════
// Generate Dungeon
// ══════════════════════════════════════
export function generateDungeon(typeId, seed, depth) {
  const template = DUNGEON_TYPES[typeId];
  if (!template) return null;
  const random = new WorldRandom(seed + depth);
  const env = ENVIRONMENTS[template.env] || ENVIRONMENTS.forest;
  const roomCount = random.nextInt(template.rooms.min, template.rooms.max);

  // Generate rooms
  const rooms = [];
  const usedPositions = new Set();
  for (let i = 0; i < roomCount; i++) {
    let roomType;
    if (i === 0) roomType = "entrance";
    else if (i === roomCount - 1 && random.chance(template.bossChance)) roomType = "boss";
    else if (random.chance(0.15)) roomType = "treasure";
    else if (random.chance(0.1)) roomType = "puzzle";
    else if (random.chance(0.08)) roomType = "hidden";
    else if (random.chance(0.1)) roomType = "rest";
    else roomType = "combat";

    // Position — avoid overlap
    let x, y;
    do {
      x = random.nextInt(0, 4 + roomCount);
      y = random.nextInt(-roomCount/2, roomCount/2);
    } while (usedPositions.has(`${x},${y}`));
    usedPositions.add(`${x},${y}`);

    const room = {
      id: `room_${i}`, index:i, type:roomType,
      position:[x,y],
      connections:[],
      explored:false, cleared:false,
      description: generateRoomDesc(roomType, env),
      monsterCount: roomType === "combat" ? random.nextInt(1,3) : (roomType === "boss" ? 1 : 0),
      treasure: roomType === "treasure" || roomType === "boss" ? generateTreasure(typeId, random) : null,
    };
    rooms.push(room);
  }

  // Connect rooms (nearest neighbor)
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i-1];
    rooms[i].connections.push(prev.id);
    prev.connections.push(rooms[i].id);
  }

  // Branch connections (10% extra)
  for (let i = 2; i < rooms.length; i++) {
    if (random.chance(0.1) && i > 0) {
      const branchIdx = random.nextInt(0, i - 2);
      if (!rooms[i].connections.includes(rooms[branchIdx].id)) {
        rooms[i].connections.push(rooms[branchIdx].id);
        rooms[branchIdx].connections.push(rooms[i].id);
      }
    }
  }

  const dungeon = {
    id: `dungeon_${seed}_${depth}`,
    type: typeId,
    name: `${env.name}${template.name}`,
    difficulty: template.difficulty + Math.floor(depth/3),
    environment: template.env,
    environmentName: env.name,
    rooms,
    roomCount,
    bossDefeated: false,
    treasureCollected: 0,
    exploredRooms: 0,
    collapseChance: template.collapseChance,
    collapsed: false,
    createdAt: Date.now(),
    seed,
  };

  return dungeon;
}

function generateRoomDesc(type, env) {
  const descs = {
    entrance:  [`踏入${env.name}，前方幽暗深邃。`,`你发现了一个${env.name}中的入口。`],
    combat:    [`空气中弥漫着危险的气息。`,`前方传来怪物的低吼声。`],
    treasure:  [`墙角闪烁着微弱的宝光。`,`这里似乎藏着什么珍贵之物。`],
    rest:      [`此处灵气充沛，适合休整。`,`一片相对安全的区域。`],
    puzzle:    [`古老的机关挡住了去路。`,`石壁上刻着谜题般的符文。`],
    boss:      [`一股强大的气息扑面而来。`,`前方是这处秘境的守护者。`],
    hidden:    [`墙壁上有一道暗门。`,`你发现了别人未曾注意的通道。`],
    empty:     [`这个房间空空如也。`,`看来已经有人来过了。`],
  };
  const pool = descs[type] || descs.empty;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateTreasure(typeId, random) {
  const type = DUNGEON_TYPES[typeId];
  if (random.chance(0.7)) {
    const catalog = ["spirit_sword","flying_sword","spirit_vest","jade_ring","spirit_amulet","spirit_bell"];
    const id = catalog[random.nextInt(0, catalog.length - 1)];
    return { type:"equipment", item:createEquipment(null, id, random) };
  }
  const treasures = [
    { type:"stones", item:"spirit_stone", qty:random.nextInt(10,50)*type.difficulty },
    { type:"herb", item:"spirit_grass", qty:random.nextInt(3,10) },
    { type:"herb", item:"golden_ginseng", qty:1 },
    { type:"material", item:"jade_essence", qty:1 },
    { type:"pill", item:"pill_foundation_pill", qty:1 },
  ];
  return treasures[random.nextInt(0, treasures.length - 1)];
}

// ══════════════════════════════════════
// Explore room
// ══════════════════════════════════════
export function exploreRoom(dungeon, roomId, entity, kernel, random) {
  const room = dungeon.rooms.find(r => r.id === roomId);
  if (!room) return { error:"房间不存在" };
  if (room.explored) return { error:"已探索" };

  room.explored = true;
  dungeon.exploredRooms++;

  const result = { room, combat:null, treasure:null, event:null };

  // Combat encounter
  if (room.monsterCount > 0) {
    const hp = entity.getComponent("HP") || { current:100, max:100 };
    const difficulty = dungeon.difficulty;
    const damage = Math.max(1, random.nextInt(difficulty*2, difficulty*5));
    const newHP = Math.max(1, hp.current - damage);
    kernel.updateComponent(entity.id, "HP", { ...hp, current:newHP }, entity.version);
    result.combat = { enemies:room.monsterCount, damage, hpRemaining:newHP, cleared:newHP > 0 };
    if (newHP > 0) room.cleared = true;
  }

  // Treasure
  if (room.treasure) {
    result.treasure = room.treasure;
    dungeon.treasureCollected++;
    const inv = entity.getComponent("Inventory") || { items:{} };
    if (room.treasure.type === "stones") {
      kernel.updateComponent(entity.id, "Inventory", { items:{ ...inv.items, spirit_stone:(inv.items.spirit_stone||0)+room.treasure.qty } }, entity.version+1);
    } else if (room.treasure.type === "herb" || room.treasure.type === "material" || room.treasure.type === "pill") {
      kernel.updateComponent(entity.id, "Inventory", { items:{ ...inv.items, [room.treasure.item]:(inv.items[room.treasure.item]||0)+room.treasure.qty } }, entity.version+1);
    }
    room.treasure = null;
  }

  // Boss room clears dungeon
  if (room.type === "boss" && room.cleared) {
    dungeon.bossDefeated = true;
    result.event = "boss_defeated";
    // Boss drop
    if (random.chance(0.5)) {
      result.bossLoot = generateTreasure(dungeon.type, random);
    }
  }

  // Collapse check
  if (random.chance(dungeon.collapseChance)) {
    dungeon.collapsed = true;
    result.event = "collapse";
  }

  return { ok:true, ...result };
}

// ══════════════════════════════════════
// Dungeon System — discover in simulation
// ══════════════════════════════════════
export const DungeonSystem = {
  tick(kernel, time, random) {
    kernel.world.globalState.dungeons = kernel.world.globalState.dungeons || [];
    const dungeons = kernel.world.globalState.dungeons;

    // Discover new dungeon
    if (dungeons.length < 5 && random.chance(0.05)) {
      const types = Object.keys(DUNGEON_TYPES);
      const typeId = types[random.nextInt(0, types.length - 1)];
      const dungeon = generateDungeon(typeId, kernel.world.tickCount, dungeons.length);
      if (dungeon) dungeons.push(dungeon);
    }
  },
};
