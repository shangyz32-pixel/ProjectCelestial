# Time Specification
#
# 世界的时钟契约。任何模块不得自己解释时间。

version: "1.0.0"
status: Canon — Contract

---

time:

  tick:
    definition: "1 Tick = 1 世界日"
    subdivisions: "12 时辰/Tick"
    production_speed: "1x (1 Tick = 1 秒 现实时间)"
    shadow_speed: "可配置 1x-100x"

  calendar:
    era: "天历纪元"
    year: "365 天/年"
    seasons: ["春(90天)", "夏(90天)", "秋(92天)", "冬(93天)"]
    months: "12 个月/年"

  lifecycle:
    dawn: "卯时 (5:00-7:00) — 阳气初升，修炼效率 +10%"
    day: "辰至申 (7:00-17:00) — 正常行动时间"
    dusk: "酉时 (17:00-19:00) — 阴气初升"
    night: "戌至寅 (19:00-5:00) — 妖兽活跃 +30%，修炼阴属性功法 +10%"

  large_scale:
    era: "约 1000 年/纪元"
    spiritual_tide: "灵潮周期 — 约 500 年一个大循环"
    ascension_cycles: "飞升潮 — 灵潮峰值期集中出现"

  deterministic_clock:
    guarantee: "相同 seed + 相同初始时间 → 相同时间线"
    replay: "Replay Engine 精确重现时间推进"

  pause:
    maintenance: "暂停 Tick，保留世界状态"
    resume: "从暂停点继续，无时间跳跃"

  accelerate:
    shadow_world: "10x-100x 用于长期模拟验证"
    production: "不可加速 (Policy enforced)"

  forbidden:
    - "任何模块不得自己维护时间变量"
    - "所有时间查询必须通过 Time Service"
    - "禁止跳过 Tick"
