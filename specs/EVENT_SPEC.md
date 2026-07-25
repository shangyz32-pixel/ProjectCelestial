# Event Specification
#
# 所有事件的契约定义。
# Replay / Audit / Simulation / Network 共享此规范。

version: "1.0.0"
status: Canon — Contract

---

event:

  schema:
    event_id: "全局唯一 ID (uuid 或 tick_event_index)"
    timestamp: "世界时间 (天历 YYYY-MM-DD HH:MM)"
    tick: "Tick 编号"
    type: "事件类型枚举"
    source: "触发源 (entity_id 或 system)"
    target: "受影响目标 (entity_id 或 null)"
    payload: "事件数据 (类型相关)"
    importance: "1-10 重要性评分"
    version: "Schema 版本"

  types:
    entity: [EntityCreated, EntityUpdated, EntityDeleted]
    npc: [NPCBorn, NPCMoved, NPCBreakthrough, NPCDied]
    faction: [FactionCreated, FactionDestroyed, WarDeclared, PeaceSigned]
    economy: [PriceChanged, TradeCompleted, ResourceDepleted]
    world: [SeasonChanged, WeatherChanged, QiChanged, DisasterOccurred]
    player: [PlayerJoined, PlayerAction, PlayerDisconnected]

  guarantees:
    immutable: "事件一旦写入 Event Log，不可修改"
    ordered: "事件按 timestamp + tick 排序"
    replayable: "Replay Engine 按事件序列重放 → 确定性重建世界"
    auditable: "每个事件可追溯到 Transaction 和 Agent"

  event_log:
    storage: "append-only log"
    retention: "永久保留"
    query: "按时间/类型/实体 查询"
    replay: "从 Snapshot + Event Log → 重放到任意时间点"
