/* Scratch Quest — Google Classroom integration (teacher-only).
 * Shared logic: runs in Apps Script (with the real Classroom API adapter in apps-script/Code.gs)
 * and in the browser demo (with a pretend Classroom). Plain JS, no modules.
 *
 * Privacy by design:
 *  - Rosters are READ-ONLY. We never change anything in Classroom except creating assignments.
 *  - We store only a student's school email and first name + last initial. No photos, no full names, no user IDs.
 *  - Every action here requires a teacher account.
 *
 * gc adapter interface:
 *   listCourses() -> [{ id, name, section, link }]
 *   listStudents(courseId) -> [{ email, given, family }]
 *   ensureTopic(courseId, name) -> topicId
 *   createCourseWork(courseId, cw) -> { id, link }
 *   appUrl() -> the web app URL ('' if unknown)
 */
function SQ_CLASSROOM(store, gc) {
  var R = SQ_RULES, A = SQ_AVATAR;
  function err(m) { throw new Error(m); }
  function requireTeacher(user) { if (!user || !user.isTeacher) err('Teachers only.'); }
  function now() { return Date.now(); }
  function clean(s, max) { return String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max || 200); }
  function findClass(id) { return store.getClasses().filter(function (c) { return c.id === id; })[0] || null; }

  // "Maya Lopez" -> "Maya L." (or "Maya" with nameStyle 'first')
  function displayName(given, family, style) {
    var g = clean(given, 20) || 'Student';
    if (style === 'first') return g;
    var f = clean(family, 20);
    return f ? g + ' ' + f.charAt(0).toUpperCase() + '.' : g;
  }
  function makeCode() {
    var abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', taken = {}, code;
    store.getClasses().forEach(function (c) { taken[c.code] = true; });
    do { code = ''; for (var i = 0; i < 5; i++) code += abc.charAt(Math.floor(Math.random() * abc.length)); } while (taken[code]);
    return code;
  }
  function tierTitle(t) {
    var nodes = R.NODES.filter(function (n) { return n.tier === t; });
    if (nodes.length === 1) return SQ_LESSONS[nodes[0].id].title;
    return 'Choose your path: ' + nodes.map(function (n) { return R.BRANCHES[n.branch].name.replace(/ II$/, ''); }).join(', ');
  }
  function questUrl(id) {
    var base = gc.appUrl() || '';
    return base ? base + (base.indexOf('?') >= 0 ? '&' : '?') + 'quest=' + id : '';
  }

  return {
    tierTitle: tierTitle,

    classroomCourses: function (user) {
      requireTeacher(user);
      var linked = {};
      store.getClasses().forEach(function (c) { if (c.courseId) linked[c.courseId] = c.id; });
      return { courses: gc.listCourses().map(function (c) { return { id: c.id, name: c.name, section: c.section || '', link: c.link || '', linkedClassId: linked[c.id] || null }; }) };
    },

    // Create (or link) a Scratch Quest class for a Classroom course, then copy in the roster.
    classroomImport: function (user, args) {
      requireTeacher(user);
      var course = gc.listCourses().filter(function (c) { return c.id === String(args.courseId); })[0];
      if (!course) err('That Classroom class was not found. Are you a teacher in it?');
      var style = args.nameStyle === 'first' ? 'first' : 'initial';
      var cls = store.getClasses().filter(function (c) { return c.courseId === course.id; })[0] || (args.classId ? findClass(args.classId) : null);
      if (!cls) {
        cls = { id: 'c' + now().toString(36) + Math.floor(Math.random() * 1000), name: clean(course.name + (course.section ? ' · ' + course.section : ''), 40),
          code: makeCode(), teacher: user.email, created: now(), openThrough: R.MAX_TIER, requireApproval: true, requireLink: false, showLeaderboard: false, classGoal: 25000, archived: false };
      }
      cls.courseId = course.id; cls.courseName = clean(course.name, 60); cls.courseLink = course.link || ''; cls.nameStyle = style;
      cls.syncedAt = now();
      store.saveClass(cls);

      var roster = gc.listStudents(course.id);
      var added = 0, moved = 0, kept = 0, seen = {};
      roster.forEach(function (p) {
        var email = String(p.email || '').toLowerCase();
        if (!email) return;
        seen[email] = true;
        var st = store.getStudent(email);
        if (!st) {
          st = { email: email, name: displayName(p.given, p.family, style), classId: cls.id, state: R.newState(), joined: now(), fromClassroom: true };
          st.state.avatar = A.randomAvatar();
          added++;
        } else {
          if (st.classId !== cls.id) moved++; else kept++;
          st.classId = cls.id;
          if (st.fromClassroom || args.renameExisting) st.name = displayName(p.given, p.family, style);
        }
        var prof = R.profile(st.state);
        st.xp = prof.xp; st.level = prof.level; st.doneCount = prof.doneCount; st.current = prof.current; st.updated = st.updated || now();
        store.saveStudent(st);
      });
      var notInRoster = store.getStudents().filter(function (s) { return s.classId === cls.id && !s.isTeacher && !seen[s.email]; }).map(function (s) { return s.name; });
      return { classId: cls.id, added: added, moved: moved, kept: kept, total: roster.length, missingEmails: roster.filter(function (p) { return !p.email; }).length, notInRoster: notInRoster };
    },

    // Post quests (by tier) to the linked Classroom class as assignments under a "Scratch Quest" topic.
    classroomPost: function (user, args) {
      requireTeacher(user);
      var cls = findClass(args.classId);
      if (!cls || !cls.courseId) err('Link this class to Google Classroom first.');
      var tiers = (args.tiers || []).map(Number).filter(function (t) { return t >= 1 && t <= R.MAX_TIER; });
      if (!tiers.length) err('Pick at least one quest to post.');
      var state = args.publish ? 'PUBLISHED' : 'DRAFT';
      var points = Math.max(0, Math.min(1000, Math.round(Number(args.points) || 0)));
      var due = null;
      if (args.due && /^\d{4}-\d{2}-\d{2}$/.test(args.due)) {
        var d = args.due.split('-').map(Number);
        due = { dueDate: { year: d[0], month: d[1], day: d[2] }, dueTime: { hours: 23, minutes: 59 } };
      }
      cls.posted = cls.posted || {};
      if (!cls.topicId) { cls.topicId = gc.ensureTopic(cls.courseId, 'Scratch Quest'); store.saveClass(cls); }
      var results = [];
      tiers.sort(function (a, b) { return a - b; }).forEach(function (t) {
        if (cls.posted[t] && !args.repost) { results.push({ tier: t, skipped: true, link: cls.posted[t].link }); return; }
        var nodes = R.NODES.filter(function (n) { return n.tier === t; });
        var fork = nodes.length > 1;
        var desc = fork
          ? 'Choose ONE path and do that quest:\n' + nodes.map(function (n) { var L = SQ_LESSONS[n.id]; return '• ' + R.BRANCHES[n.branch].name + ': ' + L.title + ' (' + L.mission + ')'; }).join('\n')
          : SQ_LESSONS[nodes[0].id].mission;
        desc += '\n\nOpen the link below to start the quest in Scratch Quest. Turn it in there when you finish. ' +
          (fork ? 'Pick the path you want.' : 'About ' + SQ_LESSONS[nodes[0].id].minutes + ' minutes.');
        var materials = nodes.map(function (n) {
          var url = questUrl(n.id);
          return url ? { link: { url: url, title: (fork ? R.BRANCHES[n.branch].name + ': ' : '') + SQ_LESSONS[n.id].title + ' — Scratch Quest' } } : null;
        }).filter(Boolean);
        var cw = { title: 'Quest ' + t + ': ' + tierTitle(t), description: desc, workType: 'ASSIGNMENT', state: state, topicId: cls.topicId, materials: materials };
        if (points) cw.maxPoints = points;
        if (due) { cw.dueDate = due.dueDate; cw.dueTime = due.dueTime; }
        var made = gc.createCourseWork(cls.courseId, cw);
        cls.posted[t] = { id: made.id, link: made.link || '', state: state, at: now() };
        results.push({ tier: t, posted: true, link: made.link || '' });
      });
      store.saveClass(cls);
      return { results: results, posted: cls.posted };
    },

    // Forget the Classroom link (does not touch Classroom itself).
    classroomUnlink: function (user, args) {
      requireTeacher(user);
      var cls = findClass(args.classId);
      if (!cls) err('Class not found.');
      delete cls.courseId; delete cls.courseName; delete cls.courseLink; delete cls.topicId; delete cls.posted;
      store.saveClass(cls);
      return { ok: true };
    }
  };
}
