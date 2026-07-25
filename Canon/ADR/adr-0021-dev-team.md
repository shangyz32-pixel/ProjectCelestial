# ADR-0021: AI Development Team — 从单一 Agent 到协作团队

Date:       2026-07-23
Status:     Proposed
Author:     Architect (Chief)

---

## Context

Project Celestial 目前由单一 Agent（Architect/Hermes）完成所有工作：架构设计、代码编写、测试、审查。这在原型阶段可行，但不可扩展。

目标是建立一个 AI 开发团队，使 Project Celestial 能够持续开发、测试、维护和演进。**不是一个万能 Agent，而是一支协作团队。**

## Decision

**AI Development Team** — 分层协作的 Agent 团队架构。

### 团队结构（定义中）

```
Layer 1: Chief Architect   ← 本次定义
  职责: Canon 管理 / ADR 审核 / 架构决策

Layer 2: Developer Agent   ← 待定义
  职责: 实现 ADR 中的设计 / 编写代码 / 执行测试

Layer 3: Reviewer Agent    ← 待定义
  职责: 代码审查 / Canon 合规检查 / 安全审查

Layer 4: Operations Agent  ← 待定义
  职责: 持续运行 / 监控 / 问题响应
```

### 核心原则

```
1. 每层有明确边界。不越界。
2. 层间通过规范文档通信（ADR / Design Doc / Test Report）。
3. 所有产出可追溯到负责的 Agent。
4. Chief Architect 不写代码。Developer 不改 Canon。
```

## Consequences

- 项目从"一个人维护"变为"一个团队维护"
- 每个 Agent 的职责和边界文档化
- 新 Agent 可以通过 ADR 流程加入团队
- 当前 Architect 的角色被正式定义为 Layer 1
