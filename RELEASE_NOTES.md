# Project Celestial v1.0.0 — Living World Foundation

Release Date: 2026-07-25  
Status: Stable  

## Overview

Project Celestial v1.0.0 establishes the Living World Foundation — a deterministic, persistent universe runtime where a simulated cultivation world evolves autonomously.

The player enters a world that already exists, not one built around them.

## Architecture

- **Runtime**: Node.js ES Module, deterministic tick-based simulation
- **Kernel API**: Sole legal interface for world state changes (ACID transactions, optimistic locking)
- **ECS**: Entity-Component System with 15+ component types
- **Replay**: Full event replay from snapshot + event log
- **Snapshot**: World state serialization and restoration
- **21 ADR**: Architecture Decision Records for all major decisions

## Living World

### Simulation Pipeline (11 systems)
```
Weather → Qi → NPC → Economy → Sect → Relations → SectLife → MonsterSpawn → MonsterAI → MonsterEncounter → NPCSect
```

### World Event Engine
- 31 event types across 12 categories
- Chain events (cave → treasure, ruins → manual, meteor → crater)
- Region-specific probability tables
- Player choices with success rates, rewards, and penalties

### NPC AI
- Autonomous cultivation and breakthrough
- Travel between regions (10%/tick)
- Resource gathering (15%/tick)
- Rest and stamina recovery (20%/tick)
- Relationship formation (friend/enemy, 5%/tick)
- Sect joining and leaving (5%/tick join, 2%/tick leave)

### Sect System
- Sect lifecycle: founding → growth → maturity → schism → decline
- 5 rank tiers (disciple, elite, elder, vice-leader, leader)
- Contribution points and auto-promotion
- 6 mission types

### Economy
- Dynamic pricing based on region, weather, season
- 4 region shops with distinct inventories

## Web Interface

- **Game Page** (`/`): Three-column RPG layout with cultivation, shop, dialogue, sect panels
- **Living World Observer** (`/living-world.html`): Real-time world feed, NPC chronicles, world timeline
- **Developer Console** (`/console.html`): Raw API access
- **WOC Operations Center** (`/observatory.html`): Simulation control

## Player Systems

- Cultivation (3 modes: safe/normal/risky)
- Area Qi influence on cultivation speed
- Stamina consumption and rest recovery
- Breakthrough system (immediate/suppress/jade boost)
- 14 achievements with auto-tracking
- Reputation system with titles

## Engineering

- **Git Flow**: main ← develop ← feature branches
- **CI/CD**: GitHub Actions workflow (install, build, test, verify)
- **Performance**: 609 ticks/sec verified
- **Test Coverage**: 76/77 assertions passing (98%)
- **Deterministic**: Same seed + same inputs = same world state

## Known Limitations

The following gameplay systems are implemented as experimental previews and will be fully supported in Project Celestial v2.0:

- Combat System (turn-based combat engine)
- Monster Ecology (spawn, AI, NPC encounters — NPC death disabled)
- Skill System (14 skills across 7 categories)
- Equipment System (13 items across 5 quality tiers)
- Shop System (4 region shops with dynamic pricing)
- Dialogue System (dynamic, context-aware NPC conversation)

**Important**: Monsters cannot kill NPCs in this release (HP floor of 10).

## Dependencies

- Node.js 24.x
- No external runtime dependencies (pure Node.js stdlib)

## GitHub

https://github.com/shangyz32-pixel/ProjectCelestial

- `main` — production branch
- `develop` — development branch  
- `release/v1.0.0` — v1.0.0 release branch

## Files

- 150+ files across runtime, web, tests, docs, specs, Canon
- 21 ADR documents
- 8 spec documents
- 8 test suites
