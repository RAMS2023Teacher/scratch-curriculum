#!/usr/bin/env node
// Dark mode check: opens the student pages with the dark colors on and lists any text that is hard to
// read against its background (contrast under 3:1). Usage: node build.js && node tools/dark-audit.js
const { chromium } = require('playwright');
(async () => {
  const URL = 'file://' + require('path').join(__dirname, '..', 'dist', 'scratch-quest-demo.html');
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  pg.setDefaultTimeout(8000);
  const fx = async () => { for (let quiet = 0; quiet < 2;) { await pg.waitForTimeout(500); if (await pg.$('.fx-wrap')) { quiet = 0; await pg.click('.fx-wrap .fx-ok', { force: true }).catch(() => {}); } else quiet++; } };
  await pg.goto(URL);
  await pg.fill('input[name="code"]', 'DEMO1'); await pg.fill('input[name="name"]', 'Sam');
  await pg.click('form[data-form="join"] button'); await pg.waitForSelector('.studio');
  await pg.click('[data-act="av-save"]'); await fx();
  await pg.evaluate(async () => {
    SQ_API.setRole('teacher'); await SQ_API.call('updateClass', { id: 'demo1', patch: { stepSec: 0, quizWait: 0, nudgeSec: 0, inOrder: false, requireApproval: false } }); SQ_API.setRole('student');
    await SQ_API.call('askHelp', { node: 't1', step: 0, note: 'x' });
  });
  const audit = () => pg.evaluate(() => {
    const rgb = c => { const m = c.match(/[\d.]+/g).map(Number); return m.length > 3 && m[3] === 0 ? null : m; };
    const solid = m => m.length < 4 || m[3] === 1;
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
    const out = {};
    document.querySelectorAll('#app *, .modal *').forEach(el => {
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      if (el.closest('svg, .scratchblocks, .shot, [hidden], .map-wrap, .avatar, select, .btn.primary')) return; // (the green button looks the same in light mode)
      const cs = getComputedStyle(el), fg = rgb(cs.color); if (!fg || +cs.opacity < .5) return;
      let p = el, bg = null;
      // see-through and picture backgrounds cannot be judged from the color alone, so they are skipped
      while (p && !bg) { const s = getComputedStyle(p); if (s.backgroundImage !== 'none') return; bg = rgb(s.backgroundColor); if (bg && !solid(bg)) return; p = p.parentElement; }
      bg = bg || [27, 19, 48];
      const a = lum(fg), c = lum(bg), ratio = (Math.max(a, c) + .05) / (Math.min(a, c) + .05);
      if (ratio < 3) { const k = el.tagName.toLowerCase() + '.' + String(el.className).split(' ').slice(0, 2).join('.') + ' in .' + String((el.parentElement || {}).className).split(' ').slice(0, 2).join('.'); out[k] = ratio.toFixed(1) + ' "' + el.textContent.trim().slice(0, 30) + '"'; }
    });
    return out;
  });
  const bad = {};
  const visit = async (name, hash, prep) => {
    await pg.goto(URL + hash); await pg.waitForTimeout(900); await fx(); if (prep) await prep();
    const r = await audit(); Object.keys(r).forEach(k => { bad[k] = (bad[k] ? bad[k] + ' ' : '') + '[' + name + '] ' + r[k]; });
  };
  await visit('map', '#/map'); await visit('avatar', '#/avatar'); await visit('badges', '#/badges'); await visit('arcade', '#/arcade'); await visit('class', '#/class');
  const n = await pg.evaluate(() => 0);
  for (const id of ['t1', 't5']) {
    await visit('quest ' + id + ' intro', '#/quest/' + id, async () => { await pg.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true)); });
    const dots = await pg.$$eval('.dot', d => d.length);
    for (let k = 1; k < dots; k++) {
      await pg.evaluate(k => document.querySelectorAll('.dot')[k].click(), k); await pg.waitForTimeout(250);
      await pg.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
      const r = await audit(); Object.keys(r).forEach(key => { bad[key] = bad[key] || '[quest ' + id + ' card ' + k + '] ' + r[key]; });
    }
  }
  for (const act of ['display', 'words', 'ask-help', 'test-out']) {
    await pg.goto(URL + '#/quest/t2'); await pg.waitForTimeout(500);
    if (!(await pg.$('[data-act="' + act + '"]'))) continue;
    await pg.evaluate(a => document.querySelector('[data-act="' + a + '"]').click(), act); await pg.waitForTimeout(400);
    const r = await audit(); Object.keys(r).forEach(key => { bad[key] = bad[key] || '[window ' + act + '] ' + r[key]; });
  }
  const keys = Object.keys(bad);
  keys.forEach(k => console.log('  ✘ ' + k + '  ' + bad[k]));
  console.log(keys.length ? '\n' + keys.length + ' hard-to-read spots in dark mode.' : 'Dark mode: all text readable.');
  await b.close(); process.exit(keys.length ? 1 : 0);
})().catch(e => { console.log('FAILED', String(e.message).split('\n').slice(0, 3).join(' | ')); process.exit(2); });
