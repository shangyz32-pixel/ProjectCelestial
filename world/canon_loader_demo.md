# Canon Loader Demo — 加载 v1.0 Canon

> 演示：Canon Loader 加载 61 个文件 → 统一 World Model

---

## 加载日志

```
[Canon Loader] Starting v1.0.0...
[Canon Loader] Phase: discovery

  扫描路径:
    docs/            → 5 文件 (Volume I~V)
    canon/registry/  → 8 文件 (Registry YAML)
    engine/          → 13 文件 (Engine Specs)
    adr/             → 11 文件 (ADR-0001~0011)
    canon/INDEX.md   → 1 文件
    根目录            → 6 文件 (Bible, ROADMAP, ARCHITECTURE...)
    world/            → 9 文件 (NPCs, narrative demos)
    canon/universe/   → 3 文件 (Constants, Cosmology, Universe)
    canon/others/     → 5 文件 (Dao, Cultivation, TimeEngine, WorldEngine, INDEX)

  总计: 61 文件

[Canon Loader] Building dependency graph...
  rule_engine.yaml → registry/realms.yaml ✅
  rule_engine.yaml → registry/spirit_roots.yaml ✅
  rule_engine.yaml → registry/lifespan.yaml ✅
  rule_engine.yaml → registry/tribulation.yaml ✅
  rule_engine.yaml → memory_schema.yaml ✅
  simulation_loop.yaml → rule_engine.yaml ✅
  simulation_loop.yaml → knowledge_graph.yaml ✅
  simulation_loop.yaml → canon_validator.yaml ✅
  simulation_loop.yaml → narrative_schema.yaml ✅
  knowledge_graph.yaml → memory_schema.yaml ✅
  narrative_schema.yaml → narrative_arc.yaml ✅
  narrative_schema.yaml → causal_chain.yaml ✅
  world_kernel.yaml → simulation_loop.yaml ✅
  world_kernel.yaml → canon_validator.yaml ✅
  world_kernel.yaml → world_state.yaml ✅
  world_kernel.yaml → capability.yaml ✅
  civilization_engine.yaml → knowledge_graph.yaml ✅
  canon_loader.yaml → (all files) ✅
  ... 依赖图完整，0 断链

[Canon Loader] Phase: parse

  YAML files (18):
    registry/realms.yaml        → structured ✅
    registry/spirit_roots.yaml  → structured ✅
    registry/lifespan.yaml      → structured ✅
    registry/dao.yaml           → structured ✅
    registry/tribulation.yaml   → structured ✅
    registry/breakthrough.yaml  → structured ✅
    registry/weather.yaml       → structured ✅
    registry/factions.yaml      → structured ✅
    rule_engine.yaml            → structured ✅
    knowledge_graph.yaml        → structured ✅
    memory_schema.yaml          → structured ✅
    narrative_schema.yaml       → structured ✅
    narrative_arc.yaml          → structured ✅
    causal_chain.yaml           → structured ✅
    simulation_loop.yaml        → structured ✅
    canon_validator.yaml        → structured ✅
    world_kernel.yaml           → structured ✅
    world_state.yaml            → structured ✅
    capability.yaml             → structured ✅
    plugin_system.yaml          → structured ✅
    civilization_engine.yaml    → structured ✅
    canon_loader.yaml           → structured ✅
    canonical_world_model.yaml  → structured ✅

  Markdown files (39):
    Volume I~V                  → semantic ✅
    ADR-0001~0011               → structured ✅
    Universe docs (3)           → semantic ✅
    Dao/Cultivation/Time/World  → semantic ✅
    INDEX.md                    → indexed ✅
    ROADMAP/ARCHITECTURE/...    → semantic ✅
    NPC memory files (4)        → data ✅
    Narrative demos (4)         → reference ✅

[Canon Loader] Phase: cross-validate

  Registry completeness:
    realms.yaml (16条目) ↔ Volume III 境界描述    ✅ 一致
    spirit_roots.yaml (8×14) ↔ Volume III 灵根    ✅ 一致
    tribulation.yaml (6类型) ↔ Volume III 天劫     ✅ 一致
    weather.yaml (12类型) ↔ Volume II 天气        ✅ 一致
    factions.yaml (6类型) ↔ Volume IV 势力        ✅ 一致

  Reference integrity:
    扫描 198 条交叉引用...
    198/198 引用目标存在                            ✅

  Cross-consistency:
    Volume III: 境界数(16) = Registry: 条目数(16)   ✅
    Volume II: 天气类型 ⊆ Registry                  ✅
    Volume IV: Tick步数(11) = simulation_loop(11)    ✅
    Volume IV: Engine数(11) = 已注册Engine(12)       ⚠️

  ADR coverage:
    Stage 1: Canon Ingestion       → ADR-0001,0002 ✅
    Stage 2: Rule Engine           → ADR-0003      ✅
    Stage 3: Knowledge Graph       → ADR-0004      ✅
    Stage 4: NPC Memory            → ADR-0005      ✅
    Stage 5: Narrative Layer       → ADR-0007      ✅
    Stage 6: Simulation Loop       → ADR-0006      ✅
    Stage 7: Emergent Narrative    → ADR-0007      ✅
    Stage 8: Canon Validator       → ADR-0008      ✅
    Phase 3.5: World OS            → ADR-0009      ✅
    Phase 4 Blueprint: Civilization→ ADR-0010      ✅
    Phase 4 Module 1: Canon Loader → ADR-0011      ✅

[Canon Loader] Phase: index

  构建索引:
    概念索引: 156 个唯一概念
    文件索引: 61 个文件
    ADR 索引:  11 条决策记录
    交叉引用索引: 198 条引用关系

[Canon Loader] Phase: build model

  构建 Unified World Model...
    world_rules         ✅
    cultivation_system  ✅
    engines (12)        ✅
    decisions (11)      ✅
  
  Model checksum: sha256:a3f8b2c1...

[Canon Loader] Phase: snapshot

  保存版本快照: canon/snapshots/v1.0.0.yaml
    - canon_version: "1.0.0"
    - file_count: 61
    - validation_errors: 0
    - validation_warnings: 1

  ═══════════════════════════════════════
  加载完成: Project Celestial v1.0.0
  ═══════════════════════════════════════
  
  Errors:   0
  Warnings: 1
    ⚠️  Volume IV 声称 11 Engine，但实际注册 12 个
       (Canon Loader 是第 12 个，Volume IV 需更新)

  World Model 就绪。Hermes 可以查询。
```

---

## 查询演示

```
> get_realm_info("元婴境")
{
  "success": true,
  "data": {
    "index": 5,
    "lifespan": "1000 年",
    "breakthrough_rate": "10%",
    "min_qi": 100,
    "tribulation_required": true
  },
  "source": "Registry/Realm.yaml"
}

> get_rule_pipeline("breakthrough")
{
  "success": true,
  "data": {
    "conditions": ["qi_available", "realm_cap", "lifespan_sufficient", 
                   "resources", "comprehension"],
    "probability_modifiers": ["pill_bonus", "qi_density", 
                               "comprehension", "dao_heart", "destiny"],
    "consequences": { "success": [...], "failure": [...] }
  },
  "source": "engine/rule_engine.yaml"
}

> search_concept("灵脉枯竭")
{
  "success": true,
  "data": {
    "mentions": [
      { "file": "volume2_physics.md", "section": "灵气循环" },
      { "file": "simulation_loop.yaml", "step": "step_03_qi" },
      { "file": "civilization_engine.yaml", "section": "long_term_goals" },
      { "file": "arc_001_spirit_vein_crisis.md", "type": "narrative_demo" },
      { "file": "factions_detail.yaml", "section": "青云宗.current_conflicts" }
    ]
  }
}
```

---

## 热更新演示

```
[Canon Loader] 检测到新版本: v1.0.1
[Canon Loader] diff:
  修改文件: canon/registry/realms.yaml
    变更: 元婴境突破率 10% → 12% (平衡调整)
    影响: rule_engine → breakthrough pipeline
  新增文件: engine/alchemy_plugin.yaml (Phase 4 新增)
    影响: plugin_system → 新 Engine 注册

[Canon Loader] 加载新 Canon 到临时 Model... ✅
[Canon Loader] 验证新 Model... ✅ (0 errors, 0 warnings)
[Canon Loader] 无破坏性变更。热更新安全。

[Canon Loader] 原子切换: v1.0.0 → v1.0.1
[EventBus] 发布: CanonUpdated { old: "1.0.0", new: "1.0.1", 
            affected: ["breakthrough_pipeline"] }
[RuleEngine] 重新加载突破管线规则... ✅

热更新完成。世界未中断。Tick #1547 正常继续。
```

---

## 结论

Canon Loader 将 61 个设计文件变成了一个 Hermes 可以直接查询的统一模型。它是 Phase 4 所有后续 Engine 的基础——没有它，每个 Engine 都需要自己解析 Canon 文件。
