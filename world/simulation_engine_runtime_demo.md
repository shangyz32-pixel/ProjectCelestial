# Simulation Engine Runtime Demo — Tick #1 完整执行

> 世界时间: 天历 847-07-23 → 847-07-24
> Seed: 42
> 演示: 10 步不可跳过的世界心跳

---

## Tick #1 执行日志

```
═══════════════════════════════════════
Simulation Engine — Tick #1
Seed: 42 | Time: 天历 847-07-23
═══════════════════════════════════════

[Step 1/10] Time ............................................... ✅
  时间: 天历 847-07-23 → 847-07-24
  季节: 夏 (无切换)
  寿元检查: 0 NPC 到期
  Events: TickStarted

[Step 2/10] Weather ............................................ ✅
  查询: compiled_registry.weather (12 types)
  东海: summer+coast → 晴天 (PRNG: 0.31)
  青云山脉: summer+mountain → 多云 (PRNG: 0.67)
  Events: WeatherChanged(东海, 青云山脉)

[Step 3/10] Qi ................................................. ✅
  查询: KG.CONTROLS(青云宗→青云主脉), KG.CONTROLS(散修盟→东海灵脉)
  青云主脉: 60 × weather(1.0) × summer(1.2) = 72
  东海灵脉: 45 × weather(1.0) × summer(1.2) = 54
  衰减检查: 青云主脉 60→58 (持续下降)
  Events: QiChanged(青云主脉: -2, 东海灵脉: +0)

[Step 4/10] NPC ................................................ ✅
  查询: entity_memory (4 NPCs), KG.LOCATED_AT, KG.RIVAL_OF

  陈玄(npc_001):
    memory.tick: 标签衰减 (permanent→不变, slow→不变)
    cultivation: +0.02% (元婴境, qi=54)
    action: SEEKS_REVENGE(10) → 追踪王虎
    location: 青云山脉外围
    encounter: 王虎在青云宗内 → 未遭遇

  王虎(npc_002):
    cultivation: +0.05% (金丹境, qi=72)
    action: 备考内门考核
    encounter: none

  赵灵儿(npc_003):
    cultivation: +0.15% (筑基+冰凤灵体, qi=54)
    action: 修炼归元诀, 等师父回来
    new_memory: "师父外出第二天未归" (imp=3)

  李长风(npc_master_li):
    action: 继续关注王虎晋升内门
    internal: TRUSTS(陈玄,9) vs LOYAL_TO(青云宗,7) → 矛盾

  Events: CultivationProgress×4

[Step 5/10] Economy ............................................ ✅
  查询: KG.TRADES_WITH(青云宗)=[], KG.PRODUCES(青云主脉)→灵石
  灵石供应: 青云主脉日产 42 (58×0.7)
  基础丹药: 夏季产量上升 5%
  Events: 无价格剧烈波动

[Step 6/10] Faction ............................................ ✅
  查询: entity_memory.faction(青云宗), entity_memory.faction(散修盟)

  青云宗:
    resources: 正常
    goal: 解决灵脉危机 (造化玉液) — 进行中
    internal: 保守派 vs 改革派对抗继续
    decision: 推进王虎内门考核 + 组织遗迹探险队

  散修盟:
    resources: 正常
    goal: 盟主外出，执事代管
    decision: 等待陈玄指令

  Events: FactionDecision(青云宗: 遗迹探险)

[Step 7/10] War ................................................ ✅
  查询: KG.HOSTILE_TO — 无活跃战争
  跳过 (无进行中的战争)

[Step 8/10] Events ............................................. ✅
  收集: 8 raw_events
  去重后: 6 events

  importance:
    1. 青云主脉衰减       imp=6
    2. 陈玄追踪王虎        imp=6
    3. 王虎备考            imp=2
    4. 赵灵儿等待          imp=3
    5. 李长风内心矛盾      imp=4
    6. 青云宗组织探险      imp=7

  创建 Entity Memory:
    npc_001: "追踪至青云宗外围，未找到出手时机"
    npc_003: "师父外出第二天未归"
    faction_qingyun: "组织遗迹探险队（太虚真人洞府）"
    vein_qingyun_main: "灵气继续衰减: 60→58"

  KG Sync:
    (无新关系边)

  Causal Chain:
    "青云主脉衰减(imp=6) → 青云宗组织探险(imp=7)"
    LED_TO edge created, confidence=0.92

  Narrative:
    "青云主脉衰减(imp=6) + 组织探险(imp=7)" → beat
    "青云宗的灵脉又降了一点。第二次探险队正在组建。"

  Canon Validator:
    所有 6 事件通过 6 域校验
    Errors: 0 | Warnings: 0

[Step 9/10] History ............................................ ✅
  追加: tick_0001_history
  事件数: 6
  不可修改。不可删除。

[Step 10/10] Snapshot ........................................... ✅
  保存: snapshots/tick_0001_847-07-24.yaml
  绑定: canon=v1.0.0 | seed=42 | engine=v1.0.0
  大小: 245KB
  可完全重放。

═══════════════════════════════════════
Tick #1 完成。世界时间: 天历 847-07-24
═══════════════════════════════════════
```

---

## 运行时模块调用统计

```
Module           Queries  Writes  Events
Canon Loader     1        0       0
Registry Comp    5        0       0
Rule Engine      2        0       2
KG Runtime       7        1       0
Entity Memory    3        3       0
Narrative        0        0       1
Validator        1        0       0
─────────────────────────────────────
Total            19       4       6
```

---

## 不可跳过验证

```
Validator r_step_order:
  [✓] Step 1 executed
  [✓] Step 2 executed
  [✓] Step 3 executed
  [✓] Step 4 executed
  [✓] Step 5 executed
  [✓] Step 6 executed
  [✓] Step 7 executed (no-op, but executed)
  [✓] Step 8 executed
  [✓] Step 9 executed
  [✓] Step 10 executed

  Order check: 1→2→3→4→5→6→7→8→9→10 ✓
  Skip check:  0 steps skipped ✓
  Dependency:  each step reads previous step's output ✓

Result: PASS
```

---

## 可重放性

```
回放测试:
  1. 加载 snapshots/tick_0001_847-07-24.yaml
  2. 从 seed=42, time=847-07-23 重新执行 Tick #1
  3. 对比结果:
     Weather:  perfectly matches ✓
     Qi:       perfectly matches ✓
     NPC:      perfectly matches ✓
     Events:   perfectly matches ✓
     Snapshot: checksums identical ✓

结论: 完全可重放。
```
