#!/usr/bin/env node
// End-to-end test of the Apps Script version: doGet() builds the page from the HTML part files
// (like Google does), a real browser loads it, and google.script.run calls go to the real Code.gs/Shared.gs
// running in the fake Google environment.  Usage: node build.js && node tools/test-apps-script-page.js
const assert = require('assert');
const { chromium } = require('playwright');
const { makeEnv } = require('./fake-gas');

(async () => {
  const env = makeEnv();
  env.ctx.setup();
  const b = await chromium.launch();
  let passed = 0;
  const ok = (m) => { passed++; console.log('  ✔ ' + m); };

  async function open(email, query, blockCdn) {
    const page = await b.newPage({ viewport: { width: 1200, height: 850 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    env.setUser(email);
    const html = env.ctx.doGet().getContent();
    await page.exposeFunction('__gasApi', (action, args) => {
      try { return { ok: env.api(email, action, args) }; } catch (e) { return { err: e.message }; }
    });
    await page.addInitScript((q) => {
      // google.script.run / google.script.url, as Apps Script provides them inside the web app frame
      function runner(ok, fail) {
        return new Proxy({}, { get: (_, name) => {
          if (name === 'withSuccessHandler') return (f) => runner(f, fail);
          if (name === 'withFailureHandler') return (f) => runner(ok, f);
          return (...a) => { window.__gasApi(name === 'api' ? a[0] : name, name === 'api' ? a[1] : a[0]).then(r => r.err ? fail && fail(new Error(r.err)) : ok && ok(r.ok)); };
        } });
      }
      window.google = { script: { run: runner(null, null), url: { getLocation: (cb) => setTimeout(() => cb({ parameter: q || {}, hash: '' }), 10) } } };
    }, query || null);
    await page.route('https://apps.test/', r => r.fulfill({ contentType: 'text/html', body: html }));
    // the scratchblocks library comes from jsDelivr; serve our local copy (or block it, like a strict school filter)
    await page.route('https://cdn.jsdelivr.net/**', r => blockCdn ? r.abort() : r.fulfill({ contentType: 'application/javascript', path: require('path').join(__dirname, '..', 'vendor/package/build/scratchblocks.min.js') }));
    await page.goto('https://apps.test/');
    return { page, errors };
  }

  console.log('Apps Script web app page (fake Google environment, real browser):');
  // missing / cut-off part files produce a help page, not a blank screen
  env.ctx.__files = ['Index', 'Styles', 'Shots'];
  env.ctx.PART_CACHE_ = {};
  let help = env.ctx.doGet().getContent();
  assert.ok(/Engine<\/b> is missing/.test(help)); ok('a missing part file shows a help page naming it');
  env.ctx.__files = null;
  for (const k of Object.keys(env.ctx.PART_CACHE_)) delete env.ctx.PART_CACHE_[k];

  // a part file cut off mid-paste: the page says which file (instead of a blank screen)
  {
    const fs2 = require('fs'), p2 = require('path').join(__dirname, '..', 'dist', 'apps-script', 'Engine.html');
    const good = fs2.readFileSync(p2, 'utf8');
    fs2.writeFileSync(p2, good.slice(0, Math.floor(good.length / 2)));
    for (const k of Object.keys(env.ctx.PART_CACHE_)) delete env.ctx.PART_CACHE_[k];
    const cut = await open('teacher@school.org');
    await cut.page.waitForSelector('text=/did not load all the way|could not start/', { timeout: 10000 });
    const msg = await cut.page.locator('#app').innerText();
    assert.ok(/Engine|cut off/.test(msg), msg);
    fs2.writeFileSync(p2, good);
    for (const k of Object.keys(env.ctx.PART_CACHE_)) delete env.ctx.PART_CACHE_[k];
    ok('a cut-off file shows a clear message on screen (not a blank page)');
  }
  const t = await open('teacher@school.org');
  try { await t.page.waitForSelector('header.top', { timeout: 15000 }); } catch (e) { console.log('BODY:', (await t.page.locator('body').innerText()).slice(0, 400), 'ERRORS:', t.errors); throw e; }
  assert.ok(!(await t.page.locator('text=could not start').count()));
  ok('teacher page loads (template + ' + env.ctx.PAGE_PARTS_.length + ' part files)');
  assert.ok(await t.page.locator('text=Import from Google Classroom').count()); ok('first-time teacher sees the Classroom import option');
  await t.page.click('a[href="#/t/classroom"] >> nth=0'); await t.page.click('[data-act=gc-load]');
  await t.page.waitForSelector('.gc-course');
  await t.page.locator('form[data-form=gc-import]').first().locator('button').click();
  await t.page.waitForSelector('.banner.done');
  ok('teacher imports a Classroom roster: ' + (await t.page.locator('.banner.done').textContent()).trim());
  await t.page.click('[data-act=gc-select]'); await t.page.click('form[data-form=gc-post] button.primary');
  await t.page.waitForSelector('.gc-tier.posted');
  ok('teacher posts quests to Classroom (' + env.created.coursework.length + ' assignments)');
  assert.deepStrictEqual(t.errors, []);

  const s = await open('maya.lopez@school.org', { quest: 't2' });
  await s.page.waitForSelector('[data-act=av-save]', { timeout: 15000 });
  ok('imported student lands on avatar setup without a class code');
  await s.page.click('[data-act=av-save]');
  await s.page.waitForSelector('.pcard');
  assert.ok(/Lights, Camera/.test(await s.page.locator('.p-title').textContent()));
  ok('…then goes straight to the quest from the Classroom link (?quest=t2)');
  assert.ok(await s.page.locator('.banner.lock').count()); ok('…and it is shown as locked (quest 1 comes first)');
  await s.page.evaluate(() => { location.hash = '#/quest/t1'; }); await s.page.waitForSelector('.pcard');
  await s.page.click('.pcard [data-to="1"]'); await s.page.click('[data-act=did-step]');
  await s.page.waitForTimeout(400);
  assert.ok(env.api('teacher@school.org', 'teacherData').students.find(x => x.email === 'maya.lopez@school.org').state.nodes.t1.steps[0]);
  ok('student progress is saved in the Sheet through google.script.run');
  await s.page.evaluate(() => { location.hash = '#/quest/t1'; }); await s.page.waitForTimeout(300);
  await s.page.click('.dot[data-to="3"]'); await s.page.waitForTimeout(500);
  assert.ok(await s.page.locator('.pcard .scratchblocks svg').count()); ok('block pictures render (scratchblocks from the CDN)');
  const shots = await s.page.evaluate(() => Object.keys(window.SQ_SHOTS || {}).length);
  assert.strictEqual(shots, 20); ok('all 20 screenshots load from their part files');
  assert.deepStrictEqual(s.errors, []);
  ok('no browser errors');
  const f = await open('liam.chen@school.org', { quest: 't1' }, true);
  await f.page.waitForSelector('[data-act=av-save]', { timeout: 15000 }); await f.page.click('[data-act=av-save]');
  await f.page.waitForSelector('.pcard'); await f.page.click('.dot[data-to="3"]'); await f.page.waitForTimeout(300);
  assert.ok(await f.page.locator('.pcard pre.blocks').count()); assert.deepStrictEqual(f.errors, []);
  ok('if a school filter blocks the CDN, blocks show as text and nothing breaks');
  const total = require('fs').readdirSync(require('path').join(__dirname, '..', 'dist', 'apps-script')).reduce((a, x) => a + require('fs').statSync(require('path').join(__dirname, '..', 'dist', 'apps-script', x)).size, 0);
  ok('project size ' + Math.round(total / 1024) + ' KB');
  await b.close();
  console.log('\n' + passed + ' checks passed.');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
