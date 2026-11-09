SQ_LESSONS.t2 = {
  title: "Lights, Camera, Events!",
  tagline: "Make things happen when YOU say so: flags, keys, and clicks.",
  mission: "Start your code with the green flag, keys, and clicks.",
  minutes: "40",
  skill: "Events & Sequences",
  goal: "By the end of this quest you will start scripts with event blocks (green flag, key presses, sprite clicks), put blocks in the right order, add speech and sound, and reset your sprites when the green flag is clicked.",
  vocab: [
    { term: "Event", def: "Something that happens, like a click or a key press, that starts a script.", icon: "⚡" },
    { term: "Hat block", def: "A block with a round top. It sits on top of a script and waits.", icon: "🎩" },
    { term: "Sequence", def: "The order that steps happen in. The order matters!", icon: "🔢" },
    { term: "Green flag", def: "The button above the Stage that starts a project.", icon: "🚩" },
    { term: "Reset", def: "Put things back to how they start, so the project works the same every time.", icon: "🔄" }
  ],
  warmup: "Write the steps to make a sandwich, in order, in 4 or 5 short lines. Then swap two of the steps. What goes wrong? You can do this alone, or read your steps to a neighbor and let them act it out exactly.",
  needs: [],
  steps: [
    {
      title: "Start a new project",
      short: "Make a new project and look at the yellow Events blocks.",
      text: "Click <b>File</b>, then <b>New</b>. Click the title box and give the project a name. Then click the yellow <b>Events</b> circle on the left. Look at the blocks with round tops. These are <b>hat blocks</b>. Each one waits for something to happen.",
      shots: ["cat-events"]
    },
    {
      title: "The green flag",
      short: "Build a script that starts when the green flag is clicked.",
      text: "Build this script. Then click the <b>green flag</b> above the Stage to run it. You do not need to click the script anymore. The hat block starts it.<br>The first two blocks are a <b>reset</b>. They put the sprite back in the center, facing right, every time you click the flag.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\ngo to x: (0) y: (0)\npoint in direction (90)\nsay [Welcome to my party!] for (2) seconds\nsay [Press the arrow keys!] for (2) seconds",
      tip: "Get into the habit: almost every project starts with a green flag script that resets things. Hat blocks only go on top. Nothing can snap above them.",
      shots: ["green-flag"]
    },
    {
      title: "Key presses",
      short: "Make four scripts so the arrow keys move your sprite.",
      text: "Make the sprite move with keys. Build four small scripts, one for each arrow key. Each script has its own hat block. Then press the arrow keys to test.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "when [right arrow v] key pressed\nchange x by (10)\n\nwhen [left arrow v] key pressed\nchange x by (-10)\n\nwhen [up arrow v] key pressed\nchange y by (10)\n\nwhen [down arrow v] key pressed\nchange y by (-10)",
      tip: "Keys not working? Click once on the Stage first. Scratch only hears the keys when the Stage is selected, not when you are typing in a block."
    },
    {
      title: "Click the sprite",
      short: "Make your sprite play a sound when someone clicks it.",
      text: "Add a script that runs when someone clicks the sprite on the Stage. Find <b>start sound</b> in the pink <b>Sound</b> category. Click the sprite on the Stage to test.",
      where: "Sprite1",
      change: "new",
      scaffold: "full",
      blocks: "when this sprite clicked\nstart sound (Meow v)\nsay [Hey, that tickles!] for (1) seconds",
      tip: "No sound? Check that your headphones are plugged in and the volume is up. Want a different sound? Open the Sounds tab and choose one.",
      shots: ["cat-sound", "sounds-tab"]
    },
    {
      title: "Add a second sprite",
      short: "Add a second sprite and give it its own scripts.",
      text: "Click the <b>Choose a Sprite</b> button (the cat face at the bottom right) and pick a second sprite. Now <b>click the new sprite in the sprite list</b>. The code area is empty! Every sprite has its own code area. Give the new sprite a script for the space key.",
      where: "Your second sprite",
      change: "new",
      scaffold: "full",
      blocks: "when [space v] key pressed\nturn cw (15) degrees\nstart sound (pop v)",
      tip: "Code not working? Look at the sprite list. The sprite with the blue box around it is the one you are coding. If you put code on the wrong sprite, drag the script onto the right sprite in the sprite list to copy it, then delete the old one.",
      shots: ["choose-sprite"]
    },
    {
      title: "Sequence detective",
      short: "Put the mixed up blocks in order so the story makes sense.",
      text: "The blocks for a tiny show are mixed up. Before you build it, read each block and <b>predict</b>: what should happen first, next, and last? Then put them in order on your first sprite and click the green flag. Does the story make sense? Try swapping two say blocks. What changes?",
      where: "Sprite1",
      change: "new",
      scaffold: "parsons",
      blocks: "when green flag clicked\ngo to x: (-150) y: (0)\nsay [Hello!] for (2) seconds\nglide (2) secs to x: (150) y: (0)\nsay [I made it across!] for (2) seconds\nsay [Goodbye!] for (2) seconds",
      tip: "Clues: the hat block is always first. The reset goes right under it. You say Goodbye at the end, not the beginning."
    },
    {
      title: "Your own event",
      short: "Make your second sprite react to a key you choose.",
      text: "Now build one with no picture. Pick a key, like <b>b</b> or <b>w</b>. When that key is pressed, your <b>second sprite</b> should:<br>1. Say something.<br>2. Play a sound.<br>3. Move somewhere new.<br>Also give the second sprite a <b>green flag</b> script that resets it to a starting spot. Use blocks from Events, Looks, Sound, and Motion.",
      where: "Your second sprite",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\ngo to x: (100) y: (-100)\n\nwhen [b v] key pressed\nsay [You found my secret key!] for (2) seconds\nstart sound (pop v)\nglide (1) secs to x: (0) y: (100)",
      tip: "Test the reset: press your key, then click the green flag. Does the sprite go back to its starting spot?"
    },
    {
      title: "Save and share",
      short: "Save your project and click Share.",
      text: "Click <b>File</b>, then <b>Save now</b>. Then click <b>Share</b> and copy the link from the address bar."
    }
  ],
  quiz: [
    {
      q: "The sprite is at x: 0. You click the Stage, then press the space key three times. What is x now?",
      blocks: "when [space v] key pressed\nchange x by (10)",
      choices: ["10", "0", "30", "3"],
      answer: 2,
      explain: "The script runs once for every press. 10 plus 10 plus 10 is 30."
    },
    {
      q: "Why do many green flag scripts start with a go to x: y: block?",
      choices: ["To make the sprite talk", "To reset the sprite to its starting spot", "To delete the sprite", "It makes the project load faster"],
      answer: 1,
      explain: "A reset puts the sprite back, so the project starts the same way every time."
    }
  ],
  challenge: {
    title: "Costume and backdrop keys",
    short: "Make one key change the costume and another key change the backdrop.",
    text: "Make the <b>c</b> key change the sprite's costume, and the <b>n</b> key change the backdrop. You will need to add at least one backdrop first. Look in the purple Looks category for the blocks. Bonus: make the green flag reset both the costume and the backdrop.",
    answer: "when [c v] key pressed\nnext costume\n\nwhen [n v] key pressed\nnext backdrop\n\nwhen green flag clicked\nswitch costume to (costume1 v)\nswitch backdrop to (backdrop1 v)"
  },
  checklist: [
    "My project has a green flag script that resets a sprite.",
    "My project uses at least three different event hat blocks.",
    "My project has two sprites, each with its own scripts.",
    "My project uses speech and a sound."
  ],
  submit: "Share your project and paste the link. Name your project anything you like (idea: Event Party).",
  teacherNotes: "PACING (40 min): warmup 3 min, new project + green flag 7 min, key presses 6 min, click sprite 4 min, second sprite 6 min, sequence detective 5 min, your own event (goal) 7 min, save/share 2 min.\nMISCONCEPTIONS: (1) Trying to put a hat block in the middle or bottom of a script - hats only go on top. (2) Code built on the wrong sprite - teach students to look for the blue highlight in the sprite list; scripts can be dragged onto another sprite to copy. (3) Keys 'not working' because focus is in a text field or block input - click the Stage first. (4) Thinking the reset happens by itself; it only happens because the script says so.\nACCOMMODATIONS: Students with reading difficulty can use read-aloud on each card; the sequence detective step is a good place to pair a student with you for think-aloud tracing. Students who struggle with keyboard/mouse coordination may find four arrow scripts tiring to build; let them build two (right and left) and duplicate with right-click > duplicate. The warmup is written so it can be done alone. Students with hearing impairments or no headphones can replace sounds with say blocks."
};
