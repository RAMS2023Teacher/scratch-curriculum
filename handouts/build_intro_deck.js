// Scratch Quest intro deck (16:9). Imports cleanly into Canva or Google Slides.
const pptxgen = require('pptxgenjs');
const path = require('path');
const OUT = process.argv[2];
const IMG = (n) => path.join(__dirname, n + '.png');
const BG = '2B145F', CARD = '3D1F8A', YEL = 'FFD60A', ORA = 'FF8A1F', GRN = '22C55E', PNK = 'F72585', BLU = '3A86FF', WHITE = 'FFFFFF', INK = '241145', SOFT = 'E9E2FF';
const HEAD = 'Titan One', BODY = 'Nunito';
const R = 1280 / 760; // screenshot shape

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
p.title = 'Welcome to Scratch Quest';

function base(title, sub, notes) {
  const s = p.addSlide();
  s.background = { color: BG };
  // soft decorative dots
  s.addShape(p.ShapeType.ellipse, { x: 11.9, y: -0.9, w: 2.6, h: 2.6, fill: { color: '4A1D96' }, line: { color: '4A1D96' } });
  s.addShape(p.ShapeType.ellipse, { x: -0.8, y: 6.3, w: 2.0, h: 2.0, fill: { color: '4A1D96' }, line: { color: '4A1D96' } });
  if (title) s.addText(title, { x: 0.6, y: 0.35, w: 12.1, h: 1.0, fontFace: HEAD, fontSize: 40, color: YEL, bold: false, margin: 0 });
  if (sub) s.addText(sub, { x: 0.6, y: 1.3, w: 12.1, h: 0.55, fontFace: BODY, fontSize: 22, color: SOFT, bold: true, margin: 0 });
  if (notes) s.addNotes(notes);
  return s;
}
function shot(s, name, x, y, w) {
  const h = w / R;
  s.addShape(p.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.12, shadow: { type: 'outer', color: '000000', opacity: 0.35, blur: 8, offset: 4, angle: 90 } });
  s.addImage({ path: IMG(name), x, y, w, h });
}
function chip(s, n, x, y, color, size = 0.7) {
  s.addShape(p.ShapeType.roundRect, { x, y, w: size, h: size, fill: { color }, line: { color }, rectRadius: 0.12 });
  s.addText(String(n), { x, y, w: size, h: size, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: size * 34, color: INK, margin: 0 });
}
// a numbered row: chip + bold lead + rest
function row(s, n, lead, rest, x, y, w, color, fs = 22) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h: 0.95, fill: { color: CARD }, line: { color: CARD }, rectRadius: 0.14 });
  chip(s, n, x + 0.14, y + 0.125, color);
  const parts = [];
  if (lead) parts.push({ text: lead + (rest ? ' ' : ''), options: { bold: true, color: YEL } });
  if (rest) parts.push({ text: rest, options: { color: WHITE, bold: true } });
  s.addText(parts, { x: x + 1.0, y, w: w - 1.15, h: 0.95, valign: 'middle', fontFace: BODY, fontSize: fs, margin: 0 });
}
const COLORS = [YEL, ORA, GRN, PNK, BLU];

// 1. Title
{
  const s = p.addSlide(); s.background = { color: BG };
  s.addShape(p.ShapeType.ellipse, { x: -1.2, y: 5.4, w: 3.4, h: 3.4, fill: { color: '4A1D96' }, line: { color: '4A1D96' } });
  s.addText('Welcome to', { x: 0.7, y: 1.5, w: 5.6, h: 0.8, fontFace: HEAD, fontSize: 40, color: WHITE, margin: 0 });
  s.addText('Scratch Quest', { x: 0.7, y: 2.25, w: 5.9, h: 1.3, fontFace: HEAD, fontSize: 60, color: YEL, margin: 0 });
  s.addText('Learn to code in Scratch by going on an adventure.', { x: 0.7, y: 3.75, w: 5.3, h: 1.1, fontFace: BODY, fontSize: 24, bold: true, color: SOFT, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 5.2, w: 3.3, h: 0.8, fill: { color: GRN }, line: { color: GRN }, rectRadius: 0.2 });
  s.addText('6th Grade Computer Science', { x: 0.7, y: 5.2, w: 3.3, h: 0.8, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 16, bold: true, color: INK, margin: 0 });
  shot(s, 'map', 6.7, 1.45, 6.0);
  s.addNotes('Welcome students. Scratch Quest is the website we use for the whole Scratch unit. Everything they need is inside it: lessons, progress, and rewards.');
}
// 2. What is it
{
  const s = base('What is Scratch Quest?', 'A game where you learn to code.', 'Three big ideas: you learn by doing quests, your work earns rewards, and you end up building your own projects.');
  [['Go on quests', 'Each quest teaches a new Scratch skill.'], ['Earn rewards', 'XP, levels, coins, and badges.'], ['Build your own', 'Games, stories, and apps you design.']].forEach((c, i) => {
    const x = 0.6 + i * 4.1;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.3, w: 3.85, h: 3.9, fill: { color: CARD }, line: { color: CARD }, rectRadius: 0.2 });
    chip(s, i + 1, x + 0.35, 2.65, COLORS[i], 1.0);
    s.addText(c[0], { x: x + 0.35, y: 3.9, w: 3.2, h: 0.7, fontFace: HEAD, fontSize: 28, color: YEL, margin: 0 });
    s.addText(c[1], { x: x + 0.35, y: 4.6, w: 3.2, h: 1.3, fontFace: BODY, fontSize: 22, bold: true, color: WHITE, valign: 'top', margin: 0 });
  });
}
// 3. Getting in
{
  const s = base('Getting in', 'Three steps to start.', 'Model this live. The link is in Google Classroom. Students sign in with their school Google account, type the class code if asked, and make a character. Give them a time limit for the character (about 3 minutes); they can change it any time.');
  row(s, 1, 'Open', 'the Scratch Quest link in Google Classroom.', 0.6, 2.2, 6.2, COLORS[0], 20);
  row(s, 2, 'Sign in', 'with your school Google account.', 0.6, 3.35, 6.2, COLORS[1], 20);
  row(s, 3, 'Create', 'your character in the Character Studio.', 0.6, 4.5, 6.2, COLORS[2], 20);
  s.addText('You can change your character any time.', { x: 0.6, y: 5.65, w: 6.2, h: 0.5, fontFace: BODY, fontSize: 18, bold: true, color: SOFT, margin: 0 });
  shot(s, 'studio', 7.2, 2.25, 5.5);
}
// 4. Quest map
{
  const s = base('The Quest Map', 'Your path has 14 quests.', 'Everyone does the first five quests in Sprite Meadow. Then students choose Games, Stories, or Apps. The paths come back together twice. Little faces on the map show where classmates are working. A lock means finish the quest before it first.');
  shot(s, 'map', 0.6, 2.2, 6.4);
  row(s, 1, 'Start', 'in Sprite Meadow. Everyone does these.', 7.4, 2.1, 5.35, COLORS[0], 18);
  row(s, 2, 'Choose a path:', 'Games, Stories, or Apps.', 7.4, 3.15, 5.35, COLORS[1], 18);
  row(s, 3, 'Meet up', 'again in the Debug Caves.', 7.4, 4.2, 5.35, COLORS[2], 18);
  row(s, 4, 'Finish', 'at Showcase Castle with your own project.', 7.4, 5.25, 5.35, COLORS[3], 18);
}
// 5. Quest structure
{
  const s = base('Every quest works the same way', 'Five parts, always in this order.', 'This is the most important slide. Every quest has the same five parts, so students always know what comes next. The dots across the top of a quest show the same order.');
  [['Mission', 'Read what you will make.'], ['Steps', 'One card at a time. Do it in Scratch, then tap I did it!'], ['Quick Check', 'Two short questions.'], ['Bonus challenge', 'Optional. Extra XP!'], ['Turn it in', 'Tick the checklist. Paste your Scratch link.']].forEach((c, i) => {
    const x = 0.6 + i * 2.47;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.3, w: 2.3, h: 4.2, fill: { color: CARD }, line: { color: CARD }, rectRadius: 0.18 });
    chip(s, i + 1, x + 0.7, 2.6, COLORS[i], 0.9);
    s.addText(c[0], { x: x + 0.1, y: 3.7, w: 2.1, h: 0.9, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: 21, color: YEL, margin: 0 });
    s.addText(c[1], { x: x + 0.15, y: 4.65, w: 2.0, h: 1.7, align: 'center', valign: 'top', fontFace: BODY, fontSize: 17, bold: true, color: WHITE, margin: 0 });
    if (i < 4) s.addText('▶', { x: x + 2.26, y: 4.1, w: 0.25, h: 0.5, align: 'center', fontSize: 16, color: YEL, margin: 0 });
  });
}
// 6. Two windows
{
  const s = base('Two windows, side by side', 'Scratch Quest on one side. Scratch on the other.', 'Show how to split the screen. On a Chromebook: drag a window to the side of the screen, or press Alt + [ and Alt + ]. The Scratch button at the top of every quest opens Scratch.');
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 5.9, h: 3.5, fill: { color: WHITE }, line: { color: YEL, width: 4 }, rectRadius: 0.12 });
  s.addImage({ path: IMG('step'), x: 0.75, y: 2.45, w: 5.6, h: 5.6 / R });
  s.addText('Scratch Quest: read the step', { x: 0.6, y: 5.9, w: 5.9, h: 0.5, align: 'center', fontFace: BODY, fontSize: 20, bold: true, color: YEL, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 6.85, y: 2.3, w: 5.9, h: 3.5, fill: { color: 'E9F1FC' }, line: { color: ORA, width: 4 }, rectRadius: 0.12 });
  s.addShape(p.ShapeType.rect, { x: 6.85, y: 2.3, w: 5.9, h: 0.45, fill: { color: '855CD6' }, line: { color: '855CD6' } });
  s.addShape(p.ShapeType.roundRect, { x: 7.05, y: 2.95, w: 1.5, h: 2.65, fill: { color: WHITE }, line: { color: 'C9D6EA' }, rectRadius: 0.05 });
  ['4C97FF', '9966FF', 'FFBF00', 'FFAB19', '59C059'].forEach((c, i) => s.addShape(p.ShapeType.roundRect, { x: 7.2, y: 3.1 + i * 0.48, w: 1.2, h: 0.32, fill: { color: c }, line: { color: c }, rectRadius: 0.05 }));
  s.addShape(p.ShapeType.roundRect, { x: 8.7, y: 2.95, w: 1.9, h: 2.65, fill: { color: WHITE }, line: { color: 'C9D6EA' }, rectRadius: 0.05 });
  s.addShape(p.ShapeType.roundRect, { x: 8.9, y: 3.2, w: 1.3, h: 0.32, fill: { color: '4C97FF' }, line: { color: '4C97FF' }, rectRadius: 0.05 });
  s.addShape(p.ShapeType.roundRect, { x: 8.9, y: 3.52, w: 1.5, h: 0.32, fill: { color: '4C97FF' }, line: { color: '4C97FF' }, rectRadius: 0.05 });
  s.addShape(p.ShapeType.roundRect, { x: 10.75, y: 2.95, w: 1.8, h: 1.5, fill: { color: WHITE }, line: { color: 'C9D6EA' }, rectRadius: 0.05 });
  s.addShape(p.ShapeType.ellipse, { x: 11.4, y: 3.4, w: 0.55, h: 0.55, fill: { color: ORA }, line: { color: ORA } });
  s.addShape(p.ShapeType.roundRect, { x: 10.75, y: 4.6, w: 1.8, h: 1.0, fill: { color: WHITE }, line: { color: 'C9D6EA' }, rectRadius: 0.05 });
  s.addText('Scratch: build it', { x: 6.85, y: 5.9, w: 5.9, h: 0.5, align: 'center', fontFace: BODY, fontSize: 20, bold: true, color: ORA, margin: 0 });
  s.addText('Read one step. Build it. Tap I did it! Then the next step.', { x: 0.6, y: 6.5, w: 12.1, h: 0.5, align: 'center', fontFace: BODY, fontSize: 20, bold: true, color: WHITE, margin: 0 });
}
// 7. One card at a time
{
  const s = base('One step at a time', 'Each card has one job. Everything else is a tap away.', 'Walk through one real step card. Point out the block picture, the three helpers, and the green I did it! button. Stress that I did it! is a promise: only tap it when the step really works in Scratch.');
  shot(s, 'step', 0.6, 2.2, 6.9);
  row(s, '♪', 'Read to me', 'reads the card out loud.', 7.85, 2.1, 4.9, COLORS[4], 17);
  row(s, '+', 'Tell me more', 'gives extra detail.', 7.85, 3.15, 4.9, COLORS[0], 17);
  row(s, '?', 'Need a hint?', 'gives you a clue.', 7.85, 4.2, 4.9, COLORS[1], 17);
  row(s, '✓', 'I did it!', 'Tap it when your code works.', 7.85, 5.25, 4.9, COLORS[2], 17);
}
// 8. Quick check + turn in
{
  const s = base('Finish strong', 'Quick Check, then turn it in.', 'Quick Checks can be retried, but a first-try correct answer earns bonus XP and a star. To turn in: tick each checklist item honestly, click Share in Scratch, copy the link, and paste it. The teacher approves it, then the quest counts as complete.');
  shot(s, 'quiz', 0.6, 2.2, 5.9);
  shot(s, 'turnin', 6.85, 2.2, 5.9);
  s.addText([{ text: 'Quick Check: ', options: { color: YEL } }, { text: 'think first. A right answer on the first try earns bonus XP.', options: { color: WHITE } }], { x: 0.6, y: 5.9, w: 5.9, h: 0.9, fontFace: BODY, fontSize: 18, bold: true, valign: 'top', margin: 0 });
  s.addText([{ text: 'Turn it in: ', options: { color: YEL } }, { text: 'tick every box, click Share in Scratch, and paste your link.', options: { color: WHITE } }], { x: 6.85, y: 5.9, w: 5.9, h: 0.9, fontFace: BODY, fontSize: 18, bold: true, valign: 'top', margin: 0 });
}
// 9. Rewards
{
  const s = base('Earn rewards', 'Your work earns rewards.', 'XP never goes down. Coins come from XP and are spent in the Character Studio; spending coins does not lower XP or level. Stars: one for finishing, one for a perfect Quick Check, one for the bonus challenge. The arcade is only open when the teacher opens it.');
  shot(s, 'complete', 0.6, 2.2, 6.4);
  row(s, 'XP', '', 'XP for every step and every quest.', 7.4, 2.1, 5.35, COLORS[0], 18);
  row(s, '●', '', 'Coins to spend in the Character Studio.', 7.4, 3.15, 5.35, COLORS[1], 18);
  row(s, '★', '', 'Badges, and up to 3 stars per quest.', 7.4, 4.2, 5.35, COLORS[2], 18);
  row(s, '▶', '', 'Arcade tickets for when the arcade is open.', 7.4, 5.25, 5.35, COLORS[3], 18);
}
// 10. Stuck
{
  const s = base('Stuck? Try 3 before me', 'Getting stuck is normal. Do these in order.', 'Hand out the Stuck? Try This First checklist here. The I’m stuck button sends a request to the teacher screen with the exact step, so students do not need to raise a hand and wait. They should keep trying while they wait.');
  row(s, 1, 'The card:', 'read it again and open the hint.', 0.6, 2.2, 12.1, COLORS[0], 24);
  row(s, 2, 'A classmate:', 'ask them to spot what is different.', 0.6, 3.35, 12.1, COLORS[1], 24);
  row(s, 3, 'The teacher:', 'tap I’m stuck, then keep trying while you wait.', 0.6, 4.5, 12.1, COLORS[2], 24);
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 5.75, w: 12.1, h: 1.0, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.12 });
  s.addImage({ path: IMG('toolbar'), x: 0.8, y: 6.06, w: 7.4, h: 7.4 * (64 / 1360) });
  s.addText('← I’m stuck is at the top of every quest', { x: 8.4, y: 5.75, w: 4.2, h: 1.0, valign: 'middle', fontFace: BODY, fontSize: 15, bold: true, color: INK, margin: 0 });
}
// 11. Today
{
  const s = base('Today: Quest 1, Hello, Sprite!', 'Mission: make a sprite move, turn, and glide around the Stage.', 'About 40 minutes. Students need a Scratch account they can sign in to. By the end they will know their way around Scratch, move a sprite with motion blocks, use x and y to place it, and save and share a project. Early finishers: the bonus challenge is Walk a square.');
  const pts = ['Tour Scratch: blocks, code area, Stage, sprite list.', 'Move and turn your sprite with motion blocks.', 'Use x and y to send it to each corner.', 'Glide to three spots, then build your own corner tour.', 'Name it, save it, share it.'];
  pts.forEach((t, i) => row(s, i + 1, '', t, 0.6, 2.1 + i * 0.93, 6.6, COLORS[i], 17));
  shot(s, 'mission', 7.55, 2.2, 5.2);
  s.addShape(p.ShapeType.roundRect, { x: 7.55, y: 5.6, w: 5.2, h: 0.8, fill: { color: YEL }, line: { color: YEL }, rectRadius: 0.2 });
  s.addText('About 40 minutes', { x: 7.55, y: 5.6, w: 5.2, h: 0.8, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: 22, color: INK, margin: 0 });
}
// 12. Words
{
  const s = base('Words for today', 'Five words to know.', 'These are also in the Words button at the top of the quest. Have students point at each thing on the Scratch screen as you say the word.');
  [['Sprite', 'A character or object in your project.'], ['Stage', 'The big rectangle where your project plays.'], ['Block', 'A puzzle piece of code.'], ['Script', 'A stack of blocks. It runs from top to bottom.'], ['x and y', 'Numbers for a spot on the Stage. x is left-right. y is up-down.']].forEach((c, i) =>
    row(s, i + 1, c[0] + ':', c[1], 0.6, 2.1 + i * 0.97, 12.1, COLORS[i], 21));
}
// 13. Go
{
  const s = p.addSlide(); s.background = { color: BG };
  s.addShape(p.ShapeType.ellipse, { x: 10.6, y: -1.2, w: 4.2, h: 4.2, fill: { color: '4A1D96' }, line: { color: '4A1D96' } });
  s.addShape(p.ShapeType.ellipse, { x: -1.4, y: 4.9, w: 4.0, h: 4.0, fill: { color: '4A1D96' }, line: { color: '4A1D96' } });
  s.addText('Ready? Let’s go!', { x: 0.6, y: 1.6, w: 12.1, h: 1.4, align: 'center', fontFace: HEAD, fontSize: 66, color: YEL, margin: 0 });
  s.addText('Open Google Classroom, click the Scratch Quest link, and start Quest 1.', { x: 1.6, y: 3.2, w: 10.1, h: 1.2, align: 'center', fontFace: BODY, fontSize: 28, bold: true, color: WHITE, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 4.4, y: 4.9, w: 4.5, h: 1.1, fill: { color: GRN }, line: { color: GRN }, rectRadius: 0.25 });
  s.addText('START QUEST 1', { x: 4.4, y: 4.9, w: 4.5, h: 1.1, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: 30, color: INK, margin: 0 });
  s.addNotes('Release students to work. Put the Class Screen up on the projector so they can see the timer and where everyone is.');
}
p.writeFile({ fileName: OUT }).then(() => console.log('wrote', OUT));
