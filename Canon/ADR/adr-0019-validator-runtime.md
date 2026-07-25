# ADR-0019: Canon Validator Runtime — 内容生成的硬关卡

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

canon_validator.yaml (Phase 3 Stage 8) 定义了 6 域 28 条校验规则。但它是设计文档——规则是文本描述，不是可执行代码。

Module 9 将校验规则编译为运行时硬关卡。使用 compiled_registry 和 KG Runtime 进行 O(1) 校验。在任何内容生成前执行。违规 → 拒绝。

## Decision

**Canon Validator Runtime** — 内容生成的最终关卡。

### 升级

| 之前 (Phase 3) | 之后 (Phase 4 Module 9) |
|----------------|------------------------|
| 规则是文本描述 | 规则编译为可执行函数 |
| 校验时读 YAML | 使用 compiled_registry O(1) |
| 在 Step 9 之后执行 | 在 Step 8 生成事件前 AND 叙事输出前 双重关卡 |
| 手动触发 | 自动触发——不可跳过 |

### 双重关卡

```
Gate 1 (Pre-Generation): Step 8 生成事件前
  → 检查事件是否符合世界规则/修炼体系/时间线

Gate 2 (Post-Generation): 叙事输出前
  → 检查叙事是否符合人物设定/世界状态/KG关系
```

### 拒绝 vs 警告

| 之前 | 之后 |
|------|------|
| BLOCK = 阻止写入 | REJECT = 拒绝生成, 返回原因 |
| WARN = 标记但通过 | WARN = 允许生成, 但标记 [disputed] |
| INFO = 仅记录 | INFO = 仅记录 |

## Consequences

- 违规内容根本无法生成——不是标记后放行
- 使用编译后数据 → 校验在微秒级完成
- 双重关卡覆盖了"事件生成"和"叙事输出"两个阶段
- 与 Phase 3 的 canon_validator.yaml 保持向后兼容（规则定义不变）
