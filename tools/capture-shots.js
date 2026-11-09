// Drives a locally-running copy of the Scratch 3 editor and takes "spotlight" screenshots.
const { chromium } = require('playwright');
const OUT = '/home/user/scratch-quest/shots/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  async function fresh() {
    await p.goto('http://localhost:8765/editor.html');
    await p.waitForSelector('[class*="sprite-selector-item"]', { timeout: 30000 });
    await p.waitForTimeout(1200);
  }
  async function clear() { await p.evaluate(() => document.querySelectorAll('.sq-hl').forEach(e => e.remove())); }
  // spotlight: dim everything except the boxes, with an orange ring + label
  async function spot(boxes, label, labelPos) {
    await p.evaluate(({ boxes, label, labelPos }) => {
      boxes.forEach((r, i) => {
        const d = document.createElement('div'); d.className = 'sq-hl';
        Object.assign(d.style, { position: 'fixed', left: (r.x - 6) + 'px', top: (r.y - 6) + 'px', width: (r.width + 12) + 'px', height: (r.height + 12) + 'px',
          border: '5px solid #ff7a00', borderRadius: '14px', zIndex: 99999, pointerEvents: 'none',
          boxShadow: i === 0 ? '0 0 0 4px #fff, 0 0 0 9999px rgba(20,10,40,.45)' : '0 0 0 4px #fff' });
        document.body.appendChild(d);
      });
      if (label) {
        const r = boxes[0], t = document.createElement('div'); t.className = 'sq-hl'; t.textContent = label;
        Object.assign(t.style, { position: 'fixed', zIndex: 100000, background: '#ff7a00', color: '#fff', font: '700 20px Arial, sans-serif', padding: '8px 14px', borderRadius: '999px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,.3)' });
        document.body.appendChild(t);
        const w = t.offsetWidth, h = t.offsetHeight;
        const pos = { right: [r.x + r.width + 20, r.y + r.height / 2 - h / 2], left: [r.x - w - 20, r.y + r.height / 2 - h / 2], below: [r.x + r.width / 2 - w / 2, r.y + r.height + 18], above: [r.x + r.width / 2 - w / 2, r.y - h - 18] }[labelPos || 'right'];
        t.style.left = Math.max(4, pos[0]) + 'px'; t.style.top = Math.max(4, pos[1]) + 'px';
      }
    }, { boxes, label, labelPos });
  }
  async function box(sel) { const l = p.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); return await l.boundingBox(); }
  async function blockBox(prefix) {
    return await p.evaluate((prefix) => {
      const els = [...document.querySelectorAll('.blocklyFlyout .blocklyDraggable')];
      const el = els.find(e => e.textContent.replace(/\s/g, '').toLowerCase().includes(prefix));
      if (!el) return null; el.scrollIntoView && 0; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, prefix);
  }
  async function flyoutButton(text) {
    return await p.evaluate((text) => {
      const el = [...document.querySelectorAll('.blocklyFlyoutButton')].find(e => e.textContent.trim() === text);
      const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, text);
  }
  async function category(id) { await p.click('.scratchCategoryId-' + id); await p.waitForTimeout(700); return await box('.scratchCategoryId-' + id); }
  async function shot(name, clip) {
    await p.waitForTimeout(250);
    await p.screenshot({ path: OUT + name + '.jpg', type: 'jpeg', quality: 72, clip });
    await clear(); console.log('ok', name);
  }
  const LEFT = { x: 0, y: 48, width: 640, height: 470 };     // categories + palette + a bit of code area
  const RIGHT = { x: 860, y: 48, width: 506, height: 720 };  // stage + sprite pane

  await fresh();
  // 1. tour: four labeled areas
  await p.evaluate(() => {
    const zones = [['Block Palette', 0, 92, 310, 676, '#4c97ff'], ['Code Area', 312, 92, 556, 676, '#9966ff'], ['Stage', 876, 92, 482, 362, '#ffab19'], ['Sprites', 876, 462, 490, 306, '#59c059']];
    zones.forEach(([n, x, y, w, h, c]) => {
      const d = document.createElement('div'); d.className = 'sq-hl';
      Object.assign(d.style, { position: 'fixed', left: x + 4 + 'px', top: y + 4 + 'px', width: w - 8 + 'px', height: h - 8 + 'px', border: '5px solid ' + c, borderRadius: '14px', zIndex: 99999, pointerEvents: 'none', background: c + '22' });
      const t = document.createElement('div'); t.textContent = n;
      Object.assign(t.style, { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: c, color: '#fff', font: '700 26px Arial', padding: '10px 18px', borderRadius: '999px' });
      d.appendChild(t); document.body.appendChild(d);
    });
  });
  await shot('tour', { x: 0, y: 48, width: 1366, height: 720 });

  await spot([await box('[class*="sprite-info_sprite-info"] input[placeholder="x"]'), await box('[class*="sprite-info_sprite-info"] input[placeholder="y"]')], 'x and y', 'above');
  await shot('xy', RIGHT);

  await spot([await box('img[title="Go"]')], 'Green flag = start!', 'right');
  await shot('green-flag', { x: 700, y: 48, width: 666, height: 300 });

  for (const [id, name, label] of [['events', 'cat-events', 'Events'], ['sound', 'cat-sound', 'Sound'], ['control', 'cat-control', 'Control'], ['operators', 'cat-operators', 'Operators'], ['looks', 'cat-looks', 'Looks']]) {
    await spot([await category(id)], label + ' blocks', 'right'); await shot(name, LEFT);
  }
  await category('sensing');
  await spot([await blockBox('touchingcolor')], 'touching color', 'right'); await shot('touching-color', LEFT);
  await spot([await blockBox('askandwait')], 'ask and wait', 'right'); await shot('ask', LEFT);

  await category('variables');
  await spot([await flyoutButton('Make a Variable')], 'Make a Variable', 'right'); await shot('make-variable', LEFT);
  await spot([await flyoutButton('Make a List')], 'Make a List', 'right'); await shot('make-list', { x: 0, y: 200, width: 640, height: 470 });
  await category('myBlocks');
  await spot([await flyoutButton('Make a Block')], 'Make a Block', 'right'); await shot('make-block', LEFT);

  await spot([await box('button[title="Add Extension"]')], 'Add Extension (Pen is here)', 'right'); await shot('extensions', { x: 0, y: 588, width: 520, height: 180 });

  // choose a sprite: hover to open its menu
  await p.hover('[aria-label="Choose a Sprite"]'); await p.waitForTimeout(900);
  const menu = await p.evaluate(() => { const c = document.querySelector('[aria-label="Choose a Sprite"]').closest('[class*="action-menu_menu-container"]');
    const rs = [...c.querySelectorAll('button, [class*="action-menu_button"]')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0);
    const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)), x2 = Math.max(...rs.map(r => r.right)), y2 = Math.max(...rs.map(r => r.bottom));
    return { x, y, width: x2 - x, height: y2 - y }; });
  await spot([menu], 'Pick, Paint, or Surprise', 'left'); await shot('choose-sprite', RIGHT);
  await p.mouse.move(600, 400); await p.waitForTimeout(500);

  await spot([await box('[class*="sprite-selector-item_is-selected"] [class*="delete-button"]')], 'Delete a sprite', 'below'); await shot('delete-sprite', RIGHT);

  await spot([await box('[role="tab"]:has-text("Costumes")')], 'Costumes tab', 'right'); await shot('costumes-tab', { x: 0, y: 48, width: 700, height: 300 });
  await p.click('[role="tab"]:has-text("Sounds")'); await p.waitForTimeout(800);
  await p.hover('[aria-label="Choose a Sound"]'); await p.waitForTimeout(900);
  const smenu = await p.evaluate(() => { const b = document.querySelector('[aria-label="Choose a Sound"]').closest('[class*="action-menu_menu-container"]'); const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await spot([await box('[role="tab"]:has-text("Sounds")'), smenu], 'Sounds tab', 'right'); await shot('sounds-tab', { x: 0, y: 48, width: 700, height: 720 });
  await p.mouse.move(600, 300);
  await p.click('[role="tab"]:has-text("Code")'); await p.waitForTimeout(600);

  // stage + backdrops
  const stageSel = await box('[class*="stage-selector_stage-selector"]');
  await spot([stageSel], '1. Click the Stage', 'left'); await shot('select-stage', RIGHT);
  await p.click('[class*="stage-selector_stage-selector"]'); await p.waitForTimeout(800);
  await spot([await box('[role="tab"]:has-text("Backdrops")')], '2. Backdrops tab', 'right'); await shot('backdrops', { x: 0, y: 48, width: 640, height: 280 });
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
