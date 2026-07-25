# ADR-0003: Rule Engine — Deterministic Canon Enforcement

Date:       2026-07-22
Status:     Accepted
Author:     Architect

---

## Context

当前 Canon Registry 定义了数据，但 World Engine 在执行突破、天劫、死亡等操作时没有确定性的规则检查机制。依赖 LLM 生成式判定 → 不一致、不可复现。

## Decision

建立 Rule Engine 作为 Canon 和 World Engine 之间的确定性执行层。

```
World Engine
    │
    ▼ 请求操作（突破/天劫/死亡）
Rule Engine
    │
    ├── ① 加载 Entity 状态
    ├── ② 加载 Canon Registry 规则
    ├── ③ 逐项检查前置条件 → { passed, failures }
    ├── ④ 计算成功率（base × modifiers）
    ├── ⑤ 确定性随机判定（可复现 seed）
    ├── ⑥ 应用后果（state_changes + events）
    └── ⑦ 写入 History Engine
```

核心原则：同一输入 → 同一输出。不是生成式的，是确定性的。

## Alternatives Considered

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| LLM 生成式判定 | 灵活 | 不一致、不可复现 | Rejected |
| 硬编码规则 | 确定性 | 维护成本高 | Accepted |
| 混合（规则+LLM） | 两者兼顾 | 复杂度高 | Future |

## Consequences

### 正面
- 突破、天劫、死亡全部可复现
- Canon 一致性由规则引擎保证
- 规则与 Registry 不匹配 → 拒绝执行

### 代价
- 规则需要与 Registry 保持同步
- 初期需要定义三大管线（突破/天劫/死亡）

## Future

- 扩展更多管线：交易、战斗、宗门决策
- 规则 schema 自动校验 Registry 一致性
