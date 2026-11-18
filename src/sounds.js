/* Scratch Quest — little sound effects made with the browser's Web Audio (no sound files).
 * Quiet by default. Students can mute; teachers can turn sounds off for a whole class.
 */
var SQ_SOUND = (function () {
  var ctx = null, muted = false, classOff = false;
  try { muted = localStorage.getItem('sq-sound') === 'off'; } catch (e) { }
  function ac() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // one note: frequency, start offset (s), length (s), wave type, volume
  function tone(c, f, at, len, type, vol, slideTo) {
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + len);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + len + 0.02);
  }
  var SFX = {
    tap: function (c) { tone(c, 660, 0, .06, 'triangle', .06); },
    pop: function (c) { tone(c, 420, 0, .09, 'sine', .14, 900); },
    step: function (c) { tone(c, 880, 0, .12, 'triangle', .1); tone(c, 1320, .07, .16, 'triangle', .08); },
    coin: function (c) { tone(c, 988, 0, .08, 'square', .05); tone(c, 1319, .07, .22, 'square', .05); },
    buy: function (c) { tone(c, 784, 0, .08, 'square', .05); tone(c, 1046, .07, .08, 'square', .05); tone(c, 1568, .14, .3, 'triangle', .09); tone(c, 2093, .2, .3, 'sine', .05); },
    equip: function (c) { tone(c, 523, 0, .07, 'triangle', .09); tone(c, 784, .06, .14, 'triangle', .09); },
    correct: function (c) { tone(c, 660, 0, .1, 'triangle', .1); tone(c, 880, .09, .1, 'triangle', .1); tone(c, 1175, .18, .22, 'triangle', .1); },
    wrong: function (c) { tone(c, 220, 0, .18, 'sine', .08, 160); },
    badge: function (c) { [1046, 1319, 1568, 2093].forEach(function (f, i) { tone(c, f, i * .07, .25, 'sine', .07); }); },
    levelup: function (c) { [523, 659, 784, 1046].forEach(function (f, i) { tone(c, f, i * .11, .22, 'square', .045); }); tone(c, 1046, .46, .55, 'triangle', .1); tone(c, 1568, .46, .55, 'sine', .05); },
    locked: function (c) { tone(c, 196, 0, .12, 'triangle', .07); },
    buzz: function (c) { tone(c, 110, 0, .22, 'sawtooth', .05); tone(c, 104, .02, .22, 'square', .03); },
    ready: function (c) { tone(c, 784, 0, .1, 'triangle', .08); tone(c, 1175, .09, .2, 'triangle', .08); },
    doorbell: function (c) { [0, .9].forEach(function (t) { tone(c, 659, t, .5, 'sine', .16); tone(c, 523, t + .38, .7, 'sine', .16); tone(c, 1318, t, .25, 'triangle', .03); }); },
    tick: function (c) { tone(c, 1500, 0, .03, 'triangle', .035); },
    star: function (c) { tone(c, 1175, 0, .1, 'triangle', .09); tone(c, 1760, .06, .28, 'sine', .08); },
    stamp: function (c) { tone(c, 150, 0, .22, 'sine', .22, 55); tone(c, 90, 0, .08, 'square', .06); },
    whoosh: function (c) { tone(c, 260, 0, .38, 'sine', .07, 1300); tone(c, 390, .03, .34, 'triangle', .03, 1700); },
    sparkle: function (c) { [2093, 2637, 3136, 2349, 2794].forEach(function (f, i) { tone(c, f, i * .06, .14, 'sine', .035); }); },
    fanfare: function (c) {
      [523, 659, 784].forEach(function (f, i) { tone(c, f, i * .1, .16, 'square', .045); });
      [523, 659, 784, 1046].forEach(function (f) { tone(c, f, .32, .7, 'triangle', .055); });
    },
    reveal: function (c) { tone(c, 220, 0, .55, 'sawtooth', .025, 880); tone(c, 330, 0, .55, 'triangle', .04, 1320); },
    legendary: function (c) {
      [784, 988, 1175, 1568].forEach(function (f, i) { tone(c, f, i * .09, .2, 'square', .04); });
      [784, 988, 1175, 1568, 2093].forEach(function (f) { tone(c, f, .4, 1.1, 'triangle', .045); });
      [2637, 3136, 3520].forEach(function (f, i) { tone(c, f, .5 + i * .12, .3, 'sine', .03); });
    }
  };
  return {
    play: function (name) {
      if (muted || classOff || !SFX[name]) return;
      try { var c = ac(); if (c) SFX[name](c); } catch (e) { /* audio not available */ }
    },
    muted: function () { return muted || classOff; },
    toggle: function () { muted = !muted; try { localStorage.setItem('sq-sound', muted ? 'off' : 'on'); } catch (e) { } return !muted; },
    setClassOff: function (off) { classOff = !!off; }
  };
})();
