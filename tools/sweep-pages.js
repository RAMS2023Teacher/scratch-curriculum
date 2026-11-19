#!/usr/bin/env node
// Opens every student and teacher page of the demo build in a real browser and fails if any page
// shows leaked markup ("<svg", "&lt;", "undefined"...) or throws an error.
// Usage: node build.js && node tools/sweep-pages.js
const { chromium } = require('playwright');
(async () => {
  const URL = 'file://' + require('path').join(__dirname, '..', 'dist', 'scratch-quest-demo.html');
  let bad = 0;
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.emulateMedia({ reducedMotion: 'reduce' }); // the sweep runs as a device set to "reduce motion", where strobing used to happen
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const closeFx = async () => { for (let i = 0; i < 8 && await pg.$('.fx-wrap'); i++) { await pg.click('.fx-wrap .fx-ok'); await pg.waitForTimeout(350); } };
  // any visible text or tooltip that looks like leaked markup
  const leaks = async (where) => {
    const found = await pg.evaluate(() => {
      const out = [], bad = /<\/?[a-z][^>]*>|&lt;|&amp;[a-z]+;|\bundefined\b|\bNaN\b|\[object /i;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const p = n.parentElement; if (!p || p.closest('script,style,pre,code,textarea,.scratchblocks,svg')) continue;
        if (bad.test(n.nodeValue)) out.push('text: ' + n.nodeValue.trim().slice(0, 90));
      }
      document.querySelectorAll('[title],[placeholder],[aria-label],[alt]').forEach(e => ['title', 'placeholder', 'aria-label', 'alt'].forEach(a => { const v = e.getAttribute(a); if (v && bad.test(v)) out.push(a + ': ' + v.slice(0, 90)); }));
      return out;
    });
    // nothing may strobe: a repeating animation faster than 5 times a second counts as a failure
    const strobe = await pg.evaluate(() => document.getAnimations().filter(a => { const t = a.effect && a.effect.getComputedTiming(); return t && t.iterations === Infinity && t.duration < 200 && a.playState === 'running'; }).map(a => (a.effect.target && (a.effect.target.className || a.effect.target.tagName)) + ' ' + a.effect.getComputedTiming().duration + 'ms'));
    if (strobe.length) { bad++; console.log('  ✖ STROBING on ' + where + ' -> ' + JSON.stringify(strobe.slice(0, 4))); }
    if (found.length) bad++;
    console.log((found.length ? '  ✖ LEAK ' : '  ✔ ') + where + (found.length ? ' -> ' + JSON.stringify(found.slice(0, 4)) : ''));
  };
  await pg.goto(URL);
  await pg.fill('input[name="code"]', 'DEMO1'); await pg.fill('input[name="name"]', 'Sam'); await leaks('join page');
  await pg.click('form[data-form="join"] button'); await pg.waitForSelector('.studio'); await leaks('character studio');
  await pg.click('[data-act="av-save"]'); await pg.waitForSelector('.fx-wrap'); await leaks('badge celebration'); await closeFx();
  // this sweep clicks through quickly on purpose, so turn the pacing rules off for the demo class first
  await pg.evaluate(async () => { SQ_API.setRole('teacher'); await SQ_API.call('updateClass', { id: 'demo1', patch: { stepSec: 0, quizWait: 0, nudgeSec: 0, inOrder: false } }); SQ_API.setRole('student'); });
  await pg.evaluate(async () => { const L = SQ_LESSONS.t1; for (let i = 0; i < L.steps.length; i++) await SQ_API.call('toggleStep', { node: 't1', idx: i, value: true }); });
  await pg.goto(URL + '#/quest/t1'); await pg.reload(); await pg.waitForSelector('.pcard'); await pg.waitForTimeout(900); await closeFx(); await leaks('mission card');
  const quizIdx = await pg.$$eval('.dots .dot', d => d.findIndex(x => x.classList.contains('t-quiz')));
  await pg.click('.dots .dot >> nth=3'); await pg.waitForTimeout(400); await leaks('step card');
  await pg.click('.dots .dot >> nth=' + quizIdx); await pg.waitForTimeout(500);
  const answer = await pg.evaluate(() => SQ_LESSONS.t1.quiz[0].answer);
  await pg.click('.choice >> nth=' + (answer === 0 ? 1 : 0)); await pg.waitForTimeout(600);
  if (!(await pg.$('.explain svg')) || /</.test(await pg.textContent('.explain'))) { bad++; console.log('  ✖ wrong-answer message is broken'); }
  await leaks('quiz after a wrong answer');
  await pg.click('.choice >> nth=' + answer); await pg.waitForTimeout(700); await leaks('quiz after the right answer'); await closeFx();
  const n = await pg.$$eval('.dots .dot', d => d.length);
  await pg.click('.dots .dot >> nth=' + (n - 2)); await pg.waitForTimeout(400); await leaks('challenge card');
  await pg.click('.dots .dot >> nth=' + (n - 1)); await pg.waitForTimeout(400); await leaks('turn-in card');
  for (const h of ['#/map', '#/badges', '#/class', '#/arcade', '#/avatar']) { await pg.goto(URL + h); await pg.waitForTimeout(900); await closeFx(); await leaks('student ' + h); }
  for (const act of ['display', 'bug']) { await pg.click('header [data-act="' + act + '"]'); await pg.waitForTimeout(250); await leaks(act + ' window'); await pg.click('.modal-x'); }
  await pg.goto(URL + '#/quest/t1'); await pg.waitForSelector('.pcard'); await pg.click('.dots .dot >> nth=3'); await pg.waitForTimeout(300);
  for (const act of ['words', 'ask-help', 'confusing']) { const el = await pg.$('.player [data-act="' + act + '"]'); if (el) { await el.click(); await pg.waitForTimeout(250); await leaks(act + ' window'); await pg.click('.modal-x'); } }
  await pg.click('[data-act="demo-role"][data-role="teacher"]'); await pg.waitForTimeout(900);
  for (const h of ['#/t/dash', '#/t/review', '#/t/map', '#/t/lessons', '#/t/lesson/t3', '#/t/standards', '#/t/feedback', '#/t/classroom', '#/t/classes', '#/t/student/' + encodeURIComponent('ava@demo.school'), '#/t/screen']) {
    await pg.goto(URL + h); await pg.waitForTimeout(1300); await leaks('teacher ' + h);
  }
  await pg.click('[data-act="cs-setup"]').catch(() => {}); await pg.waitForTimeout(400); await leaks('class screen set-up');
  await b.close();
  if (errs.length) console.log('  ✖ page errors: ' + JSON.stringify(errs));
  if (bad || errs.length) { console.log('\nFAILED'); process.exit(1); }
  console.log('\nAll pages clean.');
})();
