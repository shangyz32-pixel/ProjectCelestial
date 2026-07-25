# Project Celestial — World OS 架构总纲

> 天道计划。一个由 World OS 驱动的修仙世界模拟系统。
>
> 完整宪章: WORLD_OS.md
> 内核规范: Canon/world_kernel.yaml

---

## World OS 架构

```
┌──────────────────────────────────────────────────────┐
│                    WORLD OS                          │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │           World Kernel (唯一管理者)         │     │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │     │
│  │  │Scheduler │ │Validator │ │Snapshotter│  │     │
│  │  │(11步循环)│ │(6域28规) │ │(版本绑定)  │  │     │
│  │  └──────────┘ └──────────┘ └───────────┘  │     │
│  └──────────────────┬─────────────────────────┘     │
│                     │                                │
│  ┌──────────────────┼─────────────────────────┐     │
│  │  World State  ←──┼──→  Event Bus           │     │
│  │  (统一存储)       │     (pub/sub 解耦)      │     │
│  └──────────────────┼─────────────────────────┘     │
│                     │                                │
│     ┌───────────────┼───────────────┐               │
│     ▼               ▼               ▼               │
│  Engines        Plugins        Scripts              │
│  (内置7个)      (可扩展)        (沙箱)               │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │         Capability Layer (7级权限)          │     │
│  │  L0:Kernel > L1:Admin > L2:Master >        │     │
│  │  L3:Sect > L4:NPC > L5:Player > L6:Observer│     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │              SDK (统一API)                   │     │
│  │  Query API | Action API | Simulation API    │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
           玩家 / API / 客户端 / 微信
```

## 不可变原则

```
1.  Canon 是唯一真相。
2.  Kernel 是唯一状态管理者。
3.  所有修改必须经过事务。
4.  所有 Engine 必须事件驱动。
5.  世界状态必须可重放。
6.  历史不可覆盖。
7.  插件不得修改 Kernel。
8.  AI 不得绕过 Canon。
9.  玩家不是管理员。
10. 世界必须可以持续运行数年而保持一致性。
```

## Hermes 角色

```
身份: World Simulation Orchestrator
原则: 不创造规则。执行规则。

六项职责:
  1. 读取 Canon     → 回答前先查 Registry
  2. 读取世界状态    → 理解当前快照
  3. 推进世界模拟    → 11步循环严格执行
  4. 更新历史       → 只追加不修改
  5. 响应玩家       → 通过 SDK/API
  6. 保持一致性     → 所有产出通过 Validator
```

---

## 各层映射

| 架构层 | Canon 文件 | 状态 |
|--------|-----------|------|
| Celestial Bible | CelestialBible.md (44KB) | ✅ |
| Canon Registry | Canon/Registry/ (8个YAML) + Canon/volume1-5.md | ✅ |
| Rule Engine | Canon/rule_engine.yaml (4条管线) | ✅ |
| Knowledge Graph | Canon/knowledge_graph.yaml (6节点×7边) | ✅ |
| Simulation Loop | Canon/simulation_loop.yaml (11步) | ✅ |
| NPC | world/npcs/ (4个NPC + 模板) | ✅ |
| 宗门 | world/factions_detail.yaml (3势力) | ✅ |
| Memory Pipeline | Canon/memory_schema.yaml + rule_engine → memory | ✅ |
| Narrative Generator | Canon/narrative_schema.yaml + narrative_arc.yaml + causal_chain.yaml | ✅ |
| Canon Validator | Canon/canon_validator.yaml (6域28规则) | ✅ |
| History | simulation_loop → step_10 | ✅ |
| HERMES | 本文档 + INDEX.md 行为约束 | ✅ |

---

## Phase 3 完成清单

```
Phase 1: Celestial Bible          ✅ (前置)
Phase 2: Canon Registry           ✅ (前置)

Phase 3: Training the World       ✅
  Stage 1: Canon Ingestion        ✅  28 文件
  Stage 2: Rule Engine            ✅  4 管线
  Stage 3: Knowledge Graph        ✅  6节点×7边
  Stage 4: NPC Memory             ✅  双层记忆 + 行为驱动
  Stage 5: Narrative Layer        ✅  场景模板
  Stage 6: Simulation Loop        ✅  11步循环
  Stage 7: Emergent Narrative     ✅  因果链 + 弧 + 多视角
  Stage 8: Canon Validator        ✅  6域28规则

48 个文件 | 8 个 ADR | 所有架构层已覆盖
```

---

## 下一步：Phase 4 — 实现

将 simulation_loop.yaml 的每一步变成可运行的 Python 代码：

```
WorldEngine.py
  ├── TimeEngine      ← Step 1
  ├── WeatherEngine   ← Step 2
  ├── QiEngine        ← Step 3
  ├── EcologyEngine   ← Step 4
  ├── NPCEngine       ← Step 5 (含 Memory + Encounter)
  ├── FactionEngine   ← Step 6
  ├── EconomyEngine   ← Step 7
  ├── WarEngine       ← Step 8
  ├── EventBus        ← Step 9 (含 Narrative + Validator)
  ├── HistoryEngine   ← Step 10
  └── Snapshotter     ← Step 11
```
