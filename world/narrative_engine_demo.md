# Narrative Engine Demo — 黑风岭矿脉战争

> 故事不是脚本。故事来自模拟。
> 以下是一组模拟事件经过叙事引擎渲染后的结果。

---

## 输入：模拟事件链

```
Event 1: 矿脉枯竭 (天历 847 春)
  type: qi_depletion
  黑风岭天级灵石矿脉产量 -70%
  imp=9

Event 2: 资源危机 (天历 847 夏)
  type: resource_crisis
  黑风岭矿脉是青云宗+散修盟双控 → 双方灵石收入骤降
  imp=8
  [resource causality: 1→2, conf=0.95]

Event 3: 摩擦升级 (天历 847 秋)
  type: border_skirmish
  青云宗弟子指控散修盟"过度开采"
  散修盟回应"灵脉本来就共享"
  发生小规模冲突, 3 伤
  imp=7
  [resource+relation causality: 2→3, conf=0.88]

Event 4: 战争爆发 (天历 847 冬)
  type: war_declared
  大长老公孙烈: "收回黑风岭主权"
  陈玄: "散修盟不主动开战, 但不受辱"
  imp=10
  [relation causality: 3→4, conf=0.90]

Event 5: 玩家介入 (天历 848 春)
  type: player_intervention
  一个路过的散修 (玩家) 发现了矿脉枯竭的真正原因:
  矿脉深处有上古封印松动, 灵气被抽走
  imp=9
  [info causality: 封印秘密 → 双方停战可能]

Event 6: 新的历史 (天历 848 夏)
  type: peace_accord
  双方停战, 联合修复封印
  矿脉恢复至 60% 产出
  散修盟和青云宗签订《黑风岭共管条约》
  imp=10
  [info causality: 5→6, conf=0.92]
```

---

## 输出：叙事渲染

---

# 黑风岭之冬

*Arc: 矿脉战争 | Chain: 6 events | Importance: 53*

---

## 第一章 · 石头不说话

*全知视角 | Event 1→2*

---

黑风岭的矿脉已经开采了一百年。没有人想过它会枯竭——天级灵脉意味着取之不尽。直到天历八百四十七年的春天，矿脉灵石产量第一次低于月均线。

[source: event_01, qi_depletion, imp=9]

青云宗的账房先发现的。月俸发不出了。

散修盟的执事随后也发现了。东海灵脉的产出刚够维持盟内运转，黑风岭的矿脉是唯一的盈余来源。没了这份盈余，散修盟连丹药都买不起。

[source: event_02, resource_crisis, imp=8]
[causality: event_01 → event_02, resource, conf=0.95]

最先感到寒意的是外门弟子。月俸减半。然后丹药停供。

然后有人说了那句话："是散修盟采得太狠。"

没有人去查灵脉底下的封印。没有人想到石头下面还有比枯竭更古老的东西。

[perspective: 全知 — 读者知道有个封印，但角色不知道]

---

## 第二章 · 陈玄

*NPC 视角 | Event 3*

---

执事把冲突报告放在陈玄面前时，他正对着东海的地图出神。

"青云宗的人说我们在黑风岭过度开采。打伤了三个弟兄。"

陈玄放下地图。二十年前被逐出青云宗的时候他十七岁，站在雨里，发誓不再踏上青云山脉一步。三年前林远被杀的时候他站在断魂崖上，抱起渐冷的尸体，发誓要王虎偿命。

[source: entity_memory(npc_001, id-101): 被青云宗逐出]
[source: entity_memory(npc_001, id-103): 林远之死]

现在青云宗的人打伤了他的弟兄。

"把伤员安置好。"他说。声音很平静。"加强黑风岭的守卫。不主动出手。不受辱。"

[source: decision_engine(npc_001): selected=revenge, but constraint=faction_rule → modified to defend]

执事退下后，陈玄继续看着那张地图。他想的是: 矿脉枯竭，青云宗也在亏。他们为什么还要打？

他不知道黑风岭底下有什么。但他在东海待了二十年——他知道海底下沉睡着很多东西。

[source: entity_memory(npc_001, id-104): 东海突破元婴, 无名孤岛]
[narrator: NPC 的直觉 — 不是记忆, 是人格推断]

---

## 第三章 · 冬天的战争

*全知视角 | Event 4*

---

天历八百四十七年的冬天来得格外早。黑风岭的第一场雪落下时，大长老公孙烈签发了收回矿脉主权的宗门令。

[source: event_04, war_declared, imp=10]

他没有告诉长老会议。他甚至没有告诉李长风。公孙烈的逻辑很简单: 青云宗六百年的颜面，不能被一群散修打了还默不作声。

[source: entity_memory(faction_qingyun): cultural_memory — "颜面优先"]
[source: decision_engine(公孙烈): expand_sect → military_action]

战争打了一个月。黑风岭的矿脉不值得一场战争——三成的灵石产出，分到两个宗门手里不过是九牛一毛。但战争从来不只关于矿脉。

陈玄和公孙烈都很清楚这一点。

---

## 第四章 · 封印之下

*玩家视角 | Event 5*

---

如果你是一个散修，冬天的时候你路过黑风岭。你看见矿脉深处有一道裂缝——不是开采留下的，是某种力量从内部撕开的。

[source: event_05, player_intervention, imp=9]

你走近。裂缝深处有光。不是灵石的光——灵石的光是暖的。这道光是冷的，像一种你只在古籍里见过的颜色。

上古封印。

你把这个发现告诉了矿场守卫。一天之内，消息传到了陈玄手上。

陈玄亲自来了。他站在裂缝前看了很久，然后说了一句话: "停战。"

[source: decision_engine(陈玄): new_info → goal_reprioritize — revenge(12.6) → protect(9.2)]
[reason: 封印破裂的威胁 > 对王虎的仇恨]

---

## 第五章 · 新的历史

*全知视角 | Event 6*

---

天历八百四十八年夏天。陈玄和青云宗的代表——不是公孙烈，是李长风——在黑风岭签署了《共管条约》。

[source: event_06, peace_accord, imp=10]

这是二十年来青云宗和散修盟签的第一份条约。上一次陈玄站在青云宗的人面前，是在青云宗的山门前，要他们交出杀害林远的凶手。那次没有人理他。

这一次，李长风签了字。

签完之后，李长风看着陈玄，想说点什么。陈玄已经转身走了。

[source: entity_memory(npc_master_li, id-103): 追出山门, 陈玄没有回头]

矿脉恢复了六成。那条封印裂缝被两派的阵法师联合封住了——虽然是暂时的。黑风岭的矿脉底下还有什么，没有人知道。

但这是第一次，青云宗和散修盟不是因为战争，而是因为修复某样东西而站在一起。

这不是结局。这是一个新弧的开端。

---

## 源追溯表

| 段落 | 源类型 | 源 ID |
|------|--------|-------|
| 矿脉产量低于月均线 | event | event_01 (qi_depletion) |
| 月俸发不出 / 丹药停供 | event | event_02 (resource_crisis) |
| 因果: 1→2 | causal_chain | resource, conf=0.95 |
| 陈玄回忆被逐出师门 | entity_memory | npc_001 id-101 |
| 陈玄回忆林远之死 | entity_memory | npc_001 id-103 |
| 陈玄决策: 防御 | decision_engine | npc_001, goal=revenge, modified |
| 公孙烈签发命令 | event | event_04 (war_declared) |
| 青云宗"颜面优先" | entity_memory | faction_qingyun cultural_memory |
| 玩家发现封印 | event | event_05 (player_intervention) |
| 陈玄重新评估目标 | decision_engine | reprioritize: revenge→protect |
| 停战签约 | event | event_06 (peace_accord) |
| 李长风签字后无言 | entity_memory | npc_master_li id-103 |
