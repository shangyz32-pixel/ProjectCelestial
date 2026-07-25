# ADR-0018: Narrative Engine Runtime — 故事来自模拟

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

narrative_schema.yaml / narrative_arc.yaml / causal_chain.yaml 定义了叙事系统。但它们各自独立，缺乏一个统一的运行时引擎将它们整合。

Module 8 建立 Narrative Engine Runtime——将模拟事件流编译为可读的叙事输出。

## Decision

**Narrative Engine Runtime** —— 因果链的多视角叙事渲染器。

### 核心原则

> 故事不是脚本。故事是因果链的可视化。
> 叙事引擎不创造事件。叙事引擎叙述已经发生的因果关系。

### 管线

```
Simulation Events (Step 8)
  → Causal Chain Detection (causal_chain.yaml 编译后)
  → Arc Formation (narrative_arc.yaml 编译后)
  → Perspective Assignment (全知/NPC/玩家)
  → Scene Generation (narrative_schema.yaml scene_template)
  → Narrative Output (人类可读文本)
```

### 与其他模块的关系

| 模块 | 叙事引擎如何使用 |
|------|-----------------|
| Canon Loader | 查询世界观常量（灵气单位、时间纪元） |
| Registry Compiler | 查询境界名称（"金丹境"而非 "realm_id=3"） |
| KG Runtime | 查询关系链（"谁在和谁交战"） |
| Entity Memory | 提取 NPC 记忆→内心独白 |
| Decision Engine | 将 NPC 目标选择翻译为叙事动机 |

## Consequences

- 叙事引擎是模块栈的顶点——它使用所有其他模块的输出
- 同一组模拟事件，不同视角产生不同叙事
- 叙事可追溯——每句话可以追溯到具体的 event/memory/kg_edge
