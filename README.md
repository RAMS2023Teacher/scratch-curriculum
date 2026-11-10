# Scratch Quest 🧭

A gamified Scratch course for 6th grade: an adventure map of quests, avatars students design, XP, levels, badges, unlockable items, a shared class map, and a teacher dashboard.

## What's in it

**For students**
- **Quest map**: 22 quests in a tree. Each student's path is **14 quests** (40–45 min each):
  - **Sprite Meadow** (everyone): Hello, Sprite! → Lights, Camera, Events! → Loop-de-Loop (+ paint editor) → If This, Then That → **Power-Up Pack** (toolkit: variables, comparisons, if/else, broadcasts)
  - **Fork 1, choose a path** (2 quests that build one project):
    - 🎮 Games: Score Keeper → Clone Army (*Catch Game*)
    - 📖 Stories: Talking Characters → Scene Changer (*Animated Story*)
    - 📱 Apps: Ask Me Anything → Quiz Builder (*Quiz App*)
  - **Debug Caves** (paths rejoin): Bug Hunters & Code Readers → My Blocks Workshop
  - **Fork 2, same path or a new one**:
    - 🎮 Gravity & Jumping → Level Up! (*Platformer*)
    - 📖 Choose Your Path → Sound & Atmosphere (*Interactive Adventure*)
    - 📱 List Master → Drawing Tools (*Super App*)
  - **Showcase Castle** (rejoin): Playtest & Polish → Capstone Build → Showcase Day (ends with the **Mystery Mission**, a 10-minute independent build that checks transfer)
  - Early finishers can go back and do branches they skipped.
- **Scaffolding fades** in every lesson: early steps show the full script, middle steps are 🧩 block puzzles (the blocks shown shuffled), and later steps are 🎯 build-it-yourself, with **Stuck? Show me** always one tap away. Each code step says which sprite the code goes on and whether it is a ✨ NEW script, an addition, or a 🔁 replacement.
- **🆕 Primer cards**: if a student's path skipped a skill a lesson uses (for example ask/answer for a Games student in List Master), a short primer card appears first. Other students never see it.
- **Accommodations**: Core vs ⭐ Stretch steps, writing frames, solo options for every partner step, picture vocabulary, starter projects for absent students, and per-student settings (core only, auto read-aloud). See `docs/accommodations.md`.
- **Each quest is a one-card-at-a-time player** sized to sit beside Scratch in split screen: a mission card, then one step per card (a one-sentence instruction, a block picture, and "Tell me more" / "Need a hint?" folded away), 2 Quick Check cards, an optional bonus challenge, and a turn-in card. A big **I did it!** button moves to the next card, and progress dots show where you are.
- **📸 Where-to-look screenshots** on 36 steps that send students somewhere in Scratch (Costumes tab, Make a Variable, the Choose a Sprite button, the Extensions button and so on). Each one is a real Scratch 3 editor screenshot with the spot highlighted, and students can tap it to see it bigger.
- **🔊 Read to me** on every card reads it aloud using the browser's built-in voice. It works offline and needs no account; Chrome on Chromebooks has good voices.
- **XP**: step +10 · Quick Check +20 (+10 on the first try) · bonus challenge +50 · finished quest +100 · teacher badge +50. There are 16+ levels with rank titles (Sprite Sprout → Scratch Legend). The course path alone reaches about level 11–12.
- **Avatar builder**: about 60 items. Many unlock by level or by badge (cat ears for Loop Legend, crown for Showcase Star, pets, frames, backgrounds and more).
- **19 automatic badges** plus **4 teacher-awarded badges**: Helping Hand, Creative Spark, Never Give Up, Team Player.
- **Class view**: every classmate's avatar stands on the quest they're working on. There is also a shared **class XP goal** bar, and an optional leaderboard (off by default).

**For you (teacher)**
- **Dashboard** with a progress grid (student × quest) and activity stats.
- **Review queue**: approve a turned-in quest, or send it back with feedback.
- **Pacing gate** per class: "students can work up to quest tier N".
- **Per-student page**: give badges, add bonus XP, reopen a quest, rename, move to another class, remove.
- **Lessons page**: preview every quest with teacher notes, and paste a YouTube, Google Drive, Vimeo or Loom link to put your video overview at the top of any quest.
- **📏 Standards tab**: every lesson is aligned to the **Massachusetts DLCS Framework (2016), grades 6–8**, using the official wording, with a line on how each lesson addresses each standard. The tab shows the share of each class that has finished a lesson covering each standard. Lesson cards and previews show their standards too. There is also a printable summary in `docs/standards-alignment.md`; edit the alignments in `src/standards.js`.
- **🏫 Google Classroom**: import rosters (students are pre-enrolled, no codes), and post quests as Classroom assignments under a "Scratch Quest" topic, each linking straight into its quest.
- **Character Studio and coin shop**: students earn **coins** with their XP (1 coin per 5 XP; spending never lowers XP or level) and spend them on 40+ items across four rarities (Common, Rare, Epic, Legendary): auras, sparkle effects, titles shown under their name, hats, glasses, outfits, pets, backgrounds and frames. They can try anything on, pin a **savings goal** that follows them on the map, and collect everything (a collection counter shows progress). Purchases are checked on the server. Sound effects are made in the browser (no files): students can mute them, and teachers can turn sounds or the shop off per class on the Classes tab. Chance-based "mystery box" purchases are deliberately left out.
- **📺 Class Screen** (Dashboard → 📺 Class Screen): a full-screen page to project during work time. It shows the clock, a countdown timer, what to work on, a question to think about, where every team is, recent wins, and who to ask for help. It only shows positive information: no grades, quiz results, or returned work. Set it up with ⚙ (timer, focus quests, question, teams). It refreshes every 20 seconds without flicker.
- **Projector mode**: a full-screen class map with the join code.
- **Cheat-resistant**: XP, unlocks and prerequisites are checked on the server, so students can't change them from the browser console.

## Try the demo

Open `dist/scratch-quest-demo.html` in any browser. Use the bar at the top to switch between **Student** and **Teacher**. The student join code is **DEMO1**. Demo data stays in that browser only.

## Put it online for your class (Google Apps Script + Google Sheets + Classroom, about 15 minutes)

It runs on your school's Google Workspace. Students sign in with their school Google accounts (no new passwords), all data goes into a Google Sheet in **your** Drive, and Google Classroom brings in your rosters. Privacy details are in `docs/privacy.md`.

1. Go to <https://script.google.com> → **New project**. Name it "Scratch Quest".
2. **⚙️ Project Settings** → tick **Show "appsscript.json" manifest file in editor**.
3. Back in the **Editor**, add the files from `dist/apps-script/`. For each one: **+ → Script** or **+ → HTML**, type the name **without** the extension (the editor adds it), paste the **whole** file, and save.
   - `appsscript.json`: replace its contents. This turns on Google Classroom and requests only the permissions in `docs/privacy.md`.
   - Scripts: `Code` (replace the existing one) and `Shared`.
   - HTML: `Index`, `Styles`, `Shots`, `Engine`.
   - The whole project is about 660 KB. Google refuses to save projects that are too big, so lesson content lives only in `Shared`, and the block-picture library loads from jsDelivr (a public code site). If a school filter blocks it, steps show the blocks as text instead. If any file is missing or cut off, the app shows a page saying which one.
4. Choose **setup** in the function dropdown and click **Run**. Approve the permissions. This creates the "Scratch Quest Data" Google Sheet and checks the Classroom connection (see **Execution log**).
5. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone within [your school domain]**. Copy the **Web app URL**.
6. Open the URL. You're the teacher automatically. Go to **🏫 Classroom → Load my Classroom classes → Import** for each period. Students are pre-enrolled, so they don't need a class code.
7. In **🏫 Classroom → Post quests**, tick the first few quests and post them (drafts by default, so you can check them in Classroom first). Each assignment links straight to its quest.
8. Before the course: create the starter projects and class studio listed in `docs/starter-projects.md`.

Students can also join with a class code (Classes tab) if you don't use Classroom.

**Your Sheet:** the **Progress** tab is a readable gradebook (one row per student, ✔ per quest). The other tabs are the app's data, so don't edit the "data" columns.

**Updating later:** edit `src/`, run `node build.js`, re-paste the changed files, then **Deploy → Manage deployments → Edit → Version: New version** (the URL stays the same).

**If Classroom shows an error:** your Google admin may need to allow the Classroom API for Apps Script, or allow this internal app. Everything except the Classroom tab still works without it.

**Developers:** `node tools/validate.js` checks lessons. `node tools/test-apps-script.js` runs the Apps Script server code against a fake Google (Sheets + Classroom) environment, and `node tools/test-apps-script-page.js` loads the assembled web app page in a real browser against that environment.

### Things to check with your district
- Students under 13 need to use Scratch through your **teacher/class Scratch accounts** (or just "show the teacher" instead of a link; the project link is optional unless you turn on "Require a Scratch project link").
- Data never leaves your Google Workspace. It's one Sheet, and you can open it any time. Rows hold a readable summary (XP, level, quests done, current quest). Please don't hand-edit the JSON "data" column.

## Editing lessons
Lesson content is in `src/lessons/` (one file per lesson; the format is in `docs/LESSON_SPEC.md`, and `node tools/validate.js` checks it, including that every block is a real Scratch block). Each lesson has: titles, a one-line `mission`, steps (a one-sentence `short` that students see first, plus the fuller `text` behind "Tell me more"), block scripts, quiz questions, challenges and teacher notes. Block pictures use [scratchblocks](https://scratchblocks.github.io) syntax. The tree layout, XP values and badges are in `src/rules.js`, and avatar items are in `src/avatar.js`. Run `node build.js` after editing.

## Files
```
src/lessons/       22 lessons (one file each)
src/primers.js     "New to this?" primer cards
docs/              standards alignment, accommodation plan, starter-project list, lesson spec
tools/validate.js  lesson checker
src/rules.js       quest tree, XP, levels, badges (shared by server + browser)
src/avatar.js      avatar items + SVG drawing (original art)
src/service.js     game logic / API (shared by server + browser demo)
src/api.js         talks to Apps Script, or runs the demo locally
src/app.js         the web app UI
src/styles.css
apps-script/Code.gs  Google Apps Script server + Google Sheets storage
src/shotmap.js     which screenshot goes with which step
shots/             the screenshots (JPEG)
tools/capture-shots.js  re-takes the screenshots from a locally running copy of the Scratch editor (npm package scratch-gui)
build.js           builds dist/
vendor/            scratchblocks (MIT)
```
