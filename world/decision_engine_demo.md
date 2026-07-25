# Decision Engine Demo — 四个 NPC 的目标决策

> 同一天。四个 NPC。四套目标。四维决策。

---

## 陈玄 (npc_001) — 复仇者

```
═══════════════════════════════════════
Decision Engine: npc_001 陈玄
Date: 天历 847-07-24
═══════════════════════════════════════

State:
  HP: 100% | Lifespan: 94% remaining | Realm: 元婴境
  Location: 青云山脉外围
  Active Tags: SEEKS_REVENGE(王虎,10), HOSTILE_TOWARD(青云宗,10),
                SEEKS_POWER(7), SEEKS_MASTERY(7), CONFIDENT(8)

Goal Evaluation:
  survive     → INACTIVE (HP 100%, 寿元充足)
  protect     → INACTIVE (赵灵儿在散修盟, 无危险)
  revenge     → ACTIVE   urgency=12.6  ← 最高
  expand_sect → INACTIVE (散修盟资源稳定, 无扩张需求)
  seek_power  → ACTIVE   urgency=4.2
  cultivate   → ACTIVE   urgency=1.8

Decision:
  Selected: revenge → stalk
  Action: 继续追踪王虎, 潜伏等待青云宗外独处时机
  Constraint: 盟主公开攻击青云宗弟子 = 两派开战
  Modified: 隐蔽跟踪 (斗笠 + 收敛气息)

Trace:
  resource_factor:  qi=54 at 东海 → 1.2 (足够)
  time_factor:      王虎在青云宗(可抵达) → 1.5 (机会窗口)
  relation_factor:  SEEKS_REVENGE(10) → 1.5
  history_factor:   林远之死(imp=10) + 相遇(imp=8) → 1.4
  urgency:          1.2 × 1.5 × 1.5 × 1.4 = 3.78
  final:            clamp(3.78 × tag_intensity(10)/5, 0, 15) = 12.6
```

---

## 赵灵儿 (npc_003) — 守护者

```
═══════════════════════════════════════
Decision Engine: npc_003 赵灵儿
Date: 天历 847-07-24
═══════════════════════════════════════

State:
  HP: 100% | Age: 16 | Realm: 筑基境
  Location: 散修盟
  Active Tags: GRATEFUL_TOWARD(陈玄,10), TRUSTS(陈玄,10),
                SEEKS_MASTERY(7), TRAUMATIZED(8)

Goal Evaluation:
  survive     → INACTIVE
  protect     → ACTIVE   urgency=8.5 ← 师父两天未归
  revenge     → INACTIVE
  seek_power  → ACTIVE   urgency=5.3
  cultivate   → ACTIVE   urgency=2.1

Decision:
  Selected: protect → search
  Action: 询问执事师父去向, 向坊市方向寻找
  Thought: "师父出门采买丹药, 两天了还没回来..."
  Constraint: 筑基境, 不可独自远行
  Modified: 在散修盟周边寻找 + 托执事打听消息

比陈玄晚了 17 年的人生, 但此刻她的目标也是一样的:
找到那个人。
```

---

## 王虎 (npc_002) — 野心家

```
═══════════════════════════════════════
Decision Engine: npc_002 王虎
Date: 天历 847-07-24
═══════════════════════════════════════

State:
  HP: 100% | Realm: 金丹境
  Location: 青云宗外门
  Active Tags: CONFIDENT(8), LOYAL_TO(青云宗,7), DETERMINED(5)

Goal Evaluation:
  survive     → INACTIVE
  protect     → INACTIVE
  revenge     → INACTIVE (无仇人)
  expand_sect → INACTIVE (非领导者)
  seek_power  → ACTIVE   urgency=6.8 ← 最高
  cultivate   → ACTIVE   urgency=2.4

Decision:
  Selected: seek_power → intensive_cultivate
  Action: 闭关三日冲刺内门考核
  Thought: "金丹境配天级法宝, 青云宗谁敢说个不字"
  
他不知道青云山脉外围有个元婴境修士已经盯了他两天。
他的决策引擎不知道——因为他的 KG 里没有 RIVAL_OF(陈玄) 边。
王虎的世界很安全。
```

---

## 李长风 (npc_master_li) — 矛盾者

```
═══════════════════════════════════════
Decision Engine: npc_master_li 李长风
Date: 天历 847-07-24
═══════════════════════════════════════

State:
  HP: 100% | Realm: 化神境 | Age: 320
  Location: 青云宗长老殿
  Active Tags: TRUSTS(陈玄,9), BETRAYED_BY(self,9),
                LOYAL_TO(青云宗,7), SUSPICIOUS_OF(王虎,7),
                HOSTILE_TOWARD(青云宗,6), DETERMINED(6)

Goal Evaluation:
  survive       → INACTIVE
  protect       → ACTIVE   urgency=5.2 (陈玄被青云宗视为敌人)
  revenge       → INACTIVE
  expand_sect   → INACTIVE
  seek_power    → ACTIVE   urgency=3.1
  cultivate     → ACTIVE   urgency=2.0

Decision:
  Selected: protect → intervene_indirectly
  Action: 私下调查王虎晋升内门的资格 + 设法阻碍
  Constraint: 大长老一系掌权, 公开反对王虎 = 对抗公孙烈
  Modified: 通过执事殿匿名提交质疑

他是青云宗地位最高的几个人之一。
但他的决策引擎告诉他: 你能做的最多只是匿名举报。
二十年前的沉默, 今天还在付出代价。
```

---

## 决策对比

```
同一时刻, 四个 NPC, 四个目标:

陈玄:    revenge     → stalk       "找到他。等待。"
赵灵儿:   protect     → search      "师父去哪了？"
王虎:    seek_power  → cultivate   "内门考核稳了。"
李长风:   protect     → intervene   "匿名举报。这是我唯一能做的。"

没有随机。
每个决策都来自: 资源 × 时间 × 关系 × 历史。
```

---

## 为什么王虎不知道陈玄在找他

```
Decision Engine 依赖 KG 和 Entity Memory。

王虎的 KG:
  RIVAL_OF → (无)
  原因: 王虎的 memory id-103 记录 "有人来宗门追查",
        但 importance=5, 未产生 RIVAL_OF 边。

王虎的 Entity Memory:
  - "诛杀散修林远, 夺得青冥剑" (imp=7, val=+6)
  - "有人来宗门追查林远之死" (imp=5, val=+5)
  他认为这件事已经过去了。

这就是信息不对称如何通过决策引擎自然产生的:
不是系统设置了 "王虎不知道",
而是王虎的数据中没有那条 RIVAL_OF 边。
```
