# ADR-0015: Universal Entity Memory — 全实体记忆

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

Phase 3 Stage 4 实现了 NPC Memory——每个 NPC 有双层记忆。但这是 NPC-only 的设计。

世界中有其他实体同样需要记忆：
- 法宝：谁锻造的？历任主人是谁？在哪些战役中使用过？
- 宗门：创立于何时？经历过哪些危机？黄金时代是什么时候？
- 灵脉：何时被发现？何时开始衰减？谁曾争夺过它？

当前 memory_schema.yaml 的数据结构（memory_entry）可以复用——timestamp/type/title/narrative/importance/participants 这些字段对任何实体都适用。需要扩展的是记忆的归属和类型。

## Decision

**Universal Entity Memory** —— 将 NPC Memory 扩展为所有实体的通用记忆系统。

### 设计原则

```
所有实体都有记忆。
记忆格式统一（复用 memory_entry）。
根据实体类型附加不同的查询和聚合方式。
```

### 实体类型

| 实体 | 记忆内容 | 特殊查询 |
|------|---------|----------|
| character | 个人经历（已有） | 人生时间线 |
| treasure | 锻造/历任主人/见证事件 | 所有权链 |
| faction | 组织历史 | 重大事件年鉴 |
| spirit_vein | 发现/开采/争夺/枯竭 | 品质变迁史 |
| location | 建立/毁灭/归属变更 | 地点历史 |
| player | 同 character | 同 character |

### 统一入口

```
entity_memory(entity_type, entity_id)
  → 返回该实体的完整记忆（短期 + 长期）
  
所有实体使用同一套记忆数据结构和管线。
```

## Design

```
memory_schema.yaml (保持不变——memory_entry 通用)
  +
entity_memory.yaml (新增——实体类型扩展)
  ├── treasure_memory:  所有权链 + 事件见证
  ├── faction_memory:   组织年鉴
  ├── vein_memory:      灵脉生命周期
  └── location_memory:  地点历史
```

## Consequences

- memory_entry 数据结构无需修改——它已经是通用的
- 法宝不再只是"一件物品"，而是"一段历史"
- 宗门记忆与 civilization_engine 的 cultural_memory 统一
- 叙事引擎可以从法宝视角生成故事（"斩仙剑见证的三次大战"）
