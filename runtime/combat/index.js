// runtime/combat/index.js
// Sprint 1 — Deterministic Turn-Based Combat Engine
// All state changes through Kernel API. Replay-compatible.

import { WorldRandom } from "../random/index.js";

// Damage formula: base = realm * 8, modified by realm_diff, critical, defense
function calcDamage(attacker, defender, action, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  const realmDiff = aRealm - dRealm;
  const base = aRealm * 8 + realmDiff * 5;
  let damage = Math.max(1, base * (1 + realmDiff * 0.15));

  // Critical (15% base chance, +2% per realm advantage)
  const critChance = 0.15 + Math.max(0, realmDiff) * 0.02;
  let critical = false;
  if (random.chance(critChance)) {
    damage = Math.floor(damage * 1.8);
    critical = true;
  }

  // Defense reduces damage by 40%
  if (action === "defend") {
    damage = Math.floor(damage * 0.6);
  }

  return { damage: Math.max(1, Math.floor(damage)), critical };
}

// Dodge check
function checkDodge(attacker, defender, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  const dodgeChance = 0.08 + Math.max(0, dRealm - aRealm) * 0.03;
  return random.chance(dodgeChance);
}

// Flee check
function checkFlee(attacker, defender, random) {
  const aRealm = attacker.getComponent("Realm")?.realm_id || 1;
  const dRealm = defender.getComponent("Realm")?.realm_id || 1;
  const fleeChance = 0.4 + Math.max(0, aRealm - dRealm) * 0.1;
  return random.chance(fleeChance);
}

export class CombatEngine {
  constructor(seed) {
    this.random = new WorldRandom(seed);
    this.activeBattles = new Map(); // battleId → battle state
  }

  // Start a battle between two entities
  startBattle(entity1, entity2, kernel) {
    const battleId = `battle_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const r1 = entity1.getComponent("Realm")?.realm_id || 1;
    const r2 = entity2.getComponent("Realm")?.realm_id || 1;

    // Higher realm goes first
    const order = r1 >= r2 ? [entity1.id, entity2.id] : [entity2.id, entity1.id];

    const battle = {
      battleId,
      participants: [entity1.id, entity2.id],
      order,
      currentTurn: 0,
      round: 1,
      defender: order[1],    // ID of entity defending this round
      attacker: order[0],    // ID of entity attacking this round
      log: [],
      status: "active",
      startedAt: Date.now(),
    };

    this.activeBattles.set(battleId, battle);
    return battle;
  }

  // Process a combat action
  processAction(battleId, action, kernel) {
    const battle = this.activeBattles.get(battleId);
    if (!battle || battle.status !== "active") return null;

    const attEntity = kernel.getEntity(battle.attacker);
    const defEntity = kernel.getEntity(battle.defender);
    if (!attEntity || !defEntity) {
      battle.status = "ended";
      return { ...battle, result: "entity_gone" };
    }

    const attName = (attEntity.getComponent("Identity") || {}).name || battle.attacker;
    const defName = (defEntity.getComponent("Identity") || {}).name || battle.defender;

    let entry = { round: battle.round, attacker: attName, defender: defName, action };

    switch (action) {
      case "attack": {
        // Check dodge
        if (checkDodge(attEntity, defEntity, this.random)) {
          entry.result = "dodged";
          entry.message = `${defName} 闪避了攻击！`;
          battle.log.push(entry);
          break;
        }

        const { damage, critical } = calcDamage(attEntity, defEntity, "attack", this.random);
        const hp = defEntity.getComponent("HP") || { current: 100, max: 100 };
        const newHP = Math.max(0, hp.current - damage);

        kernel.updateComponent(defEntity.id, "HP", { ...hp, current: newHP }, defEntity.version);

        entry.damage = damage;
        entry.critical = critical;
        entry.remainingHP = newHP;
        entry.message = `${attName} ${critical ? "暴击！" : ""}造成 ${damage} 点伤害 (${defName} 剩余 ${newHP}/${hp.max})`;

        if (newHP <= 0) {
          battle.status = "ended";
          battle.victor = attEntity.id;
          entry.result = "kill";
          entry.message += " — 击杀！";
        }
        battle.log.push(entry);
        break;
      }

      case "defend": {
        entry.result = "defended";
        entry.message = `${attName} 转为防御姿态`;
        battle.log.push(entry);
        break;
      }

      case "flee": {
        if (checkFlee(attEntity, defEntity, this.random)) {
          battle.status = "ended";
          battle.result = "fled";
          entry.result = "fled";
          entry.message = `${attName} 成功逃脱！`;
        } else {
          entry.result = "flee_failed";
          entry.message = `${attName} 逃脱失败！`;
        }
        battle.log.push(entry);
        break;
      }

      default:
        entry.message = "无效操作";
        battle.log.push(entry);
    }

    // Swap attacker/defender for next round
    if (battle.status === "active") {
      const tmp = battle.attacker;
      battle.attacker = battle.defender;
      battle.defender = tmp;
      battle.round++;
    }

    return battle;
  }

  // Get battle state
  getBattle(battleId) {
    return this.activeBattles.get(battleId) || null;
  }

  // Clean up finished battles
  cleanup(battleId) {
    this.activeBattles.delete(battleId);
  }
}
