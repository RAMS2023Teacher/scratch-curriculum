SQ_LESSONS.g3 = {
  title: "Gravity & Jumping",
  tagline: "What goes up must come down. Build a real platformer hero.",
  mission: "Make a hero that falls, lands on platforms, and jumps.",
  minutes: "45",
  skill: "Velocity, Gravity & Platforms",
  goal: "By the end of this quest you will use a y speed variable to make gravity, land on platforms, and jump only when standing on the ground.",
  vocab: [
    { term: "Velocity", def: "How fast something moves, and which way. Here: up and down speed.", icon: "💨" },
    { term: "Gravity", def: "A pull downward. In code, we make y speed a little smaller every time.", icon: "🌍" },
    { term: "Platform", def: "A floor or ledge the player can stand on.", icon: "🧱" },
    { term: "Model", def: "A simple copy of something real. It keeps some parts and leaves others out.", icon: "🧪" }
  ],
  warmup: "Toss a ball or a balled-up paper gently straight up and catch it. Is its speed the same the whole time? When is it slowest? You can do this alone, or watch a neighbor do it and talk about it.",
  needs: ["math"],
  project: { name: "Platformer", part: "Part 1 of 2" },
  steps: [
    {
      title: "Paint the level",
      short: "Paint a backdrop with a ground and platforms, all in one color.",
      text: "Start a new project. Click the <b>Stage</b>, open the <b>Backdrops</b> tab, and paint a backdrop. Use the rectangle tool to draw a ground along the bottom and three or four floating platforms. Make ALL of them the same color, like green. Leave gaps the player can jump across. Name this backdrop <b>level1</b>.",
      shots: ["select-stage", "backdrops"],
      tip: "Use your platform color ONLY for platforms and ground. If the background, coins, or another sprite have that same color, touching it will count as ground. Use the same fill color for every rectangle; do not pick a slightly different green."
    },
    {
      title: "Make the player walk",
      short: "Add a small Player sprite. Make it walk with the arrow keys.",
      text: "Add or paint a small player sprite (about as tall as a platform is thick, times two). Rename it <b>Player</b>. Then give it this script to walk left and right.",
      where: "Player",
      change: "new",
      scaffold: "full",
      shots: ["choose-sprite", "costumes-tab"],
      blocks: "when green flag clicked\ngo to x: (-200) y: (0)\nforever\nif <key (right arrow v) pressed?> then\nchange x by (5)\nend\nif <key (left arrow v) pressed?> then\nchange x by (-5)\nend\nend",
      tip: "Check the costume center: in the Costumes tab, the drawing should sit right on the small crosshair in the middle. If it is off to the side, the Player wobbles and lands in strange places. Use the arrow tool to drag the whole drawing onto the crosshair."
    },
    {
      title: "Add gravity",
      short: "Make a y speed variable. Gravity makes the Player fall faster and faster.",
      text: "Make a variable named <code>y speed</code> and choose <b>For this sprite only</b>. Then build a SECOND green flag script on the Player (keep the walk script). Every time the loop runs, gravity takes 1 away from y speed, and the Player moves by y speed. Click the green flag: the Player falls faster and faster, right through the ground. That is OK for now!",
      where: "Player",
      change: "new",
      scaffold: "full",
      shots: ["make-variable"],
      blocks: "when green flag clicked\nset [y speed v] to (0)\nforever\nchange [y speed v] by (-1)\nchange y by (y speed)\nend",
      tip: "Why <b>For this sprite only</b>? Only the Player uses this speed. If you add an enemy that also falls later, it can have its own y speed with the same name, and the two speeds will not mix up."
    },
    {
      title: "Land on the ground",
      short: "Stop falling when the Player touches the platform color.",
      text: "Now the Player needs to stop when it hits a platform. When it touches the platform color, it moves back by the last step (0 minus y speed), so it stands on top, not inside. Then y speed becomes 0. Put the blocks in order. Use the eyedropper in <b>touching color</b> to click your platform on the Stage.",
      where: "Player",
      change: "replace",
      changeNote: "Replaces your step 3 gravity script (the one with set y speed to 0). Keep the walk script as it is.",
      scaffold: "parsons",
      shots: ["touching-color"],
      blocks: "when green flag clicked\nset [y speed v] to (0)\nforever\nchange [y speed v] by (-1)\nchange y by (y speed)\nif <touching color [#22c55e]?> then\nchange y by ((0) - (y speed))\nset [y speed v] to (0)\nend\nend",
      tip: "Sinking into the ground? You are missing <b>change y by 0 minus y speed</b>. That block undoes the last move, which pulls the Player back out of the platform."
    },
    {
      title: "Jump!",
      short: "Let the Player jump, but only while standing on a platform.",
      text: "A jump is just a big UP speed. Set y speed to 14 and gravity will slow it down and pull the Player back. The check for the up arrow goes INSIDE the touching color if. That way the Player can only jump when it is on a platform, not in the air.",
      where: "Player",
      change: "add",
      changeNote: "Add this if block inside the if touching color block of your gravity script, right after set y speed to 0. It is an if inside an if.",
      scaffold: "parsons",
      blocks: "if <key (up arrow v) pressed?> then\nset [y speed v] to (14)\nend",
      tip: "If the Player can fly by holding the up arrow, the jump if is outside the touching color if. Drag it in, under set y speed to 0."
    },
    {
      title: "Fall off, start again",
      short: "If the Player falls off the bottom, send it back to the start.",
      text: "Build this one yourself. If the Player falls below the bottom of the Stage (y position less than -170), it goes back to the start (x: -200, y: 0) and its y speed becomes 0, so it does not keep its falling speed. Hint: this is an <b>if</b> inside the forever loop of the gravity script. You used <b>y position</b> and <b>less than</b> in the Catch Game or in t5.",
      where: "Player",
      change: "add",
      changeNote: "Add this if block inside the forever loop of your gravity script, at the bottom, after the touching color if.",
      scaffold: "goal",
      blocks: "if <(y position) < [-170]> then\ngo to x: (-200) y: (0)\nset [y speed v] to (0)\nend",
      tip: "Not working? Check that your level has a gap, and that the if is inside the forever loop."
    },
    {
      title: "Tune the physics",
      short: "Try new gravity and jump numbers until the game feels good.",
      text: "Change one number at a time and test. Gravity: try -1 and -2. Jump: try 10, 14, and 18. Walk: try 4 and 7. Can you reach every platform? Is any platform too easy? Move platforms in the paint editor if you need to. Then save and share.",
      tip: "If gravity is very strong, the Player can fall through thin platforms. Make platforms thicker, or use a smaller gravity number."
    },
    {
      title: "Face the way you walk",
      short: "Make the Player turn to face left or right as it walks.",
      text: "Add <b>set rotation style left-right</b> at the top of the walk script. Then add <b>point in direction 90</b> when right is pressed and <b>point in direction -90</b> when left is pressed. Now the Player faces the way it walks, without turning upside down.",
      where: "Player",
      change: "replace",
      changeNote: "Replaces your walk script (the one with the arrow keys).",
      scaffold: "full",
      stretch: true,
      blocks: "when green flag clicked\nset rotation style [left-right v]\ngo to x: (-200) y: (0)\nforever\nif <key (right arrow v) pressed?> then\npoint in direction (90)\nchange x by (5)\nend\nif <key (left arrow v) pressed?> then\npoint in direction (-90)\nchange x by (-5)\nend\nend",
      tip: "Without left-right rotation style, pointing in direction -90 turns the Player upside down."
    }
  ],
  quiz: [
    {
      q: "The Player starts at y: 0. What is its y position after this runs?",
      blocks: "when green flag clicked\ngo to x: (0) y: (0)\nset [y speed v] to (3)\nrepeat (3)\nchange [y speed v] by (-1)\nchange y by (y speed)\nend",
      choices: ["0", "3", "-3", "6"],
      answer: 1,
      explain: "y speed becomes 2, then 1, then 0. The Player moves up 2, then 1, then 0. So y is 3."
    },
    {
      q: "Why is the up arrow check inside the touching color if?",
      choices: ["So jumps go higher", "So the game runs faster", "It does not matter where it goes", "So the Player can only jump while standing on a platform"],
      answer: 3,
      explain: "Outside that if, the Player could keep jumping in the air and fly away."
    }
  ],
  challenge: {
    title: "Bonk your head",
    short: "Make the Player bump its head on the bottom of platforms.",
    text: "Paint a thin strip of a NEW color (like red) under some platforms. If the Player touches red while moving up (y speed more than 0), it should move back out of the red and stop going up, so it bumps its head and falls back down. Do not use your platform color for this strip.",
    answer: "if <touching color [#ef4444]?> then\nif <(y speed) > [0]> then\nchange y by ((0) - (y speed))\nset [y speed v] to (0)\nend\nend"
  },
  checklist: [
    "A level backdrop with a ground and platforms in one color",
    "A Player that walks left and right",
    "Gravity that pulls the Player down and lands it on platforms",
    "The Player can jump only when standing on a platform",
    "Falling off the bottom sends the Player back to the start"
  ],
  submit: "Save and share your game, then paste the link. Name your project anything you like (idea: \"Sky Jumper\"). You will add levels to this same project next quest, so remember its name!",
  teacherNotes: "PACING: steps 1-2 about 12 min (painting can take over; set a timer), steps 3-5 about 15 min, steps 6-7 about 8 min, quiz 5 min. Step 8 is stretch. PATHS: students come from Games, Stories, or Apps, so do not assume they used pick random or clones; this lesson uses neither. Variables, if-else, and comparisons come from t5. MISCONCEPTIONS: (1) Player sinks into the ground: the push-back block is missing. (2) Player stands in the air: the backdrop or another sprite has the platform color somewhere else (touching color ignores the Player's own costume, so the costume color does not matter). (3) Player can fly: the jump if is outside the touching color if. (4) Students put the gravity blocks into the walk script, so one loop does everything; that also works, but it is harder to read. (5) y speed made For all sprites still works, but ask why For this sprite only is better. (6) Walking into the side of a platform can make the Player get stuck; that is OK for now. Level design can avoid tall walls. STANDARDS WRAP-UP (CT.e.1): ask \"Real objects fall because of gravity, but what did our model leave out?\" (air, friction, bouncing, weight). Then ask why it is OK to ignore those things in a game. ACCOMMODATIONS: Core only mode hides step 8. Students with fine motor needs can draw platforms with only the rectangle tool, or use a teacher-made level1 backdrop. For the goal step (6), a support option is to show the blocks needed (if, less than, y position, go to, set) without the order. Read aloud the quiz trace and let students trace with a table of y speed and y."
};
