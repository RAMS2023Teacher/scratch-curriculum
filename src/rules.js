/* Scratch Quest — shared game rules.
 * Plain JS (no modules) so the exact same file runs in the browser AND in
 * Google Apps Script (copied to Rules.gs by build.js). Depends on SQ_LESSONS.
 */
var SQ_RULES = (function () {
  // ---- The quest tree ---------------------------------------------------
  // tier = order in the class pacing gate (teacher can "open through tier N")
  // requires = ALL of these; requiresAny = at least ONE of these
  var BRANCHES = {
    trunk:  { name: 'Sprite Meadow',   color: '#3fae5a', icon: '🌱' },
    games:  { name: 'Arcade Peaks',    color: '#ef6b3a', icon: '🎮' },
    stories:{ name: 'Story Woods',     color: '#9a5cd6', icon: '📖' },
    apps:   { name: 'Gadget Bay',      color: '#2f8fe0', icon: '📱' },
    merge:  { name: 'Debug Caves',     color: '#d9a21b', icon: '🔦' },
    finale: { name: 'Showcase Castle', color: '#e0457b', icon: '🏰' }
  };

  var NODES = [
    { id: 't1', branch: 'trunk', tier: 1, x: 500, y: 100, requires: [] },
    { id: 't2', branch: 'trunk', tier: 2, x: 420, y: 210, requires: ['t1'] },
    { id: 't3', branch: 'trunk', tier: 3, x: 580, y: 320, requires: ['t2'] },
    { id: 't4', branch: 'trunk', tier: 4, x: 420, y: 430, requires: ['t3'] },
    { id: 't5', branch: 'trunk', tier: 5, x: 500, y: 540, requires: ['t4'] },

    { id: 'g1', branch: 'games',   tier: 6, x: 180, y: 740, requires: ['t5'] },
    { id: 's1', branch: 'stories', tier: 6, x: 500, y: 740, requires: ['t5'] },
    { id: 'a1', branch: 'apps',    tier: 6, x: 820, y: 740, requires: ['t5'] },
    { id: 'g2', branch: 'games',   tier: 7, x: 180, y: 860, requires: ['g1'] },
    { id: 's2', branch: 'stories', tier: 7, x: 500, y: 860, requires: ['s1'] },
    { id: 'a2', branch: 'apps',    tier: 7, x: 820, y: 860, requires: ['a1'] },

    { id: 'm1', branch: 'merge', tier: 8, x: 500, y: 1040, requiresAny: ['g2', 's2', 'a2'] },
    { id: 'm2', branch: 'merge', tier: 9, x: 500, y: 1150, requires: ['m1'] },

    { id: 'g3', branch: 'games',   tier: 10, x: 180, y: 1375, requires: ['m2'] },
    { id: 's3', branch: 'stories', tier: 10, x: 500, y: 1375, requires: ['m2'] },
    { id: 'a3', branch: 'apps',    tier: 10, x: 820, y: 1375, requires: ['m2'] },
    { id: 'g4', branch: 'games',   tier: 11, x: 180, y: 1495, requires: ['g3'] },
    { id: 's4', branch: 'stories', tier: 11, x: 500, y: 1495, requires: ['s3'] },
    { id: 'a4', branch: 'apps',    tier: 11, x: 820, y: 1495, requires: ['a3'] },

    { id: 'f1', branch: 'finale', tier: 12, x: 500, y: 1670, requiresAny: ['g4', 's4', 'a4'] },
    { id: 'f2', branch: 'finale', tier: 13, x: 420, y: 1780, requires: ['f1'] },
    { id: 'f3', branch: 'finale', tier: 14, x: 500, y: 1890, requires: ['f2'] }
  ];
  var MAP = { width: 1000, height: 1990 };
  var MAX_TIER = 14;
  var NODE = {};
  NODES.forEach(function (n) { NODE[n.id] = n; });

  // ---- XP ---------------------------------------------------------------
  var XP = { step: 10, quiz: 20, quizFirstTry: 10, challenge: 50, lesson: 100, award: 50 };

  function xpForLevel(level) { return 20 * (level - 1) * (level + 4); } // L2=120, L5=720, L10=2520, L13=4080
  function levelFor(xp) {
    var l = 1;
    while (xpForLevel(l + 1) <= xp) l++;
    return l;
  }
  var RANKS = [
    [1, 'Sprite Sprout'], [3, 'Block Builder'], [5, 'Loop Ranger'], [7, 'Event Explorer'],
    [9, 'Code Knight'], [11, 'Script Wizard'], [13, 'Scratch Legend'], [16, 'Grand Creator']
  ];
  function rankFor(level) {
    var r = RANKS[0][1];
    RANKS.forEach(function (p) { if (level >= p[0]) r = p[1]; });
    return r;
  }

  // ---- Achievements -----------------------------------------------------
  // test(ctx) where ctx = { done: {id:true}, challenges: n, firstTry: n, xp: n, state }
  function doneAll(ids) { return function (c) { return ids.every(function (i) { return c.done[i]; }); }; }
  function branchPair(a, b, c2, d) { return function (c) { return (c.done[a] && c.done[b]) || (c.done[c2] && c.done[d]); }; }
  var BADGES = [
    { id: 'first_steps',  icon: '👣', name: 'First Steps',      desc: 'Finish your first quest.',               test: doneAll(['t1']) },
    { id: 'stylist',      icon: '🎨', name: 'Looking Sharp',    desc: 'Customize your avatar.',                  test: function (c) { return !!c.state.avatarSet; } },
    { id: 'loop_legend',  icon: '🔁', name: 'Loop Legend',      desc: 'Finish Loop-de-Loop.',                    test: doneAll(['t3']) },
    { id: 'root_master',  icon: '🌳', name: 'Meadow Master',    desc: 'Finish all of Sprite Meadow.',            test: doneAll(['t1', 't2', 't3', 't4']) },
    { id: 'game_dev',     icon: '🕹️', name: 'Game Developer',   desc: 'Finish a full Games path (2 quests).',    test: branchPair('g1', 'g2', 'g3', 'g4') },
    { id: 'storyteller',  icon: '🪶', name: 'Storyteller',      desc: 'Finish a full Stories path (2 quests).',  test: branchPair('s1', 's2', 's3', 's4') },
    { id: 'app_maker',    icon: '🛠️', name: 'App Maker',        desc: 'Finish a full Apps path (2 quests).',     test: branchPair('a1', 'a2', 'a3', 'a4') },
    { id: 'triple',       icon: '🔱', name: 'Triple Threat',    desc: 'Finish a quest in Games, Stories AND Apps.', test: function (c) {
        return ['g', 's', 'a'].every(function (p) { return [1, 2, 3, 4].some(function (k) { return c.done[p + k]; }); }); } },
    { id: 'bug_squasher', icon: '🐞', name: 'Bug Squasher',     desc: 'Finish Bug Hunters.',                     test: doneAll(['m1']) },
    { id: 'block_smith',  icon: '🧩', name: 'Block Smith',      desc: 'Make your own blocks in My Blocks Workshop.', test: doneAll(['m2']) },
    { id: 'challenger',   icon: '⚡', name: 'Challenger',       desc: 'Complete 5 bonus challenges.',            test: function (c) { return c.challenges >= 5; } },
    { id: 'champion',     icon: '🏆', name: 'Challenge Champion', desc: 'Complete 10 bonus challenges.',         test: function (c) { return c.challenges >= 10; } },
    { id: 'sharp_mind',   icon: '🧠', name: 'Sharp Mind',       desc: 'Get 10 quick-check questions right on the first try.', test: function (c) { return c.firstTry >= 10; } },
    { id: 'perfectionist',icon: '💎', name: 'Perfectionist',    desc: 'Every step, every question, AND the challenge in one quest.', test: function (c) { return c.perfect >= 1; } },
    { id: 'xp_1000',      icon: '⭐', name: 'Rising Star',      desc: 'Earn 1,000 XP.',                          test: function (c) { return c.xp >= 1000; } },
    { id: 'xp_3000',      icon: '🌟', name: 'Superstar',        desc: 'Earn 3,000 XP.',                          test: function (c) { return c.xp >= 3000; } },
    { id: 'capstone',     icon: '🚀', name: 'Capstone Hero',    desc: 'Finish your Capstone Build.',             test: doneAll(['f2']) },
    { id: 'showcase',     icon: '👑', name: 'Showcase Star',    desc: 'Present on Showcase Day.',                test: doneAll(['f3']) },
    { id: 'explorer',     icon: '🧭', name: 'Explorer',         desc: 'Finish 17 quests (try extra branches!).', test: function (c) { return Object.keys(c.done).length >= 17; } },
    { id: 'toolkit',      icon: '🧰', name: 'Power Up',         desc: 'Finish the Power-Up Pack toolkit.',        test: doneAll(['t5']) }
  ];
  // Awarded by the teacher only
  var TEACHER_BADGES = [
    { id: 'helper',     icon: '🤝', name: 'Helping Hand',  desc: 'Helped a classmate solve a problem.' },
    { id: 'creative',   icon: '💡', name: 'Creative Spark', desc: 'Came up with a really original idea.' },
    { id: 'persistent', icon: '🧗', name: 'Never Give Up',  desc: 'Kept going through a tough bug.' },
    { id: 'team',       icon: '🫶', name: 'Team Player',    desc: 'Gave kind, useful feedback.' }
  ];
  var BADGE = {};
  BADGES.concat(TEACHER_BADGES).forEach(function (b) { BADGE[b.id] = b; });

  // ---- State helpers ----------------------------------------------------
  function newState() {
    return { avatar: null, avatarSet: false, nodes: {}, awards: [], bonus: [] };
  }
  function nodeState(state, id) {
    if (!state.nodes[id]) state.nodes[id] = { steps: [], quiz: {}, challenge: false, status: 'open' };
    return state.nodes[id];
  }
  function isDone(state, id) {
    var n = state.nodes[id];
    return !!(n && n.status === 'done');
  }
  function prereqsMet(state, id) {
    var n = NODE[id];
    if (!n) return false;
    var all = (n.requires || []).every(function (r) { return isDone(state, r); });
    var any = !n.requiresAny || n.requiresAny.some(function (r) { return isDone(state, r); });
    return all && any;
  }
  // status for display: locked | gated (teacher hasn't opened) | available | started | submitted | returned | done
  function nodeStatus(state, id, openThrough) {
    var ns = state.nodes[id];
    if (ns && (ns.status === 'done' || ns.status === 'submitted' || ns.status === 'returned')) return ns.status;
    if (!prereqsMet(state, id)) return 'locked';
    if (openThrough && NODE[id].tier > openThrough) return 'gated';
    if (ns && (ns.steps.some(Boolean) || Object.keys(ns.quiz).length)) return 'started';
    return 'available';
  }

  // Core steps are required to turn in; "stretch" steps are optional.
  function coreSteps(L) { var out = []; (L.steps || []).forEach(function (st, i) { if (!st.stretch) out.push(i); }); return out; }
  function lessonOf(id) { return (typeof SQ_LESSONS !== 'undefined' && SQ_LESSONS[id]) || { steps: [], quiz: [] }; }

  // Everything derived from state: xp, level, badges, progress.
  function profile(state) {
    var xp = 0, done = {}, challenges = 0, firstTry = 0, perfect = 0;
    Object.keys(state.nodes || {}).forEach(function (id) {
      if (!NODE[id]) return;
      var ns = state.nodes[id], L = lessonOf(id);
      var stepsDone = 0;
      for (var i = 0; i < L.steps.length; i++) if (ns.steps[i]) stepsDone++;
      xp += stepsDone * XP.step;
      var quizRight = 0;
      Object.keys(ns.quiz || {}).forEach(function (q) {
        var r = ns.quiz[q];
        if (r && r.correct) { xp += XP.quiz; quizRight++; }
        if (r && r.firstTry) { xp += XP.quizFirstTry; firstTry++; }
      });
      if (ns.challenge) { xp += XP.challenge; challenges++; }
      if (ns.status === 'done') {
        xp += XP.lesson; done[id] = true;
        if (L.steps.length && stepsDone === L.steps.length && quizRight === L.quiz.length && ns.challenge) perfect++;
      }
    });
    (state.awards || []).forEach(function () { xp += XP.award; });
    (state.bonus || []).forEach(function (b) { xp += Number(b.amount) || 0; });

    var ctx = { done: done, challenges: challenges, firstTry: firstTry, perfect: perfect, xp: xp, state: state };
    var badges = [];
    BADGES.forEach(function (b) { if (b.test(ctx)) badges.push(b.id); });
    // xp badges depend on xp, so they're checked after the base xp is known (awards don't loop)
    (state.awards || []).forEach(function (a) { if (badges.indexOf(a.id) < 0) badges.push(a.id); });

    var level = levelFor(xp);
    var owned = (state.owned || []).slice();
    var coins = typeof SQ_AVATAR !== 'undefined' ? SQ_AVATAR.coinsFor(xp, owned) : { earned: 0, spent: 0, balance: 0 };
    return {
      owned: owned, coins: coins.balance, coinsEarned: coins.earned, goal: state.goal || null,
      xp: xp, level: level, rank: rankFor(level),
      levelStart: xpForLevel(level), levelNext: xpForLevel(level + 1),
      done: done, doneCount: Object.keys(done).length,
      challenges: challenges, firstTry: firstTry, badges: badges,
      current: currentNode(state)
    };
  }

  // The node the student is "standing on" for the class map.
  function currentNode(state) {
    var best = null, bestT = -1;
    Object.keys(state.nodes || {}).forEach(function (id) {
      var ns = state.nodes[id];
      if (!NODE[id] || ns.status === 'done') return;
      var t = ns.touched || 0;
      if (t > bestT) { bestT = t; best = id; }
    });
    if (best) return best;
    // otherwise: the next node after the most recently finished one
    var lastDone = null, lastT = -1;
    Object.keys(state.nodes || {}).forEach(function (id) {
      var ns = state.nodes[id];
      if (NODE[id] && ns.status === 'done' && (ns.touched || 0) >= lastT) { lastT = ns.touched || 0; lastDone = id; }
    });
    if (!lastDone) return 't1';
    for (var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      var after = (n.requires || []).concat(n.requiresAny || []);
      if (after.indexOf(lastDone) >= 0 && !isDone(state, n.id) && prereqsMet(state, n.id)) return n.id;
    }
    return lastDone;
  }

  return {
    BRANCHES: BRANCHES, NODES: NODES, NODE: NODE, MAP: MAP, MAX_TIER: MAX_TIER,
    XP: XP, BADGES: BADGES, TEACHER_BADGES: TEACHER_BADGES, BADGE: BADGE,
    xpForLevel: xpForLevel, levelFor: levelFor, rankFor: rankFor,
    newState: newState, nodeState: nodeState, isDone: isDone, prereqsMet: prereqsMet,
    nodeStatus: nodeStatus, profile: profile, currentNode: currentNode, coreSteps: coreSteps
  };
})();
