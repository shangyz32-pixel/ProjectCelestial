# Network Protocol Specification
#
# 多人同步的底层协议契约。
# Packet / RPC / Delta / Sync / Prediction / Rollback

version: "1.0.0"
status: Canon — Contract

---

network:

  # ==========================================================
  # RPC
  # ==========================================================

  rpc:
    format:
      request:
        rpc_id: "string (uuid)"
        method: "string"
        params: "object"
        client_time: "timestamp"
      response:
        rpc_id: "string"
        result: "object | null"
        error: "ErrorCode | null"
        server_tick: "int"

    reliability:
      critical: "TCP — 交易/战斗/任务 (at-most-once)"
      state_update: "UDP + ack — 位置/动画 (best-effort)"
      event: "Reliable UDP — 保证至少到达一次"

  # ==========================================================
  # Synchronization
  # ==========================================================

  sync:
    full_sync:
      trigger: "客户端首次连接 / 重连"
      data: "完整 World State (玩家可见范围)"
      compression: "delta + gzip"

    delta_sync:
      trigger: "每个 Tick"
      data: "自上次同步以来变更的 Entity Component"
      format: "entity_id -> { component: new_value }"

    tick_sync:
      description: "确定性模拟同步"
      mechanism: "服务器广播 input + seed → 客户端独立运行相同 Simulation"
      validation: "定期 checksum 对比 → 不一致 → full resync"

  # ==========================================================
  # Client Prediction
  # ==========================================================

  prediction:
    movement: "客户端立即移动 → 服务器验证 → 不一致时回滚"
    skill: "客户端播放动画 + 特效 → 服务器判定伤害 → 不一致时修正"

  # ==========================================================
  # Rollback
  # ==========================================================

  rollback:
    trigger: "服务器判定与客户端预测不一致"
    mechanism: "回到最后一个确认状态 → 重新应用正确状态"
    smoothing: "插值过渡 (0.1s) — 避免画面跳变"

  # ==========================================================
  # Version Compatibility
  # ==========================================================

  version:
    protocol_version: "semver (主版本.次版本)"
    check: "连接时 client 发送 protocol_version → 服务器验证兼容性"
    incompatible: "拒绝连接 + 提示更新"
