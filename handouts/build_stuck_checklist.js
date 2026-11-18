// Scratch Quest "Stuck?" checklist, 6th grade (red). Built in the Perkins CS Docs style.
const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign } = require("docx");
const fs = require("fs");
const OUT = process.argv[2];
const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 800;
const RED = "A21D21", LIGHT = "F5E9E9", BLACK = "1A1A1A", GRAY = "6B7280", AMBER = "FFF3CD", AMBER_B = "B26A00";
const CONTENT_W = PAGE_W - MARGIN * 2;
const underline = (c, s) => ({ bottom: { style: BorderStyle.SINGLE, size: s || 6, color: c } });
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = () => ({ top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none });
const box = (c, s = 8) => { const b = { style: BorderStyle.SINGLE, size: s, color: c }; return { top: b, bottom: b, left: b, right: b }; };
const grid = (c = "D9B8B8") => { const b = { style: BorderStyle.SINGLE, size: 4, color: c }; return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }; };
// parts: strings or [text, {bold, italics, color}]
const runs = (parts, size = 23) => (typeof parts === "string" ? [parts] : parts).map((p) => typeof p === "string"
  ? new TextRun({ text: p, color: BLACK, size }) : new TextRun({ text: p[0], color: p[1].color || BLACK, size, bold: !!p[1].bold, italics: !!p[1].italics }));
const B = (t) => [t, { bold: true }];
const heading = (n, t, note) => new Paragraph({ spacing: { before: 150, after: 70 }, keepNext: true, border: underline(RED, 4), children: [
  new TextRun({ text: n + "  ", bold: true, color: RED, size: 30 }), new TextRun({ text: t, bold: true, color: RED, size: 25 }),
  ...(note ? [new TextRun({ text: "   " + note, italics: true, color: GRAY, size: 19 })] : [])] });
const check = (parts) => new Paragraph({ spacing: { after: 64 }, indent: { left: 380, hanging: 380 }, tabStops: [{ type: "left", position: 380 }], keepLines: true,
  children: [new TextRun({ text: "☐\t", bold: true, color: RED, size: 25 }), ...runs(parts)] });

const children = [];
const logo = fs.readFileSync(process.env.SKILL_DIR + "/assets/cs_logo_red.png");
children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W - 1500, 1500], borders: noBorders(),
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: CONTENT_W - 1500, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 0, bottom: 0, left: 0, right: 200 }, children: [
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Stuck? Try This First", bold: true, size: 38, color: RED })] }),
      new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6th Grade Computer Science · Scratch Quest · Help Checklist", italics: true, color: BLACK, size: 22 })] }),
    ] }),
    new TableCell({ width: { size: 1500, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 0, bottom: 0, left: 260, right: 60 },
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ data: logo, transformation: { width: 74, height: 73 }, type: "png" })] })] }),
  ] })] }));
children.push(new Paragraph({ spacing: { before: 60, after: 110 }, border: underline(RED, 8), children: [] }));

// the rule
children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: box(RED),
  rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill: LIGHT }, margins: { top: 110, bottom: 110, left: 200, right: 200 }, children: [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "The rule: Try 3 before me", bold: true, color: RED, size: 26 })] }),
    new Paragraph({ spacing: { after: 0 }, children: runs([B("1. The quest card"), "  →  ", B("2. Your code"), "  →  ", B("3. A classmate"), "  →  then ask Mr. Perkins with the ", B("I’m stuck"), " button. Getting stuck is normal. Every coder does it!"], 22) }),
  ] })] })] }));

children.push(heading("1", "Check the quest card"));
[
  ["I read the ", B("whole card"), " again, slowly. (Or I tapped ", B("Read to me"), ".)"],
  ["I opened ", B("Tell me more"), " and ", B("Need a hint?"), " under the step."],
  ["I tapped the ", B("picture"), " to make it bigger and matched it to my screen."],
  ["I tapped ", B("Words"), " to look up a word I didn’t know."],
].forEach((c) => children.push(check(c)));

children.push(heading("2", "Check your code", "Compare your blocks to the picture, one block at a time."));
[
  ["My code is on the ", B("right sprite"), ". (Click the sprite under the Stage first.)"],
  ["My blocks are ", B("snapped together"), " with no gaps."],
  ["My blocks are in the ", B("same order"), " as the picture, top to bottom."],
  ["My ", B("numbers match"), " the card (x, y, steps, seconds, degrees)."],
  ["I ", B("ran it"), ": I clicked the script, or did what its top block says (green flag, key press)."],
].forEach((c) => children.push(check(c)));

children.push(heading("3", "Ask for help"));
[
  ["I asked a ", B("classmate"), ": “Can you spot what’s different from the picture?” (They point. You fix it.)"],
  ["I tapped ", B("I’m stuck"), " at the top of the quest and typed what I’m stuck on."],
  ["I ", B("kept trying"), " while I waited. (Tap ", B("I figured it out"), " if you solve it!)"],
  ["If the directions didn’t make sense, I tapped ", B("Confusing?"), " so the quest can be fixed."],
].forEach((c) => children.push(check(c)));

// quick fixes
children.push(new Paragraph({ spacing: { before: 170, after: 80 }, keepNext: true, border: underline(RED, 4), children: [new TextRun({ text: "Quick fixes", bold: true, color: RED, size: 25 })] }));
const fixes = [
  ["My sprite disappeared.", ["Use ", B("go to x: 0 y: 0"), " (Motion) and ", B("show"), " (Looks)."]],
  ["Nothing happens when I click.", ["Click the block stack itself. Check that every block is snapped on."]],
  ["I can’t find a block.", ["Look at its ", B("color"), " on the card, then click that color on the left side of Scratch."]],
  ["My project didn’t save.", ["Make sure you’re signed in to Scratch. Click ", B("File → Save now"), ". Look in ", B("My Stuff"), "."]],
  ["The quest is locked.", ["Finish the quest before it. If it says your teacher hasn’t opened it yet, go back and try a bonus challenge."]],
  ["Turn it in is grey.", ["Tick every checklist box. In Scratch click ", B("Share"), ", then copy the link and paste it."]],
  ["The page looks frozen.", ["Reload the page. Your progress is saved."]],
];
const c1 = 3300, c2 = CONTENT_W - c1;
const cell = (w, kids, fill) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: fill ? { fill } : undefined, margins: { top: 70, bottom: 70, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER, children: kids });
children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [c1, c2], borders: grid(),
  rows: [new TableRow({ tableHeader: true, cantSplit: true, children: [
    cell(c1, [new Paragraph({ children: [new TextRun({ text: "If…", bold: true, color: "FFFFFF", size: 21 })] })], RED),
    cell(c2, [new Paragraph({ children: [new TextRun({ text: "Try this", bold: true, color: "FFFFFF", size: 21 })] })], RED)] })]
    .concat(fixes.map(([a, b], i) => new TableRow({ cantSplit: true, children: [
      cell(c1, [new Paragraph({ children: [new TextRun({ text: a, bold: true, color: BLACK, size: 22 })] })], i % 2 ? LIGHT : undefined),
      cell(c2, [new Paragraph({ children: runs(b, 22) })], i % 2 ? LIGHT : undefined)] }))) }));

children.push(new Paragraph({ spacing: { before: 170, after: 0 }, children: [
  new TextRun({ text: "❗  Reminder: ", bold: true, color: RED, size: 23 }),
  new TextRun({ text: "Keep this sheet at your desk. Use it every time you get stuck.", bold: true, color: BLACK, size: 23 }),
] }));

const doc = new Document({ sections: [{ properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children }] });
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("done", OUT); });
