# Project Celestial v1.0.0

> Architecture Freeze — 2026-07-23
>
> 139 个文件。21 个 ADR。16 个 Phase。
> 架构定义阶段完成。从今天起，这是稳定的 v1.0 Canon。

---

## 版本声明

```
版本号:   v1.0.0
代号:     Celestial Genesis
冻结日期: 2026-07-23
状态:     Released — Architecture Freeze

冻结 ≠ 不可修改。
冻结 = 任何修改必须通过 ADR 或 RFC，并兼顾兼容性。

包含:
  Phase 1-3.5:  世界基础
  Phase 4-5:    开发与验证
  Phase 6:      持久宇宙 Runtime
  Phase 7-10:   工程能力 + 自主演进
  Phase 13-14:  自主开发 + 持续运营
  Phase X:      测试/GameDir/多人
  Project Consciousness
  8 个 Contract Specs
```
```

---

## v1.0 包含什么

```
/docs           5 卷 Celestial Bible (Volume I~V)
/canon          8 个 Registry + INDEX.md
/engine         16 个 Engine Spec (Rule/KG/Memory/Narrative/Simulation/Validator/WorldOS)
/adr            10 个 ADR (0001~0010)
/world          4 个 NPC + 3 个演示文档
ROADMAP.md      完整路线图
ARCHITECTURE.md 系统架构
WORLD_OS.md     12 章宪章
CHANGELOG.md    变更记录 (本文档的详细列表)
```

---

## v1.0 的边界

以下内容属于 v1.0 Canon，冻结后修改必须走 ADR 流程：

- Celestial Bible (Volume I~V)
- Registry (8 YAML)
- Rule Engine (4 条管线)
- Knowledge Graph (6 节点 × 7 边)
- Memory System (双层 + 行为标签)
- Simulation Loop (11 步)
- Narrative System (Scene + Arc + Causal Chain)
- Canon Validator (6 域 28 规则)
- World OS (Kernel/Transaction/EventBus/Capability/Plugin/SDK)
- NPC 模板和示例数据

以下内容不属于 v1.0 Canon，可在后续 Phase 自由扩展：

- 具体 NPC 实例数据（陈玄/王虎/赵灵儿/李长风）
- 叙事演示输出（scene_001 / arc_001）
- Tick 走查演示
- 校验演示

---

## 修改规则

### 可以改（无需 ADR）

- 修复拼写错误
- 补充说明性注释
- 更新示例数据（不影响规则定义）

### 需要 ADR（补丁版本 v1.0.x）

- 新增 Registry 条目
- 调整规则参数（如突破成功率）
- 新增校验规则

### 需要 ADR + 社区讨论（次版本 v1.x.0）

- 新增管线（如新增一条 Rule Engine 管线）
- 新增架构层（如新增一个 World OS 组件）
- 修改 Event Bus 事件格式

### 禁止在 v1.x 中做（需主版本 v2.0.0）

- 修改 Celestial Bible 的核心设定
- 修改 Canon First 原则
- 修改 World OS 不可变原则
- 破坏性修改现有 Snapshot 格式

---

## 进入 Phase 4 的前提

三个检查：

```
✅ Canon 是否稳定？  → v1.0 已冻结
✅ 架构是否有边界？  → /engine 定义了所有接口
✅ 扩展是否可验证？  → 任何新功能可以回答三个问题：
                        符合 Canon？需要 ADR？影响 Engine？
```

---

## 签名

```
Architect — 2026-07-23
Project Celestial v1.0.0 — Architecture Freeze
```
