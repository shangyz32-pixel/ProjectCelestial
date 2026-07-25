# v1.0 Canon 文件映射

> 当前结构 → 理想 v1.0 结构。
> 此文件为参考索引。实际文件暂未移动。

---

## 理想 v1.0 目录结构

```
Project Celestial v1.0/
│
├── VERSION.md              ← 版本声明
├── CHANGELOG.md            ← 变更记录
├── ROADMAP.md              ← 路线图
├── ARCHITECTURE.md         ← 架构总纲
├── WORLD_OS.md             ← 12 章宪章
├── CelestialBible.md       ← 完整法典（单文件合集）
│
├── docs/                   ← Phase 1: 世界观
│   ├── volume1_universe.md
│   ├── volume2_physics.md
│   ├── volume3_cultivation.md
│   ├── volume4_world_engine.md
│   └── volume5_universe_topology.md
│
├── canon/                  ← Phase 2: 数据层
│   ├── INDEX.md
│   ├── registry/
│   │   ├── realms.yaml
│   │   ├── spirit_roots.yaml
│   │   ├── lifespan.yaml
│   │   ├── dao.yaml
│   │   ├── tribulation.yaml
│   │   ├── breakthrough.yaml
│   │   ├── weather.yaml
│   │   └── factions.yaml
│   └── universe/
│       ├── Constants.md
│       ├── Cosmology.md
│       └── Universe.md
│
├── engine/                 ← Phase 3 + 3.5: 引擎层
│   ├── rule_engine.yaml
│   ├── knowledge_graph.yaml
│   ├── memory_schema.yaml
│   ├── narrative_schema.yaml
│   ├── narrative_arc.yaml
│   ├── causal_chain.yaml
│   ├── simulation_loop.yaml
│   ├── canon_validator.yaml
│   ├── world_kernel.yaml
│   ├── world_state.yaml
│   ├── capability.yaml
│   ├── plugin_system.yaml
│   ├── civilization_engine.yaml
│   ├── dao.md
│   ├── cultivation.md
│   ├── time_engine.md
│   └── world_engine.md
│
├── adr/                    ← 所有 ADR
│   ├── adr-0001-unified-cultivation.md
│   ├── adr-0002-canon-ingestion.md
│   ├── adr-0003-rule-engine.md
│   ├── adr-0004-knowledge-graph.md
│   ├── adr-0005-npc-memory.md
│   ├── adr-0006-simulation-loop.md
│   ├── adr-0007-emergent-narrative.md
│   ├── adr-0008-canon-validator.md
│   ├── adr-0009-world-os.md
│   └── adr-0010-ai-civilization.md
│
└── world/                  ← 运行时数据 + 演示
    ├── factions_detail.yaml
    ├── npcs/
    │   ├── npc_template.yaml
    │   ├── npc_001/memory.yaml
    │   ├── npc_002/memory.yaml
    │   ├── npc_003/memory.yaml
    │   └── npc_master_li/memory.yaml
    └── narrative/
        ├── scene_001_encounter.md
        ├── arc_001_spirit_vein_crisis.md
        ├── tick_walkthrough_001.md
        └── validator_demo_arc001.md
```

---

## 当前 → 目标 映射表

| 当前路径 | 目标路径 | 状态 |
|----------|----------|------|
| CelestialBible.md | (根目录, 不变) | — |
| ARCHITECTURE.md | (根目录, 不变) | — |
| ROADMAP.md | (根目录, 不变) | — |
| WORLD_OS.md | (根目录, 不变) | — |
| VERSION.md | (根目录, 新增) | ✅ |
| CHANGELOG.md | (根目录, 新增) | ✅ |
| Canon/INDEX.md | canon/INDEX.md | 待移动 |
| Canon/volume1-5.md | docs/volume1-5.md | 待移动 |
| Canon/Registry/*.yaml | canon/registry/*.yaml | 待移动 |
| Canon/Universe/*.md | canon/universe/*.md | 待移动 |
| Canon/Cultivation/Cultivation.md | engine/cultivation.md | 待移动 |
| Canon/Dao/Dao.md | engine/dao.md | 待移动 |
| Canon/Time/TimeEngine.md | engine/time_engine.md | 待移动 |
| Canon/WorldEngine/WorldEngine.md | engine/world_engine.md | 待移动 |
| Canon/rule_engine.yaml | engine/rule_engine.yaml | 待移动 |
| Canon/knowledge_graph.yaml | engine/knowledge_graph.yaml | 待移动 |
| Canon/memory_schema.yaml | engine/memory_schema.yaml | 待移动 |
| Canon/narrative_schema.yaml | engine/narrative_schema.yaml | 待移动 |
| Canon/narrative_arc.yaml | engine/narrative_arc.yaml | 待移动 |
| Canon/causal_chain.yaml | engine/causal_chain.yaml | 待移动 |
| Canon/simulation_loop.yaml | engine/simulation_loop.yaml | 待移动 |
| Canon/canon_validator.yaml | engine/canon_validator.yaml | 待移动 |
| Canon/world_kernel.yaml | engine/world_kernel.yaml | 待移动 |
| Canon/world_state.yaml | engine/world_state.yaml | 待移动 |
| Canon/capability.yaml | engine/capability.yaml | 待移动 |
| Canon/plugin_system.yaml | engine/plugin_system.yaml | 待移动 |
| Canon/civilization_engine.yaml | engine/civilization_engine.yaml | 待移动 |
| Canon/ADR/adr-0001~0010.md | adr/adr-0001~0010.md | 待移动 |
| world/* | world/* | 不变 |

---

## 重组优先级

```
优先级 1 (立即): 创建 CHANGELOG.md, VERSION.md ✅ 已完成
优先级 2 (进入 Phase 4 前): 移动文件到新结构
优先级 3 (可选): 清理旧 Canon/ 目录（保留历史快照）
```

---

## 重组后的好处

```
之前: Canon/ADR/adr-0005.md — ADR 被埋在 Canon 深处
之后: adr/adr-0005.md — 第一眼就能看到

之前: Canon/simulation_loop.yaml — Engine 和 Canon 混在一起
之后: engine/simulation_loop.yaml — 一眼知道这是引擎

之前: 新成员不知道先看哪个文件
之后: docs(读世界观) → canon(查数据) → engine(看实现) → adr(理解决策)
```
