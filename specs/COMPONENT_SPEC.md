# Component Specification
#
# ECS 组件模型的基础契约。
# Runtime / Simulation / Network / Persistence 全部依赖。

version: "1.0.0"
status: Canon — Contract

---

component:

  # ==========================================================
  # Model
  # ==========================================================

  model:
    description: "ECS (Entity-Component-System) — Entity 是 ID，Component 是纯数据。"
    entity: "唯一 ID — 不含任何数据"
    component: "附加到 Entity 的数据块 — 单一职责"
    system: "处理拥有特定 Component 的 Entity 的逻辑"

  # ==========================================================
  # Component Registry
  # ==========================================================

  registry:
    Identity:
      fields: [name, type, created_at]
      description: "所有 Entity 必有"
    Realm:
      fields: [realm_id, cultivation_value, breakthrough_history]
      description: "NPC 修炼境界"
    SpiritRoot:
      fields: [quality_id, attribute_id, cultivation_multiplier]
      description: "NPC 灵根"
    Location:
      fields: [location_id, region_id, x, y]
      description: "实体位置"
    Inventory:
      fields: "Map<item_id, quantity>"
      description: "物品背包"
    Memory:
      fields: [short_term: List, long_term: List, active_tags: List]
      description: "NPC 记忆"
    HP:
      fields: [current, max, status]
      description: "生命值"
    FactionMember:
      fields: [faction_id, rank, contribution]
      description: "宗门成员"
    Owner:
      fields: [owner_id, acquired_at, acquisition_type]
      description: "物品所有权"
    Leader:
      fields: [faction_id, title, since]
      description: "势力领袖"

  # ==========================================================
  # Rules
  # ==========================================================

  rules:
    single_responsibility:
      rule: "每个 Component 只做一件事"
      example: "HP 只存血量。不与 Realm 合并。"

    composition:
      rule: "Entity 是 Component 的集合"
      example: "NPC = Identity + Realm + SpiritRoot + Location + Inventory + Memory + HP"

    add:
      rule: "运行时动态添加 Component"
      check: "Canon Validator 验证 Component 对该 Entity 类型合法"

    remove:
      rule: "运行时移除 Component"
      check: "不可移除 Identity"
      effect: "移除后该 Component 的数据消失"

    update:
      rule: "UpdateComponent(entity, component, value, expected_version)"
      check: "版本号匹配 + Validator 验证"
      effect: "版本号 +1"

    serialization:
      rule: "每个 Component 定义自己的序列化格式 (用于 Snapshot / Network)"
      format: "JSON (默认) 或 自定义二进制"

    network_sync:
      rule: "每个 Component 声明同步策略"
      options: ["full_sync (首次/重连)", "delta_sync (每Tick变更)", "no_sync (服务器专用)"]
      default: "full_sync + delta_sync"
