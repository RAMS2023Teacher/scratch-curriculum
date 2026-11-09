SQ_LESSONS.g2 = {
  title: "Clone Army",
  tagline: "One falling object? Boring. Let's make it rain.",
  mission: "Use clones, a timer, and a Game Over screen in your game.",
  minutes: "45",
  skill: "Clones, Timers & Game Over",
  goal: "By the end of this quest you will use clones to make many falling objects, add a countdown timer, and end the game with a Game Over screen.",
  vocab: [
    { term: "Clone", def: "A copy of a sprite that Scratch makes while the project runs.", icon: "👯" },
    { term: "Parent", def: "The original sprite. It makes the clones. Clones copy how it looks.", icon: "🏭" },
    { term: "delete this clone", def: "A block that removes a clone when its job is done.", icon: "🗑️" },
    { term: "Timer", def: "A variable that counts down, so the game has an end.", icon: "⏱️" }
  ],
  warmup: "Look at the sky in a rain game: one drop, or many? If you had to code 50 raindrops one by one, how long would it take? Talk about it with a neighbor, or write your guess.",
  needs: [],
  starter: {
    name: "Catch Game starter",
    contains: "A Player sprite that moves left and right with the arrow keys at y -150. A Faller sprite with ONE green flag script: set score to 0, go to a random x at y 170, then a forever loop with change y by -5, an if touching Player that adds 1 to score and goes back to the top, and an if y position less than -170 that takes away 1 point and goes back to the top. A score variable For all sprites."
  },
  project: { name: "Catch Game", part: "Part 2 of 2" },
  steps: [
    {
      title: "Open your Catch Game",
      short: "Open your Catch Game from My Stuff. Save a copy to be safe.",
      text: "Open your Catch Game from last quest in <b>My Stuff</b>. Click <b>File</b>, then <b>Save as a copy</b>, so your old version is safe. Missed last quest? Open the starter project at the top of this quest and click <b>Remix</b>.<br><br>Today the Faller becomes a <b>clone factory</b>: one hidden parent sprite that makes a new falling copy every second.",
      tip: "Only one Faller today. If you made Faller2 in the stretch step, delete it. Clones will do that job now."
    },
    {
      title: "Teach the clones",
      short: "Build a when I start as a clone script that makes each clone fall.",
      text: "Find <b>when I start as a clone</b> in <b>Control</b> (orange). Every clone runs this script on its own. Each clone starts at a random spot, shows itself, and falls until it reaches the bottom or touches the Player. Then it uses <b>delete this clone</b>, because a clone that is done should go away. You can drag the blocks you need out of your old green flag script.<br><br>Pick the same game type you chose last quest.",
      where: "Faller",
      change: "new",
      scaffold: "full",
      shots: ["cat-control"],
      options: [
        {
          label: "Falling (catch it)",
          short: "Touch the Player for one point. A miss takes away one point.",
          blocks: "when I start as a clone\ngo to x: (pick random (-220) to (220)) y: (170)\nshow\nrepeat until <(y position) < [-170]>\nchange y by (-5)\nif <touching (Player v)?> then\nchange [score v] by (1)\nstart sound (pop v)\ndelete this clone\nend\nend\nchange [score v] by (-1)\ndelete this clone"
        },
        {
          label: "Dodging (avoid it)",
          short: "Getting hit takes away three points. A safe landing gives one point.",
          blocks: "when I start as a clone\ngo to x: (pick random (-220) to (220)) y: (170)\nshow\nrepeat until <(y position) < [-170]>\nchange y by (-5)\nif <touching (Player v)?> then\nchange [score v] by (-3)\nstart sound (pop v)\ndelete this clone\nend\nend\nchange [score v] by (1)\ndelete this clone"
        }
      ],
      tip: "Why <b>show</b>? A clone copies everything about its parent: costume, size, and if it is hidden. The parent will be hidden, so each clone must show itself."
    },
    {
      title: "Build the clone factory",
      short: "Make the parent hide and create a new clone every second.",
      text: "Now change the green flag script. The parent does not fall any more. It resets the score, hides, and makes a clone every second. Put the blocks in the right order.",
      where: "Faller",
      change: "replace",
      changeNote: "Replaces your whole old Faller green flag script. Delete any old blocks that are left under it, so the Faller has only this green flag script.",
      scaffold: "parsons",
      blocks: "when green flag clicked\nset [score v] to (0)\nhide\nforever\ncreate clone of (myself v)\nwait (1) seconds\nend",
      tip: "Put <b>create clone</b> ONLY in this green flag script. If it is inside <b>when I start as a clone</b>, every clone makes more clones, and the game fills up and freezes. Scratch stops at 300 clones."
    },
    {
      title: "Add a countdown timer",
      short: "Make a time variable on the Stage that counts down from thirty.",
      text: "Click the <b>Stage</b> (bottom right). Make a variable called <code>time</code>. On the Stage, every variable is <b>For all sprites</b>, so all sprites can read it. Rename your play backdrop to <b>Play</b> in the <b>Backdrops</b> tab. This script starts on the Play backdrop, counts down one second at a time, and sends <b>game over</b> when time is 0. Choose <b>New message</b> in the broadcast dropdown to make the game over message.",
      where: "Stage",
      change: "new",
      scaffold: "parsons",
      shots: ["select-stage", "make-variable"],
      blocks: "when green flag clicked\nswitch backdrop to (Play v)\nset [time v] to (30)\nrepeat until <(time) = [0]>\nwait (1) seconds\nchange [time v] by (-1)\nend\nbroadcast (game over v)",
      tip: "Make sure the Stage is selected (it has a blue outline) before you add these blocks. If you build this on a sprite, it still works, but it is harder to find later."
    },
    {
      title: "Game Over screen",
      short: "Paint a Game Over backdrop. Show it and stop the game when time ends.",
      text: "In the Stage's <b>Backdrops</b> tab, paint a new backdrop. Use the text tool to write GAME OVER. Name it <b>Game Over</b>.<br><br>Now build a script on the Stage, with no blocks shown: when the Stage receives the <b>game over</b> message, it switches to the Game Over backdrop, then stops everything. You know all of these blocks: one from <b>Events</b>, one from <b>Looks</b>, one from <b>Control</b>.",
      where: "Stage",
      change: "new",
      scaffold: "goal",
      shots: ["backdrops"],
      blocks: "when I receive [game over v]\nswitch backdrop to (Game Over v)\nstop [all v]",
      tip: "<b>stop all</b> also deletes every clone, so the screen clears and only your Player and score stay. Test it: set time to 5 for a quick check, then put it back to 30."
    },
    {
      title: "Make a speed variable",
      short: "Make a speed variable that grows by one every five seconds.",
      text: "Good games get harder slowly. Click the Stage and make a variable called <code>speed</code>. It starts at 3 and goes up by 1 every 5 seconds. Like <code>time</code>, it is <b>For all sprites</b>, so every clone can read it.",
      where: "Stage",
      change: "new",
      scaffold: "parsons",
      stretch: true,
      shots: ["make-variable"],
      blocks: "when green flag clicked\nset [speed v] to (3)\nforever\nwait (5) seconds\nchange [speed v] by (1)\nend",
      tip: "Nothing gets faster yet. The clones still use -5. The next step connects them to speed."
    },
    {
      title: "Clones use the speed",
      short: "Make the clones fall at the speed from your speed variable.",
      text: "Clones need to move DOWN by <code>speed</code>. Down means a negative number. Scratch has no minus sign block for a variable, so we use <b>0 minus speed</b> from <b>Operators</b>. If speed is 3, then 0 - 3 = -3, so the clone moves down 3.",
      where: "Faller",
      change: "replace",
      changeNote: "In your when I start as a clone script, take out change y by -5 and put this block in the same place, inside the repeat until loop.",
      scaffold: "full",
      stretch: true,
      shots: ["cat-operators"],
      blocks: "change y by ((0) - (speed))",
      tip: "Put the <b>minus</b> block in the slot first. Type 0 in its left side. Then drag the <b>speed</b> reporter into its right side."
    },
    {
      title: "Playtest and share",
      short: "Play a full round, change your numbers, then save and share.",
      text: "Play a full 30 second round. Is the start fun? Is the end exciting? Try changing the wait in the factory (1 second) or the timer (30). Then save and share.",
      tip: "Too many clones at once? Make the factory wait longer, like 1.5 seconds."
    }
  ],
  quiz: [
    {
      q: "You click the green flag. How many sprites on the Stage say hi?",
      blocks: "when green flag clicked\nhide\nrepeat (3)\ncreate clone of (myself v)\nend\n\nwhen I start as a clone\nshow\nsay [hi]",
      choices: ["0", "1", "3", "4"],
      answer: 2,
      explain: "Three clones are made, and each one runs its own script. The parent stays hidden and never says hi."
    },
    {
      q: "Mia's game freezes after a few seconds. What is the bug?",
      blocks: "when I start as a clone\nshow\nforever\ncreate clone of (myself v)\nchange y by (-5)\nend",
      choices: ["The clone should say hello first", "Every clone makes more clones, so there are soon too many", "The show block should be hide", "Clones cannot move"],
      answer: 1,
      explain: "Create clone belongs in the parent's script. Here each clone makes copies forever, until Scratch hits 300."
    }
  ],
  challenge: {
    title: "Golden bonus",
    short: "Make one clone out of ten golden and worth five points.",
    text: "Paint a second gold costume for the Faller and name it <b>gold</b>. Name the first costume <b>normal</b>. When a clone starts, it picks a random number from 1 to 10. If it is 10, the clone wears the gold costume and is worth 5 points. If not, it wears the normal costume and is worth 1. Hint: each clone needs its OWN worth, so make a variable called <code>worth</code> with <b>For this sprite only</b>. Then each clone gets its own copy. Use <b>change score by worth</b> when it is caught.",
    answer: "when I start as a clone\nif <(pick random (1) to (10)) = [10]> then\nswitch costume to (gold v)\nset [worth v] to (5)\nelse\nswitch costume to (normal v)\nset [worth v] to (1)\nend\ngo to x: (pick random (-220) to (220)) y: (170)\nshow\nrepeat until <(y position) < [-170]>\nchange y by (-5)\nif <touching (Player v)?> then\nchange [score v] by (worth)\ndelete this clone\nend\nend\ndelete this clone"
  },
  checklist: [
    "The parent Faller hides and makes a new clone every second",
    "Clones fall from random spots and delete themselves when done",
    "A time variable counts down from 30",
    "A Game Over backdrop shows when time runs out, and the game stops",
    "The score still works with clones"
  ],
  submit: "Save and share your finished game, then paste the link. Name your project anything you like (idea: \"Rain of Donuts\" or \"Meteor Dodge\").",
  teacherNotes: "PACING: step 1 about 3 min, steps 2-3 (clones) about 15 min, steps 4-5 (timer and Game Over) about 12 min, playtest 5 min, quiz 5 min. Steps 6-7 (difficulty) are stretch. Clones are the key idea; give them the most time. MISCONCEPTIONS: (1) Clone movement code left under the green flag: the parent then falls too and is visible. The parent should only hide and make clones. (2) Parent not hidden: a frozen object sits at the top. (3) Forgetting show: clones copy the hidden parent, so nothing appears. (4) create clone inside when I start as a clone: clones multiply until Scratch hits 300 and the project lags. (5) Missing delete this clone: clones pile up at the bottom. (6) Variable scope: time and speed live on the Stage, so they are For all sprites; score is For all sprites too. If a student made score For this sprite only on the Faller, each clone gets its own copy and the score monitor will not add up. Fix by deleting it and making it again For all sprites. (7) Wrong backdrop shows: check the backdrop names Play and Game Over match the dropdowns exactly. STARTER: a student who missed g1 can Remix the teacher's starter (catch version with score) and begin at step 1. ACCOMMODATIONS: Core only mode hides steps 6-7. For the goal step (5), a support option is to give the three block names on a sticky note. For students who need more support, steps 2 and 3 can be done together with the teacher using the class screen. ELL: act out parent and clone with a rubber stamp or by copying a drawing. Fast finishers: stretch steps, then the Golden bonus challenge (it uses For this sprite only on purpose, a great scope example)."
};
