// runtime/combat/element.js
// v2.2 Sprint 4 M8 — Element Registry
// Single authority for element interactions. Deterministic.

import { getElementMultiplier } from "./index.js";

const ELEMENTS = ["metal","wood","water","fire","earth","lightning","ice","wind","light","dark","heaven","chaos"];

export const ElementRegistry = {
  _elements: new Set(ELEMENTS),
  register(id) { this._elements.add(id); return true; },
  has(id) { return this._elements.has(id); },
  list() { return [...this._elements]; },
  getMultiplier(attElement, defElement) {
    const attRoot = { element:attElement, id:"dynamic", rarity:"common" };
    const defRoot = { element:defElement, id:"dynamic", rarity:"common" };
    return getElementMultiplier(attRoot, defRoot);
  },
  getAffinity(elem1, elem2) {
    const m = this.getMultiplier({element:elem1},{element:elem2});
    if (m > 1) return "strong";
    if (m < 1) return "weak";
    return "neutral";
  },
  describe(elem1, elem2) {
    const m = this.getMultiplier({element:elem1},{element:elem2});
    if (m > 1) return `${elem1} 克 ${elem2}`;
    if (m < 1) return `${elem1} 被 ${elem2} 克`;
    return `${elem1} — ${elem2}`;
  },
};
