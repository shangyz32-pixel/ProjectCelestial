# World State Specification
#
# 整个系统唯一的数据真相 (Single Source of Truth)。
# Simulation / Kernel / Network / Save / Replay 全部依赖此规范。

version: "1.0.0"
status: "Canon — Contract (最高优先级)"

---

world_state:

  # ==========================================================
  # Composition
  # ==========================================================

  composition:
    global_state:
      time: "WorldTime (tick, year, month, day, hour, season, era)"
      weather: "Map<region_id, WeatherState>"
      qi: "Map<region_id, QiState>"
      economy: "PriceTable + ResourcePool"
      wars: "List<ActiveWar>"

    entities:
      description: "所有实体的集合。按类型分区存储。"
      types:
        npc: "Map<npc_id, NPCState>"
        faction: "Map<faction_id, FactionState>"
        location: "Map<location_id, LocationState>"
        spirit_vein: "Map<vein_id, VeinState>"
        item: "Map<item_id, ItemState>"
        event: "Map<event_id, EventRecord>"
        player: "Map<player_id, PlayerState>"

    knowledge_graph:
      nodes: "Map<node_id, GraphNode>"
      edges: "Map<edge_id, GraphEdge>"

    meta:
      world_id: "string"
      canon_version: "semver"
      engine_version: "semver"
      created_at: "timestamp"
      tick_count: "integer"
      seed: "integer"

  # ==========================================================
  # Entity Model
  # ==========================================================

  entity:
    id:
      format: "{type_prefix}_{unique_id}"
      allocation: "单调递增，永不回收"
      rule: "ID 一旦分配，永不改变"

    components:
      description: "Entity 由 Component 组成 (ECS 模型)"
      schema: "Map<component_name, ComponentData>"
      examples:
        npc: "[Identity, Realm, SpiritRoot, Location, Inventory, Memory, ActiveTags, HP]"
        faction: "[Identity, Type, Population, Treasury, Leader, Members, Policies]"

    lifecycle:
      states: ["active", "inactive", "deceased", "archived"]
      transitions:
        - "active <-> inactive (暂停/恢复)"
        - "active -> deceased (死亡/毁灭)"
        - "deceased -> archived (归档)"
        - "deceased -> active: 禁止 (除非 Canon 定义的复活机制)"

    version:
      type: "integer, 从 1 开始"
      increment: "每次 UpdateComponent 成功时 +1"
      purpose: "乐观锁 — 并发修改检测"

  # ==========================================================
  # Invariants (永远不能违反)
  # ==========================================================

  invariants:
    - "I-01: Entity ID 唯一且永不改变"
    - "I-02: 同一 Entity 不能同时存在于两个地点"
    - "I-03: NPC 年龄 < 当前境界的寿元上限 (除非延寿)"
    - "I-04: 已故 Entity 不能发起主动行为"
    - "I-05: 资源总量 = 产出 - 消耗 (守恒)"
    - "I-06: 时间单调递增 (不可倒退)"
    - "I-07: Snapshot + Event Log = 可完整重现世界"
    - "I-08: KG 双向边必须对称 (ALLY_OF, SAVED 等)"
    - "I-09: Canon Version 不可降级"
    - "I-10: 任何状态变更可追溯到 Transaction 和 Agent"

  # ==========================================================
  # Chunk / Region
  # ==========================================================

  spatial:
    description: "世界按空间分区管理"
    chunk:
      size: "256×256 坐标单位"
      purpose: "空间索引 — 快速查找同区域 Entity"
    region:
      composition: "多个 Chunk"
      attributes: ["qi_density", "weather", "terrain", "owner_faction"]
    loading: "按需加载 Chunk — 不需要全量在内存"
