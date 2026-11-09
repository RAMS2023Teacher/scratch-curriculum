SQ_LESSONS.t3 = {
  title: "Loop-de-Loop",
  tagline: "Why build it 100 times when a loop can do it for you?",
  mission: "Paint your own sprite and bring it to life with loops.",
  minutes: "45",
  skill: "Loops, Costumes & the Paint Editor",
  goal: "By the end of this quest you will use repeat and forever loops, paint your own sprite with two costumes, animate it with next costume and wait, and use graphic effects that reset each time.",
  vocab: [
    { term: "Loop", def: "A block that runs the blocks inside it again and again.", icon: "🔁" },
    { term: "repeat", def: "A loop that runs a set number of times, then stops.", icon: "🔢" },
    { term: "forever", def: "A loop that never stops, until you click the red stop sign.", icon: "♾️" },
    { term: "Costume", def: "One look of a sprite. Switching costumes fast makes animation.", icon: "👕" },
    { term: "Paint editor", def: "The drawing tool in the Costumes tab. You draw sprites and backdrops there.", icon: "🎨" }
  ],
  warmup: "Think of things in real life that repeat: brushing your teeth, the chorus of a song, the days of the week. Which ones repeat a set number of times? Which ones repeat forever? Write one of each, or share with a neighbor.",
  needs: [],
  steps: [
    {
      title: "The long way",
      short: "Build move and turn four times in a row and click it.",
      text: "Start a new project and give it a name. Build this script on the cat: move and turn, four times in a row. Click it. It works, but it is long! Now imagine building it 100 times.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "move (10) steps\nturn cw (15) degrees\nmove (10) steps\nturn cw (15) degrees\nmove (10) steps\nturn cw (15) degrees\nmove (10) steps\nturn cw (15) degrees",
      tip: "Right-click a block and choose Duplicate to copy it and all the blocks under it."
    },
    {
      title: "The loop way",
      short: "Put one move and one turn inside a repeat block instead.",
      text: "Delete the long script. Now put ONE move and ONE turn inside a <code>repeat</code> block from the orange <b>Control</b> category. Click the green flag. The sprite spins in a full circle.",
      where: "Sprite1",
      change: "replace",
      changeNote: "Replaces the long script from step 1. Drag the old script back to the block palette to delete it.",
      scaffold: "full",
      blocks: "when green flag clicked\nrepeat (24)\nmove (10) steps\nturn cw (15) degrees\nend",
      tip: "24 times 15 degrees is 360 degrees. That is one full circle! The blocks must be INSIDE the repeat, in the mouth of the C shape.",
      shots: ["cat-control"]
    },
    {
      title: "Paint your own sprite",
      short: "Use the paint editor to draw your own sprite.",
      text: "Move your mouse over the <b>Choose a Sprite</b> button (bottom right). Click the <b>Paint</b> brush. The paint editor opens in the <b>Costumes</b> tab.<br>Check the button at the bottom says <b>Convert to Bitmap</b>. That means you are in <b>Vector</b> mode, which is easy to fix and move.<br>Try these tools:<br><b>Rectangle</b> and <b>Circle</b>: drag to draw a shape.<br><b>Fill</b>: pick a color at the top, then click a shape to color it.<br><b>Text</b>: click and type words.<br><b>Eraser</b>: rub out a part.<br><b>Select</b> (the arrow): click a shape to move it or make it bigger.<br>Draw a simple creature, robot, or face. Give your sprite a name in the box above the sprite list.",
      tip: "Keep the drawing in the middle of the canvas. The middle is the <b>costume center</b>: the point your sprite turns around. Select all your shapes and drag them so the drawing sits on the center. It snaps when you get close. Fine-motor tip: you can also pick a library sprite and change its colors with Fill.",
      shots: ["choose-sprite", "costumes-tab"]
    },
    {
      title: "Make a second costume",
      short: "Duplicate your costume and change one small thing.",
      text: "In the Costumes tab, right-click your costume and choose <b>duplicate</b>. Click the new costume (costume2). Change ONE small thing: move an arm, close the eyes, open the mouth, or tilt a shape. Click between costume1 and costume2. Can you see it move a little? That small change is how animation works.",
      tip: "Small changes look better than big changes. If the sprite jumps around when costumes switch, the drawings are not both on the costume center."
    },
    {
      title: "Bring it to life",
      short: "Put the blocks in order so your sprite walks and bounces forever.",
      text: "Click your painted sprite in the sprite list. Put these blocks in order to make it walk back and forth forever. <code>next costume</code> switches between your two costumes. <code>wait</code> slows it down so your eyes can see each costume.",
      where: "Your painted sprite",
      change: "new",
      scaffold: "parsons",
      blocks: "when green flag clicked\nset rotation style [left-right v]\nforever\nmove (10) steps\nnext costume\nif on edge, bounce\nwait (0.2) seconds\nend",
      tip: "The set rotation style block goes BEFORE the forever, so it runs one time. Without it, your sprite walks upside down after it bounces. Nothing can go under a forever: it never finishes.",
      shots: ["cat-control"]
    },
    {
      title: "Color party",
      short: "Make a loop that changes a color effect, and reset it first.",
      text: "Loops can repeat any block, even effects. Put these blocks in order on your painted sprite. The <code>clear graphic effects</code> block is the reset. It removes old effects every time you click the green flag.",
      where: "Your painted sprite",
      change: "new",
      scaffold: "parsons",
      blocks: "when green flag clicked\nclear graphic effects\nforever\nchange [color v] effect by (5)\nwait (0.1) seconds\nend",
      tip: "Effects stay on the sprite after you click stop. If you skip clear graphic effects, they pile up and the sprite starts the next run with old colors.",
      shots: ["cat-looks"]
    },
    {
      title: "Spin trick",
      short: "Make your sprite spin once and shrink back when clicked.",
      text: "Now build it with no picture. When someone <b>clicks</b> your painted sprite, it should:<br>1. Spin around one full circle (use a <b>repeat</b> loop with a turn block).<br>2. Grow a little each time around the loop.<br>3. After the loop, go back to its normal size of 100.<br>Hint: look in Looks for <b>change size by</b> and <b>set size to</b>. How many times 36 degrees makes 360?",
      where: "Your painted sprite",
      change: "new",
      scaffold: "goal",
      blocks: "when this sprite clicked\nrepeat (10)\nturn cw (36) degrees\nchange size by (5)\nend\nset size to (100) %",
      tip: "Does the sprite wobble when it spins? Go back to the Costumes tab and move the drawing onto the costume center."
    },
    {
      title: "Save and share",
      short: "Check your loops, then save and share.",
      text: "Make sure your project has at least one <b>repeat</b> and one <b>forever</b>, and your own painted sprite. Click <b>File</b>, then <b>Save now</b>. Click <b>Share</b> and copy the link."
    }
  ],
  quiz: [
    {
      q: "You click the green flag. What is the sprite's x at the end?",
      blocks: "when green flag clicked\ngo to x: (0) y: (0)\npoint in direction (90)\nrepeat (4)\nmove (50) steps\nend",
      choices: ["50", "4", "54", "200"],
      answer: 3,
      explain: "The loop runs move 50 four times. 50 times 4 is 200. Direction 90 is right, so x grows."
    },
    {
      q: "Each time you click the green flag, your sprite starts with stranger colors. What is missing?",
      choices: ["A wait block", "A clear graphic effects block at the start", "Another forever loop", "A second costume"],
      answer: 1,
      explain: "Effects stay after you click stop. clear graphic effects at the start resets them every run."
    }
  ],
  challenge: {
    title: "Spiral tunnel",
    short: "Make your sprite fly in a spiral and grow bigger each time.",
    text: "Make a spiral. When the green flag is clicked, start the sprite small. Then, inside a repeat loop, make it move a little, turn a little, and grow a little each time. It should look like it is flying out of a tunnel. Use only blocks you know from Motion, Looks, and Control. Remember to reset the size and position first.",
    answer: "when green flag clicked\ngo to x: (0) y: (0)\nset size to (20) %\nrepeat (36)\nmove (15) steps\nturn cw (10) degrees\nchange size by (3)\nend"
  },
  checklist: [
    "My project has a sprite I painted myself, with two costumes.",
    "My sprite walks with forever, next costume, and wait.",
    "My project uses a repeat loop.",
    "My color effect starts with clear graphic effects."
  ],
  submit: "Share your project and paste the link. Name your project anything you like (idea: Loop Lab).",
  teacherNotes: "PACING (45 min): warmup 3 min, long way + loop way 7 min, paint your sprite 12 min (set a visible timer: students can spend the whole period painting), second costume 5 min, bring it to life 6 min, color party 4 min, spin trick (goal) 6 min, save/share 2 min.\nMISCONCEPTIONS: (1) Putting the green flag hat inside a loop, or blocks below forever (they never run - forever has no bottom notch for this reason). (2) Blocks next to the loop instead of inside its mouth. (3) Effects pile up between runs - clear graphic effects on the green flag is the reset. (4) Bitmap vs vector: if a student clicked Convert to Bitmap, the Fill and Select tools act differently; click Convert to Vector to go back. (5) Wobbly spinning means the drawing is off the costume center.\nACCOMMODATIONS: Painting is hard for students with fine-motor needs or limited mouse control. Allow them to start from a library sprite and only recolor it with Fill, or draw with large rectangles and circles only (no freehand). Students who struggle with the parsons steps can say each block aloud and ask 'what should happen first?'. Students who are perfectionists about art: remind them the goal is two costumes that animate, and they can polish the drawing later. English learners: the tool names in the paint editor appear when you hover over each tool; point and name them together."
};
