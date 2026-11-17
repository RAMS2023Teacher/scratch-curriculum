/* Scratch Quest — Arcade rules (shared by the server and the page).
 * The arcade is a reward, not a distraction:
 *   - The teacher controls it: Locked, Earned (students spend a ticket for a short pass), or Free play.
 *   - Opening it always sets a closing time, so it can't stay open after class.
 *   - Tickets come from finished quests (1 each) or can be bought with coins.
 *   - Power-ups are one-use items bought with coins.
 */
var SQ_ARCADE = (function () {
  var GAME = 'Block Rush';
  var POWERUPS = [
    { id: 'shield', name: 'Bug Shield', price: 15, color: '#3a86ff', desc: 'Blocks the first bug that hits you.' },
    { id: 'slow', name: 'Slow-Mo', price: 15, color: '#06d6a0', desc: 'Everything falls slower for the first 20 seconds.' },
    { id: 'magnet', name: 'Block Magnet', price: 20, color: '#ef476f', desc: 'Pulls code blocks toward you for 20 seconds.' },
    { id: 'heart', name: 'Extra Heart', price: 20, color: '#ff4d6d', desc: 'Start with 4 hearts instead of 3.' },
    { id: 'double', name: 'Double Points', price: 25, color: '#ffb703', desc: 'Every point counts twice for the first 30 seconds.' }
  ];
  var POWER = {};
  POWERUPS.forEach(function (p) { POWER[p.id] = p; });
  var DEFAULTS = { mode: 'off', closes: 0, passMin: 5, ticketPrice: 40, season: 1 };
  var MAX_POWER = 2;          // power-ups per run
  var RUN_MAX_MS = 12 * 60e3; // a run longer than this is not accepted
  var GRACE_MS = 3 * 60e3;    // a run started before the pass ended may still finish

  function config(c) {
    var a = (c && c.arcade) || {}, o = {};
    for (var k in DEFAULTS) o[k] = a[k] === undefined ? DEFAULTS[k] : a[k];
    return o;
  }
  // The mode right now: an open arcade closes itself at its closing time.
  function liveMode(cfg, now) {
    if (cfg.mode === 'off') return 'off';
    if (cfg.closes && now > cfg.closes) return 'off';
    return cfg.mode;
  }
  function blank() { return { spent: 0, inv: {}, bought: 0, used: 0, until: 0, best: 0, season: 0, allBest: 0, plays: 0, run: null }; }
  function stateOf(state) {
    var a = state.arcade || (state.arcade = blank()), b = blank();
    for (var k in b) if (a[k] === undefined) a[k] = b[k];
    return a;
  }
  // One ticket for every finished quest, plus any bought with coins, minus those used.
  function tickets(a, doneCount) { return Math.max(0, (doneCount || 0) + (a.bought || 0) - (a.used || 0)); }
  // Most points a fair run could reach in this much time (the game tops out well below this).
  function scoreCap(ms) { return Math.round(500 + Math.max(0, ms) / 1000 * 250); }

  return { GAME: GAME, POWERUPS: POWERUPS, POWER: POWER, DEFAULTS: DEFAULTS, MAX_POWER: MAX_POWER, RUN_MAX_MS: RUN_MAX_MS, GRACE_MS: GRACE_MS,
    config: config, liveMode: liveMode, stateOf: stateOf, tickets: tickets, scoreCap: scoreCap };
})();
