# Canon Validator Runtime Demo — 拒绝违规生成

> 双重关卡。违规 → 拒绝。不是标记后放行。

---

## Gate 1: 事件生成前

---

### 违规 #1: 跳跃境界

```
[Event Proposal]
  npc: 赵铁 (npc_new_001)
  action: breakthrough
  from: 筑基境 (realm_id=2)
  to: 元婴境 (realm_id=4)  ← 跳过了金丹境(3)

═══════════════════════════════════
Validator Gate 1 — Pre-Generation
═══════════════════════════════════

[CL01] 境界必须逐级突破
  check: new_realm_id(4) == old_realm_id(2) + 1
  result: 4 != 3
  severity: REJECT

→ 事件被拒绝。不会写入记忆。不会生成叙事。
→ 返回错误: "境界跳跃: 筑基→元婴 不允许, 必须先突破到金丹(realm_id=3)"
```

---

### 违规 #2: 灵根上限

```
[Event Proposal]
  npc: 赵铁 (npc_new_001)
  spirit_root: 凡灵根 (quality_id=0)
  target: 金丹境 (realm_id=3)

═══════════════════════════════════
Validator Gate 1 — Pre-Generation
═══════════════════════════════════

[CL02] 灵根上限不可超越
  data: compiled_registry.spirit_roots[0].realm_cap_id = 2 (筑基)
  check: 3 <= 2
  result: FALSE
  severity: REJECT

→ 事件被拒绝。
→ 返回: "凡灵根最高可至筑基境(realm_id=2), 无法突破到金丹(3)"
→ 赵铁的修炼之路到此为止——除非找到提升灵根的机缘。
```

---

### 违规 #3: 已死 NPC 发起行动

```
[Event Proposal]
  npc: 林远 (npc_linyuan, status: deceased, died 天历844)
  action: breakthrough_attempt
  target: 金丹境

═══════════════════════════════════
Validator Gate 1 — Pre-Generation
═══════════════════════════════════

[TL03] 已死 NPC 不能发起行动
  check: npc_linyuan.status == 'active'
  result: status is 'deceased' (天历844)
  severity: REJECT

→ 事件被拒绝。
→ 林远已死。在 story 里他可以活在闪回中, 但不能发起新事件。
```

---

## Gate 2: 叙事输出前

---

### 违规 #4: 叙事中的 KG 矛盾

```
[Narrative Proposal]
  段落: "陈玄回到青云宗内门, 向师父李长风请教功法。"
  来源: Narrative Engine → scene generation

═══════════════════════════════════
Validator Gate 2 — Post-Generation
═══════════════════════════════════

[WS02] KG 边与 World State 一致
  check: npc_001 的 MEMBER_OF 边
  KG result: npc_001 → HOSTILE_TO → faction_qingyun
  Narrative claims: "陈玄在青云宗内门"
  mismatch: 陈玄不属于青云宗 (MEMBER_OF 边不存在)

→ 段落被拒绝。
→ 标记 [rejected]
→ 叙事引擎重新生成: "陈玄站在青云宗山门外, 遥望曾经的师门。"
→ 重新校验 → PASS
```

---

### 违规 #5: 人物设定矛盾

```
[Narrative Proposal]
  段落: "李长风冷笑一声, 宣布散修盟为青云宗死敌。"

═══════════════════════════════════
Validator Gate 2 — Post-Generation
═══════════════════════════════════

[CH02] 行为标签不矛盾
  data: entity_memory(npc_master_li).active_tags
  tags: TRUSTS(陈玄,9) + HOSTILE_TOWARD(青云宗,6)
  Narrative claims: "李长风宣布散修盟为死敌"
  check: TRUSTS(陈玄) → 李长风不会公开敌视陈玄的势力
  severity: WARN

→ WARN: 标记 [disputed]
→ 叙事可以保留（人物内心矛盾是合理的）, 但标注不一致。
→ 建议: "李长风沉默不语。他不能支持散修盟——他是青云宗的长老。
          但他也不能反对——陈玄是他这辈子最亏欠的人。"
```

---

## 违规统计 (Tick #1)

```
Gate 1 (Pre-Generation):
  events_proposed:  10
  events_rejected:  2  (#1 跳跃境界, #2 灵根上限)
  events_warned:    0
  events_passed:    8

Gate 2 (Post-Generation):
  scenes_proposed:  3
  scenes_rejected:  1  (#4 KG矛盾)
  scenes_warned:    1  (#5 标签矛盾)
  scenes_passed:    1

Summary:
  REJECTED: 3 — 不会出现在历史中
  WARNED:   1 — 出现在历史中, 标注 [disputed]
  PASSED:   9 — 正常写入
```

---

## 对比: 没有 Validator

```
如果没有 Gate 1:  赵铁"突破元婴境"的事件会写入历史。
                  三百天后, 有人发现赵铁的灵根上限是筑基。
                  世界矛盾了。

如果没有 Gate 2:  "陈玄回到青云宗内门"会出现在叙事中。
                  读者发现: 等等, 他不是被逐出师门了吗？
                  叙事不可信了。

Validator 不阻止好故事。
Validator 阻止坏一致性。
```
