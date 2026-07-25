# ADR-0012: Registry Compiler — 从设计文档到运行时数据

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

当前 8 个 Registry YAML 是人类可读的设计文档。例如：

```yaml
# Registry/Realm.yaml
realms:
  - name: "Core Formation"
    lifespan: 600
    breakthrough_rate: 0.1
```

Hermes 每次查询都需要解析 YAML、遍历列表、字符串匹配。这不是运行时数据——这是设计文档。

需要一个编译器，将 Registry 从"人读的设计文档"编译为"机器读的运行时数据"。

## Decision

**Registry Compiler** —— 将 Registry YAML 编译为运行时优化的结构化数据。

### 编译过程

```
Registry YAML (设计文档)
  → Parse → Validate → Normalize → ID化 → Index → Output
                                         (运行时数据)
```

### 核心转换

| 转换 | 之前（设计文档） | 之后（运行时） |
|------|-----------------|---------------|
| 名称 → ID | `"Core Formation"` | `realm_id: 3` |
| 关联 → 指针 | `"next realm is Nascent Soul"` | `next_realm_id: 4` |
| 字符串 → 枚举 | `"天灵根"` | `quality_id: 5` |
| 列表 → Map | `[{name: "雷劫"}, ...]` | `{1: {name: "雷劫"}, ...}` |
| 引用 → 外键 | `"see lifespan.yaml"` | `lifespan_data: inline` |

### 运行时查询对比

```
之前:
  Hermes 读取 Registry/Realm.yaml
  → 解析 YAML → 遍历列表 → 字符串匹配 "金丹境"
  → O(n) 查找

之后:
  Hermes 查询 compiled_registry.realms[3]
  → O(1) 直接索引
```

### Canon 不变

编译后的数据是 Canon 的派生品。Canon 本身（Registry YAML）保持不变。
编译过程是可重复的——任何时候从 Canon 重新编译，得到相同结果。

## Alternatives

| 方案 | 缺点 | 结果 |
|------|------|------|
| 运行时直接读 YAML | 慢、字符串匹配脆弱 | Rejected |
| 硬编码数据 | Canon 改了代码也要改 | Rejected |
| 编译为运行时数据 | 需要编译步骤 | Accepted |

## Consequences

- Registry YAML 继续作为 Canon 的唯一来源
- 编译产物是只读的运行时数据
- Canon 更新 → 重新编译 → 热加载（通过 Canon Loader 的热更新机制）
- 编译时校验可以发现 Registry 中的不一致（如循环引用）
