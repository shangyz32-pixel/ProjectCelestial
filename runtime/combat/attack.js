// runtime/combat/attack.js
// v2.2 Sprint 4 M5 — Basic Attack Pipeline
// Never calculates damage. Delegates to Combat Resolution.
// Deterministic. Replay-compatible.

import { calcDamage } from "./index.js";
import { ActionRegistry } from "./actions.js";
import { CombatEvents } from "./index.js";

// ══════════════════════════════════════
// Attack Context — read-only combat environment
// ══════════════════════════════════════
export function createAttackContext(attacker, target, session, worldTick = 0) {
  return {
    attacker,
    target,
    session,
    tick: worldTick,
    attackerRealm: attacker.getRealm().id,
    targetRealm: target.getRealm().id,
    attackerHP: attacker.getHP(),
    targetHP: target.getHP(),
    weapon: attacker.getEquipment().slots?.weapon || null,
    isRanged: false, // future: weapon type check
  };
}

// ══════════════════════════════════════
// Target Validation
// ══════════════════════════════════════
export function validateTarget(ctx) {
  if (!ctx.target) return { valid: false, error: "NO_TARGET" };
  if (!ctx.target.isAlive()) return { valid: false, error: "TARGET_DEAD" };
  if (ctx.attacker.getFaction() === ctx.target.getFaction()) return { valid: false, error: "TARGET_FRIENDLY" };
  return { valid: true };
}

// ══════════════════════════════════════
// Hit Check — accuracy vs dodge
// ══════════════════════════════════════
export function performHitCheck(ctx, random) {
  const aAttrs = ctx.attacker.getAttributes();
  const tAttrs = ctx.target.getAttributes();
  const hitChance = Math.min(0.95, Math.max(0.05, aAttrs.accuracy * (1 - tAttrs.dodge)));
  const roll = random ? random.nextFloat(0, 1) : Math.random();
  const hit = roll <= hitChance;
  return { hit, hitChance, roll };
}

// ══════════════════════════════════════
// Generate Combat Intent — forward to Resolution
// ══════════════════════════════════════
export function createAttackIntent(ctx, hitResult) {
  return {
    type: "attack",
    attacker: ctx.attacker.serialize(),
    target: ctx.target.serialize(),
    weapon: ctx.weapon,
    hitChance: hitResult.hitChance,
    hit: hitResult.hit,
    tick: ctx.tick,
  };
}

// ══════════════════════════════════════
// Full Attack Pipeline
// ══════════════════════════════════════
export function executeAttack(attacker, target, session, kernel, random) {
  const tick = kernel?.world?.tickCount || 0;

  // 1. Validate
  const ctx = createAttackContext(attacker, target, session, tick);
  const validation = validateTarget(ctx);
  if (!validation.valid) {
    return { result: "invalid", error: validation.error };
  }

  // 2. Hit check
  const hitResult = performHitCheck(ctx, random);
  if (!hitResult.hit) {
    CombatEvents.emit("AttackMissed", { attacker:attacker.name, target:target.name, tick });
    return { result: "missed", hitChance: hitResult.hitChance };
  }

  // 3. Create intent → delegate to Combat Resolution
  const intent = createAttackIntent(ctx, hitResult);

  // 4. Combat Resolution — calcDamage() is the single source of truth
  const { damage, critical, elementMultiplier } = calcDamage(attacker.entity, target.entity, "attack", random);

  // 5. Apply damage via kernel
  if (kernel) {
    const t = kernel.getEntity(target.id);
    if (t) {
      const tHp = t.getComponent("HP") || { current: 100, max: 100 };
      const newHP = Math.max(0, tHp.current - damage);
      kernel.updateComponent(t.id, "HP", { ...tHp, current: newHP }, t.version);
      CombatEvents.emit("DamageApplied", { attacker:attacker.name, target:target.name, damage, critical, elementMultiplier, newHP, tick });

      // 6. Death check
      if (newHP <= 0) {
        CombatEvents.emit("EntityDied", { killer:attacker.name, victim:target.name, tick });
        return {
          result: "killed",
          damage, critical, elementMultiplier,
          intent,
          killed: true,
        };
      }
    }
  }

  return {
    result: "hit",
    damage, critical, elementMultiplier,
    intent,
    killed: false,
  };
}
