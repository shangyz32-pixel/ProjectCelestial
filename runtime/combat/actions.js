// runtime/combat/actions.js
// v2.2 Sprint 4 M3 — Combat Action Framework
// Action Registry, Request, Validation, Execution, Result.
// Combat Engine coordinates. Actions describe intent. Resolution determines outcome.

// ══════════════════════════════════════
// Action Result Types
// ══════════════════════════════════════
export const ACTION_RESULT = {
  SUCCESS:      "success",
  FAILURE:      "failure",
  CANCELLED:    "cancelled",
  INVALID:      "invalid",
  PENDING:      "pending",
  INTERRUPTED:  "interrupted",
};

// ══════════════════════════════════════
// Target Types
// ══════════════════════════════════════
export const TARGET_TYPE = {
  SELF:         "self",
  SINGLE_ALLY:  "single_ally",
  SINGLE_ENEMY: "single_enemy",
  ALL_ALLIES:   "all_allies",
  ALL_ENEMIES:  "all_enemies",
  AREA:         "area",
  POSITION:     "position",
  NONE:         "none",
};

// ══════════════════════════════════════
// Action Registry
// ══════════════════════════════════════
export const ActionRegistry = {
  _actions: {},

  register(id, definition) {
    if (this._actions[id]) throw new Error(`Action '${id}' already registered`);
    this._actions[id] = {
      ...definition,
      id,
      registeredAt: Date.now(),
    };
    return this._actions[id];
  },

  unregister(id) {
    const action = this._actions[id];
    delete this._actions[id];
    return action;
  },

  get(id) { return this._actions[id] || null; },

  list() { return Object.values(this._actions).map(a => ({ id:a.id, name:a.name, type:a.type, category:a.category })); },

  has(id) { return id in this._actions; },

  validate(id) { return this._actions[id] ? { valid:true, action:this._actions[id] } : { valid:false, error:"UNKNOWN_ACTION" }; },
};

// ══════════════════════════════════════
// Register Built-in Actions
// ══════════════════════════════════════
ActionRegistry.register("attack", {
  name: "普通攻击",  type: "offensive", category: "basic",
  targetType: TARGET_TYPE.SINGLE_ENEMY, qiCost: 0, cooldown: 0,
  description: "使用武器进行基础攻击",
  validate(ctx) {
    if (!ctx.target) return "MISSING_TARGET";
    if (ctx.source.getCombatState().current === "dead") return "SOURCE_DEAD";
    return null;
  },
});

ActionRegistry.register("skill", {
  name: "技能",      type: "offensive", category: "skill",
  targetType: TARGET_TYPE.SINGLE_ENEMY, qiCost: 0, cooldown: 0,  // cost from skill db
  description: "释放技能攻击敌人",
  validate(ctx) {
    if (!ctx.target) return "MISSING_TARGET";
    if (!ctx.params?.skillId) return "MISSING_SKILL_ID";
    const skills = ctx.source.getSkills();
    if (!skills.known.includes(ctx.params.skillId)) return "SKILL_NOT_KNOWN";
    if ((skills.cooldowns[ctx.params.skillId]||0) > 0) return "SKILL_ON_COOLDOWN";
    return null;
  },
});

ActionRegistry.register("defend", {
  name: "防御",      type: "defensive", category: "basic",
  targetType: TARGET_TYPE.SELF, qiCost: 0, cooldown: 0,
  description: "转为防御姿态，减少受到的伤害",
  validate(ctx) { return null; },
});

ActionRegistry.register("flee", {
  name: "逃跑",      type: "utility",   category: "basic",
  targetType: TARGET_TYPE.NONE, qiCost: 0, cooldown: 0,
  description: "尝试逃离战斗",
  validate(ctx) {
    if (ctx.source.getFaction() === "boss") return "BOSS_CANNOT_FLEE";
    return null;
  },
});

ActionRegistry.register("item", {
  name: "使用物品",  type: "utility",   category: "item",
  targetType: TARGET_TYPE.SELF, qiCost: 0, cooldown: 0,
  description: "使用背包中的物品",
  validate(ctx) {
    if (!ctx.params?.itemId) return "MISSING_ITEM_ID";
    return null;
  },
});

ActionRegistry.register("guard", {
  name: "保护",      type: "defensive", category: "special",
  targetType: TARGET_TYPE.SINGLE_ALLY, qiCost: 5, cooldown: 1,
  description: "保护一个友方单位",
  validate(ctx) {
    if (!ctx.target) return "MISSING_TARGET";
    return null;
  },
});

// ══════════════════════════════════════
// Action Request — immutable intent
// ══════════════════════════════════════
export function createActionRequest(actionId, sourceId, targetId, params = {}) {
  return Object.freeze({
    actionId,
    sourceId,
    targetId,
    params: { ...params },
    timestamp: Date.now(),
  });
}

// ══════════════════════════════════════
// Action Context — read-only execution environment
// ══════════════════════════════════════
export function createActionContext(request, session, sourceParticipant, targetParticipant) {
  return {
    request,
    session,
    source: sourceParticipant,
    target: targetParticipant,
    tick: session?.tick || 0,
    get params() { return request.params; },
  };
}

// ══════════════════════════════════════
// Action Validator
// ══════════════════════════════════════
export function validateAction(actionId, context) {
  // 1. Action exists
  const action = ActionRegistry.get(actionId);
  if (!action) return { valid:false, error:"UNKNOWN_ACTION", code:"ACTION_UNKNOWN" };

  // 2. Session
  if (!context.session) return { valid:false, error:"NO_SESSION", code:"NO_SESSION" };

  // 3. Source alive
  if (!context.source || !context.source.isAlive()) return { valid:false, error:"SOURCE_DEAD", code:"SOURCE_DEAD" };

  // 4. Custom validation
  const customError = action.validate ? action.validate(context) : null;
  if (customError) return { valid:false, error:customError, code:customError };

  return { valid:true, action };
}

// ══════════════════════════════════════
// Action Executor — consume resources, create intent
// ══════════════════════════════════════
export function executeAction(actionId, context, kernel) {
  const action = ActionRegistry.get(actionId);
  if (!action) return { result:ACTION_RESULT.INVALID, error:"UNKNOWN_ACTION" };

  // Validate
  const validation = validateAction(actionId, context);
  if (!validation.valid) return { result:ACTION_RESULT.INVALID, error:validation.error };

  // Consume qi
  if (action.qiCost > 0) {
    const qi = context.source.getQi();
    if (qi.current < action.qiCost) return { result:ACTION_RESULT.FAILURE, error:"INSUFFICIENT_QI" };
    // Consume via kernel
    if (kernel) {
      const e = kernel.getEntity(context.source.id);
      if (e) {
        const qiComp = e.getComponent("Qi") || { current:50, max:50 };
        kernel.updateComponent(e.id, "Qi", { ...qiComp, current: Math.max(0, qiComp.current - action.qiCost) }, e.version);
      }
    }
  }

  // Create execution intent → passed to Combat Resolution
  const intent = {
    actionId,
    actionName: action.name,
    source: context.source.serialize(),
    target: context.target ? context.target.serialize() : null,
    params: context.params,
    tick: context.tick,
  };

  return {
    result: ACTION_RESULT.SUCCESS,
    intent,
    action: { id:actionId, name:action.name, type:action.type },
  };
}

// ══════════════════════════════════════
// Action Cancellation
// ══════════════════════════════════════
export function cancelAction(reason, context) {
  return {
    result: ACTION_RESULT.CANCELLED,
    reason,
    actionId: context.request?.actionId,
    sourceId: context.source?.id,
    tick: context.tick,
  };
}
