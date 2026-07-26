const B='http://localhost:3000';
const out=document.getElementById('output');
const cmd=document.getElementById('cmd');

let playerData=null,worldState={tick:0};

function doCmd(action){
  cmd.value=action;
  sendCmd();
}

function toggleMap(){
  const p=document.getElementById('map-panel');
  p.classList.toggle('show');
}
function updateMapHighlight(area){
  // Remove all 'here' classes
  document.querySelectorAll('.map-spot').forEach(s=>s.classList.remove('here'));
  // Map area names to spot IDs
  const areaMap={新手村:'map-town',翠竹林:'map-bamboo',area_bamboo_grove:'map-bamboo',云雾峰:'map-misty',area_misty_peak:'map-misty',雷音谷:'map-thunder',area_thunder_valley:'map-thunder',龙脉秘境:'map-dragon',area_dragon_vein:'map-dragon'};
  const spotId=areaMap[area];
  if(spotId){const s=document.getElementById(spotId);if(s)s.classList.add('here')}
}

function log(msg,cls=''){
  const d=document.createElement('div');d.className='msg'+(cls?' '+cls:'');
  d.textContent=msg;out.appendChild(d);out.scrollTop=out.scrollHeight;
  if(out.children.length>200)out.removeChild(out.children[0]);
}

function updateHUD(p){
  if(!p)return;
  playerData=p;
  document.getElementById('hp').textContent=(p.hp_current||100)+'/'+(p.hp_max||100);
  document.getElementById('qi').textContent=(p.qi_current||p.qi||50)+'/'+(p.qi_max||50);
  document.getElementById('stam').textContent=p.stam_current||p.stamina_current||0;
  const realms=['凡人','炼气期','筑基期','金丹期','元婴期','化神期','渡劫期'];
  document.getElementById('realm').textContent=realms[p.realm_id||1]||'炼气期';
  document.getElementById('progress').textContent=Math.round((p.cultivation||p.progress||0)*100)+'%';
  document.getElementById('name').textContent=p.name||'云游道人';
}

const P=(p,d)=>fetch(B+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d||{})}).then(r=>r.json());
const G=p=>fetch(B+p).then(r=>r.json());

async function refresh(){
  const w=await G('/api/world');
  if(w){
    worldState=w;
    document.getElementById('tick').textContent='T'+w.tick;
    document.getElementById('ents').textContent=w.entities+'体';
    const wInfo=w.weather?w.weather.get?.('world'):null;
    document.getElementById('weather').textContent=wInfo||'晴';
    document.getElementById('qiVal').textContent=(w.qi||1).toFixed(2);
  }
  const p=await G('/api/game/player');
  if(p&&p.player){
    updateHUD(p.player);
    playerData=p.player;
    if(!playerData.current_area)playerData.current_area=p.player.area||'area_bamboo_grove';
  }
}

async function sendCmd(){
  const text=cmd.value.trim();cmd.value='';
  if(!text)return;
  log('▸ '+text,'msg-system');

  const parts=text.split(/\s+/);
  const action=parts[0];

  try{
    switch(action){
      case '修炼': case 'cultivate':{
        const mode=parts[1]||'risky';
        const r=await P('/api/game/cultivate',{mode});
        if(r.ok)log(`🧘 ${r.msg}`,r.breakthrough_ready?'msg-milestone':'msg-cultivate');
        else log(`⚠ ${r.msg}`,'msg-system');
        break;
      }
      case '休息': case 'rest':{
        const r=await P('/api/game/rest');
        log(`🛌 ${r.msg||'恢复体力'}`,r.ok?'msg-cultivate':'msg-system');
        break;
      }
      case '探索': case 'explore':{
        const areaNames={翠竹林:'area_bamboo_grove',bamboo:'area_bamboo_grove',云雾峰:'area_misty_peak',misty:'area_misty_peak',雷音谷:'area_thunder_valley',thunder:'area_thunder_valley',龙脉:'area_dragon_vein',龙脉秘境:'area_dragon_vein',dragon:'area_dragon_vein',新手村:'area_bamboo_grove'};
        const areaName=parts[1];
        const area=areaNames[areaName]||playerData?.current_area||'area_bamboo_grove';
        const r=await P('/api/game/explore',{area});
        if(r.type==='fight')log(`⚔ ${r.monster?.name||'怪物'}出现！造成${r.playerDmg}伤害，受${r.monsterDmg}伤`,part[1]==='victory'?'msg-combat':'msg-combat');
        else if(r.type==='victory')log(`💀 击杀${r.monster?.name}！掉落: ${(r.loot||[]).join(' ')}`,'msg-item');
        else log(`${r.msg||'探索中...'} [第${r.step||'?'}步]`,r.milestone?'msg-milestone':'msg-event');
        break;
      }
      case '采集': case 'gather':{
        const r=await P('/api/game/alchemy/gather',{herb:parts[1]||'spirit_grass'});
        log(r.empty?'未找到灵草':'🌿 采集 '+r.herb+' +1','msg-item');
        break;
      }
      case '突破': case 'breakthrough':{
        const r=await P('/api/game/breakthrough');
        log(r.ok?`💫 ${r.msg||'突破成功！'}`:`❌ ${r.msg||r.error||'突破失败'}`,'msg-milestone');
        break;
      }
      case '状态': case 'status': case '查看':{
        const p=await G('/api/game/player');
        const d=p.player||p;
        if(d){
          log(`═══ 修士状态 ═══`,'msg-system');
          log(`姓名: ${d.name||'无名'}  |  境界: ${document.getElementById('realm').textContent}`,'msg-system');
          log(`功法: ${d.method||'基础吐纳'}  |  灵根: ${d.spirit_root||'未知'}`,'msg-system');
          log(`体力: ${d.stam_current||d.stamina_current||0}  |  探索次数: ${d.explored||0}`,'msg-system');
          const inv=d.inventory||d.items||{};
          const names={spirit_herb:'灵草',jade_shard:'灵石碎片',spirit_stone:'灵石',ancient_jade:'古玉',dragon_scale:'龙鳞',thunder_ore:'雷晶'};
          const items=Object.entries(inv).filter(([,v])=>v>0).map(([k,v])=>`${names[k]||k} ×${v}`);
          if(items.length)log(`🎒 背包: ${items.join(' | ')}`,'msg-item');
          else log('🎒 背包: 空空如也','msg-system');
        }
        break;
      }
      case '世界': case 'world':{
        const w=await G('/api/world');
        const qiTide=await G('/api/world/qi-tide').catch(()=>({}));
        log(`═══ 世界状态 ═══`,'msg-system');
        log(`Tick: ${w.tick}  |  灵气: ${(w.qi||1).toFixed(2)}  |  天气: ${w.weather||'晴'}`,'msg-event');
        log(`实体: ${w.entities}  |  NPC: ${w.npcs||0}  |  灵潮: ${qiTide.tide||'正常'}`,'msg-system');
        const npcs=await G('/api/npcs');
        if(Array.isArray(npcs)){
          log(`活跃修士: ${npcs.length}人`,'msg-npc');
          for(const n of npcs.slice(0,5)){
            log(`  ${n.name||'无名修士'} · ${n.realm||'??'} · ${n.area||'??'}`,'msg-npc');
          }
        }
        break;
      }
      case '帮助': case 'help':{
        log(`═══ 可用命令 ═══`,'msg-system');
        log(`修炼|休息|探索|采集|突破|状态|世界|帮助`,'msg-system');
        log(`探索 <区域>  — 探索特定区域 (翠竹林/云雾峰/雷音谷/龙脉)`,'msg-system');
        log(`采集 <灵草名> — spirit_grass / fire_flower / frost_lotus`,'msg-system');
        break;
      }
      default:
        log(`未知命令: ${action}。输入 "帮助" 查看可用命令。`,'msg-system');
    }
  }catch(e){log(`错误: ${e.message}`,'msg-danger')}
  await refresh();
}

cmd.addEventListener('keydown',e=>{if(e.key==='Enter')sendCmd()});

(async()=>{
  const p=await G('/api/game/player');
  if(!p.player||!p.player.name){await P('/api/game/player/create',{name:'云游道人'});log('☯ 新修士降临...','msg-event')}
  await refresh();
  log('═══════════════════════════════','msg-system');
  log('  欢迎来到修仙世界','msg-milestone');
  log('  输入"帮助"查看可用命令','msg-system');
  log('═══════════════════════════════','msg-system');
  // World news
  const w=await G('/api/world');
  log(`📰 天历${w.year||'?'}年 · ${w.season||'春'}季 · 世界Tick ${w.tick}`,'msg-weather');
  log(`🌿 灵气密度: ${(w.qi||1).toFixed(2)}  ·  活跃实体: ${w.entities}`,'msg-weather');
})();
setInterval(refresh,8000);