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
  assert.deepStrictEqual(ss.sheets.map(s => s.name).sort(), ['Bugs', 'Classes', 'Progress', 'Settings', 'Students', 'Translations']);
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
  // the teacher can choose the topic (unit title), a unit number and the label
  as(T, 'classroomPost', { classId, tiers: [2], topic: 'Unit 2: Scratch', unit: '2', word: 'Lesson' });
  const q2 = created.coursework[2];
  assert.strictEqual(q2.title, 'Lesson 2.2: Lights, Camera, Events!');
  assert.strictEqual(created.topics.length, 2);
  assert.strictEqual(created.topics[1].name, 'Unit 2: Scratch');
  assert.strictEqual(q2.topicId, created.topics[1].topicId);
  const saved = as(T, 'teacherData').classes.find(c => c.id === classId);
  assert.strictEqual(saved.gcTopic, 'Unit 2: Scratch'); assert.strictEqual(saved.gcUnit, '2'); assert.strictEqual(saved.gcWord, 'Lesson');
  as(T, 'classroomPost', { classId, tiers: [3], word: '' });
  assert.strictEqual(created.coursework[3].title, '2.3: Loop-de-Loop', 'a blank label gives just the number');
  assert.strictEqual(created.topics.length, 2, 'the saved topic is reused');
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
  assert.strictEqual(as(M, 'arcade').info.questsPerTicket, 2, 'by default it takes 2 finished quests to earn a ticket');
  assert.strictEqual(as(M, 'arcade').me.tickets, 0, 'one finished quest is not enough for a ticket');
  assert.throws(() => as(M, 'arcadePass'), /need a ticket/);
  as(T, 'setArcade', { classId, questsPerTicket: 1, ticketPrice: 0 });
  assert.throws(() => as(M, 'arcadeBuy', { item: 'ticket' }), /only be earned/);
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
  // rewards: coins for the run and for each score goal reached (300 -> 20 coins, 600 -> 40 coins...)
  const goalCoins = end.goals.reduce((a, g) => a + g.coins, 0);
  assert.ok(end.goals.length >= 1 && end.goals[0].score === 300, 'score goals are awarded');
  assert.strictEqual(end.coins, Math.min(25, Math.floor(end.score / 100)) + goalCoins);
  assert.strictEqual(end.student.profile.coins, bought.student.profile.coins + end.coins, 'arcade coins are added to the balance');
  assert.strictEqual(end.student.profile.xp, xp, 'the arcade never changes XP');
  assert.ok(end.student.profile.badges.includes('arcade_rookie'));
  assert.throws(() => as(M, 'arcadeEnd', { runId: run.id, score: 50 }), /not found/);
  assert.ok(!/@/.test(JSON.stringify(as(M, 'arcade').board)), 'leaderboard has no emails');
  as(T, 'setArcade', { classId, mode: 'off' });
  assert.throws(() => as(M, 'arcadeStart', {}), /locked/);
  assert.strictEqual(as(M, 'arcade').me.until, 0, 'locking ends passes');
  as(T, 'setArcade', { classId, mode: 'free', minutes: 15 });
  assert.ok(as(M, 'arcadeStart', {}).run, 'free play needs no ticket');
  const coinsBefore = as(M, 'bootstrap').student.profile.coins;
  const reset = as(T, 'setArcade', { classId, resetBoard: true });
  assert.strictEqual(reset.board.length, 0);
  assert.strictEqual(reset.winners[0].name, 'Maya L.'); assert.strictEqual(reset.winners[0].coins, 100);
  const after = as(M, 'bootstrap').student.profile;
  assert.strictEqual(after.coins, coinsBefore + 100, 'the round winner gets 100 coins');
  assert.ok(after.badges.includes('round_champ'));
  assert.ok(as(M, 'arcade').me.allBest > 0, 'all-time best is kept');
  assert.throws(() => as(M, 'setArcade', { classId, mode: 'free' }), /Teachers only/);
});
test('Kart Dash: karts and upgrades cost coins, and the game has its own leaderboard', () => {
  const M = 'maya.lopez@school.org';
  as(T, 'setArcade', { classId, mode: 'free', minutes: 30 });
  as(T, 'bonus', { email: M, amount: 1000, note: 'test coins' });
  const start = as(M, 'bootstrap').student.profile, rushBest = as(M, 'arcade').me.best;
  assert.deepStrictEqual(Object.keys(as(M, 'arcade').me.kart.owned), ['starter'], 'everyone starts with the free Go-Kart');
  assert.throws(() => as(M, 'kartBuy', { kart: 'gold' }), /more coins/);
  assert.throws(() => as(M, 'kartBuy', { kart: 'hovercraft' }), /not in the garage/);
  assert.throws(() => as(M, 'kartUpgrade', { kart: 'bolt', part: 'engine' }), /Buy that kart first/);
  const buy = as(M, 'kartBuy', { kart: 'bolt' });
  assert.strictEqual(buy.student.profile.coins, start.coins - 150); assert.strictEqual(buy.me.kart.active, 'bolt');
  assert.throws(() => as(M, 'kartBuy', { kart: 'bolt' }), /already own/);
  const up = as(M, 'kartUpgrade', { kart: 'bolt', part: 'engine' });
  assert.strictEqual(up.me.kart.owned.bolt.engine, 1); assert.strictEqual(up.student.profile.coins, start.coins - 150 - 40);
  assert.strictEqual(up.student.profile.xp, start.xp, 'buying karts never changes XP');
  assert.strictEqual(ctx.SQ_ARCADE.kartStats('bolt', { engine: 1 }).speed, 1.17, 'an engine upgrade makes the kart 6% faster');
  assert.throws(() => as(M, 'kartUpgrade', { kart: 'bolt', part: 'wings' }), /does not exist/);
  assert.throws(() => as(M, 'kartSelect', { kart: 'rocket' }), /Buy that kart first/);
  assert.strictEqual(as(M, 'kartSelect', { kart: 'starter' }).me.kart.active, 'starter');
  const run = as(M, 'arcadeStart', { game: 'kart', power: ['slow', 'heart'] }).run;
  assert.strictEqual(run.game, 'kart'); assert.strictEqual(run.power.length, 0, 'power-ups that do nothing in Kart Dash are not used up');
  const end = as(M, 'arcadeEnd', { runId: run.id, score: 420 });
  assert.strictEqual(end.game, 'kart'); assert.strictEqual(end.score, 420); assert.strictEqual(end.goals.length, 0);
  assert.ok(end.student.profile.badges.includes('kart_racer'));
  const a = as(M, 'arcade');
  assert.strictEqual(a.kartBoard[0].name, 'Maya L.'); assert.strictEqual(a.kartBoard[0].score, 420);
  assert.strictEqual(a.me.kart.best, 420); assert.strictEqual(a.me.best, rushBest, 'the Block Rush score is separate');
  as(T, 'setArcade', { classId, mode: 'off' });
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
test('bug reports: anyone in a class can send one; only teachers can read them', () => {
  const M = 'maya.lopez@school.org';
  as(M, 'reportBug', { text: 'The I did it button <b>did nothing</b>', where: 'quest/t1 card 3', info: { ua: 'CrOS', screen: '1366x768', errors: ['TypeError: x is undefined'] } });
  as(M, 'reportBug', { text: 'TypeError: boom', auto: true, where: 'map' });
  as(M, 'reportBug', { text: 'TypeError: boom', auto: true, where: 'map' });
  assert.throws(() => as(M, 'bugList'), /Teachers only/);
  assert.throws(() => as('stranger@school.org', 'reportBug', { text: 'hi' }), /Join a class/);
  let bugs = as(T, 'bugList').bugs;
  assert.strictEqual(bugs.length, 2, 'the same automatic report is only saved once');
  const mine = bugs.find(b => !b.auto);
  assert.ok(!/[<>]/.test(mine.text) && mine.name === 'Maya L.' && mine.info.ua === 'CrOS' && /TypeError/.test(mine.info.errors));
  assert.strictEqual(as(T, 'teacherData').newBugs, 2);
  bugs = as(T, 'bugUpdate', { id: mine.id, status: 'fixed' }).bugs;
  assert.strictEqual(bugs.find(b => b.id === mine.id).status, 'fixed');
  assert.strictEqual(as(T, 'bugUpdate', { id: mine.id, remove: true }).bugs.length, 1);
  const sheet = sheetsById[props.DB_ID].getSheetByName('Bugs');
  assert.strictEqual(sheet.data.length, 2, 'reports are rows in the Bugs tab (after the header row)');
});
test('display settings and translation', () => {
  const M = 'maya.lopez@school.org';
  const d = as(M, 'setDisplay', { display: { size: 'xl', font: 'easy', contrast: true, motion: true, lang: 'pt', junk: 1 } }).student.state.display;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(d)), { size: 'xl', font: 'easy', contrast: true, motion: true, lang: 'pt' });
  assert.strictEqual(as(M, 'setDisplay', { display: { size: 'huge', lang: 'xx' } }).student.state.display.size, 'm');
  as(T, 'updateStudent', { email: M, display: { size: 'l', lang: 'pt' } });
  assert.strictEqual(as(M, 'bootstrap').student.state.display.lang, 'pt', 'a teacher can set it for a student');
  const out = as(M, 'translate', { lang: 'pt', items: [{ t: 'Quest Map' }, { t: 'Click the <b>green flag</b>.', html: true }] }).out;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(out)), ['[pt] Quest Map', '[pt] Click the <b>green flag</b>.']);
  const tr = sheetsById[props.DB_ID].getSheetByName('Translations');
  assert.strictEqual(tr.data.length, 3, 'translations are remembered in the Translations tab (after the header row)');
  tr.data[1][3] = 'Mapa de Missões';
  assert.strictEqual(as(M, 'translate', { lang: 'pt', items: [{ t: 'Quest Map' }] }).out[0], 'Mapa de Missões', 'a teacher correction in the Sheet is used');
  assert.strictEqual(tr.data.length, 3);
  assert.throws(() => as(M, 'translate', { lang: 'xx', items: [] }), /not available/);
  assert.throws(() => as('stranger@school.org', 'translate', { lang: 'pt', items: [] }), /Join a class/);
});
test('Class Screen: the teacher can choose which quest the track shows', () => {
  assert.strictEqual(as(T, 'saveScreen', { classId, screen: { raceQuest: 't3' } }).race.quest, 't3');
  assert.notStrictEqual(as(T, 'saveScreen', { classId, screen: { raceQuest: '' } }).cls.screen.raceQuest, 't3');
});
test('data safety: a busy Google never causes a new, empty data sheet', () => {
  const M = 'maya.lopez@school.org', realId = props.DB_ID, count = Object.keys(sheetsById).length;
  const xp = as(M, 'bootstrap').student.profile.xp;
  env.flags.failOpen = true; // Google refuses to open the spreadsheet (what happens under heavy load)
  assert.throws(() => as(M, 'bootstrap'), /BUSY/);
  assert.throws(() => as(M, 'toggleStep', { node: 't1', idx: 0, value: true }), /BUSY/);
  env.flags.failOpen = false;
  assert.strictEqual(props.DB_ID, realId, 'the app still points at the real data sheet');
  assert.strictEqual(Object.keys(sheetsById).length, count, 'no replacement spreadsheet was created');
  const b = as(M, 'bootstrap');
  assert.ok(b.student && b.cls && b.student.profile.xp === xp, 'students and classes are all still there');
});
test('data safety: the owner can reconnect the right data sheet; a weekly backup is made', () => {
  const M = 'maya.lopez@school.org', realId = props.DB_ID;
  // recreate the old failure: the app was pointed at a new, empty sheet
  const empty = ctx.SpreadsheetApp.create('Scratch Quest Data');
  props.DB_ID = empty.getId();
  assert.ok(!as(M, 'bootstrap').student, 'with the wrong sheet, the student looks like a stranger');
  assert.throws(() => as(M, 'dataReconnect', { sheet: realId }), /Only the owner/);
  assert.throws(() => as(T, 'dataReconnect', { sheet: 'https://docs.google.com/spreadsheets/d/nope' }), /Could not open/);
  const info = as(T, 'dataReconnect', { sheet: 'https://docs.google.com/spreadsheets/d/' + realId });
  assert.strictEqual(info.current.id, realId); assert.ok(info.current.students >= 3);
  assert.ok(info.others.some(o => o.id === empty.getId() && o.students === 0), 'the empty sheet is listed so it can be told apart');
  assert.ok(as(M, 'bootstrap').student, 'after reconnecting, students are back');
  delete props.LAST_BACKUP; delete props.BACKUPS;
  as(T, 'teacherData');
  const backups = JSON.parse(props.BACKUPS);
  assert.strictEqual(backups.length, 1); assert.ok(/Backup/.test(sheetsById[backups[0].id].getName()));
  assert.ok(sheetsById[backups[0].id].getSheetByName('Students').data.length > 1, 'the backup holds the student rows');
  as(T, 'teacherData');
  assert.strictEqual(JSON.parse(props.BACKUPS).length, 1, 'only one backup a week');
});
test('data safety: combining two data sheets keeps everyone\'s work (no one goes back to the start)', () => {
  const M = 'maya.lopez@school.org', L2 = 'liam.chen@school.org', Z = 'zed.new@school.org', oldId = props.DB_ID;
  const before = as(T, 'teacherData');
  const mayaOld = before.students.find(x => x.email === M), liamOld = before.students.find(x => x.email === L2);
  assert.ok(mayaOld.state.nodes.t1, 'Maya has earlier work in the old sheet');
  // The failure: the app starts using a new, empty sheet. A class keeps working in it.
  const fresh = ctx.SpreadsheetApp.create('Scratch Quest Data');
  props.DB_ID = fresh.getId();
  const cls = as(T, 'createClass', { name: 'Wednesday 2' }).cls;
  as(M, 'joinClass', { code: cls.code, name: 'Maya L.' });
  as(M, 'toggleStep', { node: 't1', idx: 0, value: true });
  as(Z, 'joinClass', { code: cls.code, name: 'Zed N.' });
  as(Z, 'toggleStep', { node: 't1', idx: 0, value: true });
  const zedXp = as(Z, 'bootstrap').student.profile.xp;
  assert.ok(as(M, 'bootstrap').student.profile.xp < mayaOld.profile.xp, 'in the new sheet Maya looks like she started over');
  // Combine: bring the old sheet into the one in use
  assert.throws(() => as(M, 'dataMerge', { sheet: oldId }), /Only the owner/);
  assert.throws(() => as(T, 'dataMerge', { sheet: fresh.getId() }), /already using/);
  const pre = as(T, 'dataMerge', { sheet: 'https://docs.google.com/spreadsheets/d/' + oldId });
  assert.strictEqual(pre.report.combined, 1, 'Maya is in both'); assert.ok(pre.report.added >= 2 && pre.report.classes.length >= 1);
  assert.strictEqual(as(T, 'teacherData').students.length, 2, 'the preview changes nothing');
  const res = as(T, 'dataMerge', { sheet: oldId, apply: true });
  assert.ok(res.done && res.report.added === pre.report.added);
  const after = as(T, 'teacherData');
  const maya = after.students.find(x => x.email === M);
  assert.ok(maya.profile.xp >= mayaOld.profile.xp, 'Maya has all her earlier XP back (' + maya.profile.xp + ')');
  assert.deepStrictEqual(Object.keys(maya.profile.done).sort(), Object.keys(mayaOld.profile.done).sort());
  assert.strictEqual(maya.classId, cls.id, 'and she stays in the class she is using now');
  const liam = after.students.find(x => x.email === L2);
  assert.strictEqual(liam.profile.xp, liamOld.profile.xp); assert.ok(after.classes.some(c => c.id === liam.classId), 'Liam is back, with his class');
  assert.strictEqual(after.students.find(x => x.email === Z).profile.xp, zedXp, 'work done in the new sheet is untouched');
  assert.ok(as(L2, 'bootstrap').student && as(L2, 'bootstrap').cls, 'Liam can open the app again');
  const again = as(T, 'dataMerge', { sheet: oldId });
  assert.strictEqual(again.report.added + again.report.combined, 0, 'combining twice adds nothing new');
  assert.ok(JSON.parse(props.BACKUPS).some(b => /before combining/.test(sheetsById[b.id].getName())), 'a backup was made first');
  assert.strictEqual(props.DB_ID, fresh.getId(), 'the app keeps using the same sheet, so nobody is interrupted');
  props.DB_ID = oldId; // put the test world back for the checks below (the old sheet was only read, never changed)
  assert.strictEqual(as(T, 'teacherData').students.find(x => x.email === M).profile.xp, mayaOld.profile.xp, 'the sheet that was read from is unchanged');
});
test('speed: one student\'s click reads one row, not every student in the school', () => {
  const M = 'maya.lopez@school.org', sh = sheetsById[props.DB_ID].getSheetByName('Students');
  const big = JSON.stringify({ state: { avatar: null, avatarSet: false, nodes: {}, awards: [], bonus: [] }, pad: 'x'.repeat(3000) });
  for (let i = 0; i < 300; i++) sh.data.push(['filler' + i + '@school.org', 'Filler ' + i, 'other-class', 0, 1, 0, '', new Date(), big]);
  env.counters.cells = 0;
  as(M, 'toggleStep', { node: 't1', idx: 1, value: true });
  assert.ok(env.counters.cells < 200, 'cells read for one click with 300 other students in the sheet: ' + env.counters.cells);
  env.counters.cells = 0;
  assert.ok(as(M, 'bootstrap').student);
  assert.ok(env.counters.cells < 200, 'cells read to open the app: ' + env.counters.cells);
  // the class map: built once, then shared for 20 seconds
  env.flags.cacheOn = true;
  const first = as(M, 'classView');
  env.counters.cells = 0;
  const second = as(M, 'classView');
  assert.ok(env.counters.cells < 200, 'second class map request reads almost nothing: ' + env.counters.cells);
  assert.strictEqual(second.members.length, first.members.length);
  env.flags.cacheOn = false; Object.keys(env.fakeCache).forEach(k => delete env.fakeCache[k]);
  sh.data.splice(sh.data.length - 300, 300);
  assert.ok(as(M, 'bootstrap').student.state.nodes.t1.steps[1], 'and the click was saved to the right row');
});
test('data safety: a record that cannot be read is never replaced by a blank one', () => {
  const L2 = 'liam.chen@school.org', sh = sheetsById[props.DB_ID].getSheetByName('Students');
  const row = sh.data.find(r => r[0] === L2), good = row[8];
  row[8] = good.slice(0, good.length - 20); // the saved data is damaged
  assert.throws(() => as(L2, 'toggleStep', { node: 't1', idx: 0, value: true }), /could not be read/);
  assert.throws(() => as(L2, 'saveAvatar', { avatar: {} }), /could not be read/);
  assert.strictEqual(row[8], good.slice(0, good.length - 20), 'the damaged cell was left alone, not overwritten with a blank record');
  assert.ok(as(T, 'teacherData').students.length >= 3, 'the teacher pages still load');
  assert.throws(() => as(T, 'bonus', { email: L2, amount: 5, note: 'x' }), /could not be read/);
  row[8] = good;
  assert.ok(as(L2, 'bootstrap').student, 'once the cell is repaired the student is fine');
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
