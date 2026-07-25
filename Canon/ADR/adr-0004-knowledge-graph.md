# ADR-0004: Knowledge Graph — Graph-First World Queries

Date:       2026-07-22
Status:     Accepted
Author:     Architect

---

## Context

当前世界查询依赖全文搜索或 Registry 单点查询。无法回答关系型问题（"张三的师父是谁""青云宗和谁结盟"），效率低且不准确。

Phase 2 World OS Layer 7 定义了 Knowledge Graph 概念，现需实现。

## Decision

建立 Knowledge Graph 作为世界关系网络的底层存储。

所有 Entity（人物/宗门/灵脉/法宝/秘境/事件）都是图节点。所有关系都是类型化边。

查询优先级：图查询 > Registry YAML > Volume MD > 模型记忆。

## Design

- 6 种节点类型：character / faction / location / spirit_vein / item / event
- 7 类关系边：social / faction / location / cultivation / karma / resource / event
- 双向维护：A SAVED B → B 也记录被 A 救了
- 历史不可删：节点标记 [deceased] 但边保留

## Alternatives

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| 关系存 JSON | 简单 | 不可查询、无法遍历 | Rejected |
| SQL 关系表 | 可 JOIN | 深层关系查询复杂 | Rejected |
| Graph | 自然表达关系、O(边)查询 | 需要图引擎 | Accepted |

## Consequences

- 关系型查询从 O(n 文件) 降低到 O(边)
- 所有内容生成后必须更新图
- 图与 Registry 一致性需定期校验
