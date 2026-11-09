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
  function floatXP(n, el) {
    if (!n) return;
    var f = document.createElement('div');
    f.className = 'xp-float' + (n < 0 ? ' neg' : '');
    f.textContent = (n > 0 ? '+' : '') + n + ' XP';
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
    try { scratchblocks.renderMatching('pre.blocks', { style: 'scratch3', languages: ['en'], scale: 0.85 }); } catch (e) { /* show as text */ }
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

  // Celebrate whatever changed between two profiles
  function celebrate(before, after, el) {
    if (!before || !after) return;
    var gain = after.xp - before.xp;
    floatXP(gain, el);
    after.badges.forEach(function (b) {
      if (before.badges.indexOf(b) < 0) {
        var B = R.BADGE[b];
        toast('<span class="t-ico">' + B.icon + '</span><div><b>Badge earned: ' + esc(B.name) + '</b><br>' + esc(B.desc) + '</div>', 't-badge');
      }
    });
    var newly = A.allUnlockables().filter(function (u) { return !A.isUnlocked(u.unlock, before) && A.isUnlocked(u.unlock, after); });
    if (after.level > before.level) {
      confetti();
      modal('<div class="levelup"><div class="lv-burst">LEVEL ' + after.level + '</div><h2>Level up!</h2><p>You are now a <b>' + esc(after.rank) + '</b>.</p>' +
        (newly.length ? '<p>New avatar items unlocked:</p><div class="unlock-row">' + newly.map(function (u) { return '<span class="chip"><svg class="i"><use href="#i-unlock"/></svg> ' + esc(u.name) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="row center"><button class="btn primary" data-act="close-modal">Keep questing!</button>' +
        (newly.length ? '<a class="btn" href="#/avatar" data-act="close-modal">Try them on</a>' : '') + '</div></div>', 'center');
    } else if (newly.length) {
      newly.forEach(function (u) { toast('<span class="t-ico"><svg class="i"><use href="#i-unlock"/></svg></span><div><b>Unlocked: ' + esc(u.name) + '</b><br>Equip it in My Avatar!</div>', 'unlock'); });
    }
  }
  function updateMe(res, el) {
    if (!res || !res.student) return;
    var before = prof();
    S.me = res.student;
    celebrate(before, S.me.profile, el);
  }

  // ------------------------------------------------------------ boot
  document.body.insertAdjacentHTML('afterbegin', SQ_ICONS.sprite);
  function boot() {
    window.__sqStarted = true;
    $app.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your quest…</div>';
    API.call('bootstrap').then(function (b) {
      S.boot = b; S.me = b.student; S.cls = b.cls;
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
        ['#/t/map', '<svg class="i"><use href="#i-map"/></svg>', 'Class Map'], ['#/t/lessons', '<svg class="i"><use href="#i-library"/></svg>', 'Lessons'], ['#/t/standards', '<svg class="i"><use href="#i-ruler"/></svg>', 'Standards'], ['#/t/classroom', '<svg class="i"><use href="#i-school"/></svg>', 'Classroom'], ['#/t/classes', '<svg class="i"><use href="#i-sliders"/></svg>', 'Classes']];
    } else {
      tabs = [['#/map', '<svg class="i"><use href="#i-map"/></svg>', 'Quest Map'], ['#/avatar', '<svg class="i"><use href="#i-palette"/></svg>', 'My Avatar'], ['#/badges', '<svg class="i"><use href="#i-award"/></svg>', 'Badges'], ['#/class', '<svg class="i"><use href="#i-users"/></svg>', 'My Class']];
    }
    var cur = location.hash || '#/map';
    var html = '<header class="top"><a class="logo" href="' + (isTeacher() && r === 't' ? '#/t/dash' : '#/map') + '"><span class="logo-ico"><svg class="i"><use href="#i-compass"/></svg></span><span>Scratch<b>Quest</b></span></a><nav class="tabs">';
    tabs.forEach(function (t) {
      var active = cur.indexOf(t[0]) === 0 || (t[0] === '#/map' && cur.indexOf('#/quest') === 0);
      html += '<a href="' + t[0] + '" class="' + (active ? 'on' : '') + '"><span aria-hidden="true">' + t[1] + '</span> <span class="tl">' + t[2] + '</span></a>';
    });
    html += '</nav><div class="me">';
    if (isTeacher()) {
      html += r === 't'
        ? (S.me ? '<a class="btn small ghost" href="#/map"><svg class="i"><use href="#i-eye"/></svg> Student view</a>' : '<button class="btn small ghost" data-act="teacher-try"><svg class="i"><use href="#i-eye"/></svg> Try as student</button>')
        : '<a class="btn small ghost" href="#/t/dash"><svg class="i"><use href="#i-school"/></svg> Teacher view</a>';
    }
    if (p && r !== 't') {
      var pct = Math.min(100, Math.round((p.xp - p.levelStart) / (p.levelNext - p.levelStart) * 100));
      html += '<a class="me-card" href="#/badges" title="' + fmtN(p.xp) + ' XP"><span class="me-av">' + A.svg(S.me.state.avatar, 40) + '</span>' +
        '<span class="me-info"><span class="me-lv">Lv ' + p.level + ' · ' + esc(p.rank) + '</span><span class="xpbar"><i style="width:' + pct + '%"></i></span>' +
        '<span class="me-xp">' + fmtN(p.xp) + ' XP</span></span></a>';
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
    csStop(); document.body.classList.remove('cs-on');
    var r = route();
    if (!S.boot) return;
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
    else body = viewMap();
    $app.innerHTML = header() + '<main>' + body + '</main>';
    afterRender(r);
  }
  function afterRender(r) {
    renderBlocks();
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
    html += '<div class="card hello"><div class="hello-av">' + A.svg(st.avatar, 84) + '</div><div><h2>Hi, ' + esc(S.me.name) + '!</h2><p class="muted">' + esc(S.cls.name) + '</p>' +
      '<p><b>' + p.doneCount + '</b> quests done · <b>' + p.badges.length + '</b> badges</p></div></div>';
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
    // regions
    var labels = [];
    function region(x, y, w, h, b, label) {
      var B = R.BRANCHES[b];
      o.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="18" fill="' + B.color + '" class="region"/>');
      labels.push('<use href="#i-' + SQ_ICONS.BR[b] + '" x="' + (x + 22) + '" y="' + (y + 20) + '" width="26" height="26" class="region-ico" style="color:' + B.color + '"/>' +
        '<text x="' + (x + 56) + '" y="' + (y + 40) + '" class="region-label" fill="' + B.color + '">' + esc(label || B.name) + '</text>');
    }
    region(250, 30, 500, 600, 'trunk');
    region(40, 640, 290, 300, 'games'); region(355, 640, 290, 300, 'stories'); region(670, 640, 290, 300, 'apps');
    region(250, 955, 500, 270, 'merge');
    region(40, 1275, 290, 300, 'games', 'Arcade Peaks II'); region(355, 1275, 290, 300, 'stories', 'Story Woods II'); region(670, 1275, 290, 300, 'apps', 'Gadget Bay II');
    region(250, 1590, 500, 370, 'finale');
    deco(o);
    // edges
    R.NODES.forEach(function (n) {
      (n.requires || []).concat(n.requiresAny || []).forEach(function (pid) {
        var p = R.NODE[pid];
        var done = state && R.isDone(state, pid) && (R.isDone(state, n.id) || R.prereqsMet(state, n.id));
        var my = (n.y - p.y) / 2;
        o.push('<path d="M' + p.x + ',' + p.y + ' C' + p.x + ',' + (p.y + my) + ' ' + n.x + ',' + (n.y - my) + ' ' + n.x + ',' + n.y + '" class="edge' + (done ? ' lit' : '') + '" stroke="' + (done ? R.BRANCHES[n.branch].color : '') + '"/>');
      });
    });
    o.push(labels.join(''));
    // forks
    o.push('<text x="500" y="626" class="fork-label" text-anchor="middle">Choose your path</text>');
    o.push('<text x="500" y="1258" class="fork-label" text-anchor="middle">Choose again: same path or a new one</text>');
    var meId = state ? R.currentNode(state) : null;
    // nodes
    R.NODES.forEach(function (n) {
      var B = R.BRANCHES[n.branch];
      var s = state ? R.nodeStatus(state, n.id, openThrough) : (n.tier > openThrough ? 'gated' : 'available');
      var cls = 'node s-' + s + (n.id === meId ? ' current' : '');
      var clickable = state ? (s !== 'locked') : true;
      var href = state ? '#/quest/' + n.id : '#/t/lesson/' + n.id;
      o.push('<a ' + (clickable ? 'href="' + href + '"' : 'data-act="locked" data-node="' + n.id + '"') + ' class="' + cls + '" tabindex="0"><title>' + esc(title(n.id)) + ' — ' + statusWord(s) + '</title>');
      o.push('<circle cx="' + n.x + '" cy="' + n.y + '" r="40" class="node-ring" stroke="' + B.color + '"/>');
      o.push('<circle cx="' + n.x + '" cy="' + (n.y + 4) + '" r="32" class="node-shadow"/>');
      o.push('<circle cx="' + n.x + '" cy="' + n.y + '" r="32" class="node-core"' + (s === 'locked' || s === 'gated' ? '' : ' style="fill:' + B.color + '"') + '/>');
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
  function deco(o) {
    // a few friendly landmarks (purely decorative)
    function tree(x, y, s) { o.push('<g class="deco" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><rect x="-4" y="0" width="8" height="18" fill="#8b5a2b"/><circle cy="-8" r="18" fill="#3fae5a"/><circle cx="-10" cy="2" r="12" fill="#56c271"/></g>'); }
    function mountain(x, y, s) { o.push('<g class="deco" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-40,20 L0,-35 L40,20 Z" fill="#f2a07b"/><path d="M-12,-18 L0,-35 L12,-18 L4,-14 L0,-20 L-5,-14 Z" fill="#fff"/></g>'); }
    function gear(x, y, s) { o.push('<g class="deco" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><circle r="16" fill="none" stroke="#7fb8ef" stroke-width="9" stroke-dasharray="7 5"/><circle r="6" fill="#7fb8ef"/></g>'); }
    function book(x, y, s) { o.push('<g class="deco" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-22,-12 Q-11,-18 0,-12 Q11,-18 22,-12 V14 Q11,8 0,14 Q-11,8 -22,14 Z" fill="#c9a6ef"/><path d="M0,-12 V14" stroke="#9a5cd6" stroke-width="2"/></g>'); }
    function crystal(x, y, s) { o.push('<g class="deco" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M0,-24 L12,0 L0,20 L-12,0 Z" fill="#f4d67a"/><path d="M0,-24 L12,0 L0,4 Z" fill="#fbe9a8"/></g>'); }
    tree(300, 160, 1.1); tree(700, 250, 1); tree(310, 470, .9); tree(690, 520, 1.2);
    mountain(90, 800, .9); mountain(280, 920, .7); mountain(90, 1435, .8); mountain(280, 1550, .7);
    book(410, 800, .9); book(600, 920, .8); book(410, 1435, .8); book(600, 1550, .8);
    gear(730, 800, .9); gear(910, 920, .8); gear(730, 1435, .9); gear(910, 1550, .8);
    crystal(320, 1090, 1); crystal(680, 1180, .9); crystal(660, 1020, .7);
    o.push('<g class="deco" transform="translate(660,1850)"><rect x="-40" y="-30" width="80" height="60" fill="#f4a9c4"/><rect x="-52" y="-52" width="24" height="82" fill="#ec7fa9"/><rect x="28" y="-52" width="24" height="82" fill="#ec7fa9"/><path d="M-56,-52 L-40,-74 L-24,-52 Z M24,-52 L40,-74 L56,-52 Z" fill="#e0457b"/><rect x="-10" y="4" width="20" height="26" rx="10" fill="#9b2c5a"/><path d="M40,-74 V-92 L56,-86 L40,-80" fill="#facc15"/></g>');
  }
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
      h += '<div class="banner sub"><svg class="i"><use href="#i-eye"/></svg> Teacher preview — this is what students see. <b>Teacher notes:</b> ' + esc(Ls.teacherNotes || '') + '</div>' + stdFull(id);
    }

    h += '<div class="quest-grid"><div class="quest-main">';
    if (video) h += '<section class="card"><h2><svg class="i"><use href="#i-video"/></svg> Watch first</h2>' + videoEmbed(video) + '</section>';
    h += '<section class="card goal"><h2><svg class="i"><use href="#i-target"/></svg> Your mission</h2><p>' + esc(Ls.goal) + '</p>' + (Ls.warmup ? '<div class="warmup"><b>Warm-up:</b> ' + esc(Ls.warmup) + '</div>' : '') + '</section>';
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
    var k = Math.max(0, Math.min(cards.length - 1, S.card[id])), c = cards[k];

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
      '<button class="btn small ghost" data-act="split-help" title="Put Scratch and this side by side"><svg class="i"><use href="#i-columns"/></svg></button></div></div>';
    h += '<div class="dots" role="tablist">';
    cards.forEach(function (cc, j) {
      var stretch = cc.type === 'step' && Ls.steps[cc.i].stretch;
      var lbl = cc.type === 'intro' ? '<svg class="i"><use href="#i-target"/></svg>' : cc.type === 'primer' ? '<svg class="i"><use href="#i-sparkles"/></svg>' : cc.type === 'step' ? String(cc.i + 1) : cc.type === 'quiz' ? '?' : cc.type === 'challenge' ? '<svg class="i"><use href="#i-zap"/></svg>' : '<svg class="i"><use href="#i-send"/></svg>';
      h += '<button class="dot' + (j === k ? ' now' : '') + (cardDone(cc) ? ' done' : '') + (stretch ? ' stretch' : '') + ' t-' + cc.type + '" data-act="card" data-node="' + id + '" data-to="' + j + '" aria-label="Card ' + (j + 1) + (stretch ? ' (stretch)' : '') + '">' + lbl + '</button>';
    });
    h += '</div>';
    if (readOnly) h += '<div class="banner lock small">' + (status === 'locked' ? '<svg class="i"><use href="#i-lock"/></svg> Locked. ' + esc(lockedReason(id)) : '<svg class="i"><use href="#i-clock"/></svg> Your teacher hasn\'t opened this yet.') + ' You can peek!</div>';
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
        (s.solo ? '<details class="p-more solo"><summary><svg class="i"><use href="#i-user"/></svg> No partner free right now?</summary><p class="say">' + s.solo + '</p></details>' : '') + '</div>';
      if (readOnly || frozen) h += '<div class="p-nav">' + backBtn + (nextBtn || '<span></span>') + '</div>';
      else if (on) h += '<div class="p-done"><svg class="i"><use href="#i-check-circle"/></svg> Done! <button class="linklike" data-act="undo-step" data-node="' + id + '" data-idx="' + c.i + '">undo</button></div><div class="p-nav">' + backBtn + nextBtn + '</div>';
      else h += '<div class="p-nav">' + backBtn + '<span class="row">' + (s.stretch ? '<button class="btn ghost" data-act="card" data-node="' + id + '" data-to="' + (k + 1) + '">Skip</button>' : '') +
        '<button class="btn primary big" data-act="did-step" data-node="' + id + '" data-idx="' + c.i + '"><svg class="i"><use href="#i-check-circle"/></svg> I did it! <small>+' + R.XP.step + ' XP</small></button></span></div>';
    } else if (c.type === 'quiz') {
      var q = Ls.quiz[c.i], r = ns.quiz[c.i], right = r && r.correct;
      h += '<div class="quiz' + (right ? ' right' : '') + '" id="q-' + c.i + '"><div class="p-kicker">Quick check ' + (c.i + 1) + ' of ' + Ls.quiz.length + (q.blocks ? ' · <svg class="i"><use href="#i-eye"/></svg> Predict' : '') + '</div><h2 class="p-h say">' + esc(q.q) + '</h2>' +
        (q.blocks ? '<pre class="blocks">' + esc(q.blocks) + '</pre>' : '') + '<div class="choices big">';
      q.choices.forEach(function (ch, ci) {
        h += '<button class="choice' + (right && ci === q.answer ? ' correct' : '') + '" data-act="quiz" data-node="' + id + '" data-q="' + c.i + '" data-c="' + ci + '"' + (right || readOnly ? ' disabled' : '') + '>' + esc(ch) + '</button>';
      });
      h += '</div>' + (right ? '<p class="explain say"><svg class="i"><use href="#i-check-circle"/></svg> ' + esc(q.explain) + (r.firstTry ? ' <span class="chip gold">First try!</span>' : '') + '</p>' : '<p class="explain" hidden></p>') + '</div>';
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
          '<div class="p-nav center"><a class="btn primary big" href="#/map">Back to the map <svg class="i"><use href="#i-arrow-right"/></svg></a></div>';
      } else if (status === 'submitted') {
        h += '<div class="p-celebrate"><svg class="i"><use href="#i-send"/></svg></div><h2 class="p-h center say">Turned in!</h2><p class="p-big center say">Your teacher will check it soon. You can start another quest.</p><div class="p-nav center"><a class="btn primary big" href="#/map">Back to the map <svg class="i"><use href="#i-arrow-right"/></svg></a></div>';
      } else if (readOnly) {
        h += '<h2 class="p-h">Turn it in</h2><p class="p-big">You can turn this in once the quest is open.</p><div class="p-nav">' + backBtn + '<span></span></div>';
      } else if (stepsLeft || quizLeft) {
        h += '<h2 class="p-h say">Almost there!</h2><p class="p-big say">Finish ' + (stepsLeft ? stepsLeft + ' more step' + (stepsLeft > 1 ? 's' : '') : '') + (stepsLeft && quizLeft ? ' and ' : '') + (quizLeft ? quizLeft + ' quick check' + (quizLeft > 1 ? 's' : '') : '') + ' first.</p>' +
          '<div class="p-nav">' + backBtn + '<button class="btn primary big" data-act="card" data-node="' + id + '" data-to="' + firstOpenCard(id) + '">Show me <svg class="i"><use href="#i-arrow-right"/></svg></button></div>';
      } else {
        h += '<div class="p-kicker">Last step!</div><h2 class="p-h say"><svg class="i"><use href="#i-send"/></svg> Turn in your quest</h2>' +
          (Ls.checklist ? '<div class="checklist"><b class="say">Check your project has:</b>' + Ls.checklist.map(function (x, j) { return '<label class="check small-check"><input type="checkbox"><span class="box"></span><span class="say">' + esc(x) + '</span></label>'; }).join('') + '</div>' : '') +
          '<p class="p-text say">' + esc(Ls.submit) + '</p>' +
          '<form data-form="submit" data-node="' + id + '"><label>Paste your Scratch link ' + (S.cls.requireLink ? '' : '<span class="muted">(or just show your teacher)</span>') + '<input name="link" type="url" placeholder="https://scratch.mit.edu/projects/…" value="' + esc(ns.link || '') + '"></label>' +
          '<label>One thing you\'re proud of <span class="muted">(optional)</span><input name="reflection" maxlength="300" value="' + esc(ns.reflection || '') + '"></label>' +
          '<div class="p-nav">' + backBtn + '<button class="btn primary big">' + (status === 'returned' ? 'Turn in again' : 'Turn it in!') + ' <small>+' + R.XP.lesson + ' XP</small></button></div></form>';
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
    var v = pickVoice(); if (v) u.voice = v;
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
  var AV_TABS = [['hair', 'Hair'], ['eyes', 'Eyes'], ['mouth', 'Mouth'], ['outfit', 'Outfit'], ['hat', 'Hats'], ['extra', 'Extras'], ['pet', 'Pets'], ['bg', 'Background'], ['frame', 'Frame']];
  var AV_COLOR_FOR = { hair: 'hairColor', outfit: 'outfitColor', bg: 'bgColor' };
  function viewAvatar() {
    var p = prof();
    if (!S.avatarDraft) S.avatarDraft = JSON.parse(JSON.stringify(S.me.state.avatar || A.DEFAULT));
    var d = S.avatarDraft, tab = S.avatarTab;
    var h = '<div class="avatar-page"><div class="card av-preview"><h1>' + (S.me.state.avatarSet ? 'My Avatar' : 'Create your hero!') + '</h1><div class="av-big">' + A.svg(d, 240, { title: 'Your avatar' }) + '</div>' +
      '<div class="row center"><button class="btn" data-act="av-random"><svg class="i"><use href="#i-dice"/></svg> Surprise me</button><button class="btn primary" data-act="av-save"><svg class="i"><use href="#i-save"/></svg> Save avatar</button></div>' +
      '<p class="muted small center">Level up and earn badges to unlock more items. <svg class="i"><use href="#i-lock"/></svg> items show how to get them.</p></div>';
    h += '<div class="card av-editor"><div class="av-tabs">' + AV_TABS.map(function (t) { return '<button class="' + (t[0] === tab ? 'on' : '') + '" data-act="av-tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
    if (tab === 'hair' || tab === 'eyes' || tab === 'mouth') {
      // skin lives on the first tab group
      h += '<div class="av-sub">Skin</div><div class="swatches">' + A.COLORS.skin.slice(0, 8).map(function (c) { return swatch('skin', c, d.skin === c, true); }).join('') + '</div>';
      h += '<div class="av-sub">Fantasy skin </div><div class="swatches">' + A.COLORS.skin.slice(8).map(function (c) { return swatch('skin', c, d.skin === c, true); }).join('') + '</div>';
    }
    var colorKey = AV_COLOR_FOR[tab];
    if (colorKey) {
      h += '<div class="av-sub">' + ({ hairColor: 'Hair color', outfitColor: 'Outfit color', bgColor: 'Background color' })[colorKey] + '</div><div class="swatches">' + A.COLORS[colorKey].map(function (c) {
        return swatch(colorKey, c, d[colorKey] === c, A.isUnlocked(A.COLOR_UNLOCK[c], p));
      }).join('') + '</div>';
    }
    h += '<div class="av-sub">Style</div><div class="av-grid">';
    A.CATALOG[tab].forEach(function (item) {
      var ok = A.isUnlocked(item.unlock, p);
      var test = JSON.parse(JSON.stringify(d)); test[tab] = item.id;
      h += '<button class="av-opt' + (d[tab] === item.id ? ' on' : '') + (ok ? '' : ' locked') + '" data-act="av-pick" data-cat="' + tab + '" data-id="' + item.id + '"' + (ok ? '' : ' aria-disabled="true"') + ' title="' + esc(ok ? item.name : A.unlockText(item.unlock)) + '">' +
        A.svg(test, 84) + '<span>' + esc(item.name) + '</span>' + (ok ? '' : '<em><svg class="i"><use href="#i-lock"/></svg> ' + esc(A.unlockText(item.unlock)) + '</em>') + '</button>';
    });
    h += '</div></div></div>';
    return h;
  }
  function swatch(key, c, on, ok) {
    var bg = c === 'neon' ? 'linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5)' : c;
    return '<button class="sw' + (on ? ' on' : '') + (ok ? '' : ' locked') + '" style="background:' + bg + '" data-act="av-color" data-key="' + key + '" data-c="' + c + '" title="' + (ok ? c : esc(A.unlockText(A.COLOR_UNLOCK[c]))) + '" aria-label="color ' + c + '">' + (ok ? '' : '<svg class="i"><use href="#i-lock"/></svg>') + '</button>';
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
        '<b>' + esc(m.name) + '</b><span>Lv ' + m.level + ' · ' + esc(m.rank) + '</span><span class="muted small"><svg class="i"><use href="#i-pin"/></svg> ' + esc(title(m.current)) + '</span><span class="muted small"><svg class="i"><use href="#i-award"/></svg> ' + m.badges + ' · <svg class="i"><use href="#i-check"/></svg> ' + m.done.length + ' quests</span></div>';
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
    if (!S.teacher.classes.length && ['lessons', 'lesson', 'classroom', 'standards'].indexOf(page) < 0) body = tWelcome();
    else if (page === 'review') body = tReview();
    else if (page === 'map') body = tMap();
    else if (page === 'lessons') body = tLessons();
    else if (page === 'lesson' && L[r[2]]) body = viewQuest(r[2], true);
    else if (page === 'classes') body = tClasses();
    else if (page === 'standards') body = tStandards();
    else if (page === 'classroom') body = tClassroom();
    else if (page === 'student') body = tStudent(decodeURIComponent(r[2] || ''));
    else if (page === 'projector') body = tProjector();
    else if (page === 'screen') body = tScreen();
    else body = tDash();
    if (page === 'screen') { $app.innerHTML = body; document.body.classList.add('cs-on'); csStart(); return; }
    $app.innerHTML = (page === 'projector' ? '' : header()) + '<main class="' + (page === 'projector' ? 'projector' : 'teacher') + '">' + body + '</main>';
    afterRender(r);
  }
  function tWelcome() {
    return '<div class="card narrow"><h1>Welcome, teacher!</h1><h2>Option 1: Import from Google Classroom</h2><p>Bring in a class roster. Students are added automatically and don\'t need a code.</p><a class="btn primary" href="#/t/classroom"><svg class="i"><use href="#i-school"/></svg> Import from Google Classroom</a>' +
      '<h2 style="margin-top:20px">Option 2: Make a class</h2><p>You\'ll get a <b>class code</b> students type in to join.</p>' + createClassForm() + '</div>';
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
          '<p class="small">' + esc(Ls.skill) + ' · ' + esc(Ls.minutes) + ' min</p><p class="muted small">' + esc(Ls.teacherNotes || '') + '</p>' +
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
  var CS_QUESTIONS = [
    'What is one bug you fixed today? How did you find it?',
    'If your project could do one more thing, what would it be?',
    'Which block did you use the most today? Why?',
    'How could you make your project easier for someone new to use?',
    'What would happen if you changed one number in your code?',
    'Where could a loop save you some blocks?',
    'Who helped you today, and how did they help?',
    'What is something that was hard last week but feels easier now?',
    'How would you explain your code to a younger student?',
    'What is one way to test that your project works?',
    'What did you try that did not work, and what did you learn?',
    'Which of your sprites needs to reset when the green flag is clicked?'
  ];
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
    if (first || !document.getElementById('cs-teams')) {
      root.innerHTML =
        '<header class="cs-head"><div class="cs-brand"><span class="cs-logo"><svg class="i"><use href="#i-compass"/></svg></span><div><div class="cs-class" id="cs-class"></div><div class="cs-join" id="cs-join"></div></div></div>' +
        '<div class="cs-time"><div class="cs-clock"><span id="cs-clock"></span><small id="cs-ampm"></small></div><div class="cs-date" id="cs-date"></div></div>' +
        '<div class="cs-left" id="cs-left"></div>' +
        '<div class="cs-ctrl"><button class="cs-btn" data-act="cs-setup" title="Set up the screen"><svg class="i"><use href="#i-sliders"/></svg></button><button class="cs-btn" data-act="cs-full" title="Full screen"><svg class="i"><use href="#i-maximize"/></svg></button><a class="cs-btn" href="#/t/dash" title="Exit"><svg class="i"><use href="#i-x"/></svg></a></div></header>' +
        '<div class="cs-cols"><section class="cs-col"><div class="cs-card cs-mission"><h2><svg class="i"><use href="#i-target"/></svg> What to work on</h2><div id="cs-mission"></div></div>' +
        '<div class="cs-card cs-think"><h2><svg class="i"><use href="#i-message"/></svg> Think about it</h2><div id="cs-question"></div></div></section>' +
        '<section class="cs-col cs-mid"><div class="cs-card cs-teamsbox"><h2 id="cs-teams-h"><svg class="i"><use href="#i-map"/></svg> Where every team is</h2><div id="cs-teams"></div></div></section>' +
        '<section class="cs-col"><div class="cs-card cs-winsbox" id="cs-winsbox"><h2><svg class="i"><use href="#i-sparkles"/></svg> Recent wins</h2><div id="cs-wins"></div></div>' +
        '<div class="cs-card cs-helpbox" id="cs-helpbox"><h2><svg class="i"><use href="#i-help"/></svg> Who to ask for help</h2><div id="cs-help"></div></div>' +
        '<div class="cs-goal" id="cs-goal"></div></section></div>';
    }
    var d = S.cs.data, sc = d.cls.screen || {};
    csSet('cs-class', esc(d.cls.name));
    csSet('cs-join', 'Scratch Quest');
    // mission
    var agenda = (sc.agenda || CS_AGENDA).split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var focus = (sc.focus || []).filter(function (id) { return L[id]; });
    csSet('cs-mission', '<ol class="cs-agenda">' + agenda.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      (focus.length ? '<div class="cs-focus">' + focus.map(function (id) { return '<span class="cs-quest" style="--c:' + br(id).color + '">' + SQ_ICONS.branch(R.NODE[id].branch) + ' ' + esc(title(id)) + '</span>'; }).join('') + '</div>' : ''));
    var q = sc.question || (focus[0] && L[focus[0]].warmup) || CS_QUESTIONS[new Date().getDate() % CS_QUESTIONS.length];
    csSet('cs-question', '<p class="cs-q">' + esc(q) + '</p>');
    // teams (or regions if no teams are set)
    var teams = d.cls.teams || [], groups;
    if (teams.length) {
      groups = teams.map(function (t) { return { icon: teamDot(t.color), name: t.name, members: d.members.filter(function (m) { return m.team === t.id; }) }; });
      var loose = d.members.filter(function (m) { return !teams.some(function (t) { return t.id === m.team; }); });
      if (loose.length) groups.push({ icon: teamDot('#94a3b8'), name: 'Free agents', members: loose });
      csSet('cs-teams-h', '<svg class="i"><use href="#i-map"/></svg> Where every team is');
    } else {
      var byRegion = {};
      d.members.forEach(function (m) { var b = R.NODE[m.current] ? R.NODE[m.current].branch : 'trunk'; (byRegion[b] = byRegion[b] || []).push(m); });
      groups = Object.keys(R.BRANCHES).filter(function (b) { return byRegion[b]; }).map(function (b) { return { icon: '<span style="color:' + R.BRANCHES[b].color + '">' + SQ_ICONS.branch(b) + '</span>', name: R.BRANCHES[b].name, members: byRegion[b] }; });
      csSet('cs-teams-h', '<svg class="i"><use href="#i-map"/></svg> Where everyone is');
    }
    csSet('cs-teams', groups.length ? '<div class="cs-teams">' + groups.map(function (g) {
      var together = g.members.reduce(function (a, m) { return a + m.doneCount; }, 0);
      return '<div class="cs-team"><div class="cs-team-h"><span class="cs-team-ico">' + g.icon + '</span><b>' + esc(g.name) + '</b>' +
        (together ? '<span class="cs-together">' + together + ' quests done together</span>' : '') + '</div>' +
        '<ul class="cs-members">' + g.members.sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (m) {
          var cur = R.NODE[m.current];
          return '<li>' + avatarImgTag(m.avatar) + '<span class="cs-mname">' + esc(m.name) + '</span>' +
            (cur ? '<span class="cs-mq" style="--c:' + br(m.current).color + '">' + SQ_ICONS.branch(R.NODE[m.current].branch) + ' ' + esc(title(m.current)) + '</span>' : '') + '</li>';
        }).join('') + '</ul></div>';
    }).join('') + '</div>' : '<p class="cs-empty">Students will appear here once they join.</p>');
    // wins
    var wb = document.getElementById('cs-winsbox'); if (wb) wb.hidden = sc.showWins === false;
    csSet('cs-wins', d.wins.length ? '<ul class="cs-wins">' + d.wins.slice(0, 6).map(function (w) {
      return '<li>' + avatarImgTag(w.avatar) + '<span><span class="cs-wico">' + (w.kind === 'badge' ? w.icon : SQ_ICONS.ic(w.kind === 'level' ? 'star' : 'check-circle')) + '</span> <b>' + esc(w.name) + '</b> ' + esc(w.text) + '<small>' + ago(w.t) + '</small></span></li>';
    }).join('') + '</ul>' : '<p class="cs-empty">Wins will show up here as quests get finished. <svg class="i"><use href="#i-sparkles"/></svg></p>');
    // helpers
    var hb = document.getElementById('cs-helpbox'); if (hb) hb.hidden = sc.showHelpers === false;
    csSet('cs-help', d.helpers.length ? '<ul class="cs-help">' + d.helpers.map(function (h) {
      return '<li><div class="cs-hq" style="--c:' + br(h.quest).color + '">' + SQ_ICONS.branch(R.NODE[h.quest].branch) + ' Stuck on <b>' + esc(h.title) + '</b>?</div><div class="cs-hwho">Ask ' +
        h.helpers.map(function (p) { return '<span class="cs-hp">' + avatarImgTag(p.avatar, 'cs-av sm') + esc(p.name) + '</span>'; }).join(' ') + '</div></li>';
    }).join('') + '</ul><p class="cs-tip">Try 3 before me: the hint, a classmate, then the teacher.</p>' : '<p class="cs-empty">Try 3 before me: the <svg class="i"><use href="#i-bulb"/></svg> hint, a classmate, then the teacher.</p>');
    // class goal
    var goal = d.cls.classGoal;
    csSet('cs-goal', goal ? '<div class="cs-goal-l"><svg class="i"><use href="#i-target"/></svg> Class goal: <b>' + fmtN(d.classXP) + '</b> / ' + fmtN(goal) + ' XP</div><div class="cs-bar"><i style="width:' + Math.min(100, Math.round(d.classXP / goal * 100)) + '%"></i></div>' : '');
    csFit();
    csTick();
  }
  // Projector screens can't scroll: drop whole items that don't fit instead of cutting them in half.
  function csFit() {
    if (window.innerWidth <= 1100) return;
    [['cs-winsbox', '#cs-wins li'], ['cs-helpbox', '.cs-tip, #cs-help li']].forEach(function (x) {
      var card = document.getElementById(x[0]);
      if (!card || card.hidden) return;
      var items = card.querySelectorAll(x[1]);
      for (var i = items.length - 1; i >= 1 && card.scrollHeight > card.clientHeight + 2; i--) items[i].remove();
    });
    var tb = document.getElementById('cs-teams');
    if (tb) {
      var box = tb.querySelector('.cs-teams');
      if (box) {
        box.classList.remove('compact', 'tiny');
        if (tb.scrollHeight > tb.clientHeight + 2) box.classList.add('compact');
        if (tb.scrollHeight > tb.clientHeight + 2) box.classList.add('tiny');
      }
    }
  }
  window.addEventListener('resize', function () {
    if (!document.body.classList.contains('cs-on')) return;
    clearTimeout(S.csResize); S.csResize = setTimeout(function () {
      ['cs-wins', 'cs-help', 'cs-teams'].forEach(function (id) { var el = document.getElementById(id); if (el) el.__src = null; });
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
  function csStart() {
    csStop();
    csLoad(true);
    S.csTimers = [setInterval(csTick, 1000), setInterval(function () { csLoad(false); }, 20000)];
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
      '<h3><svg class="i"><use href="#i-message"/></svg> Think about it</h3><textarea name="question" rows="2" id="cs-qbox" placeholder="Leave empty to use the focus quest\'s warm-up">' + esc(sc.question || '') + '</textarea>' +
      '<div class="row"><button type="button" class="btn small" data-act="cs-q-random"><svg class="i"><use href="#i-dice"/></svg> Another question</button><button type="button" class="btn small ghost" data-act="cs-q-clear">Use the quest warm-up</button></div>' +
      '<h3>Show</h3><label class="switch"><input type="checkbox" name="showWins"' + (sc.showWins !== false ? ' checked' : '') + '> <svg class="i"><use href="#i-sparkles"/></svg> Recent wins</label>' +
      '<label class="switch"><input type="checkbox" name="showHelpers"' + (sc.showHelpers !== false ? ' checked' : '') + '> <svg class="i"><use href="#i-help"/></svg> Who to ask for help</label>' +
      '<h3><svg class="i"><use href="#i-users"/></svg> Teams</h3><div class="row"><select id="cs-nteams">' + [0, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<option value="' + n + '"' + (n === teams.length ? ' selected' : '') + '>' + (n ? n + ' teams' : 'No teams (group by map area)') + '</option>'; }).join('') + '</select>' +
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
        h += '<p class="small">Linked to <a href="' + esc(c.courseLink || 'https://classroom.google.com/') + '" target="_blank" rel="noopener">' + esc(c.courseName || 'Classroom class') + ' <svg class="i"><use href="#i-external"/></svg></a>. Each quest becomes an assignment under the topic <b>Scratch Quest</b>, with a link that opens that quest. Students still turn quests in inside Scratch Quest.</p>' +
          '<form data-form="gc-post" data-class="' + c.id + '"><div class="gc-tiers">';
        for (var t = 1; t <= R.MAX_TIER; t++) {
          var p = posted[t];
          h += '<label class="gc-tier' + (p ? ' posted' : '') + '"><input type="checkbox" name="t' + t + '"' + (p ? ' disabled' : '') + '><span class="gc-num">' + t + '</span><span class="gc-t">' + esc(tierTitleUI(t)) + '</span>' +
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
  function tierTitleUI(t) {
    var nodes = R.NODES.filter(function (n) { return n.tier === t; });
    if (nodes.length === 1) return title(nodes[0].id);
    return 'Choose a path: ' + nodes.map(function (n) { return SQ_ICONS.branch(R.NODE[n.id].branch) + ' ' + title(n.id); }).join(' / ');
  }
  function tClasses() {
    var h = '<div class="t-head"><div><h1><svg class="i"><use href="#i-sliders"/></svg> Classes</h1></div></div><div class="card">' + createClassForm() + '</div>';
    S.teacher.classes.forEach(function (c) {
      var n = S.teacher.students.filter(function (s) { return s.classId === c.id && !s.isTeacher; }).length;
      h += '<div class="card class-set' + (c.archived ? ' archived' : '') + '"><form data-form="class-set" data-id="' + c.id + '">' +
        '<div class="row between"><input name="name" value="' + esc(c.name) + '" class="h-input" maxlength="40"><div class="code-card small"><span>Code</span><b>' + esc(c.code) + '</b><button type="button" class="btn small ghost" data-act="new-code" data-id="' + c.id + '">New code</button></div></div>' +
        '<p class="muted small">' + n + ' students</p>' +
        '<label>Pacing gate — students can work up to quest tier <b class="gate-val">' + c.openThrough + '</b> <span class="muted gate-name">(' + esc(tierName(c.openThrough)) + ')</span>' +
        '<input type="range" name="openThrough" min="1" max="' + R.MAX_TIER + '" value="' + c.openThrough + '" data-act="gate"></label>' +
        '<label class="switch"><input type="checkbox" name="requireApproval"' + (c.requireApproval ? ' checked' : '') + '> Teacher approves each quest before it counts (recommended)</label>' +
        '<label class="switch"><input type="checkbox" name="requireLink"' + (c.requireLink ? ' checked' : '') + '> Require a Scratch project link to turn in</label>' +
        '<label class="switch"><input type="checkbox" name="showLeaderboard"' + (c.showLeaderboard ? ' checked' : '') + '> Show an XP leaderboard to students (off = alphabetical hall)</label>' +
        '<label>Class XP goal (shared team goal; 0 = hide) <input type="number" name="classGoal" min="0" step="500" value="' + c.classGoal + '"></label>' +
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
        if (res.correct) { updateMe(res, t); S.keepScroll = true; render(); }
        else {
          t.classList.add('wrong'); t.disabled = true;
          var box = t.closest('.quiz').querySelector('.explain');
          box.hidden = false; box.textContent = '<svg class="i"><use href="#i-x"/></svg> Not quite — reread the steps above and try again!';
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
      call(isStep ? 'toggleStep' : 'setChallenge', a2).then(function (res) {
        updateMe(res, t);
        if (did) { S.card = S.card || {}; S.card[nd] = (S.card[nd] || 0) + 1; }
        render();
      }).catch(function () { t.disabled = false; });
      return;
    }
    if (act === 'av-tab') { S.avatarTab = t.getAttribute('data-tab'); S.keepScroll = true; render(); return; }
    if (act === 'av-pick' || act === 'av-color') {
      if (t.classList.contains('locked')) { toast('<svg class="i"><use href="#i-lock"/></svg> ' + esc(t.getAttribute('title'))); return; }
      if (act === 'av-pick') S.avatarDraft[t.getAttribute('data-cat')] = t.getAttribute('data-id');
      else S.avatarDraft[t.getAttribute('data-key')] = t.getAttribute('data-c');
      var y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    if (act === 'av-random') {
      var p = prof(), rnd = A.randomAvatar();
      // random from unlocked items only
      Object.keys(A.CATALOG).forEach(function (cat) {
        var ok = A.CATALOG[cat].filter(function (i) { return A.isUnlocked(i.unlock, p); });
        rnd[cat] = ok[Math.floor(Math.random() * ok.length)].id;
      });
      rnd.skin = A.COLORS.skin[Math.floor(Math.random() * A.COLORS.skin.length)];
      S.avatarDraft = rnd; var y2 = window.scrollY; render(); window.scrollTo(0, y2); return;
    }
    if (act === 'av-save') {
      var first = !S.me.state.avatarSet;
      call('saveAvatar', { avatar: S.avatarDraft }).then(function (res) {
        updateMe(res, t); S.avatarDraft = null;
        toast('<svg class="i"><use href="#i-save"/></svg> Avatar saved!');
        if (first) { var pq = S.pendingQuest; S.pendingQuest = null; go(pq && L[pq] ? '#/quest/' + pq : '#/map'); } else render();
      }).catch(function () { });
      return;
    }
    if (act === 'cs-setup') { if (S.cs) csSetup(); return; }
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
    if (kind === 'join') p = call('joinClass', v).then(function (res) { S.me = res.student; S.cls = res.cls; go('#/avatar'); toast('<svg class="i"><use href="#i-sparkles"/></svg> Welcome to ' + esc(res.cls.name) + '!'); });
    else if (kind === 'submit') p = call('submitLesson', { node: f.getAttribute('data-node'), link: v.link, reflection: v.reflection }).then(function (res) {
      updateMe(res, btn);
      var st = res.student.state.nodes[f.getAttribute('data-node')].status;
      if (st === 'submitted') toast('<svg class="i"><use href="#i-send"/></svg> Turned in! Your teacher will check it soon.');
      else confetti();
      render();
    });
    else if (kind === 'create-class') p = call('createClass', v).then(function (res) { return loadTeacher().then(function () { S.tClass = res.cls.id; toast('Class created! Code: <b>' + esc(res.cls.code) + '</b>'); go('#/t/dash'); }); });
    else if (kind === 'class-set') {
      var patch = { name: v.name, openThrough: +v.openThrough, classGoal: +v.classGoal, requireApproval: !!v.requireApproval, requireLink: !!v.requireLink, showLeaderboard: !!v.showLeaderboard, archived: !!v.archived };
      p = call('updateClass', { id: f.getAttribute('data-id'), patch: patch }).then(function () { return loadTeacher(); }).then(function () { toast('<svg class="i"><use href="#i-check-circle"/></svg> Saved'); render(); });
    } else if (kind === 'review') {
      var approve = btn && btn.value === '1';
      p = call('review', { email: f.getAttribute('data-email'), node: f.getAttribute('data-node'), approve: approve, feedback: v.feedback }).then(function () { return loadTeacher(); }).then(function () { toast(approve ? '<svg class="i"><use href="#i-check-circle"/></svg> Approved' : '<svg class="i"><use href="#i-undo"/></svg> Sent back'); render(); });
    } else if (kind === 'cs-setup') {
      var fsel = R.NODES.filter(function (n) { return v['f_' + n.id]; }).map(function (n) { return n.id; }).slice(0, 4);
      var T2 = S.csDraft.teams.map(function (t, i) { var inp = f.querySelector('[data-tname="' + i + '"]'); return { name: inp ? inp.value : t.name, color: t.color }; });
      var tOf = {};
      Array.prototype.forEach.call(f.querySelectorAll('[data-temail]'), function (sel) { if (sel.value !== '') tOf[sel.getAttribute('data-temail')] = 'tm' + sel.value; });
      p = csSave({ agenda: v.agenda, question: v.question, focus: fsel, showWins: !!v.showWins, showHelpers: !!v.showHelpers }, { teams: T2, teamOf: tOf }).then(function () { closeModal(); toast('<svg class="i"><use href="#i-monitor"/></svg> Screen updated'); });
    } else if (kind === 'gc-import') p = gcImport(f.getAttribute('data-course'), v.classId, v.nameStyle);
    else if (kind === 'gc-post') {
      var tiers = []; for (var tt = 1; tt <= R.MAX_TIER; tt++) if (v['t' + tt]) tiers.push(tt);
      if (!tiers.length) { toast('Tick at least one quest to post.'); done(); return; }
      p = call('classroomPost', { classId: f.getAttribute('data-class'), tiers: tiers, publish: !!v.publish, points: v.points, due: v.due }).then(function (r) {
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
      API.call('bootstrap').then(function (b) { var before = prof(); S.boot = b; if (b.student) { S.me = b.student; S.cls = b.cls; celebrate(before, S.me.profile); } render(); }).catch(render);
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
