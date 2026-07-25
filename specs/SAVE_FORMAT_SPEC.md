# Save Format Specification
#
# 世界长期保存、升级、迁移和兼容的契约。

version: "1.0.0"
status: Canon — Contract

---

save_format:

  # ==========================================================
  # Format
  # ==========================================================

  format:
    container: "单文件 (.celestial) — 或目录结构 (开发/调试)"
    encoding: "二进制 (生产) / YAML (调试)"
    compression: "gzip (生产) / 无压缩 (调试)"

  # ==========================================================
  # Structure
  # ==========================================================

  structure:
    header:
      magic: "CELESTIAL_SAVE"
      format_version: "int (当前: 1)"
      canon_version: "semver"
      engine_version: "semver"
      created_tick: "int"
      created_timestamp: "WorldTime"
      seed: "int"
      checksum: "sha256"

    global_state:
      time: "WorldTime"
      weather: "Map<region, WeatherState>"
      qi: "Map<region, QiState>"
      economy: "PriceTable + ResourcePool"

    entities:
      npcs: "List<NPCSaveData>"
      factions: "List<FactionSaveData>"
      locations: "List<LocationSaveData>"
      items: "List<ItemSaveData>"

    knowledge_graph:
      nodes: "List<GraphNode>"
      edges: "List<GraphEdge>"

    event_log:
      events: "List<EventRecord> (追加 — 只增不删)"

  # ==========================================================
  # NPCSaveData
  # ==========================================================

  npc_save:
    id: "npc_id"
    components:
      identity: [name, type, created_at]
      realm: [realm_id, cultivation_value]
      spirit_root: [quality_id, attribute_id]
      location: [location_id, x, y]
      inventory: "Map<item_id, quantity>"
      memory:
        short_term: "List<MemoryEntry>"
        long_term: "List<MemoryEntry>"
        active_tags: "List<BehaviorTag>"
      hp: [current, max, status]
      faction: [faction_id, rank]

  # ==========================================================
  # Migration
  # ==========================================================

  migration:
    description: "Canon 更新 → 世界数据可能需要迁移"
    version_tracking: "header.canon_version + header.engine_version"
    process:
      - "1. 检测: 加载的 save 版本 < 当前版本 → 需要迁移"
      - "2. 查找: 对应的 Migration 脚本 (version N → N+1)"
      - "3. 执行: 逐版本迁移 (N→N+1→N+2→...)"
      - "4. 验证: 迁移后 Canon Validator 0 REJECT"
      - "5. 备份: 迁移前自动备份原始 save"
      - "6. 失败: 回滚到备份"

    migration_script:
      format: "Python function: migrate(save_data) -> save_data"
      must: "幂等 — 重复执行结果相同"
      must: "可测试 — 提供 sample save 验证"

  # ==========================================================
  # Compatibility
  # ==========================================================

  compatibility:
    forward: "新版本 Runtime 必须能读取旧版本 Save (通过 Migration)"
    backward: "不保证。旧 Runtime 不需要读取新 Save。"
    breaking_change: "format_version 增加 → 旧 Runtime 拒绝加载"
    non_breaking: "canon_version 增加 + Migration 可用 → 允许加载"
