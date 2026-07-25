# Project Celestial — Governance Constitution
#
# Phase 4.5: AI Software Engineering Governance
# 治理优先于开发。任何 Agent/代码/文档/规则必须遵守。

version: "1.0.0"
status: Canon — Highest Authority

---

# ==========================================================
# Governance Pyramid (第一章)
# ==========================================================

pyramid:

  layers:
    - level: 1
      name: "大道 (Project Vision)"
      description: "最高愿景。一切设计的出发点。"

    - level: 2
      name: "Celestial Bible"
      description: "世界法典。所有世界规则的唯一来源。"

    - level: 3
      name: "ADR"
      description: "架构决策。重大技术选择的不可变记录。"

    - level: 4
      name: "Architecture"
      description: "系统架构。模块划分和接口定义。"

    - level: 5
      name: "Code"
      description: "代码实现。架构的物化。"

    - level: 6
      name: "Runtime"
      description: "运行时行为。代码的执行结果。"

  rule: "任何下层不得违反上层"
  enforcement: "Canon Validator + Architecture Review"

# ==========================================================
# RFC Process (第二章)
# ==========================================================

rfc:

  trigger: "重大功能 (新 Engine / 新架构层 / 跨模块变更)"
  required_sections:
    - background: "为什么需要这个功能？"
    - goal: "要达到什么效果？"
    - design: "怎么实现？"
    - alternatives: "还考虑过什么方案？为什么不用？"
    - impact: "影响哪些模块？"
    - risk: "有什么风险？"

  gate: "未通过 RFC → 不得开始开发"
  review: "L1 Chief Architect + 受影响模块的 Owner"

# ==========================================================
# ADR Governance (第三章)
# ==========================================================

adr:

  trigger: "世界规则 / 架构 / DB / Engine / API 变更"
  status_flow: "Proposed → Review → Accepted → Canon"
  rule: "ADR 一经 Accepted → 成为 Canon → 不得私自修改"
  index: "Canon/ADR/ 维护完整索引"

# ==========================================================
# PR Governance (第四章)
# ==========================================================

pr:

  required_flow:
    - "Feature Branch (从 main 分叉)"
    - "开发 + 本地测试"
    - "提交 PR (模板: What/Why/How/Test/Validator)"
    - "自动检查: Canon Validator + Unit Test + Lint"
    - "Agent Review (相关 Layer Owner)"
    - "Architecture Review (L1 Chief Architect)"
    - "Merge (L10 Release Manager)"

  forbidden:
    - "直接提交 main 分支"
    - "未经 Review 的合并"
    - "自动检查失败的合并"

# ==========================================================
# Code Ownership (第五章)
# ==========================================================

ownership:

  canon_dir:
    owner: "L1 Chief Architect"
    scope: "Celestial Bible / Registry / ADR"

  engine_dir:
    owner: "L2 World Engineer"
    scope: "World OS / Simulation / NPC / Economy"

  gameplay_dir:
    owner: "L3 Gameplay Engineer"
    scope: "Plugin: 功法/战斗/炼丹/秘境"

  ai_dir:
    owner: "L4 AI Engineer"
    scope: "Prompt / Agent / Memory / Tool Calling"

  infrastructure_dir:
    owner: "L5 Infrastructure Engineer"
    scope: "Docker / DB / API / CI/CD"

  frontend_dir:
    owner: "L6 Frontend Engineer"
    scope: "Web UI / 地图 / HUD / GM面板"

  rule: "Owner 拥有最终 Review 权限"
  rule: "非 Owner 修改需要 Owner 审批"

# ==========================================================
# Quality Gate (第六章)
# ==========================================================

quality_gate:

  required_checks:
    - "Unit Test: 全部通过"
    - "Integration Test: Breakthrough/Tribulation/Death 管线通过"
    - "Simulation Test: 连续 100 Ticks 无异常"
    - "Canon Validator: 0 REJECT"
    - "Performance Test: 单 Tick < 1秒"
    - "Documentation Check: API Doc / CHANGELOG 已更新"

  rule: "任何检查失败 → 不得 Merge"

# ==========================================================
# Canon Governance (第七章)
# ==========================================================

canon_governance:

  rule: "任何 Agent 不得私自修改 Canon"
  process:
    - "Proposal (提交修改提案)"
    - "ADR (编写架构决策记录)"
    - "Review (L1 + 受影响模块 Owner)"
    - "Accept (批准)"
    - "Registry Update (更新编译后 Registry)"
    - "Release (纳入下一个版本)"

  principle: "Canon 永远只有一个来源"

# ==========================================================
# Release Governance (第八章)
# ==========================================================

release:

  process:
    - "Freeze: 代码冻结"
    - "Regression Test: 全量回归测试"
    - "Simulation: 1000 Ticks 模拟运行"
    - "Snapshot: 生成版本快照"
    - "Release Candidate: 部署 Staging"
    - "Production: 热更新到生产"

  rollback: "所有 Release 必须可回滚"

# ==========================================================
# Knowledge Governance (第九章)
# ==========================================================

knowledge:

  principle: "所有知识统一管理。不得重复维护。必须唯一来源。"

  domains:
    bible: "Celestial Bible — 世界规则的唯一来源"
    adr: "ADR — 架构决策的唯一来源"
    registry: "Registry — 数据的唯一来源"
    api: "SDK API Doc — 接口的唯一来源"
    architecture: "ARCHITECTURE.md — 系统架构的唯一来源"
    prompt: "Prompt Template — AI Prompt 的唯一来源"
    tutorial: "Training Curriculum — 培训的唯一来源"

# ==========================================================
# Agent Governance (第十章)
# ==========================================================

agent_governance:

  requirements:
    declare_role: "每个 Agent 必须声明 Layer 和角色"
    declare_capability: "每个 Agent 必须声明权限级别"
    declare_ability: "每个 Agent 必须声明 CAN DO"
    declare_responsibility: "每个 Agent 必须声明 CANNOT DO"

  forbidden:
    overstep: "QA Agent 不能修改 Canon"
    cross_merge: "Lore Agent 不能 Merge Code"
    bypass: "任何 Agent 不得绕过 Governance"

# ==========================================================
# Audit (第十一章)
# ==========================================================

audit:

  log:
    timestamp: "操作时间"
    agent: "执行 Agent"
    reason: "操作原因 (链接 ADR)"
    input: "操作输入"
    output: "操作输出"
    review: "审核者 + 审核结果"

  immutability: "所有操作日志 → 不可篡改开发历史"

# ==========================================================
# Governance Principles (第十二章)
# ==========================================================

principles:

  - id: 0
    text: "Simulation First — 先模拟，再叙事"
    meaning: "世界状态由模拟决定。剧情来自世界。AI 不即兴编造。"

  - id: -1
    text: "Distributed First — 先设计分布式架构，再写代码"
    meaning: "Never Code First. Never Think Local. Always Think Distributed."

  - id: 1
    text: "Canon 高于代码"
    meaning: "代码与 Canon 冲突 → 改代码"

  - id: 2
    text: "ADR 高于实现"
    meaning: "实现与 ADR 冲突 → 改实现"

  - id: 3
    text: "Review 高于 Merge"
    meaning: "未经 Review → 不得 Merge"

  - id: 4
    text: "Architecture 高于 Feature"
    meaning: "Feature 破坏架构 → 拒绝 Feature"

  - id: 5
    text: "Documentation 与代码同步"
    meaning: "代码变更 → 文档自动更新"

  - id: 6
    text: "Agent 必须最小权限"
    meaning: "能只读就不要给写入"

  - id: 7
    text: "Runtime 不得绕过 Governance"
    meaning: "热更新也必须走完整审批"

  - id: 8
    text: "历史必须可追溯"
    meaning: "每个决策可追溯到 ADR"

  - id: 9
    text: "所有修改必须可回滚"
    meaning: "每次发布有回滚方案"

  - id: 10
    text: "长期一致性高于短期效率"
    meaning: "不能为了赶进度牺牲 Canon"
