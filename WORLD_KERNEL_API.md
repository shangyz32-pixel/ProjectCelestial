# World Kernel API
#
# The System Call Layer of Project Celestial.
# 整个世界唯一合法的数据访问入口。
# Never Touch World State Directly. Always Use World Kernel API.

version: "1.0.0"
status: Canon — Highest Authority

---

world_kernel_api:

  mission: >
    不是普通 API。是整个世界唯一合法的数据访问入口。
    任何模块不得直接修改 World State。必须通过 World Kernel API。

  # ==========================================================
  # Architecture
  # ==========================================================

  architecture: |
    AI Agents / Narrative / Simulation / Quest / Multiplayer / Economy / Plugins
                                    │
    ═══════════════════════════════════════════════════════════
                         World Kernel API
    ═══════════════════════════════════════════════════════════
                                    │
                    Persistent Universe Runtime
                                    │
                            World State

  core_principle: "Never Touch World State Directly. Always Use World Kernel API."

  # ==========================================================
  # Responsibilities
  # ==========================================================

  responsibilities:
    - "权限 — 谁可以做什么"
    - "事务 — 原子性操作"
    - "一致性 — 状态不矛盾"
    - "审计 — 所有变更可追踪"
    - "验证 — Canon/规则/权限检查"
    - "事件 — 状态变更自动生成 Domain Event"
    - "版本 — 乐观锁 + 并发控制"
    - "同步 — 自动复制到客户端/副本"

  # ==========================================================
  # Interfaces
  # ==========================================================

  read_interface:
    description: "统一读取接口"
    methods:
      - "GetEntity(id) -> Entity"
      - "GetNPC(id) -> NPC"
      - "GetFaction(id) -> Faction"
      - "GetQuest(id) -> Quest"
      - "GetInventory(id) -> Inventory"
      - "GetMarket() -> PriceTable"
      - "GetHistory(filter) -> Events"
      - "GetRegion(id) -> RegionState"
    access: "L6 Observer 及以上"

  write_interface:
    description: "统一写入接口"
    methods:
      - "CreateEntity(type, data) -> Entity"
      - "UpdateComponent(entity, component, value)"
      - "DeleteEntity(id)"
      - "MoveEntity(id, location)"
      - "TransferItem(from, to, item, quantity)"
      - "StartQuest(npc, quest_id)"
      - "FinishQuest(npc, quest_id)"
      - "StartWar(attacker, defender)"
      - "EndWar(war_id, result)"
    access: "需 Transaction + Capability Check"

  # ==========================================================
  # Layers
  # ==========================================================

  transaction:
    description: "多个操作组成原子事务"
    example:
      trade:
        steps: ["扣钱", "增加物品", "写日志", "广播"]
        guarantee: "全部成功 = Commit | 任一失败 = Rollback"

  event:
    description: "状态变更自动生成 Domain Event"
    examples:
      - "NPC 突破 -> EntityUpdated"
      - "宗门灭亡 -> FactionDestroyed"
      - "交易完成 -> TradeCompleted"
    effect: "事件自动进入 Event Log"

  validation:
    description: "修改前强制验证"
    checks:
      - "是否合法 (Canon Validator)"
      - "是否违反 Canon"
      - "是否违反 World Rule"
      - "是否违反权限 (Capability)"
    on_fail: "Reject + 返回原因"

  audit:
    description: "自动记录审计跟踪"
    records: ["Who", "When", "Why", "Old Value", "New Value"]
    guarantee: "不可篡改 Audit Trail"

  replication:
    description: "Commit 后自动同步"
    targets: ["客户端", "世界副本", "Shadow World", "Replay", "观察者"]
    guarantee: "无需业务代码自己同步"

  permission:
    description: "分模块权限控制"
    levels:
      simulation: "可修改 World State"
      narrative: "只读"
      quest: "只能修改 Quest 数据"
      mod: "沙盒权限"
      ai: "按 Role 授权"

  version:
    description: "并发控制"
    mechanism: "每个 Entity 拥有 Version"
    support: "乐观锁 / 冲突检测 / 并发修改保护"

  # ==========================================================
  # System Calls
  # ==========================================================

  system_calls:
    - "CreateEntity(type, data)"
    - "DeleteEntity(id)"
    - "UpdateComponent(entity, component, value)"
    - "CommitTransaction(tx)"
    - "RollbackTransaction(tx)"
    - "PublishEvent(event)"
    - "QueryHistory(filter)"
    - "Replay(snapshot_id, target_tick)"
    - "TakeSnapshot()"
    - "Recover(crash_point)"
    - "UpgradeWorld(from_version, to_version)"

  # ==========================================================
  # Engineering Rule
  # ==========================================================

  engineering_rule: |
    任何新系统:
      首先: 接入 Kernel API
      禁止: 直接访问数据库
      禁止: 直接修改内存
      禁止: 绕过 Kernel

  # ==========================================================
  # Definition of Done
  # ==========================================================

  definition_of_done:
    - "世界状态只有一个入口 — World Kernel API"
    - "所有修改可追踪 — Audit Trail"
    - "所有修改可验证 — Validation Layer"
    - "所有修改可回滚 — Transaction Rollback"
    - "所有修改自动同步 — Replication Layer"
    - "所有修改自动审计 — Audit Layer"
    - "Runtime 成为真正世界内核"
