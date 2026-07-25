// runtime/bootstrap/logger.js
// Simple structured logger for Runtime.

export class Logger {
  constructor(module) {
    this.module = module;
  }

  child(sub) {
    return new Logger(`${this.module}:${sub}`);
  }

  _log(level, msg) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${level}] [${this.module}] ${msg}`);
  }

  debug(msg) { this._log("DEBUG", msg); }
  info(msg)  { this._log("INFO", msg); }
  warn(msg)  { this._log("WARN", msg); }
  error(msg) { this._log("ERROR", msg); }
}
