# ADR-0010: AI Civilization — 从个体到文明的跃迁

Date:       2026-07-23
Status:     Proposed
Author:     Architect

---

## Context

Phase 3 完成了 NPC 层面的智能：每个 NPC 有独立记忆、行为标签、因果关系。

但世界演化不止于个体。青云宗不是一个 NPC——它是一个有四百年历史、两千弟子、内部派系斗争、外部敌对关系的组织。如果只用"公孙烈"这个 NPC 的决策来代表青云宗，世界的深度就到此为止了。

Phase 4 需要让组织层面也拥有智能。

## Decision

建立 **Civilization Layer** —— 组织层面的人工智能。

### 四大支柱

1. **长期目标**: 每个组织有跨越数十到数百年的战略目标
2. **制度系统**: 规则和流程高于个人——掌门死了，制度继续运转
3. **继承机制**: 权力交接不是"换一个名字"，而是竞争、博弈、甚至内战
4. **集体决策**: 不是一个人说了算——长老会议、派系投票、少数派分裂

### 与 NPC 系统的关系

NPC 系统和 Civilization 系统是叠加关系，不是替代关系：

```
NPC Layer (Phase 3): 个体记忆、行为、关系
         +
Civilization Layer (Phase 4): 组织目标、制度、集体意志
         =
完整的社会模拟
```

同一个 NPC 有两个身份：
- 作为个体：陈玄，元婴境，恨青云宗
- 作为组织成员：散修盟盟主，需要为整个盟的发展负责

### 文明演化的四个层次

```
L1: 个体 NPC     — 记忆 → 行为 (Phase 3 已完成)
L2: 宗门/组织     — 制度 → 集体行为 (Phase 4 核心)
L3: 势力网络     — 联盟/敌对/贸易/战争 (Phase 4 扩展)
L4: 文明演化     — 技术进步/文化变迁/代际更替 (Phase 4~5)
```

### 时间尺度

Phase 3 关注的是天和周。Phase 4 关注的是年和世纪。

一个 NPC 的一生是故事的尺度。一个文明的演化是历史的尺度。

## Design

```
Civilization Engine (Plugin)
├── goal_system:     长期战略目标 + 子目标分解
├── institution:     制度规则（晋升/资源分配/纪律）
├── succession:      权力交接机制（世袭/禅让/选举/争夺）
├── collective:      集体决策（长老会议/投票/派系博弈）
└── cultural_memory: 组织记忆（历史事件→组织性格）
```

## Alternatives

| 方案 | 缺点 | 结果 |
|------|------|------|
| 把组织当作一个大 NPC | 没有内部政治、没有权力交接、没有制度演化 | Rejected |
| 组织 = 领导人 NPC 的延伸 | 换了领导就换了性格，不真实 | Rejected |
| 独立 Civilization Layer | 复杂度高 | Accepted |

## Consequences

- Faction Engine (Step 6) 从"简单决策"升级为"Civilization Engine"
- 每个组织新增：institution（制度）、cultural_memory（组织记忆）、power_structure（权力结构）
- 模拟时间尺度从"天"扩展到"世纪"
- 代际更替成为核心驱动力——NPC 会老、会死、会被替代，但组织存活
