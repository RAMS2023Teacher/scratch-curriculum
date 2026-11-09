/* Scratch Quest — client API.
 * In Google Apps Script: calls the server with google.script.run.api(action, args).
 * Anywhere else (demo / preview): runs the same SQ_SERVICE in the browser with a
 * localStorage store and a pretend class full of sample students.
 */
var SQ_API = (function () {
  var isGAS = typeof google !== 'undefined' && google.script && google.script.run;

  if (isGAS) {
    return {
      demo: false,
      loadLessons: function (cb, fail) {
        google.script.run.withSuccessHandler(cb).withFailureHandler(fail).api('lessons', {});
      },
      // Quest links posted to Classroom look like .../exec?quest=t3 — read that from the outer page
      deepLink: function (cb) {
        try { google.script.url.getLocation(function (loc) { cb((loc && loc.parameter && loc.parameter.quest) || null); }); }
        catch (e) { cb(null); }
      },
      call: function (action, args) {
        return new Promise(function (resolve, reject) {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(function (e) { reject(new Error((e && e.message) || String(e))); })
            .api(action, args || {});
        });
      }
    };
  }

  // ------------------------------------------------------------------ demo mode
  var KEY = 'scratchQuestDemo.v3';
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { mem = null; }
    if (!mem || !mem.classes) mem = seed();
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* private mode: keep in memory */ } }

  var store = {
    getClasses: function () { return load().classes; },
    saveClass: function (c) { var d = load(); var i = d.classes.findIndex(function (k) { return k.id === c.id; }); if (i >= 0) d.classes[i] = c; else d.classes.push(c); save(); },
    getStudents: function () { return load().students; },
    getStudent: function (email) { return load().students.filter(function (s) { return s.email === email; })[0] || null; },
    saveStudent: function (s) { var d = load(); var i = d.students.findIndex(function (k) { return k.email === s.email; }); if (i >= 0) d.students[i] = s; else d.students.push(s); save(); },
    deleteClass: function (id) { var d = load(); d.classes = d.classes.filter(function (c) { return c.id !== id; }); save(); },
    deleteStudent: function (email) { var d = load(); d.students = d.students.filter(function (s) { return s.email !== email; }); save(); },
    getSettings: function () { return load().settings || {}; },
    saveSettings: function (o) { load().settings = o; save(); }
  };

  function seed() {
    var R = SQ_RULES;
    var d = { classes: [], students: [], settings: { videos: {} }, role: 'student' };
    var cls = { id: 'demo1', name: 'Period 3 · Demo Class', code: 'DEMO1', teacher: 'teacher@demo', openThrough: 14,
      requireApproval: true, requireLink: false, showLeaderboard: false, classGoal: 25000, archived: false };
    d.classes.push(cls, { id: 'demo2', name: 'Period 5 · Demo Class', code: 'PIXEL', teacher: 'teacher@demo', openThrough: 7,
      requireApproval: true, requireLink: false, showLeaderboard: true, classGoal: 15000, archived: false });
    var names = ['Ava', 'Liam', 'Maya', 'Noah', 'Zoe', 'Ethan', 'Priya', 'Lucas', 'Chloe', 'Mateo', 'Isla', 'Owen', 'Sofia', 'Jayden'];
    var paths = [
      ['t1', 't2', 't3', 't4', 't5', 'g1', 'g2', 'm1', 'm2', 'g3'],
      ['t1', 't2', 't3', 't4', 't5', 's1', 's2', 'm1'],
      ['t1', 't2', 't3', 't4', 't5', 'a1', 'a2', 'm1', 'm2', 's3', 's4'],
      ['t1', 't2', 't3', 't4', 't5', 'g1'],
      ['t1', 't2', 't3'],
      ['t1', 't2', 't3', 't4', 't5', 's1'],
      ['t1', 't2', 't3', 't4', 't5', 'a1', 'a2'],
      ['t1', 't2', 't3', 't4', 't5', 'g1', 'g2', 'm1', 'm2', 'a3', 'a4', 'f1'],
      ['t1', 't2'],
      ['t1', 't2', 't3', 't4', 't5', 'g1', 'g2'],
      ['t1', 't2', 't3', 't4', 't5', 's1', 's2', 'm1', 'm2'],
      ['t1', 't2', 't3', 't4', 't5'],
      ['t1', 't2', 't3', 't4', 't5', 'a1'],
      ['t1', 't2', 't3', 't4', 't5', 'g1', 'g2', 'm1']
    ];
    var t = Date.now() - 1000 * 60 * 60 * 24 * 20;
    names.forEach(function (n, i) {
      var st = R.newState();
      st.avatar = SQ_AVATAR.randomAvatar(i * 7919 + 13);
      st.avatarSet = i % 3 !== 0;
      var path = paths[i];
      path.forEach(function (id, j) {
        var L = SQ_LESSONS[id], ns = R.nodeState(st, id);
        var last = j === path.length - 1;
        var full = !last || i % 2 === 0;
        ns.steps = L.steps.map(function (_, k) { return full || k < 2; });
        if (full) {
          ns.quiz = { 0: { tries: 1, correct: true, firstTry: (i + j) % 3 !== 0 }, 1: { tries: 2, correct: true, firstTry: false } };
          ns.challenge = (i + j) % 2 === 0;
          ns.link = 'https://scratch.mit.edu/projects/' + (900000000 + i * 1000 + j);
          ns.reflection = ['The loops were tricky at first but I figured it out!', 'I am proud of my animation.', 'I added an extra sound effect.'][(i + j) % 3];
          ns.status = last && i % 4 === 0 ? 'submitted' : 'done';
          ns.submittedAt = ns.doneAt = t + (j * 2 + i % 3) * 86400000;
        }
        ns.touched = t + (j * 2 + i % 3) * 86400000;
      });
      if (i === 2) st.awards.push({ id: 'helper', note: 'Helped Owen fix his loop.', at: t });
      if (i === 7) st.awards.push({ id: 'creative', note: 'Amazing paint app idea!', at: t });
      var email = n.toLowerCase() + '@demo.school';
      var s = { email: email, name: n, classId: i < 11 ? 'demo1' : 'demo2', state: st, joined: t };
      var p = R.profile(st);
      s.xp = p.xp; s.level = p.level; s.doneCount = p.doneCount; s.current = p.current; s.updated = Date.now() - i * 3600000 * 9;
      s.seen = { level: p.level, badges: p.badges.slice(), done: Object.keys(p.done) };
      var lastDone = path.filter(function (id) { return p.done[id]; }).slice(-1)[0];
      s.wins = [];
      if (lastDone) s.wins.push({ t: Date.now() - (i * 7 + 3) * 60000, kind: 'quest', ref: lastDone });
      if (i % 3 === 0 && p.badges.length) s.wins.push({ t: Date.now() - (i * 5 + 1) * 60000, kind: 'badge', ref: p.badges[p.badges.length - 1] });
      if (i % 4 === 1) s.wins.push({ t: Date.now() - (i * 4 + 2) * 60000, kind: 'level', ref: p.level });
      d.students.push(s);
    });
    return d;
  }

  var service = SQ_SERVICE(store);
  // A pretend Google Classroom for the demo
  var fakeClassroom = {
    listCourses: function () {
      return [{ id: 'gc101', name: '6th Grade Computer Science', section: 'Period 1', link: 'https://classroom.google.com/' },
        { id: 'gc102', name: '6th Grade Computer Science', section: 'Period 6', link: 'https://classroom.google.com/' }];
    },
    listStudents: function (courseId) {
      var names = courseId === 'gc101' ? [['Amelia', 'Ortiz'], ['Ben', 'Walsh'], ['Carmen', 'Diaz'], ['Dev', 'Patel'], ['Elena', 'Rossi'], ['Finn', 'Murphy']]
        : [['Grace', 'Nguyen'], ['Hugo', 'Silva'], ['Iris', 'Cohen']];
      return names.map(function (n) { return { email: (n[0] + '.' + n[1]).toLowerCase() + '@demo.school', given: n[0], family: n[1] }; });
    },
    ensureTopic: function () { return 'topic1'; },
    createCourseWork: function (courseId, cw) { var id = 'cw' + Math.floor(Math.random() * 1e6); return { id: id, link: 'https://classroom.google.com/' }; },
    appUrl: function () { return String(location.href).split('#')[0].split('?')[0]; }
  };
  var classroom = SQ_CLASSROOM(store, fakeClassroom);
  var USERS = {
    student: { email: 'you@demo.school', name: 'You', isTeacher: false },
    teacher: { email: 'teacher@demo', name: 'Teacher', isTeacher: true }
  };

  return {
    demo: true,
    deepLink: function (cb) { var m = String(location.search).match(/[?&]quest=([a-z0-9]+)/); cb(m ? m[1] : null); },
    role: function () { return load().role || 'student'; },
    setRole: function (r) { load().role = r; save(); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) { } mem = null; },
    call: function (action, args) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            var user = USERS[load().role || 'student'];
            var h = /^classroom/.test(action) ? classroom : service;
            if (h === classroom && !user.isTeacher) throw new Error('Teachers only.');
            if (typeof h[action] !== 'function') throw new Error('Unknown action: ' + action);
            var out = h[action](user, JSON.parse(JSON.stringify(args || {})));
            resolve(JSON.parse(JSON.stringify(out)));
          } catch (e) { reject(e); }
        }, 60);
      });
    }
  };
})();
