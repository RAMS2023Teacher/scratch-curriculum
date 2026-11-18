/* Scratch Quest — celebration effects.
 * Big moments (quest complete, badge, level up, a new item) get a full-screen reveal, one at a time.
 * Small moments (a step, a right answer, coins) get a quick burst near what was clicked.
 * Everything respects "reduce motion" (no movement, just the message) and the sound settings.
 */
var SQ_FX = (function () {
  var queue = [], open = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function play(n, delay) { if (typeof SQ_SOUND === 'undefined') return; if (delay) setTimeout(function () { SQ_SOUND.play(n); }, delay); else SQ_SOUND.play(n); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ---- particles flying out from a point (fixed position, so they survive a page redraw)
  function parts(n, colors, spread, cls) {
    var h = '';
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + rnd(-0.3, 0.3), dist = rnd(spread * 0.45, spread);
      h += '<i class="' + (cls || '') + (i % 3 === 0 ? ' star' : '') + '" style="--dx:' + Math.round(Math.cos(ang) * dist) + 'px;--dy:' + Math.round(Math.sin(ang) * dist) + 'px;--r:' + Math.round(rnd(-200, 200)) + 'deg;--d:' + rnd(0, 0.15).toFixed(2) + 's;background:' + colors[i % colors.length] + '"></i>';
    }
    return h;
  }
  function burst(el, opts) {
    if (!el || !el.getBoundingClientRect || reduced()) return;
    opts = opts || {};
    var r = el.getBoundingClientRect(), b = document.createElement('div');
    b.className = 'fx-burst' + (opts.ring === false ? '' : ' ring');
    b.style.left = (r.left + r.width / 2) + 'px'; b.style.top = (r.top + r.height / 2) + 'px';
    b.style.setProperty('--c', (opts.colors || ['#22c55e'])[0]);
    b.innerHTML = parts(opts.n || 14, opts.colors || ['#22c55e', '#facc15', '#3b82f6', '#a855f7'], opts.spread || 70);
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 900);
  }
  // coins arcing from one element to another (e.g. into the coin counter)
  function coinFly(fromEl, toEl, n, cls) {
    if (!fromEl || !toEl || reduced()) return;
    var a = fromEl.getBoundingClientRect(), z = toEl.getBoundingClientRect();
    n = Math.max(1, Math.min(8, n || 4));
    for (var i = 0; i < n; i++) (function (i) {
      var c = document.createElement('span');
      c.className = cls === 'star' ? 'fx-coin fx-star-fly' : 'fx-coin coin';
      var x0 = a.left + a.width / 2 + rnd(-14, 14), y0 = a.top + a.height / 2 + rnd(-8, 8);
      c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
      c.style.setProperty('--tx', (z.left + z.width / 2 - x0) + 'px');
      c.style.setProperty('--ty', (z.top + z.height / 2 - y0) + 'px');
      c.style.animationDelay = (i * 0.07) + 's';
      document.body.appendChild(c);
      setTimeout(function () { c.remove(); if (i === n - 1) { toEl.classList.remove('fx-bump'); void toEl.offsetWidth; toEl.classList.add('fx-bump'); play('tick'); } }, 760 + i * 70);
    })(i);
  }
  // numbers that count up, with a soft tick
  function countUp(el, to, ms) {
    if (!el) return;
    if (reduced() || to <= 0) { el.textContent = to.toLocaleString(); return; }
    var t0 = null, lastTick = 0;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / ms), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString();
      if (t - lastTick > 70 && k < 1) { lastTick = t; play('tick'); }
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- the full-screen reveal, one at a time
  function show(o) { queue.push(o); if (!open) next(); }
  function next() {
    var o = queue.shift();
    if (!o) { open = null; return; }
    var w = document.createElement('div');
    w.className = 'fx-wrap fx-' + o.kind + (o.rarity ? ' r-' + o.rarity : '');
    w.style.setProperty('--fx', o.color || '#7b2ff7');
    w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', o.label || 'Celebration');
    w.innerHTML = '<div class="fx-rays" aria-hidden="true"></div><div class="fx-parts" aria-hidden="true">' + parts(o.parts || 30, o.colors || ['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#fff'], o.spread || 340, 'big') + '</div>' +
      '<div class="fx-card">' + o.html + '<div class="fx-btns">' + (o.extra || '') + '<button class="btn ' + (o.okClass || 'primary') + ' big fx-ok">' + esc(o.ok || 'Awesome!') + '</button></div></div>';
    document.body.appendChild(w);
    open = w;
    var closed = false;
    function close() {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey);
      w.classList.add('out');
      setTimeout(function () { w.remove(); next(); }, reduced() ? 0 : 220);
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); } }
    w.addEventListener('click', function (e) { if (e.target === w || e.target.closest('.fx-ok') || e.target.closest('[data-fx-close]')) close(); });
    document.addEventListener('keydown', onKey);
    setTimeout(function () { var b = w.querySelector('.fx-ok'); if (b) b.focus(); }, 50);
    if (o.after) o.after(w);
    if (o.auto) setTimeout(close, o.auto);
  }

  function medal(icon, color, size) {
    return '<div class="fx-medal" style="--m:' + color + ';width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 160 160" aria-hidden="true">' +
      '<path d="M48 4h28l14 52H62z" fill="#3a86ff"/><path d="M112 4H84L70 56h28z" fill="#ef476f"/>' +
      '<circle cx="80" cy="96" r="58" fill="#f4b400"/><circle cx="80" cy="96" r="58" fill="none" stroke="#b27b00" stroke-width="5"/>' +
      '<circle cx="80" cy="96" r="45" fill="var(--m)"/><circle cx="80" cy="96" r="45" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-dasharray="4 6"/>' +
      '<path d="M44 74a45 45 0 0 1 50-22" stroke="rgba(255,255,255,.55)" stroke-width="6" fill="none" stroke-linecap="round"/></svg>' +
      '<span class="fx-medal-ico">' + icon + '</span><i class="fx-shine"></i></div>';
  }
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"/></svg>';

  return {
    reduced: reduced, burst: burst, coinFly: coinFly, countUp: countUp,
    busy: function () { return !!open; },
    quest: function (o) {
      var stars = o.stars || 1;
      show({ kind: 'quest', color: o.color, label: 'Quest complete', ok: o.ok || 'Keep questing!',
        html: '<div class="fx-eyebrow">' + (o.approved ? 'Your teacher approved it!' : 'Quest complete!') + '</div>' +
          '<div class="fx-stamp"><span>Complete</span></div><h2 class="fx-title">' + esc(o.title) + '</h2>' +
          '<div class="fx-stars">' + [0, 1, 2].map(function (i) { return '<span class="fx-star' + (i < stars ? ' on' : '') + '" style="--i:' + i + '">' + STAR + '</span>'; }).join('') + '</div>' +
          '<div class="fx-starnote">' + esc(o.starNote || '') + '</div>' +
          '<div class="fx-gains"><span class="fx-gain xp">+<b data-n="' + (o.xp || 0) + '">0</b> XP</span>' + (o.coins ? '<span class="fx-gain cn"><span class="coin"></span>+<b data-n="' + o.coins + '">0</b></span>' : '') + '</div>',
        after: function (w) {
          play('stamp', 250); play('fanfare', 520);
          for (var i = 0; i < stars; i++) play('star', 900 + i * 260);
          setTimeout(function () { w.querySelectorAll('.fx-gain b').forEach(function (b) { countUp(b, +b.getAttribute('data-n'), 900); }); }, reduced() ? 0 : 900 + stars * 260);
        } });
    },
    badge: function (o) {
      show({ kind: 'badge', color: o.color || '#7b2ff7', label: 'Badge earned', ok: 'Awesome!',
        html: '<div class="fx-eyebrow">' + (o.teacher ? 'Your teacher gave you a badge!' : 'Badge unlocked!') + '</div>' + medal(o.icon, o.color || '#7b2ff7', 170) +
          '<h2 class="fx-title">' + esc(o.name) + '</h2><p class="fx-sub">' + esc(o.desc) + '</p>' + (o.note ? '<p class="fx-note">“' + esc(o.note) + '”</p>' : '') +
          (o.xp ? '<div class="fx-gains"><span class="fx-gain xp">+<b>' + o.xp + '</b> XP</span></div>' : ''),
        after: function () { play('whoosh'); play('badge', 380); play('sparkle', 700); } });
    },
    level: function (o) {
      show({ kind: 'level', color: '#ffb703', label: 'Level up', ok: 'Keep questing!', parts: 44, spread: 420,
        extra: o.unlocks && o.unlocks.length ? '<a class="btn big" href="#/avatar" data-fx-close>Try on new items</a>' : '',
        html: '<div class="fx-eyebrow">Level up!</div><div class="fx-lv"><span class="fx-lv-ring"></span><b data-from="' + o.from + '">' + o.to + '</b><small>LEVEL</small></div>' +
          '<h2 class="fx-title">' + esc(o.rank) + '</h2><p class="fx-sub">You reached level ' + o.to + '.</p>' +
          (o.unlocks && o.unlocks.length ? '<p class="fx-sub"><b>New items unlocked:</b></p><div class="fx-unlocks">' + o.unlocks.map(function (u, i) { return '<span style="--i:' + i + '"><svg class="i"><use href="#i-unlock"/></svg> ' + esc(u) + '</span>'; }).join('') + '</div>' : ''),
        after: function () { play('levelup', 150); play('fanfare', 800); } });
    },
    item: function (o) {
      var big = o.rarity === 'legendary' || o.rarity === 'epic';
      show({ kind: 'item', rarity: o.rarity, color: o.color, label: 'New item', ok: o.ok || 'Sweet!', okClass: o.okClass, parts: big ? 46 : 26, spread: big ? 420 : 300,
        colors: o.rarity === 'legendary' ? ['#ffd60a', '#ffb703', '#fff3b0', '#fff'] : [o.color, '#fff', '#facc15', o.color],
        extra: o.extra || '',
        html: '<div class="fx-eyebrow">' + esc(o.rarityName) + ' item!</div><div class="fx-flip"><div class="fx-back"><span>?</span></div><div class="fx-front">' + o.art + '</div></div>' +
          '<h2 class="fx-title">' + esc(o.name) + '</h2><p class="fx-sub">' + esc(o.sub || 'It is yours to keep.') + '</p>',
        after: function () { play('reveal'); play(o.rarity === 'legendary' ? 'legendary' : big ? 'fanfare' : 'buy', 650); play('sparkle', 900); } });
    },
    sent: function (o) {
      show({ kind: 'sent', color: '#3a86ff', label: 'Turned in', ok: 'OK!', parts: 0, auto: 4200,
        html: '<div class="fx-plane"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 30L60 6 44 58 30 38z" fill="#fff"/><path d="M30 38L60 6 22 34z" fill="#cfe1ff"/><path d="M30 38l-4 14 8-10z" fill="#9dbfff"/></svg></div>' +
          '<div class="fx-eyebrow">Turned in!</div><h2 class="fx-title">' + esc(o.title) + '</h2><p class="fx-sub">Your teacher will check it soon. You will get your celebration when it is approved!</p>',
        after: function () { play('whoosh'); } });
    }
  };
})();
