# Snapshot Specification
#
# 世界快照的契约定义。
# Replay / Debug / Rollback / Shadow World / Recovery 全部依赖。

version: "1.0.0"
status: Canon — Contract

---

snapshot:

  # ==========================================================
  # Types
  # ==========================================================

  types:
    full:
      description: "全量快照 — 完整 World State"
      frequency: "每个 Tick 自动生成"
      size: "约 250KB (当前规模) / 随世界增长"

    incremental:
      description: "增量快照 — 仅变更的 Entity"
      frequency: "Tick 内的事务提交时"
      based_on: "上一个 Full Snapshot"
      purpose: "减少存储 — 仅保存 diff"

    checkpoint:
      description: "长期保留的锚点快照"
      frequency: "每 1000 Tick"
      purpose: "Recovery 快速起点 + 历史存档"
      retention: "永久保留"

  # ==========================================================
  # Content
  # ==========================================================

  content:
    world_state: "完整 World State (见 WORLD_STATE_SPEC)"
    meta:
      snapshot_id: "string"
      tick: "int"
      timestamp: "WorldTime"
      canon_version: "string"
      engine_version: "string"
      seed: "int"
      parent_snapshot: "snapshot_id | null (if incremental)"

  # ==========================================================
  # GC (Garbage Collection)
  # ==========================================================

  gc:
    full_snapshots: "保留最近 100 个"
    incremental: "保留最近 1000 个"
    checkpoints: "永久保留"
    policy: "超过保留期的自动压缩或删除"

  # ==========================================================
  # Recovery
  # ==========================================================

  recovery:
    from_latest: "加载最新 Full Snapshot → 重放后续 Incremental → 到达最新状态"
    from_checkpoint: "加载 Checkpoint → 重放 Event Log → 到达目标 Tick"
    crash_recovery: "自动检测最新有效 Snapshot → 恢复 → 继续运行"

  # ==========================================================
  # Replay Anchor
  # ==========================================================

  replay:
    anchor: "任意 Full Snapshot 或 Checkpoint"
    process: "加载 Snapshot → 按 Event Log 重放到目标 Tick"
    validation: "重放结果与原始 Snapshot 对比 — checksum 一致"
    speed: "Shadow World 可 100x 加速重放"

  # ==========================================================
  # Shadow World
  # ==========================================================

  shadow:
    creation: "从生产 Snapshot 克隆"
    isolation: "Shadow 的修改不影响生产"
    validation: "在 Shadow 中运行实验 → 对比指标"
    cleanup: "实验结束后销毁"
