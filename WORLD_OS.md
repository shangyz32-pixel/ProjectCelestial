# World OS — 世界操作系统宪章

> Celestial 不只是一个 AI 修仙世界。
> 它是一个可长期运行的世界操作系统。
>
> 任何 AI、玩家、开发者或工具，都只能通过 World OS 与世界交互。
> 任何对象不得直接修改世界状态。

version: "1.0.0"
status: Canon
ratified: 2026-07-23

---

## 十二不可变原则

```
1.  Canon 是唯一真相。
2.  Kernel 是唯一状态管理者。
3.  所有修改必须经过事务。
4.  所有 Engine 必须事件驱动。
5.  世界状态必须可重放。
6.  历史不可覆盖。
7.  插件不得修改 Kernel。
8.  AI 不得绕过 Canon。
9.  玩家不是管理员。
10. 世界必须可以持续运行数年而保持一致性。
```

---

# 第一章：World Kernel（世界内核）

World Kernel 是整个世界的唯一核心。

## 职责

| 职责 | 说明 | 实现 |
|------|------|------|
| Tick 调度 | 按 11 步循环推进世界 | simulation_loop.yaml → Kernel Scheduler |
| Engine 调度 | 按顺序调用各 Engine | Kernel → Engine Registry |
| Event Bus | 收集和分发事件 | Kernel → Event Bus |
| Canon 校验 | 所有产出必须通过 Validator | Kernel → canon_validator.yaml |
| Snapshot 保存 | 每个 Tick 保存全量快照 | Kernel → Snapshotter |
| World State 管理 | 唯一读写 World State 的组件 | Kernel → State Manager |

## 铁律

> Kernel 是唯一允许修改 World State 的组件。
> 任何 Engine / Plugin / Agent 不得直接修改 World State。
> 所有修改必须通过 Kernel API → Transaction。

---

# 第二章：World State（世界状态）

所有世界数据统一保存在 World State。

## 数据域

| 域 | 内容 | 存储 |
|----|------|------|
| time | 当前世界时间 | world_state.time |
| geography | 世界地图、地点、灵气分布 | world_state.locations |
| spirit_veins | 灵脉位置、品质、产出 | world_state.spirit_veins |
| npcs | 所有 NPC 的完整状态（含记忆） | world_state.npcs |
| players | 玩家状态 | world_state.players |
| factions | 宗门、国家、组织 | world_state.factions |
| beasts | 妖兽种群 | world_state.beasts |
| economy | 市场价格、资源库存 | world_state.economy |
| wars | 进行中的战争 | world_state.wars |
| history | 不可修改的历史记录 | world_state.history (append-only) |

## 访问规则

```
读：任何 Engine 可以读取当前 State（只读引用）
写：必须通过 Kernel → Transaction
历史：只允许追加，不允许修改
```

---

# 第三章：World Transaction（世界事务）

所有改变世界的行为都必须经过事务。

## 事务流程

```
Create Transaction
  ├── 声明：要修改什么（target） + 新值（value） + 原因（reason）
  ↓
Validate
  ├── 权限检查：调用者是否有权修改此数据？
  ├── 规则检查：修改是否符合 Canon？
  ├── 一致性检查：修改是否会导致状态矛盾？
  ↓
Execute
  ├── 修改 World State
  ├── 记录变更 diff
  ↓
Generate Events
  ├── 根据变更生成事件
  ├── 发布到 Event Bus
  ↓
Save Snapshot
  ├── 保存变更后的 World State 快照
  ↓
Commit
  └── 事务完成，不可回滚
```

## 失败处理

```
任意步骤失败 → Rollback
  ├── 恢复 World State 到事务前快照
  ├── 丢弃所有已生成事件
  └── 返回错误信息
```

## 事务示例

```
# 正确
Transaction:
  target: npc_001.money
  old_value: 1000
  new_value: 500
  reason: "在坊市购买火灵芝 × 3"
  initiator: npc_001
  capability: npc

World State 始终保持一致。

# 错误（禁止）
npc_001.money = 500  # 直接赋值 → 被 Kernel 拒绝
```

---

# 第四章：Event Bus（事件总线）

所有系统通过事件通信。禁止直接调用其它 Engine。

## 事件类型

| 事件 | 发布者 | 订阅者 |
|------|--------|--------|
| TickStarted | Kernel | 所有 Engine |
| WeatherChanged | Weather Engine | Economy, NPC, Ecology |
| QiChanged | Qi Engine | NPC, Ecology |
| NPCLocationChanged | NPC Engine | Faction, War |
| EncounterDetected | NPC Engine | Memory, Narrative |
| ResourcePriceChanged | Economy Engine | Faction, NPC |
| WarDeclared | War Engine | Faction, Economy, NPC |
| EventGenerated | Event Bus | Memory, KG, Narrative, Validator |
| TickCompleted | Kernel | Snapshotter, History |

## 规则

- Engine 之间不直接调用。
- Engine 只能通过 Event Bus 获取其他 Engine 的状态变更。
- 每个事件携带：type, timestamp, source_engine, payload。
- 订阅者可以选择订阅特定事件类型或全部事件。

---

# 第五章：Plugin System（插件系统）

任何新功能必须通过插件实现。不得修改 Kernel。

## 插件可以做什么

```
注册 Engine      → 新增模拟引擎（如拍卖行引擎）
注册 Event       → 新增事件类型（如 AuctionStarted）
注册 Command     → 新增可执行命令（如 /bid）
注册 API         → 新增对外接口（如 getAuctionList）
```

## 插件不能做什么

```
修改 Kernel       ❌
绕过 Transaction  ❌
直接修改 State    ❌
提升自身权限      ❌
读取其他插件私密数据 ❌
```

## 插件清单

```
基础插件（Kernel 内置）:
  - WeatherEngine   - EconomyEngine
  - QiEngine        - WarEngine
  - EcologyEngine   - HistoryEngine
  - NPCEngine       - Snapshotter
  - FactionEngine

可扩展插件（第三方）:
  - AlchemyPlugin   - 炼丹系统
  - FormationPlugin - 阵法系统
  - AuctionPlugin   - 拍卖行
  - GuildPlugin     - 公会系统
  - KingdomPlugin   - 国家系统
  - OceanPlugin     - 海洋探索
  - TournamentPlugin- 比武大会
```

---

# 第六章：Capability（能力模型）

不同角色拥有不同权限。权限通过 Capability 控制。

## 权限层级

| 级别 | 角色 | 读取 | 写入(自己) | 写入(他人) | 世界管理 | 启动/停止 |
|------|------|------|-----------|-----------|---------|----------|
| L0 | Kernel | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ | ✅ |
| L1 | Admin | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ | ✅ |
| L2 | WorldMaster | ✅ 全部 | ✅ 全部 | 仅限势力内 | ✅ | ❌ |
| L3 | SectMaster | ✅ 全部 | ✅ 全部 | 仅限宗门内 | ❌ | ❌ |
| L4 | NPC | 感知范围内 | ✅ | ❌ | ❌ | ❌ |
| L5 | Player | 感知范围内 | ✅ | ❌ | ❌ | ❌ |
| L6 | Observer | ✅ 全部(只读) | ❌ | ❌ | ❌ | ❌ |

## Capability 检查

```
每次操作前:
  1. 获取调用者的 Capability Level
  2. 检查操作所需的最低 Level
  3. 不满足 → 拒绝操作，返回错误
  4. 满足 → 继续执行

Hermes 默认: L0 (Kernel) — 拥有完整权限
Narrator Agent: L6 (Observer) — 只能读取
NPC Agent: L4 (NPC) — 只能操作自己
```

---

# 第七章：Developer SDK

SDK 提供统一接口。开发者不得直接访问数据库。

## API 分层

```
World Query API:
  - getWorldTime()         → 当前世界时间
  - getNPC(npc_id)         → NPC 完整状态
  - getFaction(faction_id) → 势力信息
  - getLocation(loc_id)    → 地点信息
  - getPriceTable()        → 市场价格
  - getHistory(from, to)   → 历史事件

World Action API:
  - createTransaction(target, value, reason) → 创建事务
  - moveNPC(npc_id, location)               → 移动 NPC
  - cultivate(npc_id, duration)              → 修炼

History API:
  - queryEvents(filter)    → 查询历史事件
  - getCausalChain(event)  → 查询因果链

Canon API:
  - getRealmInfo(realm)    → 境界数据
  - getSpiritRootInfo(root)→ 灵根数据
  - getDaoInfo(dao)        → 大道数据

Simulation API:
  - tick()                 → 推进一个 Tick
  - pause()                → 暂停模拟
  - resume()               → 恢复模拟
  - setSpeed(multiplier)   → 设置模拟速度
```

## 返回格式

```
所有 API 返回统一结构:
{
  "success": true | false,
  "data": { ... },
  "error": null | "错误描述",
  "timestamp": "世界时间"
}
```

---

# 第八章：Script Engine（脚本系统）

允许开发者编写任务脚本。脚本只能调用公开 API，不能绕过世界规则。

## 脚本类型

```
Quest 脚本:    "找到太虚真人洞府" —— 触发条件 + 目标 + 奖励
Festival 脚本: "百年一度的仙道大会" —— 时间触发 + 活动流程
Dungeon 脚本:  "古修洞府探索" —— 地图生成 + 遭遇 + 奖励
Boss 脚本:     "金瞳妖狼王" —— 属性 + AI 行为 + 掉落
Dialogue 脚本: "与陈玄对话" —— 对话树 + 条件分支
```

## 脚本安全

```
沙箱规则:
  - 只能调用 SDK 公开 API
  - 不能直接访问 World State
  - 不能修改其他脚本的数据
  - 执行超时自动终止（默认 30 秒）
  - 异常由 Script Engine 捕获，不影响 Kernel
```

---

# 第九章：Simulation Debugger（模拟调试）

World OS 提供调试能力。

## 调试命令

```
pause           → 暂停世界模拟
step            → 单步执行一个 Tick
step N          → 执行 N 个 Tick
resume          → 恢复自动模拟
speed N         → 设置速度（1x / 10x / 100x）
inspect <id>    → 查看实体完整状态
events <filter> → 查看事件日志
diff <t1> <t2>  → 比较两个 Tick 的世界状态差异
replay <tick>   → 从指定 Tick 重放历史
```

## 断点

```
可以为特定条件设置断点:
  - 断点条件: "npc_001.hp < 10"     → 陈玄生命值低于 10 时暂停
  - 断点条件: "event: encounter"     → 每次遭遇事件暂停
  - 断点条件: "location: 黑风岭"     → 任何 NPC 进入黑风岭时暂停
```

---

# 第十章：Versioning（版本管理）

## Canon 版本

```
Celestial Bible:   v1.0.0  (主版本.次版本.补丁)
                              主版本: 破坏性世界规则变更
                              次版本: 新增内容（新境界/新势力）
                              补丁:   修正/平衡调整

Engine:            v1.2.3  (独立版本)
Plugin:            v0.1.0  (独立版本)
```

## Snapshot 版本绑定

```
每个 Snapshot 保存时记录:
  - canon_version: "1.0.0"
  - engine_version: "1.2.3"
  - active_plugins: [{ name: "alchemy", version: "0.1.0" }, ...]

保证历史可重现: 加载 snapshot + 对应版本的引擎 = 完全相同的结果
```

---

# 第十一章：Compatibility（兼容性）

## 向后兼容规则

```
补丁更新 (1.0.0 → 1.0.1):
  - 必须向后兼容
  - 已有世界可直接加载

次版本 (1.0.0 → 1.1.0):
  - 应向后兼容
  - 新功能不影响已有世界
  - 如有不兼容 → 提供 Migration 脚本

主版本 (1.0.0 → 2.0.0):
  - 允许破坏性修改
  - 必须提供完整 Migration 路径
  - 已有世界需要执行 Migration 才能在新版本运行
```

## Canon Migration

```
破坏性修改流程:
  1. 发布 Migration ADR（描述变更 + 影响范围）
  2. 提供 Migration 脚本（自动转换旧数据）
  3. 备份旧版本世界状态
  4. 执行 Migration
  5. 验证: 迁移后的世界通过 Canon Validator
  6. 失败 → 回滚到备份
```

---

## World OS 启动流程

```
World OS 启动:
  1. 启动 Canon Loader
     1a. 发现所有 Canon 文件
     1b. 解析 (YAML + Markdown)
     1c. 交叉校验 (完整性/引用/一致性/ADR覆盖)
     1d. 建立索引
     1e. 构建 Unified World Model
     1f. 保存版本快照
  2. 加载 Celestial Bible (作为语义参考)
  3. 初始化 Canon Registry (从 World Model)
  4. 加载 Rule Engine (从 World Model)
  5. 初始化 Knowledge Graph (空图，待世界运行填充)
  6. 加载 World State (从最新 Snapshot 或新世界)
  7. 注册所有 Engine
  8. 启动 Event Bus
  9. 加载 Plugins
  10. 启动 Simulation Loop
  11. World OS Running...

World OS 关闭:
  1. 完成当前 Tick
  2. 保存最终 Snapshot
  3. 写入 History
  4. 关闭 Event Bus
  5. 卸载 Plugins
  6. World OS Stopped
```

---

## 附录：与 Phase 3 的映射

| Phase 3 组件 | World OS 中的位置 |
|-------------|------------------|
| CelestialBible.md | Canon（唯一真相） |
| Registry (8 YAML) | Canon Registry |
| Rule Engine | Kernel → Validator |
| Knowledge Graph | World State → relationships |
| Simulation Loop | Kernel → Scheduler |
| NPC Memory | World State → npcs[].memory |
| Narrative Engine | Plugin: NarrativeGenerator |
| Canon Validator | Kernel → Validator |

---

## Runtime Invariants

Runtime is the only authority of world evolution.

```
Clients never simulate the world.
Narrative never changes the world.
Gameplay never bypasses the Kernel API.

Every state transition must satisfy all four:
  1. Deterministic  — same input → same output
  2. Replayable     — Snapshot + EventLog → exact reconstruction
  3. Auditable      — Who/When/Why/Old/New in Audit Trail
  4. Testable       — every transition has automated tests

Any implementation violating these properties is FAILED —
regardless of whether it "appears to work."
```
| ADR (9个) | 决策追溯 |
