/* Scratch Quest — browser app (students + teacher). Vanilla JS, no build step needed at runtime. */
(function () {
  var R = SQ_RULES, A = SQ_AVATAR, API = SQ_API;
  var L = window.SQ_LESSONS = window.SQ_LESSONS || {};
  var S = { boot: null, me: null, cls: null, view: null, teacher: null, tClass: null, busy: false, avatarDraft: null, avatarTab: 'hair' };
  var $app = document.getElementById('app');

  // ------------------------------------------------------------ helpers
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtN(n) { return Number(n || 0).toLocaleString(); }
  function ago(t) {
    if (!t) return '—';
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 2) return 'just now'; if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' hr ago';
    var d = Math.round(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
  }
  function title(id) { return (L[id] && L[id].title) || id; }
  function br(id) { return R.BRANCHES[R.NODE[id].branch]; }
  function route() { return (location.hash || '#/map').slice(2).split('/'); }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function call(action, args) {
    return API.call(action, args).catch(function (e) { toast('<svg class="i"><use href="#i-alert"/></svg> ' + e.message, 'warn'); throw e; });
  }
  function toast(msg, kind) {
    var box = document.getElementById('toasts');
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 3800);
    setTimeout(function () { t.remove(); }, 4400);
  }
  function floatXP(n, el, coins) {
    if (!n) return;
    var f = document.createElement('div');
    f.className = 'xp-float' + (n < 0 ? ' neg' : '');
    f.innerHTML = (n > 0 ? '+' : '') + n + ' XP' + (coins > 0 ? ' <span class="xf-coin"><span class="coin"></span>+' + coins + '</span>' : '');
    var r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
    f.style.left = (r.left + r.width / 2) + 'px';
    f.style.top = (r.top + window.scrollY) + 'px';
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1300);
  }
  function confetti() {
    var c = document.createElement('div');
    c.className = 'confetti';
    var colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#f97316'];
    for (var i = 0; i < 80; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.6 + 's';
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(function () { c.remove(); }, 3600);
  }
  function modal(html, cls) {
    closeModal();
    var m = document.createElement('div');
    m.className = 'modal-wrap';
    m.innerHTML = '<div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true"><button class="modal-x" data-act="close-modal" aria-label="Close"><svg class="i"><use href="#i-x"/></svg></button>' + html + '</div>';
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    var f = m.querySelector('input,textarea,button:not(.modal-x)');
    if (f) f.focus();
  }
  // In-page confirm (window.confirm is blocked in some embeds)
  function ask(msg, okLabel, danger) {
    return new Promise(function (resolve) {
      modal('<h2>Are you sure?</h2><p>' + msg + '</p><div class="row"><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-ask="1">' + esc(okLabel || 'Yes') + '</button><button class="btn" data-ask="0">Cancel</button></div>');
      var m = document.querySelector('.modal-wrap');
      m.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ask]');
        if (b) { closeModal(); resolve(b.getAttribute('data-ask') === '1'); }
        else if (e.target === m || e.target.closest('.modal-x')) resolve(false);
      });
    });
  }
  function closeModal() { var m = document.querySelector('.modal-wrap'); if (m) m.remove(); }
  function renderBlocks() {
    if (typeof scratchblocks === 'undefined') return;
    try {
      if (SQ_I18N.lang() === 'pt' && typeof SQ_BLOCKS_PT !== 'undefined') {
        // draw the blocks in Brazilian Portuguese so they match a Scratch editor set to Portuguese
        if (!scratchblocks.allLanguages.pt_br) scratchblocks.loadLanguages({ pt_br: SQ_BLOCKS_PT });
        document.querySelectorAll('pre.blocks').forEach(function (pre) {
          var doc = scratchblocks.parse(pre.textContent, { languages: ['en'] });
          doc.translate(scratchblocks.allLanguages.pt_br);
          var svg = scratchblocks.render(doc, { style: 'scratch3', scale: 0.85 });
          var box = document.createElement('div'); box.className = 'scratchblocks'; box.appendChild(svg);
          pre.parentNode.replaceChild(box, pre);
        });
      } else scratchblocks.renderMatching('pre.blocks', { style: 'scratch3', languages: ['en'], scale: 0.85 });
    } catch (e) { /* show as text */ }
  }
  function videoEmbed(url) {
    if (!url) return '';
    var m, src = null;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))) src = 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0';
    else if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) src = 'https://drive.google.com/file/d/' + m[1] + '/preview';
    else if ((m = url.match(/vimeo\.com\/(\d+)/))) src = 'https://player.vimeo.com/video/' + m[1];
    else if ((m = url.match(/loom\.com\/share\/(\w+)/))) src = 'https://www.loom.com/embed/' + m[1];
    if (src) return '<div class="video"><iframe src="' + esc(src) + '" title="Lesson video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>';
    return '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">▶ Watch the lesson video</a>';
  }
  function prof() { return S.me ? S.me.profile : null; }

  // Celebrate whatever changed between two profiles.
  // away = true when the change happened while the student was gone (e.g. the teacher approved a quest).
  var BADGE_COLORS = ['#7b2ff7', '#3a86ff', '#ef476f', '#06a77d', '#f77f00', '#118ab2'];
  function questStars(id) {
    var ns = (S.me.state.nodes || {})[id] || {}, q = ns.quiz || {}, Lq = L[id], got = ['Finished'], n = 1;
    var perfect = Lq && Lq.quiz.length && Lq.quiz.every(function (_, i) { return q[i] && q[i].firstTry; });
    if (perfect) { n++; got.push('perfect Quick Check'); }
    if (ns.challenge) { n++; got.push('bonus challenge'); }
    return { n: n, note: 'Stars: ' + got.join(' · ') };
  }
  function celebrate(before, after, el, away) {
    if (!before || !after) return;
    var gain = after.xp - before.xp, coinGain = (after.coinsEarned || 0) - (before.coinsEarned || 0);
    if (!away) floatXP(gain, el, coinGain);
    var newDone = Object.keys(after.done || {}).filter(function (id) { return !(before.done || {})[id]; });
    var newBadges = after.badges.filter(function (b) { return before.badges.indexOf(b) < 0; });
    var leveled = after.level > before.level;
    var newly = A.allUnlockables().filter(function (u) { return !A.isUnlocked(u.unlock, before) && A.isUnlocked(u.unlock, after); });
    var shown = 0, MAX = 4;
    newDone.forEach(function (id) {
      var st = questStars(id), n = R.NODE[id];
      if (shown++ >= MAX) return toast('<svg class="i"><use href="#i-check"/></svg> <b>Quest complete:</b> ' + esc(title(id)), 't-badge');
      SQ_FX.quest({ title: title(id), approved: away, stars: st.n, starNote: st.note, color: n ? R.BRANCHES[n.branch].color : '#7b2ff7',
        xp: newDone.length === 1 ? Math.max(0, gain) : R.XP.lesson, coins: newDone.length === 1 ? Math.max(0, coinGain) : 0 });
    });
    newBadges.forEach(function (b, i) {
      var B = R.BADGE[b]; if (!B) return;
      var teacher = R.TEACHER_BADGES.some(function (t) { return t.id === b; });
      var aw = teacher ? (S.me.state.awards || []).filter(function (a) { return a.id === b; })[0] : null;
      if (shown++ >= MAX) return toast('<span class="t-ico">' + B.icon + '</span><div><b>Badge earned: ' + esc(B.name) + '</b><br>' + esc(B.desc) + '</div>', 't-badge');
      SQ_FX.badge({ icon: B.icon, name: B.name, desc: B.desc, teacher: teacher, note: aw && aw.note, xp: teacher ? R.XP.award : 0, color: BADGE_COLORS[(b.length + i) % BADGE_COLORS.length] });
    });
    if (leveled) {
      SQ_FX.level({ from: before.level, to: after.level, rank: after.rank, unlocks: newly.map(function (u) { return u.name; }) });
      setTimeout(confetti, 300);
    } else newly.forEach(function (u) { toast('<span class="t-ico"><svg class="i"><use href="#i-unlock"/></svg></span><div><b>Unlocked: ' + esc(u.name) + '</b><br>Equip it in My Avatar!</div>', 'unlock'); });
    if (gain > 0 && el && !away && !newDone.length) { var xb = document.querySelector('.me-card .xpbar'); if (xb) SQ_FX.coinFly(el, xb, Math.min(8, Math.max(3, Math.round(gain / 10))), 'star'); }
    if (!newDone.length && !newBadges.length && !leveled && coinGain > 0 && !away) {
      setTimeout(function () { SQ_SOUND.play('coin'); }, 160);
      var mc = document.querySelector('.me-card'); if (el && mc) SQ_FX.coinFly(el, mc, Math.min(6, coinGain));
    }
    saveSeen(after);
  }
  // Remember what this student has already celebrated, so things that happen while they're away
  // (a teacher approving a quest or giving a badge) still get their moment next time.
  function seenKey() { return 'sq-seen:' + (S.me && S.me.email); }
  function saveSeen(p) {
    if (!S.me || !p) return;
    try { localStorage.setItem(seenKey(), JSON.stringify({ xp: p.xp, level: p.level, badges: p.badges, done: Object.keys(p.done || {}), ce: p.coinsEarned, owned: p.owned, ab: p.arcadeBest || 0 })); } catch (e) { }
  }
  function checkAway() {
    if (!S.me || isTeacher() && !S.me) return;
    var p = prof(), old = null;
    try { old = JSON.parse(localStorage.getItem(seenKey()) || 'null'); } catch (e) { }
    if (!old) return saveSeen(p);
    var done = {}; (old.done || []).forEach(function (id) { done[id] = 1; });
    var before = { xp: old.xp, level: old.level, badges: old.badges || [], done: done, coinsEarned: old.ce, owned: old.owned || p.owned, arcadeBest: old.ab || 0, rank: '' };
    if (old.level > p.level || old.xp > p.xp) return saveSeen(p); // progress went down (e.g. reopened): nothing to celebrate
    setTimeout(function () { celebrate(before, p, null, true); }, 600);
  }
  function updateMe(res, el) {
    if (!res || !res.student) return;
    var before = prof();
    S.me = res.student;
    celebrate(before, S.me.profile, el);
  }

  window.addEventListener('sq-busy', function (e) {
    var el = document.getElementById('busy-note');
    if (e.detail && !el) { el = document.createElement('div'); el.id = 'busy-note'; el.setAttribute('role', 'status'); el.innerHTML = '<span class="spinner sm"></span> Busy… saving your work, one moment'; document.body.appendChild(el); }
    else if (!e.detail && el) el.remove();
  });
  // ------------------------------------------------------------ boot
  document.body.insertAdjacentHTML('afterbegin', SQ_ICONS.sprite);
  function boot() {
    window.__sqStarted = true;
    $app.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your quest…</div>';
    API.call('bootstrap').then(function (b) {
      S.boot = b; S.me = b.student; S.cls = b.cls;
      if (S.me) checkAway();
      SQ_SOUND.setClassOff(!!(b.cls && b.cls.sounds === false));
      var started = false;
      var go2 = function (q) {
        if (started) return; started = true;
        if (q && L[q] && !S.deepLinked) {
          S.deepLinked = true; S.pendingQuest = q;
          location.hash = (b.user.isTeacher && !b.student) ? '#/t/lesson/' + q : '#/quest/' + q;
        } else if (b.user.isTeacher && !location.hash) location.hash = '#/t/dash';
        render();
      };
      setTimeout(function () { go2(null); }, 2500); // never wait forever for the deep link
      (API.deepLink || function (cb) { cb(null); })(go2);
    }).catch(function (e) {
      $app.innerHTML = '<div class="card narrow center"><h2>Hmm, something went wrong</h2><p>' + esc(e.message) + '</p><button class="btn primary" onclick="location.reload()">Try again</button></div>';
    });
  }

  function isTeacher() { return S.boot && S.boot.user.isTeacher; }

  // ------------------------------------------------------------ chrome
  function header() {
    var r = route()[0], p = prof();
    var tabs;
    if (isTeacher() && route()[0] === 't') {
      var pending = S.teacher ? pendingList().length : 0;
      tabs = [['#/t/dash', '<svg class="i"><use href="#i-chart"/></svg>', 'Dashboard'], ['#/t/review', '<svg class="i"><use href="#i-inbox"/></svg>', 'Review' + (pending ? ' <span class="pill">' + pending + '</span>' : '')],
        ['#/t/map', '<svg class="i"><use href="#i-map"/></svg>', 'Class Map'], ['#/t/lessons', '<svg class="i"><use href="#i-library"/></svg>', 'Lessons'], ['#/t/standards', '<svg class="i"><use href="#i-ruler"/></svg>', 'Standards'], ['#/t/feedback', '<svg class="i"><use href="#i-message"/></svg>', 'Feedback' + (S.teacher && S.teacher.newBugs ? ' <span class="pill">' + S.teacher.newBugs + '</span>' : '')], ['#/t/classroom', '<svg class="i"><use href="#i-school"/></svg>', 'Classroom'], ['#/t/classes', '<svg class="i"><use href="#i-sliders"/></svg>', 'Classes']];
    } else {
      tabs = [['#/map', '<svg class="i"><use href="#i-map"/></svg>', 'Quest Map'], ['#/avatar', '<svg class="i"><use href="#i-palette"/></svg>', 'My Avatar'], ['#/badges', '<svg class="i"><use href="#i-award"/></svg>', 'Badges'], ['#/arcade', '<svg class="i"><use href="#i-gamepad"/></svg>', 'Arcade'], ['#/class', '<svg class="i"><use href="#i-users"/></svg>', 'My Class']];
    }
    var cur = location.hash || '#/map';
    var html = '<header class="top"><a class="logo" href="' + (isTeacher() && r === 't' ? '#/t/dash' : '#/map') + '"><span class="logo-ico"><svg class="i"><use href="#i-compass"/></svg></span><span>Scratch<b>Quest</b></span></a><nav class="tabs">';
    tabs.forEach(function (t) {
      var active = cur.indexOf(t[0]) === 0 || (t[0] === '#/map' && cur.indexOf('#/quest') === 0);
      html += '<a href="' + t[0] + '" class="' + (active ? 'on' : '') + '"><span aria-hidden="true">' + t[1] + '</span> <span class="tl">' + t[2] + '</span></a>';
    });
    html += '</nav><div class="me"><button class="snd-btn' + (SQ_SOUND.muted() ? ' off' : '') + '" data-act="sound-toggle" title="' + (SQ_SOUND.muted() ? 'Sound is off' : 'Sound is on') + '" aria-label="' + (SQ_SOUND.muted() ? 'Turn sound on' : 'Turn sound off') + '"><svg class="i"><use href="#i-volume"/></svg></button>' +
      (S.me && r !== 't' ? '<button class="snd-btn" data-act="display" title="Display settings" aria-label="Display settings"><svg class="i"><use href="#i-sliders"/></svg></button>' : '') +
      (S.me || isTeacher() ? '<button class="snd-btn" data-act="bug" title="Report a bug" aria-label="Report a bug"><svg class="i"><use href="#i-bug"/></svg></button>' : '');
    if (isTeacher()) {
      html += r === 't'
        ? (S.me ? '<a class="btn small ghost" href="#/map"><svg class="i"><use href="#i-eye"/></svg> Student view</a>' : '<button class="btn small ghost" data-act="teacher-try"><svg class="i"><use href="#i-eye"/></svg> Try as student</button>')
        : '<a class="btn small ghost" href="#/t/dash"><svg class="i"><use href="#i-school"/></svg> Teacher view</a>';
    }
    if (p && r !== 't') {
      var pct = Math.min(100, Math.round((p.xp - p.levelStart) / (p.levelNext - p.levelStart) * 100));
      var from = pct, bump = false;
      if (S.barXP != null && S.barXP !== p.xp) { from = S.barLv === p.level ? S.barPct : 0; bump = true; }
      S.barXP = p.xp; S.barLv = p.level; S.barPct = pct;
      if (from !== pct) setTimeout(function () { document.querySelectorAll('.me-card .xpbar i[data-to]').forEach(function (i) { i.style.width = i.getAttribute('data-to') + '%'; }); }, 80);
      html += '<a class="me-card' + (bump ? ' fx-bump' : '') + '" href="#/badges" title="' + fmtN(p.xp) + ' XP"><span class="me-av">' + A.svg(S.me.state.avatar, 40) + '</span>' +
        '<span class="me-info"><span class="me-lv">Lv ' + p.level + ' · ' + esc(p.rank) + '</span><span class="xpbar"><i style="width:' + from + '%" data-to="' + pct + '"></i></span>' +
        '<span class="me-xp">' + fmtN(p.xp) + ' XP' + (shopOn() ? ' · <span class="coin"></span> ' + fmtN(Math.max(0, p.coins)) : '') + '</span></span></a>';
    }
    html += '</div></header>';
    if (API.demo) {
      html += '<div class="demo-bar"><svg class="i"><use href="#i-flask"/></svg> <b>Demo mode</b> — data is saved only in this browser. View as: ' +
        '<button class="' + (API.role() === 'student' ? 'on' : '') + '" data-act="demo-role" data-role="student">Student</button>' +
        '<button class="' + (API.role() === 'teacher' ? 'on' : '') + '" data-act="demo-role" data-role="teacher">Teacher</button>' +
        '<button data-act="demo-reset">Reset demo</button></div>';
    }
    return html;
  }

  function render() {
    closeModal();
    stopSpeaking();
    csStop(); document.body.classList.remove('cs-on', 'cs-dark');
    arcStop();
    (S.polls || []).forEach(clearInterval); S.polls = [];
    if (S.nudged) nudgeClear();
    var r = route();
    if (!S.boot) return;
    applyDisplay();
    if (r[0] === 't') {
      if (!isTeacher()) return go('#/map');
      return renderTeacher(r);
    }
    if (!S.me) {
      if (isTeacher()) return go('#/t/dash');
      return renderJoin();
    }
    if (!S.me.state.avatarSet && r[0] !== 'avatar' && !S.skipAvatarPrompt) { S.skipAvatarPrompt = true; return go('#/avatar'); }
    var body = '';
    if (r[0] === 'quest' && L[r[1]]) body = viewPlayer(r[1]);
    else if (r[0] === 'avatar') body = viewAvatar();
    else if (r[0] === 'badges') body = viewBadges();
    else if (r[0] === 'class') body = viewClass();
    else if (r[0] === 'arcade') body = viewArcade();
    else body = viewMap();
    $app.innerHTML = header() + '<main>' + body + '</main>';
    afterRender(r);
  }
  function afterRender(r) {
    renderBlocks();
    if (r[0] === 'arcade') { loadArcade(); S.arcTimer = setInterval(arcTick, 1000); }
    document.querySelectorAll('.lockzone').forEach(function (z) { lockUpdate(z, true); });
    if (r[0] === 'quest' && S.me) {
      if (S.help === undefined) { S.help = null; helpLoadMine(); }
      S.polls.push(setInterval(function () { if (S.help && S.help.open) helpLoadMine(); }, 20000));
    }
    if (r[0] === 'map' || r[0] === '' || r[0] === 'class' || (r[0] === 't' && (r[1] === 'map' || r[1] === 'projector'))) loadClassView(r);
    if (r[0] === 'map' || r[0] === '' || (r[0] === 't' && r[1] === 'map')) {
      var you = document.querySelector('.node.current');
      if (you && !S.scrolled) { S.scrolled = true; you.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    window.scrollTo && r[0] === 'quest' && !S.keepScroll && window.scrollTo(0, 0);
    if (r[0] === 'quest' && S.me && S.me.state.accom && S.me.state.accom.autoRead) {
      var sb = document.querySelector('.say-btn'); if (sb) setTimeout(function () { speakCard(sb); }, 250);
    }
    S.keepScroll = false;
  }
  function loadClassView(r) {
    var classId = r[0] === 't' ? S.tClass : null;
    call('classView', classId ? { classId: classId } : {}).then(function (v) {
      S.view = v;
      var mapBox = document.getElementById('map-box');
      var layer = mapBox && mapBox.querySelector('#tokens');
      if (layer) {
        // map already drawn: only touch the classmates layer, and only if something changed
        var html = tokensSVG(v.members), key = JSON.stringify(v.members.map(function (m) { return [m.id, m.current, m.level, m.avatar]; }));
        if (layer.getAttribute('data-key') !== key) { layer.innerHTML = html; layer.setAttribute('data-key', key); }
      } else if (mapBox) {
        mapBox.innerHTML = mapSVG(r[0] === 't' ? null : S.me.state, v.members, S.cls ? S.cls.openThrough : v.cls.openThrough);
        mapBox.querySelector('#tokens').setAttribute('data-key', JSON.stringify(v.members.map(function (m) { return [m.id, m.current, m.level, m.avatar]; })));
      }
      var cb = document.getElementById('class-box');
      if (cb) cb.innerHTML = classBody(v);
      var gb = document.getElementById('goal-box');
      if (gb) gb.innerHTML = goalBar(v);
      var you = document.querySelector('.node.current');
      if (you && !S.scrolled) { S.scrolled = true; you.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }).catch(function () { });
  }

  // ------------------------------------------------------------ join
  function renderJoin() {
    $app.innerHTML = header() + '<main><div class="join">' +
      '<div class="join-hero">' + A.svg(A.randomAvatar(42), 150) + A.svg(A.randomAvatar(7), 120) + A.svg(A.randomAvatar(99), 150) + '</div>' +
      '<div class="card narrow"><h1>Welcome to Scratch Quest!</h1><p class="muted">Learn to code in Scratch by going on an adventure. Earn XP, collect badges, and build your own games, stories, and apps.</p>' +
      '<form data-form="join"><label>Class code<input name="code" maxlength="8" autocomplete="off" placeholder="e.g. ABC12" required class="code-input"></label>' +
      '<label>Your first name (your class will see this)<input name="name" maxlength="24" required value="' + esc(S.boot.user.name === 'You' ? '' : S.boot.user.name) + '"></label>' +
      '<button class="btn primary big">Start my quest <svg class="i"><use href="#i-arrow-right"/></svg></button></form>' +
      (API.demo ? '<p class="hint">Demo tip: use class code <b>DEMO1</b></p>' : '') + '</div></div></main>';
  }

  // ------------------------------------------------------------ map
  function viewMap() {
    var p = prof(), st = S.me.state;
    var next = suggestNext(st);
    var html = '<div class="map-layout"><aside class="map-side">';
    html += '<div class="card hello"><div class="hello-av">' + A.svg(st.avatar, 84) + '</div><div><h2 class="notr">Hi, ' + esc(S.me.name) + '!</h2>' + (A.titleText(st.avatar) ? '<div class="np-title sm">' + esc(A.titleText(st.avatar)) + '</div>' : '') + '<p class="muted">' + esc(S.cls.name) + '</p>' +
      '<p><b>' + p.doneCount + '</b> quests done · <b>' + p.badges.length + '</b> badges</p></div></div>';
    html += goalCard(p, true);
    if (next) {
      var ns = st.nodes[next.id] || {};
      html += '<div class="card next" style="--c:' + br(next.id).color + '"><div class="eyebrow">' + (next.label) + '</div><h3>' + esc(title(next.id)) + '</h3><p class="muted">' + esc(L[next.id].skill) + ' · ' + esc(L[next.id].minutes) + ' min</p>' +
        (ns.status === 'returned' ? '<p class="warn-text"><svg class="i"><use href="#i-undo"/></svg> Your teacher sent this back with feedback.</p>' : '') +
        '<a class="btn primary" href="#/quest/' + next.id + '">' + (next.started ? 'Continue quest <svg class="i"><use href="#i-arrow-right"/></svg>' : 'Start quest <svg class="i"><use href="#i-arrow-right"/></svg>') + '</a></div>';
      if (next.choices) html += '<div class="card"><div class="eyebrow"><svg class="i"><use href="#i-split"/></svg> Choose your path</div><p>Pick the kind of project you want to build next:</p>' +
        next.choices.map(function (id) { return '<a class="path-pick" style="--c:' + br(id).color + '" href="#/quest/' + id + '">' + SQ_ICONS.branch(R.NODE[id].branch) + ' <b>' + esc(br(id).name) + '</b><span>' + esc(title(id)) + '</span></a>'; }).join('') + '</div>';
    } else {
      html += '<div class="card"><h3><svg class="i"><use href="#i-sparkles"/></svg> You finished the whole quest!</h3><p>Go back and try a branch you skipped for bonus XP and the Explorer badge.</p></div>';
    }
    var waiting = Object.keys(st.nodes).filter(function (id) { return st.nodes[id].status === 'submitted'; });
    if (waiting.length) html += '<div class="card"><div class="eyebrow"><svg class="i"><use href="#i-clock"/></svg> Waiting for teacher</div>' + waiting.map(function (id) { return '<div><a href="#/quest/' + id + '">' + esc(title(id)) + '</a></div>'; }).join('') + '</div>';
    html += '<div class="card legend"><div class="eyebrow">Map key</div>' +
      '<div><span class="lg done"></span>Finished</div><div><span class="lg avail"></span>Ready to start</div><div><span class="lg sub"></span>Turned in (waiting)</div><div><span class="lg locked"></span>Locked</div>' +
      '<p class="muted small">Little faces show where your classmates are right now.</p></div>';
    html += '<div id="goal-box"></div>';
    html += '</aside><section class="map-main"><div id="map-box" class="map-box">' + mapSVG(st, (S.view && S.view.members) || [], S.cls.openThrough) + '</div></section></div>';
    return html;
  }

  // Next suggested quest (+ path choices at forks)
  function suggestNext(st) {
    var started = null, t = -1;
    R.NODES.forEach(function (n) {
      var s = R.nodeStatus(st, n.id, S.cls.openThrough);
      var ns = st.nodes[n.id];
      if ((s === 'started' || s === 'returned') && ns && (ns.touched || 0) > t) { t = ns.touched || 0; started = n.id; }
    });
    if (started) return { id: started, label: 'Continue your quest', started: true };
    var avail = R.NODES.filter(function (n) { return R.nodeStatus(st, n.id, S.cls.openThrough) === 'available'; }).map(function (n) { return n.id; });
    if (!avail.length) return null;
    var cur = R.currentNode(st);
    var pick = avail.indexOf(cur) >= 0 ? cur : avail[0];
    var tier = R.NODE[pick].tier;
    var sameTier = avail.filter(function (id) { return R.NODE[id].tier === tier; });
    var fork = sameTier.length > 1;
    return { id: pick, label: fork ? 'Next quest (or pick a path below)' : 'Your next quest', choices: fork ? sameTier : null };
  }

  function mapSVG(state, members, openThrough) {
    var W = R.MAP.width, H = R.MAP.height;
    var o = ['<svg class="map" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Quest map">'];
    // illustrated scenery (drawn once and cached)
    o.push(SQ_MAPART.scene());
    // roads: a darker edge underneath, then the road surface; finished stretches turn golden
    var roads = [];
    R.NODES.forEach(function (n) {
      (n.requires || []).concat(n.requiresAny || []).forEach(function (pid) {
        var p = R.NODE[pid];
        var done = state && R.isDone(state, pid) && (R.isDone(state, n.id) || R.prereqsMet(state, n.id));
        var reached = !state || R.isDone(state, pid);
        var my = (n.y - p.y) / 2;
        roads.push({ d: 'M' + p.x + ',' + p.y + ' C' + p.x + ',' + (p.y + my) + ' ' + n.x + ',' + (n.y - my) + ' ' + n.x + ',' + n.y, done: done, reached: reached });
      });
    });
    roads.forEach(function (r) { o.push('<path d="' + r.d + '" class="road-edge' + (r.reached ? '' : ' far') + '"/>'); });
    roads.forEach(function (r) { o.push('<path d="' + r.d + '" class="road' + (r.done ? ' done' : '') + (r.reached ? '' : ' far') + '"/>'); });
    roads.forEach(function (r) { if (r.done) o.push('<path d="' + r.d + '" class="road-line"/>'); });
    // area signs and fork banners
    [[250, 30, 'trunk'], [40, 640, 'games'], [355, 640, 'stories'], [670, 640, 'apps'], [250, 955, 'merge'],
      [40, 1275, 'games', 'Arcade Peaks II'], [355, 1275, 'stories', 'Story Woods II'], [670, 1275, 'apps', 'Gadget Bay II'], [250, 1590, 'finale']].forEach(function (r) {
      var B = R.BRANCHES[r[2]];
      o.push(SQ_MAPART.sign(r[0] + 16, r[1] + 14, esc(r[3] || B.name), SQ_ICONS.BR[r[2]], B.color));
    });
    o.push(SQ_MAPART.banner(500, 611, 'Choose your path'));
    o.push(SQ_MAPART.banner(500, 1236, 'Choose again: same path or a new one'));
    var meId = state ? R.currentNode(state) : null;
    // nodes
    R.NODES.forEach(function (n) {
      var B = R.BRANCHES[n.branch];
      var s = state ? R.nodeStatus(state, n.id, openThrough) : (n.tier > openThrough ? 'gated' : 'available');
      var cls = 'node s-' + s + (n.id === meId ? ' current' : '');
      var clickable = state ? (s !== 'locked') : true;
      var href = state ? '#/quest/' + n.id : '#/t/lesson/' + n.id;
      o.push('<a ' + (clickable ? 'href="' + href + '"' : 'data-act="locked" data-node="' + n.id + '"') + ' class="' + cls + '" tabindex="0"><title>' + esc(title(n.id)) + ' — ' + statusWord(s) + '</title>');
      var dim = s === 'locked' || s === 'gated';
      o.push('<circle cx="' + n.x + '" cy="' + (n.y + 8) + '" r="41" class="node-base" style="fill:' + (dim ? '#8f84b3' : SQ_MAPART.edgeColor(n.branch)) + '"/>');
      o.push('<circle cx="' + n.x + '" cy="' + n.y + '" r="41" class="node-ring"/>');
      o.push('<circle cx="' + n.x + '" cy="' + n.y + '" r="33" class="node-core"' + (dim ? '' : ' style="fill:' + B.color + '"') + '/>');
      o.push('<ellipse cx="' + (n.x - 10) + '" cy="' + (n.y - 16) + '" rx="13" ry="7" class="node-shine"/>');
      var icoName = { done: 'check', locked: 'lock', gated: 'clock', submitted: 'send', returned: 'undo' }[s];
      if (icoName) o.push('<use href="#i-' + icoName + '" x="' + (n.x - 14) + '" y="' + (n.y - 14) + '" width="28" height="28" class="node-icon"/>');
      else o.push('<text x="' + n.x + '" y="' + (n.y + 9) + '" text-anchor="middle" class="node-ico">' + n.tier + '</text>');
      var lx = n.x, anchor = 'middle', ly = n.y + 62;
      o.push('<text x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '" class="node-title">' + esc(title(n.id)) + '</text>');
      o.push('</a>');
      if (state && n.id === meId) {
        o.push('<g transform="translate(' + (n.x - 150) + ',' + (n.y - 12) + ')"><g class="you-token"><circle cx="26" cy="26" r="29" fill="#fff" stroke="#facc15" stroke-width="5"/>' +
          avatarImage(state.avatar, 0, 0, 52) + '<text x="26" y="-8" text-anchor="middle" class="you-label">YOU</text></g></g>');
      }
    });
    o.push('<g id="tokens">' + tokensSVG(members) + '</g>');
    o.push('</svg>');
    return o.join('');
  }
  // Classmates standing on their current quest. Kept in its own layer so it can be
  // refreshed without redrawing (and re-animating) the whole map.
  var AV_IMG = {};
  function avatarURI(av) {
    var k = JSON.stringify(av || {});
    if (!AV_IMG[k]) AV_IMG[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(A.svg(av, 200));
    return AV_IMG[k];
  }
  function avatarImage(av, x, y, size) {
    return '<image href="' + avatarURI(av) + '" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '"/>';
  }
  function tokensSVG(members) {
    var o = [], at = {};
    (members || []).forEach(function (m) { if (!m.teacher) (at[m.current] = at[m.current] || []).push(m); });
    Object.keys(at).forEach(function (id) {
      var n = R.NODE[id];
      if (!n) return;
      var here = at[id];
      var pos = tokenPositions(here.length > 6 ? 7 : here.length);
      here.slice(0, 6).forEach(function (m, i) {
        var p = pos[i];
        o.push('<g class="token" transform="translate(' + (n.x + p[0] - 17) + ',' + (n.y + p[1] - 17) + ')"><title>' + esc(m.name) + ' · Lv ' + m.level + '</title>' +
          '<circle cx="17" cy="19" r="19" class="tok-shadow"/><circle cx="17" cy="17" r="19" fill="#fff"/>' + avatarImage(m.avatar, 0, 0, 34) + '</g>');
      });
      if (here.length > 6) {
        var pp = pos[6];
        o.push('<g class="token more" transform="translate(' + (n.x + pp[0]) + ',' + (n.y + pp[1]) + ')"><circle r="17"/><text y="6" text-anchor="middle">+' + (here.length - 6) + '</text></g>');
      }
    });
    return o.join('');
  }
  function tokenPositions(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = (-25 + i * 32) * Math.PI / 180;
      var side = i % 2 === 0 ? 1 : -1, k = Math.floor(i / 2);
      a = (k * 38 - 20) * Math.PI / 180;
      out.push([side * Math.cos(a) * 66, Math.sin(a) * 50 - 8]);
    }
    return out;
  }
  // lesson notes may use <b>, <i> and <br>; everything else is shown as plain text
  function notesHTML(t) { return esc(t || '').replace(/&lt;(\/?(?:b|i|em|strong)|br\s*\/?)&gt;/g, '<$1>'); }
  function statusWord(s) {
    return { locked: 'Locked', gated: 'Not open yet', available: 'Ready', started: 'In progress', submitted: 'Turned in', returned: 'Needs changes', done: 'Finished' }[s] || s;
  }
  function lockedReason(id) {
    var n = R.NODE[id];
    if (n.requiresAny) return 'Finish one of: ' + n.requiresAny.map(title).join(', ') + '.';
    return 'Finish ' + (n.requires || []).map(title).join(' and ') + ' first.';
  }

  // ------------------------------------------------------------ quest (lesson) view
  function viewQuest(id, teacherPreview) {
    var Ls = L[id], n = R.NODE[id], B = br(id);
    var st = teacherPreview ? R.newState() : S.me.state;
    var status = teacherPreview ? 'available' : R.nodeStatus(st, id, S.cls.openThrough);
    var ns = st.nodes[id] || { steps: [], quiz: {}, challenge: false };
    var lockedUI = teacherPreview || status === 'locked' || status === 'gated';
    var frozen = status === 'done' || status === 'submitted';
    var video = (S.boot.settings.videos || {})[id];
    var stepsDone = Ls.steps.filter(function (_, i) { return ns.steps[i]; }).length;
    var quizDone = Ls.quiz.filter(function (_, i) { return ns.quiz[i] && ns.quiz[i].correct; }).length;
    var total = Ls.steps.length + Ls.quiz.length;
    var pct = Math.round((stepsDone + quizDone) / total * 100);
    var maxXP = Ls.steps.length * R.XP.step + Ls.quiz.length * (R.XP.quiz + R.XP.quizFirstTry) + R.XP.lesson + R.XP.challenge;

    var h = '<article class="quest" style="--c:' + B.color + '">';
    h += '<a class="back" href="' + (teacherPreview ? '#/t/lessons' : '#/map') + '"><svg class="i"><use href="#i-arrow-left"/></svg> ' + (teacherPreview ? 'All lessons' : 'Back to map') + '</a>';
    h += '<header class="quest-head"><div class="qh-badge">' + SQ_ICONS.branch(n.branch, 'lg') + '<small>Quest ' + n.tier + '</small></div><div class="qh-text"><div class="eyebrow">' + esc(B.name) +
      (Ls.project ? ' · <svg class="i"><use href="#i-sliders"/></svg> ' + esc(Ls.project.name) + ' (' + esc(Ls.project.part) + ')' : '') + '</div><h1>' + esc(Ls.title) + '</h1><p class="tagline">' + esc(Ls.tagline) + '</p>' +
      '<div class="chips"><span class="chip"><svg class="i"><use href="#i-clock"/></svg> ' + esc(Ls.minutes) + ' min</span><span class="chip"><svg class="i"><use href="#i-bulb"/></svg> ' + esc(Ls.skill) + '</span><span class="chip"><svg class="i"><use href="#i-star"/></svg> up to ' + maxXP + ' XP</span></div></div></header>';

    if (!teacherPreview) {
      h += '<div class="qprogress"><span class="xpbar big"><i style="width:' + pct + '%"></i></span><span>' + stepsDone + '/' + Ls.steps.length + ' steps · ' + quizDone + '/' + Ls.quiz.length + ' quick checks</span></div>';
      if (status === 'locked') h += '<div class="banner lock"><svg class="i"><use href="#i-lock"/></svg> This quest is locked. ' + esc(lockedReason(id)) + ' You can read ahead, though!</div>';
      if (status === 'gated') h += '<div class="banner lock"><svg class="i"><use href="#i-clock"/></svg> Your teacher hasn\'t opened this quest yet. You can read ahead!</div>';
      if (status === 'submitted') h += '<div class="banner sub"><svg class="i"><use href="#i-send"/></svg> Turned in! Waiting for your teacher to check it. You can start another quest meanwhile.</div>';
      if (status === 'done') h += '<div class="banner done"><svg class="i"><use href="#i-check-circle"/></svg> Quest complete!' + (ns.feedback ? ' <b>Teacher says:</b> ' + esc(ns.feedback) : '') + '</div>';
      if (status === 'returned') h += '<div class="banner ret"><svg class="i"><use href="#i-undo"/></svg> Your teacher sent this back. <b>Feedback:</b> ' + esc(ns.feedback || 'See your teacher.') + ' Fix it up and turn it in again!</div>';
    } else {
      h += '<div class="banner sub"><svg class="i"><use href="#i-eye"/></svg> Teacher preview — this is what students see. <b>Teacher notes:</b> ' + notesHTML(Ls.teacherNotes) + '</div>' + stdFull(id);
    }

    h += '<div class="quest-grid"><div class="quest-main">';
    if (video) h += '<section class="card"><h2><svg class="i"><use href="#i-video"/></svg> Watch first</h2>' + videoEmbed(video) + '</section>';
    h += '<section class="card goal"><h2><svg class="i"><use href="#i-target"/></svg> Your mission</h2><p>' + esc(Ls.goal) + '</p>' + (Ls.warmup ? '<div class="warmup"><b>Warm-up:</b> ' + esc(Ls.warmup) + '</div>' : '') + '</section>';
    if (teacherPreview && SQ_UBD.lessons[id]) h += '<section class="card ubd-card"><h2><svg class="i"><use href="#i-bulb"/></svg> Big idea</h2><p><b>Enduring understanding:</b> Students will understand that ' + esc(SQ_UBD.lessons[id].eu.charAt(0).toLowerCase() + SQ_UBD.lessons[id].eu.slice(1)) + '</p><p><b>Essential question:</b> ' + esc(SQ_UBD.lessons[id].eq) + '</p></section>';
    if (teacherPreview) {
      var pk = primerKeys(id, true);
      if (pk.length) h += '<section class="card"><h2><svg class="i"><use href="#i-sparkles"/></svg> Primer cards</h2><p class="small">Shown only to students whose path skipped these skills:</p>' + pk.map(function (k) { return '<details class="p-more"><summary>' + esc(SQ_PRIMERS[k].title) + '</summary>' + primerCard(k) + '</details>'; }).join('') + '</section>';
      if (Ls.starter) h += '<section class="card"><h2><svg class="i"><use href="#i-briefcase"/></svg> Starter project</h2><p class="small"><b>' + esc(Ls.starter.name) + '.</b> It should contain: ' + esc(Ls.starter.contains) + '</p><p class="small muted">Add its link on the Lessons page so absent students can start here.</p></section>';
      if (Ls.checklist) h += '<section class="card"><h2><svg class="i"><use href="#i-check-circle"/></svg> Turn-in checklist</h2><ul>' + Ls.checklist.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
    }

    h += '<section class="card"><h2><svg class="i"><use href="#i-list"/></svg> Steps <span class="muted small">(+' + R.XP.step + ' XP each)</span></h2><ol class="steps">';
    Ls.steps.forEach(function (s, i) {
      var on = !!ns.steps[i];
      h += '<li class="step' + (on ? ' on' : '') + '"><label class="check"><input type="checkbox" data-act="step" data-node="' + id + '" data-idx="' + i + '"' + (on ? ' checked' : '') + (lockedUI || frozen ? ' disabled' : '') + '><span class="box"></span><span class="step-title">' + (i + 1) + '. ' + esc(s.title) + (s.stretch ? ' <span class="stretch-tag"><svg class="i"><use href="#i-star"/></svg> Stretch</span>' : '') + '</span></label>' +
        '<div class="step-body"><p><b>' + (s.short || '') + '</b></p><p>' + s.text + '</p>' + stepBody(id, i, true) + (s.tip ? '<div class="tip"><svg class="i"><use href="#i-bulb"/></svg> ' + s.tip + '</div>' : '') +
        (s.solo ? '<div class="tip solo-tip"><svg class="i"><use href="#i-user"/></svg> <b>Solo option:</b> ' + s.solo + '</div>' : '') + '</div></li>';
    });
    h += '</ol></section>';

    h += '<section class="card"><h2><svg class="i"><use href="#i-help"/></svg> Quick Check <span class="muted small">(+' + R.XP.quiz + ' XP, +' + R.XP.quizFirstTry + ' bonus on the first try)</span></h2>';
    Ls.quiz.forEach(function (q, qi) {
      var r = ns.quiz[qi];
      var right = r && r.correct;
      h += '<div class="quiz' + (right ? ' right' : '') + '" id="q-' + qi + '"><p class="q"><b>' + (qi + 1) + '.</b> ' + esc(q.q) + '</p>' + (q.blocks ? '<pre class="blocks">' + esc(q.blocks) + '</pre>' : '') + '<div class="choices">';
      q.choices.forEach(function (c, ci) {
        var isAns = right && ci === q.answer;
        h += '<button class="choice' + (isAns ? ' correct' : '') + '" data-act="quiz" data-node="' + id + '" data-q="' + qi + '" data-c="' + ci + '"' + (right || lockedUI ? ' disabled' : '') + '>' + esc(c) + '</button>';
      });
      h += '</div>' + (right ? '<p class="explain say"><svg class="i"><use href="#i-check-circle"/></svg> ' + esc(q.explain) + (r.firstTry ? ' <span class="chip gold">First try!</span>' : '') + '</p>' : '<p class="explain" hidden></p>') + '</div>';
    });
    h += '</section>';

    if (Ls.challenge) {
      h += '<section class="card challenge"><h2><svg class="i"><use href="#i-zap"/></svg> Bonus Challenge <span class="muted small">(+' + R.XP.challenge + ' XP)</span></h2><h3>' + esc(Ls.challenge.title) + '</h3><p>' + Ls.challenge.text + '</p>' +
        ((Ls.challenge.answer || Ls.challenge.blocks) ? '<details class="p-more answer"><summary>Solution (hidden from students)</summary><pre class="blocks">' + esc(Ls.challenge.answer || Ls.challenge.blocks) + '</pre></details>' : '') +
        '<label class="check"><input type="checkbox" data-act="challenge" data-node="' + id + '"' + (ns.challenge ? ' checked' : '') + (lockedUI || frozen ? ' disabled' : '') + '><span class="box"></span><span>I did the bonus challenge!</span></label></section>';
    }

    // turn in
    if (!teacherPreview && !lockedUI) {
      var ready = stepsDone === Ls.steps.length && quizDone === Ls.quiz.length;
      h += '<section class="card turnin"><h2><svg class="i"><use href="#i-send"/></svg> Turn it in <span class="muted small">(+' + R.XP.lesson + ' XP)</span></h2><p>' + esc(Ls.submit) + '</p>';
      if (frozen) {
        h += (ns.link ? '<p>Your project: <a href="' + esc(ns.link) + '" target="_blank" rel="noopener">' + esc(ns.link) + '</a></p>' : '') + (ns.reflection ? '<p class="muted">“' + esc(ns.reflection) + '”</p>' : '');
      } else {
        h += '<form data-form="submit" data-node="' + id + '"><label>Link to your Scratch project ' + (S.cls.requireLink ? '' : '<span class="muted">(optional — or show your teacher)</span>') + '<input name="link" type="url" placeholder="https://scratch.mit.edu/projects/…" value="' + esc(ns.link || '') + '"></label>' +
          '<label>Reflection: What was tricky? What are you proud of?<textarea name="reflection" rows="3" maxlength="600">' + esc(ns.reflection || '') + '</textarea></label>' +
          '<button class="btn primary big"' + (ready ? '' : ' disabled') + '>' + (status === 'returned' ? 'Turn in again' : 'Turn in quest') + ' <svg class="i"><use href="#i-check"/></svg></button>' +
          (ready ? '' : '<p class="muted small">Check off every step and answer the Quick Check first.</p>') + '</form>';
      }
      h += '</section>';
    }
    h += '</div><aside class="quest-side">';
    if (Ls.vocab && Ls.vocab.length) h += '<div class="card"><h3><svg class="i"><use href="#i-book"/></svg> Word bank</h3><dl class="vocab">' + Ls.vocab.map(function (v) { return '<dt>' + esc(v.term) + '</dt><dd>' + esc(v.def) + '</dd>'; }).join('') + '</dl></div>';
    h += '<div class="card"><h3><svg class="i"><use href="#i-briefcase"/></svg> Open Scratch</h3><p class="small">Work in a new tab so you can keep this page open.</p><a class="btn" href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener">Open the Scratch editor <svg class="i"><use href="#i-external"/></svg></a></div>';
    var nextIds = R.NODES.filter(function (k) { return (k.requires || []).concat(k.requiresAny || []).indexOf(id) >= 0; }).map(function (k) { return k.id; });
    if (nextIds.length) h += '<div class="card"><h3><svg class="i"><use href="#i-unlock"/></svg> This unlocks</h3>' + nextIds.map(function (k) { return '<div class="unlock-next" style="--c:' + br(k).color + '">' + SQ_ICONS.branch(R.NODE[k].branch) + ' ' + esc(title(k)) + '</div>'; }).join('') + '</div>';
    h += '</aside></div></article>';
    return h;
  }

  // ------------------------------------------------------------ quest player (students)
  // One card at a time: mission <svg class="i"><use href="#i-arrow-right"/></svg> "new to this?" primers <svg class="i"><use href="#i-arrow-right"/></svg> steps <svg class="i"><use href="#i-arrow-right"/></svg> quick checks <svg class="i"><use href="#i-arrow-right"/></svg> bonus <svg class="i"><use href="#i-arrow-right"/></svg> turn in.
  // Narrow on purpose, so it fits in half a Chromebook screen next to Scratch.

  // "Where to look" screenshots for a step
  function shotsFor(list) {
    list = [].concat(list || []).filter(function (k) { return SQ_SHOTS[k]; });
    if (!list.length) return '';
    return '<div class="shots">' + list.map(function (k, j) {
      var cap = SQ_SHOT_INFO[k] || '';
      return '<figure class="shot"><button class="shot-btn" data-act="zoom-shot" data-shot="' + k + '" aria-label="Make bigger: ' + esc(cap) + '">' +
        '<img src="' + SQ_SHOTS[k] + '" alt="' + esc(cap) + '" loading="lazy"><span class="shot-zoom" aria-hidden="true"><svg class="i"><use href="#i-search"/></svg></span></button>' +
        '<figcaption>' + (list.length > 1 ? '<b>' + (j + 1) + '.</b> ' : '<svg class="i"><use href="#i-camera"/></svg> ') + esc(cap) + '</figcaption></figure>';
    }).join('') + '</div>';
  }
  // Has this student already learned a skill on their path?
  function learned(skill) {
    var P = SQ_PRIMERS[skill];
    if (!P || !S.me) return true;
    return P.taughtIn.some(function (id) { return R.isDone(S.me.state, id); });
  }
  function primerKeys(id, all) {
    return (L[id].needs || []).filter(function (k) { return SQ_PRIMERS[k] && SQ_PRIMERS[k].taughtIn.indexOf(id) < 0 && (all || !learned(k)); });
  }
  function accom() { return (S.me && S.me.state.accom) || {}; }
  function questCards(id) {
    var Ls = L[id], cards = [{ type: 'intro' }];
    primerKeys(id).forEach(function (k) { cards.push({ type: 'primer', key: k }); });
    Ls.steps.forEach(function (st, i) { if (!(st.stretch && accom().coreOnly)) cards.push({ type: 'step', i: i }); });
    Ls.quiz.forEach(function (_, i) { cards.push({ type: 'quiz', i: i }); });
    if (Ls.challenge && !accom().coreOnly) cards.push({ type: 'challenge' });
    cards.push({ type: 'turnin' });
    return cards;
  }
  // Pacing: the furthest card a student may open. Everything up to the first unfinished core step or
  // quick check is open; later cards unlock as the work is done. (Teachers previewing are not held back.)
  function furthestCard(id) {
    var ns = S.me.state.nodes[id] || { steps: [], quiz: {} }, cards = questCards(id), Ls = L[id];
    for (var k = 1; k < cards.length; k++) {
      var c = cards[k];
      if (c.type === 'step' && !ns.steps[c.i] && !Ls.steps[c.i].stretch) return k;
      if (c.type === 'quiz' && !(ns.quiz[c.i] && ns.quiz[c.i].correct)) return k;
    }
    return cards.length - 1;
  }
  function paced() { return !isTeacher(); }
  function firstOpenCard(id) {
    var st = S.me.state, ns = st.nodes[id], cards = questCards(id), Ls = L[id];
    var status = R.nodeStatus(st, id, S.cls.openThrough);
    if (status === 'done' || status === 'submitted' || status === 'returned') return cards.length - 1;
    if (!ns || !ns.touched) return 0;
    for (var k = 1; k < cards.length; k++) {
      var c = cards[k];
      if (c.type === 'step' && !ns.steps[c.i] && !Ls.steps[c.i].stretch) return k;
      if (c.type === 'quiz' && !(ns.quiz[c.i] && ns.quiz[c.i].correct)) return k;
    }
    return cards.length - 1;
  }
  // Deterministic shuffle so the puzzle doesn't reshuffle every time the card redraws
  function shuffled(arr, seed) {
    var a = arr.slice(), s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 2147483647;
    for (var j = a.length - 1; j > 0; j--) { s = (s * 16807) % 2147483647; var r = s % (j + 1); var t = a[j]; a[j] = a[r]; a[r] = t; }
    // never leave it already solved
    if (a.join('\n') === arr.join('\n') && a.length > 1) a.push(a.shift());
    return a;
  }
  // The code part of a step: full script, a block puzzle, or build-it-yourself
  function codeFor(scaffold, blocks, seed, teacher) {
    if (!blocks) return '';
    if (scaffold === 'parsons' && !teacher) {
      var parts = blocks.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== 'end' && x !== 'else'; });
      return '<div class="scaf scaf-parsons"><div class="scaf-label"><svg class="i"><use href="#i-blocks"/></svg> Puzzle: put these blocks together in the right order</div><div class="parsons">' +
        shuffled(parts, seed).map(function (b) { return '<pre class="blocks">' + esc(b) + '</pre>'; }).join('') + '</div>' +
        '<details class="p-more answer"><summary><svg class="i"><use href="#i-eye"/></svg> Check my answer</summary><pre class="blocks">' + esc(blocks) + '</pre></details></div>';
    }
    if (scaffold === 'goal' && !teacher) {
      return '<div class="scaf scaf-goal"><div class="scaf-label"><svg class="i"><use href="#i-target"/></svg> Build this one yourself! You know these blocks.</div>' +
        '<details class="p-more answer"><summary><svg class="i"><use href="#i-help"/></svg> Stuck? Show me</summary><pre class="blocks">' + esc(blocks) + '</pre></details></div>';
    }
    return (teacher && scaffold !== 'full' ? '<div class="scaf-label small">' + (scaffold === 'parsons' ? '<svg class="i"><use href="#i-blocks"/></svg> Students see these blocks shuffled (puzzle)' : '<svg class="i"><use href="#i-target"/></svg> Hidden from students until "Stuck? Show me"') + '</div>' : '') +
      '<pre class="blocks">' + esc(blocks) + '</pre>';
  }
  function whereFor(s) {
    if (!s.where) return '';
    var ch = { 'new': ['new', '<svg class="i"><use href="#i-sparkles"/></svg> NEW script'], add: ['add', '<svg class="i"><use href="#i-plus"/></svg> ADD to a script'], replace: ['replace', '<svg class="i"><use href="#i-repeat"/></svg> REPLACE a script'] }[s.change] || null;
    return '<div class="where"><span class="w-on"><svg class="i"><use href="#i-user"/></svg> On: <b>' + esc(s.where) + '</b></span>' + (ch ? '<span class="w-chg ' + ch[0] + '">' + ch[1] + '</span>' : '') + '</div>' +
      (s.changeNote ? '<div class="w-note">' + esc(s.changeNote) + '</div>' : '');
  }
  function frameBox(text) {
    return '<div class="frame"><div class="frame-head"><svg class="i"><use href="#i-pencil"/></svg> Use this frame <button class="btn tiny ghost" data-act="copy-frame">Copy</button></div><pre class="frame-text">' + esc(text) + '</pre></div>';
  }
  function stepBody(id, i, teacher) {
    var s = L[id].steps[i], h = '';
    h += whereFor(s) + shotsFor(s.shots);
    if (s.options && s.options.length) {
      var key = id + '.' + i;
      S.opt = S.opt || {};
      var pick = teacher ? -1 : (S.opt[key] != null ? S.opt[key] : 0);
      // remember the student's choice across the lesson when later steps offer the same option names
      if (!teacher && S.opt[key] == null && S.optLabel && S.optLabel[id]) {
        s.options.forEach(function (o, j) { if (o.label === S.optLabel[id]) pick = j; });
      }
      h += '<div class="opts"><div class="scaf-label"><svg class="i"><use href="#i-split"/></svg> Pick one way to do it:</div><div class="opt-tabs">' + s.options.map(function (o, j) {
        return '<button class="opt-tab' + (j === pick ? ' on' : '') + '" data-act="opt" data-key="' + key + '" data-j="' + j + '" data-label="' + esc(o.label) + '" data-lesson="' + id + '">' + esc(o.label) + '</button>';
      }).join('') + '</div>';
      s.options.forEach(function (o, j) {
        if (!teacher && j !== pick) return;
        h += '<div class="opt-body">' + (teacher ? '<b>' + esc(o.label) + ':</b> ' : '') + '<p class="say">' + esc(o.short) + '</p>' + codeFor(s.scaffold, o.blocks, key + j, teacher) + '</div>';
      });
      h += '</div>';
    } else {
      h += codeFor(s.scaffold, s.blocks, id + '.' + i, teacher);
    }
    if (s.frame) h += frameBox(s.frame);
    return h;
  }
  function primerCard(k) {
    var P = SQ_PRIMERS[k];
    return '<div class="p-kicker"><svg class="i"><use href="#i-sparkles"/></svg> New to this? Quick primer</div><h2 class="p-h say">' + esc(P.title) + '</h2>' +
      '<p class="p-say say">' + esc(P.short) + '</p>' + shotsFor(P.shots) + '<div class="p-text say">' + P.text + '</div>' +
      (P.blocks ? '<pre class="blocks">' + esc(P.blocks) + '</pre>' : '') +
      '<p class="muted small">Try it in a blank project for a minute if you like. Your path skipped the lesson that teaches this, so here is the short version.</p>';
  }

  function viewPlayer(id) {
    var Ls = L[id], n = R.NODE[id], B = br(id), st = S.me.state;
    var status = R.nodeStatus(st, id, S.cls.openThrough);
    var ns = st.nodes[id] || { steps: [], quiz: {}, challenge: false };
    var readOnly = status === 'locked' || status === 'gated';
    var frozen = status === 'done' || status === 'submitted';
    var cards = questCards(id);
    S.card = S.card || {};
    if (S.card[id] == null) S.card[id] = readOnly ? 0 : firstOpenCard(id);
    var pace = paced() && !readOnly && !frozen, maxK = pace && S.cls.inOrder !== false ? furthestCard(id) : cards.length - 1;
    var k = Math.max(0, Math.min(maxK, S.card[id])), c = cards[k];
    S.card[id] = k;
    if (S.cardKey !== id + ':' + k) { S.cardKey = id + ':' + k; S.cardAt = Date.now(); } // when this card was opened

    function cardDone(cc) {
      if (cc.type === 'intro' || cc.type === 'primer') return !!ns.touched || frozen;
      if (cc.type === 'step') return !!ns.steps[cc.i];
      if (cc.type === 'quiz') return !!(ns.quiz[cc.i] && ns.quiz[cc.i].correct);
      if (cc.type === 'challenge') return !!ns.challenge;
      return status === 'done';
    }
    var h = '<div class="player" style="--c:' + B.color + '">';
    h += '<div class="p-top"><a class="p-back" href="#/map" aria-label="Back to map"><svg class="i"><use href="#i-arrow-left"/></svg> Map</a><div class="p-title"><span class="p-ico">' + SQ_ICONS.branch(n.branch) + '</span>' + esc(Ls.title) + '</div>' +
      '<div class="p-tools"><button class="btn small ghost" data-act="words" data-node="' + id + '" title="Word bank"><svg class="i"><use href="#i-book"/></svg> Words</button>' +
      '<a class="btn small" href="https://scratch.mit.edu/projects/editor/" target="scratchwin" rel="noopener"><svg class="i"><use href="#i-external"/></svg> Scratch <svg class="i"><use href="#i-external"/></svg></a>' +
      '<button class="btn small ghost" data-act="split-help" title="Put Scratch and this side by side"><svg class="i"><use href="#i-columns"/></svg></button>' +
      (readOnly ? '' : '<button class="btn small help-btn' + (S.help && S.help.open ? ' on' : '') + '" data-act="ask-help" data-node="' + id + '" data-step="' + (helpWhere(c) == null ? '' : helpWhere(c)) + '">✋ I’m stuck</button>') + '</div></div>';
    h += '<div class="dots" role="tablist">';
    cards.forEach(function (cc, j) {
      var stretch = cc.type === 'step' && Ls.steps[cc.i].stretch;
      var lbl = cc.type === 'intro' ? '<svg class="i"><use href="#i-target"/></svg>' : cc.type === 'primer' ? '<svg class="i"><use href="#i-sparkles"/></svg>' : cc.type === 'step' ? String(cc.i + 1) : cc.type === 'quiz' ? '?' : cc.type === 'challenge' ? '<svg class="i"><use href="#i-zap"/></svg>' : '<svg class="i"><use href="#i-send"/></svg>';
      h += '<button class="dot' + (j === k ? ' now' : '') + (cardDone(cc) ? ' done' : '') + (stretch ? ' stretch' : '') + ' t-' + cc.type + (j > maxK ? ' locked' : '') + '"' + (j > maxK ? ' aria-disabled="true" data-why="Finish this card first. The next ones unlock as you go."' : '') + ' data-act="card" data-node="' + id + '" data-to="' + j + '" aria-label="Card ' + (j + 1) + (stretch ? ' (stretch)' : '') + '">' + lbl + '</button>';
    });
    h += '</div>';
    if (readOnly) h += '<div class="banner lock small">' + (status === 'locked' ? '<svg class="i"><use href="#i-lock"/></svg> Locked. ' + esc(lockedReason(id)) : '<svg class="i"><use href="#i-clock"/></svg> Your teacher hasn\'t opened this yet.') + ' You can peek!</div>';
    h += helpBanner();
    if (status === 'returned' && c.type !== 'turnin') h += '<div class="banner ret small"><svg class="i"><use href="#i-undo"/></svg> Teacher feedback: ' + esc(ns.feedback || 'See your teacher.') + '</div>';

    h += '<section class="pcard t-' + c.type + '"><button class="say-btn" data-act="speak" aria-label="Read this card out loud"><svg class="i"><use href="#i-volume"/></svg> <span>Read to me</span></button>';
    var nextBtn = k < cards.length - 1 ? '<button class="btn big" data-act="card" data-node="' + id + '" data-to="' + (k + 1) + '">Next <svg class="i"><use href="#i-arrow-right"/></svg></button>' : '';
    var backBtn = k > 0 ? '<button class="btn ghost" data-act="card" data-node="' + id + '" data-to="' + (k - 1) + '"><svg class="i"><use href="#i-arrow-left"/></svg> Back</button>' : '<span></span>';

    if (c.type === 'intro') {
      var video = (S.boot.settings.videos || {})[id];
      var starter = (S.boot.settings.starters || {})[id];
      var core = R.coreSteps(Ls).length;
      h += '<div class="p-kicker">' + esc(B.name) + ' · Quest ' + n.tier + (Ls.project ? ' · ' + esc(Ls.project.name) + ' ' + esc(Ls.project.part) : '') + '</div>' +
        '<h1 class="p-h say">' + esc(Ls.title) + '</h1><p class="p-big say">' + esc(Ls.tagline) + '</p>' +
        (video ? videoEmbed(video) : '') +
        '<div class="p-goal"><b><svg class="i"><use href="#i-target"/></svg> Your mission</b><p class="say">' + esc(Ls.mission || Ls.goal) + '</p></div>' +
        (SQ_UBD.lessons[id] ? '<div class="p-bigq"><b><svg class="i"><use href="#i-help"/></svg> Big question</b><p class="say">' + esc(SQ_UBD.lessons[id].eq) + '</p></div>' : '') +
        '<div class="p-meta"><span><svg class="i"><use href="#i-clock"/></svg> ' + esc(Ls.minutes) + ' min</span><span><svg class="i"><use href="#i-list"/></svg> ' + core + ' steps' + (Ls.steps.length > core && !accom().coreOnly ? ' + ' + (Ls.steps.length - core) + ' stretch' : '') + '</span></div>' +
        (Ls.starter && starter ? '<div class="starter"><svg class="i"><use href="#i-briefcase"/></svg> <b>Missed the last quest, or lost your project?</b> <a href="' + esc(starter) + '" target="_blank" rel="noopener">Open the starter project <svg class="i"><use href="#i-external"/></svg></a>, click <b>Remix</b>, and start from here.</div>' : '') +
        (Ls.warmup ? '<details class="p-more"><summary><svg class="i"><use href="#i-flame"/></svg> Warm-up question</summary><p class="say">' + esc(Ls.warmup) + '</p></details>' : '') +
        (stdOf(id).s.length ? '<details class="p-more std-mini"><summary><svg class="i"><use href="#i-ruler"/></svg> Standards</summary><ul>' + stdOf(id).s.map(function (x) { return '<li><b>6-8.' + esc(x[0]) + '</b> ' + esc(SQ_DLCS.standards[x[0]]) + '</li>'; }).join('') + '</ul></details>' : '') +
        '<div class="p-nav"><span></span><button class="btn primary big" data-act="card" data-node="' + id + '" data-to="1">' + (ns.touched ? 'Keep going <svg class="i"><use href="#i-arrow-right"/></svg>' : 'Let\'s go! <svg class="i"><use href="#i-arrow-right"/></svg>') + '</button></div>';
    } else if (c.type === 'primer') {
      h += primerCard(c.key) + '<div class="p-nav">' + backBtn + nextBtn.replace('btn big', 'btn primary big').replace('Next <svg class="i"><use href="#i-arrow-right"/></svg>', 'Got it <svg class="i"><use href="#i-arrow-right"/></svg>') + '</div>';
    } else if (c.type === 'step') {
      var s = Ls.steps[c.i], on = !!ns.steps[c.i];
      var coreList = R.coreSteps(Ls), num = s.stretch ? 'Stretch step' : 'Step ' + (coreList.indexOf(c.i) + 1) + ' of ' + coreList.length;
      h += '<div class="p-kicker">' + num + (s.stretch ? ' <span class="stretch-tag"><svg class="i"><use href="#i-star"/></svg> If you have time</span>' : '') + '</div><h2 class="p-h say">' + esc(s.title) + '</h2>' +
        '<p class="p-say say">' + (s.short || s.text) + '</p>' + stepBody(id, c.i) +
        '<div class="p-extras">' + (s.short ? '<details class="p-more"><summary><svg class="i"><use href="#i-book"/></svg> Tell me more</summary><div class="p-text say">' + s.text + '</div></details>' : '') +
        (s.tip ? '<details class="p-more hint"><summary><svg class="i"><use href="#i-bulb"/></svg> Need a hint?</summary><p class="say">' + s.tip + '</p></details>' : '') +
        (s.solo ? '<details class="p-more solo"><summary><svg class="i"><use href="#i-user"/></svg> No partner free right now?</summary><p class="say">' + s.solo + '</p></details>' : '') + (readOnly ? '' : confBtn(id, 'step', c.i)) + '</div>';
      if (readOnly || frozen) h += '<div class="p-nav">' + backBtn + (nextBtn || '<span></span>') + '</div>';
      else if (on) h += '<div class="p-done"><svg class="i"><use href="#i-check-circle"/></svg> Done! <button class="linklike" data-act="undo-step" data-node="' + id + '" data-idx="' + c.i + '">undo</button></div><div class="p-nav">' + backBtn + nextBtn + '</div>';
      else h += '<div class="p-nav">' + backBtn + '<span class="row">' + (s.stretch ? '<button class="btn ghost" data-act="card" data-node="' + id + '" data-to="' + (k + 1) + '">Skip</button>' : '') +
        (function () {
          // "I did it!" stays grey until the student has had time to actually do the step
          var readyAt = pace && S.cls.stepSec ? Math.max(S.cardAt, S.lastStepAt || 0) + S.cls.stepSec * 1000 : 0, wait = readyAt > Date.now();
          return '<button class="btn primary big' + (wait ? ' locked' : '') + '"' + (wait ? ' aria-disabled="true" data-ready-at="' + readyAt + '" data-why="Do this step in Scratch first. The button turns green when you have had time to try it."' : '') +
            ' data-act="did-step" data-node="' + id + '" data-idx="' + c.i + '"><svg class="i"><use href="#i-check-circle"/></svg> I did it! <small data-label="+' + R.XP.step + ' XP">' + (wait ? 'do the step first' : '+' + R.XP.step + ' XP') + '</small></button>';
        })() + '</span></div>';
    } else if (c.type === 'quiz') {
      var q = Ls.quiz[c.i], r = ns.quiz[c.i], right = r && r.correct;
      h += '<div class="quiz' + (right ? ' right' : '') + '" id="q-' + c.i + '"><div class="p-kicker">Quick check ' + (c.i + 1) + ' of ' + Ls.quiz.length + (q.blocks ? ' · <svg class="i"><use href="#i-eye"/></svg> Predict' : '') + '</div><h2 class="p-h say">' + esc(q.q) + '</h2>' +
        (q.blocks ? '<pre class="blocks">' + esc(q.blocks) + '</pre>' : '') + '<div class="choices big">';
      q.choices.forEach(function (ch, ci) {
        h += '<button class="choice' + (right && ci === q.answer ? ' correct' : '') + '" data-act="quiz" data-node="' + id + '" data-q="' + c.i + '" data-c="' + ci + '"' + (right || readOnly ? ' disabled' : '') + '>' + esc(ch) + '</button>';
      });
      h += '</div>' + (right ? '<p class="explain say"><svg class="i"><use href="#i-check-circle"/></svg> ' + esc(q.explain) + (r.firstTry ? ' <span class="chip gold">First try!</span>' : '') + '</p>' : '<p class="explain" hidden></p>') + (readOnly ? '' : '<div class="conf-row">' + confBtn(id, 'quiz', c.i) + '</div>') + '</div>';
      h += '<div class="p-nav">' + backBtn + (right ? nextBtn.replace('btn big', 'btn primary big') : readOnly ? nextBtn : '<span></span>') + '</div>';
    } else if (c.type === 'challenge') {
      var Ch = Ls.challenge, ans = Ch.answer || Ch.blocks;
      h += '<div class="p-kicker"><svg class="i"><use href="#i-zap"/></svg> Expert challenge · optional</div><h2 class="p-h say">' + esc(Ch.title) + '</h2><p class="p-say say">' + (Ch.short || Ch.text) + '</p>' +
        '<div class="p-extras">' + (Ch.short ? '<details class="p-more"><summary><svg class="i"><use href="#i-book"/></svg> Tell me more</summary><div class="p-text say">' + Ch.text + '</div></details>' : '') +
        (ans ? '<details class="p-more answer"><summary><svg class="i"><use href="#i-help"/></svg> Stuck? Show me one way</summary><pre class="blocks">' + esc(ans) + '</pre></details>' : '') + '</div>';
      if (readOnly || frozen) h += '<div class="p-nav">' + backBtn + nextBtn + '</div>';
      else if (ns.challenge) h += '<div class="p-done"><svg class="i"><use href="#i-zap"/></svg> Challenge complete! <button class="linklike" data-act="undo-chal" data-node="' + id + '">undo</button></div><div class="p-nav">' + backBtn + nextBtn + '</div>';
      else h += '<div class="p-nav">' + backBtn + '<span class="row"><button class="btn ghost" data-act="card" data-node="' + id + '" data-to="' + (k + 1) + '">Skip</button><button class="btn primary big" data-act="did-chal" data-node="' + id + '"><svg class="i"><use href="#i-zap"/></svg> I did it! <small>+' + R.XP.challenge + ' XP</small></button></span></div>';
    } else {
      var coreIdx = R.coreSteps(Ls);
      var stepsLeft = coreIdx.filter(function (i) { return !ns.steps[i]; }).length;
      var quizLeft = Ls.quiz.filter(function (_, i) { return !(ns.quiz[i] && ns.quiz[i].correct); }).length;
      if (status === 'done') {
        h += '<div class="p-celebrate">🏆</div><h2 class="p-h center say">Quest complete!</h2>' + (ns.feedback ? '<div class="p-goal"><b>Teacher says:</b><p>' + esc(ns.feedback) + '</p></div>' : '') +
          rateBox(id) + '<div class="p-nav center"><a class="btn primary big" href="#/map">Back to the map <svg class="i"><use href="#i-arrow-right"/></svg></a></div>';
      } else if (status === 'submitted') {
        h += rateBox(id);
        h += '<div class="p-celebrate"><svg class="i"><use href="#i-send"/></svg></div><h2 class="p-h center say">Turned in!</h2><p class="p-big center say">Your teacher will check it soon. You can start another quest.</p><div class="p-nav center"><a class="btn primary big" href="#/map">Back to the map <svg class="i"><use href="#i-arrow-right"/></svg></a></div>';
      } else if (readOnly) {
        h += '<h2 class="p-h">Turn it in</h2><p class="p-big">You can turn this in once the quest is open.</p><div class="p-nav">' + backBtn + '<span></span></div>';
      } else if (stepsLeft || quizLeft) {
        h += '<h2 class="p-h say">Almost there!</h2><p class="p-big say">Finish ' + (stepsLeft ? stepsLeft + ' more step' + (stepsLeft > 1 ? 's' : '') : '') + (stepsLeft && quizLeft ? ' and ' : '') + (quizLeft ? quizLeft + ' quick check' + (quizLeft > 1 ? 's' : '') : '') + ' first.</p>' +
          '<div class="p-nav">' + backBtn + '<button class="btn primary big" data-act="card" data-node="' + id + '" data-to="' + firstOpenCard(id) + '">Show me <svg class="i"><use href="#i-arrow-right"/></svg></button></div>';
      } else {
        h += '<div class="lockzone"><div class="p-kicker">Last step!</div><h2 class="p-h say"><svg class="i"><use href="#i-send"/></svg> Turn in your quest</h2>' +
          (Ls.checklist ? '<div class="checklist"><b class="say">Check your project has:</b>' + Ls.checklist.map(function (x, j) { return '<label class="check small-check"><input type="checkbox" data-need="checklist"' + (ns.link ? ' checked' : '') + '><span class="box"></span><span class="say">' + esc(x) + '</span></label>'; }).join('') + '</div>' : '') +
          '<p class="p-text say">' + esc(Ls.submit) + '</p>' +
          '<form data-form="submit" data-node="' + id + '"><label>Paste your Scratch link ' + (S.cls.requireLink ? '' : '<span class="muted">(or just show your teacher)</span>') + '<input name="link" type="url" placeholder="https://scratch.mit.edu/projects/…" value="' + esc(ns.link || '') + '"' + (S.cls.requireLink ? ' data-need="paste your Scratch link"' : '') + '></label>' +
          '<label>One thing you\'re proud of <span class="muted">(optional)</span><input name="reflection" maxlength="300" value="' + esc(ns.reflection || '') + '"></label>' +
          '<p class="lock-note" hidden></p><div class="p-nav">' + backBtn + '<button class="btn primary big" data-lock-btn>' + (status === 'returned' ? 'Turn in again' : 'Turn it in!') + ' <small>+' + R.XP.lesson + ' XP</small></button></div></form></div>' + rateBox(id);
      }
    }
    h += '</section></div>';
    return h;
  }
  // ---- read aloud (built into Chrome/ChromeOS, works offline, no account needed)
  var speech = window.speechSynthesis || null;
  function selectText(el) { var r = document.createRange(); r.selectNodeContents(el); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Text selected. Press Ctrl+C to copy.'); }
  function stopSpeaking() {
    if (!speech) return;
    try { speech.cancel(); } catch (e) { }
    document.querySelectorAll('.say-btn.on').forEach(function (b) { b.classList.remove('on'); b.querySelector('span').textContent = 'Read to me'; });
  }
  function pickVoice() {
    var vs = speech.getVoices() || [];
    return vs.filter(function (v) { return /en-US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name); })[0] ||
      vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  function speakCard(btn) {
    if (!speech || typeof SpeechSynthesisUtterance === 'undefined') { toast('<svg class="i"><use href="#i-volume"/></svg> Read-aloud isn\'t available in this browser. Try Chrome.'); return; }
    if (btn.classList.contains('on')) { stopSpeaking(); return; }
    stopSpeaking();
    var card = btn.closest('.pcard');
    var parts = [];
    card.querySelectorAll('.say').forEach(function (el) {
      var d = el.closest('details');
      if (d && !d.open) return; // skip folded-away text (closed "Tell me more", hints)
      parts.push(el.textContent);
    });
    var ch = card.querySelectorAll('.choice');
    if (ch.length && !card.querySelector('.quiz.right')) parts.push('Your choices are: ' + Array.prototype.map.call(ch, function (b) { return b.textContent; }).join('. Or, '));
    var text = parts.join('. ').replace(/[✅📨📖💡🎯🔥⚡]/gu, '').replace(/→|➜/g, ', then ').replace(/[\[\]()]/g, '').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.');
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05; u.lang = 'en-US';
    var v = pickVoice();
    if (SQ_I18N.lang() === 'pt') { u.lang = 'pt-BR'; v = (speech.getVoices() || []).filter(function (x) { return /^pt/i.test(x.lang); }).sort(function (a, b) { return /BR/i.test(b.lang) - /BR/i.test(a.lang); })[0] || null; }
    if (v) u.voice = v;
    u.onend = u.onerror = function () { btn.classList.remove('on'); btn.querySelector('span').textContent = 'Read to me'; };
    btn.classList.add('on'); btn.querySelector('span').textContent = 'Stop';
    speech.speak(u);
  }
  if (speech && speech.onvoiceschanged !== undefined) speech.onvoiceschanged = function () { };

  function splitHelp() {
    modal('<h2><svg class="i"><use href="#i-columns"/></svg> Scratch + Quest, side by side</h2><div class="split-pic"><div class="sp-l"><svg class="i"><use href="#i-external"/></svg> Scratch</div><div class="sp-r"><svg class="i"><use href="#i-compass"/></svg> Quest</div></div>' +
      '<ol class="split-steps"><li>Click <b><svg class="i"><use href="#i-external"/></svg> Scratch <svg class="i"><use href="#i-external"/></svg></b> to open Scratch.</li><li>In Scratch, press <kbd>Alt</kbd> + <kbd>[</kbd> to snap it <b>left</b>.</li><li>Come back here and press <kbd>Alt</kbd> + <kbd>]</kbd> to snap this <b>right</b>.</li></ol>' +
      '<p class="muted small">Not on a Chromebook? Windows: <kbd>⊞ Win</kbd> + <kbd><svg class="i"><use href="#i-arrow-left"/></svg></kbd> / <kbd><svg class="i"><use href="#i-arrow-right"/></svg></kbd>. Mac: drag the windows side by side.</p><div class="row center"><button class="btn primary" data-act="close-modal">Got it!</button></div>');
  }
  function wordsModal(id) {
    var Ls = L[id];
    modal('<h2><svg class="i"><use href="#i-book"/></svg> Word bank</h2><p class="muted small">Tap a word to see what it means.</p><div class="wordlist">' + (Ls.vocab || []).map(function (v) {
      return '<details class="word"><summary>' + (v.icon ? '<span class="w-ico">' + esc(v.icon) + '</span> ' : '') + esc(v.term) + '</summary><p>' + esc(v.def) + '</p></details>';
    }).join('') + '</div>');
  }

  // ------------------------------------------------------------ avatar editor
  // ------------------------------------------------------------ Character Studio (avatar builder + shop)
  var AV_TABS = [['Looks', [['hair', 'Hair'], ['eyes', 'Eyes'], ['mouth', 'Mouth'], ['outfit', 'Outfit'], ['hat', 'Hats'], ['extra', 'Glasses & more']]],
    ['Bling', [['aura', 'Auras'], ['effect', 'Sparkles'], ['pet', 'Pets'], ['bg', 'Backgrounds'], ['frame', 'Frames'], ['title', 'Titles']]]];
  var AV_COLOR_FOR = { hair: 'hairColor', outfit: 'outfitColor', bg: 'bgColor' };
  function coinTag(n, cls) { return '<span class="coin-tag ' + (cls || '') + '"><span class="coin" aria-hidden="true"></span>' + fmtN(n) + '</span>'; }
  function shopOn() { return !(S.cls && S.cls.shop === false); }
  function itemState(cat, item, p, d) {
    var ok = A.isUnlocked(item.unlock, p);
    var forSale = item.unlock && item.unlock.price;
    return { ok: ok, forSale: forSale && !ok, equipped: d[cat] === item.id, price: forSale ? item.unlock.price : 0, key: forSale ? item.unlock.key : null };
  }
  // items in the draft that the student hasn't bought yet
  function unpaid(d, p) {
    var out = [];
    Object.keys(A.CATALOG).forEach(function (cat) {
      var it = A.itemOf(cat, d[cat]);
      if (it && it.unlock && it.unlock.price && !A.isUnlocked(it.unlock, p)) out.push({ cat: cat, item: it });
    });
    return out;
  }
  function collectionCount(p) {
    var have = 0, total = 0;
    Object.keys(A.CATALOG).forEach(function (cat) { A.CATALOG[cat].forEach(function (i) { if (i.id === 'none') return; total++; if (A.isUnlocked(i.unlock, p)) have++; }); });
    return { have: have, total: total };
  }
  function goalCard(p, compact) {
    if (!p.goal || !shopOn()) return '';
    var parts = p.goal.split(':'), it = A.itemOf(parts[0], parts[1]);
    if (!it) return '';
    var price = it.unlock.price, pct = Math.min(100, Math.round(Math.max(0, p.coins) / price * 100));
    var prev = Object.assign({}, S.me.state.avatar); prev[parts[0]] = parts[1];
    return '<div class="card goal-card r-' + it.rarity + '">' + (compact ? '' : '') +
      '<div class="goal-row"><div class="goal-av">' + (parts[0] === 'title' ? '<span class="title-prev sm">' + esc(it.name) + '</span>' : A.svg(prev, 56)) + '</div>' +
      '<div class="grow"><div class="eyebrow">Saving up for</div><b>' + esc(it.name) + '</b> <span class="rar-chip r-' + it.rarity + '">' + A.RARITY[it.rarity].name + '</span>' +
      '<div class="xpbar coinbar"><i style="width:' + pct + '%"></i></div><div class="small">' + coinTag(Math.max(0, p.coins)) + ' of ' + fmtN(price) + (p.coins >= price ? ' · <b>You can buy it!</b>' : ' · ' + fmtN(price - p.coins) + ' to go') + '</div></div></div>' +
      (compact ? '<a class="btn small" href="#/avatar">Open the studio</a>' : '') + '</div>';
  }
  function viewAvatar() {
    var p = prof();
    if (!S.avatarDraft) S.avatarDraft = JSON.parse(JSON.stringify(Object.assign({}, A.DEFAULT, S.me.state.avatar || {})));
    var d = S.avatarDraft, tab = S.avatarTab || 'hair';
    var col = collectionCount(p), owe = unpaid(d, p), title = A.titleText(d);
    var h = '<div class="studio"><section class="card studio-stage">' +
      '<div class="stage-top"><h1>' + (S.me.state.avatarSet ? 'Character Studio' : 'Create your hero!') + '</h1>' + (shopOn() ? '<div class="coin-pill" title="Coins: earn 1 for every 5 XP">' + coinTag(Math.max(0, p.coins), 'big') + '<small>coins</small></div>' : '') + '</div>' +
      '<div class="pedestal' + (S.studioBurst ? ' burst' : '') + '"><div class="spot"></div>' +
      '<i class="tw t1"></i><i class="tw t2"></i><i class="tw t3"></i><i class="tw t4"></i><i class="tw t5"></i>' +
      '<div class="stage-av">' + A.svg(d, 230, { title: 'Your character' }) + '</div><div class="plinth"></div></div>' +
      '<div class="nameplate"><b class="notr">' + esc(S.me.name) + '</b>' + (title ? '<span class="np-title">' + esc(title) + '</span>' : '') + '<span class="np-lv">Level ' + p.level + ' · ' + esc(p.rank) + '</span></div>';
    if (owe.length) {
      var cost = owe.reduce(function (a, x) { return a + x.item.unlock.price; }, 0);
      h += '<div class="tryon"><b>Trying on:</b> ' + owe.map(function (x) { return esc(x.item.name); }).join(', ') + ' (' + coinTag(cost) + ')' +
        '<div class="row center">' + (owe.length === 1 ? (p.coins >= cost ? '<button class="btn primary" data-act="av-buy" data-cat="' + owe[0].cat + '" data-id="' + owe[0].item.id + '">Buy for ' + coinTag(cost) + '</button>' : '<button class="btn" data-act="av-goal" data-key="' + owe[0].item.unlock.key + '">Save up for it</button>') : '') +
        '<button class="btn ghost" data-act="av-undo-try">Take ' + (owe.length > 1 ? 'them' : 'it') + ' off</button></div></div>';
    }
    h += '<div class="row center"><button class="btn" data-act="av-random"><svg class="i"><use href="#i-dice"/></svg> Surprise me</button><button class="btn primary big" data-act="av-save"><svg class="i"><use href="#i-save"/></svg> Save my look</button></div>' +
      '<div class="collect"><div class="row between small"><b>Collection</b><span>' + col.have + ' / ' + col.total + ' items</span></div><div class="xpbar"><i style="width:' + Math.round(col.have / col.total * 100) + '%"></i></div></div>' +
      '<div class="row center small muted"><button class="linklike" data-act="sound-toggle">' + (SQ_SOUND.muted() ? 'Sound is off: turn it on' : 'Sound is on: turn it off') + '</button></div>' +
      goalCard(p) + '<a class="arc-promo" href="#/arcade"><svg class="i"><use href="#i-gamepad"/></svg><span><b>Block Rush arcade</b><small>Power-ups, tickets and the class leaderboard</small></span><svg class="i"><use href="#i-arrow-right"/></svg></a></section>';
    // ---- the shop / wardrobe
    h += '<section class="card studio-shop"><div class="studio-tabs">' + AV_TABS.map(function (g) {
      return '<div class="tab-group"><span class="tg-label">' + g[0] + '</span>' + g[1].map(function (t) {
        var items = A.CATALOG[t[0]].filter(function (i) { return i.id !== 'none' && (shopOn() || !(i.unlock && i.unlock.price)); });
        var have = items.filter(function (i) { return A.isUnlocked(i.unlock, p); }).length;
        return '<button class="' + (t[0] === tab ? 'on' : '') + '" data-act="av-tab" data-tab="' + t[0] + '">' + t[1] + ' <small>' + have + '/' + items.length + '</small></button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    if (tab === 'hair' || tab === 'eyes' || tab === 'mouth') {
      h += '<div class="av-sub">Skin</div><div class="swatches">' + A.COLORS.skin.slice(0, 8).map(function (c) { return swatch('skin', c, d.skin === c, true); }).join('') + '</div>';
      h += '<div class="av-sub">Fantasy skin</div><div class="swatches">' + A.COLORS.skin.slice(8).map(function (c) { return swatch('skin', c, d.skin === c, true); }).join('') + '</div>';
    }
    var colorKey = AV_COLOR_FOR[tab];
    if (colorKey) h += '<div class="av-sub">' + ({ hairColor: 'Hair color', outfitColor: 'Outfit color', bgColor: 'Background color' })[colorKey] + '</div><div class="swatches">' + A.COLORS[colorKey].map(function (c) {
      return swatch(colorKey, c, d[colorKey] === c, A.isUnlocked(A.COLOR_UNLOCK[c], p));
    }).join('') + '</div>';
    h += '<div class="av-sub">' + (tab === 'title' ? 'Titles show under your name' : 'Style') + '</div><div class="item-grid">';
    A.CATALOG[tab].forEach(function (item) {
      if (!shopOn() && item.unlock && item.unlock.price) return;
      var st = itemState(tab, item, p, d), test = Object.assign({}, d); test[tab] = item.id;
      var status = st.equipped ? (st.forSale ? '<span class="st-try">Trying on</span>' : '<span class="st-on"><svg class="i"><use href="#i-check"/></svg> Wearing</span>')
        : st.ok ? (item.unlock && item.unlock.price ? '<span class="st-own">Owned</span>' : '<span class="st-free">Free</span>')
        : st.forSale ? coinTag(st.price, p.coins >= st.price ? 'can' : 'cant')
        : '<span class="st-lock"><svg class="i"><use href="#i-lock"/></svg> ' + esc(A.unlockText(item.unlock)) + '</span>';
      var goal = st.forSale && p.goal === st.key;
      h += '<button class="item r-' + item.rarity + (st.equipped ? ' on' : '') + (!st.ok && !st.forSale ? ' locked' : '') + (st.forSale ? ' sale' : '') + '" data-act="av-pick" data-cat="' + tab + '" data-id="' + item.id + '"' +
        ' title="' + esc(item.name + (st.ok ? '' : ' (' + A.unlockText(item.unlock) + ')')) + '">' +
        (item.rarity !== 'common' ? '<span class="rar-chip r-' + item.rarity + '">' + A.RARITY[item.rarity].name + '</span>' : '') +
        (goal ? '<span class="goal-flag">Goal</span>' : '') +
        (tab === 'title' ? '<span class="title-prev">' + esc(item.id === 'none' ? 'No title' : item.name) + '</span>' : A.svg(test, 86)) +
        '<span class="item-name">' + esc(item.name) + '</span>' + status + '</button>';
    });
    return h + '</div></section></div>';
  }
  function swatch(key, c, on, ok) {
    var bg = c === 'neon' ? 'linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5)' : c;
    return '<button class="sw' + (on ? ' on' : '') + (ok ? '' : ' locked') + '" style="background:' + bg + '" data-act="av-color" data-key="' + key + '" data-c="' + c + '" title="' + (ok ? c : esc(A.unlockText(A.COLOR_UNLOCK[c]))) + '" aria-label="color ' + c + '">' + (ok ? '' : '<svg class="i"><use href="#i-lock"/></svg>') + '</button>';
  }
  // ------------------------------------------------------------ pacing timer and idle nudges
  setInterval(function () {
    document.querySelectorAll('[data-ready-at]').forEach(function (b) {
      var left = Math.ceil((+b.getAttribute('data-ready-at') - Date.now()) / 1000), sm = b.querySelector('small');
      if (left > 0) { if (sm) sm.textContent = 'ready in ' + left + 's'; return; }
      b.removeAttribute('data-ready-at'); b.removeAttribute('aria-disabled'); b.removeAttribute('data-why'); b.classList.remove('locked');
      if (sm) sm.textContent = sm.getAttribute('data-label');
      b.classList.add('ready-pop'); SQ_SOUND.play('ready');
    });
    nudgeTick();
  }, 1000);
  // Nudges: when a student has not clicked, typed or scrolled for a while, the next thing to do
  // pulses and a small tip points at it. Work steps wait much longer (students are building in Scratch).
  S.lastAct = Date.now();
  function nudgeClear() {
    document.querySelectorAll('.nudge').forEach(function (e) { e.classList.remove('nudge'); });
    var tip = document.getElementById('nudge-tip'); if (tip) tip.remove();
    S.nudged = false;
  }
  function nudgeReset() { S.lastAct = Date.now(); if (S.nudged) nudgeClear(); }
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) { document.addEventListener(ev, nudgeReset, { passive: true, capture: true }); });
  var lastMove = 0;
  document.addEventListener('pointermove', function () { var n = Date.now(); if (n - lastMove > 1500) { lastMove = n; nudgeReset(); } }, { passive: true });
  function nudgeTarget() {
    var r = route();
    if (!S.me || r[0] === 't' || S.arcRun || document.querySelector('.modal-wrap, .fx-wrap')) return null;
    if (r[0] === 'quest') {
      var card = document.querySelector('.pcard'); if (!card) return null;
      var need = [].filter.call(card.querySelectorAll('.lockzone [data-need]'), function (el) { return el.type === 'checkbox' ? !el.checked : !String(el.value || '').trim(); })[0];
      if (need) return need.type === 'checkbox' ? { el: need.closest('label'), text: 'Check your project, then tick each box.' } : { el: need, text: 'Paste your Scratch project link here.' };
      var ch = card.querySelector('.quiz:not(.right):not(.cooling) .choices'); if (ch) return { el: ch, text: 'Pick the answer you think is right.' };
      var did = card.querySelector('[data-act="did-step"]');
      if (did) return did.getAttribute('aria-disabled') ? null : { el: did, text: 'Finished this step in Scratch? Tap I did it!', work: true, alt: card.querySelector('.p-more.hint summary') || document.querySelector('.help-btn') };
      if (card.querySelector('[data-act="did-chal"]')) return { el: card.querySelector('.p-nav .row') || card.querySelector('[data-act="did-chal"]'), text: 'Try the challenge, or tap Skip to move on.', work: true };
      var b = card.querySelector('.p-nav .btn.primary:not(.locked)') || card.querySelector('.p-nav .btn.big:not(.locked)');
      return b ? { el: b, text: 'Tap here to keep going.' } : null;
    }
    if (r[0] === 'avatar') { var sv = document.querySelector('[data-act="av-save"]'); return sv && !S.me.state.avatarSet ? { el: sv, text: 'Happy with your character? Tap Save my look.' } : null; }
    if (r[0] === 'map' || r[0] === '') { var go2 = document.querySelector('main a.btn.primary[href^="#/quest/"]'); return go2 ? { el: go2, text: 'Your next quest is ready. Tap here to open it.' } : null; }
    return null;
  }
  function nudgeShow(el, text) {
    nudgeClear();
    var r0 = el.getBoundingClientRect();
    if (r0.top < 70 || r0.bottom > innerHeight - 10) el.scrollIntoView({ block: 'center', behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth' });
    el.classList.add('nudge');
    var tip = document.createElement('div'); tip.id = 'nudge-tip'; tip.setAttribute('role', 'status'); tip.textContent = text;
    document.body.appendChild(tip);
    var place = function () {
      if (!el.isConnected || !tip.isConnected) return;
      var r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, above = r.top > th + 24;
      tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
      tip.style.top = (above ? r.top - th - 12 : r.bottom + 12) + 'px';
      tip.classList.toggle('below', !above);
      tip.style.setProperty('--ax', Math.max(14, Math.min(tw - 14, r.left + r.width / 2 - parseFloat(tip.style.left))) + 'px');
    };
    place(); setTimeout(place, 450);
    SQ_SOUND.play('pop');
  }
  function nudgeTick() {
    var sec = (S.cls && S.cls.nudgeSec) || 0;
    if (!sec || document.hidden || !S.boot) return;
    var tg = nudgeTarget();
    if (!tg) { if (S.nudged) nudgeClear(); return; }
    var idle = (Date.now() - S.lastAct) / 1000, delay = tg.work ? Math.max(120, sec * 4) : sec;
    if (idle >= delay && !S.nudged) { nudgeShow(tg.el, tg.text); S.nudged = 'next'; }
    else if (tg.work && tg.alt && idle >= delay * 2 && S.nudged === 'next') { nudgeShow(tg.alt, 'Stuck? Open the hint, or tap I’m stuck to ask for help.'); S.nudged = 'help'; }
  }

  // ------------------------------------------------------------ help requests, feedback, locked buttons
  var FB_REASONS = [['unclear', '😵', 'The instructions were unclear'], ['broken', '🐞', 'My code didn’t work'], ['hard', '🧗', 'Too hard'], ['easy', '😴', 'Too easy'], ['other', '💬', 'Something else']];
  var FACES = ['😣', '😕', '😐', '🙂', '🤩'], FACE_WORDS = ['Not fun', 'Meh', 'OK', 'Good', 'Awesome'];
  function fbFor(id) { return ((S.me && S.me.state.fb) || {})[id] || {}; }
  function confBtn(id, kind, i) {
    var has = (fbFor(id).flags || {})[kind + ':' + i];
    return '<button class="conf-btn' + (has ? ' has' : '') + '" data-act="confusing" data-node="' + id + '" data-kind="' + kind + '" data-idx="' + i + '">' +
      (has ? '<svg class="i"><use href="#i-check"/></svg> You flagged this. Thanks!' : '🤔 Confusing?') + '</button>';
  }
  function rateBox(id) {
    var fb = fbFor(id);
    return '<form class="rate-box" data-form="rate" data-node="' + id + '"><div class="row between"><b>Rate this quest</b>' + (fb.rating ? '<span class="muted small">You can change it</span>' : '<span class="chip gold">+' + R.XP.rate + ' XP</span>') + '</div>' +
      '<div class="faces" role="radiogroup" aria-label="Rating">' + FACES.map(function (f, i) {
        return '<label class="face"><input type="radio" name="rating" value="' + (i + 1) + '"' + (fb.rating === i + 1 ? ' checked' : '') + '><span>' + f + '</span><small>' + FACE_WORDS[i] + '</small></label>';
      }).join('') + '</div>' +
      '<label>What was the hardest part? <span class="muted">(optional)</span><input name="hardest" maxlength="200" value="' + esc(fb.hardest || '') + '"></label>' +
      '<label>What would make this quest better? <span class="muted">(optional)</span><input name="change" maxlength="200" value="' + esc(fb.change || '') + '"></label>' +
      '<button class="btn">' + (fb.rating ? 'Update my rating' : 'Send my rating') + '</button></form>';
  }
  function helpWhere(c) { return c.type === 'step' ? c.i : (c.type === 'quiz' || c.type === 'turnin' || c.type === 'challenge') ? c.type : null; }
  function helpBanner() {
    return S.help && S.help.open ? '<div class="banner helpwait" role="status"><span class="hand">✋</span> <b>Help is on the way!</b> Keep trying while you wait… <button class="btn small" data-act="cancel-help">I figured it out 👍</button></div>' : '';
  }
  function helpLoadMine() {
    if (document.hidden) return;
    API.call('myHelp', {}).then(function (res) {
      var was = S.help && S.help.open;
      S.help = res.help;
      if (was && !res.help.open) toast('<span class="t-ico">✋</span><div><b>Your teacher marked your help request as done.</b></div>');
      if (was !== res.help.open && route()[0] === 'quest') { S.keepScroll = true; var y = window.scrollY; render(); window.scrollTo(0, y); }
    }).catch(function () { });
  }
  function agoShort(t, nowT) { var m = Math.max(0, Math.round(((nowT || Date.now()) - t) / 60000)); return m < 1 ? 'just now' : m + ' min ago'; }
  function helpListHTML(list, classId, nowT) {
    return '<ul class="help-list">' + list.map(function (h) {
      return '<li>' + avatarImgTag(h.avatar, 'hl-av') + '<div class="grow"><b>' + esc(h.name) + '</b> <span class="muted small">' + agoShort(h.at, nowT) + '</span><div class="small">' + esc(h.where) + '</div>' +
        (h.note ? '<div class="hl-note">“' + esc(h.note) + '”</div>' : '') + '</div><button class="btn small primary" data-act="help-done" data-who="' + h.who + '" data-class="' + classId + '"><svg class="i"><use href="#i-check"/></svg> Helped</button></li>';
    }).join('') + '</ul>';
  }
  // Teacher Dashboard: the "needs help" card, refreshed every 10 seconds while the Dashboard is open
  function tHelpStart() {
    if (S.tHelpTimer) clearInterval(S.tHelpTimer);
    var tick = function () {
      if (document.hidden) return;
      var box = document.getElementById('t-helpbox'), c = tc();
      if (!box || !c) { clearInterval(S.tHelpTimer); S.tHelpTimer = null; return; }
      API.call('helpList', { classId: c.id }).then(function (res) { tHelpPaint(res, c.id); }).catch(function () { });
    };
    tick(); S.tHelpTimer = setInterval(tick, 15000);
  }
  function tHelpPaint(res, classId) {
    var box = document.getElementById('t-helpbox'); if (!box) return;
    var seen = S.tHelpSeen || (S.tHelpSeen = {}), fresh = res.list.filter(function (h) { return !seen[h.who + h.at]; });
    if (S.tHelpLoaded && fresh.length) SQ_SOUND.play('doorbell');
    res.list.forEach(function (h) { seen[h.who + h.at] = 1; }); S.tHelpLoaded = true;
    box.innerHTML = res.list.length ? '<div class="card needhelp"><h2><span class="hand">✋</span> ' + res.list.length + ' need' + (res.list.length === 1 ? 's' : '') + ' help</h2>' + helpListHTML(res.list, classId, res.serverNow) + '</div>' : '';
  }

  // Locked buttons: grey but still clickable, so a click can explain what's missing.
  function lockUpdate(zone, quiet) {
    var btn = zone.querySelector('[data-lock-btn]'); if (!btn) return;
    var missing = [].filter.call(zone.querySelectorAll('[data-need]'), function (el) { return el.type === 'checkbox' ? !el.checked : !String(el.value || '').trim(); });
    var note = zone.querySelector('.lock-note');
    if (missing.length) {
      btn.classList.add('locked'); btn.setAttribute('aria-disabled', 'true');
      var boxes = missing.filter(function (el) { return el.type === 'checkbox'; }).length, other = missing.filter(function (el) { return el.type !== 'checkbox'; });
      var bits = []; if (boxes) bits.push('tick ' + boxes + ' more checklist item' + (boxes > 1 ? 's' : '')); other.forEach(function (el) { bits.push(el.getAttribute('data-need')); });
      if (note) { note.hidden = false; note.textContent = 'To go on: ' + bits.join(', ') + '.'; }
    } else if (btn.classList.contains('locked')) {
      btn.classList.remove('locked'); btn.removeAttribute('aria-disabled');
      if (note) note.hidden = true;
      if (!quiet) { btn.classList.remove('ready-pop'); void btn.offsetWidth; btn.classList.add('ready-pop'); SQ_SOUND.play('ready'); }
    }
  }
  function lockedClick(btn) {
    SQ_SOUND.play('buzz');
    btn.classList.remove('shake-red'); void btn.offsetWidth; btn.classList.add('shake-red');
    var zone = btn.closest('.lockzone');
    if (zone) {
      var note = zone.querySelector('.lock-note'); if (note) { note.classList.remove('flash-red'); void note.offsetWidth; note.classList.add('flash-red'); }
      var missing = [].filter.call(zone.querySelectorAll('[data-need]'), function (el) { return el.type === 'checkbox' ? !el.checked : !String(el.value || '').trim(); });
      missing.forEach(function (el) { var t = el.type === 'checkbox' ? el.closest('label') : el; t.classList.add('need-miss'); setTimeout(function () { t.classList.remove('need-miss'); }, 1800); });
      if (missing[0]) (missing[0].type === 'checkbox' ? missing[0].closest('label') : missing[0]).scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    var why = btn.getAttribute('data-why'); if (why) toast('<svg class="i"><use href="#i-lock"/></svg> ' + esc(why));
  }
  function copyText(text) {
    var ok = function () { toast('<svg class="i"><use href="#i-clipboard"/></svg> Copied! Paste it to Claude.'); };
    var fallback = function () {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      var done = false; try { done = document.execCommand('copy'); } catch (e) { }
      ta.remove();
      if (done) ok(); else modal('<h2>Copy the report</h2><p class="muted">Press Ctrl+C (or ⌘C) to copy.</p><textarea class="report-box" rows="16">' + esc(text) + '</textarea>', 'wide');
      var box = document.querySelector('.report-box'); if (box) box.select();
    };
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }

  // ------------------------------------------------------------ teacher: lesson feedback report
  function fbStepLabel(Lx, i) { var core = R.coreSteps(Lx), j = core.indexOf(i); return j >= 0 ? String(j + 1) : 'Stretch (' + (i + 1) + ')'; }
  function fbScope() {
    var c = tc(), all = S.fbAll;
    return S.teacher.students.filter(function (s) { return !s.isTeacher && (all || !c || s.classId === c.id); });
  }
  function fbStats(id, ss) {
    var Lx = L[id], o = { id: id, started: 0, finished: 0, ratings: [], steps: [], quiz: [], hardest: [], change: [] };
    Lx.steps.forEach(function (st, i) { o.steps.push({ i: i, title: st.title, flags: 0, reasons: {}, notes: [], help: 0 }); });
    Lx.quiz.forEach(function (q, i) { o.quiz.push({ i: i, q: q.q, answered: 0, missed: 0, flags: 0 }); });
    var other = 0;
    ss.forEach(function (s) {
      var ns = s.state.nodes[id], fb = (s.state.fb || {})[id];
      if (ns && (ns.touched || ns.steps.some(Boolean) || Object.keys(ns.quiz || {}).length)) o.started++;
      if (ns && (ns.status === 'done' || ns.status === 'submitted')) o.finished++;
      if (ns) Object.keys(ns.quiz || {}).forEach(function (k) { var r = ns.quiz[k], Q = o.quiz[k]; if (!Q || !r || !r.tries) return; Q.answered++; if (!r.firstTry) Q.missed++; });
      if (!fb) return;
      if (fb.rating) o.ratings.push(fb.rating);
      if (fb.hardest) o.hardest.push(fb.hardest);
      if (fb.change) o.change.push(fb.change);
      Object.keys(fb.flags || {}).forEach(function (k) {
        var f = fb.flags[k], parts = k.split(':'), arr = parts[0] === 'quiz' ? o.quiz : o.steps, x = arr[+parts[1]];
        if (!x) return;
        x.flags++;
        if (parts[0] === 'step') { x.reasons[f.reason] = (x.reasons[f.reason] || 0) + 1; if (f.note) x.notes.push(f.note); }
      });
      Object.keys(fb.help || {}).forEach(function (k) { if (o.steps[+k] && /^\d+$/.test(k)) o.steps[+k].help += fb.help[k]; else other += fb.help[k]; });
    });
    o.otherHelp = other;
    o.avg = o.ratings.length ? o.ratings.reduce(function (a, b) { return a + b; }, 0) / o.ratings.length : 0;
    o.hot = o.steps.filter(function (x) { return x.flags || x.help; }).sort(function (a, b) { return (b.flags * 2 + b.help) - (a.flags * 2 + a.help); });
    o.hardQ = o.quiz.filter(function (q) { return q.answered && q.missed / q.answered >= 0.3; });
    o.any = o.started || o.ratings.length || o.hot.length;
    return o;
  }
  function reasonText(r) { var x = FB_REASONS.filter(function (z) { return z[0] === r; })[0]; return x ? x[2].toLowerCase().replace('my code', 'the code').replace('’', '\'') : r; }
  function fbMarkdown(ids) {
    var ss = fbScope(), c = tc(), d = new Date();
    var date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    var md = '# Scratch Quest lesson feedback\n\n6th grade: Scratch · ' + date + ' · ' + ss.length + ' students in ' + (S.fbAll || !c ? 'all classes' : c.name) + ' · student names removed\n\n' +
      'Please use this to improve the lessons in the Scratch Quest repository. Each lesson is a JavaScript file (path given) in the `SQ_LESSONS.<id> = {...}` format described in `docs/LESSON_SPEC.md`; run `node tools/validate.js` after editing. ' +
      'Steps are numbered the way students see them (Step 1 = the first build step; optional "stretch" steps are marked). Quiz "missed" counts first tries only. ' +
      'Saved progress is stored by step position, so change a step\'s content in place rather than inserting or removing steps.\n';
    ids.forEach(function (id) {
      var o = fbStats(id, ss), Lx = L[id];
      var dist = [1, 2, 3, 4, 5].map(function (n) { return n + '★ ' + o.ratings.filter(function (r) { return r === n; }).length; }).join(', ');
      md += '\n## Quest ' + id + ': ' + Lx.title + '\n\nFile: `src/lessons/' + id + '.js`\n\n- Students started: ' + o.started + ', finished: ' + o.finished + '\n' +
        '- Rating: ' + (o.ratings.length ? (Math.round(o.avg * 10) / 10) + ' / 5 from ' + o.ratings.length + ' student' + (o.ratings.length > 1 ? 's' : '') + ' (' + dist + ')' : 'no ratings yet') + '\n';
      md += '\n### Build steps students found confusing or needed help with\n\n';
      if (!o.hot.length) md += 'None flagged.\n';
      else {
        md += '| Step | Title | Confusing flags | Reasons | Help requests |\n|---|---|---|---|---|\n';
        o.hot.forEach(function (x) { md += '| ' + fbStepLabel(Lx, x.i) + ' | ' + x.title.replace(/\|/g, '/') + ' | ' + x.flags + ' | ' + (Object.keys(x.reasons).map(function (r) { return reasonText(r) + ' ' + x.reasons[r]; }).join(', ') || '') + ' | ' + x.help + ' |\n'; });
        var notes = []; o.hot.forEach(function (x) { x.notes.forEach(function (n) { notes.push('- Step ' + fbStepLabel(Lx, x.i) + ': "' + n.replace(/"/g, '\'') + '"'); }); });
        if (notes.length) md += '\n' + notes.join('\n') + '\n';
      }
      if (o.otherHelp) md += '\nOther help requests (quick check, turning in, challenge): ' + o.otherHelp + '\n';
      md += '\n### Quiz\n\n| Q | Question | Missed on first try | Confusing flags |\n|---|---|---|---|\n';
      o.quiz.forEach(function (q, i) { md += '| ' + (i + 1) + ' | ' + q.q.replace(/\|/g, '/').replace(/\n/g, ' ') + ' | ' + (q.answered ? Math.round(q.missed / q.answered * 100) + '% (' + q.missed + '/' + q.answered + ')' : 'no answers yet') + ' | ' + q.flags + ' |\n'; });
      md += '\n### "What was the hardest part?"\n\n' + (o.hardest.length ? o.hardest.map(function (x) { return '- ' + x; }).join('\n') : '(no answers)') + '\n';
      md += '\n### "What would make this quest better?"\n\n' + (o.change.length ? o.change.map(function (x) { return '- ' + x; }).join('\n') : '(no answers)') + '\n';
    });
    return md;
  }
  function fbIds() { var ss = fbScope(); return R.NODES.map(function (n) { return n.id; }).filter(function (id) { return fbStats(id, ss).any; }); }
  function tFeedback() {
    var ss = fbScope(), c = tc(), ids = fbIds();
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-message"/></svg> Lesson feedback</h1>' + classPicker() +
      '<label class="switch small"><input type="checkbox" data-act="fb-all"' + (S.fbAll ? ' checked' : '') + '> All my classes</label></div>' +
      '<div class="t-actions"><button class="btn primary" data-act="fb-copy"' + (ids.length ? '' : ' disabled') + '><svg class="i"><use href="#i-clipboard"/></svg> Copy report for Claude</button><button class="btn" data-act="fb-download"' + (ids.length ? '' : ' disabled') + '><svg class="i"><use href="#i-save"/></svg> Download .md</button></div></div>';
    h += '<div class="banner small"><svg class="i"><use href="#i-alert"/></svg> The report leaves out student names, but students type their own notes. Skim them for names before you paste the report into an AI tool.</div>';
    h += tBugs();
    if (!ids.length) return h + '<div class="card"><h2>No feedback yet</h2><p>Students can tap <b>🤔 Confusing?</b> under any step or quick check, ask for help with <b>✋ I’m stuck</b>, and rate each quest when they turn it in (+' + R.XP.rate + ' XP).</p></div>';
    ids.forEach(function (id) {
      var o = fbStats(id, ss), Lx = L[id];
      h += '<div class="card fb-card"><div class="row between"><h2>' + SQ_ICONS.branch(R.NODE[id].branch) + ' ' + esc(Lx.title) + ' <span class="muted small">' + id + '</span></h2><button class="btn small ghost" data-act="fb-copy" data-node="' + id + '"><svg class="i"><use href="#i-clipboard"/></svg> Copy this lesson</button></div>' +
        '<div class="fb-stats"><span><b>' + (o.ratings.length ? (Math.round(o.avg * 10) / 10) + '</b> / 5 ' + FACES[Math.max(0, Math.round(o.avg) - 1)] + ' <span class="muted">(' + o.ratings.length + ')</span>' : '—</b> no ratings') + '</span><span><b>' + o.started + '</b> started</span><span><b>' + o.finished + '</b> finished</span></div>';
      if (o.hot.length) h += '<h3>Most flagged steps</h3><ul class="fb-list">' + o.hot.slice(0, 4).map(function (x) {
        return '<li><b>Step ' + fbStepLabel(Lx, x.i) + ': ' + esc(x.title) + '</b> · ' + x.flags + ' flag' + (x.flags === 1 ? '' : 's') + ', ' + x.help + ' help request' + (x.help === 1 ? '' : 's') +
          (Object.keys(x.reasons).length ? '<div class="small muted">' + Object.keys(x.reasons).map(function (r) { return esc(reasonText(r)) + ' ×' + x.reasons[r]; }).join(' · ') + '</div>' : '') +
          (x.notes.length ? '<div class="small">' + x.notes.slice(0, 3).map(function (n) { return '“' + esc(n) + '”'; }).join(' ') + '</div>' : '') + '</li>';
      }).join('') + '</ul>';
      if (o.hardQ.length) h += '<h3>Quick checks missed by 30% or more on the first try</h3><ul class="fb-list">' + o.hardQ.map(function (q) { return '<li>Q' + (q.i + 1) + ': ' + esc(q.q) + ' · <b>' + Math.round(q.missed / q.answered * 100) + '%</b> (' + q.missed + '/' + q.answered + ')</li>'; }).join('') + '</ul>';
      var quotes = o.hardest.map(function (x) { return ['Hardest', x]; }).concat(o.change.map(function (x) { return ['Better if', x]; }));
      if (quotes.length) h += '<h3>Students said</h3><ul class="fb-quotes">' + quotes.slice(0, 6).map(function (q) { return '<li><span class="muted small">' + q[0] + ':</span> “' + esc(q[1]) + '”</li>'; }).join('') + '</ul>';
      h += '</div>';
    });
    return h;
  }

  // ------------------------------------------------------------ display settings, translation, bug reports
  function disp() { return (S.me && S.me.state.display) || {}; }
  function applyDisplay() {
    var d = route()[0] === 't' ? {} : disp(), h = document.documentElement;
    h.classList.toggle('fs-l', d.size === 'l'); h.classList.toggle('fs-xl', d.size === 'xl');
    h.classList.toggle('font-easy', d.font === 'easy'); h.classList.toggle('hc', !!d.contrast); h.classList.toggle('rm', !!d.motion);
    SQ_I18N.set(d.lang === 'pt' ? 'pt' : 'en', function (lang, items) { return API.call('translate', { lang: lang, items: items }).then(function (r) { return r.out; }); });
  }
  function displayFields(d) {
    d = d || {};
    return '<label>Text size <select name="size">' + [['m', 'Normal'], ['l', 'Large'], ['xl', 'Extra large']].map(function (x) { return '<option value="' + x[0] + '"' + ((d.size || 'm') === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>Language <select name="lang" class="notr"><option value="en"' + (d.lang !== 'pt' ? ' selected' : '') + '>English</option><option value="pt"' + (d.lang === 'pt' ? ' selected' : '') + '>Português (Brasil)</option></select></label>' +
      '<label class="switch"><input type="checkbox" name="font"' + (d.font === 'easy' ? ' checked' : '') + '> Easy-to-read letters</label>' +
      '<label class="switch"><input type="checkbox" name="contrast"' + (d.contrast ? ' checked' : '') + '> Stronger contrast (darker text and outlines)</label>' +
      '<label class="switch"><input type="checkbox" name="motion"' + (d.motion ? ' checked' : '') + '> Less movement (calmer animations)</label>';
  }
  function displayFrom(v) { return { size: v.size, lang: v.lang, font: v.font ? 'easy' : 'default', contrast: !!v.contrast, motion: !!v.motion }; }
  // remember the last few errors so a bug report can include them
  var ERRS = [], AUTO = {};
  function noteError(msg) {
    msg = String(msg || 'Error').slice(0, 300);
    ERRS.push(msg); if (ERRS.length > 5) ERRS.shift();
    if (S.boot && (S.me || isTeacher()) && !AUTO[msg] && Object.keys(AUTO).length < 3) {
      AUTO[msg] = 1;
      API.call('reportBug', { auto: true, text: msg, where: location.hash, info: bugInfo() }).catch(function () { });
    }
  }
  window.addEventListener('error', function (e) { noteError((e.message || 'Error') + (e.filename ? ' @' + String(e.filename).split('/').pop() + ':' + e.lineno : '')); });
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; if (r && r.name && r.name !== 'Error') noteError(r.name + ': ' + r.message); });
  function bugInfo() {
    var r = route(), o = { page: location.hash || '#/map', screen: innerWidth + 'x' + innerHeight, device: navigator.userAgent, build: typeof SQ_BUILD === 'undefined' ? '' : SQ_BUILD,
      online: String(navigator.onLine), display: JSON.stringify(disp()), errors: ERRS.join(' | ') };
    if (r[0] === 'quest' && S.card) o.card = 'card ' + ((S.card[r[1]] || 0) + 1);
    return o;
  }
  function bugWhere() {
    var r = route();
    if (r[0] === 'quest' && L[r[1]]) return 'Quest: ' + L[r[1]].title + ', card ' + (((S.card || {})[r[1]] || 0) + 1);
    return 'Page: ' + (location.hash || '#/map');
  }
  function loadBugs() {
    if (S.bugs) return;
    S.bugs = [];
    call('bugList', {}).then(function (res) { S.bugs = res.bugs; S.bugsLoaded = true; if (route()[1] === 'feedback') render(); }).catch(function () { S.bugs = null; });
  }
  function bugsMarkdown() {
    var md = '# Scratch Quest bug reports\n\nReported from student and teacher devices. Names are removed. The app source is in `src/` (see `src/app.js` for the page code and `src/service.js` for the server rules).\n';
    (S.bugs || []).filter(function (b) { return b.status !== 'fixed'; }).forEach(function (b, i) {
      md += '\n## ' + (i + 1) + '. ' + b.text.replace(/\n/g, ' ') + '\n\n- When: ' + new Date(b.at).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' + (b.auto ? ' (caught automatically)' : ' (typed by a ' + (b.cls === 'teacher' ? 'teacher' : 'student') + ')') + '\n- Where: ' + (b.where || '?') + '\n';
      Object.keys(b.info || {}).forEach(function (k) { if (b.info[k]) md += '- ' + k + ': ' + b.info[k] + '\n'; });
    });
    return md;
  }
  function tBugs() {
    loadBugs();
    var list = S.bugs || [], open = list.filter(function (b) { return b.status !== 'fixed'; });
    var h = '<div class="card bug-card"><div class="row between"><h2><svg class="i"><use href="#i-bug"/></svg> Bug reports ' + (open.length ? '<span class="pill">' + open.length + '</span>' : '') + '</h2>' +
      '<button class="btn small" data-act="bug-copy"' + (open.length ? '' : ' disabled') + '><svg class="i"><use href="#i-clipboard"/></svg> Copy for Claude</button></div>';
    if (!S.bugsLoaded) return h + '<p class="muted small">Loading…</p></div>';
    if (!list.length) return h + '<p class="muted small">No bug reports. Students and teachers can send one with the bug button at the top of any page. Errors on a student’s Chromebook are also reported automatically.</p></div>';
    h += '<ul class="bug-list">' + list.slice(0, 60).map(function (b) {
      return '<li class="' + (b.status === 'fixed' ? 'fixed' : '') + '"><div class="grow"><b>' + esc(b.text) + '</b><div class="small muted">' + ago(b.at) + ' · ' + esc(b.name || '') + (b.cls ? ' · ' + esc(b.cls) : '') + ' · ' + esc(b.where || '') + (b.auto ? ' · <span class="chip">caught automatically</span>' : '') + '</div>' +
        '<details class="small"><summary>Device details</summary><ul>' + Object.keys(b.info || {}).map(function (k) { return b.info[k] ? '<li><b>' + esc(k) + ':</b> ' + esc(b.info[k]) + '</li>' : ''; }).join('') + '</ul></details></div>' +
        '<div class="row"><button class="btn small' + (b.status === 'fixed' ? ' ghost' : ' primary') + '" data-act="bug-status" data-id="' + b.id + '" data-status="' + (b.status === 'fixed' ? 'new' : 'fixed') + '">' + (b.status === 'fixed' ? 'Reopen' : '<svg class="i"><use href="#i-check"/></svg> Fixed') + '</button>' +
        '<button class="btn small ghost" data-act="bug-del" data-id="' + b.id + '" aria-label="Delete this report"><svg class="i"><use href="#i-trash"/></svg></button></div></li>';
    }).join('') + '</ul></div>';
    return h;
  }

  // ------------------------------------------------------------ arcade
  var AR = SQ_ARCADE;
  var PU_ICON = {
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    slow: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    double: '<path d="M4 8l5 8M9 8l-5 8M14 16h6l-6-8h6" />',
    ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v2h18v-2a2 2 0 0 0 0-4 2 2 0 0 0 0-4V6H3zM9 6v12"/>'
  };
  function puIcon(id) {
    var c = id === 'ticket' ? '#7b2ff7' : AR.POWER[id].color;
    return '<span class="pu-ico" style="--pc:' + c + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + PU_ICON[id] + '</svg></span>';
  }
  function arcLeft(ms) { var m = Math.floor(Math.max(0, ms) / 60000); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : fmtLeft(ms); }
  function arcNow() { return Date.now() + (S.arcSkew || 0); }
  function arcStop() {
    if (S.arcTimer) { clearInterval(S.arcTimer); S.arcTimer = null; }
    if (S.arcGame) { S.arcGame.stop(); S.arcGame = null; }
    S.arcRun = null;
  }
  function viewArcade() { return '<div id="arc-box" class="arcade">' + (S.arc ? arcHTML() : '<div class="card center muted">Loading the arcade…</div>') + '</div>'; }
  function loadArcade() {
    return call('arcade', {}).then(function (res) {
      S.arc = res; S.arcSkew = res.now - Date.now();
      if (!S.arcRun) arcPaint();
    }).catch(function () { });
  }
  function arcPaint() { var b = document.getElementById('arc-box'); if (b) b.innerHTML = arcHTML(); }
  function arcLive() {
    var a = S.arc; if (!a) return 'off';
    var m = a.info.mode;
    if (m !== 'off' && a.info.closes && arcNow() > a.info.closes) m = 'off';
    return m;
  }
  function arcCanPlay() { var m = arcLive(); return m === 'free' || (m === 'earned' && S.arc.me.until > arcNow()); }
  function arcStatusChip() {
    var a = S.arc, m = arcLive();
    if (m === 'off') return '<span class="arc-chip off"><svg class="i"><use href="#i-lock"/></svg> Locked</span>';
    if (m === 'free') return '<span class="arc-chip free"><svg class="i"><use href="#i-unlock"/></svg> Free play · closes in <b id="arc-clock">' + arcLeft(a.info.closes - arcNow()) + '</b></span>';
    if (a.me.until > arcNow()) return '<span class="arc-chip pass"><svg class="i"><use href="#i-clock"/></svg> Your pass: <b id="arc-clock">' + arcLeft(a.me.until - arcNow()) + '</b> left</span>';
    return '<span class="arc-chip open"><svg class="i"><use href="#i-unlock"/></svg> Open · use a ticket to play</span>';
  }
  function arcHTML() {
    var a = S.arc, me = a.me, m = arcLive(), p = prof(), shop = shopOn();
    var G = arcG(), board = G === 'kart' ? (a.kartBoard || []) : a.board, myBest = G === 'kart' ? me.kart.best : me.best, myAll = G === 'kart' ? me.kart.allBest : me.allBest;
    var h = '<div class="arc-tabs" role="tablist">' + [['rush', 'Block Rush', 'blocks'], ['kart', 'Kart Dash', 'flag']].map(function (x) {
      return '<button role="tab" class="' + (G === x[0] ? 'on' : '') + '" data-act="arc-game" data-game="' + x[0] + '"><svg class="i"><use href="#i-' + x[2] + '"/></svg> ' + x[1] + '</button>'; }).join('') + '</div>' +
      '<section class="arc-hero' + (G === 'kart' ? ' kart' : '') + '"><div><div class="eyebrow">Scratch Quest Arcade</div><h1>' + AR.GAMES[G] + '</h1><p>' + (G === 'kart' ? 'Race your kart for 60 seconds. Pass rivals, grab coins, hit the boost pads, and stay on the road.' : 'Catch falling code blocks, dodge the bugs, and climb the class leaderboard.') + '</p></div>' +
      '<div class="arc-hero-side">' + arcStatusChip() + '<div class="arc-wallet"><span>' + puIcon('ticket') + '<b>' + me.tickets + '</b> ticket' + (me.tickets === 1 ? '' : 's') + '</span>' + (shop ? '<span>' + coinTag(Math.max(0, p.coins), 'big') + '</span>' : '') + '</div></div></section>';
    h += '<div class="arc-grid"><section class="card arc-play" id="arc-play">' + arcPlayPanel() + '</section>';
    // leaderboard
    h += '<section class="card arc-board"><h2><svg class="i"><use href="#i-award"/></svg> Top scores</h2>';
    if (!board.length) h += '<p class="muted">No scores yet this round. Be the first!</p>';
    else h += '<ol class="lb">' + board.map(function (b, i) {
      return '<li class="' + (b.key === a.you ? 'me ' : '') + (i < 3 ? 'top' + (i + 1) : '') + '"><span class="lb-n">' + (i + 1) + '</span>' + avatarImgTag(b.avatar, 'lb-av') +
        '<span class="lb-name notr">' + esc(b.name) + (b.title ? '<small>' + esc(b.title) + '</small>' : '') + '</span><b class="lb-score">' + fmtN(b.score) + '</b></li>';
    }).join('') + '</ol>';
    h += '<div class="arc-mine"><div><span>Your best this round</span><b>' + fmtN(myBest) + '</b></div><div><span>All-time best</span><b>' + fmtN(myAll) + '</b></div></div>';
    if (G === 'kart') h += '<p class="muted small">Every 100 points earns 1 coin (up to ' + AR.RUN_COINS + ' a game and ' + AR.DAY_COINS + ' a day). When a round ends, the top 3 in each game win ' + AR.ROUND_PRIZES.join(', ') + ' coins.</p></section></div>' + (shop ? garageHTML() : '');
    else h += '<h3>Score goals</h3><ul class="arc-goals">' + AR.GOALS.map(function (g) {
      var got = (me.goals || []).indexOf(g[0]) >= 0;
      return '<li class="' + (got ? 'got' : '') + '"><span>' + (got ? '<svg class="i"><use href="#i-check"/></svg> ' : '') + 'Score ' + fmtN(g[0]) + '</span>' + coinTag(g[1]) + '</li>';
    }).join('') + '</ul><p class="muted small">Every 100 points also earns 1 coin (up to ' + AR.RUN_COINS + ' a game and ' + AR.DAY_COINS + ' a day). When a round ends, the top 3 win ' + AR.ROUND_PRIZES.join(', ') + ' coins.</p>';
    // trophies (titles earned by score)
    if (G === 'rush') h += '<h3>Arcade titles</h3><ul class="arc-troph">' + A.CATALOG.title.filter(function (t) { return t.unlock && t.unlock.arcade; }).map(function (t) {
      var got = me.allBest >= t.unlock.arcade;
      return '<li class="r-' + t.rarity + (got ? ' got' : '') + '"><span class="title-prev sm">' + esc(t.name) + '</span><span class="small">' + (got ? '<svg class="i"><use href="#i-check"/></svg> Unlocked: wear it in the <a href="#/avatar">studio</a>' : 'Score ' + fmtN(t.unlock.arcade)) + '</span></li>';
    }).join('') + '</ul></section></div>';
    // shop
    if (shop) {
      h += '<section class="card arc-shop"><div class="row between"><h2><svg class="i"><use href="#i-zap"/></svg> Power-up shop</h2><span class="muted small">Each power-up works for one run. Bring up to ' + AR.MAX_POWER + '.</span></div><div class="pu-grid">';
      h += '<div class="pu-card ticket">' + puIcon('ticket') + '<b>Arcade ticket</b><p>' + a.info.passMin + ' minutes of play. ' + arcTicketRule() + '</p>' +
        '<div class="pu-foot"><span class="small">You have ' + me.tickets + '</span>' + (a.info.ticketPrice ? '' : '<span class="small muted">Earn only</span>') + '<button' + (a.info.ticketPrice ? '' : ' hidden') + ' class="btn small' + (p.coins >= a.info.ticketPrice ? ' primary' : ' locked" aria-disabled="true" data-why="You need ' + (a.info.ticketPrice - p.coins) + ' more coins. Earn coins by finishing steps and quests.') + '" data-act="arc-buy" data-item="ticket">' + coinTag(a.info.ticketPrice) + '</button></div></div>';
      AR.POWERUPS.forEach(function (u) {
        if (G === 'kart' && AR.KART_POWER.indexOf(u.id) < 0) return;
        var n = me.inv[u.id] || 0, ok = p.coins >= u.price, kd = G === 'kart' ? ({ shield: 'Blocks your first bump or oil slip.', magnet: 'Pulls coins toward your kart for 20 seconds.', double: 'Pass and coin points count twice for 30 seconds.' })[u.id] : null;
        if (kd) u = { id: u.id, name: u.name, price: u.price, desc: kd };
        h += '<div class="pu-card">' + puIcon(u.id) + '<b>' + esc(u.name) + '</b><p>' + esc(u.desc) + '</p><div class="pu-foot"><span class="small">' + (n ? 'You have <b>' + n + '</b>' : 'None yet') + '</span>' +
          '<button class="btn small' + (ok ? ' primary' : ' locked" aria-disabled="true" data-why="You need ' + (u.price - p.coins) + ' more coins for ' + esc(u.name) + '.') + '" data-act="arc-buy" data-item="' + u.id + '">' + coinTag(u.price) + '</button></div></div>';
      });
      h += '</div><p class="muted small">Coins come from XP (1 coin for every 5 XP). Spending coins never lowers your XP or level.</p></section>';
    }
    return h;
  }
  function arcG() { return S.arcGameSel === 'kart' ? 'kart' : 'rush'; }
  function statBar(label, v) { return '<span class="kstat"><small>' + label + '</small><i><b style="width:' + Math.max(8, Math.min(100, Math.round((v - 0.8) / 0.75 * 100))) + '%"></b></i></span>'; }
  // The garage: karts to buy with coins, and three parts on each kart to upgrade
  function garageHTML() {
    var me = S.arc.me, p = prof(), K = me.kart;
    var h = '<section class="card arc-garage"><div class="row between"><h2><svg class="i"><use href="#i-flag"/></svg> Garage</h2><span class="muted small">Your driver is your own character. Upgrades stay with the kart.</span></div><div class="kart-grid">';
    AR.KARTS.forEach(function (k) {
      var own = K.owned[k.id], on = K.active === k.id, st = AR.kartStats(k.id, own || {}), ok = p.coins >= k.price;
      h += '<div class="kart-card r-' + k.rarity + (on ? ' on' : '') + (own ? '' : ' locked-k') + '">' + (k.rarity !== 'common' ? '<span class="rar-chip r-' + k.rarity + '">' + A.RARITY[k.rarity].name + '</span>' : '') +
        '<div class="kart-top">' + SQ_KART.icon(k.color, k.accent, 58) + '<div><b>' + esc(k.name) + '</b><p>' + esc(k.desc) + '</p></div></div>' +
        '<div class="kstats">' + statBar('Speed', st.speed) + statBar('Steering', st.handling) + statBar('Boost', st.boost) + '</div>';
      if (!own) h += '<button class="btn' + (ok ? ' primary' : ' locked" aria-disabled="true" data-why="You need ' + (k.price - p.coins) + ' more coins for the ' + esc(k.name) + '.') + '" data-act="kart-buy" data-kart="' + k.id + '">Buy ' + coinTag(k.price) + '</button>';
      else {
        h += '<div class="kparts">' + AR.PARTS.map(function (pt) {
          var lv = own[pt.id] || 0, max = lv >= AR.PART_PRICES.length, price = AR.PART_PRICES[lv], can = !max && p.coins >= price;
          return '<div class="kpart"><span><b>' + pt.name + '</b> <span class="pips">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < lv ? 'on' : '') + '"></i>'; }).join('') + '</span></span>' +
            (max ? '<span class="chip gold">MAX</span>' : '<button class="btn tiny' + (can ? ' primary' : ' locked" aria-disabled="true" data-why="You need ' + (price - p.coins) + ' more coins to upgrade the ' + pt.name.toLowerCase() + '.') + '" data-act="kart-up" data-kart="' + k.id + '" data-part="' + pt.id + '" title="' + esc(pt.desc) + '">+ ' + coinTag(price) + '</button>') + '</div>';
        }).join('') + '</div>' + (on ? '<span class="st-on"><svg class="i"><use href="#i-check"/></svg> Driving this kart</span>' : '<button class="btn small" data-act="kart-pick" data-kart="' + k.id + '">Drive this kart</button>');
      }
      h += '</div>';
    });
    return h + '</div></section>';
  }
  function arcTicketRule() {
    var a = S.arc, n = a.info.questsPerTicket || 1;
    return n === 1 ? 'You earn a ticket for every quest you finish.' : 'You earn a ticket for every ' + n + ' quests you finish (' + a.me.toNext + ' more to go).';
  }
  function arcPlayPanel() {
    var a = S.arc, me = a.me, m = arcLive();
    if (m === 'off') return '<div class="arc-lock"><svg class="i big-ico"><use href="#i-lock"/></svg><h2>The arcade is locked</h2><p>Your teacher opens it during class. Until then, finish quests to earn tickets' + (shopOn() ? ' and save coins for power-ups' : '') + '.</p><a class="btn primary" href="#/map">Back to my quests</a></div>';
    if (!arcCanPlay()) {
      return '<div class="arc-lock open"><svg class="i big-ico"><use href="#i-gamepad"/></svg><h2>The arcade is open!</h2><p>Use a ticket to play for <b>' + a.info.passMin + ' minutes</b>.</p>' +
        (me.tickets ? '<button class="btn primary big" data-act="arc-pass">Use a ticket · play ' + a.info.passMin + ' min</button>' : '<p class="muted">You have no tickets yet. ' + arcTicketRule() + (shopOn() && a.info.ticketPrice ? ' You can also buy one below.' : '') + '</p>') + '</div>';
    }
    var G = arcG(), sel = (S.arcSel || []).filter(function (id) { return G !== 'kart' || AR.KART_POWER.indexOf(id) >= 0; }), inv = me.inv, owned = AR.POWERUPS.filter(function (u) { return inv[u.id] && (G !== 'kart' || AR.KART_POWER.indexOf(u.id) >= 0); });
    S.arcSel = sel;
    var kk = AR.KART[me.kart.active] || AR.KARTS[0];
    var h = '<div class="arc-ready"><h2>Ready to play?</h2>';
    if (owned.length) {
      h += '<p class="small">Pick up to ' + AR.MAX_POWER + ' power-ups for this run:</p><div class="pu-pick">' + owned.map(function (u) {
        var on = sel.indexOf(u.id) >= 0;
        return '<button class="pu-tog' + (on ? ' on' : '') + '" data-act="arc-sel" data-id="' + u.id + '" title="' + esc(u.desc) + '">' + puIcon(u.id) + '<span>' + esc(u.name) + '</span><small>x' + inv[u.id] + '</small></button>';
      }).join('') + '</div>';
    } else if (shopOn()) h += '<p class="small muted">Tip: power-ups from the shop below give you a head start.</p>';
    h += '<button class="btn primary huge" data-act="arc-go"><svg class="i"><use href="#i-gamepad"/></svg> ' + (G === 'kart' ? 'Start the race' : 'Play Block Rush') + '</button>' +
      (G === 'kart' ? '<div class="kart-now">' + SQ_KART.icon(kk.color, kk.accent, 44) + '<span>Driving: <b>' + esc(kk.name) + '</b></span></div><p class="small muted">Steer with the mouse, your finger, or the arrow keys. Grass slows you down, oil makes you slip, and blue pads give a boost.</p></div>'
        : '<p class="small muted">Move with the mouse, your finger, or the arrow keys. Blocks in a row build a combo. Gold stars are worth 50!</p></div>');
    return h;
  }
  function arcTick() {
    if (!S.arc || route()[0] !== 'arcade') return;
    var el = document.getElementById('arc-clock'), m = arcLive();
    if (el) el.textContent = arcLeft((m === 'free' ? S.arc.info.closes : S.arc.me.until) - arcNow());
    if (S.arcRun) return; // never interrupt a run in progress
    var playable = arcCanPlay();
    if (S.arcWasPlayable && !playable) { S.arcWasPlayable = false; arcPaint(); }
    S.arcWasPlayable = playable;
    S.arcPoll = (S.arcPoll || 0) + 1;
    if (S.arcPoll % 45 === 0 && !document.hidden) loadArcade(); // notice when the teacher opens or locks the arcade
  }
  function arcStartGame() {
    var box = document.getElementById('arc-play');
    if (!box || S.arcRun) return;
    S.arcRun = 'starting';
    var G = arcG();
    call('arcadeStart', { power: S.arcSel || [], game: G }).then(function (res) {
      S.arcRun = res.run; S.arc.me = res.me; S.arcSel = [];
      box.innerHTML = '<div class="arc-stage"><canvas id="arc-canvas" aria-label="' + AR.GAMES[G] + ' game"></canvas>' +
        (res.run.power.length ? '<div class="arc-powers">' + res.run.power.map(function (id) { return puIcon(id) + '<span>' + esc(AR.POWER[id].name) + '</span>'; }).join('') + '</div>' : '') + '</div>';
      var img = new Image(), gav = Object.assign({}, S.me.state.avatar, { bg: 'solid', bgColor: 'transparent', frame: 'none' }); img.src = avatarURI(gav);
      var cv = document.getElementById('arc-canvas');
      cv.scrollIntoView({ block: 'center', behavior: 'smooth' });
      var done = function (score) { arcFinish(res.run.id, score); };
      S.arcGame = G === 'kart' ? SQ_KART.create(cv, { avatar: img, kart: AR.kartStats(S.arc.me.kart.active, S.arc.me.kart.owned[S.arc.me.kart.active]), power: res.run.power, onEnd: done })
        : SQ_GAME.create(cv, { avatar: img, power: res.run.power, onEnd: done });
    }).catch(function () { S.arcRun = null; arcPaint(); });
  }
  function arcFinish(runId, score) {
    var before = prof();
    call('arcadeEnd', { runId: runId, score: score }).then(function (res) {
      if (S.arcGame) { S.arcGame.stop(); S.arcGame = null; }
      S.arcRun = null; S.arc.me = res.me; if (res.game === 'kart') S.arc.kartBoard = res.board; else S.arc.board = res.board; S.me = res.student;
      arcPaint();
      var unlocked = res.game === 'kart' ? [] : A.CATALOG.title.filter(function (t) { return t.unlock && t.unlock.arcade && res.score >= t.unlock.arcade && (before.arcadeBest || 0) < t.unlock.arcade; });
      if (res.newBest || unlocked.length || (res.goals || []).length) { SQ_SOUND.play('badge'); confetti(); } else if (res.coins) SQ_SOUND.play('coin');
      celebrate(before, S.me.profile, null, true);
      modal('<div class="arc-result"><div class="eyebrow">' + AR.GAMES[res.game || 'rush'] + '</div><div class="arc-big">' + fmtN(res.score) + '</div><p>points</p>' +
        (res.newBest ? '<p class="arc-nb"><svg class="i"><use href="#i-star"/></svg> New personal best!</p>' : '<p class="muted">Your best this round: ' + fmtN(res.game === 'kart' ? res.me.kart.best : res.me.best) + '</p>') +
        (res.place ? '<p>You are <b>#' + res.place + '</b> on the class leaderboard.</p>' : '') +
        (res.coins ? '<p class="arc-coins">' + coinTag(res.coins, 'big') + ' coins earned</p>' : '') +
        (res.goals || []).map(function (g) { return '<p class="arc-nb">Score goal reached: ' + fmtN(g.score) + ' (+' + g.coins + ' coins)</p>'; }).join('') +
        unlocked.map(function (t) { return '<p class="arc-nb">New title unlocked: <b>' + esc(t.name) + '</b></p>'; }).join('') +
        '<div class="row center">' + (arcCanPlay() ? '<button class="btn primary" data-act="arc-again">Play again</button>' : '') + '<button class="btn" data-act="close-modal">Done</button></div></div>', 'arc-modal');
    }).catch(function () { S.arcRun = null; if (S.arcGame) { S.arcGame.stop(); S.arcGame = null; } arcPaint(); });
  }
  // ---- teacher controls (Dashboard)
  function tArcadeCard(c) {
    var a = c.arcade || { mode: 'off', passMin: 5, ticketPrice: 40 }, board = (S.tArcBoard || {})[c.id];
    var modes = [['off', 'lock', 'Locked', 'Nobody can play.'], ['earned', 'clock', 'Earned passes', 'Students spend a ticket for a ' + a.passMin + '-minute pass.'], ['free', 'unlock', 'Free play', 'Everyone can play, no ticket needed.']];
    var h = '<div class="card t-arcade"><div class="row between"><h2><svg class="i"><use href="#i-gamepad"/></svg> Arcade: Block Rush</h2>' +
      (a.mode !== 'off' ? '<span class="arc-chip ' + (a.mode === 'free' ? 'free' : 'pass') + '">Open until ' + new Date(a.closes).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '</span>' : '<span class="arc-chip off">Locked</span>') + '</div>' +
      '<div class="arc-modes">' + modes.map(function (m) {
        return '<button class="arc-mode' + (a.mode === m[0] ? ' on' : '') + '" data-act="arc-mode" data-mode="' + m[0] + '" data-id="' + c.id + '"><svg class="i"><use href="#i-' + m[1] + '"/></svg><b>' + m[2] + '</b><small>' + m[3] + '</small></button>';
      }).join('') + '</div>' +
      '<form class="row arc-set" data-form="arc-set" data-id="' + c.id + '"><label>Open for <select name="minutes" id="arc-min-' + c.id + '">' + [15, 30, 45, 60, 90].map(function (n) { return '<option value="' + n + '"' + (n === (S.arcMin || 45) ? ' selected' : '') + '>' + n + ' min</option>'; }).join('') + '</select></label>' +
      '<label>Pass length <select name="passMin">' + [3, 5, 10, 15].map(function (n) { return '<option value="' + n + '"' + (n === a.passMin ? ' selected' : '') + '>' + n + ' min</option>'; }).join('') + '</select></label>' +
      '<label>Quests per ticket <select name="questsPerTicket">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (n === (a.questsPerTicket || 2) ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
      '<label>Ticket price (0 = can’t buy) <input type="number" name="ticketPrice" min="0" max="1000" step="10" value="' + a.ticketPrice + '" class="tiny-input"></label><button class="btn small">Save</button></form>' +
      '<p class="muted small">It locks itself when the time runs out, so it never stays open after class. Locking ends everyone’s passes right away (a game in progress can finish). Students earn a ticket for every ' + (a.questsPerTicket || 2) + ' finished quest' + ((a.questsPerTicket || 2) === 1 ? '' : 's') + '. Games earn coins (1 per 100 points, up to ' + AR.RUN_COINS + ' a game and ' + AR.DAY_COINS + ' a day), score goals pay one-time prizes, and starting a new round gives the top 3 ' + AR.ROUND_PRIZES.join(', ') + ' coins.</p>';
    h += '<div class="row between"><h3>Top scores this round</h3><button class="btn small ghost" data-act="arc-reset" data-id="' + c.id + '"><svg class="i"><use href="#i-refresh"/></svg> Start a new round</button></div>';
    if (!board) h += '<p class="muted small" id="arc-tboard">Loading…</p>';
    else if (!board.length) h += '<p class="muted small">No scores yet.</p>';
    else h += '<ol class="lb compact">' + board.slice(0, 5).map(function (b, i) { return '<li><span class="lb-n">' + (i + 1) + '</span>' + avatarImgTag(b.avatar, 'lb-av') + '<span class="lb-name">' + esc(b.name) + '</span><b class="lb-score">' + fmtN(b.score) + '</b></li>'; }).join('') + '</ol>';
    return h + '</div>';
  }
  function tArcadeLoad(c) {
    if ((S.tArcBoard || {})[c.id]) return;
    call('arcadeBoardFor', { classId: c.id }).then(function (res) { S.tArcBoard = S.tArcBoard || {}; S.tArcBoard[c.id] = res.board; if (route()[1] === 'dash') render(); }).catch(function () { });
  }

  // ------------------------------------------------------------ badges
  function viewBadges() {
    var p = prof();
    var pct = Math.round((p.xp - p.levelStart) / (p.levelNext - p.levelStart) * 100);
    var h = '<div class="badges-page"><div class="card level-card"><div class="lv-circle"><span>LEVEL</span><b>' + p.level + '</b></div><div class="grow"><h1>' + esc(p.rank) + '</h1>' +
      '<div class="xpbar big"><i style="width:' + pct + '%"></i></div><p>' + fmtN(p.xp) + ' XP · <b>' + fmtN(p.levelNext - p.xp) + ' XP</b> to level ' + (p.level + 1) + '</p>' +
      '<p class="muted small">Earn XP: each step +' + R.XP.step + ' · quick check +' + R.XP.quiz + ' (+' + R.XP.quizFirstTry + ' first try) · bonus challenge +' + R.XP.challenge + ' · finished quest +' + R.XP.lesson + ' · teacher badge +' + R.XP.award + '</p></div></div>';
    h += '<h2><svg class="i"><use href="#i-award"/></svg> Badges <span class="muted">' + p.badges.length + ' / ' + (R.BADGES.length + R.TEACHER_BADGES.length) + '</span></h2><div class="badge-grid">';
    R.BADGES.concat(R.TEACHER_BADGES).forEach(function (b) {
      var got = p.badges.indexOf(b.id) >= 0;
      var aw = (S.me.state.awards || []).filter(function (a) { return a.id === b.id; })[0];
      var teacherOnly = R.TEACHER_BADGES.indexOf(b) >= 0;
      h += '<div class="badge' + (got ? ' got' : '') + '"><div class="b-ico">' + (got ? b.icon : '<svg class="i"><use href="#i-lock"/></svg>') + '</div><b>' + esc(b.name) + '</b><span>' + esc(b.desc) + '</span>' +
        (teacherOnly ? '<em>' + (aw && aw.note ? '“' + esc(aw.note) + '”' : 'Given by your teacher') + '</em>' : '') + '</div>';
    });
    h += '</div>';
    var upcoming = A.allUnlockables().filter(function (u) { return !A.isUnlocked(u.unlock, p); }).sort(function (a, b) { return (a.unlock.level || 99) - (b.unlock.level || 99); });
    if (upcoming.length) {
      h += '<h2><svg class="i"><use href="#i-lock"/></svg> Coming soon for your avatar</h2><div class="unlock-list">' + upcoming.map(function (u) { return '<div class="unl"><b>' + esc(u.name) + '</b><span>' + esc(A.unlockText(u.unlock)) + '</span></div>'; }).join('') + '</div>';
    }
    return h + '</div>';
  }

  // ------------------------------------------------------------ class
  function viewClass() {
    return '<div class="class-page"><h1><svg class="i"><use href="#i-users"/></svg> ' + esc(S.cls.name) + '</h1><div id="goal-box"></div><div id="class-box">' + (S.view ? classBody(S.view) : '<div class="loading"><div class="spinner"></div></div>') + '</div></div>';
  }
  function goalBar(v) {
    var goal = v.cls.classGoal;
    if (!goal) return '';
    var pct = Math.min(100, Math.round(v.classXP / goal * 100));
    return '<div class="card goalbar"><div class="eyebrow"><svg class="i"><use href="#i-target"/></svg> Class Quest Goal</div><div class="xpbar big team"><i style="width:' + pct + '%"></i></div><p><b>' + fmtN(v.classXP) + '</b> / ' + fmtN(goal) + ' XP together' + (pct >= 100 ? ' — <svg class="i"><use href="#i-sparkles"/></svg> GOAL REACHED!' : '') + '</p><p class="muted small">Every XP anyone earns helps the whole class.</p></div>';
  }
  function classBody(v) {
    var ms = v.members.filter(function (m) { return !m.teacher; });
    var lb = v.cls.showLeaderboard;
    ms.sort(lb ? function (a, b) { return b.xp - a.xp; } : function (a, b) { return a.name.localeCompare(b.name); });
    var h = '<p class="muted">' + ms.length + ' adventurers' + (lb ? ' · sorted by XP' : '') + '</p><div class="hall">';
    ms.forEach(function (m, i) {
      h += '<div class="hall-card' + (S.me && m.name === S.me.name ? ' me' : '') + '">' + (lb && i < 3 ? '<span class="medal">' + ['🥇', '🥈', '🥉'][i] + '</span>' : '') + A.svg(m.avatar, 88) +
        '<b>' + esc(m.name) + '</b>' + (A.titleText(m.avatar) ? '<span class="np-title sm">' + esc(A.titleText(m.avatar)) + '</span>' : '') + '<span>Lv ' + m.level + ' · ' + esc(m.rank) + '</span><span class="muted small"><svg class="i"><use href="#i-pin"/></svg> ' + esc(title(m.current)) + '</span><span class="muted small"><svg class="i"><use href="#i-award"/></svg> ' + m.badges + ' · <svg class="i"><use href="#i-check"/></svg> ' + m.done.length + ' quests</span></div>';
    });
    return h + '</div>';
  }

  // ============================================================ TEACHER
  function pendingList() {
    var out = [];
    if (!S.teacher) return out;
    S.teacher.students.forEach(function (s) {
      if (S.tClass && s.classId !== S.tClass) return;
      Object.keys(s.state.nodes).forEach(function (id) { if (s.state.nodes[id].status === 'submitted') out.push({ s: s, id: id, ns: s.state.nodes[id] }); });
    });
    return out.sort(function (a, b) { return (a.ns.submittedAt || 0) - (b.ns.submittedAt || 0); });
  }
  function loadTeacher() {
    return call('teacherData').then(function (d) {
      S.teacher = d;
      S.boot.settings = d.settings;
      if (!S.tClass || !d.classes.some(function (c) { return c.id === S.tClass; })) {
        var act = d.classes.filter(function (c) { return !c.archived; })[0];
        S.tClass = act ? act.id : null;
      }
    });
  }
  function tc() { return S.teacher && S.teacher.classes.filter(function (c) { return c.id === S.tClass; })[0]; }
  function classPicker() {
    if (!S.teacher.classes.length) return '';
    return '<label class="class-pick">Class: <select data-act="t-class">' + S.teacher.classes.filter(function (c) { return !c.archived || c.id === S.tClass; }).map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === S.tClass ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('') + '</select></label>';
  }
  function renderTeacher(r) {
    if (!S.teacher) {
      $app.innerHTML = header() + '<main><div class="loading"><div class="spinner"></div>Loading classes…</div></main>';
      loadTeacher().then(function () { render(); });
      return;
    }
    var page = r[1] || 'dash', body;
    if (!S.teacher.classes.length && ['lessons', 'lesson', 'classroom', 'standards', 'feedback'].indexOf(page) < 0) body = tWelcome();
    else if (page === 'review') body = tReview();
    else if (page === 'map') body = tMap();
    else if (page === 'lessons') body = tLessons();
    else if (page === 'lesson' && L[r[2]]) body = viewQuest(r[2], true);
    else if (page === 'classes') body = tClasses();
    else if (page === 'standards') body = tStandards();
    else if (page === 'feedback') body = tFeedback();
    else if (page === 'classroom') body = tClassroom();
    else if (page === 'student') body = tStudent(decodeURIComponent(r[2] || ''));
    else if (page === 'projector') body = tProjector();
    else if (page === 'screen') body = tScreen();
    else body = tDash();
    if (page === 'screen') { $app.innerHTML = body; document.body.classList.add('cs-on'); csStart(); return; }
    $app.innerHTML = (page === 'projector' ? '' : header()) + '<main class="' + (page === 'projector' ? 'projector' : 'teacher') + '">' + body + '</main>';
    afterRender(r);
  }
  // Where the data lives, backups, and a way to reconnect the right sheet (owner only; not in the demo)
  function tData() {
    if (API.demo) return '';
    if (S.dataInfo === undefined) {
      S.dataInfo = null;
      API.call('dataInfo', {}).then(function (d) { S.dataInfo = d; if (route()[0] === 't') render(); }).catch(function () { S.dataInfo = false; });
    }
    var d = S.dataInfo; if (!d) return '';
    var cur = d.current || {}, better = (d.others || []).filter(function (o) { return o.students > (cur.students || 0); }).sort(function (a, b) { return b.students - a.students; })[0];
    var row = function (o) { return '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.name) + ' <svg class="i"><use href="#i-external"/></svg></a> · ' + o.classes + ' class' + (o.classes === 1 ? '' : 'es') + ', ' + o.students + ' student' + (o.students === 1 ? '' : 's'); };
    var h = '<div class="card data-card"><h2><svg class="i"><use href="#i-save"/></svg> Your data</h2>';
    if (cur.error) h += '<div class="banner ret">The app cannot open its data sheet right now. If this keeps happening, reconnect it below.</div>';
    else h += '<p>Everything is saved in: ' + row(cur) + '</p>';
    if (better) h += '<div class="banner ret"><b>This sheet has fewer students than another one this app has used.</b> ' + row(better) + ' <button class="btn small primary" data-act="data-use" data-id="' + esc(better.id) + '">Use that one</button></div>';
    h += '<p class="small"><b>Backups</b> (a copy is made about once a week): ' + ((d.backups || []).length ? d.backups.slice().reverse().map(function (b) { return '<a href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.day) + '</a> (' + b.students + ')'; }).join(' · ') : 'none yet') + ' <button class="btn tiny ghost" data-act="data-backup">Back up now</button></p>';
    if ((d.others || []).length) h += '<details class="p-more"><summary>Other data sheets this app has used</summary><ul class="small">' + d.others.map(function (o) { return '<li>' + row(o) + ' <button class="btn tiny" data-act="data-use" data-id="' + esc(o.id) + '">Use this one</button></li>'; }).join('') + '</ul></details>';
    var mp = S.mergePreview;
    h += '<details class="p-more" open><summary>Some classes or students missing? Combine with another data sheet (safest)</summary><p class="small">Use this when the app started a new, empty sheet and some students have worked in it since. It brings every class and student from the other sheet into the one you are using now. A student who is in both keeps the best of each quest from either sheet. <b>Nothing is removed, nobody goes back to the beginning,</b> and a backup copy is made first. Open Google Drive, search for <b>Scratch Quest Data</b>, open the other sheet (the one with your missing students in its Students tab), and paste its link.</p>' +
      '<form data-form="data-merge" class="row"><input name="sheet" placeholder="https://docs.google.com/spreadsheets/d/…" required style="flex:1;min-width:16em" value="' + esc(S.mergeSheet || '') + '"><button class="btn">Check what it would add</button></form>' +
      (mp ? '<div class="banner done"><b>From “' + esc(mp.from.name) + '”</b> (' + mp.from.classes + ' classes, ' + mp.from.students + ' students): this would add <b>' + mp.report.added + '</b> student' + (mp.report.added === 1 ? '' : 's') + (mp.report.classes.length ? ' and the class' + (mp.report.classes.length === 1 ? '' : 'es') + ' <b>' + mp.report.classes.map(esc).join(', ') + '</b>' : '') + ', and combine progress for <b>' + mp.report.combined + '</b> student' + (mp.report.combined === 1 ? '' : 's') + ' who ' + (mp.report.combined === 1 ? 'is' : 'are') + ' in both. ' + mp.report.same + ' already match. ' +
        (mp.report.added + mp.report.combined ? '<button class="btn primary" data-act="data-merge-go">Combine now</button>' : 'There is nothing new to bring in.') + '</div>' : '') + '</details>';
    h += '<details class="p-more"><summary>Switch to a different data sheet instead (replaces what students see)</summary><p class="small">Open Google Drive and search for <b>Scratch Quest Data</b>. Open the one that has your students in its Students tab, copy the link from the address bar, and paste it here. Nothing is deleted; this only tells the app which sheet to use. <b>Work saved in the sheet you are using now will not show after switching</b>, so use Combine above if students have worked in it.</p>' +
      '<form data-form="data-reconnect" class="row"><input name="sheet" placeholder="https://docs.google.com/spreadsheets/d/…" required style="flex:1;min-width:16em"><button class="btn primary">Reconnect</button></form></details></div>';
    return h;
  }
  function tWelcome() {
    return '<div class="card narrow"><h1>Welcome, teacher!</h1><h2>Option 1: Import from Google Classroom</h2><p>Bring in a class roster. Students are added automatically and don\'t need a code.</p><a class="btn primary" href="#/t/classroom"><svg class="i"><use href="#i-school"/></svg> Import from Google Classroom</a>' +
      '<h2 style="margin-top:20px">Option 2: Make a class</h2><p>You\'ll get a <b>class code</b> students type in to join.</p>' + createClassForm() + '</div>' + tData();
  }
  function createClassForm() {
    return '<form data-form="create-class" class="row"><input name="name" placeholder="Class name, e.g. Period 3" maxlength="40" required><button class="btn primary">+ Create class</button></form>';
  }
  function classStudents() {
    return S.teacher.students.filter(function (s) { return s.classId === S.tClass && !s.isTeacher; });
  }
  function tDash() {
    var c = tc(), ss = classStudents();
    var pend = pendingList();
    var avgLv = ss.length ? (ss.reduce(function (a, s) { return a + s.profile.level; }, 0) / ss.length).toFixed(1) : '—';
    var totalXP = ss.reduce(function (a, s) { return a + s.profile.xp; }, 0);
    var active = ss.filter(function (s) { return s.updated && Date.now() - s.updated < 7 * 864e5; }).length;
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-chart"/></svg> ' + esc(c.name) + '</h1>' + classPicker() + '</div><div class="t-actions"><a class="btn primary big cs-launch" href="#/t/screen"><svg class="i"><use href="#i-monitor"/></svg> Class Screen</a><div class="code-card"><span>Class code</span><b>' + esc(c.code) + '</b><button class="btn small" data-act="t-projector"><svg class="i"><use href="#i-monitor"/></svg> Projector map</button></div></div></div>';
    h += '<div class="stats"><div class="stat"><b>' + ss.length + '</b><span>students</span></div><div class="stat"><b>' + avgLv + '</b><span>average level</span></div>' +
      '<div class="stat"><b>' + fmtN(totalXP) + '</b><span>class XP' + (c.classGoal ? ' / ' + fmtN(c.classGoal) + ' goal' : '') + '</span></div>' +
      '<div class="stat"><b>' + active + '</b><span>active this week</span></div>' +
      '<a class="stat link" href="#/t/review"><b>' + pend.length + '</b><span>waiting for review <svg class="i"><use href="#i-arrow-right"/></svg></span></a></div>';
    if (c.openThrough < R.MAX_TIER) h += '<div class="banner lock"><svg class="i"><use href="#i-clock"/></svg> Pacing gate: students can work through quest tier <b>' + c.openThrough + '</b> (' + esc(tierName(c.openThrough)) + '). <a href="#/t/classes">Change</a></div>';
    h = h.replace('<div class="stats">', '<div id="t-helpbox"></div><div class="stats">'); setTimeout(tHelpStart, 0);
    h += tArcadeCard(c); tArcadeLoad(c);
    if (!ss.length) return h + '<div class="card"><h2>No students yet</h2><p>Have students open this web app and enter code <b class="code">' + esc(c.code) + '</b>.</p></div>';
    // progress grid
    h += '<div class="card"><div class="row between"><h2>Progress grid</h2><span class="legend-inline"><span class="cell s-done"></span>done <span class="cell s-submitted"></span>turned in <span class="cell s-returned"></span>sent back <span class="cell s-started"></span>working <span class="cell s-available"></span>ready <span class="cell s-locked"></span>locked</span></div><div class="grid-scroll"><table class="pgrid"><thead><tr><th>Student</th><th>Lv</th><th>XP</th>';
    R.NODES.forEach(function (n) { h += '<th class="gcol" style="--c:' + R.BRANCHES[n.branch].color + '" title="' + esc(title(n.id)) + '"><span>' + n.id.toUpperCase() + '</span></th>'; });
    h += '<th>Last active</th></tr></thead><tbody>';
    ss.sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (s) {
      h += '<tr><td><a class="stu" href="#/t/student/' + encodeURIComponent(s.email) + '">' + A.svg(s.state.avatar, 28) + esc(s.name) + '</a></td><td>' + s.profile.level + '</td><td>' + fmtN(s.profile.xp) + '</td>';
      R.NODES.forEach(function (n) {
        var st = R.nodeStatus(s.state, n.id, c.openThrough);
        var ns = s.state.nodes[n.id];
        var extra = ns && ns.challenge ? '<svg class="i"><use href="#i-zap"/></svg>' : '';
        h += '<td><span class="cell s-' + st + '" title="' + esc(title(n.id) + ': ' + statusWord(st)) + '">' + extra + '</span></td>';
      });
      h += '<td class="muted small">' + ago(s.updated) + '</td></tr>';
    });
    h += '</tbody></table></div><p class="muted small">Columns follow the tree: T = Sprite Meadow, G/S/A = Games/Stories/Apps, M = Debug Caves, F = Showcase Castle. <svg class="i"><use href="#i-zap"/></svg> = did the bonus challenge. Click a name for details, badges and bonus XP.</p></div>';
    return h;
  }
  function tierName(t) {
    return R.NODES.filter(function (n) { return n.tier === t; }).map(function (n) { return title(n.id); }).join(' / ');
  }
  function tReview() {
    var list = pendingList();
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-inbox"/></svg> Review queue</h1>' + classPicker() + '</div></div>';
    if (!list.length) return h + '<div class="card center"><h2>All caught up! <svg class="i"><use href="#i-sparkles"/></svg></h2><p class="muted">Turned-in quests appear here. Approve them to award the quest XP and unlock the next quest.</p></div>';
    h += '<p class="muted">Oldest first. Approving gives +' + R.XP.lesson + ' XP and unlocks what comes next.</p><div class="review-list">';
    list.forEach(function (it) {
      var s = it.s, ns = it.ns, B = br(it.id);
      h += '<div class="card review" style="--c:' + B.color + '"><div class="rv-who">' + A.svg(s.state.avatar, 56) + '<div><b>' + esc(s.name) + '</b><div class="muted small">' + esc(s.email) + '</div></div></div>' +
        '<div class="rv-what"><div class="eyebrow">' + SQ_ICONS.branch(R.NODE[it.id].branch) + ' Quest ' + R.NODE[it.id].tier + '</div><h3>' + esc(title(it.id)) + '</h3>' +
        '<p>' + (ns.link ? '<a href="' + esc(ns.link) + '" target="_blank" rel="noopener"><svg class="i"><use href="#i-link"/></svg> Open project</a>' : '<span class="muted">No link — student will show you.</span>') + (ns.challenge ? ' · <span class="chip gold"><svg class="i"><use href="#i-zap"/></svg> did the challenge</span>' : '') + '</p>' +
        (ns.reflection ? '<blockquote>' + esc(ns.reflection) + '</blockquote>' : '') + '<p class="muted small">Turned in ' + ago(ns.submittedAt) + '</p></div>' +
        '<form class="rv-act" data-form="review" data-email="' + esc(s.email) + '" data-node="' + it.id + '"><textarea name="feedback" rows="2" placeholder="Feedback (optional for approve, helpful for send back)"></textarea>' +
        '<div class="row"><button class="btn primary" name="approve" value="1"><svg class="i"><use href="#i-check-circle"/></svg> Approve</button><button class="btn" name="approve" value="0"><svg class="i"><use href="#i-undo"/></svg> Send back</button></div></form></div>';
    });
    return h + '</div>';
  }
  function tMap() {
    var c = tc();
    return '<div class="t-head"><div><h1><svg class="i"><use href="#i-map"/></svg> Class map</h1>' + classPicker() + '</div><button class="btn" data-act="t-projector"><svg class="i"><use href="#i-monitor"/></svg> Projector mode</button></div>' +
      '<div class="map-layout"><aside class="map-side"><div id="goal-box"></div><div class="card"><p class="small">This is what students see: everyone\'s avatar stands on the quest they\'re working on. Click any quest to preview it.</p><p class="small">Pacing gate: tier ' + c.openThrough + ' of ' + R.MAX_TIER + '.</p></div></aside>' +
      '<section class="map-main"><div id="map-box" class="map-box"><div class="loading"><div class="spinner"></div></div></div></section></div>';
  }
  function tProjector() {
    var c = tc();
    return '<div class="proj-head"><div><h1>' + esc(c.name) + ' — Quest Map</h1><p>Join code: <b class="code">' + esc(c.code) + '</b></p></div><div id="goal-box"></div><a class="btn" href="#/t/map"><svg class="i"><use href="#i-x"/></svg> Exit</a></div><div id="map-box" class="map-box proj"><div class="loading"><div class="spinner"></div></div></div>';
  }
  // ---- MA DLCS standards
  function stdOf(id) { return (typeof SQ_DLCS !== 'undefined' && SQ_DLCS.lessons[id]) || { s: [], p: [] }; }
  function stdChips(id) {
    return '<div class="std-chips">' + stdOf(id).s.map(function (x) {
      return '<span class="std-chip" title="6-8.' + esc(x[0]) + ': ' + esc(SQ_DLCS.standards[x[0]]) + '">' + esc(x[0]) + '</span>';
    }).join('') + '</div>';
  }
  function stdFull(id) {
    var a = stdOf(id);
    if (!a.s.length) return '';
    return '<div class="card std-card"><h2><svg class="i"><use href="#i-ruler"/></svg> MA DLCS standards (grades 6–8)</h2><ul class="std-list">' + a.s.map(function (x) {
      return '<li><b class="std-code">6-8.' + esc(x[0]) + '</b> ' + esc(SQ_DLCS.standards[x[0]]) + '<div class="std-how"><svg class="i"><use href="#i-arrow-right"/></svg> ' + esc(x[1]) + '</div></li>';
    }).join('') + '</ul><p class="small"><b>Practices:</b> ' + a.p.map(function (n) { return n + '. ' + SQ_DLCS.practices[n]; }).join(' · ') + '</p></div>';
  }
  function tStandards() {
    var c = tc(), ss = c ? classStudents() : [];
    var byCode = {};
    R.NODES.forEach(function (n) { stdOf(n.id).s.forEach(function (x) { (byCode[x[0]] = byCode[x[0]] || []).push(n.id); }); });
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-ruler"/></svg> Standards</h1>' + (c ? classPicker() : '') + '<p class="muted">' + esc(SQ_DLCS.source) + '. Wording is quoted from the <a href="' + SQ_DLCS.url + '" target="_blank" rel="noopener">official framework</a>.</p></div></div>';
    h += '<div class="card"><p class="small">Each row is a standard this unit addresses. <b>Lessons</b> lists every quest that teaches it (a student\'s path won\'t include all branches). <b>Class</b> shows the share of students who have <i>finished</i> at least one of those quests.</p><div class="grid-scroll"><table class="stdtable"><thead><tr><th>Standard</th><th>Lessons</th>' + (c ? '<th>Class</th>' : '') + '</tr></thead><tbody>';
    var strands = Object.keys(SQ_DLCS.strands);
    Object.keys(SQ_DLCS.standards).sort(function (a, b) {
      var sa = strands.indexOf(a.split('.').slice(0, 2).join('.')), sb = strands.indexOf(b.split('.').slice(0, 2).join('.'));
      return sa - sb || a.localeCompare(b, undefined, { numeric: true });
    }).forEach(function (code) {
      var lessons = byCode[code] || [];
      var strand = SQ_DLCS.strands[code.split('.').slice(0, 2).join('.')];
      var got = ss.filter(function (st) { return lessons.some(function (id) { return st.profile.done[id]; }); }).length;
      var pct = ss.length ? Math.round(got / ss.length * 100) : 0;
      h += '<tr><td><b class="std-code">6-8.' + code + '</b> <span class="muted small">' + esc(strand) + '</span><div class="small">' + esc(SQ_DLCS.standards[code]) + '</div></td>' +
        '<td>' + lessons.map(function (id) { return '<a class="std-lesson" style="--c:' + br(id).color + '" href="#/t/lesson/' + id + '" title="' + esc(title(id)) + '">' + SQ_ICONS.branch(R.NODE[id].branch) + ' ' + esc(title(id)) + '</a>'; }).join('') + '</td>' +
        (c ? '<td class="std-pct"><span class="xpbar"><i style="width:' + pct + '%"></i></span><b>' + pct + '%</b><span class="muted small">' + got + ' of ' + ss.length + '</span></td>' : '') + '</tr>';
    });
    h += '</tbody></table></div></div>';
    h += '<div class="card"><h2>Not covered by this unit</h2><p class="small">A Scratch unit naturally centers on Computational Thinking. These 6–8 strands need other lessons: Computing Devices (except troubleshooting), Networks, Services, Human and Computer Partnerships, Research, Data representation (binary), most of Ethics and Laws (copyright, fair use, licensing), and Interpersonal and Societal Impact.</p></div>';
    return h;
  }
  function tLessons() {
    var vids = S.boot.settings.videos || {};
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-library"/></svg> Lessons & videos</h1><p class="muted">Every student path is 14 quests (40–45 min each). Paste a YouTube, Google Drive, Vimeo or Loom link to show your video overview at the top of a quest.</p></div></div>';
    var groups = {};
    R.NODES.forEach(function (n) { (groups[n.tier] = groups[n.tier] || []).push(n); });
    h += '<div class="lesson-list">';
    Object.keys(groups).sort(function (a, b) { return a - b; }).forEach(function (t) {
      h += '<div class="tier-row"><div class="tier-num">' + t + '</div><div class="tier-items">';
      groups[t].forEach(function (n) {
        var Ls = L[n.id], B = R.BRANCHES[n.branch];
        h += '<div class="card lesson-item" style="--c:' + B.color + '"><div class="eyebrow">' + SQ_ICONS.branch(n.branch) + ' ' + esc(B.name) + (Ls.project ? ' · ' + esc(Ls.project.name) + ' ' + esc(Ls.project.part) : '') + '</div><h3>' + esc(Ls.title) + '</h3>' +
          '<p class="small">' + esc(Ls.skill) + ' · ' + esc(Ls.minutes) + ' min</p>' + (SQ_UBD.lessons[n.id] ? '<p class="ubd-mini"><b>EQ:</b> ' + esc(SQ_UBD.lessons[n.id].eq) + '</p>' : '') + '<p class="muted small">' + notesHTML(Ls.teacherNotes) + '</p>' +
          '<form class="row" data-form="video" data-node="' + n.id + '"><input name="url" placeholder="Video link (optional)" value="' + esc(vids[n.id] || '') + '"><button class="btn small">Save</button></form>' +
          (Ls.starter ? '<form class="row" data-form="starter" data-node="' + n.id + '"><input name="url" placeholder="Starter project link (for absent students)" value="' + esc((S.boot.settings.starters || {})[n.id] || '') + '"><button class="btn small">Save</button></form><p class="muted small"><svg class="i"><use href="#i-briefcase"/></svg> Starter should contain: ' + esc(Ls.starter.contains) + '</p>' : '') +
          stdChips(n.id) + '<a class="btn small ghost" href="#/t/lesson/' + n.id + '"><svg class="i"><use href="#i-eye"/></svg> Preview</a></div>';
      });
      h += '</div></div>';
    });
    return h + '</div>';
  }
  // ------------------------------------------------------------ Google Classroom (teacher)
  function gcImport(courseId, classId, style) {
    return call('classroomImport', { courseId: courseId, classId: classId || '', nameStyle: style || 'initial' }).then(function (r) {
      S.tClass = r.classId;
      S.gc.msg = '<svg class="i"><use href="#i-check-circle"/></svg> Imported ' + r.total + ' students: ' + r.added + ' new' + (r.moved ? ', ' + r.moved + ' moved from another class' : '') + (r.kept ? ', ' + r.kept + ' already here' : '') + '.' +
        (r.missingEmails ? ' <svg class="i"><use href="#i-alert"/></svg> ' + r.missingEmails + ' students had no email visible (check Classroom settings).' : '') +
        (r.notInRoster.length ? ' Not in the Classroom roster (left alone): ' + r.notInRoster.map(esc).join(', ') + '.' : '');
      return loadTeacher().then(function () { return call('classroomCourses'); }).then(function (c) { S.gc.courses = c.courses; render(); });
    }).catch(function () { render(); });
  }
  // ============================================================ CLASS SCREEN (projector, teacher only)
  // Only positive information: no grades, quiz results, or returned work.
  var CS_QUESTIONS = SQ_UBD.unit.eqs;
  var CS_TEAMS = [['#ef4444', 'Pixels'], ['#3b82f6', 'Rockets'], ['#a855f7', 'Octopi'], ['#f59e0b', 'Sparks'], ['#14b8a6', 'Foxes'], ['#ec4899', 'Rainbows'], ['#84cc16', 'Robots'], ['#f97316', 'Dragons']];
  function teamDot(color) { return '<span class="cs-dot" style="background:' + (/^#[0-9a-f]{6}$/i.test(color || '') ? color : '#94a3b8') + '"></span>'; }
  var CS_AGENDA = 'Keep going on your quest\nTurn it in when every core step is done\nTry the bonus challenge or help a classmate';
  function avatarImgTag(av, cls) { return '<img class="' + (cls || 'cs-av') + '" src="' + avatarURI(av) + '" alt="">'; }
  function csStop() { if (S.csTimers) { S.csTimers.forEach(clearInterval); S.csTimers = null; } }
  function csNow() { return Date.now() + (S.cs && S.cs.skew || 0); }
  function csClock() {
    var d = new Date(csNow());
    var h = d.getHours(), m = d.getMinutes();
    return { time: ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m, ampm: h < 12 ? 'AM' : 'PM', date: d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) };
  }
  function csLeft() {
    var sc = (S.cs && S.cs.data.cls.screen) || {};
    if (!sc.endAt) return null;
    var ms = sc.endAt - csNow(), total = sc.startAt ? sc.endAt - sc.startAt : null;
    return { ms: ms, pct: total ? Math.max(0, Math.min(100, ms / total * 100)) : null };
  }
  function fmtLeft(ms) {
    var s = Math.max(0, Math.round(ms / 1000)), m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function tScreen() {
    return '<div class="cs" id="cs"><div class="cs-loading">Loading the Class Screen…</div></div>';
  }
  function csLoad(first) {
    if (!first && document.hidden) return;
    var c = tc();
    if (!c) return;
    var t0 = Date.now();
    return API.call('classScreen', { classId: c.id }).then(function (d) {
      S.cs = { data: d, skew: d.serverNow - Math.round((t0 + Date.now()) / 2) };
      csPaint(first);
    }).catch(function (e) { if (first) document.getElementById('cs').innerHTML = '<div class="cs-loading">Could not load: ' + esc(e.message) + '</div>'; });
  }
  // Paint panels; only touch the DOM when a panel's content actually changed (no flicker)
  function csSet(id, html) {
    var el = document.getElementById(id);
    if (el && el.__src !== html) { el.innerHTML = html; el.__src = html; }
  }
  function csPaint(first) {
    var root = document.getElementById('cs');
    if (!root || !S.cs) return;
    if (first || !document.getElementById('cs-race')) {
      root.innerHTML =
        '<header class="cs-head"><div class="cs-brand"><span class="cs-logo"><svg class="i"><use href="#i-compass"/></svg></span><div class="cs-brand-t"><div class="cs-class" id="cs-class"></div><div class="cs-today" id="cs-today"></div></div></div>' +
        '<div class="cs-xp" id="cs-xp"></div>' +
        '<div class="cs-ctrl"><button class="cs-btn cs-helpbtn" id="cs-helpbtn" data-act="cs-help-jump" hidden></button>' +
        '<button class="cs-btn" id="cs-arcbtn" data-act="cs-arcade" title="Open or lock the arcade for this class"></button>' +
        '<button class="cs-btn" data-act="cs-bell" title="Test the help doorbell (also turns on sound on this computer)" aria-label="Test the doorbell">🔔</button>' +
        '<button class="cs-btn" data-act="cs-setup" title="Set up the screen"><svg class="i"><use href="#i-sliders"/></svg> <span>Set up</span></button><button class="cs-btn" data-act="cs-full" title="Full screen"><svg class="i"><use href="#i-maximize"/></svg> <span>Full screen</span></button><a class="cs-btn" href="#/t/dash" title="Exit"><svg class="i"><use href="#i-x"/></svg> <span>Exit</span></a></div></header>' +
        '<div class="cs-grid"><section class="cs-main">' +
        '<div class="cs-card cs-racebox"><div class="cs-race-h"><h2 id="cs-race-h"></h2><div class="cs-race-meta" id="cs-race-meta"></div><div class="cs-pick" id="cs-quest-pick"></div><div class="cs-views" id="cs-views"></div></div>' +
        '<div id="cs-race" class="cs-race"></div><div id="cs-others" class="cs-others"></div></div>' +
        '<div class="cs-row2"><div class="cs-card cs-mission"><h2><svg class="i"><use href="#i-target"/></svg> What to work on</h2><div id="cs-mission"></div></div>' +
        '<div class="cs-card cs-helpbox" id="cs-helpbox"><h2><svg class="i"><use href="#i-help"/></svg> Who to ask for help</h2><div id="cs-help"></div></div></div>' +
        '</section><section class="cs-side">' +
        '<div class="cs-card cs-needhelp" id="cs-needhelp" hidden><h2><span class="hand">✋</span> Needs help</h2><div id="cs-needlist"></div></div>' +
        '<div class="cs-card cs-timecard"><div class="cs-clock"><span id="cs-clock"></span><small id="cs-ampm"></small></div><div class="cs-date" id="cs-date"></div><div class="cs-left" id="cs-left"></div></div>' +
        '<div class="cs-card cs-think"><h2><svg class="i"><use href="#i-message"/></svg> Essential question</h2><div id="cs-question"></div></div>' +
        '<div class="cs-card cs-winsbox" id="cs-winsbox"><h2><svg class="i"><use href="#i-sparkles"/></svg> Recent wins</h2><div id="cs-wins"></div></div>' +
        '</section></div>';
    }
    var d = S.cs.data, sc = d.cls.screen || {}, race = d.race;
    var csNeeds = {}, hl = (S.csHelp && S.csHelp.list) || [];
    hl.forEach(function (x) { csNeeds[x.who] = 1; });
    var hb = document.getElementById('cs-helpbtn');
    if (hb) { hb.hidden = !hl.length; csSet('cs-helpbtn', '✋ <span>' + hl.length + ' need' + (hl.length === 1 ? 's' : '') + ' help</span>'); }
    var nh = document.getElementById('cs-needhelp');
    if (nh) { nh.hidden = !hl.length; csSet('cs-needlist', hl.length ? helpListHTML(hl, d.cls.id, S.csHelp.serverNow) : ''); }
    var tcl = tc(), arcOn = tcl && tcl.arcade && tcl.arcade.mode !== 'off';
    csSet('cs-arcbtn', '<svg class="i"><use href="#i-gamepad"/></svg> <span>' + (arcOn ? 'Arcade open · Lock' : 'Open arcade') + '</span>');
    var ab = document.getElementById('cs-arcbtn'); if (ab) ab.classList.toggle('on', !!arcOn);
    root.classList.toggle('dark', !!sc.dark); document.body.classList.toggle('cs-dark', !!sc.dark);
    var teams = d.cls.teams || [];
    var view = sc.view === 'map' ? 'map' : (sc.view === 'teams' && teams.length ? 'teams' : 'quest');
    csSet('cs-class', esc(d.cls.name));
    csSet('cs-today', race ? 'Today: Quest ' + race.tier + ' · ' + esc(race.title) : 'Scratch Quest');
    csSet('cs-xp', '<svg class="i"><use href="#i-zap"/></svg> <b>' + fmtN(d.classXP) + '</b> class XP' + (d.cls.classGoal ? '<div class="cs-bar sm"><i style="width:' + Math.min(100, Math.round(d.classXP / d.cls.classGoal * 100)) + '%"></i></div>' : ''));
    csSet('cs-views', [['quest', 'Today\'s quest'], ['map', 'Whole map']].concat(teams.length ? [['teams', 'Teams']] : []).map(function (v) {
      return '<button class="cs-chip' + (v[0] === view ? ' on' : '') + '" data-act="cs-view" data-v="' + v[0] + '">' + v[1] + '</button>';
    }).join(''));
    csSet('cs-quest-pick', view === 'quest' ? '<label>Showing <select data-act="cs-quest" aria-label="Quest shown on the track"><option value="">Auto (where most students are)</option>' + R.NODES.map(function (n) {
      return '<option value="' + n.id + '"' + (sc.raceQuest === n.id ? ' selected' : '') + '>Quest ' + n.tier + ': ' + esc(title(n.id)) + '</option>'; }).join('') + '</select></label>' : '');
    // ---- the track ("race to the finish") ----
    var stations, groups = {};
    if (view === 'quest' && race) {
      stations = race.stations.map(function (st, i) {
        var icon = st.key === 'start' ? SQ_ICONS.ic('pin') : st.key === 'check' ? SQ_ICONS.ic('help') : st.key === 'turnin' ? SQ_ICONS.ic('send') : st.key === 'finish' ? SQ_ICONS.ic('flag') : '<b>' + i + '</b>';
        return { key: st.key, label: st.label, icon: icon, color: br(race.quest).color, finish: st.key === 'finish' };
      });
      d.members.forEach(function (m) { if (m.stage) (groups[m.stage] = groups[m.stage] || []).push(m); });
      var fin = (groups.finish || []).length, working = d.members.filter(function (m) { return m.stage && m.stage !== 'finish'; }).length;
      csSet('cs-race-h', '<svg class="i"><use href="#i-flag"/></svg> Race to the finish: ' + esc(race.title));
      csSet('cs-race-meta', working + ' on their way · ' + fin + ' finished');
      csSet('cs-others', race.others.length ? '<b>On other quests:</b> ' + race.others.sort(function (a, b) { return a.tier - b.tier || a.name.localeCompare(b.name); }).map(function (o) {
        return '<span class="cs-other' + (csNeeds[o.hid] ? ' needs-help' : '') + '">' + avatarImgTag(o.avatar, 'cs-av sm') + (csNeeds[o.hid] ? '✋ ' : '') + esc(o.name) + ' · ' + o.tier + '</span>';
      }).join('') : '');
    } else if (view === 'map') {
      stations = [];
      for (var t = 1; t <= R.MAX_TIER; t++) {
        var ns = R.NODES.filter(function (n) { return n.tier === t; });
        stations.push({ key: 'tier' + t, label: ns.length > 1 ? 'Pick a path' : title(ns[0].id), icon: '<b>' + t + '</b>', color: ns.length > 1 ? '#64748b' : R.BRANCHES[ns[0].branch].color, finish: t === R.MAX_TIER });
      }
      d.members.forEach(function (m) { var n = R.NODE[m.current]; if (n) (groups['tier' + n.tier] = groups['tier' + n.tier] || []).push(m); });
      csSet('cs-race-h', '<svg class="i"><use href="#i-map"/></svg> The whole quest map');
      csSet('cs-race-meta', d.members.length + ' adventurers');
      csSet('cs-others', '');
    }
    if (stations) {
      var max = 0; stations.forEach(function (s) { max = Math.max(max, (groups[s.key] || []).length); });
      // busy stations get wider columns so more characters (with names) fit side by side
      var wts = stations.map(function (s) { var n = (groups[s.key] || []).length; return n > 6 ? Math.min(3, 1 + Math.ceil((n - 6) / 6)) : 1; });
      var tot = wts.reduce(function (a, b) { return a + b; }, 0);
      var cols = wts.map(function (w) { return 'minmax(0,' + w + 'fr)'; }).join(' ');
      var edgeL = (wts[0] / tot * 50).toFixed(2) + '%', edgeR = (wts[wts.length - 1] / tot * 50).toFixed(2) + '%';
      csSet('cs-race', '<div class="cs-track" style="--n:' + stations.length + ';grid-template-columns:' + cols + ';--edge-l:' + edgeL + ';--edge-r:' + edgeR + '">' + stations.map(function (s) {
        var kids = (groups[s.key] || []).sort(function (a, b) { return a.name.localeCompare(b.name); });
        return '<div class="cs-st' + (s.finish ? ' finish' : '') + '"><div class="cs-st-dot" style="--c:' + s.color + '">' + s.icon + '</div><div class="cs-st-l">' + esc(s.label) + '</div>' +
          '<div class="cs-st-kids' + (kids.length ? ' has' : '') + '">' + kids.map(function (m) {
            return '<div class="cs-kid' + (csNeeds[m.hid] ? ' needs-help' : '') + '">' + avatarImgTag(m.avatar, 'cs-kid-av') + (csNeeds[m.hid] ? '<i class="cs-hand">✋</i>' : '') + '<span>' + esc(m.name.split(' ')[0]) + '</span></div>';
          }).join('') + '</div></div>';
      }).join('') + '</div>');
    } else {
      // teams view
      var tg = teams.map(function (t) { return { icon: teamDot(t.color), name: t.name, members: d.members.filter(function (m) { return m.team === t.id; }) }; });
      var loose = d.members.filter(function (m) { return !teams.some(function (t) { return t.id === m.team; }); });
      if (loose.length) tg.push({ icon: teamDot('#94a3b8'), name: 'Free agents', members: loose });
      csSet('cs-race-h', '<svg class="i"><use href="#i-users"/></svg> Where every team is');
      csSet('cs-race-meta', teams.length + ' teams');
      csSet('cs-others', '');
      csSet('cs-race', '<div class="cs-teams">' + tg.map(function (g) {
        var together = g.members.reduce(function (a, m) { return a + m.doneCount; }, 0);
        return '<div class="cs-team"><div class="cs-team-h"><span class="cs-team-ico">' + g.icon + '</span><b>' + esc(g.name) + '</b>' +
          (together ? '<span class="cs-together">' + together + ' quests done together</span>' : '') + '</div>' +
          '<ul class="cs-members">' + g.members.sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (m) {
            var cur = R.NODE[m.current];
            return '<li>' + avatarImgTag(m.avatar) + '<span class="cs-mname">' + esc(m.name) + '</span>' +
              (cur ? '<span class="cs-mq" style="--c:' + br(m.current).color + '">' + SQ_ICONS.branch(cur.branch) + ' ' + esc(title(m.current)) + '</span>' : '') + '</li>';
          }).join('') + '</ul></div>';
      }).join('') + '</div>');
    }
    // ---- what to work on (+ standards for today's quest) ----
    var agenda = (sc.agenda || CS_AGENDA).split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var std = race ? stdOf(race.quest).s : [];
    csSet('cs-mission', '<ol class="cs-agenda">' + agenda.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      (std.length ? '<div class="cs-std"><span class="cs-std-l">Standards:</span>' + std.map(function (x) { return '<span class="cs-stdc" title="' + esc(SQ_DLCS.standards[x[0]]) + '">6-8.' + esc(x[0]) + '</span>'; }).join('') + '</div>' : ''));
    // Understanding by Design: the quest's essential question, with its enduring understanding ("big idea")
    var ubd = race && SQ_UBD.lessons[race.quest];
    var q = sc.question || (ubd && ubd.eq) || CS_QUESTIONS[new Date().getDate() % CS_QUESTIONS.length];
    var eu = ubd ? ubd.eu : SQ_UBD.unit.eus[new Date().getDate() % SQ_UBD.unit.eus.length];
    csSet('cs-question', '<p class="cs-q' + (q.length > 130 ? ' long' : '') + '">' + esc(q) + '</p><p class="cs-eu"><b>Big idea:</b> ' + esc(eu) + '</p>');
    // ---- wins ----
    var wb = document.getElementById('cs-winsbox'); if (wb) wb.hidden = sc.showWins === false;
    csSet('cs-wins', d.wins.length ? '<ul class="cs-wins">' + d.wins.slice(0, 6).map(function (w) {
      return '<li><span class="cs-wico">' + (w.kind === 'badge' ? w.icon : SQ_ICONS.ic(w.kind === 'level' ? 'star' : 'check-circle')) + '</span><span class="cs-wtext"><b>' + esc(w.name) + '</b> ' + esc(w.text) + '</span><small>' + ago(w.t) + '</small></li>';
    }).join('') + '</ul>' : '<p class="cs-empty">Wins will show up here as quests get finished.</p>');
    // ---- helpers ----
    var hb = document.getElementById('cs-helpbox'); if (hb) hb.hidden = sc.showHelpers === false;
    csSet('cs-help', d.helpers.length ? '<ul class="cs-help">' + d.helpers.map(function (h) {
      return '<li><div class="cs-hq" style="--c:' + br(h.quest).color + '">Stuck on <b>' + esc(h.title) + '</b>? Ask</div><div class="cs-hwho">' +
        h.helpers.map(function (p) { return '<span class="cs-hp">' + avatarImgTag(p.avatar, 'cs-av sm') + esc(p.name) + '</span>'; }).join(' ') + '</div></li>';
    }).join('') + '</ul><p class="cs-tip">Try 3 before me: the hint, a classmate, then the teacher.</p>' : '<p class="cs-empty">Try 3 before me: the hint, a classmate, then the teacher.</p>');
    csFit();
    csTick();
  }
  // Projector screens can't scroll: shrink the characters, and drop whole list items that don't fit.
  function csFit() {
    if (window.innerWidth <= 1100) return;
    var rc = document.getElementById('cs-race');
    if (rc) {
      var tr = rc.firstElementChild;
      if (tr) {
        tr.classList.remove('tight', 'tiny', 'compact');
        var cls = tr.classList.contains('cs-teams') ? ['compact', 'tiny'] : ['tight', 'tiny'];
        for (var k = 0; k < cls.length && rc.scrollHeight > rc.clientHeight + 2; k++) tr.classList.add(cls[k]);
      }
    }
    [['cs-winsbox', '#cs-wins li'], ['cs-helpbox', '.cs-tip, #cs-help li']].forEach(function (x) {
      var card = document.getElementById(x[0]);
      if (!card || card.hidden) return;
      var items = card.querySelectorAll(x[1]);
      for (var i = items.length - 1; i >= 1 && card.scrollHeight > card.clientHeight + 2; i--) items[i].remove();
    });
  }
  window.addEventListener('resize', function () {
    if (!document.body.classList.contains('cs-on')) return;
    clearTimeout(S.csResize); S.csResize = setTimeout(function () {
      ['cs-wins', 'cs-help', 'cs-race'].forEach(function (id) { var el = document.getElementById(id); if (el) el.__src = null; });
      csPaint(false);
    }, 200);
  });
  function csTick() {
    if (!document.getElementById('cs-clock')) return;
    var c = csClock();
    csSet('cs-clock', c.time); csSet('cs-ampm', c.ampm); csSet('cs-date', esc(c.date));
    var left = csLeft();
    var html;
    if (!left) html = '<div class="cs-left-l">Work time</div><div class="cs-quick">Start a timer: ' + [10, 15, 20, 30, 40].map(function (n) { return '<button class="cs-chip" data-act="cs-timer" data-min="' + n + '">' + n + ' min</button>'; }).join('') + '</div>';
    else if (left.ms <= 0) html = '<div class="cs-done"><svg class="i"><use href="#i-clock"/></svg> Time to save &amp; share!</div><div class="cs-quick"><button class="cs-chip" data-act="cs-timer" data-min="5">+5 min</button><button class="cs-chip" data-act="cs-timer" data-min="0">Clear</button></div>';
    else html = '<div class="cs-left-l">Time left</div><div class="cs-count' + (left.ms < 120000 ? ' soon' : '') + '">' + fmtLeft(left.ms) + '</div>' +
      (left.pct != null ? '<div class="cs-bar sm"><i style="width:' + left.pct.toFixed(1) + '%"></i></div>' : '') +
      '<div class="cs-quick sm"><button class="cs-chip" data-act="cs-timer" data-min="+5">+5 min</button><button class="cs-chip" data-act="cs-timer" data-min="0">Stop</button></div>';
    csSet('cs-left', html);
  }
  // Help requests are checked every 5 seconds (separately from the 20-second refresh), with a doorbell for new ones.
  function csHelpLoad() {
    if (document.hidden) return;
    var c = tc(); if (!c) return;
    API.call('helpList', { classId: c.id }).then(function (res) {
      var seen = S.csHelpSeen || (S.csHelpSeen = {}), fresh = res.list.filter(function (h) { return !seen[h.who + h.at]; });
      if (S.csHelpLoaded && fresh.length) SQ_SOUND.play('doorbell');
      res.list.forEach(function (h) { seen[h.who + h.at] = 1; }); S.csHelpLoaded = true;
      S.csHelp = res; csHelpPaint();
    }).catch(function () { });
  }
  function csHelpPaint() { if (S.cs) csPaint(false); }
  function csStart() {
    csStop();
    S.csHelpLoaded = false;
    csLoad(true);
    csHelpLoad();
    S.csTimers = [setInterval(csTick, 1000), setInterval(function () { csLoad(false); }, 20000), setInterval(csHelpLoad, 8000)];
  }
  function csSave(screen, teams) {
    var c = tc(), args = { classId: c.id, screen: screen };
    if (teams) { args.teams = teams.teams; args.teamOf = teams.teamOf; }
    return call('saveScreen', args).then(function (d) { S.cs.data = d; csPaint(false); return d; });
  }
  function csSetup() {
    var d = S.cs.data, sc = d.cls.screen || {}, teams = d.cls.teams || [];
    var focus = sc.focus || [];
    var studs = S.teacher.students.filter(function (s) { return s.classId === d.cls.id && !s.isTeacher; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var teamOf = {}; d.members.forEach(function (m) { teamOf[m.key] = m.team; });
    S.csDraft = { teams: teams.map(function (t) { return { name: t.name, color: t.color, id: t.id }; }), teamOf: teamOf };
    var h = '<h2><svg class="i"><use href="#i-sliders"/></svg> Class Screen setup</h2><form data-form="cs-setup" class="cs-setup">' +
      '<h3><svg class="i"><use href="#i-target"/></svg> What to work on</h3><label>Steps for today (one per line)<textarea name="agenda" rows="3">' + esc(sc.agenda || CS_AGENDA) + '</textarea></label>' +
      '<div class="small"><b>Focus quests</b> (up to 4)</div><div class="cs-pick">' + R.NODES.map(function (n) {
        return '<label class="cs-pickq"><input type="checkbox" name="f_' + n.id + '"' + (focus.indexOf(n.id) >= 0 ? ' checked' : '') + '> ' + SQ_ICONS.branch(R.NODE[n.id].branch) + ' ' + esc(title(n.id)) + '</label>';
      }).join('') + '</div>' +
      '<h3><svg class="i"><use href="#i-message"/></svg> Essential question</h3><p class="small muted">Leave this empty to show the quest’s essential question and big idea (recommended). Or type your own.</p><textarea name="question" rows="2" id="cs-qbox" placeholder="Leave empty to use the quest’s essential question">' + esc(sc.question || '') + '</textarea>' +
      '<div class="row"><button type="button" class="btn small" data-act="cs-q-random"><svg class="i"><use href="#i-dice"/></svg> A unit essential question</button><button type="button" class="btn small ghost" data-act="cs-q-clear">Use the quest’s essential question</button></div>' +
      '<h3>Show</h3><label class="switch"><input type="checkbox" name="showWins"' + (sc.showWins !== false ? ' checked' : '') + '> <svg class="i"><use href="#i-sparkles"/></svg> Recent wins</label>' +
      '<label class="switch"><input type="checkbox" name="showHelpers"' + (sc.showHelpers !== false ? ' checked' : '') + '> <svg class="i"><use href="#i-help"/></svg> Who to ask for help</label>' +
      '<label class="switch"><input type="checkbox" name="dark"' + (sc.dark ? ' checked' : '') + '> Dark screen (try it if the room is bright or the projector is dim)</label>' +
      '<h3><svg class="i"><use href="#i-users"/></svg> Teams</h3><div class="row"><select id="cs-nteams">' + [0, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<option value="' + n + '"' + (n === teams.length ? ' selected' : '') + '>' + (n ? n + ' teams' : 'No teams') + '</option>'; }).join('') + '</select>' +
      '<button type="button" class="btn small" data-act="cs-shuffle"><svg class="i"><use href="#i-split"/></svg> Shuffle students into teams</button></div><div id="cs-teamedit"></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn primary">Save</button></div></form>';
    modal(h, 'wide');
    csTeamEditor(studs);
    document.getElementById('cs-nteams').addEventListener('change', function (e) {
      var n = +e.target.value, cur = S.csDraft.teams;
      S.csDraft.teams = []; for (var i = 0; i < n; i++) S.csDraft.teams.push(cur[i] || { name: CS_TEAMS[i][1], color: CS_TEAMS[i][0] });
      csTeamEditor(studs);
    });
  }
  function csTeamEditor(studs) {
    var box = document.getElementById('cs-teamedit');
    if (!box) return;
    var T = S.csDraft.teams;
    if (!T.length) { box.innerHTML = '<p class="small muted">Without teams, the screen groups students by the area of the map they are in.</p>'; return; }
    box.innerHTML = '<div class="cs-tnames">' + T.map(function (t, i) { return '<label class="cs-tname">' + teamDot(t.color) + ' <input data-tname="' + i + '" value="' + esc(t.name) + '" maxlength="24"></label>'; }).join('') + '</div>' +
      '<div class="cs-assign">' + studs.map(function (s) {
        var cur = S.csDraft.teamOf[s.email];
        var idx = T.findIndex ? T.findIndex(function (t) { return t.id === cur; }) : -1;
        if (typeof cur === 'number') idx = cur;
        return '<label class="cs-arow"><img class="cs-av sm" src="' + avatarURI(s.state.avatar) + '" alt=""> ' + esc(s.name) + ' <select data-temail="' + esc(s.email) + '"><option value="">—</option>' +
          T.map(function (t, i) { return '<option value="' + i + '"' + (i === idx ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></label>';
      }).join('') + '</div>';
  }
  function tClassroom() {
    S.gc = S.gc || {};
    var c = tc();
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-school"/></svg> Google Classroom</h1><p class="muted">Bring in your Classroom rosters and post quests as Classroom assignments.</p></div></div>';
    h += '<div class="card privacy"><h2><svg class="i"><use href="#i-lock"/></svg> What Scratch Quest uses from Classroom</h2><ul class="small">' +
      '<li><b>Reads</b> the class lists of the Classroom classes <i>you choose to import</i>: each student\'s school email and name.</li>' +
      '<li><b>Stores</b> only the school email and the first name + last initial (like "Maya L."), in your own Google Sheet. No photos, no full names.</li>' +
      '<li><b>Creates</b> assignments only when you click Post. It never changes your rosters, grades, or other assignments.</li>' +
      '<li>Only teacher accounts can use this page. Students never get Classroom access through Scratch Quest.</li></ul></div>';
    // step 1: courses
    h += '<div class="card"><h2>1. Import a class</h2>';
    if (!S.gc.courses) {
      h += '<p>Load the Classroom classes you teach. Then import one to add its students automatically. They won\'t need a class code.</p><button class="btn primary" data-act="gc-load"><svg class="i"><use href="#i-inbox"/></svg> Load my Classroom classes</button>';
    } else if (!S.gc.courses.length) {
      h += '<p>No active Classroom classes found where you are a teacher.</p><button class="btn" data-act="gc-load">Try again</button>';
    } else {
      h += '<div class="gc-list">' + S.gc.courses.map(function (co) {
        var linked = co.linkedClassId && S.teacher.classes.filter(function (k) { return k.id === co.linkedClassId; })[0];
        return '<div class="gc-course"><div class="gc-name"><b>' + esc(co.name) + '</b>' + (co.section ? ' <span class="muted">· ' + esc(co.section) + '</span>' : '') +
          (linked ? '<div class="small gc-linked"><svg class="i"><use href="#i-check-circle"/></svg> Linked to <b>' + esc(linked.name) + '</b>' + (linked.syncedAt ? ' · synced ' + ago(linked.syncedAt) : '') + '</div>' : '') + '</div>' +
          (linked
            ? '<button class="btn small" data-act="gc-import" data-course="' + esc(co.id) + '" data-style="' + esc(linked.nameStyle || 'initial') + '"><svg class="i"><use href="#i-refresh"/></svg> Sync roster</button>'
            : '<form class="gc-import" data-form="gc-import" data-course="' + esc(co.id) + '"><select name="classId"><option value=""><svg class="i"><use href="#i-plus"/></svg> New Scratch Quest class</option>' +
              S.teacher.classes.filter(function (k) { return !k.courseId && !k.archived; }).map(function (k) { return '<option value="' + k.id + '">Link to: ' + esc(k.name) + '</option>'; }).join('') +
              '</select><select name="nameStyle"><option value="initial">Show names as: Maya L.</option><option value="first">Show names as: Maya</option></select><button class="btn small primary">Import</button></form>') + '</div>';
      }).join('') + '</div>';
    }
    if (S.gc.msg) h += '<div class="banner done small">' + S.gc.msg + '</div>';
    h += '</div>';
    // step 2: post quests
    h += '<div class="card"><h2>2. Post quests to Classroom</h2>';
    if (!c) h += '<p class="muted">Create or import a class first.</p>';
    else {
      h += classPicker();
      if (!c.courseId) h += '<p class="muted">This class isn\'t linked to Google Classroom yet. Import or link it above.</p>';
      else {
        var posted = c.posted || {};
        h += '<p class="small">Linked to <a href="' + esc(c.courseLink || 'https://classroom.google.com/') + '" target="_blank" rel="noopener">' + esc(c.courseName || 'Classroom class') + ' <svg class="i"><use href="#i-external"/></svg></a>. Each quest becomes an assignment under the topic you choose, with a link that opens that quest. Students still turn quests in inside Scratch Quest.</p>' +
          '<form data-form="gc-post" data-class="' + c.id + '"><div class="row gc-name"><label>Topic (unit title) <input name="topic" maxlength="80" value="' + esc(c.gcTopic || 'Scratch Quest') + '" data-act="gc-name"></label>' +
          '<label>Unit number <input name="unit" maxlength="6" placeholder="e.g. 2" value="' + esc(c.gcUnit || '') + '" class="tiny-input" data-act="gc-name"></label>' +
          '<label>Label <input name="word" maxlength="20" placeholder="Lesson" value="' + esc(c.gcWord === undefined ? 'Quest' : c.gcWord) + '" class="tiny-input wide" data-act="gc-name"></label></div>' +
          '<p class="small gc-preview">Assignments will be titled like: <b id="gc-preview">' + esc(gcLabel(c.gcWord === undefined ? 'Quest' : c.gcWord, c.gcUnit || '', 3) + ': ' + title('t3')) + '</b></p><div class="gc-tiers">';
        for (var t = 1; t <= R.MAX_TIER; t++) {
          var p = posted[t];
          h += '<label class="gc-tier' + (p ? ' posted' : '') + '"><input type="checkbox" name="t' + t + '"' + (p ? ' disabled' : '') + '><span class="gc-num">' + (c.gcUnit ? esc(c.gcUnit) + '.' : '') + t + '</span><span class="gc-t">' + tierTitleUI(t) + '</span>' +
            (p ? '<a class="small" href="' + esc(p.link || '#') + '" target="_blank" rel="noopener">' + (p.state === 'PUBLISHED' ? '<svg class="i"><use href="#i-check-circle"/></svg> Posted' : '<svg class="i"><use href="#i-pencil"/></svg> Draft') + ' <svg class="i"><use href="#i-external"/></svg></a>' : '') + '</label>';
        }
        h += '</div><div class="row gc-opts"><button type="button" class="btn small ghost" data-act="gc-select" data-n="5">Select the next 5</button>' +
          '<label class="switch"><input type="checkbox" name="publish"> Publish now (otherwise saved as drafts for you to review)</label>' +
          '<label>Points <input type="number" name="points" min="0" max="1000" placeholder="ungraded" class="tiny-input"></label>' +
          '<label>Due date <input type="date" name="due" class="tiny-input"></label></div>' +
          '<div class="row"><button class="btn primary"><svg class="i"><use href="#i-upload"/></svg> Post selected quests</button><button type="button" class="btn small ghost danger" data-act="gc-unlink" data-class="' + c.id + '">Unlink from Classroom</button></div></form>';
      }
    }
    h += '</div>';
    return h;
  }
  function gcLabel(word, unit, t) { word = String(word || '').trim(); unit = String(unit || '').trim(); return (word ? word + ' ' : '') + (unit ? unit + '.' : '') + t; }
  function tierTitleUI(t) {
    var nodes = R.NODES.filter(function (n) { return n.tier === t; });
    if (nodes.length === 1) return esc(title(nodes[0].id));
    return 'Choose a path: ' + nodes.map(function (n) { return SQ_ICONS.branch(R.NODE[n.id].branch) + ' ' + esc(title(n.id)); }).join(' / ');
  }
  function tClasses() {
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-sliders"/></svg> Classes</h1></div></div><div class="card">' + createClassForm() + '</div>' + tData();
    S.teacher.classes.forEach(function (c) {
      var n = S.teacher.students.filter(function (s) { return s.classId === c.id && !s.isTeacher; }).length;
      h += '<div class="card class-set' + (c.archived ? ' archived' : '') + '"><form data-form="class-set" data-id="' + c.id + '">' +
        '<div class="row between"><input name="name" value="' + esc(c.name) + '" class="h-input" maxlength="40"><div class="code-card small"><span>Code</span><b>' + esc(c.code) + '</b><button type="button" class="btn small ghost" data-act="new-code" data-id="' + c.id + '">New code</button></div></div>' +
        '<p class="muted small">' + n + ' students</p>' +
        '<label>Pacing gate — students can work up to quest tier <b class="gate-val">' + c.openThrough + '</b> <span class="muted gate-name">(' + esc(tierName(c.openThrough)) + ')</span>' +
        '<input type="range" name="openThrough" min="1" max="' + R.MAX_TIER + '" value="' + c.openThrough + '" data-act="gate"></label>' +
        '<label class="switch"><input type="checkbox" name="requireApproval"' + (c.requireApproval ? ' checked' : '') + '> Teacher approves each quest before it counts (recommended)</label>' +
        '<label class="switch"><input type="checkbox" name="requireLink"' + (c.requireLink ? ' checked' : '') + '> Require a Scratch project link to turn in</label>' +
        '<label class="switch"><input type="checkbox" name="sounds"' + (c.sounds !== false ? ' checked' : '') + '> Sound effects for students (they can still mute themselves)</label>' +
        '<label class="switch"><input type="checkbox" name="shop"' + (c.shop !== false ? ' checked' : '') + '> Coin shop in the Character Studio</label>' +
        '<label class="switch"><input type="checkbox" name="showLeaderboard"' + (c.showLeaderboard ? ' checked' : '') + '> Show an XP leaderboard to students (off = alphabetical hall)</label>' +
        '<label>Class XP goal (shared team goal; 0 = hide) <input type="number" name="classGoal" min="0" step="500" value="' + c.classGoal + '"></label>' +
        '<fieldset class="pace-set"><legend>Pacing and nudges</legend>' +
        '<label>Shortest time on a step before “I did it!” works <select name="stepSec">' + [0, 10, 20, 30, 45, 60, 90].map(function (n) { return '<option value="' + n + '"' + (n === c.stepSec ? ' selected' : '') + '>' + (n ? n + ' seconds' : 'Off') + '</option>'; }).join('') + '</select></label>' +
        '<label>Wait after a wrong quick-check answer <select name="quizWait">' + [0, 5, 8, 15, 30].map(function (n) { return '<option value="' + n + '"' + (n === c.quizWait ? ' selected' : '') + '>' + (n ? n + ' seconds' : 'Off') + '</option>'; }).join('') + '</select></label>' +
        '<label class="switch"><input type="checkbox" name="inOrder"' + (c.inOrder !== false ? ' checked' : '') + '> Cards must be done in order (students can’t jump ahead to cards they haven’t reached)</label>' +
        '<label>Nudge a student who hasn’t clicked or typed for <select name="nudgeSec">' + [0, 30, 45, 60, 90, 120].map(function (n) { return '<option value="' + n + '"' + (n === c.nudgeSec ? ' selected' : '') + '>' + (n ? n + ' seconds' : 'Off') + '</option>'; }).join('') + '</select></label>' +
        '<p class="muted small">A nudge makes the next button pulse, with a short tip. On a build step it waits 4 times longer (at least 2 minutes), because students are working in Scratch; after twice that it points to the hint and “I’m stuck”.</p></fieldset>' +
        '<label class="switch"><input type="checkbox" name="archived"' + (c.archived ? ' checked' : '') + '> Archived (hidden, code stops working)</label>' +
        '<button class="btn primary">Save changes</button></form>' +
        '<details class="p-more danger-zone"><summary><svg class="i"><use href="#i-trash"/></svg> Delete this class and all its student data</summary><form data-form="delete-class" data-id="' + c.id + '" class="row"><p class="small">Use this at the end of the year. It removes the class and every student record in it from your Sheet. It cannot be undone. Type the class code <b>' + esc(c.code) + '</b> to confirm.</p><input name="confirm" placeholder="Class code" maxlength="8" class="tiny-input"><button class="btn danger small">Delete forever</button></form></details></div>';
    });
    return h;
  }
  function tStudent(email) {
    var s = S.teacher.students.filter(function (x) { return x.email === email; })[0];
    if (!s) return '<div class="card">Student not found. <a href="#/t/dash">Back</a></div>';
    var p = s.profile, c = tc() || { openThrough: R.MAX_TIER };
    var h = '<a class="back" href="#/t/dash"><svg class="i"><use href="#i-arrow-left"/></svg> Dashboard</a><div class="card stu-head">' + A.svg(s.state.avatar, 110) + '<div class="grow"><h1>' + esc(s.name) + '</h1><p class="muted">' + esc(s.email) + '</p>' +
      '<p><b>Level ' + p.level + '</b> ' + esc(p.rank) + ' · ' + fmtN(p.xp) + ' XP · ' + p.doneCount + ' quests · ' + p.challenges + ' challenges · ' + p.badges.length + ' badges</p>' +
      '<div class="chips">' + p.badges.map(function (b) { return '<span class="chip" title="' + esc(R.BADGE[b].desc) + '">' + R.BADGE[b].icon + ' ' + esc(R.BADGE[b].name) + '</span>'; }).join('') + '</div></div></div>';
    h += '<div class="two-col"><div class="card"><h2><svg class="i"><use href="#i-award"/></svg> Give a badge (+' + R.XP.award + ' XP)</h2><form data-form="award" data-email="' + esc(email) + '"><div class="award-pick">' +
      R.TEACHER_BADGES.map(function (b, i) { var has = p.badges.indexOf(b.id) >= 0; return '<label class="award' + (has ? ' has' : '') + '"><input type="radio" name="badge" value="' + b.id + '"' + (has ? ' disabled' : (i === 0 ? '' : '')) + '><span>' + b.icon + '</span><b>' + esc(b.name) + '</b><small>' + (has ? 'Already earned' : esc(b.desc)) + '</small></label>'; }).join('') +
      '</div><input name="note" placeholder="Why? (the student sees this)" maxlength="200"><button class="btn primary">Give badge</button></form></div>';
    h += '<div class="card"><h2><svg class="i"><use href="#i-star"/></svg> Bonus XP</h2><form data-form="bonus" data-email="' + esc(email) + '" class="stack"><input type="number" name="amount" placeholder="e.g. 25" min="-1000" max="1000" required><input name="note" placeholder="Reason" maxlength="200"><button class="btn">Add XP</button></form>' +
      ((s.state.bonus || []).length ? '<ul class="small">' + s.state.bonus.map(function (b) { return '<li>' + (b.amount > 0 ? '+' : '') + b.amount + ' XP — ' + esc(b.note || '') + '</li>'; }).join('') + '</ul>' : '') +
      '<h2><svg class="i"><use href="#i-pencil"/></svg> Student</h2><form data-form="stu-edit" data-email="' + esc(email) + '" class="stack"><input name="name" value="' + esc(s.name) + '" maxlength="24"><select name="classId">' +
      S.teacher.classes.map(function (k) { return '<option value="' + k.id + '"' + (k.id === s.classId ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('') + '</select><button class="btn">Save</button></form>' +
      '<h2><svg class="i"><use href="#i-blocks"/></svg> Accommodations</h2><form data-form="accom" data-email="' + esc(email) + '" class="stack accom-form">' +
      '<label class="switch"><input type="checkbox" name="coreOnly"' + ((s.state.accom || {}).coreOnly ? ' checked' : '') + '> Core steps only (hide stretch steps and the expert challenge)</label>' +
      '<label class="switch"><input type="checkbox" name="autoRead"' + ((s.state.accom || {}).autoRead ? ' checked' : '') + '> Read each card aloud automatically</label>' +
      '<input name="note" maxlength="300" placeholder="Private note (e.g. IEP: extended time, chunked tasks)" value="' + esc(s.accomNote || '') + '">' +
      '<button class="btn">Save accommodations</button></form>' +
      '<h2><svg class="i"><use href="#i-eye"/></svg> Display</h2><form data-form="stu-display" data-email="' + esc(email) + '" class="stack accom-form">' + displayFields(s.state.display) + '<button class="btn">Save display settings</button></form>' +
      '<button class="btn danger small" data-act="remove-stu" data-email="' + esc(email) + '">Remove student</button></div></div>';
    h += '<div class="card"><h2><svg class="i"><use href="#i-map"/></svg> Quests</h2><table class="qtable"><thead><tr><th>Quest</th><th>Status</th><th>Steps</th><th>Quick check</th><th><svg class="i"><use href="#i-zap"/></svg></th><th>Project / reflection</th><th></th></tr></thead><tbody>';
    R.NODES.forEach(function (n) {
      var ns = s.state.nodes[n.id], st = R.nodeStatus(s.state, n.id, c.openThrough), Ls = L[n.id];
      if (!ns && (st === 'locked' || st === 'gated')) return;
      ns = ns || { steps: [], quiz: {} };
      var sd = Ls.steps.filter(function (_, i) { return ns.steps[i]; }).length;
      var qd = Object.keys(ns.quiz).filter(function (k) { return ns.quiz[k].correct; }).length;
      h += '<tr><td>' + SQ_ICONS.branch(n.branch) + ' ' + esc(Ls.title) + '</td><td><span class="cell s-' + st + '"></span> ' + statusWord(st) + '</td><td>' + sd + '/' + Ls.steps.length + '</td><td>' + qd + '/' + Ls.quiz.length + '</td><td>' + (ns.challenge ? '<svg class="i"><use href="#i-zap"/></svg>' : '') + '</td>' +
        '<td class="small">' + (ns.link ? '<a href="' + esc(ns.link) + '" target="_blank" rel="noopener">project <svg class="i"><use href="#i-external"/></svg></a> ' : '') + esc(ns.reflection || '') + (ns.feedback ? '<div class="muted">Feedback: ' + esc(ns.feedback) + '</div>' : '') + '</td>' +
        '<td>' + (ns.status === 'done' || ns.status === 'submitted' || ns.status === 'returned' ? '<button class="btn tiny ghost" data-act="reopen" data-email="' + esc(email) + '" data-node="' + n.id + '" title="Let the student edit and turn in again">Reopen</button>' : '') +
        (ns.status === 'submitted' ? ' <a class="btn tiny" href="#/t/review">Review</a>' : '') + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  // ------------------------------------------------------------ events
  document.addEventListener('click', function (e) {
    var lk = e.target.closest('[aria-disabled="true"]');
    if (lk) { e.preventDefault(); e.stopPropagation(); lockedClick(lk); return; }
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'close-modal') { closeModal(); return; }
    if (act === 'locked') { e.preventDefault(); toast('<svg class="i"><use href="#i-lock"/></svg> ' + esc(lockedReason(t.getAttribute('data-node')))); return; }
    if (act === 'demo-role') { API.setRole(t.getAttribute('data-role')); S = { boot: null, avatarTab: 'hair' }; location.hash = ''; boot(); return; }
    if (act === 'demo-reset') { ask('Reset the demo? All demo progress in this browser will be erased.', 'Reset demo', true).then(function (ok) { if (ok) { API.reset(); S = { boot: null, avatarTab: 'hair' }; location.hash = ''; boot(); } }); return; }
    if (act === 'quiz') {
      var node = t.getAttribute('data-node'), q = +t.getAttribute('data-q'), c = +t.getAttribute('data-c');
      call('answerQuiz', { node: node, q: q, choice: c }).then(function (res) {
        if (res.correct) { SQ_SOUND.play('correct'); SQ_FX.burst(t, { colors: ['#22c55e', '#facc15', '#fff'], n: 16, spread: 90 }); updateMe(res, t); S.keepScroll = true; render(); }
        else {
          SQ_SOUND.play('wrong'); t.classList.add('wrong'); t.disabled = true;
          var box = t.closest('.quiz').querySelector('.explain');
          box.hidden = false; box.innerHTML = '<svg class="i"><use href="#i-x"/></svg> Not quite. Reread the steps above and try again!'; box.classList.add('nope');
          var qw = paced() ? (S.cls.quizWait || 0) : 0, qz = t.closest('.quiz');
          if (qw) {
            var until = Date.now() + qw * 1000, cool = document.createElement('span'); cool.className = 'cool'; box.appendChild(cool);
            qz.classList.add('cooling');
            var iv = setInterval(function () {
              var left = Math.ceil((until - Date.now()) / 1000);
              if (!qz.isConnected || left <= 0) { clearInterval(iv); qz.classList.remove('cooling'); cool.textContent = ''; return; }
              cool.textContent = ' You can answer again in ' + left + 's.';
            }, 250);
          }
          S.me = res.student;
        }
      }).catch(function () { });
      return;
    }
    if (act === 'card') { S.card = S.card || {}; S.card[t.getAttribute('data-node')] = +t.getAttribute('data-to'); render(); return; }
    if (act === 'speak') { speakCard(t); return; }
    if (act === 'opt') { S.opt = S.opt || {}; S.opt[t.getAttribute('data-key')] = +t.getAttribute('data-j'); S.optLabel = S.optLabel || {}; S.optLabel[t.getAttribute('data-lesson')] = t.getAttribute('data-label'); S.keepScroll = true; var yy = window.scrollY; render(); window.scrollTo(0, yy); return; }
    if (act === 'copy-frame') {
      var ft = t.closest('.frame').querySelector('.frame-text').textContent;
      var done2 = function () { toast('<svg class="i"><use href="#i-clipboard"/></svg> Copied! Paste it into your notes or Scratch.'); };
      try { navigator.clipboard.writeText(ft).then(done2, function () { selectText(t.closest('.frame').querySelector('.frame-text')); }); } catch (e) { selectText(t.closest('.frame').querySelector('.frame-text')); }
      return;
    }
    if (act === 'zoom-shot') { var k2 = t.getAttribute('data-shot'); modal('<figure class="shot-big"><img src="' + SQ_SHOTS[k2] + '" alt="' + esc(SQ_SHOT_INFO[k2] || '') + '"><figcaption>' + esc(SQ_SHOT_INFO[k2] || '') + '</figcaption></figure>', 'wide'); return; }
    if (act === 'words') { wordsModal(t.getAttribute('data-node')); return; }
    if (act === 'split-help') { splitHelp(); return; }
    if (act === 'did-step' || act === 'undo-step' || act === 'did-chal' || act === 'undo-chal') {
      var nd = t.getAttribute('data-node'), isStep = act.indexOf('step') > 0, did = act.indexOf('did') === 0;
      var a2 = { node: nd, value: did };
      if (isStep) a2.idx = +t.getAttribute('data-idx');
      t.disabled = true;
      if (did) { SQ_SOUND.play(isStep ? 'step' : 'badge'); SQ_FX.burst(t, isStep ? { colors: ['#22c55e', '#86efac', '#facc15'], n: 12, spread: 60 } : { colors: ['#facc15', '#f97316', '#a855f7', '#fff'], n: 22, spread: 110 }); }
      call(isStep ? 'toggleStep' : 'setChallenge', a2).then(function (res) {
        updateMe(res, t);
        if (did && isStep) S.lastStepAt = Date.now();
        if (did) { S.card = S.card || {}; S.card[nd] = (S.card[nd] || 0) + 1; }
        render();
      }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'av-tab') { S.avatarTab = t.getAttribute('data-tab'); S.keepScroll = true; render(); return; }
    if (act === 'av-pick' || act === 'av-color') {
      if (t.classList.contains('locked')) { SQ_SOUND.play('locked'); toast('<svg class="i"><use href="#i-lock"/></svg> ' + esc(t.getAttribute('title'))); return; }
      SQ_SOUND.play(t.classList.contains('sale') ? 'tap' : 'pop');
      if (act === 'av-pick') S.avatarDraft[t.getAttribute('data-cat')] = t.getAttribute('data-id');
      else S.avatarDraft[t.getAttribute('data-key')] = t.getAttribute('data-c');
      var y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    if (act === 'av-buy') {
      var bc = t.getAttribute('data-cat'), bid = t.getAttribute('data-id');
      t.disabled = true;
      call('buyItem', { cat: bc, id: bid }).then(function (res) {
        var pill = document.querySelector('.coin-pill') || document.querySelector('.me-card');
        if (pill) SQ_FX.coinFly(pill, t, 6);
        S.me = res.student; saveSeen(prof());
        S.avatarDraft[bc] = bid; S.studioBurst = true;
        var it = A.itemOf(bc, bid), prevAv = Object.assign({}, S.avatarDraft);
        setTimeout(function () {
          SQ_FX.item({ name: it.name, rarity: it.rarity, rarityName: A.RARITY[it.rarity].name, color: A.RARITY[it.rarity].color,
            art: bc === 'title' ? '<span class="title-prev">' + esc(it.name) + '</span>' : A.svg(prevAv, 180),
            sub: 'It is yours to keep. Wear it now, or save it for later.', ok: 'Later', okClass: 'ghost',
            extra: '<button class="btn primary big" data-fx-close data-act="av-save">Wear it now</button>' });
          if (it.rarity === 'legendary') setTimeout(confetti, 500);
        }, SQ_FX.reduced() ? 0 : 650);
        var y3 = window.scrollY; render(); window.scrollTo(0, y3);
        setTimeout(function () { S.studioBurst = false; var pd = document.querySelector('.pedestal'); if (pd) pd.classList.remove('burst'); }, 1200);
      }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'av-goal') {
      call('setGoal', { key: t.getAttribute('data-key') }).then(function (res) { S.me = res.student; SQ_SOUND.play('equip'); toast('<svg class="i"><use href="#i-target"/></svg> Saving up! Your goal shows on the map.'); var y4 = window.scrollY; render(); window.scrollTo(0, y4); }).catch(function () { });
      return;
    }
    if (act === 'av-undo-try') {
      var pp = prof();
      unpaid(S.avatarDraft, pp).forEach(function (x) { S.avatarDraft[x.cat] = (S.me.state.avatar || A.DEFAULT)[x.cat] || A.DEFAULT[x.cat]; });
      var y5 = window.scrollY; render(); window.scrollTo(0, y5); return;
    }
    if (act === 'sound-toggle') { var on = SQ_SOUND.toggle(); if (on) SQ_SOUND.play('pop'); toast(on ? 'Sound on' : 'Sound off'); var y6 = window.scrollY; render(); window.scrollTo(0, y6); return; }
    if (act === 'av-random') {
      var p = prof(), rnd = A.randomAvatar();
      // random from unlocked items only
      Object.keys(A.CATALOG).forEach(function (cat) {
        var ok = A.CATALOG[cat].filter(function (i) { return A.isUnlocked(i.unlock, p); });
        if (!ok.length) return;
        rnd[cat] = ok[Math.floor(Math.random() * ok.length)].id;
      });
      rnd.skin = A.COLORS.skin[Math.floor(Math.random() * A.COLORS.skin.length)];
      S.avatarDraft = rnd; var y2 = window.scrollY; render(); window.scrollTo(0, y2); return;
    }
    if (act === 'av-save') {
      var owe2 = unpaid(S.avatarDraft, prof());
      if (owe2.length) { SQ_SOUND.play('locked'); toast('You are trying on ' + owe2.map(function (x) { return esc(x.item.name); }).join(', ') + '. Buy ' + (owe2.length > 1 ? 'them' : 'it') + ' first, or take ' + (owe2.length > 1 ? 'them' : 'it') + ' off.'); return; }
      var first = !S.me.state.avatarSet;
      call('saveAvatar', { avatar: S.avatarDraft }).then(function (res) {
        updateMe(res, t); S.avatarDraft = null; SQ_SOUND.play('equip');
        toast('<svg class="i"><use href="#i-save"/></svg> Avatar saved!');
        if (first) { var pq = S.pendingQuest; S.pendingQuest = null; go(pq && L[pq] ? '#/quest/' + pq : '#/map'); } else render();
      }).catch(function () { });
      return;
    }
    if (act === 'cs-setup') { if (S.cs) csSetup(); return; }
    if (act === 'cs-bell') { SQ_SOUND.play('doorbell'); toast('🔔 That is the sound when a student asks for help.'); return; }
    if (act === 'cs-help-jump') { var nb = document.getElementById('cs-needhelp'); if (nb) { nb.classList.remove('flash-red'); void nb.offsetWidth; nb.classList.add('flash-red'); } return; }
    if (act === 'cs-arcade') {
      var cc = tc(), on = cc.arcade && cc.arcade.mode !== 'off';
      call('setArcade', { classId: cc.id, mode: on ? 'off' : 'earned', minutes: S.arcMin || 45 }).then(function () { return loadTeacher(); }).then(function () { toast(on ? 'Arcade locked' : 'Arcade open for ' + (S.arcMin || 45) + ' minutes (students use tickets)'); csPaint(false); }).catch(function () { });
      return;
    }
    if (act === 'cs-view') {
      var vv = t.getAttribute('data-v');
      S.cs.data.cls.screen = Object.assign({}, S.cs.data.cls.screen || {}, { view: vv });
      var rc = document.getElementById('cs-race'); if (rc) rc.__src = null;
      csPaint(false); csSave({ view: vv }).catch(function () { });
      return;
    }
    if (act === 'cs-full') {
      var el = document.documentElement;
      try { (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen()).catch(function () { toast('Press F11 (or the full-screen key on a Chromebook) to fill the screen.'); }); }
      catch (e) { toast('Press F11 (or the full-screen key on a Chromebook) to fill the screen.'); }
      return;
    }
    if (act === 'cs-timer') {
      var mv = t.getAttribute('data-min'), sc0 = (S.cs.data.cls.screen || {}), nowT = csNow();
      var upd = mv === '0' ? { endAt: null, startAt: null }
        : mv === '+5' ? { endAt: Math.max(sc0.endAt || nowT, nowT) + 300000, startAt: sc0.startAt || nowT }
        : (sc0.endAt && sc0.endAt <= nowT && mv === '5') ? { endAt: nowT + 300000, startAt: nowT }
        : { endAt: nowT + (+mv) * 60000, startAt: nowT };
      S.cs.data.cls.screen = Object.assign({}, sc0, upd); csTick();
      csSave(upd).catch(function () { });
      return;
    }
    if (act === 'cs-q-random') { var qb = document.getElementById('cs-qbox'); qb.value = CS_QUESTIONS[Math.floor(Math.random() * CS_QUESTIONS.length)]; return; }
    if (act === 'cs-q-clear') { document.getElementById('cs-qbox').value = ''; return; }
    if (act === 'cs-shuffle') {
      var T = S.csDraft.teams; if (!T.length) { toast('Pick how many teams first.'); return; }
      var studs2 = S.teacher.students.filter(function (x) { return x.classId === S.cs.data.cls.id && !x.isTeacher; });
      studs2 = studs2.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
      studs2.forEach(function (x, i) { S.csDraft.teamOf[x.email] = i % T.length; });
      csTeamEditor(S.teacher.students.filter(function (x) { return x.classId === S.cs.data.cls.id && !x.isTeacher; }).sort(function (a, b) { return a.name.localeCompare(b.name); }));
      return;
    }
    if (act === 'gc-load') {
      t.disabled = true; t.textContent = 'Loading…';
      call('classroomCourses').then(function (r) { S.gc = { courses: r.courses }; render(); }).catch(function () { t.disabled = false; t.textContent = 'Try again'; });
      return;
    }
    if (act === 'gc-import') {
      t.disabled = true;
      gcImport(t.getAttribute('data-course'), '', t.getAttribute('data-style'));
      return;
    }
    if (act === 'gc-select') {
      var boxes = Array.prototype.filter.call(document.querySelectorAll('.gc-tier input[type=checkbox]'), function (x) { return !x.disabled; });
      boxes.forEach(function (x, i) { x.checked = i < +t.getAttribute('data-n'); });
      return;
    }
    if (act === 'gc-unlink') {
      var gid = t.getAttribute('data-class');
      ask('Unlink this class from Google Classroom? Nothing in Classroom is deleted, and your students stay in Scratch Quest.', 'Unlink').then(function (ok) {
        if (ok) call('classroomUnlink', { classId: gid }).then(loadTeacher).then(function () { S.gc = {}; toast('Unlinked.'); render(); }).catch(function () { });
      });
      return;
    }
    if (act === 't-projector') { go('#/t/projector'); return; }
    if (act === 'data-use') {
      var did = t.getAttribute('data-id');
      ask('Use this data sheet from now on? Students will see the classes and progress saved in it. Nothing is deleted.', 'Use this sheet').then(function (ok) {
        if (ok) call('dataReconnect', { sheet: did }).then(function () { toast('Reconnected. Reloading…'); S = { boot: null, avatarTab: 'hair' }; boot(); }).catch(function () { });
      });
      return;
    }
    if (act === 'data-merge-go') {
      ask('Combine now? Every class and student from the other sheet is added to the one you are using. Nothing is removed, and a backup copy is made first. It is best to do this between classes; it can take up to a minute.', 'Combine now').then(function (ok) {
        if (!ok) return;
        t.disabled = true; toast('Combining… this can take up to a minute.');
        call('dataMerge', { sheet: S.mergeSheet, apply: true }).then(function (res) {
          S.mergePreview = null; S.mergeSheet = ''; S.dataInfo = res.info;
          toast('<b>Done.</b> Added ' + res.report.added + ' students, combined ' + res.report.combined + '. Reloading…');
          var keep = S.dataInfo; S = { boot: null, avatarTab: 'hair' }; S.dataInfo = keep; boot();
        }).catch(function () { t.disabled = false; });
      });
      return;
    }
    if (act === 'data-backup') { t.disabled = true; call('dataBackupNow', {}).then(function (d) { S.dataInfo = d; toast('Backup saved to your Google Drive'); render(); }).catch(function () { t.disabled = false; }); return; }
    if (act === 'display') {
      modal('<h2><svg class="i"><use href="#i-sliders"/></svg> Display</h2><p class="muted">Make Scratch Quest easier for you to read.</p><form data-form="display" class="stack accom-form">' + displayFields(disp()) +
        '<button class="btn primary big">Save</button></form>');
      return;
    }
    if (act === 'bug') {
      modal('<h2><svg class="i"><use href="#i-bug"/></svg> Report a bug</h2><p class="muted">Something not working? Tell us what happened.</p><form data-form="bug" class="stack">' +
        '<label>What went wrong? What did you click just before? <textarea name="text" rows="4" maxlength="600" required placeholder="e.g. I clicked I did it! and nothing happened"></textarea></label>' +
        '<p class="small muted">We also send the page you are on (' + esc(bugWhere()) + '), your screen size, and the kind of computer, so the bug can be fixed.</p><button class="btn primary big">Send report</button></form>');
      return;
    }
    if (act === 'bug-copy') { copyText(bugsMarkdown()); return; }
    if (act === 'bug-status' || act === 'bug-del') {
      var bargs = { id: t.getAttribute('data-id') }; if (act === 'bug-del') bargs.remove = true; else bargs.status = t.getAttribute('data-status');
      call('bugUpdate', bargs).then(function (res) { S.bugs = res.bugs; S.teacher.newBugs = res.bugs.filter(function (b) { return b.status === 'new'; }).length; render(); }).catch(function () { });
      return;
    }
    if (act === 'ask-help') {
      var hs = t.getAttribute('data-step');
      modal('<h2><span class="hand">✋</span> Ask for help</h2><p class="muted">Your teacher will see where you are. Keep trying while you wait!</p><form data-form="ask-help" data-node="' + t.getAttribute('data-node') + '" data-step="' + esc(hs) + '" class="stack">' +
        '<label>What are you stuck on? <span class="muted">(optional)</span><input name="note" maxlength="140" placeholder="e.g. my sprite won’t move"></label><button class="btn primary big">Ask for help</button></form>');
      return;
    }
    if (act === 'cancel-help') { call('cancelHelp', {}).then(function (res) { S.help = res.help; SQ_SOUND.play('equip'); toast('👍 Nice work figuring it out!'); S.keepScroll = true; var y8 = window.scrollY; render(); window.scrollTo(0, y8); }).catch(function () { }); return; }
    if (act === 'confusing') {
      var cf = (fbFor(t.getAttribute('data-node')).flags || {})[t.getAttribute('data-kind') + ':' + t.getAttribute('data-idx')] || {};
      modal('<h2>🤔 What was confusing?</h2><form data-form="confusing" data-node="' + t.getAttribute('data-node') + '" data-kind="' + t.getAttribute('data-kind') + '" data-idx="' + t.getAttribute('data-idx') + '" class="stack"><div class="reasons">' +
        FB_REASONS.map(function (x) { return '<label class="reason"><input type="radio" name="reason" value="' + x[0] + '"' + (cf.reason === x[0] ? ' checked' : '') + '><span>' + x[1] + '</span> ' + esc(x[2]) + '</label>'; }).join('') +
        '</div><label>Tell us more <span class="muted">(optional)</span><input name="note" maxlength="200" value="' + esc(cf.note || '') + '"></label><button class="btn primary">Send</button></form>');
      return;
    }
    if (act === 'help-done') {
      var hc = t.getAttribute('data-class'); t.disabled = true; SQ_SOUND.play('equip');
      call('helpDone', { classId: hc, who: t.getAttribute('data-who') }).then(function (res) { if (route()[1] === 'screen') { S.csHelp = res; csHelpPaint(); } else tHelpPaint(res, hc); }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'fb-all') { S.fbAll = t.checked; render(); return; }
    if (act === 'fb-copy') { var fn = t.getAttribute('data-node'); copyText(fbMarkdown(fn ? [fn] : fbIds())); return; }
    if (act === 'fb-download') {
      var md = fbMarkdown(fbIds()), a3 = document.createElement('a');
      a3.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); a3.download = 'scratch-quest-feedback.md';
      document.body.appendChild(a3); a3.click(); a3.remove();
      return;
    }
    if (act === 'arc-sel') {
      var sid = t.getAttribute('data-id'), sel = S.arcSel = S.arcSel || [], si = sel.indexOf(sid);
      if (si >= 0) sel.splice(si, 1); else if (sel.length < AR.MAX_POWER) sel.push(sid); else { toast('You can bring ' + AR.MAX_POWER + ' power-ups per run.'); return; }
      SQ_SOUND.play('tap'); document.getElementById('arc-play').innerHTML = arcPlayPanel(); return;
    }
    if (act === 'arc-game') { if (S.arcRun) return; S.arcGameSel = t.getAttribute('data-game'); SQ_SOUND.play('tap'); arcPaint(); return; }
    if (act === 'kart-buy' || act === 'kart-up' || act === 'kart-pick') {
      var kid = t.getAttribute('data-kart'), kact = act === 'kart-buy' ? 'kartBuy' : act === 'kart-up' ? 'kartUpgrade' : 'kartSelect';
      t.disabled = true;
      call(kact, { kart: kid, part: t.getAttribute('data-part') }).then(function (res) {
        if (act !== 'kart-pick') { var cp = document.querySelector('.arc-wallet .coin-tag') || document.querySelector('.me-card'); if (cp) SQ_FX.coinFly(cp, t, 5); }
        SQ_FX.burst(t, { colors: [AR.KART[kid].color, '#facc15', '#fff'], n: act === 'kart-buy' ? 26 : 14, spread: act === 'kart-buy' ? 120 : 70 });
        SQ_SOUND.play(act === 'kart-buy' ? 'legendary' : act === 'kart-up' ? 'buy' : 'equip');
        S.arc.me = res.me; if (res.student) { S.me = res.student; saveSeen(prof()); }
        if (act === 'kart-buy') toast('<b>' + esc(AR.KART[kid].name) + '</b> is yours! It is ready to race.', 't-badge');
        var y = window.scrollY; render(); window.scrollTo(0, y);
      }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'arc-go') { SQ_SOUND.play('pop'); arcStartGame(); return; }
    if (act === 'arc-again') { closeModal(); arcStartGame(); return; }
    if (act === 'arc-pass') {
      t.disabled = true;
      call('arcadePass', {}).then(function (res) { S.arc.me = res.me; SQ_SOUND.play('levelup'); SQ_FX.burst(t, { colors: ['#7b2ff7', '#f72585', '#ffd60a', '#fff'], n: 24, spread: 130 }); toast('<svg class="i"><use href="#i-clock"/></svg> Your ' + S.arc.info.passMin + '-minute pass has started. Have fun!'); arcPaint(); }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'arc-buy') {
      var it = t.getAttribute('data-item'); t.disabled = true;
      call('arcadeBuy', { item: it }).then(function (res) {
        var cpill = document.querySelector('.arc-wallet .coin-tag') || document.querySelector('.me-card'); if (cpill) SQ_FX.coinFly(cpill, t, 4);
        SQ_FX.burst(t, { colors: [it === 'ticket' ? '#7b2ff7' : AR.POWER[it].color, '#facc15', '#fff'], n: 16, spread: 80 });
        S.arc.me = res.me; S.me = res.student; SQ_SOUND.play('buy'); saveSeen(prof());
        toast('<span class="coin" aria-hidden="true"></span> <b>' + (it === 'ticket' ? 'Ticket' : esc(AR.POWER[it].name)) + '</b> added!', 't-badge');
        var y = window.scrollY; render(); window.scrollTo(0, y);
      }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'arc-mode') {
      var cid = t.getAttribute('data-id'), sm = document.getElementById('arc-min-' + cid), mins = sm ? +sm.value : 45;
      S.arcMin = mins;
      call('setArcade', { classId: cid, mode: t.getAttribute('data-mode'), minutes: mins }).then(function (res) { return loadTeacher().then(function () { S.tArcBoard = S.tArcBoard || {}; S.tArcBoard[cid] = res.board; toast(res.cls.arcade.mode === 'off' ? 'Arcade locked' : 'Arcade open for ' + mins + ' minutes'); render(); }); }).catch(function () { });
      return;
    }
    if (act === 'arc-reset') {
      var rid = t.getAttribute('data-id');
      ask('Start a new leaderboard round? The top 3 win coin prizes, then the board is cleared (students keep their all-time best and titles).', 'Start new round').then(function (ok) {
        if (ok) call('setArcade', { classId: rid, resetBoard: true }).then(function (res) { S.tArcBoard[rid] = res.board; toast('New round started.' + ((res.winners || []).length ? ' Prizes: ' + res.winners.map(function (w) { return esc(w.name) + ' +' + w.coins; }).join(', ') : '')); render(); }).catch(function () { });
      });
      return;
    }
    if (act === 'teacher-try') {
      var c0 = tc();
      if (!c0) { toast('Create a class first.'); return; }
      call('joinClass', { code: c0.code, name: 'Teacher' }).then(function (res) { S.me = res.student; S.cls = res.cls; S.teacher = null; go('#/map'); toast('You joined ' + esc(res.cls.name) + ' as a practice student. (You won\'t count in class stats.)'); }).catch(function () { });
      return;
    }
    if (act === 'new-code') {
      var cid = t.getAttribute('data-id');
      ask('Make a new class code? The old code stops working for new students. Students already in the class are fine.', 'Make new code').then(function (ok) {
        if (ok) call('updateClass', { id: cid, patch: { newCode: true } }).then(function () { return loadTeacher(); }).then(render).catch(function () { });
      });
      return;
    }
    if (act === 'reopen') {
      call('reopen', { email: t.getAttribute('data-email'), node: t.getAttribute('data-node') }).then(function () { return loadTeacher(); }).then(function () { toast('Reopened.'); render(); }).catch(function () { });
      return;
    }
    if (act === 'remove-stu') {
      var em = t.getAttribute('data-email');
      ask('Remove this student and ALL of their progress? This cannot be undone.', 'Remove student', true).then(function (ok) {
        if (ok) call('removeStudent', { email: em }).then(function () { return loadTeacher(); }).then(function () { go('#/t/dash'); }).catch(function () { });
      });
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    var act = t.getAttribute && t.getAttribute('data-act');
    if (act === 'step' || act === 'challenge') {
      var args = { node: t.getAttribute('data-node'), value: t.checked };
      if (act === 'step') args.idx = +t.getAttribute('data-idx');
      t.disabled = true;
      call(act === 'step' ? 'toggleStep' : 'setChallenge', args).then(function (res) {
        updateMe(res, t); var y = window.scrollY; S.keepScroll = true; render(); window.scrollTo(0, y);
      }).catch(function () { t.checked = !t.checked; t.disabled = false; });
    }
    if (act === 't-class') { S.tClass = t.value; S.view = null; render(); }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute && t.getAttribute('data-act') === 'gate') {
      var f = t.closest('form');
      f.querySelector('.gate-val').textContent = t.value;
      f.querySelector('.gate-name').textContent = '(' + tierName(+t.value) + ')';
    }
  });
  document.addEventListener('input', function (e) {
    var gf = e.target.closest && e.target.closest('form[data-form="gc-post"]');
    if (!gf || e.target.getAttribute('data-act') !== 'gc-name') return;
    var pv = document.getElementById('gc-preview'); if (pv) pv.textContent = gcLabel(gf.elements.word.value, gf.elements.unit.value, 3) + ': ' + title('t3');
    gf.querySelectorAll('.gc-num').forEach(function (el, i) { el.textContent = (gf.elements.unit.value.trim() ? gf.elements.unit.value.trim() + '.' : '') + (i + 1); });
  });
  document.addEventListener('change', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('data-act') === 'cs-quest') csSave({ raceQuest: e.target.value }).catch(function () { });
  });
  ['input', 'change'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { var z = e.target.closest && e.target.closest('.lockzone'); if (z) { if (e.target.type === 'checkbox' && ev === 'change') SQ_SOUND.play('tap'); lockUpdate(z); } });
  });
  document.addEventListener('submit', function (e) {
    var f = e.target, kind = f.getAttribute('data-form');
    if (!kind) return;
    e.preventDefault();
    var fd = new FormData(f), v = {};
    fd.forEach(function (val, k) { v[k] = val; });
    var btn = e.submitter || f.querySelector('button');
    if (btn) btn.disabled = true;
    var done = function () { if (btn) btn.disabled = false; };
    var p;
    var lockBtn = f.querySelector('[aria-disabled="true"]');
    if (lockBtn) { if (btn) btn.disabled = false; lockedClick(lockBtn); return; }
    if (kind === 'data-merge') { S.mergeSheet = v.sheet; p = call('dataMerge', { sheet: v.sheet, apply: false }).then(function (res) { S.mergePreview = res; render(); }); }
    else if (kind === 'data-reconnect') p = call('dataReconnect', { sheet: v.sheet }).then(function (d) { toast('Reconnected: ' + d.current.students + ' students found. Reloading…'); S = { boot: null, avatarTab: 'hair' }; boot(); });
    else if (kind === 'display') p = call('setDisplay', { display: displayFrom(v) }).then(function (res) { S.me = res.student; closeModal(); render(); toast('Display settings saved'); });
    else if (kind === 'stu-display') p = call('updateStudent', { email: f.getAttribute('data-email'), display: displayFrom(v) }).then(function () { return loadTeacher(); }).then(function () { toast('Display settings saved for this student'); render(); });
    else if (kind === 'bug') p = call('reportBug', { text: v.text, where: bugWhere(), info: bugInfo() }).then(function () { closeModal(); S.bugs = null; toast('<svg class="i"><use href="#i-check"/></svg> Thanks! Your report was sent to your teacher.'); });
    else if (kind === 'ask-help') p = call('askHelp', { node: f.getAttribute('data-node'), step: /^\d+$/.test(f.getAttribute('data-step')) ? +f.getAttribute('data-step') : (f.getAttribute('data-step') || null), note: v.note }).then(function (res) {
      S.help = res.help; closeModal(); SQ_SOUND.play('pop'); toast('<span class="t-ico">✋</span><div><b>Help is on the way!</b><br>Keep trying while you wait.</div>'); S.keepScroll = true; var y9 = window.scrollY; render(); window.scrollTo(0, y9);
    });
    else if (kind === 'confusing') {
      if (!v.reason) { toast('Pick one reason first.'); done(); return; }
      p = call('flagConfusing', { node: f.getAttribute('data-node'), kind: f.getAttribute('data-kind'), idx: +f.getAttribute('data-idx'), reason: v.reason, note: v.note }).then(function (res) {
        S.me = res.student; closeModal(); SQ_SOUND.play('equip'); toast('Thanks! Your teacher will see this.'); S.keepScroll = true; var y10 = window.scrollY; render(); window.scrollTo(0, y10);
      });
    }
    else if (kind === 'rate') {
      if (!v.rating) { SQ_SOUND.play('buzz'); toast('Pick a face first.'); done(); return; }
      p = call('rateLesson', { node: f.getAttribute('data-node'), rating: +v.rating, hardest: v.hardest, change: v.change }).then(function (res) {
        updateMe(res, btn); toast('Thanks for the rating! It helps make the quests better.'); S.keepScroll = true; var y11 = window.scrollY; render(); window.scrollTo(0, y11);
      });
    }
    else if (kind === 'join') p = call('joinClass', v).then(function (res) { S.me = res.student; S.cls = res.cls; go('#/avatar'); toast('<svg class="i"><use href="#i-sparkles"/></svg> Welcome to ' + esc(res.cls.name) + '!'); });
    else if (kind === 'submit') p = call('submitLesson', { node: f.getAttribute('data-node'), link: v.link, reflection: v.reflection }).then(function (res) {
      updateMe(res, btn);
      var st = res.student.state.nodes[f.getAttribute('data-node')].status;
      if (st === 'submitted') SQ_FX.sent({ title: title(f.getAttribute('data-node')) });
      render();
    });
    else if (kind === 'create-class') p = call('createClass', v).then(function (res) { return loadTeacher().then(function () { S.tClass = res.cls.id; toast('Class created! Code: <b>' + esc(res.cls.code) + '</b>'); go('#/t/dash'); }); });
    else if (kind === 'arc-set') { var aid = f.getAttribute('data-id'); S.arcMin = +v.minutes; p = call('setArcade', { classId: aid, passMin: +v.passMin, ticketPrice: +v.ticketPrice, questsPerTicket: +v.questsPerTicket }).then(function () { return loadTeacher(); }).then(function () { toast('Arcade settings saved'); render(); }); }
    else if (kind === 'class-set') {
      var patch = { name: v.name, openThrough: +v.openThrough, classGoal: +v.classGoal, requireApproval: !!v.requireApproval, requireLink: !!v.requireLink, showLeaderboard: !!v.showLeaderboard, archived: !!v.archived, sounds: !!v.sounds, shop: !!v.shop, stepSec: +v.stepSec, quizWait: +v.quizWait, nudgeSec: +v.nudgeSec, inOrder: !!v.inOrder };
      p = call('updateClass', { id: f.getAttribute('data-id'), patch: patch }).then(function () { return loadTeacher(); }).then(function () { toast('<svg class="i"><use href="#i-check-circle"/></svg> Saved'); render(); });
    } else if (kind === 'review') {
      var approve = btn && btn.value === '1';
      p = call('review', { email: f.getAttribute('data-email'), node: f.getAttribute('data-node'), approve: approve, feedback: v.feedback }).then(function () { return loadTeacher(); }).then(function () { toast(approve ? '<svg class="i"><use href="#i-check-circle"/></svg> Approved' : '<svg class="i"><use href="#i-undo"/></svg> Sent back'); render(); });
    } else if (kind === 'cs-setup') {
      var fsel = R.NODES.filter(function (n) { return v['f_' + n.id]; }).map(function (n) { return n.id; }).slice(0, 4);
      var T2 = S.csDraft.teams.map(function (t, i) { var inp = f.querySelector('[data-tname="' + i + '"]'); return { name: inp ? inp.value : t.name, color: t.color }; });
      var tOf = {};
      Array.prototype.forEach.call(f.querySelectorAll('[data-temail]'), function (sel) { if (sel.value !== '') tOf[sel.getAttribute('data-temail')] = 'tm' + sel.value; });
      p = csSave({ agenda: v.agenda, question: v.question, focus: fsel, showWins: !!v.showWins, showHelpers: !!v.showHelpers, dark: !!v.dark }, { teams: T2, teamOf: tOf }).then(function () { closeModal(); toast('<svg class="i"><use href="#i-monitor"/></svg> Screen updated'); });
    } else if (kind === 'gc-import') p = gcImport(f.getAttribute('data-course'), v.classId, v.nameStyle);
    else if (kind === 'gc-post') {
      var tiers = []; for (var tt = 1; tt <= R.MAX_TIER; tt++) if (v['t' + tt]) tiers.push(tt);
      if (!tiers.length) { toast('Tick at least one quest to post.'); done(); return; }
      p = call('classroomPost', { classId: f.getAttribute('data-class'), tiers: tiers, publish: !!v.publish, points: v.points, due: v.due, topic: v.topic, unit: v.unit, word: v.word }).then(function (r) {
        var n = r.results.filter(function (x) { return x.posted; }).length;
        toast('<svg class="i"><use href="#i-upload"/></svg> Posted ' + n + ' quest' + (n === 1 ? '' : 's') + ' to Classroom' + (v.publish ? '' : ' as drafts') + '.');
        return loadTeacher().then(render);
      });
    } else if (kind === 'delete-class') p = call('deleteClass', { id: f.getAttribute('data-id'), confirm: v.confirm }).then(function (r) {
      toast('<svg class="i"><use href="#i-trash"/></svg> Deleted the class and ' + r.removed + ' student records.'); S.tClass = null; return loadTeacher().then(render);
    });
    else if (kind === 'starter') p = call('setStarter', { node: f.getAttribute('data-node'), url: v.url }).then(function (res) { S.boot.settings = res.settings; toast('<svg class="i"><use href="#i-briefcase"/></svg> Starter link saved'); });
    else if (kind === 'accom') p = call('updateStudent', { email: f.getAttribute('data-email'), accom: { coreOnly: !!v.coreOnly, autoRead: !!v.autoRead, note: v.note } }).then(function () { return loadTeacher(); }).then(function () { toast('<svg class="i"><use href="#i-blocks"/></svg> Accommodations saved'); render(); });
    else if (kind === 'video') p = call('setVideo', { node: f.getAttribute('data-node'), url: v.url }).then(function (res) { S.boot.settings = res.settings; toast('<svg class="i"><use href="#i-video"/></svg> Video saved'); });
    else if (kind === 'award') {
      if (!v.badge) { toast('Pick a badge first.'); done(); return; }
      p = call('award', { email: f.getAttribute('data-email'), badge: v.badge, note: v.note }).then(function () { return loadTeacher(); }).then(function () { toast('<svg class="i"><use href="#i-award"/></svg> Badge given!'); render(); });
    } else if (kind === 'bonus') p = call('bonus', { email: f.getAttribute('data-email'), amount: +v.amount, note: v.note }).then(function () { return loadTeacher(); }).then(function () { toast('<svg class="i"><use href="#i-star"/></svg> XP added'); render(); });
    else if (kind === 'stu-edit') p = call('updateStudent', { email: f.getAttribute('data-email'), name: v.name, classId: v.classId }).then(function () { return loadTeacher(); }).then(function () { toast('Saved'); render(); });
    if (p) p.then(done, done);
  });
  window.addEventListener('hashchange', function () {
    var r = route();
    if (r[0] !== 'avatar') S.avatarDraft = null;
    if (r[0] === 'quest' && S.card) delete S.card[r[1]];
    if (r[0] === 'map' || r[0] === '') S.scrolled = false;
    // refresh the student's own data occasionally so teacher approvals show up
    if (S.me && !isTeacher() && (r[0] === 'map' || r[0] === '')) {
      API.call('bootstrap').then(function (b) { var before = prof(); S.boot = b; if (b.student) { S.me = b.student; S.cls = b.cls; celebrate(before, S.me.profile, null, true); } render(); }).catch(render);
      return;
    }
    if (r[0] === 't' && (r[1] === 'dash' || r[1] === 'review') && S.teacher) { loadTeacher().then(render); return; }
    render();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  if (window.SQ_BROKEN) { /* a page file was cut off; the Index page already shows which one */ }
  else if (API.loadLessons && !Object.keys(L).length) {
    API.loadLessons(function (data) { Object.keys(data || {}).forEach(function (k) { L[k] = data[k]; }); boot(); },
      function (e) { $app.innerHTML = '<div class="card narrow center"><h2>Could not load the lessons</h2><p>' + esc(e && e.message || e) + '</p><button class="btn primary" onclick="location.reload()">Try again</button></div>'; });
  } else boot();
})();
