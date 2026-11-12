#!/usr/bin/env node
// Builds:
//   dist/apps-script/   -> the Google Apps Script project (Code.gs, Shared.gs, Index.html, appsscript.json)
//   dist/scratch-quest-demo.html -> a single-file demo that runs entirely in the browser
const fs = require('fs');
const path = require('path');
const root = __dirname;
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// Order matters: lessons -> rules -> avatar -> service
// Lessons: one file per lesson in src/lessons/ (see docs/LESSON_SPEC.md)
const lessonFiles = fs.readdirSync(path.join(root, 'src/lessons')).filter(f => f.endsWith('.js')).sort();
const lessonsJs = 'var SQ_LESSONS = {};\n' + lessonFiles.map(f => rd('src/lessons/' + f)).join('\n');
const shared = [lessonsJs, rd('src/rules.js'), rd('src/avatar.js'), rd('src/service.js'), rd('src/classroom.js')].join('\n\n');
// "Where to look" screenshots, embedded as data URIs (client only)
const shotDir = path.join(root, 'shots');
const shots = {};
fs.readdirSync(shotDir).filter(f => f.endsWith('.webp')).forEach(f => {
  shots[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(path.join(shotDir, f)).toString('base64');
});
const shotsJs = 'var SQ_SHOTS = ' + JSON.stringify(shots) + ';\n' + rd('src/shotmap.js');
const client = shared + '\n\n' + rd('src/standards.js') + '\n\n' + rd('src/understandings.js') + '\n\n' + rd('src/primers.js') + '\n\n' + shotsJs + '\n\n' + rd('src/api.js') + '\n\n' + rd('src/icons.js') + '\n\n' + rd('src/sounds.js') + '\n\n' + rd('src/mapart.js') + '\n\n' + rd('src/app.js');
const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const html = rd('src/index.template.html')
  .replace('/*{{CSS}}*/', () => rd('src/styles.css'))
  .replace('/*{{SCRATCHBLOCKS}}*/', () => safe(rd('vendor/package/build/scratchblocks.min.js')))
  .replace('/*{{JS}}*/', () => safe(client));

const out = path.join(root, 'dist');
const gas = path.join(out, 'apps-script');
fs.mkdirSync(gas, { recursive: true });
fs.writeFileSync(path.join(out, 'scratch-quest-demo.html'), html);
// ---------------- Apps Script project (kept SMALL: Google refuses to save big projects) ----------------
// - Lessons live only in Shared.gs; the page asks the server for them.
// - The scratchblocks library loads from a CDN (jsDelivr) instead of living in the project.
// - Code is minified; screenshots are WebP.
// - The page is split into part files; each ends with a marker so the server can spot a cut-off paste.
const SCRATCHBLOCKS_CDN = 'https://cdn.jsdelivr.net/npm/scratchblocks@3.6.4/build/scratchblocks.min.js';
const { minify } = require('./tools/node_modules/terser');
const minCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const gasBuild = (async () => {
  const mini = async (code) => (await minify(code, { compress: { passes: 2 }, mangle: true, format: { comments: false } })).code;
  const parts = [];
  // Each part ends with a tiny script that records "this file loaded to the end" (HTML comments get stripped by Google, so no comment markers).
  const addPart = (name, body) => parts.push({ name, body: body + '\n<script>(window.SQ_PARTS=window.SQ_PARTS||{})[' + JSON.stringify(name) + ']=1;</script>\n' });
  addPart('Styles', '<style>' + minCss(rd('src/styles.css')) + '</style>');
  addPart('Shots', '<script>\nvar SQ_SHOTS = ' + JSON.stringify(shots) + ';\n</script>');
  const engine = [rd('src/rules.js'), rd('src/avatar.js'), rd('src/standards.js'), rd('src/understandings.js'), rd('src/primers.js'), rd('src/shotmap.js'), rd('src/api.js'), rd('src/icons.js'), rd('src/sounds.js'), rd('src/mapart.js'), rd('src/app.js')].join('\n;\n');
  addPart('Engine', '<script>\n' + safe(await mini(engine)) + '\n</script>');
  const order = parts.map(x => x.name);
  const shell = rd('src/index.template.html')
    .replace(/<style>[\s\S]*?<\/style>/, "<?!= part_('Styles') ?>")
    .replace(/<script>\s*\/\* scratchblocks[\s\S]*?<\/script>\s*<script>\s*\/\*\{\{JS\}\}\*\/\s*<\/script>/,
      '<script src="' + SCRATCHBLOCKS_CDN + '"></script>\n' + order.filter(n => n !== 'Styles').map(n => "<?!= part_('" + n + "') ?>").join('\n') +
      '\n<script>(function(){var need=' + JSON.stringify(order) + ',got=window.SQ_PARTS||{},miss=need.filter(function(n){return !got[n];});' +
      'if(miss.length){window.SQ_BROKEN=true;document.getElementById("app").innerHTML=\'<div style="max-width:560px;margin:40px auto;padding:16px;font:16px/1.5 system-ui,sans-serif;border:2px solid #d64545;border-radius:12px;background:#fff"><b>Almost ready!</b> These page files did not load all the way: <b>\'+miss.join(", ")+\'</b>.<br><br>In the Apps Script editor, open each one, select everything, paste the whole file again, and save. Then deploy a new version.</div>\';}})();</script>');
  if (!/part_\('Engine'\)/.test(shell) || /\{\{/.test(shell)) throw new Error('Index shell build failed');
  fs.readdirSync(gas).filter(f => f.endsWith('.html')).forEach(f => fs.unlinkSync(path.join(gas, f)));
  fs.writeFileSync(path.join(gas, 'Index.html'), shell);
  parts.forEach(x => fs.writeFileSync(path.join(gas, x.name + '.html'), x.body));
  fs.writeFileSync(path.join(gas, 'Shared.gs'), '// GENERATED by build.js from src/ (minified). Edit the src files, not this one.\n' + await mini(shared));
  fs.writeFileSync(path.join(gas, 'Code.gs'), rd('apps-script/Code.gs').replace('/*{{PARTS}}*/[]', JSON.stringify(order)));
  const total = fs.readdirSync(gas).reduce((a, f) => a + fs.statSync(path.join(gas, f)).size, 0);
  console.log('Apps Script project: ' + Math.round(total / 1024) + ' KB total (' + fs.readdirSync(gas).length + ' files)');
  if (total > 900 * 1024) throw new Error('Apps Script project is too big (' + Math.round(total / 1024) + ' KB); keep it under 900 KB');
})().catch(e => { console.error(e); process.exit(1); });
fs.writeFileSync(path.join(gas, 'appsscript.json'), JSON.stringify({
  timeZone: 'America/New_York',
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  // Google Classroom advanced service (rosters + posting assignments)
  dependencies: { enabledAdvancedServices: [{ userSymbol: 'Classroom', serviceId: 'classroom', version: 'v1' }] },
  // The smallest set of permissions the app needs. Rosters are read-only.
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets',                // the Scratch Quest Data sheet
    'https://www.googleapis.com/auth/userinfo.email',              // know which student/teacher is signed in
    'https://www.googleapis.com/auth/classroom.courses.readonly',  // list your Classroom classes
    'https://www.googleapis.com/auth/classroom.rosters.readonly',  // read class rosters
    'https://www.googleapis.com/auth/classroom.profile.emails',    // students' school emails (to match sign-ins)
    'https://www.googleapis.com/auth/classroom.topics',            // create the "Scratch Quest" topic
    'https://www.googleapis.com/auth/classroom.coursework.students' // post quests as assignments
  ],
  webapp: { executeAs: 'USER_DEPLOYING', access: 'DOMAIN' }
}, null, 2));
// Artifact/preview variant: page content only (host supplies the document skeleton)
const body = html.split('<body>')[1].split('</body>')[0];
const fonts = html.match(/<link rel="stylesheet"[^>]+>/)[0];
const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
fs.writeFileSync(path.join(out, 'artifact.html'), '<title>Scratch Quest</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + fonts + '\n' + style + '\n' + body);
// Standards alignment document for administrators
{
  const ctx = {}; new Function('ctx', lessonsJs + rd('src/rules.js') + rd('src/standards.js') + rd('src/understandings.js') + ';ctx.L=SQ_LESSONS;ctx.R=SQ_RULES;ctx.D=SQ_DLCS;ctx.U=SQ_UBD;')(ctx);
  const { L, R, D, U } = ctx;
  let md = '# Scratch Quest: MA DLCS Standards Alignment\n\n' + D.source + '. Standard text is quoted from the official framework: ' + D.url + '\n\n';
  md += 'Each student completes 14 of the 22 quests (the trunk, one branch at each fork, the rejoin quests, and the finale). Branch quests are marked with their path.\n\n';
  md += '## By lesson\n\n| Tier | Quest | Path | Standards (grades 6–8) | Practices |\n|---|---|---|---|---|\n';
  R.NODES.forEach(n => {
    const a = D.lessons[n.id] || { s: [], p: [] };
    md += '| ' + n.tier + ' | ' + L[n.id].title + ' | ' + R.BRANCHES[n.branch].name + ' | ' + a.s.map(x => '**6-8.' + x[0] + '**: ' + x[1]).join('<br>') + ' | ' + a.p.map(p => D.practices[p]).join(', ') + ' |\n';
  });
  md += '\n## Enduring understandings and essential questions (Understanding by Design)\n\n';
  md += '### Unit level\n\n**Students will understand that:**\n\n' + U.unit.eus.map(e => '- ' + e.charAt(0).toLowerCase() + e.slice(1)).join('\n') + '\n\n**Essential questions:**\n\n' + U.unit.eqs.map(q => '- ' + q).join('\n') + '\n\n';
  md += '### By quest\n\n| Tier | Quest | Essential question | Enduring understanding: students will understand that… |\n|---|---|---|---|\n';
  R.NODES.forEach(n => { const u = U.lessons[n.id]; if (u) md += '| ' + n.tier + ' | ' + L[n.id].title + ' | ' + u.eq + ' | ' + u.eu.charAt(0).toLowerCase() + u.eu.slice(1) + ' |\n'; });
  md += '\n## By standard\n\n| Standard | Text | Quests |\n|---|---|---|\n';
  Object.keys(D.standards).forEach(code => {
    const ls = R.NODES.filter(n => (D.lessons[n.id] || { s: [] }).s.some(x => x[0] === code)).map(n => L[n.id].title);
    md += '| 6-8.' + code + ' | ' + D.standards[code] + ' | ' + ls.join(', ') + ' |\n';
  });
  md += '\n## Not covered by this unit\n\nComputing Devices (except troubleshooting, CS.a.7), Networks, Services, Human and Computer Partnerships, Research, data representation (binary), most of Ethics and Laws (copyright, fair use, licensing), and Interpersonal and Societal Impact. These need lessons outside a Scratch programming unit.\n';
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'standards-alignment.md'), md);
  // Starter projects the teacher should create (so absent students can begin any part-2 lesson)
  let sp = '# Starter projects to create\n\nThese lessons continue earlier work. Make each starter in your Scratch account, **Share** it, and paste its link on the **Lessons** page. Absent students then click **Remix** and start from there.\n\n| Quest | Starter | It should contain |\n|---|---|---|\n';
  R.NODES.forEach(n => { const st = L[n.id] && L[n.id].starter; if (st) sp += '| ' + L[n.id].title + ' | ' + st.name + ' | ' + st.contains + ' |\n'; });
  sp += '\n## Other prep before you start\n\n' +
    '- **Class studio** on Scratch: students add every shared project. It is used for the Code Reader step in Bug Hunters (m1) and the gallery walk on Showcase Day (f3).\n' +
    '- **Mystery Bug project** (m1 solo option): a small project with one hidden bug, for students with no partner free to swap with.\n' +
    '- **Teacher example project** (m1 Code Reader solo option): any working project from another branch that students can See Inside.\n' +
    '- **Student Scratch accounts**: confirm the accounts can Share. New accounts need a confirmed email or a teacher-created class account.\n' +
    '- **Headphones** for read-aloud and for the sound lessons.\n';
  fs.writeFileSync(path.join(root, 'docs', 'starter-projects.md'), sp);
}
console.log('Built dist/scratch-quest-demo.html (' + Math.round(html.length / 1024) + ' KB) and dist/apps-script/');
