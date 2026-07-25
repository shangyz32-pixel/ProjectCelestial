# ADR-0008: Canon Validator — 内容校验层

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

涌现式系统（Rule Engine + Memory + Narrative）会产生大量内容。这些内容由规则驱动，但规则之间可能产生矛盾。例如：

- NPC 记忆说"我在青云宗"，但 KG 显示该 NPC 的 MEMBER_OF 边已断开
- 叙事说"陈玄突破化神境"，但灵根上限是元婴境
- 事件序列说"张三先死后生"——时间线因果倒置

需要一个确定性校验层，在内容产出后、写入历史前，检查是否违反 Canon。

## Decision

**建立 Canon Validator，作为所有内容产出的必经关卡。**

### 强制原则

- 所有内容产出必须通过 Validator 才能写入历史或输出叙事
- 发现冲突时，修改产出内容，绝不修改 Canon
- Validator 本身是 Canon 的一部分（规则可演进，但必须通过 ADR）

### 校验域（6 域）

| 域 | 检查内容 | 数据来源 |
|----|---------|----------|
| 世界规则 | 物理/灵气/因果律不被违反 | volume1-2 + Registry |
| 修炼体系 | 境界/灵根/突破/天劫规则 | volume3 + Registry |
| 历史一致性 | 事件不矛盾、不覆盖 | History Engine + KG |
| 人物设定 | NPC 属性/行为/记忆一致性 | NPC memory + Registry |
| 时间线 | 事件顺序、因果关系可逆性 | Time Engine + causal_chain |
| 关系网络 | KG 边不自相矛盾 | Knowledge Graph |

### 错误级别

| 级别 | 含义 | 处理 |
|------|------|------|
| BLOCK | 严重违规，必须修正 | 自动回滚该事件，生成修正事件 |
| WARN | 可疑但不一定错 | 记录警告，允许通过但标记 |
| INFO | 边缘情况 | 仅记录，供未来 ADR 参考 |

### 在管线中的位置

```
Simulation Tick
  → Step 1-8: 子系统更新
  → Step 9: Events（生成事件+记忆+KG+叙事）
  → ╔══ Canon Validator ══╗  ← 新增
  → ║ Pre-check: 事件合法性 ║
  → ║ Post-check: 叙事一致性║
  → ╚══════════════════════╝
  → Step 10: History
  → Step 11: Snapshot
```

### 自动修复策略

当检测到冲突时：
1. 确定冲突的根本原因（哪个事件/哪个数据字段）
2. 撤回违规事件
3. 生成修正事件（标记为 validator_fix）
4. 重新通过管线
5. 如果修正后仍冲突 → BLOCK，暂停模拟，需人工介入

## Alternatives

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| 不校验 | 简单 | 内容质量无法保证 | Rejected |
| LLM 判断对错 | 灵活 | 幻觉风险、不一致 | Rejected |
| 人工审核 | 准确 | 不可扩展 | Rejected |
| 规则化自动校验 | 确定、可扩展 | 规则需要维护 | Accepted |

## Consequences

- 每个事件/每条叙事在被接受前都经过 6 域检查
- 违反 Canon 的内容无法进入历史
- Validator 规则本身可能随世界观扩展而更新（走 ADR 流程）
- 自动修复不能解决所有问题——极端情况需要暂停模拟
