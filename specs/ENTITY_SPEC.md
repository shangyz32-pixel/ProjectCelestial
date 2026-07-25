# Entity Specification
#
# 所有实体的契约定义。任何实现必须遵守。

version: "1.0.0"
status: Canon — Contract

---

entity:

  id:
    format: "{type_prefix}_{unique_id}"
    examples: ["npc_001", "faction_qingyun", "vein_main", "item_zhanxian"]
    rules:
      - "prefix 标识类型 (npc/faction/location/vein/item/event)"
      - "unique_id 在类型内唯一"
      - "ID 一旦分配，永不改变"

  lifecycle:
    states:
      - "active — 正常活跃"
      - "inactive — 暂时不可用 (如沉睡)"
      - "deceased — 已死亡 (NPC) / 已毁灭 (势力/地点)"
      - "archived — 已归档 (不可再操作)"
    rules:
      - "状态切换: active ↔ inactive, active → deceased → archived"
      - "deceased 不可回到 active (除非 Canon 定义的复活机制)"
      - "archived 不可变更"

  version:
    type: integer
    initial: 1
    increment: "每次 UpdateComponent 时 +1"
    purpose: "乐观锁 — 冲突检测"
    rule: "UpdateComponent 必须提供 expected_version，不匹配 → Reject"

  ownership:
    description: "每个 Entity 有明确的 Owner"
    rules:
      - "NPC: owned by self (npc_id)"
      - "Faction member: faction owns member record"
      - "Item: owner 是持有者"
    transfer: "TransferItem(from, to, item) — 原子操作"

  references:
    description: "Entity 引用其他 Entity"
    rules:
      - "引用使用 Entity ID"
      - "删除 Entity 前检查: 是否有 dangling reference"
      - "dangling → Reject 或级联标记"

  audit:
    description: "所有 Entity 变更记录在 Audit Trail"
    records: ["entity_id", "timestamp", "operation", "old_value", "new_value", "agent", "reason"]
