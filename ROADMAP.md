# Project Celestial — 完整路线图

> 从一卷圣经到一个自主演化的文明宇宙。

---

## 总览

```
Phase 1 ──── Celestial Bible
  │           世界是什么？
  ▼
Phase 2 ──── Canon Registry
  │           世界怎么查？
  ▼
Phase 3 ──── World Training
  │           世界怎么运行？
  ▼
Phase 3.5 ── World OS
  │           世界怎么管？
  ▼
Phase 4 ──── Development Agents
  │           谁在开发世界？
  ▼
Phase 4.5 ── Engineering Governance
  │           怎么保证不乱？
  ▼
Phase 5 ──── Autonomous Validation
  │           怎么保证正确？
  ▼
Phase 6 ──── Persistent Universe
  │           世界通向哪里？
  ▼
Phase 7 ──── Software Engineering
  │           AI 软件工程能力
  ▼
Phase 8 ──── Autonomous Research
  │           AI 自主发现问题并优化
  ▼
Phase 9 ──── Self-Evolution
  │           Hermes 自我演进
  ▼
Phase 10 ─── AI Organization
              AI Software Company
```

---

## Phase 1: 世界观设计

**状态**: ✅ 完成

**核心产出**: Celestial Bible — 五卷最高法典。

```
Volume I:   世界哲学 — 天道、大道、生命、Canon 誓言
Volume II:  世界物理 — 灵气、时间、空间、生态
Volume III: 修炼体系 — 16 境界、灵根、天劫、功法
Volume IV:  世界引擎 — 四层架构、11 Engine、12 约束
Volume V:   宇宙拓扑 — 六层架构、六界、界壁、飞升
```

**关键决策**: Canon First — 任何时候 Canon 优先于实现。

---

## Phase 2: Canon Registry

**状态**: ✅ 完成

**核心产出**: 8 个 Registry YAML — 机器可读的世界数据。

```
Registry:
  realms.yaml         — 16 境界 + 寿元 + 突破率
  spirit_roots.yaml   — 8 品质 × 14 属性
  lifespan.yaml       — 各境界寿元
  dao.yaml            — 三层大道体系
  tribulation.yaml    — 六种天劫
  breakthrough.yaml   — 突破五条件 + 失败后果
  weather.yaml        — 12 种天气
  factions.yaml       — 6 种势力类型
```

**关键决策**: Registry 优先于 Volume — 机器查 Registry，人类读 Volume。

---

## Phase 3: World Training

**状态**: ✅ 完成（8 Stage）

**核心产出**: 让 Hermes 从"知道修仙"变成"能运行一个修仙世界"。

```
Stage 1: Canon Ingestion       ✅ 知识摄入系统
Stage 2: Rule Engine           ✅ 突破/天劫/死亡/记忆 4 管线
Stage 3: Knowledge Graph       ✅ 6 节点 × 7 边类型
Stage 4: NPC Memory            ✅ 双层记忆 + 行为驱动
Stage 5: Narrative Layer       ✅ Scene Template + 行为→叙事
Stage 6: Simulation Loop       ✅ 11 步确定性循环
Stage 7: Emergent Narrative    ✅ 因果链检测 + 弧组合
Stage 8: Canon Validator       ✅ 6 域 28 条校验规则
```

**关键决策**: 剧情不是写的。剧情来自模拟结果。

---

## Phase 3.5: World OS

**状态**: ✅ 完成

**核心产出**: 从"功能集合"升级为"操作系统"。

```
World Kernel     — 唯一状态管理者
Transaction      — 所有修改必须事务化
Event Bus        — Engine 间 pub/sub 解耦
World State      — 10 域统一状态模型
Capability       — L0~L6 七级权限
Plugin System    — 扩展不侵入 Kernel
SDK              — 统一 API 接口
```

**关键决策**: Hermes 不创造规则。Hermes 执行规则。

---

## Phase 4: Development Agents

**状态**: ✅ 完成

**核心产出**: AI 开发团队 — 十层协作 Agent。

```
L1  Chief Architect          方向 — Canon/ADR
L2  World Engineer           核心 — 模拟/NPC/经济
L3  Gameplay Engineer        玩法 — 功法/战斗/炼丹
L4  AI Engineer              AI — Prompt/Agent/Tool
L5  Infrastructure Engineer  地基 — Docker/DB/API/CI
L6  Frontend Engineer        界面 — Web/地图/HUD
L7  QA Agent                 质量 — 自动检测/Issue
L8  Lore Keeper              故事 — 历史/时间线一致
L9  Documentation Agent      文档 — 自动同步
L10 Release Manager          发布 — Dev→Test→RC→Prod
```

**关键决策**: 不是一个万能 Agent，而是一支协作团队。

### Phase 4.5: Engineering Governance

**状态**: ✅ 完成

**核心产出**: 治理宪法 — 12 章治理规则。

```
Governance Pyramid:  大道 > Bible > ADR > Architecture > Code > Runtime
PR Governance:       Feature Branch → PR → Review → Merge
Quality Gate:        6 项检查全部通过
Canon Governance:    唯一来源，任何 Agent 不得私自修改
10 Governance Principles: Canon高于代码 / ADR高于实现...
```

**关键决策**: 治理优先于开发。

## Phase 5: Autonomous Validation

**状态**: ✅ 完成

**核心产出**: 独立验证系统 — 拥有否决权。

```
12 层验证金字塔: Vision → Canon → Architecture → Code → Simulation
                  → Narrative → Balance → Regression → Performance → AI → Release
10 道 Release 门禁: 任何失败 → Veto → 拒绝发布
10000 Tick 模拟验证
Golden World 回归测试
```

**关键决策**: 验证系统独立于开发 Agent。拥有否决权。

---

## Phase 6: Persistent Universe

**状态**: ✅ 完成

**核心产出**: Persistent Universe Runtime — 世界持续运行的基础设施。

```
Runtime: Canon → Simulation → Persistent Runtime → Players
10 核心模块: Lifecycle / Scheduler / Persistence / Snapshot
              / EventLog / Replay / Recovery / Time / Shard / MultiWorld
8 原则: Persistent / Recoverable / Replayable / Scalable
         / Deterministic / Auditable / Upgradeable / Observable
```

**关键洞察**: Simulation 是 CPU。Runtime 是 Kernel。Narrative 是 Render。玩家连接到 Runtime。

## Phase 7: Software Engineering Training

**状态**: ✅ 完成

**核心产出**: 12 章 AI 软件工程能力训练。

```
Ch1-3:  理解代码库 + 编码规范 + 架构意识
Ch4-6:  实现训练(5级) + 测试训练(5种) + 调试训练(5步)
Ch7-9:  重构训练(4味) + 文档训练(5项) + Review(6维)
Ch10-12: 自我改进 + 工程指标 + DoD
```

**关键决策**: 目标不是生成代码，而是长期维护和演进。

## Phase 8: Autonomous Research

**状态**: ✅ 完成

**核心产出**: AI 自主发现→分析→实验→RFC 的完整闭环。

```
Discover → Analyze → Propose → Shadow World 实验 → RFC → 批准 → 实施 → 验证
```

**关键决策**: AI 不再等待需求。自己发现问题，自己提出方案。

## Phase 9: Self-Evolution

**状态**: ✅ 完成

**核心产出**: Hermes 自我演进——优化 Prompt/Memory/Agent/Tool/Workflow。

```
允许: 优化自身 (Prompt/Agent/Tool/Workflow)
禁止: 修改 Canon / 绕过 Governance / 绕过 Validation
```

**关键决策**: 自治不等于无政府。三条红线不可碰。

## Phase 10: AI Organization

**状态**: ✅ 完成

**核心产出**: 从十个 Agent 到一个 AI Software Company。

```
CEO → CTO → Architecture/Backend/Frontend
              /Gameplay/QA/Docs/Research/Release

Agent 生命周期: Hire → Upgrade → Split → Merge → Fire
```

**关键决策**: 团队可以自组织。Agent 数量从 10 到 100+。

---

## 路线图时间线

```
已完成  ███████████████████████████████  95%

Phase 1      ████  Celestial Bible
Phase 2      ████  Canon Registry
Phase 3      ████  World Training (8 Stage)
Phase 3.2    ████  World Simulation Training
Phase 3.3    ████  Narrative Intelligence
Phase 3.4    ████  Information Propagation
Phase 3.5    ████  World OS
Phase 4      ████  Development Agents (10 Layers)
Phase 4.5    ████  Engineering Governance
Phase 5      ████  Autonomous Validation
Phase 6      ████  Persistent Universe
Phase 7      ████  Software Engineering Training
Phase 8      ████  Autonomous Research
Phase 9      ████  Self-Evolution
Phase 10     ████  AI Organization
Phase 13     ████  Autonomous Development
Phase 14     ████  Autonomous Operation
Phase X      ████  Testing Agent / Game Director / Multiplayer

规划中  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 不变的原则

贯穿所有 Phase：

```
1. Canon First — Canon 永远优先于实现
2. 确定性 — 相同输入 → 相同输出
3. 涌现式 — 故事来自模拟，不是预设
4. 不可修改 — 历史只能追加
5. 不创造规则 — Hermes 执行规则，不创造规则
6. 可持续 — 设计时就考虑运行十年
```
