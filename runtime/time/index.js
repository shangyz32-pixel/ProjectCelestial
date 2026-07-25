// runtime/time/index.js
// Time Service — deterministic world clock with day/night.
// Follows: /specs/TIME_SPEC.md

import { Logger } from "../bootstrap/logger.js";

export class TimeService {
  static HOURS_PER_DAY = 12;
  static SEASONS = ["春", "夏", "秋", "冬"];
  static SEASON_DAYS = [90, 90, 92, 93];

  // Day phases based on 时辰 (hour 0-11)
  static DAY_PHASES = {
    0: "dawn",    // 卯时 5-7 — 阳气初升
    1: "day",     // 辰时
    2: "day",     // 巳时
    3: "day",     // 午时
    4: "day",     // 未时
    5: "dusk",    // 酉时 17-19 — 阴气初升
    6: "night",   // 戌时 — rest
    7: "night",   // 亥时 — rest
    8: "night",   // 子时 — rest
    9: "night",   // 丑时
    10: "night",  // 寅时
    11: "dawn",   // 卯时
  };

  constructor(config, log) {
    this.log = log || new Logger("Time");
    this.worldTime = {
      tick: 0,
      year: config.time.start_year,
      month: 7,
      day: config.time.start_day,
      hour: 6,
      day_phase: TimeService.DAY_PHASES[6], // "night"
      season: "夏",
      era: "天历纪元",
      day_of_year: this._dayOfYear(7, config.time.start_day),
    };
  }

  advance() {
    this.worldTime.tick++;
    this.worldTime.day++;
    this.worldTime.day_of_year++;

    // Hour cycle (12 时辰)
    this.worldTime.hour = (this.worldTime.hour + 1) % TimeService.HOURS_PER_DAY;
    this.worldTime.day_phase = TimeService.DAY_PHASES[this.worldTime.hour];

    // Month rollover (30-day months)
    if (this.worldTime.day > 30) {
      this.worldTime.day = 1;
      this.worldTime.month++;
      if (this.worldTime.month > 12) {
        this.worldTime.month = 1;
        this.worldTime.year++;
      }
    }

    // Season
    this._updateSeason();

    this.log.debug(`Tick ${this.worldTime.tick}: 天历${this.worldTime.year}-${this.worldTime.month}-${this.worldTime.day} ${this.worldTime.day_phase} ${this.worldTime.season}`);
  }

  getTime() { return { ...this.worldTime }; }
  getTick() { return this.worldTime.tick; }
  isNight() { return this.worldTime.day_phase === "night"; }
  isDay()   { return this.worldTime.day_phase === "day"; }

  _dayOfYear(month, day) {
    let doy = day;
    for (let i = 1; i < month; i++) doy += 30;
    return doy;
  }

  _updateSeason() {
    const doy = this.worldTime.day_of_year;
    if (doy <= 90) this.worldTime.season = "春";
    else if (doy <= 180) this.worldTime.season = "夏";
    else if (doy <= 272) this.worldTime.season = "秋";
    else this.worldTime.season = "冬";
  }
}
