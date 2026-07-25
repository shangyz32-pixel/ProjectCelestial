# ADR-0017: Decision Engine — 目标驱动的 NPC 行为

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

当前 NPC 行为由 active_tags 驱动（HOSTILE_TOWARD → attack）。但这缺少优先级——一个濒死的 NPC 不应该还在追杀仇人。

Decision Engine 引入目标优先级系统。NPC 不随机。NPC 根据目标、资源、时间、关系和历史做出决策。

## Decision

**Decision Engine** —— 目标驱动的每日行动生成器。

### 目标优先级

```
1. survive      紧急: HP<30% / 寿元<10% / 濒死 → 先生存
2. protect      重要: 对重要人物的 TRUSTS/GRATEFUL_TOWARD → 保护
3. revenge      驱动: SEEKS_REVENGE intensity ≥ 7 → 复仇
4. expand_sect  战略: 宗门领导者 → 发展势力
5. seek_power   长期: SEEKS_POWER / SEEKS_MASTERY → 寻求突破
6. cultivate    默认: 没有任何紧急目标 → 修炼
```

### 决策公式

```
urgency(goal) = resource_factor × time_factor × relationship_factor × history_factor

最高 urgency 的目标 → 生成具体行动 → daily_action
```

### 四维因子

| 因子 | 含义 | 数据来源 |
|------|------|----------|
| resource | 当前资源是否支持该目标？ | World State |
| time | 有多紧迫？（寿元/时限） | compiled_registry |
| relationship | 目标驱动的 KG 关系强度 | KG Runtime |
| history | 触发该目标的记忆有多重要？ | Entity Memory |

## Design

```
Decision Engine
├── goal_evaluator:  检查哪些目标处于 active 状态
├── urgency_calculator: 对每个 active goal 计算紧迫度
├── action_generator:  最高优先级目标 → 具体行动
└── constraint_checker: 行动是否可能？（位置/资源/制度限制）
```

## Consequences

- NPC 行为从"标签驱动"升级为"目标驱动"
- 濒死 NPC 自动优先生存，不会愚蠢地继续追杀
- 同一个 NPC 在不同状态下选择不同目标
- 决策过程完全可追溯（每个因子的值可审计）
