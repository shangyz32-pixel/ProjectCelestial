# Simulation First — 核心原则

> 先模拟，再叙事。
> 这是大型世界模拟与传统任务脚本之间最重要的区别。

version: "1.0.0"
status: Canon — Highest Principle

---

principle:

  statement: "先模拟，再叙事。"

  meaning: >
    世界状态由 Simulation Engine 决定。
    剧情由 Narrative Engine 从世界状态中提炼。
    AI 回复玩家必须基于当前世界状态，而不是即时编造。

  # ==========================================================
  # 正确的方式
  # ==========================================================

  correct_flow: |
    资源减少
        ↓ (simulation: qi_depletion event)
    宗门开始争夺灵脉
        ↓ (simulation: faction conflict triggered)
    边境发生战争
        ↓ (simulation: war declared, battles fought)
    玩家接到护送任务
        ↓ (narrative: quest generated from world state)

    玩家感受到的是一个本来就在运转的世界。
    即使玩家不来，这场战争也会发生。
    玩家只是刚好在此时此刻进入了这个世界。

  # ==========================================================
  # 错误的方式
  # ==========================================================

  wrong_flow: |
    玩家来了
        ↓
    系统生成一场战争
        ↓
    系统生成资源减少的理由
        ↓
    系统生成宗门冲突的背景

    玩家感受到的是一个围绕自己即时生成内容的世界。
    玩家离开后，战争就消失了。
    这不是世界。这是舞台布景。

  # ==========================================================
  # 三个推论
  # ==========================================================

  corollary_1:
    name: "世界不等待玩家"
    meaning: >
      Simulation Engine 持续运行，不管有没有玩家在线。
      玩家离开时，NPC 继续生活。宗门继续争斗。灵脉继续衰减。
      玩家回来时，世界已经不同了。

  corollary_2:
    name: "叙事是模拟的投影"
    meaning: >
      Narrative Engine 不创造事件。它只是把模拟结果翻译成人类可读的故事。
      如果世界没有战争，叙事不会编造一场战争。
      如果世界发生战争，叙事不能假装和平。

  corollary_3:
    name: "AI 不即兴编造"
    meaning: >
      AI 回答玩家问题时，必须基于当前 World State + Canon。
      不能因为"这样回答更有趣"而编造不存在的世界状态。
      Canon Validator 是最后防线。

  # ==========================================================
  # 与其他原则的关系
  # ==========================================================

  relationship:
    canon_first: "Canon First 定义了什么是对的。Simulation First 定义了什么时候说。"
    governance: "Simulation First 是 Governance 的前置条件——如果世界是即兴编造的，治理毫无意义。"
    validation: "Simulation First 使得 Validation 成为可能——只有确定性模拟才能被验证。"
