// runtime/shop/index.js
// Sprint 5 — Dynamic Shop System
// All transactions through Kernel API.

// Shop inventory templates by region
const REGION_SHOPS = {
  area_bamboo_grove: {
    name: "翠竹杂货铺",
    inventory: { spirit_herb: { price: 20, stock: 10 }, jade_shard: { price: 50, stock: 3 }, iron_sword: { price: 100, stock: 1 }, cloth_robe: { price: 80, stock: 2 } },
  },
  area_misty_peak: {
    name: "云雾坊市",
    inventory: { spirit_herb: { price: 25, stock: 8 }, jade_shard: { price: 45, stock: 5 }, thunder_ore: { price: 80, stock: 3 }, spirit_blade: { price: 300, stock: 1 }, qi_necklace: { price: 200, stock: 1 } },
  },
  area_thunder_valley: {
    name: "雷音交易行",
    inventory: { thunder_ore: { price: 60, stock: 10 }, jade_shard: { price: 55, stock: 5 }, dragon_scale: { price: 150, stock: 3 }, thunder_edge: { price: 600, stock: 1 }, spirit_talisman: { price: 150, stock: 2 } },
  },
  area_dragon_vein: {
    name: "龙脉秘市",
    inventory: { ancient_jade: { price: 500, stock: 3 }, dragon_scale: { price: 120, stock: 8 }, spirit_stone: { price: 10, stock: 50 }, dragon_fang: { price: 2000, stock: 1 }, phoenix_ring: { price: 800, stock: 1 } },
  },
};

// Item definitions
export const SHOP_ITEMS = {
  spirit_herb:    { name:"灵草",     type:"resource", quality:"common", basePrice:20 },
  jade_shard:     { name:"灵石碎片", type:"resource", quality:"common", basePrice:50 },
  thunder_ore:    { name:"雷晶石",   type:"resource", quality:"rare",   basePrice:80 },
  dragon_scale:   { name:"龙鳞",     type:"resource", quality:"epic",   basePrice:150 },
  ancient_jade:   { name:"古玉",     type:"resource", quality:"legendary", basePrice:500 },
  spirit_stone:   { name:"灵石",     type:"currency", quality:"common", basePrice:10 },
  iron_sword:     { name:"铁剑",     type:"equipment", quality:"common", basePrice:100 },
  cloth_robe:     { name:"布袍",     type:"equipment", quality:"common", basePrice:80 },
  spirit_blade:   { name:"灵刃",     type:"equipment", quality:"rare",   basePrice:300 },
  thunder_edge:   { name:"雷刃",     type:"equipment", quality:"epic",   basePrice:600 },
  spirit_vest:    { name:"灵甲",     type:"equipment", quality:"rare",   basePrice:250 },
  dragon_scale_armor:{ name:"龙鳞甲",type:"equipment", quality:"epic",   basePrice:500 },
  jade_ring:      { name:"玉戒",     type:"equipment", quality:"rare",   basePrice:200 },
  phoenix_ring:   { name:"凤戒",     type:"equipment", quality:"epic",   basePrice:800 },
  qi_necklace:    { name:"灵气项坠", type:"equipment", quality:"rare",   basePrice:200 },
  dragon_fang:    { name:"龙牙剑",   type:"equipment", quality:"legendary", basePrice:2000 },
  spirit_talisman:{ name:"护身符",   type:"equipment", quality:"common", basePrice:150 },
};

// Get dynamic price considering economy + region + reputation
export function getDynamicPrice(itemId, basePrice, kernel, regionId) {
  const economyTable = kernel.world.globalState.economy?.priceTable || {};
  const econMod = economyTable[itemId] ? economyTable[itemId] / basePrice : 1.0;

  // Region price modifier
  const regionMod = {
    area_bamboo_grove: 0.9, area_misty_peak: 1.0, area_thunder_valley: 1.1, area_dragon_vein: 1.3
  }[regionId] || 1.0;

  // Weather modifier
  const weather = kernel.world.globalState.weather?.get("world") || "clear";
  const weatherMod = { "clear":1.0, "rain":1.05, "storm":1.10, "fog":0.95 }[weather] || 1.0;

  return Math.round(basePrice * econMod * regionMod * weatherMod);
}

// Get shop data for a region
export function getShopForRegion(regionId, kernel) {
  const template = REGION_SHOPS[regionId] || REGION_SHOPS.area_bamboo_grove;
  const shop = { name: template.name, items: [] };
  for (const [itemId, data] of Object.entries(template.inventory)) {
    const itemDef = SHOP_ITEMS[itemId];
    if (!itemDef) continue;
    const price = getDynamicPrice(itemId, itemDef.basePrice, kernel, regionId);
    shop.items.push({
      id: itemId,
      name: itemDef.name,
      type: itemDef.type,
      quality: itemDef.quality,
      price,
      stock: data.stock,
    });
  }
  return shop;
}

// Buy an item from the shop
export function buyItem(player, itemId, kernel) {
  const shop = REGION_SHOPS[player.getComponent("Location")?.area] || REGION_SHOPS.area_bamboo_grove;
  const itemData = shop.inventory[itemId];
  if (!itemData) return { error: "该区域无此商品" };
  if (itemData.stock <= 0) return { error: "已售罄" };

  const itemDef = SHOP_ITEMS[itemId];
  if (!itemDef) return { error: "未知物品" };

  const price = getDynamicPrice(itemId, itemDef.basePrice, kernel, player.getComponent("Location")?.area);
  const pInv = player.getComponent("Inventory") || { items: {} };
  const spiritStones = pInv.items.spirit_stone || 0;
  if (spiritStones < price) return { error: `灵石不足 (需要 ${price}, 持有 ${spiritStones})` };

  // Deduct spirit stones, add item
  const newInv = { items: { ...pInv.items, spirit_stone: spiritStones - price } };
  newInv.items[itemId] = (newInv.items[itemId] || 0) + 1;
  itemData.stock--;
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "Inventory", newInv, up.version);
  return { ok: true, msg: `购买 ${itemDef.name} 成功 (-${price}灵石)`, price, item: itemDef.name };
}

// Sell an item to the shop
export function sellItem(player, itemId, kernel) {
  const pInv = player.getComponent("Inventory") || { items: {} };
  const count = pInv.items[itemId] || 0;
  if (count <= 0) return { error: "背包中无此物品" };

  const itemDef = SHOP_ITEMS[itemId];
  if (!itemDef) return { error: "不可出售的物品" };

  const price = Math.floor(getDynamicPrice(itemId, itemDef.basePrice, kernel, player.getComponent("Location")?.area) * 0.5); // Sell at half price
  const newInv = { items: { ...pInv.items, [itemId]: count - 1, spirit_stone: (pInv.items.spirit_stone || 0) + price } };
  const up = kernel.getEntity(player.id);
  kernel.updateComponent(up.id, "Inventory", newInv, up.version);
  return { ok: true, msg: `出售 ${itemDef.name} 成功 (+${price}灵石)`, price, item: itemDef.name };
}
