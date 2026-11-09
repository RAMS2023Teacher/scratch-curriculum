SQ_LESSONS.m2 = {
  title: "My Blocks Workshop",
  tagline: "Invent your own blocks and draw with the Pen.",
  mission: "Make your own Scratch blocks and use them to draw.",
  minutes: "45",
  skill: "Custom Blocks, Inputs & Pen",
  goal: "By the end of this quest you will make custom blocks with Make a Block, give them inputs, draw shapes with the Pen, and use a custom block to clean up your branch project.",
  vocab: [
    { term: "Custom block", def: "A block you make. It runs a group of blocks you choose.", icon: "🧩" },
    { term: "define", def: "The hat block where you build what your custom block does.", icon: "🛠️" },
    { term: "Input", def: "A blank in your block. You can put a different value in it each time.", icon: "📥" },
    { term: "Pen", def: "Extra blocks that let a sprite draw lines on the Stage as it moves.", icon: "🖊️" },
    { term: "Abstraction", def: "Putting many blocks behind one simple name, so code is easier to read.", icon: "📦" }
  ],
  warmup: "If you could invent ONE new Scratch block, what would it be called and what would it do? Write its name like a real block, for example: do a backflip. Do this alone or with a neighbor.",
  needs: [],
  steps: [
    {
      title: "Find My Blocks",
      short: "Click My Blocks, then Make a Block, and name it dance.",
      text: "Make a new project. Click the <b>My Blocks</b> category (pink, at the bottom of the list). Click <b>Make a Block</b>. Type the name <code>dance</code> and click <b>OK</b>. A <code>define dance</code> hat block appears in the code area, and a new <code>dance</code> block appears in My Blocks.",
      shots: ["make-block"],
      tip: "Name your project anything you like. One idea: Block Workshop."
    },
    {
      title: "Define your block",
      short: "Put blocks under define dance, then use dance in a green flag script.",
      text: "The blocks under <code>define dance</code> are what your block does. Build the define script. Then build a green flag script that uses your new <code>dance</code> block two times. Click the green flag to test.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "define dance\nturn cw (15) degrees\nwait (0.2) seconds\nturn ccw (30) degrees\nwait (0.2) seconds\nturn cw (15) degrees\n\nwhen green flag clicked\ndance\nsay [Ta-da!] for (1) seconds\ndance",
      tip: "Custom blocks only work in the sprite where you made them. If you click a different sprite, dance is not there."
    },
    {
      title: "Add an input",
      short: "Give your dance block a number input called times.",
      text: "Right-click the <code>define dance</code> hat and choose <b>Edit</b>. Click <b>Add an input (number or text)</b>, type <code>times</code>, and click <b>OK</b>. Now the hat says <code>define dance (times)</code>.<br>Put the dance moves inside a <code>repeat</code>, and drag the pink <code>times</code> bubble into the repeat. In the green flag script, type a number into each dance block.",
      where: "Sprite1",
      change: "replace",
      changeNote: "Replaces both scripts from step 2: the define dance script and the green flag script.",
      scaffold: "parsons",
      blocks: "define dance (times)\nrepeat (times)\nturn cw (15) degrees\nwait (0.2) seconds\nturn ccw (15) degrees\nwait (0.2) seconds\nend\n\nwhen green flag clicked\ndance (3)",
      shots: ["make-block"],
      tip: "Drag the pink times bubble from the define hat itself. You cannot find it in the block list."
    },
    {
      title: "A drawing block",
      short: "Add the Pen extension and make a block that draws any size square.",
      text: "Click the <b>Add Extension</b> button at the bottom-left corner. Choose <b>Pen</b>. New green Pen blocks appear: <code>pen down</code> draws as the sprite moves, <code>pen up</code> stops drawing, and <code>erase all</code> clears the Stage.<br>Make a new block <code>square</code> with a number input called <code>size</code>. Then build a green flag script that draws three squares.",
      where: "Sprite1",
      change: "replace",
      changeNote: "Replaces your green flag script from step 3. Keep the define dance script.",
      scaffold: "full",
      blocks: "define square (size)\npen down\nrepeat (4)\nmove (size) steps\nturn cw (90) degrees\nend\npen up\n\nwhen green flag clicked\nerase all\nsquare (50)\nsquare (100)\nsquare (150)",
      shots: ["extensions"],
      tip: "Lines left over from last time? That is why erase all goes at the top of the green flag script."
    },
    {
      title: "Turbo mode",
      short: "Turn on run without screen refresh so the squares draw fast.",
      text: "Right-click <code>define square (size)</code> and choose <b>Edit</b>. Check the box <b>Run without screen refresh</b> and click <b>OK</b>. Click the green flag. The squares appear all at once! This is good for drawing and for code that should happen in one moment.",
      shots: ["make-block"],
      tip: "Do not use Run without screen refresh on a block that has a forever or a wait inside. Scratch can freeze. If it freezes, click the red stop sign."
    },
    {
      title: "A block that uses a block",
      short: "Make a row block that draws many squares in a line.",
      text: "Make a new block called <code>row</code> with a number input called <code>count</code>. When you use <code>row (5)</code>, the sprite should draw 5 small squares next to each other, in a line from left to right.<br>Ideas: your <code>square</code> block can go INSIDE the define row script. Use a loop from <b>Control</b>. Move the sprite after each square so they do not draw on top of each other. In the green flag script, use <b>erase all</b>, move the sprite to the left side, point it to the right, and then use your row block.",
      where: "Sprite1",
      change: "replace",
      changeNote: "Replaces your green flag script from step 4. Keep define dance and define square.",
      scaffold: "goal",
      blocks: "define row (count)\nrepeat (count)\nsquare (40) :: custom\nmove (50) steps\nend\n\nwhen green flag clicked\nerase all\ngo to x: (-200) y: (0)\npoint in direction (90)\nrow (5)",
      tip: "Test small: click row with a 2 typed in it before you add it to the green flag script."
    },
    {
      title: "Clean up your branch project",
      short: "Turn repeated blocks in your branch project into one custom block.",
      text: "Open your project from your first branch. Look for a group of blocks you use two or more times. Turn it into ONE custom block with a clear name. Then replace each copy with your block.<br><b>Games idea:</b> <code>reset player</code> (go to the start spot, set lives, show).<br><b>Stories idea:</b> <code>enter from left</code> (go to the left edge, show, glide in).<br><b>Apps idea:</b> <code>correct answer</code> (play a sound, say Correct!, change score by 1).<br>Click the green flag. The project should work the same as before, but the code is shorter and easier to read.",
      where: "The sprite in your branch project that repeats blocks",
      change: "replace",
      changeNote: "Replaces each repeated group of blocks with one call to your new custom block. The example shows a Stories version.",
      scaffold: "goal",
      blocks: "define enter from left\nhide\ngo to x: (-240) y: (-100)\nshow\nglide (1) secs to x: (-100) y: (-100)\n\nwhen green flag clicked\nenter from left\nsay [Hello!] for (2) seconds\n\nwhen I receive [scene 2 v]\nenter from left\nsay [I am back!] for (2) seconds",
      tip: "Make the block in the SAME sprite as the repeated code. If two sprites repeat the same blocks, each sprite needs its own copy of the block. No branch project? Use your bug project from the last quest."
    },
    {
      title: "Save and share",
      short: "Save and share both projects.",
      text: "Click the green flag in each project one more time to test. Save and share your workshop project and your updated branch project. Paste the workshop link."
    }
  ],
  quiz: [
    {
      q: "Trace this code. The sprite starts at y: 0. What does it say at the end?",
      blocks: "define jump (height)\nchange y by (height)\nwait (0.3) seconds\nchange y by ((0) - (height))\n\nwhen green flag clicked\ngo to x: (0) y: (0)\njump (50)\nsay (y position)",
      choices: [
        "50",
        "100",
        "-50",
        "0"
      ],
      answer: 3,
      explain: "jump (50) moves up 50, waits, then moves down 50. The sprite is back at y 0."
    },
    {
      q: "You made a custom block on the Cat sprite. You click the Dog sprite and the block is gone. Why?",
      choices: [
        "The block was deleted",
        "Custom blocks only work in the sprite where you made them",
        "You must save first",
        "The Pen extension is off"
      ],
      answer: 1,
      explain: "Each sprite has its own custom blocks. Make the block again in the Dog sprite."
    }
  ],
  challenge: {
    title: "Polygon machine",
    short: "Make one block that can draw a shape with any number of sides.",
    text: "Make a block called polygon with two number inputs: sides and size. polygon with 3 sides draws a triangle, 5 draws a pentagon, 6 draws a hexagon. Every side has the same length. Hint: to get back to the start, the sprite turns 360 degrees in total.",
    answer: "define polygon (sides) (size)\npen down\nrepeat (sides)\nmove (size) steps\nturn cw ((360) / (sides)) degrees\nend\npen up"
  },
  checklist: [
    "My workshop project has at least two custom blocks",
    "One of my blocks has an input that changes what it does",
    "My square block draws with the Pen",
    "My branch project uses a custom block instead of repeated code"
  ],
  submit: "Share your workshop project and paste the link. Name your project anything you like (idea: Block Workshop).",
  teacherNotes: "Pacing: Make a Block 3 min, define 5, input 7, Pen square 8, turbo 3, row goal 8, branch cleanup 9, share 2. Pen is introduced here for everyone (Apps fork 2 builds on it). Misconceptions: (1) students drag an input from somewhere other than the define hat; it must come from the hat. (2) custom blocks only exist in the sprite where they were made; the Stage and other sprites do not see them. (3) Run without screen refresh with a forever or wait inside can freeze the editor; the red stop sign fixes it. (4) Students expect editing the define to change behavior without clicking the green flag again. In branch cleanup, Games students may find repeated code in clone scripts; that is fine, but the custom block must be made in that same sprite. Accommodations: students who need less reading can follow the screenshots for steps 1, 3 and 5; the row goal can be reduced to 'use square three times in one green flag script'. ELLs: model 'define' as 'teach Scratch a new word'. For students with motor needs, drawing is done by code, not the mouse, so no fine control is needed."
};
