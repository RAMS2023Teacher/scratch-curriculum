# Lesson file spec (v2)

Every lesson lives in `src/lessons/<id>.js` as plain JS: `SQ_LESSONS.<id> = { ... };`
(no modules, no trailing commas problems — it must run in browsers and Google Apps Script V8).
Run `node tools/validate.js <id> [<id> ...]` and make it pass before you finish.

Audience: 6th graders (11–12), mixed reading levels, IEP/504 students, English learners. Scratch 3.0.
Each lesson must fit **40–45 minutes for CORE steps**. Students work self-paced, so partners are often NOT on the same step.

## Course structure (each student takes 14 lessons)
Trunk (everyone, in order): t1 Hello Sprite → t2 Events → t3 Loops (+ paint editor) → t4 If This Then That → **t5 Power-Up Pack (NEW toolkit)**
Fork 1 (pick one): Games g1,g2 · Stories s1,s2 · Apps a1,a2
Rejoin (everyone): m1 Bug Hunters & Code Readers → m2 My Blocks Workshop
Fork 2 (pick one, may differ): Games g3,g4 · Stories s3,s4 · Apps a3,a4
Finale (everyone): f1 Playtest & Polish → f2 Capstone Build → f3 Showcase Day

### What every student is guaranteed to have learned (after the trunk)
t1: sprites, Stage, x/y, motion, go to, glide, saving/sharing, naming projects.
t2: event hats (green flag, key pressed, sprite clicked), sequence, say/think, sounds, adding sprites, the "reset on green flag" habit.
t3: repeat/forever, costumes, wait, graphic effects + **clear graphic effects**, **paint editor basics** (paint a sprite/costume: fill, rectangle, circle, text tool, eraser; vector mode).
t4: if-then, key pressed? sensing, touching sprite, touching color (eyedropper), stop all, painting a backdrop.
t5: **variables** (Make a Variable, For all sprites vs For this sprite only, set vs change, show/hide variable, checkbox monitor), **comparisons** (= < >), **if-else**, **broadcast / when I receive / broadcast and wait**, **wait until**.
Anything else must be taught in the lesson, or covered by a primer listed in `needs` (below).

## Skill keys for `needs` (primers students see ONLY if their path skipped the teaching lesson)
| key | taught in | primer covers |
|---|---|---|
| `clones` | g2 | create clone of myself, when I start as a clone, delete this clone |
| `askAnswer` | a1 | ask and wait, the answer reporter |
| `join` | a1 | join two pieces of text |
| `lists` | a3 | Make a List, add/item/length/delete all |
| `pen` | m2 | Pen extension, pen down/up, erase all |
| `customBlocks` | m2 | (everyone has it after m2; only list for lessons before m2) |
| `random` | g1 | pick random |
| `textStrings` | a1 | variables can hold words, not just numbers |
| `math` | g2 | + − × ÷ blocks, and 0 − x to flip a sign |
List a key in `needs` if the lesson USES that skill and some path reaching this lesson might not have taught it.

## Lesson fields
```js
SQ_LESSONS.g1 = {
  title, tagline, mission,          // mission: ≤14 words, plain words (read aloud)
  minutes: "45",
  skill: "Variables & Scoring",
  goal: "By the end of this quest you will ...",
  vocab: [{ term, def, icon }],     // 3-5; icon = ONE emoji picture cue; def ≤ 15 words, simple English, no idioms
  warmup: "...",                    // 2-3 min, can be done alone OR with a neighbor
  needs: ["random"],                // see table; [] if none
  starter: { name, contains },      // ONLY for lessons that continue a previous project (part 2 of a project, f1/f2 if they open old work).
                                    // contains = what the teacher's starter project must include, so an absent student can begin here.
  project: { name, part },          // as before, on branch lessons that build a multi-lesson project
  steps: [ STEP, ... ],             // 6-8 steps
  quiz: [ QUIZ, QUIZ ],             // exactly 2
  challenge: { title, short, text, answer },  // spec-only expert task: NO blocks shown; `answer` = scratchblocks solution (hidden behind "Show me")
  checklist: ["...", "..."],        // 3-5 short "My project has..." criteria for turn-in (core only)
  submit: "...",                    // what to share; say "Name your project anything you like (idea: ...)" — don't dictate names
  teacherNotes: "..."               // pacing, misconceptions, AND the accommodation note for this lesson
};
```

## Step fields
```js
{
  title: "Make it fall",
  short: "Make the falling sprite start at a random spot and drop down.", // ≤14 words, imperative, plain (read aloud: no symbols, no "(10)" style)
  text: "Fuller explanation (Tell me more). Simple HTML ok: <b>, <i>, <br>.",
  where: "Falling sprite",          // REQUIRED for steps with code: which sprite or "Stage" the code goes on
  change: "new",                    // REQUIRED with code: "new" (new script) | "add" (add into an existing script) | "replace" (replace an old script) 
  changeNote: "Replaces your step 3 script", // REQUIRED for "add"/"replace": exactly which script and where
  scaffold: "full",                 // REQUIRED with code: "full" | "parsons" | "goal"   (see Fading)
  blocks: "scratchblocks text",     // the complete correct solution for this step
  options: [ { label, short, blocks } ],  // OPTIONAL instead of blocks: 2 mechanic choices (e.g. "Falling" vs "Dodging"). Each has full solution blocks. Same scaffold applies.
  shots: ["make-variable"],         // OPTIONAL screenshot keys (list below) for "where to click" steps
  tip: "...",                       // hint: anticipate the #1 confusion at this step (most code steps should have one)
  stretch: true,                    // OPTIONAL: step is "if you have time". Max 2 per lesson; never needed for the checklist.
  solo: "...",                      // REQUIRED if the step involves a partner/neighbor/friend: what to do if nobody is free
  frame: "..."                      // OPTIONAL writing template / sentence frames for any writing task (use \n for lines)
}
```

### Fading (the most important rule)
Within each lesson, support fades: early code steps `scaffold: "full"` (student sees the whole script), middle steps `"parsons"` (the app shows the needed blocks one-by-one in SHUFFLED order and the student puts them together; keep these scripts ≤ 8 lines), and at least ONE core step near the end `"goal"` (no blocks shown — the student builds it from the description using blocks they already know; the solution is behind "Stuck? Show me"). Across the course fade further: t1–t2 mostly full; t3–t5 full→parsons→goal; branches and later: more parsons/goal. f-lessons are mostly goal/planning.
A goal step's `short` + `text` must give enough of a spec to succeed (what should happen, which blocks/categories might help) without giving the script.

### Quiz
```js
{ q: "What will the sprite say?", blocks: "optional code to trace", choices: ["a","b","c","d"], answer: 1, explain: "..." }
```
At least ONE of the two must be a **predict/trace** question that includes `blocks` ("What happens when you click the green flag?"). Vary the correct index. Explanations ≤ 25 words.

### Screenshot keys for `shots`
tour, xy, green-flag, cat-events, cat-sound, cat-control, cat-looks, cat-operators, touching-color, ask, make-variable, make-list, make-block, extensions, choose-sprite, delete-sprite, costumes-tab, sounds-tab, select-stage, backdrops

### Writing rules
- `short` and `mission`: ≤ 14 words, plain, no emoji, no arrows, no parentheses-numbers. They're read aloud.
- Avoid idioms (no "drown out", "sneak through", "scope creep"). Simple English for ELLs.
- Every partner step gets `solo` (e.g. "Test it yourself as if you'd never seen it: play with your eyes on the Stage only, and write what confused you" or "Ask your teacher to try it").
- Every writing task gets a `frame`.
- Name things students will see in Scratch exactly as Scratch names them.
- Move student-relevant warnings into `tip`s (scope, "click the Stage first so keys work", "custom blocks only work in their own sprite", effects piling up, wall color inside your own sprite, etc.).
- scratchblocks syntax: one block per line; C-blocks close with `end`; `else` on its own line; dropdowns `(Apple v)` / `[score v]`; numbers `(10)`; text `[hello]`; booleans `<...>`. Hat: `when green flag clicked`. Custom block call: `jump (10)`; define: `define jump (height)`.
