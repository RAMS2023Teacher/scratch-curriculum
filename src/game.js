/* Scratch Quest — Block Rush, the arcade mini-game.
 * Catch falling code blocks, dodge the bugs. Catching blocks in a row builds a combo multiplier.
 * Draws on a <canvas>; no images or sound files. The server checks every score it is sent.
 *
 * SQ_GAME.create(canvas, { avatar: Image|null, power: ['shield', ...], onEnd: function (score, stats) {} })
 *   -> { stop: function () {} }
 */
var SQ_GAME = (function () {
  var W = 420, H = 600, PY = H - 78, PS = 70;
  var BLOCK_COLORS = ['#4C97FF', '#9966FF', '#CF63CF', '#FFBF00', '#FFAB19', '#5CB1D6', '#59C059', '#FF8C1A'];
  var POWER_COLOR = { shield: '#3a86ff', slow: '#06d6a0', magnet: '#ef476f', heart: '#ff4d6d', double: '#ffb703' };
  var POWER_TIME = { slow: 20, magnet: 20, double: 30 };

  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    return 'rgb(' + Math.round(r * f) + ',' + Math.round(gg * f) + ',' + Math.round(b * f) + ')';
  }
  function drawBlock(g, o) {
    var x = o.x - o.w / 2, y = o.y - o.h / 2;
    g.fillStyle = shade(o.color, 0.72); rr(g, x, y + 4, o.w, o.h, 7); g.fill();
    g.fillStyle = o.color; rr(g, x, y, o.w, o.h, 7); g.fill();
    g.fillRect(x + 12, y - 5, 16, 6); // the little notch tab, like a Scratch block
    g.fillStyle = 'rgba(255,255,255,.85)'; rr(g, x + 9, y + o.h / 2 - 4, o.w * 0.45, 8, 4); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, x + o.w * 0.62, y + o.h / 2 - 6, o.w * 0.26, 12, 6); g.fill();
  }
  function drawBug(g, o, t) {
    var wig = Math.sin(t * 14 + o.seed) * 4;
    g.strokeStyle = '#1b1035'; g.lineWidth = 3; g.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      g.beginPath(); g.moveTo(o.x - 12, o.y + i * 7); g.lineTo(o.x - 24, o.y + i * 9 + wig * i); g.stroke();
      g.beginPath(); g.moveTo(o.x + 12, o.y + i * 7); g.lineTo(o.x + 24, o.y + i * 9 - wig * i); g.stroke();
    }
    g.beginPath(); g.moveTo(o.x - 5, o.y - 16); g.lineTo(o.x - 10, o.y - 26); g.moveTo(o.x + 5, o.y - 16); g.lineTo(o.x + 10, o.y - 26); g.stroke();
    g.fillStyle = '#e63946'; g.beginPath(); g.ellipse(o.x, o.y, 16, 19, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9d0208'; g.fillRect(o.x - 1.5, o.y - 12, 3, 30);
    g.fillStyle = '#1b1035'; g.beginPath(); g.arc(o.x - 6, o.y + 4, 3, 0, 7); g.arc(o.x + 7, o.y + 8, 3, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(o.x - 6, o.y - 12, 5, 0, 7); g.arc(o.x + 6, o.y - 12, 5, 0, 7); g.fill();
    g.fillStyle = '#1b1035'; g.beginPath(); g.arc(o.x - 5, o.y - 11, 2.4, 0, 7); g.arc(o.x + 7, o.y - 11, 2.4, 0, 7); g.fill();
  }
  function starPath(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    g.closePath();
  }
  function drawStar(g, o, t) {
    g.save(); g.translate(o.x, o.y); g.rotate(Math.sin(t * 3 + o.seed) * 0.3);
    g.shadowColor = '#ffd60a'; g.shadowBlur = 18; g.fillStyle = '#ffd60a'; starPath(g, 0, 0, 20); g.fill();
    g.shadowBlur = 0; g.strokeStyle = '#e85d04'; g.lineWidth = 3; g.stroke(); g.restore();
  }
  function heartPath(g, x, y, s) {
    g.beginPath(); g.moveTo(x, y + s * 0.35);
    g.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.35);
    g.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    g.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.35);
    g.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.35); g.closePath();
  }

  function create(canvas, opts) {
    opts = opts || {};
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    var g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var power = opts.power || [], has = {};
    power.forEach(function (p) { has[p] = true; });
    var maxHearts = 5, hearts = has.heart ? 4 : 3, shield = !!has.shield;
    var px = W / 2, tx = W / 2, keyL = false, keyR = false;
    var items = [], pops = [], score = 0, combo = 0, bestCombo = 0, caught = 0;
    var t = -2.4, spawnIn = 0, inv = 0, over = false, overT = 0, raf = 0, last = 0, stopped = false;
    var bg = []; for (var i = 0; i < 40; i++) bg.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + 0.4, v: Math.random() * 20 + 10 });

    function mult() { return Math.min(5, 1 + Math.floor(combo / 5)); }
    function active(p) { return has[p] && POWER_TIME[p] && t >= 0 && t < POWER_TIME[p]; }
    function spawn() {
      var r = Math.random(), bugP = Math.min(0.42, 0.18 + t * 0.004), kind = 'block';
      if (r < bugP) kind = 'bug'; else if (r < bugP + 0.05) kind = 'star'; else if (r < bugP + 0.062 && hearts < maxHearts) kind = 'heart';
      var w = kind === 'block' ? 64 : 44;
      items.push({ kind: kind, x: w / 2 + 8 + Math.random() * (W - w - 16), y: -30, w: w, h: kind === 'block' ? 34 : 40,
        v: (0.85 + Math.random() * 0.3) * Math.min(430, 150 + t * 3.2), color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)], seed: Math.random() * 9 });
    }
    function pop(x, y, text, color) { pops.push({ x: x, y: y, text: text, color: color || '#fff', life: 0.9 }); }
    function sound(n) { if (typeof SQ_SOUND !== 'undefined') SQ_SOUND.play(n); }

    function update(dt) {
      for (var b = 0; b < bg.length; b++) { bg[b].y += bg[b].v * dt; if (bg[b].y > H) { bg[b].y = 0; bg[b].x = Math.random() * W; } }
      if (over) { overT += dt; return; }
      t += dt;
      var dir = (keyR ? 1 : 0) - (keyL ? 1 : 0);
      if (dir) { px += dir * 460 * dt; tx = px; }
      tx = Math.max(PS / 2, Math.min(W - PS / 2, tx));
      px += (tx - px) * Math.min(1, dt * 16);
      px = Math.max(PS / 2, Math.min(W - PS / 2, px));
      if (t < 0) return; // countdown
      inv = Math.max(0, inv - dt);
      spawnIn -= dt;
      if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.32, 0.95 - t * 0.008) * (0.8 + Math.random() * 0.4); }
      var slow = active('slow') ? 0.55 : 1, magnet = active('magnet'), dbl = active('double') ? 2 : 1;
      for (var i = items.length - 1; i >= 0; i--) {
        var o = items[i];
        o.y += o.v * slow * dt;
        if (magnet && (o.kind === 'block' || o.kind === 'star') && o.y > H * 0.35) o.x += (px - o.x) * Math.min(1, dt * 2.6);
        var hit = Math.abs(o.x - px) < (o.w / 2 + PS / 2 - 12) && o.y + o.h / 2 > PY - PS / 2 + 8 && o.y - o.h / 2 < PY + PS / 2 - 8;
        if (hit) {
          items.splice(i, 1);
          if (o.kind === 'bug') {
            if (inv > 0) continue;
            if (shield) { shield = false; pop(px, PY - 50, 'Shield!', '#8ecae6'); sound('locked'); inv = 0.8; continue; }
            hearts -= 1; combo = 0; inv = 1.1; sound('wrong'); pop(px, PY - 50, 'Ouch!', '#ff8fa3');
            if (hearts <= 0) { over = true; sound('levelup'); setTimeout(finish, 1300); }
          } else if (o.kind === 'heart') { hearts = Math.min(maxHearts, hearts + 1); pop(o.x, o.y, '+1 heart', '#ff8fa3'); sound('equip'); }
          else {
            combo += 1; caught += 1; bestCombo = Math.max(bestCombo, combo);
            var pts = (o.kind === 'star' ? 50 : 10) * mult() * dbl;
            score += pts; pop(o.x, o.y, '+' + pts, o.kind === 'star' ? '#ffd60a' : '#fff');
            sound(o.kind === 'star' ? 'step' : 'coin');
            if (combo % 5 === 0 && mult() > 1) pop(px, PY - 70, 'Combo x' + mult() + '!', '#ffd60a');
          }
          continue;
        }
        if (o.y - o.h > H) { items.splice(i, 1); if (o.kind === 'block' && combo) { combo = 0; } }
      }
      for (var k = pops.length - 1; k >= 0; k--) { pops[k].life -= dt; pops[k].y -= 50 * dt; if (pops[k].life <= 0) pops.splice(k, 1); }
    }

    function draw() {
      var grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#24124d'); grd.addColorStop(1, '#4a1d96');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.7)';
      bg.forEach(function (s) { g.fillRect(s.x, s.y, s.s, s.s * 2); });
      g.fillStyle = 'rgba(255,255,255,.06)'; for (var gx = 0; gx < W; gx += 42) g.fillRect(gx, 0, 1, H);
      g.fillStyle = '#2b1366'; g.fillRect(0, PY + PS / 2 - 4, W, H); g.fillStyle = '#7b2ff7'; g.fillRect(0, PY + PS / 2 - 4, W, 4);
      items.forEach(function (o) {
        if (o.kind === 'block') drawBlock(g, o);
        else if (o.kind === 'bug') drawBug(g, o, t);
        else if (o.kind === 'star') drawStar(g, o, t);
        else { g.fillStyle = '#ff4d6d'; heartPath(g, o.x, o.y - 16, 34); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); }
      });
      // player
      var flash = inv > 0 && Math.floor(inv * 12) % 2 === 0;
      if (!flash) {
        if (active('magnet')) { g.strokeStyle = 'rgba(239,71,111,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(px, PY, PS * 0.78 + Math.sin(t * 8) * 3, 0, 7); g.stroke(); }
        if (opts.avatar && opts.avatar.complete && opts.avatar.naturalWidth) g.drawImage(opts.avatar, px - PS / 2 - 4, PY - PS / 2 - 8, PS + 8, PS + 8);
        else { g.fillStyle = '#ffd166'; g.beginPath(); g.arc(px, PY, PS / 2, 0, 7); g.fill(); }
        if (shield) { g.fillStyle = 'rgba(142,202,230,.25)'; g.strokeStyle = '#8ecae6'; g.lineWidth = 3; g.beginPath(); g.arc(px, PY, PS * 0.66, 0, 7); g.fill(); g.stroke(); }
      }
      pops.forEach(function (p) {
        g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); g.font = '900 22px Nunito, system-ui, sans-serif'; g.textAlign = 'center';
        g.lineWidth = 5; g.strokeStyle = 'rgba(20,8,50,.8)'; g.strokeText(p.text, p.x, p.y); g.fillStyle = p.color; g.fillText(p.text, p.x, p.y);
      });
      g.globalAlpha = 1;
      // HUD
      for (var hI = 0; hI < Math.max(hearts, 0); hI++) { g.fillStyle = '#ff4d6d'; heartPath(g, 22 + hI * 30, 14, 24); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
      g.textAlign = 'right'; g.font = '900 32px Nunito, system-ui, sans-serif';
      g.lineWidth = 6; g.strokeStyle = '#1b1035'; g.strokeText(String(score), W - 14, 40); g.fillStyle = '#fff'; g.fillText(String(score), W - 14, 40);
      if (mult() > 1) { g.font = '900 18px Nunito, system-ui, sans-serif'; g.fillStyle = '#ffd60a'; g.fillText('Combo x' + mult(), W - 14, 64); }
      var row = 0;
      ['slow', 'magnet', 'double'].forEach(function (p) {
        if (!active(p)) return;
        var left = POWER_TIME[p] - t, w = 70;
        g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, 14, 50 + row * 16, w, 10, 5); g.fill();
        g.fillStyle = POWER_COLOR[p]; rr(g, 14, 50 + row * 16, Math.max(4, w * left / POWER_TIME[p]), 10, 5); g.fill();
        g.textAlign = 'left'; g.font = '800 11px Nunito, system-ui, sans-serif'; g.fillStyle = '#fff';
        g.fillText(p === 'double' ? 'x2 points' : p === 'slow' ? 'slow-mo' : 'magnet', 90, 59 + row * 16); row++;
      });
      if (t < 0) {
        var n = Math.ceil(-t / 0.8);
        g.textAlign = 'center'; g.font = '900 96px "Titan One", Nunito, system-ui, sans-serif';
        g.lineWidth = 10; g.strokeStyle = '#1b1035'; g.strokeText(n > 0 ? String(n) : 'Go!', W / 2, H / 2); g.fillStyle = '#ffd60a'; g.fillText(n > 0 ? String(n) : 'Go!', W / 2, H / 2);
        g.font = '800 18px Nunito, system-ui, sans-serif'; g.fillStyle = '#fff';
        g.fillText('Catch blocks. Dodge bugs!', W / 2, H / 2 + 50);
      }
      if (over) {
        g.fillStyle = 'rgba(20,8,50,' + Math.min(0.7, overT) + ')'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.font = '900 52px "Titan One", Nunito, system-ui, sans-serif';
        g.lineWidth = 8; g.strokeStyle = '#1b1035'; g.strokeText('Game over', W / 2, H / 2 - 20); g.fillStyle = '#fff'; g.fillText('Game over', W / 2, H / 2 - 20);
        g.font = '900 36px Nunito, system-ui, sans-serif'; g.fillStyle = '#ffd60a'; g.fillText(score + ' points', W / 2, H / 2 + 30);
      }
    }
    function frame(ts) {
      if (stopped) return;
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
      update(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    var finished = false;
    function finish() { if (finished || stopped) return; finished = true; if (opts.onEnd) opts.onEnd(score, { caught: caught, bestCombo: bestCombo }); }
    function toX(e) { var r = canvas.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; }
    function onMove(e) { tx = toX(e); }
    function onDown(e) { tx = toX(e); try { canvas.setPointerCapture(e.pointerId); } catch (x) { } }
    function onKey(e) {
      var down = e.type === 'keydown', k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keyL = down; e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'd' || k === 'D') { keyR = down; e.preventDefault(); }
    }
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    raf = requestAnimationFrame(frame);
    return {
      stop: function () {
        stopped = true; cancelAnimationFrame(raf);
        canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
      },
      score: function () { return score; }
    };
  }
  return { create: create, W: W, H: H };
})();
