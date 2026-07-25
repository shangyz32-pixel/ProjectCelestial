# ADR-0005: NPC Memory — 双层记忆与行为驱动

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

World OS Layer 6 定义了 Memory 层，但尚未实现。当前系统可以回答"张三是什么境界"，但无法回答"张三为什么恨李四"或"张三上次突破失败后改变了什么策略"。

NPC 行为目前是空白——Rule Engine 只管突破/天劫/死亡，不管"日常行为决策"。

需要为每个 NPC 构建独立记忆系统，让记忆驱动一致行为。

## Decision

为每个 NPC 建立独立的双层记忆系统。

### 双层结构

| 层 | 范围 | 容量 | 用途 |
|----|------|------|------|
| 短期记忆 | 最近 30 世界日 | 无上限（时间窗口） | 当前行为决策 |
| 长期记忆 | 重要性 ≥ 5 的事件 | 理论无上限 | 人格一致性 |

### 重要性评分（1-10）

| 分数 | 标准 | 示例 |
|------|------|------|
| 10 | 改变人生轨迹 | 灵根被废、宗门覆灭、道侣死亡 |
| 8-9 | 重大转折 | 被逐出师门、获得上古传承 |
| 6-7 | 重要事件 | 突破成功/失败、结仇、收徒 |
| 4-5 | 有意义 | 获得稀有物品、结识重要人物 |
| 1-3 | 琐事 | 日常交易、普通战斗 |

≥5 自动晋升长期记忆。短期记忆过 30 天后丢弃（除非晋升）。

### 行为驱动模型

记忆不直接生成行为。记忆提供 `behavior_tags`，Rule Engine 根据标签决定行为。

```
记忆 → behavior_tags → 当前场景匹配 → Rule Engine 选择行为
```

行为标签示例：
- HOSTILE_TOWARD:<target> — 敌对倾向
- GRATEFUL_TOWARD:<target> — 感恩倾向  
- FEARFUL_OF:<target> — 恐惧回避
- TRUSTS:<target> — 信任倾向
- SEEKS:<goal> — 追求目标
- AVOIDS:<location> — 回避地点

### 存储格式

每个 NPC 一个 YAML 文件，与 Registry 风格一致。

路径：`world/npcs/<npc_id>/memory.yaml`

### KG 同步规则

记忆事件涉及人际关系时，自动触发 Knowledge Graph 边创建：

| 记忆事件 | KG 边 |
|----------|-------|
| "被张三背叛" | BETRAYED 边（双向） |
| "李四救命之恩" | SAVED 边（双向） |
| "王五杀我徒弟" | KILLED 边 + HOSTILE_TO 边 |

KG = 当前关系状态。Memory = 关系如何形成。

## Design

```
npc_memory/
├── memory_schema.yaml        ← 数据结构定义（Registry 级）
├── npcs/
│   ├── npc_template.yaml     ← 模板
│   ├── npc_001/
│   │   └── memory.yaml       ← NPC 实例记忆
│   └── ...
└── memory_pipeline.yaml      ← 记忆管线（Rule Engine 扩展）
```

## Alternatives

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| LLM 自由生成行为 | 灵活 | 不一致、无法复现、违反 Canon 原则 | Rejected |
| 单一记忆池 | 简单 | 无法区分重要事件、存储膨胀 | Rejected |
| 向量数据库 (RAG) | 语义检索 | 过度工程、不可调试、不透明 | Rejected |
| 规则化双层记忆 | 确定性、可调试、可复现 | 需要定义规则 | Accepted |

## Consequences

- NPC 行为从"空白"变为"规则驱动"
- 每个 NPC 需要一个 memory.yaml 文件（新 NPC 从模板复制）
- 重要性评分规则需要持续调优
- 行为标签体系需要随 NPC 行为复杂度增长
