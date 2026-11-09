SQ_LESSONS.g1 = {
  title: "Score Keeper",
  tagline: "Every great game needs a score. Time to build yours.",
  mission: "Build a game where things fall and your score changes.",
  minutes: "45",
  skill: "Random Numbers & Scoring",
  goal: "By the end of this quest you will use pick random to drop objects from new spots, and use a score variable to build a catch or dodge game.",
  vocab: [
    { term: "Random", def: "A number the computer picks by chance, so it is different each time.", icon: "🎲" },
    { term: "pick random", def: "A green Operators block that gives a random number between two numbers.", icon: "🔢" },
    { term: "Score", def: "A variable that counts points. It goes up or down during the game.", icon: "🏆" },
    { term: "Mechanic", def: "The main action a player does in a game, like catch, dodge, or jump.", icon: "🕹️" }
  ],
  warmup: "Think of a game where things fall or fly at you. Do you catch them or dodge them? What makes your score go up? What makes it go down? Tell a neighbor, or write two sentences.",
  needs: [],
  project: { name: "Catch Game", part: "Part 1 of 2" },
  steps: [
    {
      title: "Set up your game",
      short: "Start a new project. Add a Player sprite and a Faller sprite.",
      text: "Start a new project. Delete the cat: right-click it in the sprite list and choose <b>delete</b>. Add a sprite for the player at the bottom (a Bowl, a person, or paint one). Add a sprite that will fall from the sky (Apple, Star, Rock, Donut...). Pick a backdrop.<br><br><b>Rename</b> your sprites in the box above the sprite list: call the bottom one <b>Player</b> and the falling one <b>Faller</b>. The code in this quest uses those names.",
      shots: ["delete-sprite", "choose-sprite"],
      tip: "Renaming matters. A <b>touching</b> block looks for the exact sprite name. If your sprite is still called Bowl, pick Bowl in the dropdown instead."
    },
    {
      title: "Move the Player",
      short: "Make the Player slide left and right with the arrow keys.",
      text: "The Player stays at the bottom of the Stage. Each time the forever loop runs, it checks the arrow keys and moves a little. You learned <b>key pressed?</b> in t4.",
      where: "Player",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\ngo to x: (0) y: (-150)\nforever\nif <key (right arrow v) pressed?> then\nchange x by (8)\nend\nif <key (left arrow v) pressed?> then\nchange x by (-8)\nend\nend",
      tip: "Keys do nothing? Click on the Stage first, so Scratch knows you are playing and not typing."
    },
    {
      title: "Drop from a random spot",
      short: "Make the Faller start at a random spot at the top and fall down.",
      text: "New block! <b>pick random (1) to (10)</b> is in <b>Operators</b> (green). It gives a different number each time it runs. We use it for x, so the Faller starts at a new spot across the top each time. The Stage goes from x = -240 on the left to x = 240 on the right, so -220 to 220 keeps it on screen.<br><br>When the Faller gets near the bottom (y less than -170), it jumps back to the top at a new random spot.",
      where: "Faller",
      change: "new",
      scaffold: "full",
      shots: ["cat-operators"],
      blocks: "when green flag clicked\ngo to x: (pick random (-220) to (220)) y: (170)\nforever\nchange y by (-5)\nif <(y position) < [-170]> then\ngo to x: (pick random (-220) to (220)) y: (170)\nend\nend",
      tip: "Drag the <b>pick random</b> block right into the white x slot of <b>go to x: y:</b>. Drop it when the slot glows white."
    },
    {
      title: "Make the score",
      short: "Make a score variable and set it to zero when the game starts.",
      text: "You made variables in t5. Click <b>Make a Variable</b> in <b>Variables</b> (orange). Name it <code>score</code> and choose <b>For all sprites</b>. Then add <b>set score to 0</b> to the top of your Faller script, right under the hat block.",
      where: "Faller",
      change: "add",
      changeNote: "Add set score to 0 at the very top of your Faller green flag script, right under the hat. Do not make a new script.",
      scaffold: "full",
      shots: ["make-variable"],
      blocks: "when green flag clicked\nset [score v] to (0)\ngo to x: (pick random (-220) to (220)) y: (170)\nforever\nchange y by (-5)\nif <(y position) < [-170]> then\ngo to x: (pick random (-220) to (220)) y: (170)\nend\nend",
      tip: "Use <b>set</b>, not <b>change</b>, to reset. Set makes it exactly 0. Change would add to the old score from last game."
    },
    {
      title: "Catch it or dodge it",
      short: "Pick your game type. Then add the touching check to the Faller.",
      text: "Choose the kind of game you want. <b>Catching</b>: the Player tries to touch the Faller to earn points. <b>Dodging</b>: the Player tries to stay away from it, and getting hit costs points. Either way, the Faller checks if it is touching the Player. Put the blocks together in the right order.",
      where: "Faller",
      change: "add",
      changeNote: "Add this if block inside the forever loop of your Faller script, right under change y by -5. Keep the bottom check that is already there.",
      scaffold: "parsons",
      options: [
        {
          label: "Falling (catch it)",
          short: "Touching the Player gives one point, then the Faller goes back to the top.",
          blocks: "if <touching (Player v)?> then\nchange [score v] by (1)\nstart sound (pop v)\ngo to x: (pick random (-220) to (220)) y: (170)\nend"
        },
        {
          label: "Dodging (avoid it)",
          short: "Touching the Player takes away three points, then the Faller goes back up.",
          blocks: "if <touching (Player v)?> then\nchange [score v] by (-3)\nstart sound (pop v)\ngo to x: (pick random (-220) to (220)) y: (170)\nend"
        }
      ],
      tip: "This if goes INSIDE the forever loop of the script you already have. Do not start a second green flag script for the Faller. Two scripts would move it down twice as fast. No pop sound? Pick any sound your sprite has."
    },
    {
      title: "Reaching the bottom",
      short: "Change the bottom check so the score changes when the Faller lands.",
      text: "Right now, when the Faller reaches the bottom it just goes back to the top. Make it count!<br><b>If you chose Catching:</b> a miss takes away 1 point.<br><b>If you chose Dodging:</b> every object that lands without hitting you gives 1 point.<br><br>You only need one block from <b>Variables</b>. Think about where it goes: inside the if that checks <b>y position</b>, before the Faller jumps back to the top.",
      where: "Faller",
      change: "add",
      changeNote: "Add one block inside the if y position less than -170 block of your Faller script, above the go to block.",
      scaffold: "goal",
      options: [
        {
          label: "Falling (catch it)",
          short: "A miss takes away one point.",
          blocks: "if <(y position) < [-170]> then\nchange [score v] by (-1)\ngo to x: (pick random (-220) to (220)) y: (170)\nend"
        },
        {
          label: "Dodging (avoid it)",
          short: "A safe landing gives one point.",
          blocks: "if <(y position) < [-170]> then\nchange [score v] by (1)\ngo to x: (pick random (-220) to (220)) y: (170)\nend"
        }
      ],
      tip: "Score not changing? Check that the block is inside the if, not under the forever loop."
    },
    {
      title: "Two at once",
      short: "Duplicate the Faller so two objects fall at the same time.",
      text: "Right-click the Faller in the sprite list and choose <b>duplicate</b>. The copy, Faller2, gets all the same code. Now two objects fall at once! Change the copy's <b>change y by</b> number so it falls at a different speed.",
      stretch: true,
      tip: "Both copies have <b>set score to 0</b>. That is OK, because both run at the green flag and both set 0."
    },
    {
      title: "Playtest and save",
      short: "Play three rounds, change the fall speed, then save and share.",
      text: "Play three rounds. Is it too easy or too hard? Change <b>-5</b> in the Faller script: -3 is slower, -8 is faster. Change <b>8</b> in the Player script to make the Player faster or slower. Then save and share.",
      tip: "Change one number at a time, then test. That way you know which change made the difference."
    }
  ],
  quiz: [
    {
      q: "What will the score show after you click the green flag?",
      blocks: "when green flag clicked\nset [score v] to (5)\nchange [score v] by (2)\nset [score v] to (0)\nchange [score v] by (1)",
      choices: ["8", "7", "1", "0"],
      answer: 2,
      explain: "Set to 0 throws away the 7. Then change by 1 makes it 1."
    },
    {
      q: "This block runs many times. Which number can it NEVER pick?",
      blocks: "go to x: (pick random (-220) to (220)) y: (170)",
      choices: ["0", "-200", "220", "250"],
      answer: 3,
      explain: "pick random only gives numbers from -220 to 220. 250 is too big."
    }
  ],
  challenge: {
    title: "The opposite object",
    short: "Add a second falling object that does the opposite of your first one.",
    text: "Add a new sprite that also falls from a random spot. Give it a very different look so players can tell them apart.<br><b>Catching game:</b> it is a bad object. Touching it takes away 2 points.<br><b>Dodging game:</b> it is a bonus object. Touching it gives 5 points.<br>When it reaches the bottom, it just goes back to the top with no points. Make it fall at a different speed than the first one.",
    answer: "when green flag clicked\ngo to x: (pick random (-220) to (220)) y: (170)\nforever\nchange y by (-7)\nif <touching (Player v)?> then\nchange [score v] by (-2)\ngo to x: (pick random (-220) to (220)) y: (170)\nend\nif <(y position) < [-170]> then\ngo to x: (pick random (-220) to (220)) y: (170)\nend\nend"
  },
  checklist: [
    "A Player that moves left and right with the arrow keys",
    "A Faller that drops from a random spot at the top",
    "A score that starts at 0 when I click the green flag",
    "The score changes when the Faller touches the Player",
    "The score changes when the Faller reaches the bottom"
  ],
  submit: "Save and share your game, then paste the link. Name your project anything you like (idea: \"Fruit Catch\" or \"Rock Dodge\"). You will keep building this same project in the next quest, so remember its name!",
  teacherNotes: "PACING: steps 1-3 about 15 min, steps 4-6 about 15 min, playtest 5 min, quiz 5 min. Step 7 is stretch. Variables come from t5, so step 4 should be quick; do not reteach. MISCONCEPTIONS: (1) The biggest bug is a second green flag script on the Faller instead of adding into the first one. The Faller then moves twice as fast or jumps around. Check the Faller has only ONE green flag script. (2) The touching dropdown must name the Player sprite; if students did not rename, they pick the old name. (3) Students use change instead of set to reset the score. (4) pick random goes in the x slot, not the y slot. (5) Dodging students sometimes add points when touching; ask them to say the rule out loud. g2 builds on both versions (catch or dodge). ACCOMMODATIONS: For students who need less reading, turn on Core only and read aloud; steps 2-4 can be built side by side with the teacher. For the goal step (6), a support option is to say: you need ONE change score block, and it goes inside the bottom if. Let students who struggle with fine motor dragging use a bigger zoom (the plus button in the code area). ELL: point to the block colors (Operators = green, Variables = orange) along with the words. Fast finishers: stretch step 7, then the challenge."
};
