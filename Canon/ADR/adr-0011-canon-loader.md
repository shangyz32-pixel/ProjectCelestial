# ADR-0011: Canon Loader — 统一世界模型加载器

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

v1.0 Canon 由 61 个文件组成，包括 YAML Registry、Markdown Volume、ADR 决策记录。当前这些文件是"设计文档"——人类可读，但机器无法直接使用。

Phase 4 的第一步不是加新功能，而是让 Hermes 能够将 Canon 加载为一个统一、可查询、可验证的 World Model。

## Decision

建立 **Canon Loader** —— Canon 文件的解析、校验、索引和版本管理系统。

### 加载管线

```
Canon 文件 (61 files)
  → Parse (YAML + Markdown)
  → Cross-Validate (引用完整性 + 一致性)
  → Index (建立查询索引)
  → Build Model (统一 World Model)
  → Version Snapshot (保存版本快照)
  → Ready (Hermes 可查询)
```

### 解析策略

| 文件类型 | 解析方式 | 用途 |
|----------|----------|------|
| Registry YAML | 结构化解析 → 数据表 | 机器查询首选 |
| Engine Spec YAML | 结构化解析 → 规则引擎 | 管线执行 |
| Volume Markdown | 分段解析 → 知识图谱 | 人类阅读 + 语义检索 |
| ADR Markdown | 结构化解析 → 决策索引 | 决策追溯 |

### 交叉校验

加载后自动执行：

```
1. Registry 完整性:
   每个 Registry 条目中引用的概念必须在 Volume 中有定义

2. 引用完整性:
   任何文件引用的另一个文件必须存在
   (如 rule_engine.yaml 引用 registry/realms.yaml → 验证该文件存在)

3. 一致性:
   同一概念在不同文件中的定义不冲突
   (如 Volume III 的境界数量 = Registry/Realm.yaml 的条目数)

4. ADR 覆盖:
   每个 Phase 3 的 Stage 至少有一个 ADR
```

### 版本管理

```
每次加载生成版本快照:
  - canon_version: "1.0.0"
  - file_hashes: { file_path: sha256, ... }
  - parse_timestamp: "2026-07-23T..."
  - validation_result: { passed: true, warnings: [...], errors: [...] }
  - model_checksum: "整个 World Model 的哈希"

版本 diff:
  加载新版本时，生成 diff 报告:
    - 新增文件
    - 删除文件
    - 修改文件 (内容 diff)
    - 影响评估 (哪些 Engine 需要重新加载)
```

### 热更新

```
非破坏性更新流程:
  1. 加载新 Canon 版本到临时 Model
  2. 对新 Model 执行完整校验
  3. 校验通过 → 原子切换 (旧 Model → 新 Model)
  4. 通知受影响 Engine 重新加载规则
  5. 校验失败 → 保留旧 Model，返回错误

不中断世界运行。
不丢失当前世界状态。
```

## Design

```
Canon Loader
├── Parser Layer:    YAML + Markdown → 结构化数据
├── Validator Layer:  交叉引用 + 一致性 + 完整性
├── Indexer Layer:    全文搜索 + 语义索引
├── Model Builder:    构建统一 World Model
├── Version Manager:  版本快照 + diff + 回滚
└── Hot-Reload:       非破坏性更新
```

## Consequences

- Canon 从"文件集合"变为"可查询的 World Model"
- 版本 diff 使得"Canon 改了什么东西"从模糊变为精确
- 热更新使得 Canon 可以在世界运行时迭代
- 交叉校验防止 Canon 内部的引用断裂
- 这是 Phase 4 所有后续 Engine 的基础设施
