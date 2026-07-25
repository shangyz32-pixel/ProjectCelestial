# Registry Compiler Demo — v1.0 编译

> 输入: 8 个 Registry YAML
> 输出: 编译后的运行时数据

---

## 编译日志

```
[Registry Compiler] Compiling v1.0 Registry...

  Parse:
    realms.yaml          → 16 境界 ✅
    spirit_roots.yaml    → 8 品质 × 14 属性 ✅
    lifespan.yaml        → 16 寿元记录 ✅
    dao.yaml             → 3 层大道 ✅
    tribulation.yaml     → 6 种天劫 ✅
    breakthrough.yaml    → 5 条件 + 失败后果 ✅
    weather.yaml         → 12 种天气 ✅
    factions.yaml        → 6 种势力类型 ✅

  Validate:
    名称唯一性检查...     ✅
    引用完整性检查...     ✅ (next_realm, realm_cap 等有效)
    循环引用检查...       ✅
    数值范围检查...       ✅

  Resolve References:
    Realm.name → realm_id:
      凡人→0, 练气→1, 筑基→2, 金丹→3, 元婴→4,
      化神→5, 炼虚→6, 合体→7, 大乘→8, 渡劫→9,
      地仙→10, 天仙→11, 金仙→12, 太乙金仙→13,
      大罗金仙→14, 超脱→15

    next_realm 映射:
      凡人.next=1(练气), 练气.next=2(筑基), ...
      超脱.next=null (最高境界)

    SpiritRoot quality → quality_id:
      凡灵根→0, 黄灵根→1, 玄灵根→2, 地灵根→3,
      天灵根→4, 仙灵根→5, 神灵根→6, 混沌灵根→7

    SpiritRoot attribute → attribute_id:
      金→0, 木→1, 水→2, 火→3, 土→4,
      风→5, 雷→6, 冰→7, 光→8, 暗→9,
      时间→10, 空间→11, 生命→12, 死亡→13

    realm_cap 映射:
      凡灵根→2(筑基), 黄灵根→3(金丹), 玄灵根→4(元婴),
      地灵根→5(化神), 天灵根→6(炼虚), 仙灵根→9(渡劫),
      神灵根→14(大罗金仙), 混沌灵根→15(超脱)

  Output:
    compiled_registry (1.2MB JSON)
    查询复杂度: O(1)

  ✅ 编译成功
```

---

## 编译结果示例

```json
// compiled_registry.realms
{
  "0": {
    "realm_id": 0, "name": "凡人",
    "index": 0, "lifespan": 80,
    "breakthrough_rate": 0.8, "min_qi": 0,
    "next_realm_id": 1,
    "tribulation_required": false
  },
  "3": {
    "realm_id": 3, "name": "金丹境",
    "index": 3, "lifespan": 600,
    "breakthrough_rate": 0.15, "min_qi": 50,
    "next_realm_id": 4,
    "tribulation_required": false
  },
  "4": {
    "realm_id": 4, "name": "元婴境",
    "index": 4, "lifespan": 1500,
    "breakthrough_rate": 0.10, "min_qi": 100,
    "next_realm_id": 5,
    "tribulation_required": true
  },
  ...
}

// compiled_registry.spirit_roots
{
  "4": {
    "quality_id": 4, "name": "天灵根",
    "realm_cap_id": 6, "cultivation_multiplier": 5.0,
    "attributes": {
      "3": { "attribute_id": 3, "name": "火" },
      "7": { "attribute_id": 7, "name": "冰" },
      ...
    }
  },
  ...
}
```

---

## 运行时查询对比

```
场景: "金丹境的突破率是多少？"

设计文档方式:
  1. 打开 Registry/Realm.yaml
  2. 解析 YAML
  3. 遍历 16 个条目
  4. 字符串匹配 "金丹境"
  5. 找到 breakthrough_rate: 0.15
  耗时: O(n) + YAML 解析

编译后方式:
  compiled_registry.realms[3].breakthrough_rate
  → 0.15
  耗时: O(1) Map 查找
```

---

## 集成到 Canon Loader

```
Canon Loader 启动流程更新:
  Step 1: File Discovery
  Step 2: Parse
  Step 3: Cross-Validate
  Step 4: Index
  Step 4.5: ╔══ Registry Compiler ══╗  ← 新增
            ║ Parse Registry YAML   ║
            ║ Validate              ║
            ║ Assign IDs            ║
            ║ Resolve References    ║
            ║ Output compiled data   ║
            ╚══════════════════════╝
  Step 5: Build World Model (含 compiled_registry)
  Step 6: Version Snapshot
```
