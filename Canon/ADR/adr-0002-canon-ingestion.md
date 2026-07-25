# ADR-0002: Canon Ingestion System

Date:       2026-07-22
Status:     Accepted
Author:     Architect

---

## Context

Celestial Bible 已发展为五卷 + Registry 的大型文档体系。Hermes 需要一种结构化的方式查询 Canon，而不是依赖模型记忆或全文搜索。

## Decision

建立 canon/ 目录作为 Hermes 的 Canon Ingestion 入口：

```
canon/
├── volume1_universe.md
├── volume2_physics.md
├── volume3_cultivation.md
├── volume4_world_engine.md
├── volume5_universe_topology.md
├── registry/           ← 机器可读 YAML（优先）
├── adr/                ← 决策追溯
└── INDEX.md            ← 入口索引
```

查询优先级：Registry YAML > Volume Markdown > ADR 历史。

Hermes 回答世界相关问题 → 先查 Registry → 再查 Volume → 不依赖模型记忆。

## Alternatives Considered

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| 继续用 CelestialBible.md 全文 | 人类友好 | 不可查询、不可结构化 | Rejected |
| 只用 YAML | 机器最优 | 人类阅读困难 | Rejected |
| 双轨（YAML + MD） | 兼顾 | 维护成本略高 | Accepted |

## Consequences

### 正面
- Registry YAML 支持结构化查询
- Volume MD 保留人类可读性
- 防止 Hermes 凭模型记忆回答

### 代价
- 修改 Canon 时需要同时更新 Registry 和 Volume
- 需要维护两者一致性

### 关注
- 未来可考虑从 Registry 自动生成 Volume（或反之）
- Volume 文件可从 CelestialBible.md 对应章节提取

## Future

- Registry 和 Volume 的一致性需要定期校验
- 考虑加入 schema 验证 Registry YAML 格式
