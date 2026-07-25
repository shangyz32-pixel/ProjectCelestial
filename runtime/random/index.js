// runtime/random/index.js
// World Random Service — seeded deterministic PRNG.
// All randomness must go through this service.
// Same seed + same call sequence → same results every time.

export class WorldRandom {
  // Mulberry32 — fast, deterministic, good distribution
  constructor(seed) {
    this.seed = seed;
    this.state = seed;
    this.callCount = 0;
  }

  // Returns float [0, 1)
  next() {
    this.callCount++;
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns int in [min, max] inclusive
  nextInt(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  // Returns float in [min, max)
  nextFloat(min, max) {
    return min + this.next() * (max - min);
  }

  // Returns true with given probability
  chance(probability) {
    return this.next() < probability;
  }

  // Pick random element from array
  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Reset to seed (for replay)
  reset() {
    this.state = this.seed;
    this.callCount = 0;
  }

  // Get current state for snapshot
  getState() {
    return { seed: this.seed, state: this.state, callCount: this.callCount };
  }

  // Restore state from snapshot
  setState(s) {
    this.seed = s.seed;
    this.state = s.state;
    this.callCount = s.callCount;
  }
}
