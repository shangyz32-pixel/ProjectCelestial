# Project Celestial

> 天道计划。一个由 AI 自主开发、运营和演化的修仙世界。

---

## 这是什么？

Project Celestial 不是一个游戏。它是一个**世界**。

这个世界由 Simulation Engine 持续运行——即使没有玩家在线。
NPC 有记忆、有关系、有目标。宗门会崛起和覆灭。灵脉会枯竭。文明会演化。
剧情不是脚本写的。剧情是模拟结果的自然涌现。

---

## 核心公理

```
Axiom 001: Simulation First
  先模拟，再叙事。世界状态由模拟决定。AI 不即兴编造。

Axiom 002: Distributed First
  先设计分布式架构，再写代码。Never Think Local。
```

[完整公理文档](SIMULATION_FIRST.md) · [分布式公理](AXIOM_002_DISTRIBUTED_FIRST.md)

---

## 架构

```
         Human → Project Vision → Project Consciousness
                        │
                  Governance (Policy Engine)
                        │
              World Kernel API (唯一数据入口)
                        │
           Persistent Universe Runtime (世界心跳)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   Simulation Engine            Narrative Engine
         │                             │
         └──────────────┬──────────────┘
                        ▼
                  World State
                        │
                     Players
```

[完整架构](ARCHITECTURE.md) · [World OS 宪章](WORLD_OS.md) · [治理宪法](GOVERNANCE.md)

---

## 路线图

```
Phase 1-3.5: 世界基础         ✅  圣经/Registry/训练/OS
Phase 4-5:   开发与验证        ✅  10层Agent/治理/自动验证
Phase 6:     持久宇宙Runtime   ✅  世界永不停机
Phase 7-10:  工程能力/自主演进  ✅  12章训练/研究/自进化/AI公司
Phase 13-14: 自主开发/运营     ✅  闭环开发+持续运营
Phase X:     测试/GameDir/多人  ✅  质量全维度覆盖

进度: 95% | 127 文件
```

[完整路线图](ROADMAP.md)

---

## 规范

所有实现的契约定义在 `/specs` 目录：

| 规范 | 内容 |
|------|------|
| ENTITY_SPEC | Entity ID/生命周期/Version/Ownership |
| EVENT_SPEC | Event 格式/溯源/Replay/Audit |
| TIME_SPEC | Tick/季节/纪元/确定性时钟 |
| WORLD_STATE_SPEC | World State 数据结构 |
| KERNEL_API_SPEC | 系统调用接口 |

---

## 开发指南

### 快速开始

1. 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) — 10 分钟理解全局
2. 阅读 [GOVERNANCE.md](GOVERNANCE.md) — 5 分钟理解规则
3. 找到你的 Layer — 查看 `/canon/` 中对应 Agent spec
4. 完成 [Training Curriculum](Canon/training_curriculum.yaml) — 4 阶段训练
5. 领取第一个 Task

### 参考资料

| 文档 | 用途 |
|------|------|
| [PHASE3_VERIFICATION.md](PHASE3_VERIFICATION.md) | Phase 3 验收报告 |
| [CHANGELOG.md](CHANGELOG.md) | 完整变更记录 |
| [VERSION.md](VERSION.md) | 版本声明与冻结规则 |
| [STRUCTURE.md](STRUCTURE.md) | 目录结构映射 |
| [VALIDATION.md](VALIDATION.md) | 验证系统宪法 |
| [NARRATIVE_ARCHITECTURE.md](NARRATIVE_ARCHITECTURE.md) | 叙事架构 |
| [PROJECT_CONSCIOUSNESS.md](PROJECT_CONSCIOUSNESS.md) | 项目智能层 |

---

## 治理

**任何修改必须走完整流程：**

```
Feature Branch → PR → Canon Validator → Agent Review → Architecture Review → Merge
```

**任何 Agent 不得：**
- 绕过 Kernel 直接修改 World State
- 修改 Canon 而不通过 ADR 流程
- 跳过 Quality Gate

[完整治理规则](GOVERNANCE.md)

---

## 贡献

Project Celestial 由十层 AI Agent 协作开发。

- [Chief Architect](Canon/chief_architect.yaml) — 架构决策
- [World Engineer](Canon/world_engineer.yaml) — 世界核心实现
- [Gameplay Engineer](Canon/gameplay_engineer.yaml) — 玩法系统
- [AI Engineer](Canon/ai_engineer.yaml) — AI 优化
- 查看全部: [Agent 规范](Canon/)

---

> Simulation 是 CPU。Runtime 是 Kernel。Narrative 是 Render。
> Hermes 不创造世界。Hermes 执行世界。
