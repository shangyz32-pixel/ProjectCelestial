# Runtime Knowledge Graph Demo

> 当前世界状态 → 图查询演示
> 一张图。所有 Engine 共用。

---

## 当前图谱状态

```
Nodes: 15
  character (4):  陈玄(npc_001), 王虎(npc_002), 赵灵儿(npc_003), 李长风(npc_master_li)
  faction (3):    青云宗, 散修盟, 魔渊
  location (4):   青云峰, 散修崖, 黑风岭, 云来坊市
  spirit_vein (2):青云主脉, 东海灵脉
  treasure (1):   青冥剑
  event (1):      林远之死

Edges: 18
  social:    STUDENT_OF(陈玄→李长风), BETRAYED(李长风→self), SAVED(陈玄→赵灵儿)
  faction:   MEMBER_OF(王虎→青云宗), MEMBER_OF(赵灵儿→散修盟),
             LEADS(陈玄→散修盟), LEADS(公孙烈→青云宗),
             HOSTILE_TO(青云宗↔散修盟), HOSTILE_TO(散修盟→魔渊)
  location:  LOCATED_AT(散修盟→东海), LOCATED_AT(青云宗→青云峰)
  resource:  CONTROLS(青云宗→青云主脉), CONTROLS(散修盟→东海灵脉)
  possession: OWNS(王虎→青冥剑), CULTIVATES(陈玄→焚天诀)
  causality: PARTICIPATED_IN(王虎→林远之死), CAUSED_BY(林远之死→王虎)
```

---

## 查询演示

```
════════════════════════════════════════
Query 1: 轨迹查询
"陈玄 → 属于哪个组织 → 该组织控制什么灵脉？"
════════════════════════════════════════

> traverse:
    start: { type: character, id: npc_001 }
    path: [MEMBER_OF, CONTROLS]

Result:
  陈玄 ──LEADS──→ 散修盟 ──CONTROLS──→ 东海灵脉
  东海灵脉: grade=地级, qi_output=45, status=stable

Complexity: O(2) — 两个边遍历

────────────────────────────────────────

════════════════════════════════════════
Query 2: 波及分析
"青云主脉枯竭了。影响谁？"
════════════════════════════════════════

> get_impact_analysis:
    node: { type: spirit_vein, id: vein_qingyun_main }
    depth: 3

Result tree:
  青云主脉 (qi: 60, decading)
    ├── PRODUCES → 灵石
    │   └── CONSUMES → 青云宗
    │       ├── MEMBER_OF → 王虎 (外门弟子)
    │       ├── MEMBER_OF → 李长风 (内门长老)
    │       ├── MEMBER_OF → 公孙烈 (大长老)
    │       └── MEMBER_OF → ~2000 弟子...
    └── 无备用灵脉 → 宗门危机

Affected: 2000+ entities
Crisis probability: HIGH

────────────────────────────────────────

════════════════════════════════════════
Query 3: 关系网络
"王虎和陈玄之间有什么间接关系？"
════════════════════════════════════════

> find_path:
    from: { type: character, id: npc_002 }  # 王虎
    to:   { type: character, id: npc_001 }  # 陈玄
    max_depth: 4

Result (最短路径, depth=3):
  王虎
    ──OWNS──→ 青冥剑
      ──原主──→ 林远 (deceased)
        ──STUDENT_OF──→ 陈玄

Path meaning: 王虎夺了陈玄徒弟的剑。

────────────────────────────────────────

════════════════════════════════════════
Query 4: 敌对网络
"散修盟的敌人控制着哪些资源？"
════════════════════════════════════════

> traverse + filter:
    step1: get_neighbors(散修盟, HOSTILE_TO)
           → [青云宗, 魔渊]
    step2: for each enemy:
             traverse(enemy, CONTROLS, PRODUCES)

Result:
  青云宗 → 青云主脉 (60 qi, decading)
  魔渊   → (未知, 不在查询范围)

────────────────────────────────────────

════════════════════════════════════════
Query 5: 历史追溯
"林远之死事件的影响链"
════════════════════════════════════════

> get_related_events(npc_linyuan):
    all events mentioning 林远

> traverse:
    start: 林远之死事件
    path: [LED_TO, LED_TO]

Result chain:
  林远之死 (天历844)
    led_to → 陈玄追查凶手 (天历844)
      led_to → 青云宗拒绝交人 (天历844)
        led_to → 陈玄结仇 (持续)
          led_to → 坊市相遇 (天历847)
            led_to → (待发生...)

Chain length: 5 events spanning 3 years.
```

---

## Engine 如何使用 KG

```
Economy Engine — 每日价格更新:
  1. 查询: get_neighbors(faction, TRADES_WITH)
     → 青云宗 ↔ (无贸易伙伴，HOSTILE_TO 阻断了贸易)
  2. 查询: traverse(faction, CONTROLS, PRODUCES)
     → 青云宗 → 青云主脉 → 灵石(日产量: 60×0.7=42)
  3. 计算: 灵石供应量基于灵脉产出 + 贸易
  4. 发布: ResourcePriceChanged(灵石, price, supply)

War Engine — 战争可行性评估:
  1. 查询: traverse(青云宗, CONTROLS) = [青云主脉(60)]
  2. 查询: traverse(散修盟, CONTROLS) = [东海灵脉(45)]
  3. 评估: 青云宗灵脉衰退中 → 资源劣势 → 不宜进攻
  4. 决策: 防御态势

NPC Engine — 陈玄遭遇王虎:
  1. 查询: get_neighbors(陈玄, RIVAL_OF) = [王虎]
  2. 查询: get_neighbors(王虎, LOCATED_AT) = [云来坊市]
  3. 检测: 陈玄位置 == 王虎位置 → encounter!
  4. 触发: on_encounter pipeline

Narrative Engine — 生成弧:
  1. 查询: get_related_events(青云宗)
  2. 检测: LED_TO 边 = 因果链
  3. 检测: chain length ≥ 3 → 弧
  4. 输出: "灵脉危机" 叙事弧
```

---

## 一张图，四个 Engine，同一个真相

```
Weather Engine 问: "这块灵脉归谁？"
  → KG: CONTROLS[青云宗→青云主脉]
  → 答案: 青云宗

Economy Engine 问: "青云宗的灵石从哪来？"
  → KG: traverse(青云宗, CONTROLS, PRODUCES)
  → 答案: 青云主脉日产 42 灵石

War Engine 问: "攻打青云宗——先打哪里？"
  → KG: traverse(青云宗, CONTROLS)
  → 答案: 先夺青云主脉（目前是唯一灵脉）

NPC Engine 问: "陈玄的仇人在哪？"
  → KG: RIVAL_OF(陈玄→王虎) → LOCATED_AT
  → 答案: 青云宗外门

四个 Engine。同一张图。不同的查询。一致的答案。
```
