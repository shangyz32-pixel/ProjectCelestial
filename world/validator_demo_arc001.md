# Canon Validator 演示
#
# 对 arc_001 灵脉危机叙事弧执行 6 域完整校验
# 展示 Validator 如何在内容产出后、写入历史前把关

---

## 校验对象

```
Arc:    arc_001 — 灵脉危机
事件数: 7
NPC 涉及: 陈玄(npc_001), 李长风(npc_master_li), 赵铁(新 NPC), 王虎(仅提及)
势力涉及: 青云宗, 散修盟, 魔渊
```

---

## 域 1: 世界规则 — ✅ 通过 (1 WARN)

| 规则 | 检查 | 结果 |
|------|------|------|
| r1_qi_bounds | 青云灵脉从 150→60，范围 0-1000 | ✅ PASS |
| r1_qi_bounds | 东海灵脉 qi=45，范围 OK | ✅ PASS |
| r2_weather_valid | arc_001 未显式描述天气 | ✅ PASS (跳过) |
| r3_causality_required | 7 个事件都有 trigger | ⚠️ WARN |
| r4_resource_conservation | 灵脉衰减 150→60，未记录去向 | WARN: 灵气消散未被其他灵脉吸收 |

**WARN #1 (r3)**: 事件 ③"弟子外出" 的 trigger 是 "宗门决定"，可以接受但不是直接因果链。建议在事件 ② 中明确 "削减开支 → 派遣搜索队"。

**WARN #2 (r4)**: 青云主脉灵气从 150 降至 60，少了的 90 单位灵气去哪了？未检测到周边灵脉吸收或天地散逸记录。标记为 resource_unaccounted。

**处理**: WARN 不阻止写入。在叙事中标注 [disputed: 灵气去向不明]。

---

## 域 2: 修炼体系 — ✅ 通过

| 规则 | 检查 | 结果 |
|------|------|------|
| r6_realm_sequential | 无突破事件 | ✅ PASS (N/A) |
| r7_spirit_root_cap | 陈玄: 天灵根·火, realm_cap=化神, 当前元婴 ✅ | ✅ PASS |
| r7_spirit_root_cap | 赵铁: 筑基境巅峰, 描述为外门弟子, 合理 ✅ | ✅ PASS |
| r8_lifespan_enforced | 陈玄年龄约 60(推算), 元婴寿元 1000+ ✅ | ✅ PASS |
| r9_breakthrough_conditions | 无突破事件 | ✅ PASS |
| r10_tribulation_trigger | 无天劫事件 | ✅ PASS |

域 2 全部通过。

---

## 域 3: 历史一致性 — ✅ 通过

| 规则 | 检查 | 结果 |
|------|------|------|
| r12_no_time_paradox | 无修改历史事件的操作 | ✅ PASS |
| r13_no_backward_reference | 事件引用的原因都在时间上更早 | ✅ PASS |
| r14_death_is_final | 林远(npc_linyuan, deceased) 仅被提及 | ✅ PASS |
| r15_no_contradictory_state | 陈玄在第 3 章同时在"青云宗外围"和"散修盟"？ | ⚠️ WARN |

**WARN #3 (r15)**: 第 3 章中，陈玄 "在青云宗外围盯着王虎" 同时 "执事找到他递上玉简"。这两件事可以在同一天先后发生，但需要明确时间顺序。当前叙事未说明执事是在哪里找到他的。

**处理**: WARN。建议在叙事中添加一句 "执事御剑追到青云山脉外围"。

---

## 域 4: 人物设定 —  ⚠️ 1 WARN

| 规则 | 检查 | 结果 |
|------|------|------|
| r16_spirit_root_match | 陈玄灵根与 npc_001/memory.yaml 一致 | ✅ PASS |
| r17_memory_internal_consistency | 陈玄的 HOSTILE_TOWARD(青云宗,10) 与第 3 章决策一致 | ✅ PASS |
| r18_behavior_tag_no_contradiction | 李长风: LOYAL_TO(青云宗) + HOSTILE_TOWARD(青云宗,6) | ⚠️ WARN |
| r19_location_valid | 所有地点已注册 | ✅ PASS |
| r20_personality_behavior_match | 陈玄隐忍型 → 选择 stalk 而非 attack | ✅ PASS |

**WARN #4 (r18)**: 李长风同时持有 LOYAL_TO(青云宗,7) 和 HOSTILE_TOWARD(青云宗,6)。intensity 差 = 1 < 5 阈值。这表示严重的内心冲突——他对宗门既忠诚又愤怒。规则允许（因为差 < 5），但标记 [disputed]。

**处理**: WARN，不阻止。这种矛盾是角色深度的来源，不是 Bug。

---

## 域 5: 时间线 — ✅ 通过

| 规则 | 检查 | 结果 |
|------|------|------|
| r21_chronological_order | 灵脉枯竭(1月)→削减(3月)→外出(6月)→遭遇(7月) ✅ | ✅ PASS |
| r22_causal_forward_only | 所有因果边 forward ✅ | ✅ PASS |
| r23_no_posthumous_action | 林远不再行动 ✅ | ✅ PASS |
| r24_lifespan_check_at_tick | 无寿元相关事件 | ✅ PASS |

域 5 全部通过。

---

## 域 6: 关系网络（KG）—  ⚠️ 1 WARN

| 规则 | 检查 | 结果 |
|------|------|------|
| r25_bidirectional_consistency | 青云宗 HOSTILE_TO 散修盟 → 散修盟 HOSTILE_TO 青云宗 ✅ | ✅ PASS |
| r26_no_mutually_exclusive_edges | 无冲突边 | ✅ PASS |
| r27_edge_change_traceable | 新边 "青云宗 → mobilize → 黑风岭" 来源事件 ✅ | ✅ PASS |
| r28_deceased_node_edges | 林远 (deceased) 被提及但未创建新边 | ✅ PASS |

**WARN #5 (r27)**: 魔渊对黑风岭的 mobilisation 边的 source_event 来自 "暗桩情报"，但这个暗桩事件尚未在 KG 中注册为正式节点。建议创建 event 节点: "暗桩截获青云宗传讯玉简"。

**处理**: WARN，不阻止。建议创建缺失的事件节点。

---

## 校验总结

```
域 1: 世界规则     ✅  2 WARN (灵气去向 + 因果链细节)
域 2: 修炼体系     ✅  0 问题
域 3: 历史一致性   ✅  1 WARN (时间顺序模糊)
域 4: 人物设定     ✅  1 WARN (李长风内心矛盾)
域 5: 时间线       ✅  0 问题
域 6: 关系网络     ✅  1 WARN (缺失事件节点)
─────────────────────────────────
总计:    0 BLOCK, 5 WARN, 0 INFO
判定:    ✅ 通过 — 允许写入历史
```

---

## 对比：如果 Validator 不存在

如果没有 Validator，arc_001 中有两个潜在问题不会被发现：

1. **灵气去向不明 (r4)**: 90 单位灵气消失。如果后续叙事说"灵气转移到了散修盟灵脉"，就会与当前数据矛盾。

2. **李长风标签矛盾 (r18)**: 他的 LOYAL_TO + HOSTILE_TOWARD 如果被后续叙事忽略（假设他完全忠诚或完全敌对），人物就不一致了。Validator 的 WARN 提醒叙事引擎：李长风的决策必须反映这种矛盾心理。

**Validator 不阻止好故事。Validator 阻止坏一致性。**

---

## 自动修复模拟

假设 arc_001 中出现了一个 BLOCK 级违规（为演示目的）：

```
违规: 事件 ④ 中说 "赵铁突破金丹境"
检查 r7: 赵铁 spirit_root 为 "凡灵根"，上限筑基境
结果: BLOCK

自动修复流程:
  1. 撤回事件 ④
  2. 修改: "赵铁突破金丹境" → "赵铁以筑基巅峰之力硬抗妖狼"
  3. 重新校验 → PASS
  4. 事件通过
```

整个过程在 1 个 Tick 内完成，不影响其他事件。
