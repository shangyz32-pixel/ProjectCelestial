# Engineering Axiom 002 — Distributed-First Engineering

> Never Code First. Always Design First.
> Never Think Local. Always Think Distributed.

---

## Principle

任何新增功能。必须首先思考整个分布式系统如何运行。
而不是本地代码如何实现。

## Design Order (不可跳过任何步骤)

```
1. Business Requirement     — 需求是什么？
2. Simulation Impact        — 是否影响 Canon/World State？
3. Server Authority         — 服务器负责什么？最终权威在哪？
4. Data Model               — 新 Entity/Component/Schema/Index/Migration
5. Persistence              — 哪些永久保存？哪些临时状态？
6. Network Protocol         — Client↔Server 消息/频率/可靠性
7. Synchronization          — 状态同步策略
8. Scalability              — 100/1000/10000 玩家？
9. Fault Tolerance          — 延迟/丢包/断线/崩溃/恢复
10. Client Experience       — 预测/插值/隐藏延迟
11. Implementation          — 最后才开始写代码
```

## Design Checklist

```
☐ 世界规则: 是否影响 Simulation/Canon/World State？
☐ 服务器:   哪些逻辑只由服务器计算？数据最终权威在哪？
☐ 数据模型: 新 Entity？新 Schema？如何迁移？
☐ 持久化:   哪些永久保存 (角色/装备/宗门/世界/日志)？
☐ 网络协议: C→S 消息？S→C 消息？频率？可靠/不可靠？
☐ 客户端:   哪些可预测？哪些等服务器？如何插值？
☐ 容错:     延迟/丢包/乱序/重启/崩溃 → 可恢复？
☐ 断线重连: 位置/技能/Buff/战斗/交易/任务/世界 → 恢复？
☐ 扩展十倍: 分区？分片？负载均衡？跨服？
☐ 最后:     开始写代码。
```

## Example: 九霄雷诀

```
不是: 立即写 Skill.cpp

而是:
  1. 服务器如何判定命中？
  2. 数据库如何保存技能等级？
  3. 协议如何广播技能释放？
  4. 客户端如何预测释放？
  5. 延迟如何补偿？
  6. 掉线后 Buff 如何恢复？
  7. 100 人同时释放会崩溃吗？

最后: 实现代码。
```

## Engineering Rule

```
Never Code First. Always Design First.
Never Think Local. Always Think Distributed.

AI 默认思维:
  不是 "这个函数怎么写？"
  而是 "这个系统如何在整个世界稳定运行？"

代码只是架构设计的最终实现。
不是设计的起点。
```

## 两条公理

```
Axiom 001: Simulation First  — 先模拟，再叙事
Axiom 002: Distributed First — 先设计分布式架构，再写代码
```
