# Rule Engine Runtime Demo — 突破判定执行轨迹

> 演示：Rule Engine 的完整执行过程。
> 不靠 AI 判断。每一步都是确定性规则。

---

## 场景 A: 赵铁尝试突破金丹境

```
[Rule Engine] invoke:
  entity:    赵铁 (npc_new_001)
  action:    breakthrough
  target:    金丹境 (realm_id=3)
  context:
    current_realm: 筑基境 (realm_id=2)
    spirit_root: 凡灵根 (quality_id=0)
    location.qi_density: 35
    age: 28
    has_breakthrough_pill: false
    comprehension: 0.4
    dao_heart: 0.5
    destiny: 0.3
  seed: 12345

═══════════════════════════════════════
Trace: breakthrough → 赵铁 → 金丹境
═══════════════════════════════════════

[Check 1/5] qi_available
  条件: qi_density(35) >= min_qi(50)
  来源: compiled_registry.realms[3].min_qi = 50
  结果: ❌ BLOCKED
  详情: 灵气不足。当前 35, 需要 50。

[Pipeline HALTED] — 第一个 check 失败，不再执行后续。

Result:  BLOCKED
Reason:  qi_available failed
AI Role: 不能修改结果。可以解释: "赵铁所在之地灵气稀薄，不足以支撑突破。"
```

---

## 场景 B: 陈玄尝试突破化神境

```
[Rule Engine] invoke:
  entity:    陈玄 (npc_001)
  action:    breakthrough
  target:    化神境 (realm_id=5)
  context:
    current_realm: 元婴境 (realm_id=4)
    spirit_root: 天灵根·火 (quality_id=4, attribute_id=3)
    location.qi_density: 140
    age: 62
    has_breakthrough_pill: true
    comprehension: 0.82
    dao_heart: 0.75
    destiny: 0.55
    cultivation_value: 98.5 (阈值: 100)
  seed: 99999

═══════════════════════════════════════
Trace: breakthrough → 陈玄 → 化神境
═══════════════════════════════════════

[Check 1/5] qi_available
  条件: qi_density(140) >= min_qi(200)
  来源: compiled_registry.realms[5].min_qi = 200
  结果: ❌ BLOCKED
  详情: 灵气不足。当前 140, 需要 200。

Result:  BLOCKED
Reason:  qi_available failed
AI Role: "陈玄虽万事俱备，但东海散修崖灵气仅 140，
         不足以支撑化神突破。需寻找灵气 ≥ 200 的洞天福地。"
```

---

## 场景 C: 假设陈玄在青云峰（灵气 162）尝试

```
[Rule Engine] invoke:
  entity:    陈玄 (npc_001)
  action:    breakthrough
  target:    化神境 (realm_id=5)
  context:
    location.qi_density: 162  ← 青云峰（灵脉虽衰仍有 162）
    (其他条件同场景 B)
  seed: 99999

═══════════════════════════════════════
Trace: breakthrough → 陈玄 → 化神境
═══════════════════════════════════════

[Check 1/5] qi_available
  条件: qi_density(162) >= min_qi(200)
  结果: ❌ BLOCKED
  详情: 灵气不足。当前 162, 需要 200。

Result:  BLOCKED
AI Role: "青云峰灵脉已衰至 162，仍不够。陈玄需要
         比青云宗更好的灵地——或者造化玉液。"
```

---

## 场景 D: 假设陈玄在青云峰灵脉全盛时（250）

```
[Rule Engine] invoke:
  context:
    location.qi_density: 250  ← 灵脉全盛期
  seed: 99999

═══════════════════════════════════════
Trace: breakthrough → 陈玄 → 化神境
═══════════════════════════════════════

[Check 1/5] qi_available
  条件: qi_density(250) >= min_qi(200)
  结果: ✅ PASS

[Check 2/5] realm_cap
  条件: target_realm_id(5) <= realm_cap_id(6)
  来源: compiled_registry.spirit_roots[4].realm_cap_id = 6 (炼虚境)
  结果: ✅ PASS (天灵根上限炼虚 > 化神)

[Check 3/5] lifespan_sufficient
  条件: age(62) < lifespan(1500)
  来源: compiled_registry.realms[4].lifespan = 1500
  结果: ✅ PASS

[Check 4/5] resources
  条件: has_breakthrough_pill = true
  结果: ✅ PASS

[Check 5/5] comprehension
  条件: comprehension(0.82) >= 0.3
  来源: breakthrough.min_comprehension[4~5] = 0.3
  结果: ✅ PASS

All checks passed.

[Probability Calculation]
  base_rate: compiled_registry.realms[5].breakthrough_rate = 0.08

  modifiers:
    pill_bonus:     0.08 × 1.3  = 0.104
    qi_density:     0.104 × (1.0 + (250-200)×0.01)
                  = 0.104 × 1.5  = 0.156
    comprehension:  0.156 × (0.8 + 0.82×0.004)
                  = 0.156 × 0.80328 = 0.1253
    dao_heart:      0.1253 × (0.7 + 0.75×0.006)
                  = 0.1253 × 0.7045 = 0.0883
    destiny:        0.0883 × (0.9 + 0.55×0.002)
                  = 0.0883 × 0.9011 = 0.0796

  final_rate: clamp(0.0796, 0.01, 0.95) = 0.0796 (7.96%)
  roll: PRNG.random(0, 1, seed=99999) = 0.8347

  0.8347 > 0.0796

Result:  FAILURE
Reason:  probability roll failed

[Consequences]
  cultivation_loss:
    failure_loss_rate = 0.3 (from Registry)
    98.5 × (1 - 0.3) = 68.95

  meridian_damage:
    roll: PRNG(99999, 1) = 0.21 < 0.3 → 触发
    meridian_integrity -= 0.2

  soul_damage:
    roll: PRNG(99999, 2) = 0.87 > 0.3 → 未触发

  lifespan_loss:
    roll: PRNG(99999, 3) = 0.15 < 0.2 → 触发
    lifespan -= random(50, 200, seed=99999) = 137

  heart_demon_risk:
    probability = 0.1 + (1.0 - 0.75) × 0.3 = 0.175
    roll: PRNG(99999, 4) = 0.63 > 0.175 → 未触发

State Changes:
  - cultivation_value: 98.5 → 68.95
  - meridian_integrity: -0.2
  - lifespan: -137 年

Events:
  - type: breakthrough_failure
    importance: 11 (6 + realm_id 5)
    detail: "陈玄冲击化神境失败，经脉受损，寿元折损。"
```

---

## AI 边界演示

```
❌ AI 不允许做的:
  "我觉得陈玄应该成功突破，把 result 改成 SUCCESS。"
  → 被 Canon Validator r9 拦截: BLOCKED

✅ AI 允许做的:
  "陈玄站在青云峰顶，体内真元如沸——"
  "然后他咳出一口血。化神境的壁垒比想象中更厚。"
  "他默然片刻，取出疗伤丹药。下次。下次一定。"
  → 叙事来自 Rule Engine 的 FAILURE 结果。
  → 记忆来自 memory_pipeline.on_event。
  → AI 没有修改判定，只解释了结果。
```
