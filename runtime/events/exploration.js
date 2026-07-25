// runtime/events/exploration.js → World Event Engine v0.4.1
// Unified event framework. All events from Runtime simulation.

import { WorldRandom } from "../random/index.js";

export const EVENT_CATEGORIES = {
  exploration:"探索",cultivation:"修炼",breakthrough:"突破",battle:"战斗",
  treasure:"宝藏",merchant:"商人",ruins:"遗迹",cave:"洞穴",spirit_beast:"灵兽",
  weather:"天象",disaster:"灾祸",festival:"节庆",sect:"宗门",
  resource:"资源",mystery:"秘境",legendary:"传说",
};

export const ALL_EVENT_TYPES = {
  treasure:{category:"treasure",title:"宝箱现世",desc:"前方发现一个古老的宝箱，散发着微弱的灵光。",choices:[{id:"open",label:"开启宝箱",success:0.7,reward:{spirit_stone:50,random_item:true},risk:"机关陷阱",failPenalty:{hp:-20}},{id:"observe",label:"小心观察",success:0.9,reward:{spirit_stone:20}},{id:"leave",label:"转身离开",success:1.0,reward:{}}]},
  monster:{category:"battle",title:"妖兽拦路",desc:"一只妖兽挡住了去路，眼中闪烁着凶光。",choices:[{id:"fight",label:"正面战斗",success:0.5,reward:{spirit_stone:100,random_item:true},risk:"受伤",failPenalty:{hp:-30}},{id:"evade",label:"绕道而行",success:0.8,reward:{spirit_stone:10}},{id:"retreat",label:"迅速撤退",success:1.0,reward:{}}]},
  ruins:{category:"ruins",title:"远古遗迹",desc:"前方是一座被藤蔓覆盖的远古遗迹。",choices:[{id:"enter",label:"深入探索",success:0.4,reward:{ancient_jade:1,spirit_stone:200},risk:"强敌守卫",failPenalty:{hp:-40},chain:"ancient_manual"},{id:"search",label:"外围搜寻",success:0.7,reward:{dragon_scale:1,spirit_stone:50}},{id:"leave",label:"标记后离开",success:1.0,reward:{spirit_stone:10}}]},
  merchant:{category:"merchant",title:"游方商人",desc:"一位游方商人向你招手。",choices:[{id:"trade",label:"交易物品",success:1.0,reward:{spirit_stone:30,trade:true}},{id:"ignore",label:"径直走过",success:1.0,reward:{}}]},
  cave:{category:"cave",title:"隐秘洞穴",desc:"山壁间露出一个隐秘的洞穴入口。",choices:[{id:"enter",label:"进入洞穴",success:0.6,reward:{random_item:true,spirit_herb:3},risk:"洞内危险",failPenalty:{hp:-15},chain:"cave_treasure"},{id:"observe",label:"观察洞口",success:0.9,reward:{spirit_herb:1}},{id:"leave",label:"记录后离开",success:1.0,reward:{}}]},
  traveler:{category:"exploration",title:"迷途修士",desc:"一位受伤的修士靠在树下。",choices:[{id:"help",label:"出手相助",success:0.8,reward:{jade_shard:2},risk:"陷阱",failPenalty:{hp:-10}},{id:"ignore",label:"冷眼旁观",success:1.0,reward:{}}]},
  spirit_beast:{category:"spirit_beast",title:"灵兽现身",desc:"一只浑身发光的灵兽从林中走出。",choices:[{id:"tame",label:"尝试驯服",success:0.3,reward:{random_item:true,reputation:50},risk:"灵兽攻击",failPenalty:{hp:-25},worldImpact:{spirit_beast_tamed:1}},{id:"observe",label:"安静观察",success:0.8,reward:{spirit_stone:30}},{id:"leave",label:"悄悄离开",success:1.0,reward:{}}]},
  resource:{category:"resource",title:"天材地宝",desc:"前方灵气浓郁，似乎有珍贵资源生长。",choices:[{id:"collect",label:"全力采集",success:0.6,reward:{random_item:true,spirit_herb:5},risk:"惊动守护兽",failPenalty:{hp:-15}},{id:"partial",label:"适量采集",success:0.9,reward:{spirit_herb:2}},{id:"leave",label:"不取不义",success:1.0,reward:{}}]},
  phenomenon:{category:"mystery",title:"天地异象",desc:"天空中出现奇异的光芒，灵气浓度暴增。",choices:[{id:"meditate",label:"原地感悟",success:0.5,reward:{cultivation_bonus:0.15},risk:"灵气反噬",failPenalty:{hp:-20,cultivation_bonus:-0.05}},{id:"observe",label:"小心观察",success:0.8,reward:{cultivation_bonus:0.05}},{id:"leave",label:"远离异象",success:1.0,reward:{}}]},
  sect_recruitment:{category:"sect",title:"宗门招新",desc:"青云宗弟子正在招募新成员。",choices:[{id:"join",label:"加入宗门",success:0.7,reward:{reputation:20},risk:"考核失败",failPenalty:{hp:-10}},{id:"decline",label:"婉言谢绝",success:1.0,reward:{}}]},
  spirit_storm:{category:"disaster",title:"灵潮风暴",desc:"天空骤然变色，灵气暴走形成风暴！",choices:[{id:"shelter",label:"寻找庇护",success:0.8,reward:{spirit_stone:10}},{id:"absorb",label:"强行吸收灵气",success:0.3,reward:{cultivation_bonus:0.20},risk:"经脉断裂",failPenalty:{hp:-50}},{id:"flee",label:"飞速逃离",success:0.6,reward:{},risk:"被风暴追赶"}]},
  ancient_manual:{category:"legendary",title:"上古功法",desc:"遗迹深处发现了一部古老的修炼功法！",choices:[{id:"study",label:"研习功法",success:0.4,reward:{cultivation_bonus:0.30,ancient_jade:1},risk:"走火入魔",failPenalty:{hp:-30,cultivation_bonus:-0.10}},{id:"copy",label:"抄录副本",success:0.7,reward:{cultivation_bonus:0.10}},{id:"leave",label:"封印遗址",success:1.0,reward:{reputation:10}}]},
  cave_treasure:{category:"treasure",title:"洞中宝藏",desc:"洞穴深处竟然藏着一处古老的宝藏！",choices:[{id:"open",label:"开启宝藏",success:0.6,reward:{spirit_stone:200,ancient_jade:1,random_item:true},risk:"守护者苏醒",failPenalty:{hp:-30}},{id:"leave",label:"谨慎退出",success:1.0,reward:{spirit_stone:20}}]},

  // ─── Phase 2 + 3: New Events ───
  secret_realm:{category:"legendary",title:"秘境入口",desc:"一道空间裂缝通向未知的秘境世界！",choices:[{id:"enter",label:"踏入秘境",success:0.3,reward:{ancient_jade:2,spirit_stone:500,random_item:true},risk:"秘境崩塌",failPenalty:{hp:-50},worldImpact:{secret_realms_opened:1}},{id:"wait",label:"等待时机",success:0.6,reward:{spirit_stone:100}},{id:"seal",label:"封印入口",success:0.9,reward:{reputation:15}},{id:"leave",label:"远离裂缝",success:1.0,reward:{}}]},
  mystery_sound:{category:"mystery",title:"诡异之声",desc:"远处传来若有若无的歌声，扰动心神。",choices:[{id:"investigate",label:"循声而去",success:0.4,reward:{spirit_stone:80,random_item:true},risk:"心神被惑",failPenalty:{hp:-20},chain:"siren_encounter"},{id:"resist",label:"紧守心神",success:0.7,reward:{cultivation_bonus:0.08}},{id:"flee",label:"迅速离开",success:1.0,reward:{}}]},
  floating_sword:{category:"legendary",title:"悬空古剑",desc:"一柄古剑悬浮在半空中，剑气凌厉。",choices:[{id:"draw",label:"拔取古剑",success:0.2,reward:{spirit_stone:300,random_item:true},risk:"剑气反噬",failPenalty:{hp:-40},worldImpact:{legendary_sword_claimed:1}},{id:"observe",label:"感受剑意",success:0.6,reward:{cultivation_bonus:0.12}},{id:"leave",label:"恭敬退去",success:1.0,reward:{reputation:5}}]},
  falling_meteor:{category:"mystery",title:"天降陨石",desc:"一颗燃烧的陨石划破天际，坠落在山谷中！",choices:[{id:"rush",label:"抢先赶到",success:0.5,reward:{spirit_stone:200,thunder_ore:3},risk:"陨石辐射",failPenalty:{hp:-25},chain:"meteor_crater"},{id:"observe",label:"远处观望",success:0.9,reward:{spirit_stone:30}},{id:"ignore",label:"置之不理",success:1.0,reward:{}}]},
  beast_tide:{category:"disaster",title:"兽潮来袭",desc:"远处烟尘滚滚，无数妖兽从山林中涌出！",choices:[{id:"fight",label:"正面迎战",success:0.3,reward:{spirit_stone:300,random_item:true},risk:"重伤",failPenalty:{hp:-60}},{id:"defend",label:"协助防御",success:0.6,reward:{spirit_stone:100,reputation:10}},{id:"flee",label:"紧急撤离",success:0.9,reward:{},risk:"区域沦陷"}]},
  festival:{category:"festival",title:"修仙节庆",desc:"青云宗正在举办一年一度的修仙大典！",choices:[{id:"join",label:"参加庆典",success:1.0,reward:{cultivation_bonus:0.10,spirit_stone:50,reputation:5}},{id:"compete",label:"参加比试",success:0.5,reward:{spirit_stone:150,reputation:20},risk:"比试受伤",failPenalty:{hp:-20}},{id:"trade",label:"趁机交易",success:0.8,reward:{spirit_stone:80,trade:true}},{id:"ignore",label:"独自修炼",success:1.0,reward:{cultivation_bonus:0.05}}]},
  earthquake:{category:"disaster",title:"地动山摇",desc:"大地剧烈震动，山石崩塌！",choices:[{id:"shelter",label:"寻找庇护",success:0.7,reward:{spirit_stone:20}},{id:"rescue",label:"救助他人",success:0.6,reward:{reputation:15},risk:"余震",failPenalty:{hp:-25}},{id:"flee",label:"快速逃离",success:0.9,reward:{}}]},
  siren_encounter:{category:"mystery",title:"妖魅现身",desc:"一位妖魅正在吸取路人的精气！",choices:[{id:"fight",label:"攻击妖魅",success:0.4,reward:{spirit_stone:150,ancient_jade:1},risk:"被魅惑",failPenalty:{hp:-35}},{id:"save",label:"救下路人",success:0.7,reward:{reputation:20,jade_shard:2}},{id:"flee",label:"悄然离开",success:1.0,reward:{}}]},
  meteor_crater:{category:"mystery",title:"陨石坑洞",desc:"陨石砸出一个巨大坑洞，坑底有奇异矿石发光。",choices:[{id:"mine",label:"开采矿石",success:0.6,reward:{thunder_ore:5,spirit_stone:100},risk:"辐射中毒",failPenalty:{hp:-20}},{id:"study",label:"研究陨石",success:0.5,reward:{cultivation_bonus:0.15},risk:"精神冲击",failPenalty:{hp:-15}},{id:"leave",label:"远处观察",success:1.0,reward:{spirit_stone:20}}]},
  wandering_immortal:{category:"legendary",title:"游方仙人",desc:"一位白发仙人正坐在路边下棋。",choices:[{id:"learn",label:"请教棋道",success:0.3,reward:{cultivation_bonus:0.25,ancient_jade:1},risk:"心神耗尽",failPenalty:{hp:-30}},{id:"challenge",label:"对弈一局",success:0.5,reward:{reputation:30,cultivation_bonus:0.10}},{id:"observe",label:"恭敬旁观",success:0.8,reward:{cultivation_bonus:0.05}},{id:"leave",label:"不敢打扰",success:1.0,reward:{}}]},
  ghost_ruins:{category:"mystery",title:"幽灵遗迹",desc:"月光下，废弃古城中出现若隐若现的幽灵。",choices:[{id:"cleanse",label:"驱散幽灵",success:0.4,reward:{spirit_stone:150,reputation:20},risk:"被怨灵攻击",failPenalty:{hp:-35}},{id:"communicate",label:"尝试沟通",success:0.6,reward:{ancient_jade:1},risk:"心神受损",failPenalty:{hp:-15}},{id:"flee",label:"赶紧离开",success:1.0,reward:{}}]},
  herb_garden:{category:"resource",title:"灵药园",desc:"一片隐蔽的山谷中，各种灵药正在茂盛生长。",choices:[{id:"harvest",label:"尽情采摘",success:0.7,reward:{spirit_herb:8,random_item:true},risk:"守护阵法",failPenalty:{hp:-15}},{id:"selective",label:"精选采集",success:0.9,reward:{spirit_herb:3}},{id:"leave",label:"原路返回",success:1.0,reward:{}}]},
  trade_caravan:{category:"merchant",title:"商队路过",desc:"一支大型商队正在此地休整，货物琳琅满目。",choices:[{id:"trade",label:"大肆采购",success:1.0,reward:{spirit_stone:50,trade:true}},{id:"invest",label:"投资商队",success:0.5,reward:{spirit_stone:200},risk:"商队遭劫"},{id:"ignore",label:"径自离去",success:1.0,reward:{}}]},
};

// Region event probabilities
const REGION_EVENT_TABLES = {
  area_bamboo_grove:{treasure:0.15,resource:0.15,traveler:0.10,merchant:0.10,sect_recruitment:0.08,mystery_sound:0.05,herb_garden:0.05,trade_caravan:0.05},
  area_misty_peak:{treasure:0.10,monster:0.10,cave:0.15,resource:0.10,spirit_beast:0.05,traveler:0.08,sect_recruitment:0.05,festival:0.05,ghost_ruins:0.03},
  area_thunder_valley:{monster:0.15,ruins:0.10,phenomenon:0.15,resource:0.10,spirit_beast:0.08,spirit_storm:0.10,beast_tide:0.05,earthquake:0.05,floating_sword:0.02,wandering_immortal:0.03},
  area_dragon_vein:{ruins:0.20,spirit_beast:0.15,phenomenon:0.15,treasure:0.10,monster:0.10,resource:0.05,ancient_manual:0.05,spirit_storm:0.05,cave_treasure:0.05,secret_realm:0.03,falling_meteor:0.03,wandering_immortal:0.05,ghost_ruins:0.05},
};

const RANDOM_ITEMS = ["spirit_herb","jade_shard","thunder_ore","dragon_scale","ancient_jade","spirit_stone"];

export class WorldEventEngine {
  constructor(seed) { this.random=new WorldRandom(seed);this.activeEvents=new Map();this.eventHistory=[];this.worldImpacts=new Map();this.pendingChains=[]; }
  generateEvent(regionId) {
    const probs=REGION_EVENT_TABLES[regionId]||REGION_EVENT_TABLES.area_bamboo_grove;
    const roll=this.random.nextFloat(0,1);let cum=0;
    for(const[type,prob] of Object.entries(probs)){cum+=prob;if(roll<cum){const t=ALL_EVENT_TYPES[type];if(!t)continue;
    return{eventId:`evt_${Date.now()}_${Math.floor(Math.random()*10000)}`,type,category:t.category,title:t.title,description:t.desc,region:regionId,choices:t.choices.map(c=>({...c,reward:c.reward?{...c.reward}:{}})),timestamp:Date.now(),resolved:false};}}
    return null;
  }
  resolveChoice(event,choiceId,kernel) {
    const c=event.choices.find(x=>x.id===choiceId);if(!c)return{success:false,message:"无效选择"};
    const success=Math.random()<c.success;
    const o={success,eventId:event.eventId,eventType:event.type,category:event.category,choice:choiceId,reward:{...(c.reward||{})},risk:c.risk,failPenalty:!success?(c.failPenalty||{}):null,chainEvent:c.chain||null,worldImpact:c.worldImpact||null,message:success?`${event.title} — 成功！${c.reward?"获得奖励。":""}`:`${event.title} — 失败！${c.risk||"遭遇意外。"}`};
    if(o.reward.random_item)o.reward.random_item_resolved=RANDOM_ITEMS[Math.floor(Math.random()*RANDOM_ITEMS.length)];
    this.eventHistory.push({eventId:event.eventId,type:event.type,category:event.category,region:event.region,choice:choiceId,success,timestamp:Date.now()});
    if(c.chain&&success){const ct=ALL_EVENT_TYPES[c.chain];if(ct)this.pendingChains.push({type:c.chain,region:event.region,triggeredBy:event.eventId});}
    if(c.worldImpact&&success)for(const[k,v] of Object.entries(c.worldImpact))this.worldImpacts.set(k,(this.worldImpacts.get(k)||0)+v);
    this.activeEvents.delete(event.eventId);event.resolved=true;return o;
  }
  npcDecide(event,s){const r=s.realm_id||1;const risky=event.choices.filter(c=>c.success<0.5);const safe=event.choices.filter(c=>c.success>=0.8);if(r>=5&&risky.length>0)return risky[0].id;if(r<=2&&safe.length>0)return safe[safe.length-1].id;return event.choices[Math.floor(Math.random()*event.choices.length)]?.id||"leave";}
  popChainEvents(){return this.pendingChains.splice(0,this.pendingChains.length);}
  getSummary(){return{totalEvents:this.eventHistory.length,activeEvents:this.activeEvents.size,worldImpacts:Object.fromEntries(this.worldImpacts),recentEvents:this.eventHistory.slice(-10).reverse()};}
}

export {WorldEventEngine as ExplorationEventSystem};
