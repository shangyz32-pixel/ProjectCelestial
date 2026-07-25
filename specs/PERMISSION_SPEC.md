# Permission Specification
#
# 统一权限模型。Capability + Policy 落地为正式契约。

version: "1.0.0"
status: Canon — Contract

---

permission:

  # ==========================================================
  # Architecture
  # ==========================================================

  flow: |
    Request → Policy Engine → Capability Check → Kernel API → Runtime

  # ==========================================================
  # Capability Levels
  # ==========================================================

  levels:
    L0_kernel:
      name: "Kernel"
      read: "全部"
      write: "全部"
      holders: ["World Kernel"]

    L1_admin:
      name: "Admin"
      read: "全部"
      write: "全部 (需 Policy 约束)"
      holders: ["Chief Architect", "Release Manager"]

    L2_master:
      name: "World Master"
      read: "全部"
      write: "势力范围"
      holders: ["World Engineer"]

    L3_sect:
      name: "Sect Master"
      read: "全部"
      write: "宗门内"
      holders: ["Gameplay Engineer"]

    L4_npc:
      name: "NPC"
      read: "感知范围"
      write: "self only"
      holders: ["NPC Engine", "Decision Engine"]

    L5_player:
      name: "Player"
      read: "感知范围"
      write: "self only"
      holders: ["Player Client"]

    L6_observer:
      name: "Observer"
      read: "全部(只读)"
      write: "none"
      holders: ["Narrative Engine", "QA Agent", "Lore Keeper"]

  # ==========================================================
  # Policy Rules
  # ==========================================================

  policies:

    time_policy:
      capability: "AdvanceTick"
      L0_kernel: "always allow"
      L1_admin: "allow (1x only in production)"
      others: "deny"

    economy_policy:
      capability: "UpdateComponent(economy)"
      rule: "每日价格波动 ≤ 5%"
      over_limit: "require L1 admin approval"

    ai_policy:
      capability: "CreateEntity / UpdateComponent"
      production: "require review (PR + Architecture Review)"
      shadow: "auto-approve"

    mod_policy:
      capability: "RegisterComponent"
      rule: "extend only — no override core components"

    npc_policy:
      capability: "MoveEntity(self)"
      rule: "不能瞬间移动 (speed ≤ max_speed × tick_duration)"
      check: "Validator: 距离/时间 合理性验证"

  # ==========================================================
  # Evaluation Algorithm
  # ==========================================================

  evaluate:
    inputs: ["agent_id", "capability_level", "operation", "target", "params", "context"]
    steps:
      - "1. Capability Check: level >= operation.required_level → 否则 DENY"
      - "2. Policy Check: 是否有适用的 Policy？→ 否则 ALLOW (默认)"
      - "3. Policy Evaluation: Allow / Deny / Review / Delay / Throttle / Sandbox"
      - "4. 如 Review: 生成 Review Request → 等待 L1 审批"
      - "5. 结果写入 Audit Log"

    audit:
      record: ["timestamp", "agent", "operation", "target", "result", "policy_applied", "reason"]
      retention: "永久"
