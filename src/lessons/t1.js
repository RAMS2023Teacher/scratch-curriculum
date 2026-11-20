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
    { term: "Run", def: "To make code go. Click a block or a script to run it. It glows yellow while it runs.", icon: "▶️" },
    { term: "x and y", def: "Numbers for a spot on the Stage. x is left-right. y is up-down.", icon: "📍" }
  ],
  warmup: "If you could program any character to do anything, what would it be? Say it in one sentence to a neighbor, or write it down. Then think: what is the very first instruction you would give it?",
  needs: [],
  steps: [
    {
      title: "Open Scratch and sign in",
      short: "Go to the Scratch website, sign in, and click Create.",
      text: "Tap the orange <b>Open Scratch</b> button at the top of this page (or go to <b>scratch.mit.edu</b>). Click <b>Sign in</b> in the top right corner and type the username and password your teacher gave you. Then click <b>Create</b> at the top. You now have a new project with one sprite: the cat, called <b>Sprite1</b>.",
      tip: "Always sign in first. If you are not signed in, Scratch cannot save your work to your account. Look for your username in the top right corner. Forgot your password, or do not have an account yet? Tap I\u2019m stuck and your teacher will help."
    },
    {
      title: "Tour the map",
      short: "Find the four parts of Scratch. Nothing to build yet: just look around.",
      boost: "Scavenger hunt: which color has the <b>say Hello!</b> block? Which color has <b>play sound</b>? Which has <b>when green flag clicked</b>? Find all three.",
      text: "You do not build anything in this step. Just find the four main areas:<br><b>1. Block palette</b> (left side): all the blocks, sorted by color.<br><b>2. Code area</b> (middle): where you build scripts.<br><b>3. Stage</b> (top right): where your project plays.<br><b>4. Sprite list</b> (bottom right): all your sprites.<br>Click each color circle on the far left (Motion, Looks, Sound, Events) and watch the palette jump to that color.",
      tip: "Every block color is a category. Blue is Motion, purple is Looks, yellow is Events, orange is Control.",
      shots: ["tour"]
    },
    {
      title: "Your first move",
      short: "Drag a move block into the code area. Then click the block to run it.",
      text: "Click <b>Motion</b>. Drag a <code>move (10) steps</code> block into the code area. <b>Click the block</b> to run it. The sprite moves! A block only runs when you click it, and it glows yellow while it runs. Click it again and again.<br><b>To change a number:</b> click the white bubble in the block, type the new number, then click the block again to run it. Change 10 to 50 and click it. Then try a minus number, like -50 (use the minus key). Which way does it go now?",
      boost: "The Stage is 480 steps wide. Put your sprite on the left edge. What ONE number moves it exactly to the right edge in a single click? Guess first, then test.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "move (10) steps",
      tip: "Lost your sprite off the edge of the Stage? Drag it back with the mouse, or click a go to x: 0 y: 0 block to bring it to the center."
    },
    {
      title: "Turn and spin",
      short: "Find the turn block in Motion. Snap it under your move block. Click the stack.",
      text: "<b>1.</b> Stay in <b>Motion</b> (blue). Find the <b>turn</b> block with the curved arrow. It is near the top, under move.<br><b>2.</b> Drag it into the code area and let go right <b>under</b> your move block. It snaps on, like a puzzle piece.<br><b>3.</b> Now the two blocks are one <b>script</b>. Click anywhere on it: both blocks run, top to bottom.<br><b>4.</b> Click the white bubbles and change the numbers to match the picture: 50 steps and 90 degrees. Click the script four times. What shape did the sprite walk?",
      boost: "Spin while moving! Change the numbers to move 10 and turn 15. Click the script again and again, fast. What path does your sprite follow? How many clicks to get all the way around?",
      where: "Sprite1",
      change: "add",
      changeNote: "Snap the turn block under the move block from the last step.",
      scaffold: "full",
      blocks: "move (50) steps\nturn cw (90) degrees",
      tip: "If only one block runs, the blocks are not snapped together. Drag the bottom block away and drop it again, right under the first block."
    },
    {
      title: "The x and y treasure map",
      short: "Type numbers into a go to block. Then click the block to run it.",
      text: "Every spot on the Stage has two numbers. <b>x</b> is how far left or right. <b>y</b> is how far up or down. The center is x: 0, y: 0.<br><b>Minus numbers go left or down.</b> Plain numbers go right or up.<br><b>1.</b> Drag your sprite around the Stage with the mouse. Watch the x and y numbers under the Stage change.<br><b>2.</b> In <b>Motion</b>, find <code>go to x: () y: ()</code> and drag it into the code area.<br><b>3.</b> Click each white bubble and type a number. Then click the block. Your sprite jumps there!<br><b>4.</b> Find all four corners. Hint: x is 240 or -240. y is 180 or -180.",
      boost: "No dragging allowed! Use only go to blocks to put your sprite: in the exact middle of the top edge, then halfway between the center and the bottom left corner. Write down your numbers first, then test.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "go to x: (0) y: (0)\ngo to x: (-200) y: (150)",
      tip: "Positive x goes right, negative x goes left. Positive y goes up, negative y goes down. If your sprite is stuck on an edge, click go to x: 0 y: 0 to bring it home.",
      shots: ["xy"]
    },
    {
      title: "Glide like a pro",
      short: "Build this script. Then click it to watch your sprite glide.",
      text: "<b>go to</b> jumps right away. <b>glide</b> moves smoothly, so you can watch it. Build this script by snapping the four blocks together. Then <b>click anywhere on the stack</b> to run it. The whole stack glows yellow while it runs. Nothing happens until you click it! The first block puts the sprite at its starting spot every time, so you can click the script again and again.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "go to x: (-200) y: (0)\nglide (1) secs to x: (0) y: (100)\nglide (1) secs to x: (200) y: (0)\nglide (1) secs to x: (0) y: (-100)",
      tip: "Make the first number bigger to glide slower. Try 3 seconds. Tired of dragging? Right-click a glide block and choose Duplicate. Then you only change the numbers.",
      boost: "Make your sprite glide a zigzag with five glides, where each glide is faster than the one before. Then make it glide a triangle and stop exactly where it started."
    },
    {
      title: "Corner tour",
      short: "Build your own script that visits all four corners. Click it to run it.",
      text: "Now you build it with no picture. Make one script that:<br>1. Starts the sprite at the center (x: 0, y: 0).<br>2. Glides to all four corners of the Stage, one after another.<br>3. Glides back to the center at the end.<br>Use the <b>go to</b> and <b>glide</b> blocks from Motion. Click your script to test it. Does the sprite end at x: 0, y: 0?",
      where: "Sprite1",
      change: "new",
      scaffold: "goal",
      blocks: "go to x: (0) y: (0)\nglide (1) secs to x: (-200) y: (150)\nglide (1) secs to x: (200) y: (150)\nglide (1) secs to x: (200) y: (-150)\nglide (1) secs to x: (-200) y: (-150)\nglide (1) secs to x: (0) y: (0)",
      tip: "Use numbers a little smaller than the edges, like 200 and 150, so you can still see the sprite in the corner. Right-click a glide block and choose Duplicate to save time: then you only change the numbers.",
      boost: "Speed run: make the whole tour finish in under 3 seconds. Then snap a turn block after each glide, so your sprite spins a little at every corner. Can it end facing the same way it started?"
    },
    {
      title: "Name it, save it, share it",
      short: "Name your project, save it, and click Share.",
      text: "<b>1.</b> Click the title box above the code area and type a name for your project. Name it anything you like.<br><b>2.</b> Click <b>File</b>, then <b>Save now</b>.<br><b>3.</b> Click the orange <b>Share</b> button at the top. You are not sending it to a person. Share just means other people are allowed to open your project, so your teacher can see it.<br><b>4.</b> Copy the link from the address bar at the top of your browser. On the last card of this quest, you paste that link to turn it in.",
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
    title: "Shape master",
    short: "Walk a square. Then a triangle. Then, if you dare, a star.",
    text: "Use only <b>move</b> and <b>turn</b> blocks. Your sprite must stop exactly where it started, facing the same way.<br><b>Level 1: Square.</b> How many moves and turns? How many degrees is each turn?<br><b>Level 2: Triangle.</b> Three sides. The turn is NOT 60 degrees. Test until it closes up.<br><b>Level 3: Star.</b> Five points. The secret turn is between 140 and 150 degrees.<br>Finish Level 1 to count the challenge as done. Levels 2 and 3 are for bragging rights.",
    answer: "move (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees\nmove (100) steps\nturn cw (90) degrees\n\nmove (120) steps\nturn cw (120) degrees\nmove (120) steps\nturn cw (120) degrees\nmove (120) steps\nturn cw (120) degrees\n\nmove (150) steps\nturn cw (144) degrees\nmove (150) steps\nturn cw (144) degrees\nmove (150) steps\nturn cw (144) degrees\nmove (150) steps\nturn cw (144) degrees\nmove (150) steps\nturn cw (144) degrees"
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
