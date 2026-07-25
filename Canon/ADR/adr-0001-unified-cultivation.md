# ADR-0001: 统一修炼体系

Date:       2026-07-22
Status:     Accepted
Author:     Architect

---

## Context

Celestial Bible Volume I（第六章）与 Volume III 存在 Canon 冲突：

| 项目 | Volume I | Volume III |
|------|----------|------------|
| 境界数 | 8（练气→大乘） | 16（凡人→超脱） |
| 灵根分类 | 6 种（废/凡/真/天/异/混沌） | 数量分类（单/双/三...） |
| 灵根可变性 | 不可变 | 可进化 |
| 寿元（大乘） | 10,000 年 | 30,000 年 |

两个 Volume 对同一概念有不同定义，违反 Don't Repeat Canon 原则。

## Decision

以 Volume III 为基础，建立统一 Canon：

1. 境界体系：16 级（凡人→超脱）
2. 灵根体系：品质（8 级）× 属性（14 种）二维模型
3. 灵根：可进化（极其困难），属性不可变
4. 寿元：重新平衡（合体 8,000 / 大乘 12,000 / 渡劫 20,000）
5. 突破五条件：灵气 + 资源 + 悟性 + 道心 + 机缘

所有核心定义迁移到 Canon/Registry/ YAML 文件作为唯一来源。

Volume I 修炼内容降级为引用。

## Alternatives Considered

| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| 以 Volume I 为准 | 保守，不改动 | 境界太少，灵根体系僵化 | Rejected |
| 以 Volume III 为准 | 更细致，扩展性强 | 需重构 Volume I | Accepted |
| 两者并存 | 不破坏现有 | 违反 Don't Repeat Canon | Rejected |

## Consequences

### 正面
- 灵根品质×属性体系支持无限角色组合
- 16 境界覆盖从凡人到超脱的完整修仙旅程
- Registry 单点定义消除版本漂移
- Don't Repeat Canon 原则正式确立

### 代价
- Volume I 需要修改（删除重复修炼定义）
- 已有的 6 灵根体系文档（Phase 3 Canon）需要标记为 Superseded

### 关注
- 灵根"可进化"规则需要 ADR 补充具体进化条件
- 真仙以上境界的寿元规则待后续 ADR 定义

## Future

- 如有新增境界 → 只需修改 Realm.yaml
- 如有新增灵根属性 → 只需修改 SpiritRoot.yaml
- 如有修炼规则变更 → 更新 Volume III + 对应 Registry
