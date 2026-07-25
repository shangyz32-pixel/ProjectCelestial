# CHANGELOG

> Project Celestial — 从空目录到 v1.0 的完整变更记录。

---

## v1.0.0 — Celestial Genesis

*2026-07-23 | Architecture Freeze*

### Phase 1: Celestial Bible（世界观）

**新增**:
- CelestialBible.md — 单文件最高法典（44KB）
- Volume I: 世界哲学（宇宙/天道/大道/生命）
- Volume II: 世界物理（灵气/时间/空间/生态）
- Volume III: 修炼体系（16境界/灵根/天劫/功法）
- Volume IV: 世界引擎（四层架构/11 Engine/12约束）
- Volume V: 宇宙拓扑（六层架构/六界/飞升）
- 辅助文档: Universe三部 + Dao + Cultivation + TimeEngine + WorldEngine

### Phase 2: Canon Registry（数据层）

**新增**:
- Registry/Realm.yaml — 16 境界 + 寿元 + 突破率
- Registry/SpiritRoot.yaml — 8 品质 × 14 属性
- Registry/lifespan.yaml — 各境界寿元
- Registry/dao.yaml — 三层大道体系
- Registry/tribulation.yaml — 六种天劫
- Registry/breakthrough.yaml — 突破五条件 + 失败后果
- Registry/weather.yaml — 12 种天气 + 修炼影响
- Registry/factions.yaml — 6 种势力类型

### Phase 3: World Training

**Stage 1: Canon Ingestion**
- INDEX.md — 检索优先级系统
- ADR-0001 — 统一修炼体系
- ADR-0002 — Canon 知识摄入系统

**Stage 2: Rule Engine**
- rule_engine.yaml — 突破/天劫/死亡 3 条管线
- ADR-0003 — 确定性规则引擎

**Stage 3: Knowledge Graph**
- knowledge_graph.yaml — 6 节点 × 7 边类型
- ADR-0004 — 图优先世界查询

**Stage 4: NPC Memory**
- memory_schema.yaml — 双层记忆数据结构
- npc_template.yaml — NPC 记忆模板
- npc_001~003 + npc_master_li — 4 个示例 NPC
- rule_engine.yaml → actions.memory — 记忆管线
- knowledge_graph.yaml → on_memory_event — 记忆→KG 同步
- ADR-0005 — NPC 双层记忆

**Stage 5: Narrative Layer**
- narrative_schema.yaml — Scene Template + 行为→叙事规则
- scene_001_encounter.md — 坊市相遇叙事演示
- factions_detail.yaml — 三大势力详述

**Stage 6: Simulation Loop**
- simulation_loop.yaml — 11 步确定性循环
- tick_walkthrough_001.md — Tick 走查验证
- ADR-0006 — 确定性世界循环
- 更新 volume4_world_engine.md

**Stage 7: Emergent Narrative**
- causal_chain.yaml — 4 种因果检测 + 置信度公式
- narrative_arc.yaml — 弧/章/场景 + 多视角编织
- arc_001_spirit_vein_crisis.md — 灵脉危机叙事弧
- ADR-0007 — 涌现式叙事
- 更新 narrative_schema.yaml

**Stage 8: Canon Validator**
- canon_validator.yaml — 6 域 28 条校验规则
- validator_demo_arc001.md — arc_001 校验演示
- ADR-0008 — 内容校验层
- 集成到 simulation_loop (step_09b)
- 集成到 narrative_schema (step 6)

### Phase 3.5: World OS

- WORLD_OS.md — 12 章完整宪章 + 10 条不可变原则
- world_kernel.yaml — Kernel + Transaction + EventBus
- world_state.yaml — 10 域统一状态数据模型
- capability.yaml — L0~L6 七级权限 + SDK API
- plugin_system.yaml — 插件系统 + 脚本引擎
- ADR-0009 — World OS 架构决策
- ARCHITECTURE.md — 系统架构总纲

### Phase 4 Blueprint

- ROADMAP.md — 完整五阶段路线图
- civilization_engine.yaml — AI 文明四大支柱
- ADR-0010 — 从个体到文明的跃迁

### 元文档

- VERSION.md — 版本声明与冻结规则 (本版本创建)
- CHANGELOG.md — 变更记录 (本文件)

---

## 统计

```
文件总数:  59
ADR 数量:  10
NPC 数量:  4
管线数量:  7
校验规则:  28
Capability 级别: 7
架构层:    12 (World OS 宪章)
Phase:     5 (其中 4 个完成，1 个定义中)
```

---

## 后续版本规划

```
v1.1.0 — Phase 4.1: Institution Engine
v1.2.0 — Phase 4.2: Governance Engine
v1.3.0 — Phase 4.3: Legacy Engine
v2.0.0 — Phase 4.4 + Phase 5: Civilization + Persistent Universe
```
