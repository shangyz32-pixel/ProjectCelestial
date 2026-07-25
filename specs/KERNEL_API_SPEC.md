# Kernel API Specification
#
# 世界内核系统调用接口。
# 任何模块通过此接口操作 World State。

version: "1.0.0"
status: Canon — Contract

---

kernel_api:

  # ==========================================================
  # Read
  # ==========================================================

  read:

    GetEntity:
      params: "entity_id: string, expected_version: int|null"
      returns: "Entity | null"
      errors: ["ENTITY_NOT_FOUND", "VERSION_MISMATCH"]
      access: "L6 Observer+"

    QueryEntities:
      params: "type: string, filter: map, limit: int, offset: int"
      returns: "List<Entity>"
      errors: ["INVALID_FILTER"]
      access: "L6 Observer+"

    GetWorldTime:
      params: "none"
      returns: "WorldTime { tick, year, month, day, hour, season }"
      access: "L6 Observer+"

    GetRegionState:
      params: "region_id: string"
      returns: "RegionState { weather, qi, entities }"
      access: "L6 Observer+"

    QueryHistory:
      params: "filter: { from_tick, to_tick, entity_id, event_type }"
      returns: "List<EventRecord>"
      access: "L6 Observer+"

  # ==========================================================
  # Write
  # ==========================================================

  write:

    CreateEntity:
      params: "type: string, data: ComponentMap"
      returns: "Entity"
      errors: ["INVALID_TYPE", "VALIDATION_FAILED", "PERMISSION_DENIED"]
      transactional: true

    UpdateComponent:
      params: "entity_id: string, component: string, value: any, expected_version: int"
      returns: "Entity (updated)"
      errors: ["ENTITY_NOT_FOUND", "VERSION_MISMATCH", "VALIDATION_FAILED", "PERMISSION_DENIED"]
      transactional: true

    DeleteEntity:
      params: "entity_id: string"
      returns: "void"
      errors: ["ENTITY_NOT_FOUND", "HAS_DEPENDENTS", "PERMISSION_DENIED"]
      transactional: true
      rule: "标记 deceased/archived, 不物理删除"

    MoveEntity:
      params: "entity_id: string, target_location: string"
      returns: "void"
      errors: ["ENTITY_NOT_FOUND", "INVALID_LOCATION", "PATH_BLOCKED"]

    TransferItem:
      params: "from_id: string, to_id: string, item_id: string, quantity: int"
      returns: "void"
      errors: ["INSUFFICIENT_ITEMS", "ENTITY_NOT_FOUND"]
      transactional: true

  # ==========================================================
  # Transaction
  # ==========================================================

  transaction:

    BeginTransaction:
      params: "none"
      returns: "tx_id: string"
      access: "L4 NPC+"

    CommitTransaction:
      params: "tx_id: string"
      returns: "void"
      errors: ["TX_NOT_FOUND", "VALIDATION_FAILED", "CONCURRENT_MODIFICATION"]
      effects: "所有操作原子提交 + 事件发布 + 审计写入"

    RollbackTransaction:
      params: "tx_id: string"
      returns: "void"
      errors: ["TX_NOT_FOUND", "ALREADY_COMMITTED"]

  # ==========================================================
  # Snapshot
  # ==========================================================

  snapshot:

    TakeSnapshot:
      params: "label: string (optional)"
      returns: "snapshot_id: string"
      effects: "保存全量 World State + seed + versions"
      access: "L1 Admin+"

    Recover:
      params: "snapshot_id: string | 'latest'"
      returns: "void"
      effects: "恢复到指定快照"
      access: "L1 Admin+"

    Replay:
      params: "snapshot_id: string, target_tick: int|null"
      returns: "World State at target_tick"
      effects: "加载 Snapshot → 按 Event Log 重放到目标 Tick"
      access: "L1 Admin+"

  # ==========================================================
  # Event
  # ==========================================================

  event:

    PublishEvent:
      params: "event: EventRecord"
      returns: "void"
      effects: "写入 Event Log + 通知订阅者"
      rule: "通常在 CommitTransaction 中自动调用, 不单独使用"

  # ==========================================================
  # Simulation
  # ==========================================================

  simulation:

    AdvanceTick:
      params: "count: int (default=1)"
      returns: "tick_count: int"
      effects: "推进 N 个 Tick — 完整 Simulation Loop"
      access: "L1 Admin+"
      constraint: "Production 只能 count=1; Shadow 可 count>1"

    Pause:
      params: "none"
      returns: "void"
      access: "L1 Admin+"

    Resume:
      params: "none"
      returns: "void"
      access: "L1 Admin+"

  # ==========================================================
  # Error Codes
  # ==========================================================

  errors:
    ENTITY_NOT_FOUND: "实体不存在"
    VERSION_MISMATCH: "并发修改 — 请重试"
    VALIDATION_FAILED: "Canon/规则验证失败"
    PERMISSION_DENIED: "权限不足"
    INVALID_TYPE: "未知实体类型"
    INVALID_FILTER: "无效查询条件"
    INVALID_LOCATION: "无效位置"
    HAS_DEPENDENTS: "实体被其他实体引用"
    PATH_BLOCKED: "路径不可通行"
    INSUFFICIENT_ITEMS: "物品数量不足"
    TX_NOT_FOUND: "事务不存在"
    ALREADY_COMMITTED: "事务已提交"
    CONCURRENT_MODIFICATION: "并发修改冲突"
