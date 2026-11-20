/* Scratch Quest — server-side game logic.
 * The SAME code runs inside Google Apps Script (with a Google Sheets store) and in the
 * browser demo (with a localStorage store). Every rule that matters (XP, unlocks,
 * prerequisites) is enforced here, so students can't cheat from the browser console.
 *
 * store interface:
 *   getClasses() -> [class]          saveClass(class)
 *   getStudents() -> [student]       getStudent(email) -> student|null
 *   saveStudent(student)             deleteStudent(email)     deleteClass(id)
 *   getSettings() -> obj             saveSettings(obj)
 */
function SQ_SERVICE(store) {
  var R = SQ_RULES, A = SQ_AVATAR, AR = SQ_ARCADE;

  function err(msg) { throw new Error(msg); }
  function now() { return Date.now(); }
  function clean(s, max) { return String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max || 200); }

  function findClass(id) { return store.getClasses().filter(function (c) { return c.id === id; })[0] || null; }
  function classDefaults(c) {
    var d = { openThrough: R.MAX_TIER, requireApproval: true, requireLink: false, showLeaderboard: false, classGoal: 25000, archived: false, sounds: true, shop: true,
      // pacing: seconds a student must spend before the next "I did it!", wait after a wrong quick-check answer,
      // whether cards must be done in order, and seconds of no activity before a nudge (0 = off)
      // stepCheck: students must tick "I did this step in Scratch" before "I did it!" works
      stepSec: 10, stepCheck: false, quizWait: 8, inOrder: true, nudgeSec: 45,
      // students may start the next quest while their turned-in work waits for review
      moveOn: true,
      // testOut: students may test out of a starter quest; wizards: classmates who finished a quest may help
      testOut: true, wizards: true };
    for (var k in d) if (c[k] === undefined) c[k] = d[k];
    // the first version of the step timer was 20 seconds; the default is now 10
    if (c.paceV !== 2) { if (c.stepSec === 20) c.stepSec = 10; c.paceV = 2; }
    return c;
  }
  function publicClass(c) {
    if (!c) return null;
    classDefaults(c);
    return { id: c.id, name: c.name, code: c.code, openThrough: c.openThrough, requireApproval: c.requireApproval,
      requireLink: c.requireLink, showLeaderboard: c.showLeaderboard, classGoal: c.classGoal, archived: c.archived, sounds: c.sounds !== false, shop: c.shop !== false, arcade: arcadeInfo(c),
      stepSec: c.stepSec, stepCheck: !!c.stepCheck, quizWait: c.quizWait, inOrder: c.inOrder !== false, nudgeSec: c.nudgeSec, moveOn: c.moveOn !== false, testOut: c.testOut !== false, wizards: c.wizards !== false };
  }
  // What students may know about the arcade: its live mode, closing time and pass rules
  function arcadeInfo(c) {
    var cfg = AR.config(c), mode = AR.liveMode(cfg, now());
    return { mode: mode, closes: mode === 'off' ? 0 : cfg.closes, passMin: cfg.passMin, ticketPrice: cfg.ticketPrice, questsPerTicket: cfg.questsPerTicket, season: cfg.season };
  }
  function arcadeStatus(st) {
    var a = AR.stateOf(st.state), p = R.profile(st.state), info = arcadeInfo(findClass(st.classId) || {});
    var t = now();
    return { kart: { owned: a.kart.owned, active: a.kart.active, best: a.kart.season === info.season ? a.kart.best : 0, allBest: a.kart.allBest }, tickets: AR.tickets(a, p.doneCount, info.questsPerTicket), toNext: info.questsPerTicket - (p.doneCount % info.questsPerTicket), goals: a.goals, until: a.until > t ? a.until : 0, inv: a.inv, coins: p.coins,
      best: a.season === info.season ? a.best : 0, allBest: a.allBest, plays: a.plays, running: !!(a.run && t - a.run.t < AR.RUN_MAX_MS) };
  }
  // Top scores this season (only students; positive information only)
  // game: 'rush' (Block Rush, the default) or 'kart' (Kart Dash); each has its own leaderboard
  function gameRec(s, game) { var a = s.state.arcade; return !a ? null : game === 'kart' ? a.kart : a; }
  function arcadeBoard(classId, season, game, all) {
    return (all || store.getStudents()).filter(function (s) {
      var g = gameRec(s, game);
      return s.classId === classId && !s.isTeacher && g && g.season === season && g.best > 0;
    }).sort(function (x, y) { return gameRec(y, game).best - gameRec(x, game).best; }).slice(0, 10).map(function (s) {
      return { name: s.name, avatar: s.state.avatar || A.DEFAULT, score: gameRec(s, game).best, title: A.titleText(s.state.avatar), key: memberId(s.email) };
    });
  }
  function canPlay(st) {
    var info = arcadeInfo(findClass(st.classId) || {}), a = AR.stateOf(st.state);
    if (info.mode === 'off') err('The arcade is locked right now. Your teacher opens it during class.');
    if (info.mode === 'earned' && !(a.until > now())) err('Start an arcade pass first.');
    return info;
  }
  // Teachers also see the Google Classroom link details
  function teacherClass(c) {
    var o = publicClass(c);
    o.courseId = c.courseId || null; o.courseName = c.courseName || ''; o.courseLink = c.courseLink || '';
    o.posted = c.posted || {}; o.gcTopic = c.gcTopic || 'Scratch Quest'; o.gcUnit = c.gcUnit || ''; o.gcWord = c.gcWord === undefined ? 'Quest' : c.gcWord; o.nameStyle = c.nameStyle || 'initial'; o.syncedAt = c.syncedAt || null;
    return o;
  }
  function selfView(st) {
    return { email: st.email, name: st.name, classId: st.classId, state: st.state, profile: R.profile(st.state) };
  }
  // Recent wins for the Class Screen: only positive events (finished quests, badges, level-ups).
  function recordWins(st, p) {
    var doneIds = Object.keys(p.done);
    if (!st.seen) { st.seen = { level: p.level, badges: p.badges.slice(), done: doneIds }; return; }
    var t = now(), wins = st.wins || [];
    doneIds.forEach(function (id) { if (st.seen.done.indexOf(id) < 0) wins.push({ t: t, kind: 'quest', ref: id }); });
    p.badges.forEach(function (b) { if (st.seen.badges.indexOf(b) < 0) wins.push({ t: t, kind: 'badge', ref: b }); });
    if (p.level > st.seen.level) wins.push({ t: t, kind: 'level', ref: p.level });
    st.wins = wins.slice(-12);
    st.seen = { level: Math.max(p.level, st.seen.level), badges: p.badges.slice(), done: doneIds };
  }
  function persist(st) {
    var p = R.profile(st.state);
    recordWins(st, p);
    st.xp = p.xp; st.level = p.level; st.doneCount = p.doneCount; st.current = p.current; st.updated = now();
    store.saveStudent(st);
    return selfView(st);
  }
  function requireStudent(user) {
    var st = store.getStudent(user.email);
    if (!st) err('Join a class first.');
    return st;
  }
  function requireTeacher(user) { if (!user.isTeacher) err('Teachers only.'); }
  function lesson(id) { var L = SQ_LESSONS[id]; if (!L) err('Unknown quest.'); return L; }

  // Can this student work on this node right now?
  function workable(st, id) {
    if (!R.NODE[id]) err('Unknown quest.');
    var c = classDefaults(findClass(st.classId) || {});
    var status = R.nodeStatus(st.state, id, c);
    if (status === 'locked') err('That quest is still locked. Finish the quests before it first!');
    if (status === 'gated') err('Your teacher has not opened that quest yet.');
    return { status: status, cls: c };
  }
  function touch(ns) { ns.touched = now(); }

  function settings() { var s = store.getSettings() || {}; s.videos = s.videos || {}; s.starters = s.starters || {}; return s; }

  function classMembers(classId) {
    return store.getStudents().filter(function (s) { return s.classId === classId; }).map(function (s) {
      var p = R.profile(s.state);
      return { id: memberId(s.email),
        name: s.name, avatar: s.state.avatar || A.DEFAULT, xp: p.xp, level: p.level, rank: p.rank,
        current: p.current, done: Object.keys(p.done), badges: p.badges.length, teacher: !!s.isTeacher, wiz: !!(s.state.wizard && s.state.wizard.on) };
    });
  }

  // Display settings a student (or their teacher) can choose
  function cleanDisplay(d) {
    d = d || {};
    return { size: ['m', 'l', 'xl'].indexOf(d.size) >= 0 ? d.size : 'm', font: d.font === 'easy' ? 'easy' : 'default',
      contrast: !!d.contrast, motion: !!d.motion, lang: LANGS.indexOf(d.lang) >= 0 ? d.lang : 'en' };
  }
  var LANGS = ['en', 'pt'];
  var HELP_TTL = 60 * 60e3; // a help request expires after an hour
  var WIZ_DAY = 5;          // a Quest Wizard earns XP for at most this many helps a day
  // Up to three classmates who signed up as Quest Wizards and have finished this quest.
  // Wizards who have helped the least go first, so the same student is not asked every time.
  function wizardsFor(st, node) {
    if (classDefaults(findClass(st.classId) || {}).wizards === false) return [];
    return store.getStudents().filter(function (s) {
      return s.classId === st.classId && s.email !== st.email && !s.isTeacher && s.state.wizard && s.state.wizard.on && R.isDone(s.state, node);
    }).sort(function (a, b) { return (a.state.wizard.helped || 0) - (b.state.wizard.helped || 0); }).slice(0, 3)
      .map(function (s) { return { id: memberId(s.email), name: s.name }; });
  }
  var FB_REASONS = ['unclear', 'broken', 'hard', 'easy', 'other'];
  // Feedback lives on the student record OUTSIDE quest progress (state.nodes), so reopening
  // or resetting a quest never wipes it.
  function fbOf(st, node) {
    var fb = st.state.fb || (st.state.fb = {});
    var f = fb[node] || (fb[node] = {});
    f.flags = f.flags || {}; f.help = f.help || {};
    return f;
  }
  // Step names as students see them: core steps are "Step N", optional ones "Stretch step"
  function stepLabel(Lx, i) {
    var core = R.coreSteps(Lx), j = core.indexOf(i);
    return j >= 0 ? 'Step ' + (j + 1) : 'Stretch step';
  }
  function memberId(email) {
    var h = 7;
    for (var i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 2147483647;
    return 'm' + h.toString(36);
  }

  function makeCode() {
    var abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', taken = {}, code;
    store.getClasses().forEach(function (c) { taken[c.code] = true; });
    do { code = ''; for (var i = 0; i < 5; i++) code += abc.charAt(Math.floor(Math.random() * abc.length)); } while (taken[code]);
    return code;
  }

  var api = {
    // ---------------------------------------------------------- everyone
    bootstrap: function (user) {
      var st = store.getStudent(user.email);
      var out = { user: { email: user.email, name: user.name, isTeacher: !!user.isTeacher }, settings: settings() };
      if (st) {
        out.student = selfView(st);
        out.cls = publicClass(findClass(st.classId));
        if (!out.cls) out.student = null; // class was removed
      }
      if (user.isTeacher) out.classes = store.getClasses().map(teacherClass);
      return out;
    },

    // Lesson content for the page (the Apps Script page doesn't carry its own copy, to keep the project small)
    lessons: function () { return SQ_LESSONS; },

    classView: function (user, args) {
      var classId;
      if (user.isTeacher && args && args.classId) classId = args.classId;
      else classId = requireStudent(user).classId;
      var c = findClass(classId);
      if (!c) err('Class not found.');
      // The whole class asks for this at the same moment (every map and class page), and it needs every
      // student's record, so the answer is shared for 20 seconds instead of being rebuilt for each student.
      var ck = 'cv:' + classId, hit = store.cacheGet ? store.cacheGet(ck) : null;
      if (hit) { hit.cls = publicClass(c); return hit; }
      var members = classMembers(classId);
      var total = members.reduce(function (a, m) { return a + m.xp; }, 0);
      var out = { cls: publicClass(c), members: members, classXP: total };
      if (store.cachePut) store.cachePut(ck, out, 20);
      return out;
    },

    joinClass: function (user, args) {
      var code = clean(args.code, 10).toUpperCase().replace(/\s/g, '');
      var c = store.getClasses().filter(function (k) { return k.code === code && !k.archived; })[0];
      if (!c) err('No class found with code "' + code + '". Double-check with your teacher!');
      var name = clean(args.name, 24) || clean(user.name, 24) || 'Coder';
      var st = store.getStudent(user.email);
      if (!st) st = { email: user.email, state: R.newState() };
      st.name = name; st.classId = c.id; st.isTeacher = !!user.isTeacher;
      if (!st.state.avatar) st.state.avatar = A.randomAvatar();
      st.joined = st.joined || now();
      return { student: persist(st), cls: publicClass(c) };
    },

    saveAvatar: function (user, args) {
      var st = requireStudent(user);
      var p = R.profile(st.state);
      st.state.avatar = A.sanitize(args.avatar, p);
      st.state.avatarSet = true;
      return { student: persist(st) };
    },

    // Shop: buy a cosmetic item with coins (prices and balances are checked here, not in the browser)
    buyItem: function (user, args) {
      var st = requireStudent(user);
      var item = A.itemOf(String(args.cat || ''), String(args.id || ''));
      if (!item || !item.unlock || !item.unlock.price) err('That item is not for sale.');
      var key = item.unlock.key, p = R.profile(st.state);
      st.state.owned = st.state.owned || [];
      if (st.state.owned.indexOf(key) >= 0) err('You already own ' + item.name + '.');
      if (p.coins < item.unlock.price) err('You need ' + (item.unlock.price - p.coins) + ' more coins for ' + item.name + '.');
      st.state.owned.push(key);
      if (st.state.goal === key) st.state.goal = null;
      return { student: persist(st), bought: key };
    },
    setGoal: function (user, args) {
      var st = requireStudent(user);
      var key = args.key ? String(args.key) : null;
      if (key && !A.priceOf(key)) err('That item is not in the shop.');
      st.state.goal = key;
      return { student: persist(st) };
    },
    toggleStep: function (user, args) {
      var st = requireStudent(user), id = args.node, L = lesson(id);
      var w = workable(st, id);
      if (w.status === 'done' || w.status === 'submitted') err('This quest is already turned in.');
      var i = Number(args.idx);
      if (!(i >= 0 && i < L.steps.length)) err('Bad step.');
      var ns = R.nodeState(st.state, id);
      if (args.value && !ns.steps[i] && !user.isTeacher) {
        // Pacing: steps are done in order, and not faster than the class's minimum time per step.
        if (w.cls.inOrder !== false && !L.steps[i].stretch) {
          var earlier = R.coreSteps(L).filter(function (j) { return j < i && !ns.steps[j]; });
          if (earlier.length) err('Do the steps in order. Go back to step ' + (R.coreSteps(L).indexOf(earlier[0]) + 1) + ' first.');
        }
        if (w.cls.stepCheck && !args.confirmed) err('Tick the box to say you did this step in Scratch first.');
        var wait = (w.cls.stepSec || 0) * 1000 - (now() - (st.state.paceAt || 0));
        if (wait > 0) err('Slow down! Do the step in Scratch first. You can tap "I did it!" in ' + Math.ceil(wait / 1000) + ' seconds.');
        st.state.paceAt = now();
      }
      ns.steps[i] = !!args.value; touch(ns);
      return { student: persist(st) };
    },

    answerQuiz: function (user, args) {
      var st = requireStudent(user), id = args.node, L = lesson(id);
      workable(st, id);
      var qi = Number(args.q), Q = L.quiz[qi];
      if (!Q) err('Bad question.');
      var ns = R.nodeState(st.state, id);
      var r = ns.quiz[qi] || { tries: 0, correct: false, firstTry: false };
      var correct = Number(args.choice) === Q.answer;
      if (!r.correct && !user.isTeacher) {
        var qcls = classDefaults(findClass(st.classId) || {});
        if (qcls.inOrder !== false && R.coreSteps(L).some(function (j) { return !ns.steps[j]; })) err('Finish the steps before the quick check.');
        // no rapid guessing: after a wrong answer there is a short wait
        var qwait = (qcls.quizWait || 0) * 1000 - (now() - (r.wrongAt || 0));
        if (qwait > 0) err('Take a moment to reread. You can answer again in ' + Math.ceil(qwait / 1000) + ' seconds.');
      }
      if (!r.correct) {
        r.tries++;
        if (correct) { r.correct = true; r.firstTry = r.tries === 1; delete r.wrongAt; }
        else r.wrongAt = now();
      }
      ns.quiz[qi] = r; touch(ns);
      return { correct: correct, explain: correct ? Q.explain : null, student: persist(st) };
    },

    setChallenge: function (user, args) {
      var st = requireStudent(user), id = args.node;
      lesson(id);
      var w = workable(st, id);
      if (w.status === 'done' || w.status === 'submitted') err('This quest is already turned in.');
      var ns = R.nodeState(st.state, id);
      ns.challenge = !!args.value; touch(ns);
      return { student: persist(st) };
    },

    submitLesson: function (user, args) {
      var st = requireStudent(user), id = args.node, L = lesson(id);
      var w = workable(st, id);
      if (w.status === 'done') err('You already finished this quest!');
      var ns = R.nodeState(st.state, id);
      R.coreSteps(L).forEach(function (i) { if (!ns.steps[i]) err('Finish every core step first (step ' + (i + 1) + ' is not done).'); });
      for (var q = 0; q < L.quiz.length; q++) if (!(ns.quiz[q] && ns.quiz[q].correct)) err('Answer the Quick Check questions first.');
      var link = clean(args.link, 300);
      if (link && !/^https?:\/\//i.test(link)) err('That link should start with https://');
      if ((w.cls.requireLink || (ns.test && ns.test.pass)) && !link) err('Paste the link to your Scratch project.');
      ns.link = link;
      ns.reflection = clean(args.reflection, 600);
      ns.submittedAt = now(); touch(ns);
      ns.status = w.cls.requireApproval ? 'submitted' : 'done';
      if (ns.status === 'done') ns.doneAt = now();
      return { student: persist(st) };
    },

    // ---------------------------------------------------------- "I'm stuck" help requests
    askHelp: function (user, args) {
      var st = requireStudent(user), node = String(args.node || '');
      var Lh = lesson(node), step = args.step, where = Lh.title;
      if (typeof step === 'number' && Lh.steps[step]) where += ' · ' + stepLabel(Lh, step) + ': ' + Lh.steps[step].title;
      else if (step === 'quiz') where += ' · Quick check';
      else if (step === 'turnin') where += ' · Turning in';
      else if (step === 'challenge') where += ' · Expert challenge';
      var id = memberId(st.email), wz = wizardsFor(st, node);
      store.helpPut(id, { who: id, name: st.name, classId: st.classId, at: now(), node: node, where: where, note: clean(args.note, 140), avatar: st.state.avatar || A.DEFAULT, wz: wz });
      var fb = fbOf(st, node), sk = String(step == null ? 'other' : step);
      fb.help[sk] = (fb.help[sk] || 0) + 1;
      persist(st);
      return { help: { open: true, at: now(), wz: wz } };
    },
    cancelHelp: function (user) {
      var st = requireStudent(user);
      store.helpPut(memberId(st.email), null);
      return { help: { open: false } };
    },
    myHelp: function (user) {
      var st = requireStudent(user), h = store.helpAll()[memberId(st.email)];
      return { help: h && now() - h.at < HELP_TTL ? { open: true, at: h.at, wz: h.wz || [] } : { open: false } };
    },
    helpList: function (user, args) {
      requireTeacher(user);
      var all = store.helpAll();
      return { list: Object.keys(all).map(function (k) { return all[k]; }).filter(function (h) {
        return h && h.classId === args.classId && now() - h.at < HELP_TTL;
      }).sort(function (a, b) { return a.at - b.at; }), serverNow: now() };
    },
    helpDone: function (user, args) {
      requireTeacher(user);
      var h = store.helpAll()[String(args.who || '')];
      if (h) store.helpPut(h.who, null);
      return api.helpList(user, { classId: args.classId });
    },

    // ---------------------------------------------------------- Quest Wizards (students who help classmates)
    setWizard: function (user, args) {
      var st = requireStudent(user);
      if (classDefaults(findClass(st.classId) || {}).wizards === false) err('Quest Wizards are turned off for your class.');
      if (args.on && !R.profile(st.state).doneCount) err('Finish a quest first. Then you can help classmates with it.');
      var z = st.state.wizard = st.state.wizard || { helped: 0, log: [] };
      z.on = !!args.on;
      if (store.cachePut) store.cachePut('cv:' + st.classId, null, 1);
      return { student: persist(st) };
    },
    // "A classmate helped me": closes the help request and rewards the Wizard who helped.
    thankWizard: function (user, args) {
      var st = requireStudent(user), me = memberId(st.email), h = store.helpAll()[me], who = String(args.who || '');
      if (!h || !(h.wz || []).some(function (x) { return x.id === who; })) err('That help request is closed.');
      store.helpPut(me, null);
      var wiz = store.getStudents().filter(function (s) { return s.classId === st.classId && memberId(s.email) === who; })[0];
      var th = st.state.thanks = st.state.thanks || {}, paid = false;
      if (wiz && wiz.state.wizard && wiz.state.wizard.on && !th[h.node]) {
        var z = wiz.state.wizard, dayAgo = now() - 20 * 3600e3;
        z.log = (z.log || []).slice(-30);
        // one reward for each quest a classmate was stuck on, and at most WIZ_DAY rewards a day
        if (z.log.filter(function (x) { return x.at > dayAgo; }).length < WIZ_DAY) {
          z.helped = (z.helped || 0) + 1; z.log.push({ at: now(), node: h.node });
          th[h.node] = now(); paid = true;
          persist(wiz);
        }
      }
      return { help: { open: false }, thanked: wiz ? wiz.name : '', paid: paid, student: persist(st) };
    },

    // ---------------------------------------------------------- testing out of a starter quest
    // A student who already knows the skills answers a harder check. Passing marks the steps and quick
    // checks done; the student still builds the proof project and turns it in for review. One try per quest.
    testOut: function (user, args) {
      var st = requireStudent(user), id = args.node, L = lesson(id), T = L.testOut;
      if (!T) err('This quest has no test.');
      var w = workable(st, id);
      if (w.cls.testOut === false) err('Testing out is turned off for your class.');
      if (w.status !== 'available' && w.status !== 'started') err('This quest is already turned in.');
      var ns = R.nodeState(st.state, id);
      if (ns.test) err('You already tried the test for this quest.');
      var ans = args.answers || [], score = 0;
      T.quiz.forEach(function (Q, i) { if (Number(ans[i]) === Q.answer) score++; });
      var pass = score >= T.quiz.length - 1;
      ns.test = { at: now(), score: score, pass: pass };
      if (pass) {
        R.coreSteps(L).forEach(function (i) { ns.steps[i] = true; });
        L.quiz.forEach(function (_, q) { if (!(ns.quiz[q] && ns.quiz[q].correct)) ns.quiz[q] = { tries: 1, correct: true, firstTry: score === T.quiz.length }; });
      }
      touch(ns);
      return { pass: pass, score: score, total: T.quiz.length, student: persist(st) };
    },

    // ---------------------------------------------------------- display settings and translation
    setDisplay: function (user, args) {
      var st = requireStudent(user);
      st.state.display = cleanDisplay(args.display);
      return { student: persist(st) };
    },
    // Machine translation of page text (Google Translate, built into Apps Script). Results are saved in the
    // "Translations" tab, where the teacher can correct them. Only signed-in class members can call it.
    translate: function (user, args) {
      if (!user.isTeacher) requireStudent(user);
      var lang = String(args.lang || '');
      if (LANGS.indexOf(lang) < 1) err('That language is not available.');
      var list = (args.items || []).slice(0, 80).map(function (x) { return { t: String(x.t || '').slice(0, 3000), html: !!x.html }; });
      if (!store.translate) return { out: null };
      return { out: store.translate(list, lang) };
    },

    // ---------------------------------------------------------- bug reports
    reportBug: function (user, args) {
      var st = store.getStudent(user.email), c = st ? findClass(st.classId) : null;
      if (!st && !user.isTeacher) err('Join a class first.');
      var recent = store.bugAll().filter(function (b) { return b.email === user.email && now() - b.at < 60 * 60e3; });
      if (recent.length >= 10) err('Thanks! You have sent a lot of reports this hour. Tell your teacher about this one.');
      var text = clean(args.text, 600);
      if (!text) err('Tell us what happened.');
      if (args.auto && recent.some(function (b) { return b.text === text; })) return { ok: true };
      var info = {}; Object.keys(args.info || {}).slice(0, 20).forEach(function (k) { info[clean(k, 30)] = clean(typeof args.info[k] === 'string' ? args.info[k] : JSON.stringify(args.info[k]), 400); });
      store.bugAdd({ id: 'b' + now().toString(36) + Math.floor(Math.random() * 1e4), at: now(), status: 'new', auto: !!args.auto,
        name: st ? st.name : clean(user.name, 24), email: user.email, cls: c ? c.name : (user.isTeacher ? 'teacher' : ''), where: clean(args.where, 120), text: text, info: info });
      return { ok: true };
    },
    bugList: function (user) {
      requireTeacher(user);
      return { bugs: store.bugAll().sort(function (a, b) { return b.at - a.at; }).slice(0, 200) };
    },
    bugUpdate: function (user, args) {
      requireTeacher(user);
      var b = store.bugAll().filter(function (x) { return x.id === String(args.id || ''); })[0];
      if (!b) err('Report not found.');
      if (args.remove) store.bugDelete(b.id);
      else { b.status = args.status === 'fixed' ? 'fixed' : 'new'; store.bugSave(b); }
      return api.bugList(user);
    },

    // ---------------------------------------------------------- lesson feedback (for improving the lessons)
    flagConfusing: function (user, args) {
      var st = requireStudent(user), node = String(args.node || ''), Lf = lesson(node);
      var kind = args.kind === 'quiz' ? 'quiz' : 'step', idx = Math.floor(Number(args.idx));
      if (!((kind === 'quiz' ? Lf.quiz : Lf.steps)[idx])) err('Unknown step.');
      var reason = FB_REASONS.indexOf(args.reason) >= 0 ? args.reason : 'other';
      fbOf(st, node).flags[kind + ':' + idx] = { reason: reason, note: clean(args.note, 200), at: now() };
      return { student: persist(st) };
    },
    rateLesson: function (user, args) {
      var st = requireStudent(user), node = String(args.node || '');
      lesson(node);
      if (!st.state.nodes[node]) err('Start this quest before rating it.');
      var r = Math.round(Number(args.rating));
      if (!(r >= 1 && r <= 5)) err('Pick a face from 1 to 5.');
      var fb = fbOf(st, node);
      fb.rating = r; fb.hardest = clean(args.hardest, 200); fb.change = clean(args.change, 200); fb.ratedAt = now();
      return { student: persist(st) };
    },

    // ---------------------------------------------------------- arcade
    arcade: function (user) {
      var st = requireStudent(user), c = findClass(st.classId) || {};
      var info = arcadeInfo(c);
      var everyone = store.getStudents();
      return { info: info, me: arcadeStatus(st), board: arcadeBoard(st.classId, info.season, 'rush', everyone), kartBoard: arcadeBoard(st.classId, info.season, 'kart', everyone), you: memberId(st.email), now: now() };
    },
    // Buy a ticket or a power-up with coins
    arcadeBuy: function (user, args) {
      var st = requireStudent(user), c = classDefaults(findClass(st.classId) || {});
      if (c.shop === false) err('The coin shop is turned off for your class.');
      var a = AR.stateOf(st.state), p = R.profile(st.state), what = String(args.item || ''), price, name;
      if (what === 'ticket') { price = AR.config(c).ticketPrice; name = 'an arcade ticket'; if (!price) err('Tickets can only be earned by finishing quests.'); }
      else if (AR.POWER[what]) { price = AR.POWER[what].price; name = AR.POWER[what].name; }
      else err('That is not in the arcade shop.');
      if ((a.inv[what] || 0) >= 9) err('You can hold up to 9 of those.');
      if (p.coins < price) err('You need ' + (price - p.coins) + ' more coins for ' + name + '.');
      a.spent += price;
      if (what === 'ticket') a.bought += 1; else a.inv[what] = (a.inv[what] || 0) + 1;
      persist(st);
      return { me: arcadeStatus(st), student: selfView(st) };
    },
    // Spend a ticket to start a short pass (Earned mode)
    arcadePass: function (user) {
      var st = requireStudent(user), info = arcadeInfo(findClass(st.classId) || {}), a = AR.stateOf(st.state), p = R.profile(st.state);
      if (info.mode === 'off') err('The arcade is locked right now.');
      if (info.mode === 'free') err('It is free play right now. No ticket needed!');
      if (a.until > now()) err('Your pass is already running.');
      if (AR.tickets(a, p.doneCount, info.questsPerTicket) < 1) err('You need a ticket. Finish quests to earn one!');
      a.used += 1;
      a.until = now() + info.passMin * 60e3;
      if (info.closes) a.until = Math.min(a.until, info.closes);
      persist(st);
      return { me: arcadeStatus(st) };
    },
    arcadeStart: function (user, args) {
      var st = requireStudent(user);
      canPlay(st);
      var a = AR.stateOf(st.state), want = (args.power || []).map(String), power = [];
      var game = args.game === 'kart' ? 'kart' : 'rush';
      want.forEach(function (id) {
        if (game === 'kart' && AR.KART_POWER.indexOf(id) < 0) return;
        if (AR.POWER[id] && power.indexOf(id) < 0 && power.length < AR.MAX_POWER && (a.inv[id] || 0) > 0) power.push(id);
      });
      power.forEach(function (id) { a.inv[id] -= 1; if (!a.inv[id]) delete a.inv[id]; });
      a.run = { id: 'r' + now().toString(36) + Math.floor(Math.random() * 1e4), t: now(), power: power, game: game };
      persist(st);
      return { run: a.run, me: arcadeStatus(st) };
    },
    arcadeEnd: function (user, args) {
      var st = requireStudent(user), a = AR.stateOf(st.state);
      var c = findClass(st.classId) || {}, cfg = AR.config(c);
      if (!a.run || a.run.id !== String(args.runId || '')) err('That run was not found. Start a new one!');
      var ms = now() - a.run.t, score = Math.max(0, Math.floor(Number(args.score) || 0)), game = a.run.game === 'kart' ? 'kart' : 'rush';
      var rec = game === 'kart' ? a.kart : a;
      a.run = null;
      if (ms > AR.RUN_MAX_MS) err('That run went too long to count.');
      score = Math.min(score, AR.scoreCap(ms));
      rec.plays += 1;
      if (rec.season !== cfg.season) { rec.season = cfg.season; rec.best = 0; }
      var newBest = score > rec.best;
      if (newBest) rec.best = score;
      var allBest = score > rec.allBest;
      if (allBest) rec.allBest = score;
      // rewards: coins for the run (with a daily limit) and one-time prizes for score goals
      var today = new Date(now()).toISOString().slice(0, 10);
      if (a.day !== today) { a.day = today; a.dayCoins = 0; }
      var runCoins = Math.max(0, Math.min(AR.RUN_COINS, Math.floor(score / 100), AR.DAY_COINS - a.dayCoins));
      a.dayCoins += runCoins;
      var newGoals = [];
      if (game === 'rush') AR.GOALS.forEach(function (g) { if (score >= g[0] && a.goals.indexOf(g[0]) < 0) { a.goals.push(g[0]); newGoals.push({ score: g[0], coins: g[1] }); runCoins += g[1]; } });
      a.earned += runCoins;
      persist(st);
      var board = arcadeBoard(st.classId, cfg.season, game), id = memberId(st.email), place = 0;
      board.forEach(function (b, i) { if (b.key === id) place = i + 1; });
      return { game: game, score: score, newBest: newBest, allBest: allBest, place: place, board: board, coins: runCoins, goals: newGoals, me: arcadeStatus(st), student: selfView(st) };
    },

    // ---- Kart Dash garage: buy a kart, upgrade one of its parts, or choose which kart to drive
    kartBuy: function (user, args) {
      var st = requireStudent(user), c = classDefaults(findClass(st.classId) || {});
      if (c.shop === false) err('The coin shop is turned off for your class.');
      var a = AR.stateOf(st.state), p = R.profile(st.state), k = AR.KART[String(args.kart || '')];
      if (!k) err('That kart is not in the garage.');
      if (a.kart.owned[k.id]) err('You already own the ' + k.name + '.');
      if (p.coins < k.price) err('You need ' + (k.price - p.coins) + ' more coins for the ' + k.name + '.');
      a.spent += k.price; a.kart.owned[k.id] = {}; a.kart.active = k.id;
      persist(st);
      return { me: arcadeStatus(st), student: selfView(st) };
    },
    kartUpgrade: function (user, args) {
      var st = requireStudent(user), c = classDefaults(findClass(st.classId) || {});
      if (c.shop === false) err('The coin shop is turned off for your class.');
      var a = AR.stateOf(st.state), p = R.profile(st.state), k = AR.KART[String(args.kart || '')];
      var part = AR.PARTS.filter(function (x) { return x.id === args.part; })[0];
      if (!k || !a.kart.owned[k.id]) err('Buy that kart first.');
      if (!part) err('That part does not exist.');
      var lv = a.kart.owned[k.id][part.id] || 0;
      if (lv >= AR.PART_PRICES.length) err(part.name + ' is already at the top level.');
      var price = AR.PART_PRICES[lv];
      if (p.coins < price) err('You need ' + (price - p.coins) + ' more coins for that upgrade.');
      a.spent += price; a.kart.owned[k.id][part.id] = lv + 1;
      persist(st);
      return { me: arcadeStatus(st), student: selfView(st) };
    },
    kartSelect: function (user, args) {
      var st = requireStudent(user), a = AR.stateOf(st.state), id = String(args.kart || '');
      if (!a.kart.owned[id]) err('Buy that kart first.');
      a.kart.active = id;
      persist(st);
      return { me: arcadeStatus(st) };
    },

    // ---------------------------------------------------------- teacher
    setArcade: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.classId);
      if (!c) err('Class not found.');
      var cfg = AR.config(c);
      if (args.mode !== undefined) {
        if (['off', 'earned', 'free'].indexOf(args.mode) < 0) err('Unknown arcade mode.');
        cfg.mode = args.mode;
        var mins = Math.max(5, Math.min(240, Number(args.minutes) || 45));
        cfg.closes = cfg.mode === 'off' ? 0 : now() + mins * 60e3;
      }
      if (args.passMin !== undefined) cfg.passMin = Math.max(1, Math.min(30, Number(args.passMin) || 5));
      if (args.ticketPrice !== undefined) cfg.ticketPrice = Math.max(0, Math.min(1000, Number(args.ticketPrice) || 0));
      if (args.questsPerTicket !== undefined) cfg.questsPerTicket = Math.max(1, Math.min(5, Math.round(Number(args.questsPerTicket)) || 1));
      var winners = [];
      if (args.resetBoard) {
        // the top 3 of the round that is ending win coins (and the Round Champion badge)
        ['rush', 'kart'].forEach(function (game) {
          var top = store.getStudents().filter(function (s) { var x = gameRec(s, game); return s.classId === c.id && !s.isTeacher && x && x.season === cfg.season && x.best > 0; })
            .sort(function (x, y) { return gameRec(y, game).best - gameRec(x, game).best; }).slice(0, AR.ROUND_PRIZES.length);
          top.forEach(function (s, i) { var x = AR.stateOf(s.state); x.earned += AR.ROUND_PRIZES[i]; x.roundWins += 1; persist(s); winners.push({ game: game, name: s.name, place: i + 1, coins: AR.ROUND_PRIZES[i] }); });
        });
        cfg.season += 1;
      }
      c.arcade = cfg;
      store.saveClass(c);
      // Locking ends everyone's passes right away
      if (cfg.mode === 'off') store.getStudents().forEach(function (s) {
        if (s.classId === c.id && s.state.arcade && s.state.arcade.until > now()) { s.state.arcade.until = 0; store.saveStudent(s); }
      });
      return { cls: teacherClass(c), board: arcadeBoard(c.id, cfg.season, 'rush'), kartBoard: arcadeBoard(c.id, cfg.season, 'kart'), winners: winners };
    },
    arcadeBoardFor: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.classId);
      if (!c) err('Class not found.');
      return { board: arcadeBoard(c.id, AR.config(c).season, 'rush'), kartBoard: arcadeBoard(c.id, AR.config(c).season, 'kart'), info: arcadeInfo(c) };
    },

    teacherData: function (user) {
      requireTeacher(user);
      return {
        classes: store.getClasses().map(teacherClass),
        students: store.getStudents().map(function (s) {
          return { email: s.email, name: s.name, classId: s.classId, isTeacher: !!s.isTeacher, state: s.state, profile: R.profile(s.state), updated: s.updated, accomNote: s.accomNote || '' };
        }),
        settings: settings(),
        newBugs: store.bugAll().filter(function (b) { return b.status === 'new'; }).length
      };
    },
    createClass: function (user, args) {
      requireTeacher(user);
      var name = clean(args.name, 40);
      if (!name) err('Give the class a name (e.g. "Period 3").');
      var c = classDefaults({ id: 'c' + now().toString(36) + Math.floor(Math.random() * 1000), name: name, code: makeCode(), teacher: user.email, created: now() });
      store.saveClass(c);
      return { cls: publicClass(c) };
    },
    updateClass: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.id);
      if (!c) err('Class not found.');
      classDefaults(c);
      var p = args.patch || {};
      if (p.name !== undefined) c.name = clean(p.name, 40) || c.name;
      if (p.openThrough !== undefined) c.openThrough = Math.max(1, Math.min(R.MAX_TIER, Number(p.openThrough) || 1));
      ['requireApproval', 'requireLink', 'showLeaderboard', 'archived', 'sounds', 'shop', 'inOrder', 'moveOn', 'stepCheck', 'testOut', 'wizards'].forEach(function (k) { if (p[k] !== undefined) c[k] = !!p[k]; });
      [['stepSec', 120], ['quizWait', 60], ['nudgeSec', 600]].forEach(function (x) { if (p[x[0]] !== undefined) c[x[0]] = Math.max(0, Math.min(x[1], Math.round(Number(p[x[0]]) || 0))); });
      if (p.classGoal !== undefined) c.classGoal = Math.max(0, Number(p.classGoal) || 0);
      if (p.newCode) c.code = makeCode();
      store.saveClass(c);
      return { cls: publicClass(c) };
    },
    review: function (user, args) {
      requireTeacher(user);
      var st = store.getStudent(args.email);
      if (!st) err('Student not found.');
      var ns = st.state.nodes[args.node];
      if (!ns) err('Nothing to review.');
      ns.status = args.approve ? 'done' : 'returned';
      ns.feedback = clean(args.feedback, 600);
      ns.reviewedAt = now();
      if (args.approve) ns.doneAt = ns.doneAt || now();
      return { student: persist(st) };
    },
    // Just the turned-in work for one class (small and quick, for the Class Screen's review button)
    pendingReviews: function (user, args) {
      requireTeacher(user);
      var out = [];
      store.getStudents().forEach(function (s) {
        if (s.classId !== args.classId || s.isTeacher) return;
        Object.keys(s.state.nodes || {}).forEach(function (id) {
          var ns = s.state.nodes[id];
          if (ns.status === 'submitted') out.push({ email: s.email, name: s.name, avatar: s.state.avatar || A.DEFAULT, id: id, link: ns.link || '', at: ns.submittedAt || 0, tested: !!(ns.test && ns.test.pass) });
        });
      });
      return { list: out.sort(function (a, b) { return a.at - b.at; }) };
    },
    reopen: function (user, args) {
      requireTeacher(user);
      var st = store.getStudent(args.email);
      if (!st || !st.state.nodes[args.node]) err('Nothing to reopen.');
      st.state.nodes[args.node].status = 'open';
      return { student: persist(st) };
    },
    award: function (user, args) {
      requireTeacher(user);
      var st = store.getStudent(args.email);
      if (!st) err('Student not found.');
      if (!R.TEACHER_BADGES.some(function (b) { return b.id === args.badge; })) err('Unknown badge.');
      st.state.awards = st.state.awards || [];
      if (st.state.awards.some(function (a) { return a.id === args.badge; })) err(st.name + ' already has that badge.');
      st.state.awards.push({ id: args.badge, note: clean(args.note, 200), at: now() });
      return { student: persist(st) };
    },
    bonus: function (user, args) {
      requireTeacher(user);
      var st = store.getStudent(args.email);
      if (!st) err('Student not found.');
      var amt = Math.round(Number(args.amount) || 0);
      if (!amt || Math.abs(amt) > 1000) err('Bonus XP should be between -1000 and 1000.');
      st.state.bonus = st.state.bonus || [];
      st.state.bonus.push({ amount: amt, note: clean(args.note, 200), at: now() });
      return { student: persist(st) };
    },
    updateStudent: function (user, args) {
      requireTeacher(user);
      var st = store.getStudent(args.email);
      if (!st) err('Student not found.');
      if (args.name !== undefined) st.name = clean(args.name, 24) || st.name;
      if (args.classId !== undefined && findClass(args.classId)) st.classId = args.classId;
      if (args.accom) {
        // Teacher-set accommodations: coreOnly hides stretch steps; autoRead reads each card aloud; note is private to teachers
        st.state.accom = { coreOnly: !!args.accom.coreOnly, autoRead: !!args.accom.autoRead };
        st.accomNote = clean(args.accom.note, 300); // kept outside state so students never receive it
      }
      if (args.display) st.state.display = cleanDisplay(args.display);
      return { student: persist(st) };
    },
    // ---- Class Screen (projector, teacher only). Sends ONLY positive information:
    // no grades, quiz results, returned work, or anything a student is "behind" on.
    classScreen: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.classId);
      if (!c) err('Class not found.');
      classDefaults(c);
      var studs = store.getStudents().filter(function (s) { return s.classId === c.id && !s.isTeacher; });
      var teamOf = c.teamOf || {};
      var members = studs.map(function (s) {
        var p = R.profile(s.state);
        return { key: s.email, name: s.name, avatar: s.state.avatar || A.DEFAULT, level: p.level, current: p.current, done: Object.keys(p.done),
          doneCount: p.doneCount, hid: memberId(s.email), card: A.titleCard(s.state.avatar), team: teamOf[s.email] || null, helper: p.badges.indexOf('helper') >= 0, wiz: !!(s.state.wizard && s.state.wizard.on), xp: p.xp };
      });
      // recent wins across the class (newest first, last 7 days)
      var since = now() - 7 * 864e5, wins = [];
      studs.forEach(function (s) {
        (s.wins || []).forEach(function (w) {
          if (w.t < since) return;
          var text, icon;
          if (w.kind === 'quest') { if (!SQ_LESSONS[w.ref]) return; icon = '✅'; text = 'finished ' + SQ_LESSONS[w.ref].title; }
          else if (w.kind === 'badge') { var B = R.BADGE[w.ref]; if (!B) return; icon = B.icon; text = 'earned the ' + B.name + ' badge'; }
          else if (w.kind === 'level') { icon = '⭐'; text = 'reached Level ' + w.ref; }
          else return;
          wins.push({ t: w.t, kind: w.kind, name: s.name, avatar: s.state.avatar || A.DEFAULT, icon: icon, text: text });
        });
      });
      wins.sort(function (a, b) { return b.t - a.t; });
      // who to ask: classmates who already finished the quests people are working on now
      var counts = {};
      members.forEach(function (m) { if (m.current && m.done.indexOf(m.current) < 0) counts[m.current] = (counts[m.current] || 0) + 1; });
      var helpers = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 4).map(function (q) {
        var who = members.filter(function (m) { return m.done.indexOf(q) >= 0; })
          .sort(function (a, b) { return (b.wiz - a.wiz) || (b.helper - a.helper) || (b.xp - a.xp); }).slice(0, 3).map(function (m) { return { name: m.name, avatar: m.avatar, wiz: m.wiz }; });
        return { quest: q, title: SQ_LESSONS[q] ? SQ_LESSONS[q].title : q, working: counts[q], helpers: who };
      }).filter(function (h) { return h.helpers.length; });
      // "Race to the finish": where each student is inside today's quest (positive-only stages).
      var sc0 = c.screen || {};
      var raceQ = (args.quest && SQ_LESSONS[args.quest]) ? args.quest
        : ((sc0.raceQuest && SQ_LESSONS[sc0.raceQuest] ? sc0.raceQuest : null) || (sc0.focus || []).filter(function (id) { return SQ_LESSONS[id]; })[0] || Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || 't1');
      var RL = SQ_LESSONS[raceQ], core = R.coreSteps(RL);
      var stations = [{ key: 'start', label: 'Start' }].concat(core.map(function (i, j) { return { key: 's' + j, label: RL.steps[i].title }; }))
        .concat([{ key: 'check', label: 'Quick check' }, { key: 'turnin', label: 'Turn in' }, { key: 'finish', label: 'Finish!' }]);
      var others = [];
      studs.forEach(function (s, k) {
        var m = members[k], ns = s.state.nodes[raceQ];
        var stage = null;
        if (ns && ns.status === 'done') stage = 'finish';
        else if (ns && (ns.status === 'submitted' || ns.status === 'returned')) stage = 'turnin';
        else if (m.current === raceQ || (ns && ns.touched)) {
          stage = 'start';
          if (ns && ns.touched) {
            var next = core.filter(function (i) { return !ns.steps[i]; })[0];
            if (next !== undefined) stage = core.indexOf(next) === 0 && !core.some(function (i) { return ns.steps[i]; }) && !Object.keys(ns.quiz || {}).length ? 'start' : 's' + core.indexOf(next);
            else if (RL.quiz.some(function (q, qi) { return !(ns.quiz[qi] && ns.quiz[qi].correct); })) stage = 'check';
            else stage = 'turnin';
          }
        }
        if (stage) m.stage = stage;
        else if (R.NODE[m.current]) others.push({ name: m.name, avatar: m.avatar, quest: m.current, tier: R.NODE[m.current].tier, hid: m.hid });
      });
      var race = { quest: raceQ, tier: R.NODE[raceQ].tier, title: RL.title, stations: stations, others: others };
      members.forEach(function (m) { delete m.xp; });
      var classXP = studs.reduce(function (a, s) { return a + R.profile(s.state).xp; }, 0);
      return { cls: { id: c.id, name: c.name, code: c.code, classGoal: c.classGoal, screen: c.screen || {}, teams: c.teams || [] },
        members: members, wins: wins.slice(0, 10), helpers: helpers, classXP: classXP, race: race, serverNow: now(),
        // just a count (no names or details) so the teacher's screen can show a "to review" button
        toReview: studs.reduce(function (a, s) { return a + Object.keys(s.state.nodes || {}).filter(function (id) { return s.state.nodes[id].status === 'submitted'; }).length; }, 0) };
    },
    saveScreen: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.classId);
      if (!c) err('Class not found.');
      var sc = args.screen || {}, cur = c.screen || {};
      var num = function (v) { v = Number(v); return isFinite(v) && v > 0 ? v : null; };
      c.screen = {
        endAt: sc.endAt === undefined ? cur.endAt || null : num(sc.endAt),
        startAt: sc.startAt === undefined ? cur.startAt || null : num(sc.startAt),
        focus: sc.focus === undefined ? cur.focus || [] : (sc.focus || []).filter(function (id) { return !!R.NODE[id]; }).slice(0, 4),
        agenda: sc.agenda === undefined ? cur.agenda || '' : String(sc.agenda || '').replace(/[<>]/g, '').slice(0, 300),
        question: sc.question === undefined ? cur.question || '' : clean(sc.question, 220),
        showHelpers: sc.showHelpers === undefined ? cur.showHelpers !== false : !!sc.showHelpers,
        showWins: sc.showWins === undefined ? cur.showWins !== false : !!sc.showWins,
        dark: sc.dark === undefined ? !!cur.dark : !!sc.dark,
        raceQuest: sc.raceQuest === undefined ? cur.raceQuest || '' : (R.NODE[sc.raceQuest] ? sc.raceQuest : ''),
        view: sc.view === undefined ? (cur.view || 'quest') : (['map', 'teams'].indexOf(sc.view) >= 0 ? sc.view : 'quest')
      };
      if (args.teams) {
        c.teams = (args.teams || []).slice(0, 8).map(function (t, i) { return { id: 'tm' + i, name: clean(t.name, 24) || ('Team ' + (i + 1)), color: /^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : '#94a3b8' }; });
        var valid = {}; c.teams.forEach(function (t) { valid[t.id] = true; });
        c.teamOf = {};
        Object.keys(args.teamOf || {}).forEach(function (email) { if (valid[args.teamOf[email]]) c.teamOf[email] = args.teamOf[email]; });
      }
      store.saveClass(c);
      return api.classScreen(user, { classId: c.id });
    },

    // End-of-year cleanup: removes the class and every student record in it from the Sheet.
    deleteClass: function (user, args) {
      requireTeacher(user);
      var c = findClass(args.id);
      if (!c) err('Class not found.');
      if (String(args.confirm || '').toUpperCase() !== String(c.code)) err('Type the class code to confirm.');
      var n = 0;
      store.getStudents().filter(function (s) { return s.classId === c.id; }).forEach(function (s) { store.deleteStudent(s.email); n++; });
      store.deleteClass(c.id);
      return { ok: true, removed: n };
    },
    removeStudent: function (user, args) {
      requireTeacher(user);
      store.deleteStudent(args.email);
      return { ok: true };
    },
    setStarter: function (user, args) {
      requireTeacher(user);
      if (!R.NODE[args.node]) err('Unknown quest.');
      var s = settings();
      s.starters = s.starters || {};
      var url = clean(args.url, 400);
      if (url && !/^https:\/\//i.test(url)) err('Starter links must start with https://');
      if (url) s.starters[args.node] = url; else delete s.starters[args.node];
      store.saveSettings(s);
      return { settings: s };
    },
    setVideo: function (user, args) {
      requireTeacher(user);
      if (!R.NODE[args.node]) err('Unknown quest.');
      var s = settings();
      var url = clean(args.url, 400);
      if (url && !/^https:\/\//i.test(url)) err('Video links must start with https://');
      if (url) s.videos[args.node] = url; else delete s.videos[args.node];
      store.saveSettings(s);
      return { settings: s };
    }
  };
  return api;
}

/* Combine two sets of Scratch Quest data without losing anything.
 * Everything in `source` is brought into `target`:
 *   - a student only in source is added (with their class);
 *   - a student in both keeps the BEST of each quest from either record, plus all badges, bonus XP,
 *     owned items and arcade history, and stays in the class they used most recently.
 * Nothing is ever removed from target. With apply=false it only reports what would happen.
 */
function SQ_MERGE(target, source, apply, tag) {
  tag = String(tag || 'sheet'); // which sheet this came from, so combining the same sheet twice changes nothing
  var R = SQ_RULES, RANK = { done: 4, submitted: 3, returned: 2 };
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function score(ns) {
    if (!ns) return -1;
    return (RANK[ns.status] || 1) * 1000 + (ns.steps || []).filter(Boolean).length * 10 + Object.keys(ns.quiz || {}).length + (ns.challenge ? 5 : 0);
  }
  function mergeState(newer, older, firstTime) {
    var out = copy(newer);
    out.nodes = out.nodes || {};
    Object.keys(older.nodes || {}).forEach(function (id) { if (score(older.nodes[id]) > score(out.nodes[id])) out.nodes[id] = copy(older.nodes[id]); });
    var seen = {};
    out.awards = out.awards || []; out.awards.forEach(function (a) { seen[a.id] = 1; });
    (older.awards || []).forEach(function (a) { if (!seen[a.id]) out.awards.push(a); });
    seen = {};
    out.bonus = out.bonus || []; out.bonus.forEach(function (b) { seen[b.at + '|' + b.amount] = 1; });
    (older.bonus || []).forEach(function (b) { if (!seen[b.at + '|' + b.amount]) out.bonus.push(b); });
    if ((older.owned || []).length) { out.owned = out.owned || []; older.owned.forEach(function (k) { if (out.owned.indexOf(k) < 0) out.owned.push(k); }); }
    if (!out.avatarSet && older.avatarSet) { out.avatar = older.avatar; out.avatarSet = true; }
    if (!out.accom && older.accom) out.accom = older.accom;
    if (!out.display && older.display) out.display = older.display;
    if (older.fb) { out.fb = out.fb || {}; Object.keys(older.fb).forEach(function (id) { if (!out.fb[id]) out.fb[id] = older.fb[id]; }); }
    if (older.arcade) {
      if (!out.arcade) out.arcade = copy(older.arcade);
      else {
        var a = out.arcade, o = older.arcade;
        // coins and tickets are separate histories in each sheet, so add them (once only)
        if (firstTime) ['spent', 'earned', 'bought', 'used', 'plays', 'roundWins'].forEach(function (k) { a[k] = (a[k] || 0) + (o[k] || 0); });
        a.allBest = Math.max(a.allBest || 0, o.allBest || 0);
        if (o.kart) {
          a.kart = a.kart || { owned: { starter: {} }, active: 'starter', best: 0, season: 0, allBest: 0, plays: 0 };
          a.kart.allBest = Math.max(a.kart.allBest || 0, o.kart.allBest || 0);
          Object.keys(o.kart.owned || {}).forEach(function (id) {
            var mine = a.kart.owned[id] || (a.kart.owned[id] = {});
            Object.keys(o.kart.owned[id]).forEach(function (part) { mine[part] = Math.max(mine[part] || 0, o.kart.owned[id][part]); });
          });
        }
        a.goals = a.goals || []; (o.goals || []).forEach(function (g) { if (a.goals.indexOf(g) < 0) a.goals.push(g); });
        if (firstTime) { a.inv = a.inv || {}; Object.keys(o.inv || {}).forEach(function (k) { a.inv[k] = Math.min(9, (a.inv[k] || 0) + o.inv[k]); }); }
      }
    }
    return out;
  }
  var tClasses = {}, tCodes = {};
  target.getClasses().forEach(function (c) { tClasses[c.id] = c; tCodes[c.code] = 1; });
  var sClasses = {};
  source.getClasses().forEach(function (c) { sClasses[c.id] = c; });
  var report = { classes: [], added: 0, combined: 0, same: 0 }, needClass = {}, writes = [];
  source.getStudents().forEach(function (s) {
    var t = target.getStudent(s.email), res;
    if (!t) { res = copy(s); res.mergedFrom = (res.mergedFrom || []).concat([tag]); report.added++; }
    else {
      var tNewer = (t.updated || 0) >= (s.updated || 0), newer = tNewer ? t : s, older = tNewer ? s : t;
      var first = (t.mergedFrom || []).indexOf(tag) < 0;
      res = copy(t);
      res.state = mergeState(newer.state, older.state, first);
      res.classId = tClasses[newer.classId] || sClasses[newer.classId] ? newer.classId : t.classId;
      res.name = newer.name || t.name;
      res.updated = Math.max(t.updated || 0, s.updated || 0);
      if (!res.accomNote && s.accomNote) res.accomNote = s.accomNote;
      if (JSON.stringify(res.state) === JSON.stringify(t.state) && res.classId === t.classId) { report.same++; return; }
      report.combined++;
      if (first) res.mergedFrom = (res.mergedFrom || []).concat([tag]);
    }
    var p = R.profile(res.state);
    res.xp = p.xp; res.level = p.level; res.doneCount = p.doneCount; res.current = p.current;
    res.seen = { level: p.level, badges: p.badges.slice(), done: Object.keys(p.done) };
    if (!tClasses[res.classId] && sClasses[res.classId]) needClass[res.classId] = 1;
    writes.push(res);
  });
  Object.keys(needClass).forEach(function (id) { report.classes.push(sClasses[id].name); });
  if (!apply) return report;
  Object.keys(needClass).forEach(function (id) {
    var c = copy(sClasses[id]);
    while (tCodes[c.code]) { c.code = ''; for (var i = 0; i < 5; i++) c.code += 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 31)); }
    tCodes[c.code] = 1;
    target.saveClass(c);
  });
  writes.forEach(function (st) { target.saveStudent(st); });
  // lesson videos and starter links the teacher saved
  var ts = target.getSettings() || {}, ss = source.getSettings() || {}, changed = false;
  ['videos', 'starters'].forEach(function (k) {
    Object.keys(ss[k] || {}).forEach(function (id) { ts[k] = ts[k] || {}; if (!ts[k][id]) { ts[k][id] = ss[k][id]; changed = true; } });
  });
  if (changed) target.saveSettings(ts);
  return report;
}
