# Changelog

All notable changes to Project Celestial will be documented in this file.

## [v1.0.1] — 2026-07-25

### Fixed
- Shop/sect API endpoints use correct HTTP methods (GET vs POST)
- NPC death from monster encounters prevented (min 10 HP floor)
- Server process stability with PTY mode
- Duplicate `const d` declaration causing JS SyntaxError
- Sect panel displays even when no sect is joined

### Added
- API documentation (API.md)
- Release notes (RELEASE_NOTES.md)
- Performance benchmark tests (verify_perf_100k.js)

## [v1.0.0] — 2026-07-25 — Living World Foundation

### Core Architecture
- Runtime: Node.js ES Module deterministic simulation engine
- Kernel API: ACID transactions, optimistic locking, event audit trail
- ECS: Entity-Component System (Identity, Realm, HP, Stamina, Inventory, Location, Skills, Equipment, Relationships, Reputation, Legacy, Achievements)
- Replay: Full event replay from snapshot + event log
- Snapshot: World state serialization and restoration
- Time Service: Tick/day/season/era system
- World Random: Seeded PRNG for deterministic simulation

### Simulation Systems (11)
- Weather System (clear/cloudy/rain/storm/snow/fog)
- Qi Density System (seasonal fluctuations)
- NPC System (cultivation, breakthrough, travel, gather, rest)
- Economy System (dynamic pricing by region/weather/season)
- Sect System (lifecycle, recruitment, expansion, schism)
- Relationship System (friend/enemy formation)
- Enhanced Sect Lifecycle (age progression, decline)
- Monster Spawn System (region-based, habitat-matching)
- Monster AI System (patrol, hunt, rest state machine)
- Monster Encounter System (NPC combat with monsters)
- NPC Sect Behavior System (autonomous join/leave)

### World Event Engine
- 31 event types across 12 categories
- Chain events (cave→treasure, ruins→ancient_manual, meteor→crater)
- Player choices with success rates, rewards, and fail penalties
- Region-specific probability tables
- World impact tracking

### Player Systems
- Cultivation (safe/normal/risky modes)
- Area Qi influence on cultivation speed
- Stamina consumption and rest recovery
- Breakthrough (immediate/suppress/jade boost)
- Character creation and persistence
- Inventory management
- Region exploration with realm-level gating
- Resource gathering per area

### Web Interface
- Game page: three-column RPG layout
- Living World Observer: real-time world feed + NPC chronicles + world timeline
- Developer Console: raw API access
- WOC Operations Center: simulation controls
- Achievement display (14 achievements)
- Shop/dialogue/sect interactive panels
- Notification system with color coding

### NPC Systems
- 3 starter NPCs with skills and equipment
- Autonomous behavior: cultivate, travel, gather, rest, join/leave sects
- Relationship formation between NPCs
- Monster encounters with combat resolution

### Sect System
- Player sect founding
- 5 rank tiers (disciple → leader)
- Contribution and promotion
- 6 mission types
- Sect lifecycle (founding → peak → schism → decline)

### Engineering
- Git Flow branching model (main/develop)
- GitHub Actions CI/CD pipeline
- Performance benchmark: 609 ticks/sec
- Test suite: 76/77 passing (98%)
- Architecture Freeze with 21 ADRs
- Issue/PR templates
- Security policy
- MIT License

### Experimental / Preview Systems
- Combat Engine (turn-based: attack/defend/dodge/flee)
- Monster Ecology (6 types, spawn/AI/encounter)
- Skill System (14 skills × 7 categories)
- Equipment System (13 items × 5 quality tiers)
- Shop System (4 region shops, dynamic pricing)
- Dialogue System (context-aware, relationship-based)
- Advanced Sect Gameplay (ranks, missions, treasury)

### Known Issues
- 1 pre-existing test assertion (snapshot HP restore)
- NPCs cannot permanently die from monsters (HP floor of 10)
- Chinese character encoding may show garbled text in some API outputs
- Server requires PTY mode for stable background operation

## [Pre-v1.0.0] — 2026-07-21 to 2026-07-24

- Architecture Freeze established (v1.0.0)
- 21 ADRs written covering all major architecture decisions
- Stage A-F completed (Architecture through Living World)
- Runtime module structure established
- Sprint 0: Initial runtime implementation (M1-M9)
- Deterministic Simulation Engine validated
- Web Observer v0.3.0 implemented
- Engineering infrastructure (Git Flow, CI, GitHub configuration)
- Governance and project consciousness established
- Axiom 001-004 defined (Simulation First, Distributed First, One Loop First, World Before Player)
- 8 spec documents (Entity, Event, Time, World State, Kernel API, Transaction, Network Protocol, Snapshot)
