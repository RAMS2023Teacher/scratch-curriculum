#!/usr/bin/env node
// Runs the built Apps Script files (dist/apps-script/Shared.gs + Code.gs) inside a fake Google
// environment (Sheets, Classroom, Session, Properties, Lock) and checks the main teacher/student flows.
// Usage: node build.js && node tools/test-apps-script.js
const assert = require('assert');
const { makeEnv } = require('./fake-gas');
const env = makeEnv();
const { ctx, props, sheetsById, created } = env;
const as = env.api;
const T = 'teacher@school.org';
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ✔ ' + name); }

console.log('Apps Script flows (fake Google environment):');
test('setup creates the data sheet with all tabs', () => {
  ctx.setup();
  const ss = sheetsById[props.DB_ID];
  assert.deepStrictEqual(ss.sheets.map(s => s.name).sort(), ['Classes', 'Progress', 'Settings', 'Students']);
});
test('teacher is recognized; a student is not', () => {
  assert.strictEqual(as(T, 'bootstrap').user.isTeacher, true);
  assert.strictEqual(as('maya.lopez@school.org', 'bootstrap').user.isTeacher, false);
});
test('students cannot reach any Classroom action', () => {
  for (const a of ['classroomCourses', 'classroomImport', 'classroomPost', 'classroomUnlink']) {
    assert.throws(() => as('maya.lopez@school.org', a, { courseId: '111' }), /Teachers only/);
  }
});
test('teacher sees their active Classroom classes', () => {
  const r = as(T, 'classroomCourses');
  assert.strictEqual(r.courses.length, 2);
  assert.strictEqual(r.courses[0].linkedClassId, null);
});
let classId;
test('import creates a class and pre-enrolls the roster (paginated) with privacy-safe names', () => {
  const r = as(T, 'classroomImport', { courseId: '111' });
  classId = r.classId;
  assert.strictEqual(r.added, 3); assert.strictEqual(r.total, 3);
  const b = as('maya.lopez@school.org', 'bootstrap');
  assert.ok(b.student, 'Maya is enrolled without a class code');
  assert.strictEqual(b.student.name, 'Maya L.');
  assert.strictEqual(b.cls.id, classId);
  const raw = sheetsById[props.DB_ID].getSheetByName('Students').data.map(r => r.join(' ')).join('\n');
  assert.ok(!/Lopez/.test(raw), 'last names are not stored');
});
test('re-sync does not duplicate students', () => {
  const r = as(T, 'classroomImport', { courseId: '111' });
  assert.strictEqual(r.added, 0); assert.strictEqual(r.kept, 3);
  assert.strictEqual(as(T, 'teacherData').students.filter(s => s.classId === classId).length, 3);
});
test('"first name only" style works', () => {
  const r = as(T, 'classroomImport', { courseId: '222', nameStyle: 'first' });
  assert.strictEqual(as('noah.k@school.org', 'bootstrap').student.name, 'Noah');
});
test('a student not on any roster still has to join with a code', () => {
  const b = as('stranger@school.org', 'bootstrap');
  assert.ok(!b.student);
});
test('posting quests creates assignments with deep links, a topic, and no duplicates', () => {
  const r = as(T, 'classroomPost', { classId, tiers: [1, 6], points: 10, due: '2026-12-01' });
  assert.strictEqual(r.results.filter(x => x.posted).length, 2);
  const [q1, q6] = created.coursework;
  assert.strictEqual(q1.title, 'Quest 1: Hello, Sprite!');
  assert.strictEqual(q1.state, 'DRAFT');
  assert.strictEqual(q1.maxPoints, 10);
  assert.strictEqual(JSON.stringify(q1.dueDate), JSON.stringify({ year: 2026, month: 12, day: 1 }));
  assert.ok(/exec\?quest=t1$/.test(q1.materials[0].link.url));
  assert.strictEqual(q6.materials.length, 3, 'fork quest links all three paths');
  assert.strictEqual(created.topics.length, 1);
  const again = as(T, 'classroomPost', { classId, tiers: [1] });
  assert.ok(again.results[0].skipped, 'already-posted quest is skipped');
  assert.strictEqual(created.coursework.length, 2);
});
test('student work shows in the Progress tab, and only teachers can approve', () => {
  const M = 'maya.lopez@school.org';
  const L = ctx.SQ_LESSONS.t1;
  L.steps.forEach((st, i) => { if (!st.stretch) as(M, 'toggleStep', { node: 't1', idx: i, value: true }); });
  L.quiz.forEach((q, i) => as(M, 'answerQuiz', { node: 't1', q: i, choice: q.answer }));
  as(M, 'submitLesson', { node: 't1', link: 'https://scratch.mit.edu/projects/1' });
  assert.throws(() => as(M, 'review', { email: M, node: 't1', approve: true }), /Teachers only/);
  as(T, 'review', { email: M, node: 't1', approve: true });
  const prog = sheetsById[props.DB_ID].getSheetByName('Progress').data;
  const header = prog[0], row = prog.find(r => r[0] === M);
  assert.strictEqual(row[header.indexOf('Q1 Hello, Sprite!')], '✔');
  assert.strictEqual(row[1], 'Maya L.');
});
test('Class Screen: teacher only, shows wins, and never shows negative information', () => {
  assert.throws(() => as('maya.lopez@school.org', 'classScreen', { classId }), /Teachers only/);
  const Li = 'liam.chen@school.org', L1 = ctx.SQ_LESSONS.t1;
  L1.steps.forEach((st, i) => { if (!st.stretch) as(Li, 'toggleStep', { node: 't1', idx: i, value: true }); });
  L1.quiz.forEach((q, i) => as(Li, 'answerQuiz', { node: 't1', q: i, choice: (q.answer + 1) % q.choices.length }));
  L1.quiz.forEach((q, i) => as(Li, 'answerQuiz', { node: 't1', q: i, choice: q.answer }));
  as(Li, 'submitLesson', { node: 't1' });
  as(T, 'review', { email: Li, node: 't1', approve: false, feedback: 'SECRET-FEEDBACK' });
  const d = as(T, 'classScreen', { classId });
  const txt = JSON.stringify(d);
  assert.ok(!/SECRET-FEEDBACK|returned|submitted|quiz|firstTry/.test(txt), 'no feedback, statuses, or quiz data');
  assert.ok(d.wins.some(w => w.name === 'Maya L.' && /Hello, Sprite/.test(w.text)), 'Maya finishing quest 1 is a win');
  assert.ok(d.members.length === 3 && d.members.every(m => !('xp' in m)));
  const saved = as(T, 'saveScreen', { classId, screen: { endAt: Date.now() + 600000, question: 'What did you learn?' }, teams: [{ name: 'Pixels', icon: '🎮' }], teamOf: { 'maya.lopez@school.org': 'tm0' } });
  assert.strictEqual(saved.cls.screen.question, 'What did you learn?');
  assert.strictEqual(saved.members.find(m => m.name === 'Maya L.').team, 'tm0');
});
test('coin shop: prices and balances are enforced on the server', () => {
  const M = 'maya.lopez@school.org';
  let me = as(M, 'bootstrap').student;
  const start = me.profile.coins;
  assert.ok(start > 0, 'Maya earned some coins from quest 1');
  assert.throws(() => as(M, 'buyItem', { cat: 'aura', id: 'galaxy' }), /more coins/);
  assert.throws(() => as(M, 'buyItem', { cat: 'hat', id: 'crown' }), /not for sale/);
  const r = as(M, 'buyItem', { cat: 'aura', id: 'glow' });
  assert.strictEqual(r.student.profile.coins, start - 40);
  assert.throws(() => as(M, 'buyItem', { cat: 'aura', id: 'glow' }), /already own/);
  const saved = as(M, 'saveAvatar', { avatar: { aura: 'glow', frame: 'diamond', title: 'wizard' } }).student.state.avatar;
  assert.strictEqual(saved.aura, 'glow'); assert.strictEqual(saved.frame, 'none'); assert.strictEqual(saved.title, 'none');
  assert.strictEqual(as(M, 'setGoal', { key: 'aura:galaxy' }).student.profile.goal, 'aura:galaxy');
  assert.throws(() => as(M, 'setGoal', { key: 'hat:crown' }), /not in the shop/);
  const xpBefore = as(M, 'bootstrap').student.profile.xp;
  assert.strictEqual(xpBefore, me.profile.xp, 'spending coins never lowers XP');
});
test('arcade: teacher lock, earned passes, power-ups and score checks', () => {
  const M = 'maya.lopez@school.org';
  assert.throws(() => as(M, 'arcadeStart', {}), /locked/);
  as(T, 'setArcade', { classId, mode: 'earned', minutes: 30 });
  assert.throws(() => as(M, 'arcadeStart', {}), /pass first/);
  let a = as(M, 'arcade');
  assert.strictEqual(a.info.mode, 'earned');
  assert.ok(a.me.tickets >= 1, 'a finished quest earns a ticket');
  const tix = a.me.tickets;
  const pass = as(M, 'arcadePass').me;
  assert.ok(pass.until > Date.now() && pass.until <= Date.now() + 5 * 60e3 + 1000, '5-minute pass');
  assert.strictEqual(pass.tickets, tix - 1);
  assert.throws(() => as(M, 'arcadePass'), /already running/);
  as(T, 'bonus', { email: M, amount: 500, note: 'test' });
  const xp = as(M, 'bootstrap').student.profile.xp, coins = as(M, 'bootstrap').student.profile.coins;
  const bought = as(M, 'arcadeBuy', { item: 'shield' });
  assert.strictEqual(bought.me.inv.shield, 1);
  assert.strictEqual(bought.student.profile.coins, coins - 15);
  assert.strictEqual(bought.student.profile.xp, xp, 'spending coins never lowers XP');
  assert.throws(() => as(M, 'arcadeBuy', { item: 'rocket' }), /not in the arcade shop/);
  const run = as(M, 'arcadeStart', { power: ['shield', 'magnet', 'nope'] }).run;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(run.power)), ['shield'], 'only owned power-ups are used');
  const end = as(M, 'arcadeEnd', { runId: run.id, score: 999999 });
  assert.ok(end.score < 1000, 'impossible scores are capped');
  assert.ok(end.newBest && end.place === 1 && end.board[0].name === 'Maya L.');
  assert.throws(() => as(M, 'arcadeEnd', { runId: run.id, score: 50 }), /not found/);
  assert.ok(!/@/.test(JSON.stringify(as(M, 'arcade').board)), 'leaderboard has no emails');
  as(T, 'setArcade', { classId, mode: 'off' });
  assert.throws(() => as(M, 'arcadeStart', {}), /locked/);
  assert.strictEqual(as(M, 'arcade').me.until, 0, 'locking ends passes');
  as(T, 'setArcade', { classId, mode: 'free', minutes: 15 });
  assert.ok(as(M, 'arcadeStart', {}).run, 'free play needs no ticket');
  assert.strictEqual(as(T, 'setArcade', { classId, resetBoard: true }).board.length, 0);
  assert.ok(as(M, 'arcade').me.allBest > 0, 'all-time best is kept');
  assert.throws(() => as(M, 'setArcade', { classId, mode: 'free' }), /Teachers only/);
});
test('help requests: students ask, only teachers see the list, no emails in it', () => {
  const M = 'maya.lopez@school.org', L2 = 'liam.chen@school.org';
  assert.strictEqual(as(M, 'myHelp').help.open, false);
  as(M, 'askHelp', { node: 't1', step: 0, note: 'my sprite <b>will not</b> move' });
  assert.strictEqual(as(M, 'myHelp').help.open, true);
  const list = as(T, 'helpList', { classId }).list;
  assert.strictEqual(list.length, 1);
  assert.ok(/Hello, Sprite/.test(list[0].where) && /Step 1/.test(list[0].where), list[0].where);
  assert.ok(!/[<>]/.test(list[0].note) && !/@/.test(JSON.stringify(list)), 'note is cleaned and there are no emails');
  assert.throws(() => as(L2, 'helpList', { classId }), /Teachers only/);
  assert.throws(() => as(L2, 'helpDone', { classId, who: list[0].who }), /Teachers only/);
  assert.ok(as(T, 'classScreen', { classId }).members.some(m => m.hid === list[0].who), 'the Class Screen can match the request to an avatar');
  assert.strictEqual(as(T, 'helpDone', { classId, who: list[0].who }).list.length, 0);
  assert.strictEqual(as(M, 'myHelp').help.open, false);
  as(M, 'askHelp', { node: 't1', step: 'quiz' }); as(M, 'cancelHelp');
  assert.strictEqual(as(T, 'helpList', { classId }).list.length, 0, 'students can cancel');
});
test('lesson feedback: confusing flags and ratings are saved; rating gives +10 XP once', () => {
  const M = 'maya.lopez@school.org';
  const xp0 = as(M, 'bootstrap').student.profile.xp;
  as(M, 'flagConfusing', { node: 't1', kind: 'step', idx: 1, reason: 'unclear', note: 'where is the button' });
  assert.throws(() => as(M, 'flagConfusing', { node: 't1', kind: 'step', idx: 99, reason: 'unclear' }), /Unknown step/);
  assert.throws(() => as(M, 'rateLesson', { node: 't1', rating: 9 }), /Pick a face/);
  assert.throws(() => as(M, 'rateLesson', { node: 'g4', rating: 4 }), /Start this quest/);
  const r1 = as(M, 'rateLesson', { node: 't1', rating: 4, hardest: 'the glide block', change: 'more pictures' });
  assert.strictEqual(r1.student.profile.xp, xp0 + 10);
  assert.strictEqual(as(M, 'rateLesson', { node: 't1', rating: 5 }).student.profile.xp, xp0 + 10, 'changing a rating gives no extra XP');
  const fb = as(T, 'teacherData').students.find(x => x.email === M).state.fb.t1;
  assert.strictEqual(fb.rating, 5); assert.strictEqual(fb.flags['step:1'].reason, 'unclear');
  assert.strictEqual(fb.help['0'], 1); assert.strictEqual(fb.help.quiz, 1);
  as(T, 'reopen', { email: M, node: 't1' });
  assert.ok(as(T, 'teacherData').students.find(x => x.email === M).state.fb.t1.rating, 'reopening a quest keeps its feedback');
});
test('teacher-only settings: accommodations note is not sent to the student', () => {
  as(T, 'updateStudent', { email: 'liam.chen@school.org', accom: { coreOnly: true, note: 'IEP: chunk tasks' } });
  const self = JSON.stringify(as('liam.chen@school.org', 'bootstrap'));
  assert.ok(!/chunk tasks/.test(self));
  assert.ok(/chunk tasks/.test(JSON.stringify(as(T, 'teacherData'))));
});
test('delete class needs the class code, then removes its students everywhere', () => {
  const code = as(T, 'teacherData').classes.find(c => c.id === classId).code;
  assert.throws(() => as(T, 'deleteClass', { id: classId, confirm: 'nope' }), /class code/);
  const r = as(T, 'deleteClass', { id: classId, confirm: code });
  assert.strictEqual(r.removed, 3);
  const ss = sheetsById[props.DB_ID];
  assert.ok(!ss.getSheetByName('Students').data.some(r => /maya/.test(r[0])));
  assert.ok(!ss.getSheetByName('Progress').data.some(r => /maya/.test(r[0])));
});
console.log('\n' + passed + ' checks passed.');
