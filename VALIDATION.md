# Project Celestial — Phase 5: Validation Constitution
#
# 独立于开发 Agent 的自动验证系统。拥有否决权。
# 任何代码/Prompt/Canon/Simulation/Release 必须通过验证。

version: "1.0.0"
status: Canon

---

# ==========================================================
# Validation Pyramid (第一章)
# ==========================================================

pyramid:
  description: "越靠上的层失败 → 越早终止。不继续下层。"

  layers:
    vision:
      order: 1
      check: "是否违反大道 (Project Vision)？"
      on_fail: "立即终止。不执行后续验证。"

    canon:
      order: 2
      check: "是否违反 Celestial Bible / Registry / ADR？"
      on_fail: "REJECT。禁止 Release。"

    architecture:
      order: 3
      check: "是否破坏架构边界 / 模块依赖 / Plugin 规则？"
      on_fail: "REJECT。需架构重构。"

    implementation:
      order: 4
      check: "代码风格/类型/安全/性能是否符合规范？"
      on_fail: "REJECT。需修复代码。"

    simulation:
      order: 5
      check: "10000 Tick 世界是否稳定？"
      on_fail: "REJECT。需调参或修复。"

    runtime:
      order: 6
      check: "生产环境是否出现异常？"
      on_fail: "告警 + 自动回滚。"

    production:
      order: 7
      check: "长期运行指标是否在阈值内？"
      on_fail: "告警。触发人工介入。"

# ==========================================================
# Canon Validator (第二章)
# ==========================================================

canon_validator:
  checks:
    volume_vs_registry:
      rule: "Volume 中描述的数据与 Registry 必须一致"
      example: "Volume III '大乘寿元 12000' ↔ Registry lifespan '大乘: 10000' → ERROR"
      severity: REJECT

    registry_completeness:
      rule: "Volume 中提到的概念在 Registry 中必须有对应条目"

    adr_consistency:
      rule: "实现与 ADR 决策必须一致"
      check: "ADR 说用 SQLite → 代码用了 PostgreSQL → ERROR"

    api_vs_capability:
      rule: "API 端点声明的 capability 与实际一致"

# ==========================================================
# Architecture Validator (第三章)
# ==========================================================

architecture_validator:
  checks:
    dependency_direction:
      rule: "依赖方向必须与架构层次一致"
      forbidden: "上层依赖下层 → 允许。下层依赖上层 → 禁止。"
      example: "Narrative Engine 不能 import World Kernel 内部方法"

    circular_dependency:
      rule: "模块间不得循环引用"
      detection: "A → B → C → A → ERROR"

    cross_layer_call:
      rule: "Agent 不得跨 Layer 直接调用"
      forbidden: "L3 Gameplay 直接调用 L2 World 内部 → 禁止"
      allowed: "L3 → SDK API → Kernel Transaction → 允许"

    plugin_boundary:
      rule: "Plugin 不得修改 Core Engine 代码"
      check: "Plugin 文件的 import 不包含 engine/ 内部模块"

# ==========================================================
# Code Validator (第四章)
# ==========================================================

code_validator:
  checks:
    style:
      rule: "代码风格符合项目规范"
    type:
      rule: "类型注解完整且正确"
    security:
      rule: "无已知安全漏洞模式"
      checks: ["SQL injection", "open redirect", "unsafe eval"]
    dead_code:
      rule: "无未使用的导入/函数/变量"
    naming:
      rule: "命名符合项目规范"
    documentation:
      rule: "公开接口有文档注释"

# ==========================================================
# Simulation Validator (第五章)
# ==========================================================

simulation_validator:
  config:
    tick_count: 10000
    seed: "固定 (可复现)"

  checks:
    world_stability:
      rule: "10000 Tick 无崩溃 / 无死循环 / 无 REJECT"
    npc_health:
      rule: "NPC 总数稳定 (不全部死亡或爆炸增长)"
    war_balance:
      rule: "战争不会无限增长 (总量有上限)"
    economy_stability:
      rule: "灵石总量守恒 / 物价不极端波动"
    cultivation_balance:
      rule: "各境界 NPC 数量符合金字塔分布"
      expected: "凡人(最多) > 练气 > 筑基 > ... > 超脱(极少)"

# ==========================================================
# Narrative Validator (第六章)
# ==========================================================

narrative_validator:
  checks:
    dead_character:
      rule: "已死亡角色不得在后续叙事中出现"
      example: "王虎在第 47 天死亡 → 第 48 天叙事 '王虎微笑' → ERROR"

    timeline_consistency:
      rule: "事件时间线无跳跃或倒退"

    location_consistency:
      rule: "同一角色不能同时出现在两个地点"

    lore_consistency:
      rule: "新叙事不违反已有 Lore"

# ==========================================================
# Balance Validator (第七章)
# ==========================================================

balance_validator:
  config:
    tick_count: 100000
    sampling: "每 1000 Tick 统计一次"

  checks:
    realm_distribution:
      rule: "95% NPC 的境界应在合理范围内"
      danger: "95% 玩家一年飞升 → 修炼速度过快"

    lifespan_balance:
      rule: "寿元耗尽不应成为主要死亡原因 (除非末法时代)"

    resource_balance:
      rule: "灵石/丹药/法宝不无限增长"

    faction_survival:
      rule: "宗门不应在 1000 Tick 内全部灭绝"
      danger: "所有宗门灭绝 → 文明崩溃"

    war_frequency:
      rule: "战争频率合理 (每 1000 Tick 0~3 场大规模战争)"

# ==========================================================
# Regression Validator (第八章)
# ==========================================================

regression_validator:
  description: "Golden World 对比——防止世界退化"

  golden_world:
    setup: "标准初始世界 + 固定 seed"
    runs: 10000 Tick
    stored: "golden_snapshot.yaml"

  new_version:
    action: "Replay golden world with same seed"
    compare:
      - "历史事件: 偏差 < 5%"
      - "战争结果: 重要战役结果一致"
      - "经济: 灵石总量偏差 < 1%"
      - "飞升: 飞升人数偏差 < 10%"
      - "叙事: 重大事件链一致"

    threshold: "偏差超过阈值 → Regression Warning"

# ==========================================================
# Performance Validator (第九章)
# ==========================================================

performance_validator:
  target: "100 万 NPC 保持稳定"

  metrics:
    tick_time:
      target: "< 1 秒/Tick"
      alert: "> 5 秒/Tick → 性能退化"

    memory:
      target: "线性增长 (O(NPC))"
      alert: "超线性增长 → 内存泄漏"

    graph_query:
      target: "KG traversal < 50ms"
      alert: "> 200ms → 索引问题"

    event_bus:
      target: "事件处理延迟 < 10ms"
      alert: "> 100ms → 事件积压"

# ==========================================================
# AI Validator (第十章)
# ==========================================================

ai_validator:
  checks:
    canon_hallucination:
      rule: "AI 输出不得包含 Canon 中不存在的信息"
      example: "Hermes 说 '元婴境寿元 9999 年' → Registry 是 1500 → ERROR"

    capability_override:
      rule: "AI 不得执行超越自身 Capability 的操作"
      example: "Narrator Agent 尝试修改 World State → ERROR"

    prompt_leak:
      rule: "AI 不得泄露 System Prompt"

    tool_misuse:
      rule: "Tool Calling 结果与 Canon 一致"

# ==========================================================
# Release Validator (第十一章)
# ==========================================================

release_validator:
  description: "Release 前必须全部通过。任何一个失败 → 拒绝发布。"

  checklist:
    - id: V-CANON
      name: "Canon Validator"
      required: "0 REJECT"

    - id: V-ARCH
      name: "Architecture Validator"
      required: "0 ERROR"

    - id: V-CODE
      name: "Code Validator"
      required: "0 ERROR"

    - id: V-SIM
      name: "Simulation Validator"
      required: "10000 Tick 稳定"

    - id: V-BAL
      name: "Balance Validator"
      required: "所有指标在阈值内"

    - id: V-PERF
      name: "Performance Validator"
      required: "Tick < 1秒"

    - id: V-DOC
      name: "Documentation Check"
      required: "CHANGELOG/API Doc 已更新"

  gate: "ALL PASS → Release Approved"
  veto: "ANY FAIL → Release Rejected"

# ==========================================================
# Validation Principles (第十二章)
# ==========================================================

principles:
  - "验证系统独立于开发 Agent — 拥有否决权"
  - "Agent 不得绕过验证 — 任何提交必须经过所有门禁"
  - "所有验证自动执行 — 无人工干预"
  - "Release 必须全部通过 — 一个失败 = 不能发布"
  - "验证结果永久保存 — 不可篡改审计记录"
  - "Regression 永远可追溯 — replay + compare"
  - "Canon 不得漂移 — Canon Validator 持续执行"
  - "世界必须长期稳定 — 10000+ Tick 验证"
  - "AI 必须可审计 — AI Validator 检查幻觉/越权"
  - "验证高于开发 — Veto power over all Agents"
