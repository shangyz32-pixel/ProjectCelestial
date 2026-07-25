# ADR-0013: Rule Engine Runtime — 确定性规则执行

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

rule_engine.yaml 定义了四条管线（breakthrough/tribulation/death/memory），但它是设计描述——描述了"应该检查什么""可能的结果是什么"。它不是可执行代码。

Hermes 需要一个 **Rule Engine Runtime**——将管线定义编译为可执行的判定逻辑。每次判定必须是确定性的：相同输入 → 相同输出。不允许 AI 自由发挥。

## Decision

**Rule Engine Runtime** —— 管线定义的确定性解释器。

### 核心原则

> Rule Engine 不允许 AI 自由发挥。
> 每一条规则都是确定的 if→then。
> AI 可以解释规则的结果，但不能修改规则本身。

### 执行模型

```
输入: (entity_state, action_type, world_context)
  ↓
加载对应管线 (如 breakthrough)
  ↓
按顺序执行每个 check:
  if condition_satisfied(entity, world):
    continue
  else:
    return FAILURE(reason)
  ↓
所有 check 通过:
  calculate_probability → roll → SUCCESS or FAILURE
  ↓
apply_consequences → 返回状态变更
```

### AI 的边界

| AI 可以做 | AI 不可以做 |
|-----------|------------|
| 解释 "突破失败，经脉受损三成" 的含义 | 决定突破是成功还是失败 |
| 将判定结果转换为叙事 | 修改突破成功率 |
| 为 NPC 生成"突破失败后的心理活动" | 跳过某个检查条件 |

判定是 Rule Engine 的职责。
叙事是 Narrative Engine 的职责。
两者不混淆。

### 与 Registry Compiler 的关系

Rule Engine Runtime 使用 compiled_registry 进行查询：

```
rule_engine 检查 "灵气是否充足"
  → 查询 compiled_registry.realms[target_realm_id].min_qi
  → 对比 location.qi_density
  → 返回 True/False
```

不直接读 YAML。不字符串匹配。

## Design

```
Rule Engine Runtime
├── pipeline_loader:    从 World Model 加载管线定义
├── condition_evaluator: 执行每个 check 条件
├── probability_calculator: 计算成功率（base + modifiers）
├── rng:                确定性随机（可设 seed）
├── consequence_applier: 应用成功/失败后果
└── trace_logger:        记录完整执行轨迹（可审计）
```

## Consequences

- Rule Engine 从"设计描述"变为"可执行判定器"
- 每次判定有完整的执行轨迹（trace），可审计、可回放
- AI 的角色从"判定者"收缩为"解释者"
- 与 Registry Compiler 配合，所有查询 O(1)
