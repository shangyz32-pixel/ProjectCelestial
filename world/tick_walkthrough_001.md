# 集成验证 — 一次完整 Tick 走查
#
# 初始世界状态：天历 847 年 7 月 23 日酉时
# 目标：执行 1 个 Tick（→ 7 月 24 日），验证所有管线连通

---

## Tick #1: 天历 847 年 7 月 23 日 → 7 月 24 日

---

### Step 01: Time

```
输入:  天历 847 年 7 月 23 日
处理:  +1 天
输出:  天历 847 年 7 月 24 日（夏，无季节切换）
触发:  无时间触发事件（没有寿元耗尽/年度大比）
```

---

### Step 02: Weather

```
输入:  夏季, 东海沿岸, 灵气浓度 45
处理:  夏季+海岸 → 晴天(50%) 多云(30%) 细雨(20%)
结果:  多云（seed=42）
影响:  无极端天气，NPC 活动不受限
```

---

### Step 03: Qi

```
输入:  多云(weather_mod=1.0), 夏季(season_mod=1.2), 灵脉基础输出
处理:  东海散修崖 → 45 × 1.0 × 1.2 = 54
       青云山脉主峰 → 135 × 1.0 × 1.2 = 162
输出:  qi_map 更新
```

---

### Step 04: Ecology

```
输入:  夏季(生长+30%), qi_map
处理:  东海灵药正常生长
       夏季 → 妖兽活跃度上升
输出:  无生态异常事件
```

---

### Step 05: NPC — 核心步骤

#### 陈玄 (npc_001)

```
memory_tick:
  active_tags 衰减:
    HOSTILE_TOWARD(npc_002): 10 → 10 (permanent, 无衰减)
    SEEKS_REVENGE(npc_002):  10 → 10 (permanent)
    HOSTILE_TOWARD(qingyun): 10 → 10 (permanent)
    CONFIDENT:               8 → 8 (slow_decay, <100年)
    SUSPICIOUS_OF(qingyun):  7 → 7 (medium_decay, <10年)
    TRUSTS(npc_003):         6 → 6 (medium_decay)
    FEARFUL_OF(qingyun):     5 → 5 (medium_decay)
  结果: 无标签被清除（所有 intensity > 0）

  short_term 清理:
    检查: 是否有 >30 天的短期记忆？
    结果: 所有短期记忆均在 30 天内 → 无清理

cultivation_progress:
  基础修炼值增长 (元婴境, daily~0.02%)

daily_action:
  active_tags 最高优先级: SEEKS_REVENGE(npc_002, intensity=10)
  → 行为: 继续追踪王虎
  → 当前位置更新: 青云山脉外围（跟踪王虎回宗路线）

encounter_detection:
  同区域 NPC: 王虎 (npc_002) 也在青云山脉方向
  → 触发 on_encounter pipeline
  → 标签匹配: HOSTILE_TOWARD(10), SEEKS_REVENGE(10)
  → behavior_decision: stalk (跟踪至青云宗外围，寻找出手时机)
  → 但王虎已入青云宗山门范围，守卫+禁制 → 暂不出手
  → 生成 memory_event: "跟踪至青云宗外围"
```

#### 王虎 (npc_002)

```
memory_tick:
  active_tags 衰减:
    CONFIDENT: 8 → 8 (medium_decay)
    LOYAL_TO(qingyun): 7 → 7 (slow_decay)
    DETERMINED: 5 → 5 (medium_decay)
  结果: 无标签被清除

daily_action:
  返回青云宗 → 继续备考内门考核
  当前位置: 青云宗外门

encounter_detection:
  未遇到任何敌对 NPC
  → 无 encounter 触发
```

#### 赵灵儿 (npc_003)

```
memory_tick:
  active_tags 衰减:
    GRATEFUL_TOWARD(npc_001): 10 → 10 (permanent)
    TRUSTS(npc_001):          10 → 10 (permanent)
    LOYAL_TO(sanxiumeng):     8 → 8 (slow_decay)
    HOSTILE_TOWARD(moyuan):   8 → 8 (slow_decay)
    SEEKS_MASTERY:            7 → 7 (slow_decay)
    CONFIDENT:                6 → 6 (medium_decay)
    SUSPICIOUS_OF(qingyun):   3 → 3 (fast_decay, <1年)

cultivation_progress:
  修炼归元诀 (冰凤灵体 × 筑基境 × qi=54)
  → daily_progress 显著高于普通弟子

daily_action:
  师父未归 → 担心
  → 生成内部事件: "师父出门采买至今未归"
  → importance: 3 (暂时不算严重)
  → emotional_valence: -3
```

#### 李长风 (npc_master_li)

```
daily_action:
  继续关注王虎晋升内门的进展
  内心挣扎: TRUSTS(陈玄, 9) vs LOYAL_TO(青云宗)
  → 但无实际动作（被架空，无力干涉）
```

---

### Step 06: Faction

```
青云宗:
  资源: 正常（夏季产出）
  决策: 继续推进王虎的内门考核
  内部: 李长风的不满被忽视

散修盟:
  资源: 正常（东海灵脉产出）
  决策: 盟主外出未归，执事代管日常
```

---

### Step 07: Economy

```
价格变动:
  火灵芝: 小幅上涨（魔渊侵扰商路）
  基础丹药: 价格稳定（夏季产量高）
```

---

### Step 08: War

```
无进行中的战争 → 跳过
```

---

### Step 09: Events（收集 + 记忆 + KG + 叙事）

```
收集原始事件:
  1. 陈玄跟踪王虎至青云宗外围 → importance: 6
  2. 赵灵儿等待师父未归      → importance: 3
  3. 王虎回宗继续备考          → importance: 2

创建记忆:
  陈玄 short_term 新增:
    id-6: "跟踪至青云宗外围"
    → 但未找到出手时机（守卫+禁制）
    → importance: 6 → 晋升 long_term

KG 同步:
  无需更新（无关系变化）

叙事生成:
  事件#1 importance 6 < 7 → 不生成完整场景
  但生成 beat: "次日。陈玄远远望着青云宗的山门。
         二十年前他从这里走出来。今天他站在外面，
         看着杀死他徒弟的人走进去。"
```

---

### Step 10: History

```
写入历史记录: Tick #1
  时间: 天历 847 年 7 月 24 日
  事件: 3 个
  状态变更: 陈玄位置更新、赵灵儿修炼进度、王虎位置
```

---

### Step 11: Snapshot

```
保存快照: world/snapshots/tick_0001_847-07-24.yaml
  全量世界状态（含 4 个 NPC 的完整记忆）
  seed: 42
  可完全回放
```

---

## 管线连通验证

| 管线 | 触发点 | 本次是否触发 | 状态 |
|------|--------|-------------|------|
| memory.on_tick | Step 5 NPC | ✅ 4 个 NPC 的标签衰减+清理 | ✅ |
| memory.on_encounter | Step 5 NPC encounter_detection | ✅ 陈玄→王虎 | ✅ |
| memory.on_event | Step 9 Events | ✅ 3 个新事件→记忆条目 | ✅ |
| kg_sync | Step 9 Events | — 无关系变更 | ✅ |
| narrative | Step 9 Events | ✅ 生成的 beat | ✅ |
| breakthrough | Step 5 NPC | — 无人到达阈值 | ✅ 等待 |
| death | Step 1 Time | — 无寿元耗尽 | ✅ 等待 |

**7 条管线，3 条本次触发，4 条逻辑跳过。全部连通。**

---

## 结论

当前世界处于"暴风雨前夜"状态：

- 陈玄在青云宗外等待时机 → 一旦王虎离开宗门范围，encounter 将触发战斗
- 王虎毫不知情，继续宗门生活 → 戏剧张力来自信息不对称
- 赵灵儿在散修盟等待 → 为后续"找不到师父"的支线埋下伏笔
- 李长风内心挣扎 → 可能在关键时刻做出选择

下一次 Tick 的 key moment：陈玄是否找到出手时机？
