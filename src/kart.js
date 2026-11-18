/* Scratch Quest — Kart Dash, the second arcade game.
 * A 60-second top-down race on a winding road. Steer your kart (with your own avatar driving),
 * pass rival karts, grab coins, hit boost pads, and stay out of the grass and the oil.
 * Score = distance + passes + coins. Draws on a <canvas>; no images or sound files.
 *
 * SQ_KART.create(canvas, { avatar: Image|null, kart: { color, accent, speed, handling, boost, offroad },
 *                          power: ['shield', 'magnet', 'double'], onEnd: function (score, stats) {} }) -> { stop }
 */
var SQ_KART = (function () {
  var W = 420, H = 600, PY = H - 150, ROAD = 230, RACE = 60;
  var RIVAL_COLORS = [['#3a86ff', '#fff'], ['#22a559', '#fde047'], ['#a855f7', '#fff'], ['#f97316', '#1f2937'], ['#ec4899', '#fff'], ['#14b8a6', '#fde047']];
  function center(d) { return W / 2 + 62 * Math.sin(d / 420) + 34 * Math.sin(d / 173 + 1.3); }
  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  // a kart seen from above, pointing up the screen
  function drawKart(g, x, y, tilt, color, accent, head) {
    g.save(); g.translate(x, y); g.rotate(tilt);
    g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, -19, -24, 40, 56, 10); g.fill();
    g.fillStyle = '#1f2937';
    [[-23, -22], [13, -22], [-24, 10], [14, 10]].forEach(function (w) { rr(g, w[0], w[1], 10, 16, 3); g.fill(); });
    g.fillStyle = color; rr(g, -17, -28, 34, 54, 10); g.fill();
    g.fillStyle = accent; rr(g, -11, -32, 22, 9, 4); g.fill();            // front bumper
    g.fillRect(-2.5, -24, 5, 14);                                         // racing stripe
    g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, -13, 16, 26, 7, 3); g.fill();  // rear wing
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 2, 13, 0, 7); g.fill();
    if (head && head.complete && head.naturalWidth) {
      g.save(); g.beginPath(); g.arc(0, 2, 12, 0, 7); g.clip(); g.drawImage(head, -15, -15, 30, 30); g.restore();
    } else { g.fillStyle = accent; g.beginPath(); g.arc(0, 2, 9, 0, 7); g.fill(); }
    g.restore();
  }
  function create(canvas, opts) {
    opts = opts || {};
    var K = opts.kart || {}, kSpeed = K.speed || 1, kHandle = K.handling || 1, kBoost = K.boost || 1, kOff = K.offroad || 0;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var has = {}; (opts.power || []).forEach(function (p) { has[p] = true; });
    var shield = !!has.shield;
    var MAXV = 330 * kSpeed, x = center(0), tx = null, keyL = false, keyR = false, tilt = 0;
    var d = 0, v = 0, t = -2.4, boost = 0, spin = 0, bump = 0;
    var things = [], pops = [], nextThing = 260, passes = 0, coins = 0, bonus = 0;
    var over = false, overT = 0, stopped = false, finished = false, raf = 0, last = 0;
    function sound(n) { if (typeof SQ_SOUND !== 'undefined') SQ_SOUND.play(n); }
    function pop(px, py, text, color) { pops.push({ x: px, y: py, text: text, color: color || '#fff', life: 0.9 }); }
    function score() { return Math.floor(d / 10) + bonus; }
    function dbl() { return has.double && t >= 0 && t < 30 ? 2 : 1; }
    function spawn() {
      var at = d + H + 40, r = Math.random(), off = (Math.random() - 0.5) * (ROAD - 70);
      if (r < 0.34) things.push({ kind: 'rival', d: at, off: off, v: MAXV / kSpeed * (0.5 + Math.random() * 0.22), c: RIVAL_COLORS[Math.floor(Math.random() * RIVAL_COLORS.length)], sway: Math.random() * 6, passed: false });
      else if (r < 0.74) { for (var i = 0; i < 4; i++) things.push({ kind: 'coin', d: at + i * 46, off: off }); }
      else if (r < 0.88) things.push({ kind: 'boost', d: at, off: off });
      else things.push({ kind: 'oil', d: at, off: off });
      nextThing = d + 210 + Math.random() * 190 - Math.min(90, t * 1.5);
    }
    function update(dt) {
      if (over) { overT += dt; return; }
      t += dt;
      if (t < 0) return;
      boost = Math.max(0, boost - dt); spin = Math.max(0, spin - dt); bump = Math.max(0, bump - dt);
      var c = center(d + 0), offroad = Math.abs(x - c) > ROAD / 2 - 8;
      var top = MAXV * (boost > 0 ? 1.55 : 1) * (offroad ? 0.45 + 0.4 * kOff : 1) * (spin > 0 ? 0.55 : 1);
      v += (top - v) * Math.min(1, dt * (v < top ? 1.6 : 3.5));
      d += v * dt;
      var steer = spin > 0 ? 0 : (keyR ? 1 : 0) - (keyL ? 1 : 0);
      if (steer) { x += steer * 250 * kHandle * dt; tx = null; }
      else if (tx != null && spin <= 0) { var dx = tx - x, m = 330 * kHandle * dt; x += Math.max(-m, Math.min(m, dx)); steer = Math.abs(dx) > 4 ? (dx > 0 ? 1 : -1) : 0; }
      x = Math.max(24, Math.min(W - 24, x));
      tilt += ((spin > 0 ? Math.sin(t * 30) * 0.9 : steer * 0.22) - tilt) * Math.min(1, dt * 12);
      if (offroad && Math.floor(t * 8) % 2 === 0 && v > 60) pops.length < 6 && pops.push({ x: x + (Math.random() - 0.5) * 30, y: PY + 30, text: '•', color: '#6b4f2a', life: 0.35 });
      if (d >= nextThing) spawn();
      var magnet = has.magnet && t < 20;
      for (var i = things.length - 1; i >= 0; i--) {
        var o = things[i];
        if (o.kind === 'rival') { o.d += o.v * dt; }
        var oy = PY - (o.d - d), ox = center(o.d) + o.off + (o.kind === 'rival' ? Math.sin(t * 1.3 + o.sway) * 14 : 0);
        if (o.kind === 'coin' && magnet && oy > 80) { o.off += (x - ox) * Math.min(1, dt * 4); ox = center(o.d) + o.off; }
        if (oy > H + 60) { things.splice(i, 1); continue; }
        var hit = Math.abs(ox - x) < (o.kind === 'rival' ? 32 : 28) && Math.abs(oy - PY) < (o.kind === 'rival' ? 46 : 30);
        if (o.kind === 'rival') {
          if (hit && bump <= 0) {
            if (shield) { shield = false; pop(x, PY - 50, 'Shield!', '#8ecae6'); sound('locked'); bump = 0.8; }
            else { v *= 0.45; bump = 0.9; sound('wrong'); pop(x, PY - 50, 'Bump!', '#ff8fa3'); x += (x < ox ? -1 : 1) * 16; }
          } else if (!o.passed && oy > PY + 40) { o.passed = true; passes++; bonus += 30 * dbl(); pop(x, PY - 56, 'Pass! +' + 30 * dbl(), '#ffd60a'); sound('step'); }
        } else if (hit) {
          things.splice(i, 1);
          if (o.kind === 'coin') { coins++; bonus += 10 * dbl(); pop(ox, oy, '+' + 10 * dbl(), '#ffd60a'); sound('coin'); }
          else if (o.kind === 'boost') { boost = 1.5 * kBoost; pop(x, PY - 56, 'Boost!', '#7dd3fc'); sound('whoosh'); }
          else if (spin <= 0 && bump <= 0) {
            if (shield) { shield = false; pop(x, PY - 50, 'Shield!', '#8ecae6'); sound('locked'); }
            else { spin = 0.8; sound('wrong'); pop(x, PY - 50, 'Slip!', '#ff8fa3'); }
          }
        }
      }
      for (var k = pops.length - 1; k >= 0; k--) { pops[k].life -= dt; pops[k].y += (pops[k].text === '•' ? 120 : -50) * dt; if (pops[k].life <= 0) pops.splice(k, 1); }
      if (t >= RACE) { over = true; sound('fanfare'); setTimeout(finish, 1500); }
    }
    function draw() {
      // grass, in two shades that scroll
      for (var y = -80; y < H + 40; y += 40) {
        var yy = y + (d % 40), band = Math.round((d - (d % 40) + PY - y) / 40);
        g.fillStyle = band % 2 ? '#4caf50' : '#43a047';
        g.fillRect(0, yy, W, 41);
      }
      // road in thin strips
      var step = 6;
      for (var sy = -step; sy < H + step; sy += step) {
        var wd = d + (PY - sy), cx = center(wd), stripe = Math.floor(wd / 36) % 2;
        g.fillStyle = stripe ? '#e63946' : '#f8f9fa'; g.fillRect(cx - ROAD / 2 - 8, sy, ROAD + 16, step + 1);
        g.fillStyle = '#4b5563'; g.fillRect(cx - ROAD / 2, sy, ROAD, step + 1);
        if (Math.floor(wd / 44) % 2) { g.fillStyle = '#fde047'; g.fillRect(cx - 3, sy, 6, step + 1); }
      }
      things.forEach(function (o) {
        var oy = PY - (o.d - d), ox = center(o.d) + o.off + (o.kind === 'rival' ? Math.sin(t * 1.3 + o.sway) * 14 : 0);
        if (oy < -60) return;
        if (o.kind === 'coin') { g.fillStyle = '#ffd60a'; g.strokeStyle = '#e85d04'; g.lineWidth = 3; g.beginPath(); g.arc(ox, oy, 11, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#e85d04'; g.fillRect(ox - 2, oy - 6, 4, 12); }
        else if (o.kind === 'boost') {
          g.fillStyle = '#0ea5e9'; rr(g, ox - 26, oy - 22, 52, 44, 8); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
          [-8, 6].forEach(function (yy) { g.beginPath(); g.moveTo(ox - 12, oy + yy + 6); g.lineTo(ox, oy + yy - 6); g.lineTo(ox + 12, oy + yy + 6); g.stroke(); });
        } else if (o.kind === 'oil') { g.fillStyle = '#111827'; g.beginPath(); g.ellipse(ox, oy, 26, 17, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(ox - 8, oy - 5, 8, 4, 0.3, 0, 7); g.fill(); }
        else drawKart(g, ox, oy, 0, o.c[0], o.c[1], null);
      });
      if (boost > 0) { g.fillStyle = '#fb923c'; g.beginPath(); g.moveTo(x - 9, PY + 26); g.lineTo(x, PY + 50 + Math.random() * 16); g.lineTo(x + 9, PY + 26); g.fill(); }
      if (!(bump > 0 && Math.floor(bump * 14) % 2 === 0)) drawKart(g, x, PY, tilt, K.color || '#ef4444', K.accent || '#fde047', opts.avatar);
      if (shield) { g.strokeStyle = '#8ecae6'; g.lineWidth = 3; g.fillStyle = 'rgba(142,202,230,.22)'; g.beginPath(); g.arc(x, PY, 40, 0, 7); g.fill(); g.stroke(); }
      pops.forEach(function (p) {
        g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.8)); g.font = '900 21px Nunito, system-ui, sans-serif'; g.textAlign = 'center';
        g.lineWidth = 5; g.strokeStyle = 'rgba(20,8,50,.8)'; g.strokeText(p.text, p.x, p.y); g.fillStyle = p.color; g.fillText(p.text, p.x, p.y);
      });
      g.globalAlpha = 1;
      // HUD: time left, score, speed bar
      g.fillStyle = 'rgba(20,8,50,.55)'; rr(g, 10, 10, W - 20, 44, 12); g.fill();
      var left = Math.max(0, Math.ceil(RACE - Math.max(0, t)));
      g.textAlign = 'left'; g.font = '900 26px Nunito, system-ui, sans-serif'; g.fillStyle = left <= 10 ? '#ff8fa3' : '#fff'; g.fillText(left + 's', 24, 41);
      g.textAlign = 'right'; g.fillStyle = '#ffd60a'; g.fillText(String(score()), W - 24, 41);
      g.fillStyle = 'rgba(255,255,255,.25)'; rr(g, 110, 26, 150, 12, 6); g.fill();
      g.fillStyle = boost > 0 ? '#7dd3fc' : '#22c55e'; rr(g, 110, 26, Math.max(6, 150 * Math.min(1, v / (MAXV * 1.55))), 12, 6); g.fill();
      if (dbl() > 1) { g.textAlign = 'center'; g.font = '800 12px Nunito, system-ui, sans-serif'; g.fillStyle = '#ffd60a'; g.fillText('x2 points', 185, 22); }
      if (t < 0) {
        var n = Math.ceil(-t / 0.8);
        g.textAlign = 'center'; g.font = '900 96px "Titan One", Nunito, system-ui, sans-serif';
        g.lineWidth = 10; g.strokeStyle = '#1b1035'; g.strokeText(String(n), W / 2, H / 2 - 40); g.fillStyle = '#ffd60a'; g.fillText(String(n), W / 2, H / 2 - 40);
        g.font = '800 18px Nunito, system-ui, sans-serif'; g.lineWidth = 5; g.strokeText('Stay on the road. Pass the karts!', W / 2, H / 2 + 10); g.fillStyle = '#fff'; g.fillText('Stay on the road. Pass the karts!', W / 2, H / 2 + 10);
      }
      if (over) {
        g.fillStyle = 'rgba(20,8,50,' + Math.min(0.7, overT) + ')'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.font = '900 54px "Titan One", Nunito, system-ui, sans-serif';
        g.lineWidth = 8; g.strokeStyle = '#1b1035'; g.strokeText('Finish!', W / 2, H / 2 - 20); g.fillStyle = '#fff'; g.fillText('Finish!', W / 2, H / 2 - 20);
        g.font = '900 34px Nunito, system-ui, sans-serif'; g.fillStyle = '#ffd60a'; g.fillText(score() + ' points', W / 2, H / 2 + 30);
      }
    }
    function frame(ts) {
      if (stopped) return;
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
      update(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function finish() { if (finished || stopped) return; finished = true; if (opts.onEnd) opts.onEnd(score(), { passes: passes, coins: coins, distance: Math.round(d / 10) }); }
    function toX(e) { var r = canvas.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; }
    function onMove(e) { tx = toX(e); }
    function onDown(e) { tx = toX(e); try { canvas.setPointerCapture(e.pointerId); } catch (x2) { } }
    function onKey(e) {
      var down = e.type === 'keydown', k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keyL = down; e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'd' || k === 'D') { keyR = down; e.preventDefault(); }
    }
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    raf = requestAnimationFrame(frame);
    return {
      stop: function () {
        stopped = true; cancelAnimationFrame(raf);
        canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
      }
    };
  }
  // a small picture of a kart for the garage (returns an SVG string)
  function icon(color, accent, size) {
    return '<svg class="kart-ico" viewBox="0 0 60 70" width="' + (size || 60) + '" aria-hidden="true">' +
      '<g fill="#1f2937"><rect x="4" y="10" width="11" height="17" rx="3"/><rect x="45" y="10" width="11" height="17" rx="3"/><rect x="3" y="42" width="12" height="18" rx="3"/><rect x="45" y="42" width="12" height="18" rx="3"/></g>' +
      '<rect x="11" y="5" width="38" height="60" rx="12" fill="' + color + '"/><rect x="18" y="1" width="24" height="10" rx="4" fill="' + accent + '"/><rect x="27.5" y="9" width="5" height="16" fill="' + accent + '"/>' +
      '<rect x="15" y="54" width="30" height="8" rx="3" fill="rgba(0,0,0,.28)"/><circle cx="30" cy="38" r="12" fill="#fff"/><circle cx="30" cy="38" r="8" fill="' + accent + '"/></svg>';
  }
  return { create: create, icon: icon, RACE: RACE };
})();
