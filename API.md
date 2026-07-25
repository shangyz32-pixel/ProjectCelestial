# Project Celestial API Reference v1.0.1

Base URL: `http://localhost:3000`

## Core API

### GET /api/world
World state summary.

**Response:**
```json
{"world_id":"celestial-001","tick":1041,"entities":20,"npcs":3,"weather":"clear","qi":0.95,"season":"春"}
```

### GET /api/npcs
List active NPCs.

**Response:**
```json
[{"id":"npc_0001","name":"陈玄","age":200,"realm_id":5,"hp":100,"stamina":85}]
```

### GET /api/events?limit=N
Recent world events.

**Response:**
```json
[{"eventId":"...","tick":1000,"type":"EntityUpdated","target":"npc_0001","payload":{...}}]
```

### POST /api/sim/pause
Pause simulation.

### POST /api/sim/resume
Resume simulation.

### POST /api/sim/tick
Advance one tick.

### POST /api/npc/create
Create NPC.

```json
{"name":"Name","realm":1,"hp":100}
```

---

## Game API

### GET /api/game/player
Current player state. Auto-checks achievements.

**Response:**
```json
{
  "newAchievements": [{"id":"first_cultivate","name":"初窥门径","icon":"🌱"}],
  "player": {
    "name":"凌云子","realm_id":2,"cultivation":0.45,
    "hp_current":85,"hp_max":100,
    "stamina_current":70,"stamina_max":100,
    "current_area":"area_misty_peak",
    "inventory":{"spirit_herb":5,"jade_shard":3},
    "reputation":{"score":50,"title":"宗主"},
    "legacy":{"founded_sect":"凌云宗"},
    "achievements":[{"id":"first_cultivate","name":"初窥门径","icon":"🌱"}]
  }
}
```

### GET /api/game/areas
Available exploration areas with realm requirements.

### GET /api/game/player/resources
Player inventory items only.

### GET /api/game/shop/list
Shop inventory for current area.

### GET /api/game/sect/info
Player's sect membership details.

### POST /api/game/player/create
Create player character.

```json
{"name":"道号"}
```

### POST /api/game/cultivate
Cultivate. Modes: `safe`, `normal`, `risky`. Optionally `use_herb:true`.

```json
{"mode":"normal"}
```

**Response:**
```json
{"msg":"普通修炼... (+1.5%) 📍翠竹林 Qi0.8 ⚡-3","ok":true}
```

### POST /api/game/rest
Recover 30 stamina.

### POST /api/game/breakthrough/attempt
Attempt breakthrough. `use_jade:true` for jade boost.

### POST /api/game/explore
Travel to area. Triggers exploration events (40% chance).

```json
{"area":"area_misty_peak"}
```

### POST /api/game/gather
Gather resource from current area.

```json
{"resource":"spirit_herb"}
```

### POST /api/game/shop/buy
Buy item with spirit_stones.

```json
{"item":"spirit_herb"}
```

### POST /api/game/shop/sell
Sell item for spirit_stones.

```json
{"item":"spirit_herb"}
```

### POST /api/game/dialogue
Talk to NPC.

```json
{"topic":"greeting"}
```

Topics: `greeting`, `rumor`, `trade`, `quest`, `goodbye`

### POST /api/game/sect/found
Found a sect.

```json
{"name":"宗门名"}
```

### POST /api/game/sect/join
Join existing sect.

```json
{"name":"青云宗"}
```

### POST /api/game/sect/leave
Leave current sect.

### POST /api/game/sect/mission
Complete sect mission.

```json
{"mission":"gather"}
```

Missions: `cultivate`, `gather`, `explore`, `defeat`, `recruit`, `patrol`

### POST /api/game/event/resolve
Resolve exploration event choice.

```json
{"eventId":"evt_...","choice":"enter"}
```

---

## Combat API (Experimental)

### POST /api/game/combat/start
Start combat with nearest NPC.

### POST /api/game/combat/action
Process combat action.

```json
{"battleId":"battle_...","action":"attack"}
```

Actions: `attack`, `defend`, `flee`, `skill`

With skill:
```json
{"battleId":"battle_...","action":"skill","skill":"sword_rain"}
```

---

## Error Responses

All endpoints return errors in format:

```json
{"error":"Description"}
```

Common errors:
- `"No player"` — Create character first
- `"No NPCs"` — NPCs may be inactive, restart server
- `"VERSION_MISMATCH"` — Entity version conflict, retry
- `"Not Found"` — Invalid endpoint or missing body
