# Transaction Specification
#
# Runtime 的核心。事务与一致性保证。
# 大型分布式系统最复杂的部分。

version: "1.0.0"
status: Canon — Contract

---

transaction:

  # ==========================================================
  # Lifecycle
  # ==========================================================

  lifecycle: |
    BeginTransaction(tx)
        |
    [操作: CreateEntity / UpdateComponent / DeleteEntity / TransferItem]
        |
    CommitTransaction(tx) 或 RollbackTransaction(tx)
        |
    成功: 原子提交 + 事件发布 + 审计写入 + 同步
    失败: 全部回滚 + 无副作用

  # ==========================================================
  # ACID 保证
  # ==========================================================

  guarantees:
    atomicity:
      description: "事务内所有操作要么全部成功，要么全部失败"
      enforcement: "提交前所有操作仅在事务本地缓冲区"
      rollback: "丢弃缓冲区 — 对 World State 零影响"

    consistency:
      description: "事务前后 World State 必须满足所有 Invariants"
      enforcement: "提交前运行 Canon Validator (6 域检查)"
      on_fail: "自动 Rollback"

    isolation:
      description: "并发事务互不干扰"
      level: "Snapshot Isolation"
      mechanism: "每个事务看到的是事务开始时的 World State 快照"
      conflict: "两个事务修改同一 Entity → 后提交者 VERSION_MISMATCH → Rollback + Retry"

    durability:
      description: "提交的事务永久保存"
      enforcement: "Commit → 写入 Event Log → 更新 World State → 保存 Snapshot"

  # ==========================================================
  # Event Ordering
  # ==========================================================

  event_ordering:
    within_transaction:
      rule: "事务内操作按提交顺序生成 Event"
    across_transactions:
      rule: "按 Commit 时间戳排序"
    replay:
      rule: "Replay 严格按 Event Log 顺序重放"

  # ==========================================================
  # Nested Transactions
  # ==========================================================

  nesting:
    supported: false
    reason: "保持简单。嵌套事务增加复杂性但收效甚微。"
    alternative: "将复杂操作拆分为多个独立事务，通过 Saga 模式协调"

  # ==========================================================
  # Snapshot Timing
  # ==========================================================

  snapshot:
    frequency: "每个 Tick 结束后自动保存"
    inclusive: "包含该 Tick 所有已提交事务"
    anchor: "Snapshot 是 Replay 的起点"

  # ==========================================================
  # Concurrent Modify Detection
  # ==========================================================

  concurrency:
    mechanism: "乐观锁 (Optimistic Locking)"
    version_check: "UpdateComponent(entity, expected_version)"
    on_conflict: "返回 VERSION_MISMATCH → 调用者重新读取 + 重试"
    max_retries: 3
    on_max_retries: "返回 CONCURRENT_MODIFICATION → 需要人工介入"
