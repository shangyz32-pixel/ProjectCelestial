// runtime/entity/index.js
// Entity — unique ID + version + components.
// Follows: /specs/ENTITY_SPEC.md, /specs/COMPONENT_SPEC.md

export class Entity {
  constructor(type, id) {
    // I-01: ID once allocated, never changes
    this.id = id;
    this.type = type;

    // I-02: Version starts at 1, increments on UpdateComponent
    this.version = 1;

    // Components: name → value
    this.components = new Map();

    // Lifecycle (ENTITY_SPEC)
    this.state = "active"; // active | inactive | deceased | archived

    this.createdAt = new Date().toISOString();
  }

  getComponent(name) {
    return this.components.get(name);
  }

  hasComponent(name) {
    return this.components.has(name);
  }

  // Serialize for Snapshot
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      state: this.state,
      components: Object.fromEntries(this.components),
      createdAt: this.createdAt,
    };
  }
}
