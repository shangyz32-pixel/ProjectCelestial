# World Engine — 世界引擎

Status:    Canon
Parent:    Canon/Universe/Universe.md

> 整个项目真正的核心。
> 不是 UI。不是战斗。
> 是引擎。

---

## 引擎架构

```
Time Engine          ← 心跳
    │
Weather Engine       ← 天候
    │
Economy Engine       ← 经济
    │
NPC Engine           ← 众生
    │
Sect Engine          ← 宗门
    │
Cultivation Engine   ← 修炼
    │
History Engine       ← 记忆
```

从上到下。从左到右。
每层只依赖上层。不依赖下层。

---

## 各引擎职责

### Time Engine

```
职责：推进世界时间。

输入：现实时间。
输出：游戏时间 + Daily Tick 信号。

参见：Canon/Time/TimeEngine.md

核心规则：
  - 1 秒 = 1 游戏时辰
  - 每 6 秒触发一次 Daily Tick
  - 玩家离线也不停止
  - 不可跳天
```

### Weather Engine

```
职责：管理天气。

输入：游戏日期 + 地理位置 + 灵气浓度。
输出：当前天气（晴/雨/雪/灵气潮汐/天象异变）。

规则：
  - 四季影响天气概率
  - 灵气潮汐是特殊天气（灵气浓度暂时 +50%，稀有）
  - 天象异变是极端事件（如血月降世，极稀有）
  - 天气影响修炼（晴天 +0% / 灵气潮汐 +50%）

不负责：
  - NPC 是否因为下雨而不出门（那是 NPC Engine 的职责）
```

### Economy Engine

```
职责：管理经济系统。

输入：物品供需 + 灵脉产出 + NPC 交易行为。
输出：当前市场价格 + 交易记录。

规则：
  - 供需驱动价格
  - NPC 买卖影响供需
  - 灵脉产出 = 基础经济输入
  - 通货膨胀由 Simulation 检查（参见 World OS 经济层）

不负责：
  - NPC 要不要买东西（那是 NPC Engine 的职责）
```

### NPC Engine

```
职责：管理所有 NPC 的生命和行为。

输入：Daily Tick + 世界状态。
输出：NPC 状态变更（修炼/交易/战斗/结婚/死亡）。

规则：
  - 每个 NPC 有独立的 24 时辰时间表
  - NPC 自动修炼（Cultivation Engine）
  - NPC 可以交易（Economy Engine）
  - NPC 可以战斗（Combat 模块）
  - NPC 可以结婚、生子、死亡
  - 所有重要事件写入 History Engine

不负责：
  - NPC 属于哪个宗门（那是 Sect Engine 的职责）
```

### Sect Engine

```
职责：管理所有宗门。

输入：NPC 行为 + 宗门策略 + 外部事件。
输出：宗门状态变更（排名/战争/联盟/解散）。

规则：
  - 宗门有策略（扩张/保守/闭关）
  - 宗门之间可以外交（联盟/敌对/吞并）
  - 宗门战争由 Sect Engine 模拟
  - 宗门可以灭亡
  - 宗门可以新建（特殊条件）

不负责：
  - 宗门内 NPC 的个人行为（那是 NPC Engine 的职责）
```

### Cultivation Engine

```
职责：执行修炼和突破的计算。

输入：NPC 状态 + 灵气浓度 + 功法。
输出：修为变更 + 突破结果。

规则：
  - 修炼速度公式（参见 Canon/Cultivation/Cultivation.md）
  - 突破成功率计算
  - 突破失败后果
  - 天劫触发（金丹→元婴及以上）

不负责：
  - 修炼什么功法（那是 NPC Engine 从 NPC 数据读取）
```

### History Engine

```
职责：记录世界发生的一切。

输入：所有引擎的重要事件。
输出：Memory 写入。

规则：
  - 重要事件 → 永久记录
  - 普通事件 → 临时日志（可清理）
  - 重要事件定义：
    - NPC 死亡（非自然）
    - 宗门战争胜负
    - 突破到上境界（元婴+）
    - 灵脉枯竭
    - 天象异变
    - 玩家相关的一切

不负责：
  - 判断什么重要（由各引擎自行标记）
```

---

## 引擎间通信

```
引擎之间不直接调用。

通信方式：

  Event Bus（事件总线）

  引擎 A 发布事件 → Event Bus → 引擎 B 订阅并响应

  示例：
    NPC Engine 发布：NPC 张三突破到元婴
    → Sect Engine 订阅：宗门实力 +1
    → History Engine 订阅：记录事件
    → Economy Engine 订阅：张三可能卖出旧装备
    → Weather Engine：不订阅，无关

  解耦。
  每个引擎只关心自己关心的事件。
```

---

## 新增世界层级

```
十年后，如果要新增"仙界"。

传统设计：
  改地图、改剧情、改任务、改 NPC、改数值。
  牵一发动全身。
  可能推倒重来。

World Engine 设计：

  ① Universe 层
     在 Cosmology 中定义仙界（已完成）。
     仙界时间流速 = 1 日 = 凡间 365 日。

  ② Canon 层
     定义仙界的修炼体系（与凡间不同，或相同）。
     定义仙界的灵气浓度（100x）。

  ③ World Engine 层
     为仙界挂载一套独立的引擎实例：
       仙界 Time Engine（时间流速不同）
       仙界 Economy Engine
       仙界 NPC Engine
       仙界 Sect Engine
       仙界 Cultivation Engine（如果有）

     凡间引擎完全不受影响。
     凡间继续运行。

  ④ 跨层通信
     凡间 Event Bus ↔ 仙界 Event Bus
     飞升事件 → 凡间 NPC 删除 → 仙界 NPC 新增。

现有的凡间代码不需要修改。
现有的凡间 NPC 不受影响。
现有的凡间宗门继续运转。

这就是分层架构为什么重要。
```

---

## 引擎契约

```
每个引擎必须实现以下接口：

  init()
    引擎初始化。

  tick(delta)
    每次 Daily Tick 时调用。
    delta = 经过的游戏时间（1 日）。

  onEvent(event)
    接收 Event Bus 的事件。
    引擎自行判断是否处理。

  getState()
    返回引擎当前状态。
    用于存档和调试。

引擎内部实现自由。
但接口不可变。
接口变了 → 所有下游引擎需要适配。
```

---

## 不可变

1. 引擎层级顺序不可变（Time → Weather → Economy → NPC → Sect → Cultivation → History）。
2. 引擎间通信必须通过 Event Bus。
3. 引擎接口契约不可变。
4. 新增世界层级必须按 Universe → Canon → Engine → Runtime 流程。

---

## AI 须知

```
实现任何引擎时：
  ✅ 必须实现 init/tick/onEvent/getState 接口
  ✅ 只能通过 Event Bus 与其他引擎通信
  ❌ 不能直接调用其他引擎的内部方法

新增功能时：
  ✅ 判断属于哪个引擎
  ✅ 在当前引擎内实现
  ❌ 不能跨引擎实现功能
```
