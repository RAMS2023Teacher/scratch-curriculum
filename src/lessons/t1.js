SQ_LESSONS.t1 = {
  title: "Hello, Sprite!",
  tagline: "Step through the portal and take control of your first sprite.",
  mission: "Make a sprite move, turn, and glide around the Stage.",
  minutes: "40",
  skill: "Sprites, the Stage & Motion",
  goal: "By the end of this quest you will know your way around Scratch, move a sprite with motion blocks, use x and y to place it on the Stage, and save and share your project.",
  vocab: [
    { term: "Sprite", def: "A character or object in your project. Sprites can move, talk, and run code.", icon: "🐱" },
    { term: "Stage", def: "The big rectangle where your project plays.", icon: "🎭" },
    { term: "Block", def: "A puzzle piece of code. You snap blocks together.", icon: "🧩" },
    { term: "Script", def: "A stack of blocks snapped together. They run from top to bottom.", icon: "📜" },
    { term: "x and y", def: "Numbers for a spot on the Stage. x is left-right. y is up-down.", icon: "📍" }
  ],
  warmup: "If you could program any character to do anything, what would it be? Say it in one sentence to a neighbor, or write it down. Then think: what is the very first instruction you would give it?",
  needs: [],
  steps: [
    {
      title: "Open Scratch and sign in",
      short: "Go to the Scratch website, sign in, and click Create.",
      text: "Go to <b>scratch.mit.edu</b> and click <b>Sign in</b>. Use your class account. Then click <b>Create</b> at the top. You now have a new project with one sprite: the cat, called <b>Sprite1</b>.",
      tip: "Always sign in first. If you are not signed in, Scratch cannot save your work to your account. Look for your username in the top right corner."
    },
    {
      title: "Tour the map",
      short: "Find the four parts: blocks, code area, Stage, and sprite list.",
      text: "Find the four main areas:<br><b>1. Block palette</b> (left side): all the blocks, sorted by color.<br><b>2. Code area</b> (middle): where you build scripts.<br><b>3. Stage</b> (top right): where your project plays.<br><b>4. Sprite list</b> (bottom right): all your sprites.<br>Click each color circle on the far left (Motion, Looks, Sound, Events) and watch the palette jump to that color.",
      tip: "Every block color is a category. Blue is Motion, purple is Looks, yellow is Events, orange is Control.",
      shots: ["tour"]
    },
    {
      title: "Your first move",
      short: "Drag a move block into the code area and click it.",
      text: "Click <b>Motion</b>. Drag a <code>move (10) steps</code> block into the code area. <b>Click the block</b>. The sprite moves! Click it again and again. Now change 10 to 50 and click it. Then try a negative number, like -50. Which way does it go now?",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "move (10) steps",
      tip: "Lost your sprite off the edge of the Stage? Drag it back with the mouse, or click a go to x: 0 y: 0 block to bring it to the center."
    },
    {
      title: "Turn and spin",
      short: "Snap a turn block under your move block and click the stack.",
      text: "Drag a <code>turn cw (15) degrees</code> block into the code area. Snap it <b>under</b> your move block. You will feel it click into place. Now the two blocks are one <b>script</b>. Click the script: both blocks run, top to bottom. Change 15 to 90 and click it four times. What shape did the sprite make?",
      where: "Sprite1",
      change: "add",
      changeNote: "Snap the turn block under the move block from the last step.",
      scaffold: "full",
      blocks: "move (50) steps\nturn cw (90) degrees",
      tip: "If only one block runs, the blocks are not snapped together. Drag the bottom block away and drop it again, right under the first block."
    },
    {
      title: "The x and y treasure map",
      short: "Use a go to block to send your sprite to each corner.",
      text: "Drag your sprite around the Stage with the mouse. Watch the <b>x</b> and <b>y</b> numbers under the Stage change.<br>Now use <code>go to x: () y: ()</code> to jump your sprite to a spot. Type the numbers, then click the block.<br>Can you find all four corners? Hint: x is 240 or -240. y is 180 or -180. The center is x: 0, y: 0.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "go to x: (0) y: (0)\ngo to x: (-200) y: (150)",
      tip: "Positive x goes right, negative x goes left. Positive y goes up, negative y goes down. If your sprite is stuck on an edge, click go to x: 0 y: 0 to bring it home.",
      shots: ["xy"]
    },
    {
      title: "Glide like a pro",
      short: "Build a script that glides your sprite to three different spots.",
      text: "<b>go to</b> jumps right away. <b>glide</b> moves smoothly, so you can watch it. Build this script and click it. The first block puts the sprite at its starting spot every time.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "go to x: (-200) y: (0)\nglide (1) secs to x: (0) y: (100)\nglide (1) secs to x: (200) y: (0)\nglide (1) secs to x: (0) y: (-100)",
      tip: "Make the first number bigger to glide slower. Try 3 seconds."
    },
    {
      title: "Corner tour",
      short: "Build your own script that visits all four corners and returns home.",
      text: "Now you build it with no picture. Make one script that:<br>1. Starts the sprite at the center (x: 0, y: 0).<br>2. Glides to all four corners of the Stage, one after another.<br>3. Glides back to the center at the end.<br>Use the <b>go to</b> and <b>glide</b> blocks from Motion. Click your script to test it. Does the sprite end at x: 0, y: 0?",
      where: "Sprite1",
      change: "new",
      scaffold: "goal",
      blocks: "go to x: (0) y: (0)\nglide (1) secs to x: (-200) y: (150)\nglide (1) secs to x: (200) y: (150)\nglide (1) secs to x: (200) y: (-150)\nglide (1) secs to x: (-200) y: (-150)\nglide (1) secs to x: (0) y: (0)",
      tip: "Use numbers a little smaller than the edges, like 200 and 150, so you can still see the sprite in the corner."
    },
    {
      title: "Name it, save it, share it",
      short: "Name your project, save it, and click Share.",
      text: "Click the title box above the code area and type a name for your project. Name it anything you like. Click <b>File</b>, then <b>Save now</b>. Then click the orange <b>Share</b> button. Copy the link from the address bar at the top of your browser. That link is what you turn in.",
      tip: "If the Share button is grey and you cannot click it, your account email may not be confirmed yet. Tell your teacher. Never put your last name or other personal information in a project."
    }
  ],
  quiz: [
    {
      q: "You click this script. Where does the sprite end up?",
      blocks: "go to x: (0) y: (0)\ngo to x: (-150) y: (100)",
      choices: ["Up and to the left", "Down and to the left", "Up and to the right", "Back in the center"],
      answer: 0,
      explain: "The sprite stops at the last spot. Negative x is left. Positive y is up. So the sprite ends up and to the left."
    },
    {
      q: "Blocks are snapped together into a script. What happens when you click it?",
      choices: ["Only the top block runs", "The blocks run in order, top to bottom", "The blocks run bottom to top", "Nothing. You must click each block."],
      answer: 1,
      explain: "A script runs from the top block down to the bottom block, in order."
    }
  ],
  challenge: {
    title: "Walk a square",
    short: "Make your sprite walk a square and end where it started.",
    text: "Make your sprite walk in a square path and stop exactly where it started, facing the same way. Use only <b>move</b> and <b>turn</b> blocks. How many of each do you need? How many degrees is each turn?",
    answer: "move (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees"
  },
  checklist: [
    "My sprite moves and turns with a script.",
    "I used go to x: y: to put my sprite in a spot.",
    "My corner tour script visits four corners and comes back to the center.",
    "My project has a name and is shared."
  ],
  submit: "Share your project and paste the link. Name your project anything you like (idea: My First Sprite).",
  teacherNotes: "PACING (40 min): sign in + tour 8 min, move/turn 7 min, x/y treasure map 8 min, glide 5 min, corner tour (goal step) 7 min, save/share 5 min. Check that every student is signed in during the first 5 minutes; the most common lost-work problem is building while signed out. Share is disabled on accounts whose email is not confirmed (teacher student accounts are normally fine) - have a fallback such as File > Save to your computer or adding students to a class studio.\nMISCONCEPTIONS: (1) x and y mixed up - have students point left/right for x and up/down for y. (2) Thinking blocks that sit near each other are one script; they must be snapped. (3) Thinking go to and glide 'add' to the position; they go to an exact spot. (4) Sprite lost off-Stage - go to x: 0 y: 0 or drag it back.\nACCOMMODATIONS: Students with fine-motor needs may struggle to drop blocks exactly; show that a block snaps when the white shadow appears, and allow a trackpad-to-mouse swap. Students new to coordinates or with math anxiety: give a printed Stage grid with the four corners labeled. English learners: point to the four areas on screen while saying the vocabulary words; the read-aloud and the screenshot help. Students who finish early go to the square challenge."
};
