# Narrative Architecture

> Axiom 001: Simulation Precedes Narrative
> 世界先于故事。

---

## Single Source of Truth

```
Canon → Simulation Engine → World State → Information Propagation → Narrative Intelligence → Player
```

三层解耦：

```
Reality    (World State)         — 实际发生的
Information (Propagation Engine) — 角色实际知道的
Narrative   (Intelligence)       — 如何叙述的
```

## Separation of Responsibility

```
Simulation Engine:   What Happened
Narrative Intelligence: How It Is Told
Player:              How It Is Experienced
```

三者完全解耦。

## Narrative Layers

同一事件，五层表达：

```
Layer 1: Observation — NPC 所见
Layer 2: Rumor      — 流言，可能失真
Layer 3: Record     — 官方记录
Layer 4: History    — 后世整理
Layer 5: Legend     — 传说，可能神化
```

世界只有一个。叙事可以无限多。

## Narrative Pipeline

```
World State → Narrative Intelligence
                    ├── Quest
                    ├── Dialogue
                    ├── Rumors
                    ├── Books
                    ├── History
                    ├── News
                    └── Player Experience
```

Narrative 永远只是世界状态的不同输出形式。

## Narrative Constraints

- 不得创造事件
- 不得修改历史
- 不得修改时间线
- 不得违反 Canon
- 只能解释 / 总结 / 传播 / 渲染

## Final Principle

```
Story Never Drives Simulation.
Simulation Always Drives Story.

玩家不是故事的中心。
世界也不是故事的中心。
Simulation 才是中心。

Narrative 只是世界照向玩家的一束光。
```
