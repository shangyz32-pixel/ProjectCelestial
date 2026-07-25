# ADR-0006: Simulation Loop — 确定性世界循环

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

当前系统各组件独立可用（Rule Engine / Memory / KG / Narrative），但缺少将它们连接起来的"心跳"。需要一条确定性的世界循环，每日推进所有子系统。

Volume 4 定义了 Tick 概念，现需具象化为可执行的循环定义。

## Decision

采用 **严格的顺序 Tick 循环**。每天（世界日）执行一次完整循环。

### 循环步序（不可重排）

```
Time → Weather → Qi → Ecology → NPC → Faction → Economy → War → Events → History → Snapshot
```

每一步的输出是下一步的输入。不可并行，不可跳过。

### Tick 粒度

1 Tick = 1 世界日（约等于游戏内 1 天，可根据需要缩放）。

### 确定性保证

- 所有随机操作使用可设 seed 的 PRNG
- 相同 seed + 相同世界状态 → 相同结果
- 快照保存 seed 值，支持回放

### 事件驱动 vs Tick 驱动

- Tick 驱动：日常更新（修炼进度、资源消耗、天气变化）
- 事件驱动：遭遇战、突破触发、NPC 交互
- 关系：Tick 过程中产生的事件放入事件队列，在 Events 阶段统一处理

## Design

```
┌─────────────────────────────────────────────┐
│                  One Tick                    │
│                                              │
│  Time     → 推进 1 天，更新时间戳             │
│  Weather  → 季节+灵气 → 天气                  │
│  Qi       → 天气+灵脉 → 灵气分布              │
│  Ecology  → 灵气+季节 → 妖兽/灵药/生态        │
│  NPC      → 修炼+行动+记忆→行为               │
│  Faction  → 资源+目标→宗门决策                │
│  Economy  → 产量+需求→价格                    │
│  War      → 敌对强度+资源→战争进展             │
│  Events   → 收集所有变更→生成事件              │
│  History  → 事件→不可修改写入                  │
│  Snapshot → 全量快照（含 seed）                │
└─────────────────────────────────────────────┘
```

### 与已有系统的集成

| 循环步 | 触发 | 目标 |
|--------|------|------|
| NPC 更新 | on_tick → Rule Engine memory pipeline | 标签衰减、短期清理 |
| NPC 更新 | 遭遇检测 → on_encounter | 行为决策 |
| Events 生成 | on_event → Rule Engine memory pipeline | 创建记忆条目 |
| Events 生成 | kg_sync → Knowledge Graph | 更新关系边 |
| Events 生成 | → Narrative Engine | 场景→叙事输出 |

## Alternatives

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| 并行执行 | 更快 | 不确定、难调试 | Rejected |
| LLM 自由推进 | 灵活 | 不可复现、违反 Canon | Rejected |
| 玩家手动推进 | 简单 | 世界不会自主演化 | Rejected |
| 确定性顺序循环 | 可复现、可调试 | 慢 | Accepted |

## Consequences

- 世界模拟从"手动设计场景"变为"设定初始条件，观察演化"
- 每条循环管线需要定义输入/输出/规则（当前有些为空）
- 快照机制使得"回到过去看不同选择"成为可能
- 需要实现 PRNG 管理器（可设 seed，可复现）
