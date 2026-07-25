# ADR-0016: Simulation Engine Runtime — 不可跳过的世界心跳

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

simulation_loop.yaml 定义了 11 步循环。但它是设计文档——没有绑定到运行时组件。

Module 6 将循环升级为 **Simulation Engine Runtime**——每步调用具体的运行时模块。

## Decision

**Simulation Engine Runtime** —— 世界的心跳。

### 核心约束（不可违反）

```
1. 固定顺序: Time → Weather → Qi → NPC → Economy → Faction → War → Events → History → Snapshot
2. 不可跳过: 任何一步都必须执行
3. 不可乱序: 每一步依赖上一步的输出
4. 确定性: 相同 seed + 相同 World State → 相同结果
5. 所有查询走编译后 Registry 和 KG
6. 所有状态变更走 Transaction
```

### 每步绑定的运行时模块

| 步骤 | 查询模块 | 执行模块 | 写入模块 |
|------|---------|---------|---------|
| Time | compiled_registry | TimeEngine | Transaction |
| Weather | compiled_registry.weather | WeatherEngine | Transaction |
| Qi | KG(CONTROLS), compiled_registry | QiEngine | Transaction |
| NPC | KG, compiled_registry, entity_memory | RuleEngine(memory/encounter) | entity_memory |
| Economy | KG(TRADES_WITH, PRODUCES) | EconomyEngine | Transaction |
| Faction | KG, entity_memory(faction) | FactionEngine | entity_memory |
| War | KG(HOSTILE_TO, CONTROLS) | WarEngine | Transaction |
| Events | (collect from steps 1-7) | memory_pipeline, kg_sync, narrative | entity_memory, KG |
| History | events | HistoryEngine | append-only |
| Snapshot | World State | Snapshotter | file |

### 与设计文档的关系

simulation_loop.yaml 保持为 Canon 设计文档。
simulation_engine_runtime.yaml 是运行时实现规范。
两者分开——设计是设计，执行是执行。

## Consequences

- 循环从"设计描述"变为"可执行的引擎调度"
- 每步明确标注了"查询什么→执行什么→写入什么"
- 任何跳过/乱序行为被 Validator 拒绝
- seed 可复现
