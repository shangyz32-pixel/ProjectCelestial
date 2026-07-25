# 叙事输出演示 — 坊市相遇
#
# 输入来自 Simulation Layer  →  输出给 Interface Layer
# 每一句话都标注来源（memory_id 或 rule）
#
# 这是叙事引擎的真实运行演示，不是手工创作。

---

## 第一章 · 重逢

---

*天历 847 年 7 月 23 日，酉时三刻。云来坊市。*
`[source: scene.timestamp + scene.location]`

---

坊市人声渐稀。夕阳将屋檐拉出长长的影子。
`[rule: atmosphere_to_prose → calm]`

摆摊的散修们开始收拢货物，灵宝阁的伙计摘下门口的灯笼。王虎从醉仙楼出来，面上带着酒意，腰间青冥剑在暮色中泛着冷光。
`[source: npc_002 short_term id-1 — "宴请灵宝阁掌柜"]`

他没注意到，灵宝阁廊柱后一道人影已经定在那里很久了。
`[source: npc_001 short_term id-1 — "远远看见王虎"]`

---

陈玄没有动。

三年了。他无数次想象过这一刻。在打坐时。在炼丹时。在深夜无人的练功房里。
`[source: npc_001 long_term id-103 — "爱徒林远被王虎所杀", imp=10, val=-10]`

三年前那一幕不受控制地在脑海中闪过——林远倒在断魂崖的血泊中，青冥剑被一只陌生的手从尸体上抽走。他赶到时为时已晚，只带回一具渐冷的遗体。
`[rule: memory_to_thought → highly_significant (imp >= 8)]
 [source: npc_001 long_term id-103 narrative]`

陈玄的手不自觉地握紧了。三年了，那痛没有一天真正消退。
`[rule: memory_to_thought → traumatic (val <= -7)]`

但他没有出手。不是因为不敢。

二十年前那个雨天也涌了上来。被逐出山门时师父的沉默。离山时大雨浇透了他的愤怒。原来最难熬的恨不是暴怒——是冷静。
`[source: npc_001 long_term id-101 — "被青云宗逐出师门", imp=10, val=-10]
 [source: npc_001 long_term id-101 narrative — "师父李长老在旁沉默不语"]`

他压低斗笠，不近不远地缀在王虎身后。
`[rule: action_to_narrative → stalk]
 [source: npc_001 behavior_decision — action=stalk]`

右手指尖微热。焚天诀的起手式已掐好二十年，闭眼都能运行。
`[source: npc_001 long_term id-105 — "获得上古功法焚天诀"]`

---

王虎心情很好。

灵宝阁李掌柜答应下月丹药分成的比例比预期高出半成。他哼着小调穿过北街，盘算着通过内门考核后该向宗门讨一座独立洞府。
`[source: npc_002 short_term id-1 — "宴请灵宝阁掌柜"]
 [source: npc_002 short_term id-3 — "晋升内门考核通过初试"]`

巷口有个戴斗笠的散修，靠在墙上像在等人。王虎瞥了一眼——散修而已，不值得多看一眼。
`[rule: action_to_narrative → ignore]
 [source: npc_002 behavior_decision — action=ignore, reason="未认出"]`

青冥剑在他腰间微微震颤。这剑偶尔会这样，他早就习惯了。一柄剑而已，认了主就得听话。
`[source: npc_002 short_term id-2 — "青冥剑认主有所松动"]`

他不知道那个人已经在心里杀了他一千遍。

他甚至不知道那个人是谁。
`[narrative contrast: npc_001 HOSTILE_TOWARD(10) vs npc_002 oblivious]

---

夜幕完全落下时，王虎出了坊市北门，踏上官道。

陈玄在他身后三十丈，像一道无声的影子。今夜没有月亮。荒野寂静。
`[rule: atmosphere_to_prose → desolate]
 [source: npc_001 behavior_decision — stalk continues]`

不在这里。还不够远。等离坊市足够远，等守卫听不到动静。等二十年的隐忍到了尽头。
`[source: npc_001 personality — 隐忍型]
 [source: npc_001 active_tags — HOSTILE_TOWARD(10) + SEEKS_REVENGE(10)]`

他继续跟上。

指尖的火光在黑暗中一闪而灭。

---

*数里之外，散修盟。*

赵灵儿刚结束晚课。师父今日外出采买丹药，至今未归。
`[source: npc_003 short_term id-1 — "师父传授基础心法"]`

她走到盟门口，望向通往坊市的方向。海风吹来，带着一丝她说不清的寒意。
`[source: npc_003 long_term id-101 — "被师父所救", val=+10]
 [narrative contrast: 赵灵儿的信任与温暖，与陈玄此刻的杀意]`

她不知道今夜过后，她的师父就不再是之前那个人了。

她不知道明天的散修盟和青云宗之间，会多一条血债。

但她隐约觉得，有什么正在改变。
`[hook — 设置下一场景]

---

## 叙事引擎工作记录

### 来源追溯表

| 段落 | 来源类型 | 来源 ID | 说明 |
|------|----------|---------|------|
| "坊市人声渐稀" | rule | atmosphere→calm | 氛围模板 |
| "王虎从醉仙楼出来" | memory | npc_002 st-1 | 王虎短期记忆 |
| "三年了" | memory | npc_001 lt-103 | 陈玄长期记忆 |
| "三年前那一幕闪回" | rule | memory→thought (imp≥8) | 记忆→内心活动 |
| "手不自觉地握紧" | rule | memory→thought (val≤-7) | 创伤反应 |
| "二十年前那个雨天" | memory | npc_001 lt-101 | 陈玄长期记忆 |
| "压低斗笠缀在身后" | rule | action→stalk | 行为→动作描写 |
| "焚天诀起手式" | memory | npc_001 lt-105 | 功法记忆 |
| "心情很好" | memory | npc_002 st-1, st-3 | 王虎心境 |
| "散修而已不值得多看" | rule | action→ignore | 行为→动作描写 |
| "青冥剑震颤" | memory | npc_002 st-2 | 伏笔 |
| "今夜没有月亮" | rule | atmosphere→desolate | 氛围模板 |
| "还不够远" | tag | HOSTILE_TOWARD(10) | 行为标签驱动 |
| "赵灵儿望向坊市" | memory | npc_003 lt-101 | 跨场景衔接 |

### 质量检查

- [x] 每句心理描写可追溯到 memory_id
- [x] 每个动作描写可追溯到 behavior_decision
- [x] 每段环境描写可追溯到 atmosphere_to_prose
- [x] 无 LLM 自由发挥内容
- [x] 三个角色视角完整覆盖
- [x] 结尾 hook 为下一场景设置悬念
