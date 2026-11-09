SQ_LESSONS.f2 = {
  title: "Capstone Build",
  tagline: "Your biggest quest yet: plan and build a project that is all yours.",
  mission: "Break a big idea into small features, then build them one at a time.",
  minutes: "45",
  skill: "Decomposition, Planning & Building",
  goal: "By the end of this quest you will break a project idea into features, match each feature to the blocks it needs, plan a small first version (MVP) with 3 must-have features, and build and test it one feature at a time.",
  vocab: [
    { term: "Decompose", def: "Break a big problem into small parts you can build one by one.", icon: "🧩" },
    { term: "Feature", def: "One thing your project can do, like jump or keep score.", icon: "⭐" },
    { term: "MVP", def: "The smallest version that works. Build this first, add extras later.", icon: "🛠️" },
    { term: "Capstone", def: "A final project that shows what you learned.", icon: "🏆" },
    { term: "Build loop", def: "Build one feature, test it, check it off, then start the next.", icon: "🔄" }
  ],
  warmup: "Look back at your projects. Which 3 skills were your favorite (for example loops, variables, broadcast, custom blocks, Pen)? Which one do you want to use in a new way? Write them down or tell a neighbor.",
  needs: [],
  starter: {
    name: "Capstone Skeleton",
    contains: "For option C or absent students. The teacher's skeleton has: a Player sprite with a green flag script that goes to a start spot and moves with the arrow keys; an empty Title sprite with the safe title script from Playtest & Polish (show, wait until space is pressed, hide); a score variable and a time variable (For all sprites) set to 0 on the green flag; two backdrops named level 1 and level 2; and empty \"when I receive game over\" and \"when I receive next level\" scripts on the Stage. It uses only trunk skills, so it works for every path."
  },
  steps: [
    {
      title: "Break down a game together",
      short: "Break a flying game into features and the blocks each one needs.",
      text: "Before you plan your own project, we practice on one together. Imagine a game called <b>Flappy Bat</b>:<br><i>A bat is in the middle of the Stage. It falls down all the time. When you press space, it flaps up. Walls with a gap slide in from the right. If the bat flies through a gap, you get 1 point. If the bat touches a wall or the ground, the game ends.</i><br>Big problems are hard. Small parts are easy. Split the game into <b>features</b>. For each feature, ask: <b>What does the player see?</b> and <b>Which blocks or skills does it need?</b> The first two rows are done for you. Fill in the rest with your teacher or by yourself.",
      tip: "One feature = one small job. If a row needs more than about 6 blocks, split it into two rows.",
      frame: "Feature | What the player sees | Blocks or skills it needs\n1. Bat falls | The bat drops down slowly | forever, change y by -3 (Motion, Control)\n2. Flap | Press space, the bat jumps up | when space key pressed, change y by 40\n3. Walls move | ... | ...\n4. Score | ... | ...\n5. Game over | ... | ..."
    },
    {
      title: "Choose your path",
      short: "Pick one path: level up, mash up, or start fresh.",
      text: "Pick ONE option:<br><b>A. Level up</b>: open one of your branch projects and add a big new feature or mode (a new level, a timer, a hard mode, a new ending).<br><b>B. Mash-up</b>: combine two kinds of projects (a story with a mini game inside, a quiz that unlocks a platformer level, a drawing app with a score).<br><b>C. Start fresh</b>: open the teacher's <b>Capstone Skeleton</b>. It already has a Player that moves with the arrow keys, a Title sprite, score and time variables, two level backdrops, and empty game over and next level messages. You add your own idea on top.",
      tip: "For A or B, use File then Save as a copy first, so your old project stays safe."
    },
    {
      title: "Break down your idea",
      short: "Break your own idea into features, just like Flappy Bat.",
      text: "Now do the same thing for <b>your</b> project. Write one sentence about it. Then list 4 to 6 features. For each one, write what the user sees and which blocks or skills it needs. Use only skills you know. If you are not sure how to build a feature, write a question mark. You will ask about it in the size check.",
      tip: "A story or app has features too: \"Scene 2 starts when the cat finishes talking\" (broadcast) or \"Button shows the next card\" (when this sprite clicked, change a variable).",
      frame: "My idea in one sentence: A ... where ...\n\nFeature | What the user sees | Blocks or skills it needs\n1. ... | ... | ...\n2. ... | ... | ...\n3. ... | ... | ...\n4. ... | ... | ...\n5. (extra) ... | ... | ..."
    },
    {
      title: "Plan your MVP",
      short: "Choose your three must have features. Everything else is an extra.",
      text: "Look at your feature table. Circle the <b>3 must-have features</b>: without them, the project does not work. That is your <b>MVP</b>. Put the rest on the Extras list. You build extras only after all 3 must-haves work.",
      tip: "Good MVP features are small: \"Player moves\", \"Score goes up\", \"Game ends\". \"10 levels with a boss\" is an extra.",
      frame: "Title: ...\nPitch: A ... where ...\nPath: A (level up) / B (mash-up) / C (start fresh)\nSprites I need: ...\n\nMust-have 1: ...\nMust-have 2: ...\nMust-have 3: ...\n\nExtras (only if I have time):\n- ...\n- ..."
    },
    {
      title: "Size check",
      short: "Check that each must have feature fits in about ten minutes.",
      text: "Show your plan to your teacher. Together, check: Can you build each must-have in about 10 minutes? Do you know which blocks each one needs? If a feature is too big, split it or move it to Extras.",
      tip: "Making your plan smaller is smart, not giving up. A small project that works is better than a big one that does not.",
      solo: "If your teacher is busy, check it yourself. For each must-have, answer: Do I know at least 2 blocks it needs? Is it 8 blocks or fewer? If you answer no, make it smaller or move it to Extras. Then show your teacher later."
    },
    {
      title: "Build loop: feature 1",
      short: "Build must have one, test it from the green flag, then check it off.",
      text: "Work in a <b>build loop</b>: <b>build</b> one feature, <b>test</b> it from the green flag, <b>check it off</b> on your plan. Then start the next one. Build must-have 1 now, using the blocks you listed in your table. Many projects need a <b>score</b> or a <b>timer</b>. If yours does and you get stuck, open \"Stuck? Show me\" for an example.",
      where: "The sprite or Stage named in your plan for this feature",
      change: "new",
      scaffold: "goal",
      options: [
        {
          label: "Score",
          short: "The score starts at zero and goes up when the player touches the goal.",
          blocks: "when green flag clicked\nset [score v] to (0)\nshow variable [score v]\nforever\nif <touching (Goal v)?> then\nchange [score v] by (1)\nwait (0.5) seconds\nend\nend"
        },
        {
          label: "Timer",
          short: "The time counts down from thirty, then the game over message is sent.",
          blocks: "when green flag clicked\nset [time v] to (30)\nshow variable [time v]\nrepeat (30)\nwait (1) seconds\nchange [time v] by (-1)\nend\nbroadcast (game over v)"
        }
      ],
      tip: "Make the variable first with Make a Variable (For all sprites). Reuse scripts from old projects: drag them into the Backpack at the bottom of the screen, then drag them out here.",
      shots: ["make-variable"]
    },
    {
      title: "Build loop: features 2 and 3",
      short: "Build your next two must haves. Test and check off each one.",
      text: "Keep looping: build must-have 2, test, check it off. Then must-have 3, test, check it off. Many projects need a <b>title screen</b> or a <b>level or scene switch</b>. If yours does and you get stuck, open \"Stuck? Show me\". For the level switch, also add a block in your Player script that sends the next level message when the player touches the door.",
      where: "The sprite or Stage named in your plan for this feature",
      change: "new",
      scaffold: "goal",
      options: [
        {
          label: "Title screen",
          short: "A Title sprite shows at the start and hides when space is pressed.",
          blocks: "when green flag clicked\ngo to x: (0) y: (0)\ngo to [front v] layer\nshow\nwait until <key (space v) pressed?>\nhide"
        },
        {
          label: "Level or scene switch",
          short: "The Stage starts on level one and goes to the next backdrop on a message.",
          blocks: "when green flag clicked\nset [level v] to (1)\nswitch backdrop to (level 1 v)\n\nwhen I receive [next level v]\nchange [level v] by (1)\nnext backdrop"
        }
      ],
      tip: "Stuck for more than 5 minutes? Write your question on your plan, move on to a different feature, and ask your teacher. Do not stay stuck."
    },
    {
      title: "Checkpoint and share",
      short: "Play from the green flag, update your plan, then save and share.",
      text: "Click the green flag and play your whole project. Is every must-have checked off? Does it reset every time? If your MVP works, pick one feature from your Extras list and do one more build loop. Then save and share. In <b>Notes and Credits</b>, write which features are done and which you will finish next time.",
      tip: "If something broke, use your Bug Hunter skills: read the script slowly and click one block at a time to see what it does.",
      frame: "Done: ...\nNot done yet: ...\nNext time I will ..."
    }
  ],
  quiz: [
    {
      q: "You click the green flag. What is the value of time after 3 seconds?",
      blocks: "when green flag clicked\nset [time v] to (30)\nrepeat (30)\nwait (1) seconds\nchange [time v] by (-1)\nend\nbroadcast (game over v)",
      choices: ["27", "3", "30", "33"],
      answer: 0,
      explain: "Time starts at 30. Each second it goes down by 1. After 3 seconds it is 27."
    },
    {
      q: "Which is the best way to break down \"a quiz game with a timer\"?",
      choices: [
        "Build it all at once and test at the end",
        "Start with the coolest sound effect",
        "Make a bigger plan with 10 levels",
        "Ask a question, check the answer, keep score, count down the time"
      ],
      answer: 3,
      explain: "Small features with clear jobs are easy to build and test one at a time."
    }
  ],
  challenge: {
    title: "One reset block",
    short: "Make a custom block that resets your whole game, and use it.",
    text: "Make a custom block named <b>reset game</b> on your main sprite. It should set the score to 0, set the time to 30, and move the sprite to its start spot. Then use it as the first block in your green flag script, instead of the separate reset blocks.",
    answer: "define reset game\nset [score v] to (0)\nset [time v] to (30)\ngo to x: (-200) y: (0)\n\nwhen green flag clicked\nreset game"
  },
  checklist: [
    "My project has a feature table that matches features to blocks.",
    "My project has a plan with 3 must-have features.",
    "My project has at least one must-have feature that works and is checked off.",
    "My project resets when I click the green flag."
  ],
  submit: "Save and share your capstone and paste the link. In Notes and Credits, type your one-sentence pitch and your done and not done list. Name your project anything you like (idea: \"Capstone\" plus your title).",
  teacherNotes: "PACING: warm-up 3 min, Flappy Bat breakdown 7 (do it together on the board as a \"we do\"; students fill rows 3 to 5), choose path 3, own breakdown 6, MVP plan 4, size check 3, build loops 17, checkpoint 2. If you can, give a second build session before Showcase Day.\nWORKED ANSWER for Flappy Bat rows: 3. Walls move: walls start at the right and glide or move left (go to x, change x in a forever loop; clones if they know them). 4. Score: score goes up when the wall passes the bat (variable, change score by 1). 5. Game over: touching wall or ground stops the game (if touching, broadcast game over or stop all).\nSCOPE: approve plans fast and push students to shrink them. Students who finish early do Extras, not a new project. The build loop step options only show common features; students build the feature in their own plan.\nALL PATHS: the plan uses only trunk skills (variables, broadcast, if, wait until). Students who know clones, lists, ask, or Pen may use them, but nobody needs them.\nMISCONCEPTIONS: (1) Building everything before testing anything. (2) The MVP being the \"cool\" feature instead of the core one. (3) Making a variable \"For this sprite only\" and then using it from the Stage. (4) Copying a Show me script without changing sprite names like Goal or Door to their own sprite names.\nACCOMMODATIONS: feature tables can be drawn, typed, or dictated; students may use 3 features instead of 4 to 6 in the breakdown. Offer path C (the skeleton) to anyone who feels stuck at a blank page. Students with IEP extended time may count only 2 must-haves as their MVP for today."
};
