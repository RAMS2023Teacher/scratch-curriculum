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
  var R = SQ_RULES, A = SQ_AVATAR;

  function err(msg) { throw new Error(msg); }
  function now() { return Date.now(); }
  function clean(s, max) { return String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max || 200); }

  function findClass(id) { return store.getClasses().filter(function (c) { return c.id === id; })[0] || null; }
  function classDefaults(c) {
    var d = { openThrough: R.MAX_TIER, requireApproval: true, requireLink: false, showLeaderboard: false, classGoal: 25000, archived: false };
    for (var k in d) if (c[k] === undefined) c[k] = d[k];
    return c;
  }
  function publicClass(c) {
    if (!c) return null;
    classDefaults(c);
    return { id: c.id, name: c.name, code: c.code, openThrough: c.openThrough, requireApproval: c.requireApproval,
      requireLink: c.requireLink, showLeaderboard: c.showLeaderboard, classGoal: c.classGoal, archived: c.archived };
  }
  // Teachers also see the Google Classroom link details
  function teacherClass(c) {
    var o = publicClass(c);
    o.courseId = c.courseId || null; o.courseName = c.courseName || ''; o.courseLink = c.courseLink || '';
    o.posted = c.posted || {}; o.nameStyle = c.nameStyle || 'initial'; o.syncedAt = c.syncedAt || null;
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
    var status = R.nodeStatus(st.state, id, c.openThrough);
    if (status === 'locked') err('That quest is still locked. Finish the quests before it first!');
    if (status === 'gated') err('Your teacher has not opened that quest yet.');
    return { status: status, cls: c };
  }
  function touch(ns) { ns.touched = now(); }

  function settings() { var s = store.getSettings() || {}; s.videos = s.videos || {}; s.starters = s.starters || {}; return s; }

  function classMembers(classId) {
    return store.getStudents().filter(function (s) { return s.classId === classId; }).map(function (s) {
      var p = R.profile(s.state);
      var h = 7;
      for (var i = 0; i < s.email.length; i++) h = (h * 31 + s.email.charCodeAt(i)) % 2147483647;
      return { id: 'm' + h.toString(36),
        name: s.name, avatar: s.state.avatar || A.DEFAULT, xp: p.xp, level: p.level, rank: p.rank,
        current: p.current, done: Object.keys(p.done), badges: p.badges.length, teacher: !!s.isTeacher };
    });
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
      var members = classMembers(classId);
      var total = members.reduce(function (a, m) { return a + m.xp; }, 0);
      return { cls: publicClass(c), members: members, classXP: total };
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

    toggleStep: function (user, args) {
      var st = requireStudent(user), id = args.node, L = lesson(id);
      var w = workable(st, id);
      if (w.status === 'done' || w.status === 'submitted') err('This quest is already turned in.');
      var i = Number(args.idx);
      if (!(i >= 0 && i < L.steps.length)) err('Bad step.');
      var ns = R.nodeState(st.state, id);
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
      if (!r.correct) {
        r.tries++;
        if (correct) { r.correct = true; r.firstTry = r.tries === 1; }
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
      if (w.cls.requireLink && !link) err('Paste the link to your Scratch project.');
      ns.link = link;
      ns.reflection = clean(args.reflection, 600);
      ns.submittedAt = now(); touch(ns);
      ns.status = w.cls.requireApproval ? 'submitted' : 'done';
      if (ns.status === 'done') ns.doneAt = now();
      return { student: persist(st) };
    },

    // ---------------------------------------------------------- teacher
    teacherData: function (user) {
      requireTeacher(user);
      return {
        classes: store.getClasses().map(teacherClass),
        students: store.getStudents().map(function (s) {
          return { email: s.email, name: s.name, classId: s.classId, isTeacher: !!s.isTeacher, state: s.state, profile: R.profile(s.state), updated: s.updated, accomNote: s.accomNote || '' };
        }),
        settings: settings()
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
      ['requireApproval', 'requireLink', 'showLeaderboard', 'archived'].forEach(function (k) { if (p[k] !== undefined) c[k] = !!p[k]; });
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
          doneCount: p.doneCount, team: teamOf[s.email] || null, helper: p.badges.indexOf('helper') >= 0, xp: p.xp };
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
          .sort(function (a, b) { return (b.helper - a.helper) || (b.xp - a.xp); }).slice(0, 3).map(function (m) { return { name: m.name, avatar: m.avatar }; });
        return { quest: q, title: SQ_LESSONS[q] ? SQ_LESSONS[q].title : q, working: counts[q], helpers: who };
      }).filter(function (h) { return h.helpers.length; });
      // "Race to the finish": where each student is inside today's quest (positive-only stages).
      var sc0 = c.screen || {};
      var raceQ = (args.quest && SQ_LESSONS[args.quest]) ? args.quest
        : ((sc0.focus || []).filter(function (id) { return SQ_LESSONS[id]; })[0] || Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || 't1');
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
        else if (R.NODE[m.current]) others.push({ name: m.name, avatar: m.avatar, quest: m.current, tier: R.NODE[m.current].tier });
      });
      var race = { quest: raceQ, tier: R.NODE[raceQ].tier, title: RL.title, stations: stations, others: others };
      members.forEach(function (m) { delete m.xp; });
      var classXP = studs.reduce(function (a, s) { return a + R.profile(s.state).xp; }, 0);
      return { cls: { id: c.id, name: c.name, code: c.code, classGoal: c.classGoal, screen: c.screen || {}, teams: c.teams || [] },
        members: members, wins: wins.slice(0, 10), helpers: helpers, classXP: classXP, race: race, serverNow: now() };
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
