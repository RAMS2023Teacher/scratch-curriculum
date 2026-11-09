SQ_LESSONS.t4 = {
  title: "If This, Then That",
  tagline: "Teach your sprite to make decisions in a maze.",
  mission: "Build a maze game with walls and a goal.",
  minutes: "45",
  skill: "Conditionals & Sensing",
  goal: "By the end of this quest you will use if-then blocks with sensing conditions, move a sprite smoothly with key pressed checks in a forever loop, react to wall colors and goal sprites, and stop the game with stop all.",
  vocab: [
    { term: "Condition", def: "A true or false question. In Scratch these are the pointy blocks.", icon: "❓" },
    { term: "if then", def: "A block that runs the code inside only when the condition is true.", icon: "🚦" },
    { term: "Sensing", def: "Blocks that check things, like a key press or touching something.", icon: "👀" },
    { term: "Eyedropper", def: "A tool that copies a color by clicking on it.", icon: "💧" }
  ],
  warmup: "Finish these sentences: \"IF the bell rings, THEN ...\" and \"IF it is raining, THEN ...\". Write three of your own. You can say them to a neighbor or write them down. You use conditions all day!",
  needs: [],
  steps: [
    {
      title: "Paint the maze",
      short: "Paint a maze backdrop with thick walls all in one color.",
      text: "Start a new project and give it a name. Click the <b>Stage</b> (bottom right), then the <b>Backdrops</b> tab. You are in the same paint editor you used for your sprite last time.<br>Use the <b>Rectangle</b> tool with a fill color to draw thick walls. Use ONE color for all walls, like dark blue. Leave a wide path from a start corner to an end corner.",
      tip: "Make walls thick, at least as wide as your finger on the screen. Thin walls can be skipped by a fast sprite. Hard to draw? Choose a backdrop from the library and use one color in it as the walls, or ask your teacher for a ready-made maze.",
      shots: ["select-stage", "backdrops"]
    },
    {
      title: "Add a player",
      short: "Add a small player sprite and make it fit on the path.",
      text: "Click <b>Choose a Sprite</b> and pick a small player, like the Ball or the Beetle. You can also use the sprite you painted last lesson. Make it smaller: under the Stage, change <b>Size</b> to about 30. It must fit on the path with room to spare.",
      tip: "Use the wall color ONLY for walls. If your path, your goal, or another sprite uses that color, touching it will count as touching a wall.",
      shots: ["choose-sprite"]
    },
    {
      title: "Smooth arrow keys",
      short: "Use a forever loop with if blocks to move with the arrow keys.",
      text: "In t2 you used \"when key pressed\" hats. They are a little jumpy. This way is smoother: a forever loop that keeps checking each key. Find <code>key space pressed?</code> in the light blue <b>Sensing</b> category and drop it in the hole of an <code>if then</code> block.<br>Change the go to numbers to your maze's start spot.",
      where: "Player",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\ngo to x: (-200) y: (-150)\nforever\nif <key (right arrow v) pressed?> then\nchange x by (3)\nend\nif <key (left arrow v) pressed?> then\nchange x by (-3)\nend\nif <key (up arrow v) pressed?> then\nchange y by (3)\nend\nif <key (down arrow v) pressed?> then\nchange y by (-3)\nend\nend",
      tip: "All four if blocks go INSIDE the forever, so the sprite checks the keys again and again. Click the Stage first so the keys work."
    },
    {
      title: "Walls send you back",
      short: "Use touching color so walls send your player back to start.",
      text: "Add a new script to the player. Use the <code>touching color</code> block from Sensing. To set the color: click the color square in the block, click the <b>eyedropper</b> at the bottom, then click a wall on the Stage.",
      where: "Player",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nforever\nif <touching color [#1e3a8a]?> then\ngo to x: (-200) y: (-150)\nsay [Ouch! Back to start!] for (1) seconds\nend\nend",
      tip: "Click the MIDDLE of a thick wall with the eyedropper. The edges of shapes have soft, mixed colors, and those will not match.",
      shots: ["touching-color"]
    },
    {
      title: "Add a goal",
      short: "Add a goal sprite, then build the winning script in order.",
      text: "Add a second sprite as the goal, like the Star. Drag it to the end of the maze. Then click the <b>player</b> and put these blocks in order. <code>stop all</code> is in Control. It ends the whole game.",
      where: "Player",
      change: "new",
      scaffold: "parsons",
      blocks: "when green flag clicked\nforever\nif <touching (Star v)?> then\nsay [I made it!] for (2) seconds\nstop [all v]\nend\nend",
      tip: "Check that this script is on the player, not the Star. In the touching block, pick the goal's name from the dropdown.",
      shots: ["choose-sprite"]
    },
    {
      title: "Danger zone",
      short: "Add spots of a new color that send the player back with a message.",
      text: "Build this one with no picture. Go back to your backdrop and paint a few spots of a NEW color, like red lava or green slime. When the player touches that color, it should:<br>1. Say a different message, like \"Too hot!\".<br>2. Go back to the start.<br>You already know every block you need: look at your wall script for ideas.",
      where: "Player",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\nforever\nif <touching color [#ff0000]?> then\nsay [Too hot!] for (1) seconds\ngo to x: (-200) y: (-150)\nend\nend",
      tip: "The danger color must be different from the wall color, and must not be on the player or the goal."
    },
    {
      title: "Playtest",
      short: "Let someone play your maze, then fix one thing.",
      text: "Ask a neighbor to play your maze while you watch. Do not help them! Notice: Is it too easy or too hard? Can the player get through a wall? Is the start spot right? Then fix ONE thing.",
      solo: "Play your maze three times as if you have never seen it. Try to break it: push into every wall and corner. Write one thing that went wrong, then fix it. You can also ask your teacher to play.",
      frame: "When I played, I noticed ____.\nOne thing that was hard was ____.\nI fixed it by ____."
    },
    {
      title: "Save and share",
      short: "Save your maze and click Share.",
      text: "Click <b>File</b>, then <b>Save now</b>. Click <b>Share</b> and copy the link."
    }
  ],
  quiz: [
    {
      q: "You click the green flag. Three seconds later, you press space. What happens?",
      blocks: "when green flag clicked\nif <key (space v) pressed?> then\nsay [Jump!]\nend",
      choices: ["The sprite says Jump!", "Nothing happens", "The sprite says Jump! forever", "The project stops"],
      answer: 1,
      explain: "There is no forever loop, so the key is checked only once, at the start. Nobody was pressing space then."
    },
    {
      q: "Your fast player sometimes goes right through a wall. What is the best fix?",
      choices: ["Make the walls thicker", "Delete the forever loop", "Use a different wall color for each wall", "Add more say blocks"],
      answer: 0,
      explain: "A sprite can jump over a thin wall between checks. Thick walls are always caught."
    }
  ],
  challenge: {
    title: "Moving enemy",
    short: "Add an enemy that glides back and forth and sends you home.",
    text: "Add an enemy sprite that glides back and forth across the path forever. If the player touches the enemy, the player goes back to the start. Think: which sprite needs which script? You will need one script on the enemy and one on the player.",
    answer: "when green flag clicked\nforever\nglide (2) secs to x: (100) y: (0)\nglide (2) secs to x: (-100) y: (0)\nend\n\nwhen green flag clicked\nforever\nif <touching (Enemy v)?> then\ngo to x: (-200) y: (-150)\nend\nend"
  },
  checklist: [
    "My player moves with the arrow keys using if blocks in a forever loop.",
    "My walls send the player back to the start.",
    "My player wins and the game stops at the goal.",
    "My maze has a danger zone or another change after playtesting."
  ],
  submit: "Share your maze and paste the link. Name your project anything you like (idea: Maze Runner).",
  teacherNotes: "PACING (45 min): warmup 3 min, paint the maze 10 min (timer! keep it simple), add player 3 min, smooth arrow keys 7 min, walls 6 min, goal 5 min, danger zone (goal step) 5 min, playtest 4 min, save/share 2 min. If/else is NOT in this lesson anymore; it is taught in t5.\nMISCONCEPTIONS: (1) if blocks placed outside the forever loop, so they check only once (quiz 1 targets this). (2) Thinking the hexagon condition block is a command; it must sit inside an if. (3) Eyedropper picked an anti-aliased edge pixel, so the color never matches - click the middle of a thick wall. (4) Wall color used elsewhere (goal, path, other sprites) so they act as walls. Note: touching color ignores the sprite's own costume, but a player in the wall color is hard to see. (5) Fast players skip thin walls. (6) Scripts on the goal sprite instead of the player.\nACCOMMODATIONS: Drawing a maze is the biggest barrier for students with fine-motor needs or limited time: have a teacher-made maze project ready to remix, or let them pick a library backdrop and use one of its colors as walls. Students who find the long arrow-key script tiring can build one if block, then right-click > duplicate it three times and change the key and numbers. Students with anxiety about others playing their game can use the solo playtest. English learners: model the sentence 'IF I touch the wall, THEN I go back' while pointing to the blocks."
};
