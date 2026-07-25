# ADR-0009: World OS — 世界操作系统架构

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

Phase 3 的 8 个 Stage 完成了所有功能组件的设计。但这些组件之间缺乏统一的架构约束：

- 任何组件都可以直接修改世界状态（无事务保护）
- 组件之间直接调用（无事件解耦）
- 没有权限模型（任何 Agent 可以做任何事）
- 没有插件机制（新功能需要修改 Kernel）
- 没有版本管理（Canon 更新可能破坏已有世界）

当前架构是一个"功能集合"，不是一个"操作系统"。

需要从架构层面解决这些问题。

## Decision

将 Project Celestial 从"功能集合"升级为 **World OS（世界操作系统）**。

核心决策：

### 1. World Kernel — 唯一状态管理者

Kernel 是唯一允许修改 World State 的组件。所有其他组件（Engine/Plugin/Agent）通过 Kernel 的接口操作世界。

```
任何组件 → Kernel API → Transaction → World State
```

不得绕过 Kernel 直接修改状态。

### 2. Transaction Model — 所有修改必须事务化

世界状态修改不再是"直接改 YAML"。改为：

```
Create Transaction → Validate → Execute → Generate Events → Save Snapshot → Commit
失败 → Rollback
```

### 3. Event Bus — 组件解耦

Engine 之间不直接调用。通过 Event Bus 发布/订阅事件。

```
Weather Engine 发布 WeatherChanged
  → Economy Engine 监听
  → NPC Engine 监听
```

### 4. Plugin System — 扩展不侵入

新功能通过插件注册，不得修改 Kernel。

### 5. Capability Model — 权限控制

不同角色（Narrator/NPC/Sect Master/Admin/Kernel）拥有不同操作权限。

### 6. 版本管理 — 语义版本

Canon 采用 semver。Snapshot 绑定版本号。破坏性修改必须走 Canon Migration。

## Design

```
┌──────────────────────────────────────────┐
│              WORLD OS                     │
│                                           │
│  ┌──────────────────────────────────┐    │
│  │         World Kernel             │    │
│  │  ┌──────────┐ ┌───────────────┐  │    │
│  │  │ Scheduler│ │ State Manager │  │    │
│  │  ├──────────┤ ├───────────────┤  │    │
│  │  │Validator │ │ Snapshotter   │  │    │
│  │  └──────────┘ └───────────────┘  │    │
│  └──────────────────────────────────┘    │
│                    │                      │
│  ┌─────────────────┼──────────────────┐  │
│  │   World State   │   Event Bus      │  │
│  │  (unified store)│   (pub/sub)      │  │
│  └─────────────────┘──────────────────┘  │
│                                           │
│  Engines (plugin-based):                  │
│  Weather | NPC | Faction | Economy | War  │
│                                           │
│  Capability Layer:                        │
│  Kernel > Admin > Master > NPC > Reader   │
└──────────────────────────────────────────┘
```

## Consequences

- 现有所有组件需要适配 Kernel API（不直接修改状态）
- 现有 simulation_loop.yaml 重构为 Kernel Scheduler
- Canon Validator 升级为 Kernel 内置组件
- 事务模型增加了复杂度，但保证了一致性
- 插件系统使未来扩展不侵入 Kernel
- 版本管理使历史世界可以精确重现
