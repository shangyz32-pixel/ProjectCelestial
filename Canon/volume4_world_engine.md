# Volume IV — World Engine（世界运行规则）

> 来源: Celestial Bible Volume IV
> 完整版本: CelestialBible.md

---

## 四层引擎架构

```
World Kernel      — Time / Physics / Cultivation / Event Bus
Simulation Layer  — NPC / Ecology / Economy / Weather / Faction
Narrative Layer   — Quest / Dialogue / Story / Lore
Interface Layer   — Hermes / 玩家 / API / Clients
```

叙事不能直接控制世界。故事建立在模拟之上。

---

## World Tick

完整规范见 Canon/simulation_loop.yaml。

```
Step 01: Time      → 推进时间 1 天，检查时间触发事件
Step 02: Weather   → 季节+地形+灵气 → 天气分布
Step 03: Qi        → 天气+灵脉 → 灵气浓度
Step 04: Ecology   → 灵气+季节 → 妖兽/灵药/生态链
Step 05: NPC       → 修炼+记忆衰减+行动+遭遇检测
Step 06: Faction   → 资源+目标 → 宗门决策
Step 07: Economy   → 供需 → 价格
Step 08: War       → 敌对+兵力 → 战争进展
Step 09: Events    → 收集所有变更 → 记忆→KG→叙事
Step 10: History   → 不可修改写入
Step 11: Snapshot  → 全量快照（含 seed）
```

任何 Engine 不能跳过执行。不能修改过去历史。

---

## 各引擎职责

**Time**：推进世界时间（年/季/月/日/时辰）。春天灵药生长，冬天妖兽冬眠。

**Weather**：天气由季节+地形+灵气浓度+天地异象共同决定。不是随机背景。

**Ecology**：所有生命出生→成长→繁殖→衰老→死亡。妖兽数量变化影响生态链。过度采药导致资源短缺。

**NPC**：每日思考、行动、学习、交易、修炼。可以建立宗门、收徒、恋爱、结婚、生子、背叛、复仇、死亡。世界不会等待玩家。

**Faction**：宗门、国家、商会、魔教、家族、联盟。根据资源和目标自主决策：扩张、收徒、发动战争、签订盟约。

**Economy**：真实供需模型。没有固定商店。价格由产量+库存+运输+需求+战争+灾害决定。

**Event**：事件来自世界运行（天气/战争/资源/宗门/NPC/天道/随机机缘），自然生成，不是预设。

**History**：所有事件记录。不可删除。包括时间、地点、参与者、原因、经过、结果、影响。

---

## World Snapshot

每次 Tick 结束后保存快照。只允许新增，不得覆盖历史。

---

## 12 条运行约束

1. 世界永不停机
2. 玩家不会暂停世界
3. 所有 Entity 必须参与演化
4. 历史不可修改
5. 事件必须有原因
6. 资源必须遵循循环
7. 世界允许混乱，但保持一致性
8. 所有 Engine 按顺序运行
9. Engine 之间只能通过事件通信
10. Hermes 负责协调，不干预世界
