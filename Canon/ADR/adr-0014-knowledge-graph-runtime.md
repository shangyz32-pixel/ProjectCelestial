# ADR-0014: Runtime Knowledge Graph — 统一世界图谱

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

knowledge_graph.yaml 定义了 6 节点 × 7 边的设计规范。但它是设计文档——不是运行时组件。

当前 KG 只在 Step 9 Events 阶段被动创建边。Engine 之间无法主动查询关系。例如：

- Economy Engine 想知道"青云宗的贸易伙伴是谁"→ 需要查 KG
- War Engine 想知道"谁控制黑风岭的灵脉"→ 需要查 KG
- NPC Engine 想知道"陈玄的仇人现在在哪"→ 需要查 KG

所有 Engine 需要一个共享的图查询层。

## Decision

**Runtime Knowledge Graph** —— 所有 Engine 共用的统一世界图谱。

### 核心原则

```
一个世界，一张图。
所有 Engine 查询同一张图。
图的修改通过 Kernel → Transaction。
图的查询对所有 Engine 开放（只读）。
```

### 节点类型

| 节点 | 说明 | 示例 |
|------|------|------|
| character | 人物 | 陈玄、王虎、赵灵儿 |
| faction | 组织 | 青云宗、散修盟、魔渊 |
| nation | 国家 | （当前世界暂无，预留） |
| location | 地点 | 青云峰、黑风岭、云来坊市 |
| spirit_vein | 灵脉 | 青云主脉、东海灵脉 |
| treasure | 法宝/物品 | 青冥剑、焚天诀、造化玉液 |
| event | 历史事件 | 林远之死、坊市相遇 |

### 关系类型

```
NPC ──belongs_to──→ 宗门
宗门 ──controls──→ 灵脉
灵脉 ──produces──→ 灵石
NPC ──owns──→ 法宝
宗门 ──hostile_to──→ 宗门
宗门 ──trades_with──→ 宗门
NPC ──saved──→ NPC
事件 ──caused_by──→ NPC/宗门
事件 ──led_to──→ 事件
```

### 查询 vs 修改

| 操作 | 谁可以做 | 如何做 |
|------|---------|--------|
| 查询图谱 | 所有 Engine（只读） | KG Query API |
| 添加节点 | Kernel → Transaction | on_entity_created |
| 添加边 | Kernel → Transaction | on_relation_changed |
| 标记删除 | Kernel → Transaction | on_entity_destroyed |

## Design

```
Runtime Knowledge Graph
├── graph_store:      内存图结构（邻接表）
├── query_engine:     图查询 API（遍历/邻居/路径）
├── index:            节点索引（按类型/名称/属性）
├── sync_engine:      与 World State 同步
└── cache:            常用查询结果缓存
```

## Consequences

- KG 从"被动边存储"变为"主动查询层"
- 所有 Engine 可以通过 KG 发现间接关系（如 "灵脉枯竭影响谁？"→ 灵脉→宗门→成员）
- 图查询 O(边) 替代了文件遍历 O(n)
- 图的修改仍然通过事务——保证一致性
