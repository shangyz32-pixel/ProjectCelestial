# Canon Index

> Hermes: 回答任何世界问题前，先查这个索引确定来源文件。
>
> v1.0.0 — Architecture Freeze — 2026-07-23

---

## 元文档

| 文件 | 内容 |
|------|------|
| VERSION.md | 版本声明 + 冻结规则 |
| CHANGELOG.md | 完整变更记录 |
| STRUCTURE.md | v1.0 目录结构映射 |
| ROADMAP.md | 五阶段路线图 |
| ARCHITECTURE.md | World OS 架构总纲 |
| WORLD_OS.md | 12 章宪章 + 10 原则 |

---

## 检索优先级

```
Registry YAML  >  Volume Markdown  >  ADR  >  CelestialBible.md
   (机器首选)       (人类首选)        (追溯)    (完整法典)
```

---

## Registry（机器可读 —— 优先查询）

| 文件 | 内容 | 何时查询 |
|------|------|----------|
| registry/realms.yaml | 16 境界 + 寿元 + 突破率 | 问境界、修炼上限 |
| registry/spirit_roots.yaml | 8 品质 × 14 属性 | 问灵根、天赋 |
| registry/lifespan.yaml | 各境界寿元 | 问寿命、死亡 |
| registry/dao.yaml | 三层大道体系 | 问大道、技能归属 |
| registry/tribulation.yaml | 六种天劫 | 问天劫、突破 |
| registry/breakthrough.yaml | 突破五条件 + 失败后果 | 问突破、修炼 |
| registry/weather.yaml | 12 种天气 + 修炼影响 | 问天气、环境 |
| registry/factions.yaml | 6 种势力类型 | 问宗门、组织 |

## Rule Engine（确定性规则检查）

| 文件 | 内容 |
|------|------|
| rule_engine.yaml | 三大管线：突破、天劫、死亡。确定性判定。 |

## Knowledge Graph（关系网络）

| 文件 | 内容 |
|------|------|
| knowledge_graph.yaml | 6 节点 × 7 边类型。图查询优先于全文搜索。 |

---

## Volume（人类可读）

| 文件 | 内容 |
|------|------|
| volume1_universe.md | 世界哲学、宇宙、天道、大道、生命、Canon 誓言 |
| volume2_physics.md | 物理、灵气、时间、空间、生态、资源、天气、能量、Tick |
| volume3_cultivation.md | 修炼六要素、16 境界、突破、寿元、天劫、功法、心境 |
| volume4_world_engine.md | 四层引擎架构、11 Engine、12 约束 |
| volume5_universe_topology.md | 六层架构、六界、界壁、飞升、跨界因果 |

---

## ADR（为什么这样设计）

| 文件 | 内容 |
|------|------|
| adr/adr-0001-unified-cultivation.md | 统一修炼体系 |
| adr/adr-0002-canon-ingestion.md | Canon 知识摄入系统 |
| adr/adr-0003-rule-engine.md | 确定性规则引擎 |
| adr/adr-0004-knowledge-graph.md | 图优先世界查询 |
| adr/adr-0005-npc-memory.md | NPC 双层记忆与行为驱动 |
| adr/adr-0006-simulation-loop.md | 确定性世界循环 |
| adr/adr-0007-emergent-narrative.md | 涌现式叙事 |
| adr/adr-0008-canon-validator.md | Canon 内容校验层 |
| adr/adr-0009-world-os.md | World OS 操作系统架构 |
| adr/adr-0010-ai-civilization.md | 从个体到文明的跃迁 |
| adr/adr-0011-canon-loader.md | Canon 统一加载器 |
| adr/adr-0012-registry-compiler.md | Registry 编译为运行时数据 |
| adr/adr-0013-rule-engine-runtime.md | 确定性规则执行 |
| adr/adr-0014-knowledge-graph-runtime.md | 统一世界图谱 |
| adr/adr-0015-entity-memory.md | 全实体通用记忆 |
| adr/adr-0016-simulation-engine-runtime.md | 不可跳过的世界心跳 |
| adr/adr-0017-decision-engine.md | 目标驱动的 NPC 行为 |
| adr/adr-0018-narrative-engine-runtime.md | 故事来自模拟 |
| adr/adr-0019-validator-runtime.md | 内容生成的硬关卡 |
| adr/adr-0020-learning-loop.md | 每日世界摘要 |
| adr/adr-0021-dev-team.md | AI 开发团队架构 |

---

## Phase 4: AI Development Team

| 文件 | 内容 |
|------|------|
| chief_architect.yaml | Layer 1: 总架构师 (Canon/ADR/架构) |
| world_engineer.yaml | Layer 2: 世界工程师 (实现/测试/验证) |
| gameplay_engineer.yaml | Layer 3: 玩法工程师 (功法/战斗/炼丹/炼器/秘境/任务) |
| ai_engineer.yaml | Layer 4: AI 工程师 (Hermes/Agent/Prompt/Memory/KG/Tool) |
| infrastructure_engineer.yaml | Layer 5: 基建工程师 (OpenClaw/Hermes/MCP/Docker/DB/API/CI/CD) |
| frontend_engineer.yaml | Layer 6: 前端工程师 (Web/地图/HUD/对话/GM) |
| qa_agent.yaml | Layer 7: QA Agent (Canon冲突/Bug/平衡/死循环/崩溃/性能) |
| lore_keeper.yaml | Layer 8: 世界史官 (历史/时间线/地名/势力一致性) |
| documentation_agent.yaml | Layer 9: 文档维护 (API/ADR/CHANGELOG/ROADMAP) |
| release_manager.yaml | Layer 10: 发布管理 (Dev→Test→Canon→Sim→RC→Prod) |
| agent_communication.yaml | 通信协议 (Task Queue→Scheduler→PR→Review→Merge) |
| training_curriculum.yaml | 四阶段训练 (Learn→Codebase→Small Tasks→Real Dev) |
| adr/adr-0021-dev-team.md | 团队架构决策 |

---

## Phase 4: Module 10 — Learning Loop

| 文件 | 内容 |
|------|------|
| learning_loop.yaml | 聚合→摘要→更新KG→持久化 |
| world/learning_loop_demo.md | 演示：三天（平静/战争/停战）的世界摘要 |

---

## Phase 4: Module 9 — Canon Validator Runtime

| 文件 | 内容 |
|------|------|
| validator_runtime.yaml | 双重关卡 + 6 域 O(1) 校验 + 使用编译模块 |
| world/validator_runtime_demo.md | 演示：5 个违规 → 3 REJECT + 2 WARN |

---

## Phase 4: Module 8 — Narrative Engine Runtime

| 文件 | 内容 |
|------|------|
| narrative_engine_runtime.yaml | 5 步管线 + 5 模块集成 + 源追溯 |
| world/narrative_engine_demo.md | 演示：黑风岭矿脉战争 6 事件 → 5 章叙事 |

---

## Phase 4: Module 7 — Decision Engine

| 文件 | 内容 |
|------|------|
| decision_engine.yaml | 6 级目标优先级 + 四维 urgency 公式 + 每日行动管线 |
| world/decision_engine_demo.md | 演示：四个 NPC 同一天的目标决策 + 信息不对称 |

---

## Phase 4: Module 6 — Simulation Engine Runtime

| 文件 | 内容 |
|------|------|
| simulation_engine_runtime.yaml | 10 步不可跳过的执行引擎 + 每步绑定运行时模块 |
| world/simulation_engine_runtime_demo.md | 演示：Tick #1 完整执行 + 模块调用统计 + 可重放验证 |

---

## Phase 4: Module 5 — Universal Entity Memory

| 文件 | 内容 |
|------|------|
| entity_memory.yaml | NPC/法宝/宗门/灵脉/地点/玩家 6 类实体记忆 |
| world/entity_memory_demo.md | 演示：斩仙剑 1200 年 + 青云宗 400 年 |

---

## Phase 4: Module 4 — Runtime Knowledge Graph

| 文件 | 内容 |
|------|------|
| knowledge_graph_runtime.yaml | 7 节点 × 7 边 + 图遍历/波及分析/最短路径 |
| world/knowledge_graph_runtime_demo.md | 演示：5 个查询 + 4 个 Engine 如何共用图谱 |

---

## Phase 4: Module 2 — Registry Compiler

| 文件 | 内容 |
|------|------|
| registry_compiler.yaml | 编译管线 + 8 Registry 转换规则 + 运行时 Schema |
| world/registry_compiler_demo.md | 演示：v1.0 编译 + O(1) 查询 |

---

## Phase 4: Module 3 — Rule Engine Runtime

| 文件 | 内容 |
|------|------|
| rule_engine_runtime.yaml | 确定性执行模型 + AI 边界 + 完整 Trace |
| world/rule_engine_runtime_demo.md | 演示：突破判定执行轨迹（4 场景 + AI 边界） |

---

## Phase 4: Module 1 — Canon Loader

| 文件 | 内容 |
|------|------|
| canon_loader.yaml | 8 步加载管线（发现→解析→校验→索引→建模→快照→diff→热更新） |
| canonical_world_model.yaml | 统一 World Model 数据结构 + 查询 API |
| world/canon_loader_demo.md | 演示：加载 v1.0 + 校验 + 查询 + 热更新 |

---

## Phase 4: AI Civilization（文明引擎）

| 文件 | 内容 |
|------|------|
| civilization_engine.yaml | 四大支柱：长期目标/制度/继承/集体决策 |
| ROADMAP.md | 完整五阶段路线图 |

---

## World OS（世界操作系统）

| 文件 | 内容 |
|------|------|
| WORLD_OS.md | 12 章完整宪章 + 10 条不可变原则 |
| world_kernel.yaml | Kernel + Transaction + EventBus |
| world_state.yaml | 统一世界状态数据模型 |
| capability.yaml | 7 级权限模型 + SDK API |
| plugin_system.yaml | 插件系统 + 脚本引擎 |

---

## Simulation Loop（模拟循环）

| 文件 | 内容 |
|------|------|
| simulation_loop.yaml | 11 步完整循环定义（Time→Snapshot） |
| world/tick_walkthrough_001.md | Tick #1 完整走查验证 |

---

## Emergent Narrative（涌现叙事）

| 文件 | 内容 |
|------|------|
| causal_chain.yaml | 因果链检测规则（4种因果类型） |
| narrative_arc.yaml | 弧/章/场景组合 + 多视角编织 |
| narrative_schema.yaml | 更新：加入涌现叙事管线 |
| world/narrative/arc_001_spirit_vein_crisis.md | 演示：灵脉枯竭→势力争夺（7事件因果链） |

---

## Canon Validator（校验层）

| 文件 | 内容 |
|------|------|
| canon_validator.yaml | 6 域 28 条校验规则（BLOCK/WARN/INFO） |
| simulation_loop.yaml → step_09b | 集成：Step 9 和 10 之间的校验关卡 |
| narrative_schema.yaml → step 6 | 集成：叙事生成后的校验 |
| world/validator_demo_arc001.md | 演示：对 arc_001 的 6 域完整校验 |

---

## Memory System（NPC 记忆）

| 文件 | 内容 |
|------|------|
| memory_schema.yaml | NPC 记忆数据结构定义 |
| rule_engine.yaml → actions.memory | 记忆处理管线（event/encounter/tick） |
| knowledge_graph.yaml → on_memory_event | 记忆事件 → KG 自动同步 |
| world/npcs/npc_template.yaml | NPC 记忆模板 |
| world/npcs/npc_001/memory.yaml | 示例 NPC：陈玄（被逐散修） |
| world/npcs/npc_002/memory.yaml | 示例 NPC：王虎（夺剑者） |
| world/npcs/npc_003/memory.yaml | 示例 NPC：赵灵儿（新弟子） |
| world/npcs/npc_master_li/memory.yaml | 示例 NPC：李长风（沉默的师父） |

---

## Narrative Layer（叙事引擎）

| 文件 | 内容 |
|------|------|
| narrative_schema.yaml | 叙事层架构（beat/scene/chapter/arc） |
| world/narrative/scene_001_encounter.md | 演示：坊市相遇场景完整叙事输出 |

---

## 完整法典

CelestialBible.md — 单文件最高法典（所有 Volume 的合集）。

---

## Hermes 行为约束

```
查询世界问题时:
  ① 确定问题涉及的领域
  ② 打开对应的 Registry YAML
  ③ 如 Registry 无法回答 → Volume Markdown
  ④ 如仍无法回答 → 报告 Architect（不在 Canon 范围内）

禁止:
  ❌ 凭模型记忆回答 Canon 问题
  ❌ 跳过 Registry 直接凭经验回答
  ❌ 给出与 Registry 冲突的答案
```
