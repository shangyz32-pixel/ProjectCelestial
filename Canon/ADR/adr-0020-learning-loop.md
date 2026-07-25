# ADR-0020: Learning Loop — 每日世界摘要

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

Simulation Engine 每个 Tick 产生事件、更新状态、生成叙事。但 Hermes 没有一个"停下来看看今天发生了什么"的环节。

Learning Loop 在每个 Tick 结束时：
1. 汇总今天的世界变化
2. 生成结构化摘要
3. 更新 Knowledge Graph
4. 保存 Snapshot + History

这既是"日报"，也是"Hermes 对世界的理解"。

## Decision

**Learning Loop** — Tick 结束后的聚合和持久化层。

### 管线

```
Step 8 Events (validated)
  → Learning Loop
    ├── 聚合统计（新增/死亡/突破/战争/飞升/重大事件）
    ├── 生成 World Summary
    ├── 更新 Knowledge Graph
    └── 触发 Step 9 History + Step 10 Snapshot
```

### 摘要结构

```yaml
tick: N
date: 天历 847-07-24
stats:
  new_factions: 0
  deaths: 0
  breakthroughs: 0
  wars_started: 0
  wars_ended: 0
  ascensions: 0
  discoveries: 1
major_events:
  - "青云主脉灵气降至 58"
  - "陈玄持续追踪王虎"
  - "赵灵儿开始担心师父"
world_state_flags:
  qi_crisis: "青云主脉 decading"
  faction_tension: "青云宗 ↔ 散修盟: HOSTILE"
```

### 与 Knowledge Graph 的关系

摘要不是替代 KG。摘要是"今天发生了什么"的可读记录。KG 是关系的实时状态。两者互补。

## Consequences

- 每个 Tick 有一份人类可读的摘要
- 摘要本身也写入 History——可追溯每一天的世界状态
- 是未来 Phase 5 "世界仪表盘"的基础数据
