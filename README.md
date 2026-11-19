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
- **Celebrations**: finishing a quest shows a stamped **Quest Complete** screen with up to 3 stars (finished, perfect Quick Check, bonus challenge) and XP and coins that count up. New badges spin in as medals (teacher badges show your note), level-ups get a big level burst listing new unlocks, and purchases flip-reveal the item with a glow in its rarity color. Small moments get small cues: bursts on checked steps and right answers, coins flying to the counter, and an XP bar that fills. Anything a student earns while away (an approved quest, a teacher badge) is celebrated the next time they open the app. Every sound is made in the browser, and the animations turn off for students whose device is set to reduce motion.
- **✋ I'm stuck**: a button in every quest lets a student ask for help quietly, with an optional note. Their screen shows "Help is on the way!" until you mark it helped or they tap "I figured it out".
- **🤔 Confusing? and quest ratings**: students can flag any step or quick check as confusing (with a reason), and rate each quest with five faces for +10 XP.
- **Locked buttons explain themselves**: a button that isn't ready (Turn it in before the checklist is ticked, Buy without enough coins) is grey but clickable. Clicking it buzzes, shakes, and outlines what's missing.
- **Display settings** (the sliders button at the top): text size (Normal, Large, Extra large), easy-to-read letters, stronger contrast, less movement, and language. You can also set these for a student on their student page.
- **Brazilian Portuguese**: when a student chooses Português (Brasil), the menus, lesson text, quick checks and hints are shown in Portuguese, block pictures use the official Portuguese block names (so they match a Scratch editor set to Português Brasileiro), and Read to me uses a Portuguese voice. Common words are hand-translated; everything else is machine-translated by Google Translate (built into Apps Script) and saved in the **Translations** tab of your Sheet, where you can correct any line in column D. Names are never sent for translation. Code typed by students and Scratch itself are not translated by the app.
- **Report a bug** (the bug button at the top): students and teachers can describe a problem; the report includes the page, screen size, device and recent errors. Errors on a student's Chromebook are also reported automatically.
- **Block Rush arcade** (Arcade tab): a short original mini-game. Students' avatars catch falling code blocks and dodge bugs, with combos and gold stars, to climb a class leaderboard. Each finished quest earns a **ticket** for a short pass (5 minutes by default), and extra tickets and one-use **power-ups** (Bug Shield, Slow-Mo, Block Magnet, Extra Heart, Double Points) cost coins. High scores unlock three arcade titles for the Character Studio. Only you can open it (see below).
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
- **Help requests**: a doorbell and a red "needs help" card on the Dashboard and the Class Screen show who is stuck, the exact step, and their note. One click on **Helped** clears it. Requests expire after an hour.
- **Feedback tab**: per quest, the average rating, the most-flagged steps with reasons and notes, quick checks missed by 30% or more on the first try, and student comments. **Copy report for Claude** (or Download .md) makes a Markdown report with each lesson's file path and no student names, ready to paste to Claude to improve the lessons. See `docs/sample-feedback-report.md`.
- **Bug reports** (Feedback tab, and the **Bugs** tab of your Sheet): each report shows who, where, what they typed and device details. Mark them fixed, delete them, or **Copy for Claude** to get a no-names Markdown list to paste to Claude.
- **Choose the quest on the Class Screen**: the "Showing" menu above the track picks which quest the race track shows (or Auto: where most students are).
- **Two arcade games**: **Block Rush** and **Kart Dash** (a 60-second top-down race: pass rival karts, grab coins, hit boost pads, stay off the grass and out of the oil). Each game has its own leaderboard, and the same tickets, passes and teacher lock cover both.
- **Garage**: six karts bought with coins (Go-Kart is free; Blue Bolt 150, Drift Wing 200, Mud Dozer 250, Rocket Racer 400, Golden Comet 800), each with different speed, steering and boost. Every kart has three parts to upgrade (Engine, Tires, Turbo), three levels each at 40, 80 and 150 coins. The student's own character drives.
- **Arcade is earned**: by default it takes **2 finished quests** to earn a ticket and a ticket costs **100 coins** to buy (set Quests per ticket 1–5 and the price, or 0 so tickets can't be bought). **Rewards**: 1 coin per 100 points (up to 25 a game, 100 a day), one-time coin prizes for score goals (300 to 4,000 points), four arcade badges, and 100/60/30 coins for the top 3 when you start a new round.
- **Students keep moving while work waits for review** (on by default, per class on the Classes tab): a turned-in quest opens the next one right away. The 100 XP for finishing, and any badges, still arrive when you approve it. Turn the setting off to make students wait for approval.
- **Quick approve from the Class Screen**: a yellow "N to review" button appears when work is waiting. It opens a list with only names, quest titles and project links, an **Approve** button for each, and **Approve all**. Reflections, feedback and sending work back stay on the private Review tab.
- **Pacing (no clicking through)**, set per class on the Classes tab: "I did it!" stays grey until the student has spent a minimum time on the step (20 seconds by default; 0 to 90), quick-check answers pause after a wrong guess (8 seconds by default), and cards must be done in order (dots for cards a student hasn't reached are locked). All three are also enforced on the server, so they can't be skipped from the browser. Teachers previewing as a student are not held back.
- **Idle nudges**: when a student hasn't clicked, typed or scrolled for a while (45 seconds by default; off to 2 minutes), the next thing to do pulses with a short tip: the next quest on the map, the Next button, the quick-check answers, the checklist. On a build step the nudge waits 4 times longer (at least 2 minutes), because students are working in Scratch, and after twice that it points to the hint and "I'm stuck". Any click or mouse movement clears it.
- **Arcade controls** (Dashboard → Arcade): **Locked** (the default), **Earned passes** (students spend a ticket), or **Free play**. Opening it always sets a closing time (15–90 min), so it locks itself after class. Locking ends every pass right away. You can also set the pass length and ticket price, and **start a new leaderboard round** whenever you like. Scores are checked on the server: a run has to be started from the server, and impossible scores are capped.
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

## Keeping your data safe

- **The app never replaces its data sheet.** If Google is too busy to open the "Scratch Quest Data" spreadsheet, students see a short "Busy… saving your work" note and the page retries by itself. (An earlier version could create a new, empty sheet in that situation, which made classes seem to vanish.)
- **Fewer requests at once.** Google allows about 30 requests at the same moment for the whole class. Each browser now sends one request at a time, retries quietly when Google is busy, keeps the lessons on the device, and stops checking for updates while its tab is in the background.
- **Light requests.** A student's click reads only that student's row (not every student), and the class map is built once and shared for 20 seconds.
- **Unreadable records are never overwritten.** If a saved record can't be read, the app stops that one action with a message instead of saving a blank record over it.
- **Daily backups.** Once a day (set `BACKUP_EVERY_DAYS` at the top of Code.gs), when you open the teacher view, a copy named "Scratch Quest Backup (date)" is saved to your Google Drive. The Classes page lists them and has a **Back up now** button. Delete old ones from Drive whenever you like.
- **If some students are in one data sheet and some in another** (for example the app started a new sheet and a class kept working in it): open **Classes → Your data → Combine with another data sheet**, paste the link to the other sheet, press **Check what it would add**, then **Combine now**. Every class and student from the other sheet is added to the one in use. A student who is in both keeps the best of each quest from either sheet and stays in the class they used most recently. Nothing is removed, the other sheet is only read, a backup copy is made first, and combining the same sheet twice changes nothing.
- **If classes or students are missing:** open **Classes → Your data**. It shows which spreadsheet the app is using and how many students are in it. Under "Reconnect your data sheet", paste the link to the spreadsheet that has your students (search Google Drive for "Scratch Quest Data" and open the one with rows in its Students tab). Nothing is deleted; it only tells the app which sheet to use. Only the owner of the script can do this.
- Without the app: in the Apps Script editor, open **Project Settings → Script properties** and set `DB_ID` to the id of the right spreadsheet (the long code in its link between `/d/` and `/edit`).

The same rules, written so they can be applied to any other Apps Script app, are in `docs/RELIABILITY_GUIDE.md`.

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
