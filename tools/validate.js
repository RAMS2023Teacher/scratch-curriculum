#!/usr/bin/env node
// Validates lesson files against docs/LESSON_SPEC.md, and checks every block script with the real
// scratchblocks parser (in headless Chromium) for blocks that don't exist in Scratch 3.
// Usage: node tools/validate.js            (all lessons)
//        node tools/validate.js g1 g2      (some lessons)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'src/lessons');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''));
const SQ_LESSONS = {};
const errors = [], warns = [];
for (const id of ids) {
  try { new Function('SQ_LESSONS', fs.readFileSync(path.join(dir, id + '.js'), 'utf8'))(SQ_LESSONS); }
  catch (e) { errors.push(id + ': syntax error: ' + e.message); }
}
const SHOTS = 'tour xy green-flag cat-events cat-sound cat-control cat-looks cat-operators touching-color ask make-variable make-list make-block extensions choose-sprite delete-sprite costumes-tab sounds-tab select-stage backdrops'.split(' ');
const NEEDS = 'clones askAnswer join lists pen customBlocks random textStrings math'.split(' ');
const words = s => String(s || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
const scripts = []; // [where, text]
for (const id of ids) {
  const L = SQ_LESSONS[id]; if (!L) continue;
  const E = m => errors.push(id + ': ' + m), W = m => warns.push(id + ': ' + m);
  ['title', 'tagline', 'mission', 'minutes', 'skill', 'goal', 'warmup', 'submit', 'teacherNotes'].forEach(k => { if (!L[k]) E('missing ' + k); });
  if (words(L.mission) > 16) E('mission too long');
  if (!Array.isArray(L.vocab) || L.vocab.length < 3) E('vocab needs 3-5 entries');
  (L.vocab || []).forEach(v => { if (!v.icon) E('vocab "' + v.term + '" needs icon'); });
  if (!Array.isArray(L.needs)) E('needs must be an array');
  (L.needs || []).forEach(n => { if (!NEEDS.includes(n)) E('unknown needs key ' + n); });
  if (!Array.isArray(L.checklist) || L.checklist.length < 3) E('checklist needs 3-5 items');
  if (!Array.isArray(L.steps) || L.steps.length < 6 || L.steps.length > 8) E('needs 6-8 steps');
  let stretch = 0, goal = 0, parsons = 0, code = 0;
  (L.steps || []).forEach((s, i) => {
    const P = 'step ' + (i + 1) + ': ';
    ['title', 'short', 'text'].forEach(k => { if (!s[k]) E(P + 'missing ' + k); });
    if (words(s.short) > 16) E(P + 'short too long (' + words(s.short) + ' words)');
    if (/[→➜(]\d|\(\d/.test(s.short || '')) W(P + 'short has symbols/parens that read badly aloud');
    const hasCode = s.blocks || s.options;
    if (hasCode) {
      code++;
      if (!s.where) E(P + 'code step needs where');
      if (!['new', 'add', 'replace'].includes(s.change)) E(P + 'code step needs change new|add|replace');
      if ((s.change === 'add' || s.change === 'replace') && !s.changeNote) E(P + 'add/replace needs changeNote');
      if (!['full', 'parsons', 'goal'].includes(s.scaffold)) E(P + 'code step needs scaffold full|parsons|goal');
      if (s.scaffold === 'goal' && !s.stretch) goal++;
      if (s.scaffold === 'parsons') { parsons++; const n = String(s.blocks || (s.options && s.options[0].blocks) || '').split('\n').filter(x => x.trim() && !/^(end|else)$/.test(x.trim())).length; if (n > 9) W(P + 'parsons script has ' + n + ' blocks (keep ≤ 8)'); }
      if (s.options) (s.options || []).forEach((o, j) => { if (!o.label || !o.short || !o.blocks) E(P + 'option ' + (j + 1) + ' needs label/short/blocks'); else scripts.push([id + ' ' + P + 'option ' + o.label, o.blocks]); });
      if (s.blocks) scripts.push([id + ' ' + P, s.blocks]);
    }
    if (s.stretch) stretch++;
    if (/\b(partner|neighbor|neighbour|friend|classmate|swap)\b/i.test((s.short || '') + ' ' + (s.text || '')) && !s.solo) E(P + 'mentions a partner but has no solo option');
    (s.shots || []).forEach(k => { if (!SHOTS.includes(k)) E(P + 'unknown shot ' + k); });
  });
  if (stretch > 2) E('max 2 stretch steps (has ' + stretch + ')');
  if (code >= 3 && !/^f/.test(id) && goal < 1) E('needs at least one core step with scaffold "goal"');
  if (code >= 4 && !/^(t1|t2|f)/.test(id) && parsons < 1) W('consider at least one parsons step');
  if (!Array.isArray(L.quiz) || L.quiz.length !== 2) E('needs exactly 2 quiz questions');
  (L.quiz || []).forEach((q, i) => {
    if (!q.q || !Array.isArray(q.choices) || q.choices.length < 3 || typeof q.answer !== 'number' || q.answer >= q.choices.length || !q.explain) E('quiz ' + (i + 1) + ' malformed');
    if (q.blocks) scripts.push([id + ' quiz ' + (i + 1), q.blocks]);
  });
  if (!/^f/.test(id) && !(L.quiz || []).some(q => q.blocks)) E('at least one quiz question must be predict/trace with blocks');
  const c = L.challenge || {};
  if (!c.title || !c.short || !c.text) E('challenge needs title/short/text');
  if (c.blocks) E('challenge must be spec-only: put the solution in challenge.answer, not challenge.blocks');
  if (c.answer) scripts.push([id + ' challenge answer', c.answer]);
}

(async () => {
  if (scripts.length) {
    const { chromium } = require('playwright');
    const b = await chromium.launch(); const p = await b.newPage();
    await p.setContent('<html><body></body></html>');
    await p.addScriptTag({ path: path.join(root, 'vendor/package/build/scratchblocks.min.js') });
    const bad = await p.evaluate((scripts) => {
      const out = [];
      scripts.forEach(([where, text]) => {
        const doc = scratchblocks.parse(text, { languages: ['en'] });
        const walk = (b) => {
          if (!b) return;
          if (b.info && b.info.category === 'obsolete') out.push(where + ': unknown block "' + (b.stringify ? b.stringify() : b.info.selector) + '"');
          (b.children || []).forEach(c => { if (c && c.blocks) c.blocks.forEach(walk); else walk(c); });
        };
        doc.scripts.forEach(s => s.blocks.forEach(walk));
      });
      return out;
    }, scripts);
    bad.forEach(m => errors.push(m));
    await b.close();
  }
  warns.forEach(w => console.log('warn  ' + w));
  errors.forEach(e => console.log('ERROR ' + e));
  console.log(errors.length ? '\n' + errors.length + ' error(s).' : '\nOK (' + ids.length + ' lessons, ' + scripts.length + ' scripts checked)');
  process.exit(errors.length ? 1 : 0);
})();
