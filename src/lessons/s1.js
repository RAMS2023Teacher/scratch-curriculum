SQ_LESSONS.s1 = {
  title: "Talking Characters",
  tagline: "Bring two characters to life and make them have a real conversation.",
  mission: "Make two characters talk and take turns at the right time.",
  minutes: "45",
  skill: "Dialogue Timing with Broadcasts",
  goal: "By the end of this quest you will write a short conversation and use broadcast or broadcast and wait so two characters take turns without talking over each other.",
  vocab: [
    { term: "Dialogue", def: "The words characters say to each other in a story.", icon: "💬" },
    { term: "Cue", def: "A signal that tells a character it is their turn to talk.", icon: "🎬" },
    { term: "broadcast", def: "Sends a message to all sprites, then keeps going right away.", icon: "📣" },
    { term: "broadcast and wait", def: "Sends a message, then waits until every sprite that got it is finished.", icon: "⏳" },
    { term: "Overlap", def: "Two characters talking at the same time, so the story is hard to follow.", icon: "🔀" }
  ],
  warmup: "Pick two characters who would never meet, like a pirate and a robot, or a dragon and a dentist. What is the first thing one would say to the other? Say it out loud or write it down. You can do this alone or with a neighbor.",
  needs: [],
  project: { name: "Animated Story", part: "Part 1 of 2" },
  steps: [
    {
      title: "Cast your characters",
      short: "Start a new project. Add two characters and a backdrop.",
      text: "Start a new project. Add two character sprites and one backdrop. Rename each sprite to its character name: click the sprite, then type in the <b>Sprite</b> name box. Drag them so they face each other. In this quest we call them <b>Character A</b> (talks first) and <b>Character B</b>.",
      shots: ["choose-sprite", "backdrops"],
      tip: "Is a character facing the wrong way? Go to its <b>Costumes</b> tab and click the flip horizontal button. That is easier than turning the sprite."
    },
    {
      title: "Write your script",
      short: "Write six short lines of dialogue before you code.",
      text: "A movie starts with a script. Write 6 lines: who says what, in order. A says lines 1, 3 and 5. B says lines 2, 4 and 6. Keep each line short so it fits in a speech bubble. Write it in a doc so you can copy and paste each line into Scratch later.<br>Example:<br>A: Hi! Who are you?<br>B: I am a robot from the future.<br>A: Whoa! Why are you here?<br>B: I came to find the last slice of pizza.<br>A: I ate it this morning.<br>B: Oh no!",
      frame: "My characters: A is ____. B is ____.\nWhere are they? ____\n\nLine 1  A: ____\nLine 2  B: ____\nLine 3  A: ____\nLine 4  B: ____\nLine 5  A: ____\nLine 6  B: ____",
      tip: "Short lines are better. Try to keep each line under 10 words. You may use the example lines and change just a few words."
    },
    {
      title: "Try timing with wait",
      short: "Use wait blocks so B answers after A finishes talking.",
      text: "First, try the simple way. Each character starts on the green flag. B waits 2 seconds while A talks, then answers. Put the <b>top script on Character A</b> and the <b>bottom script on Character B</b>. Use your own lines and your own x and y numbers. Click the green flag to test.",
      where: "Character A (top script) and Character B (bottom script)",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\ngo to x: (-120) y: (-60)\nsay [Hi! Who are you?] for (2) seconds\nwait (2) seconds\nsay [Whoa! Why are you here?] for (2) seconds\n\nwhen green flag clicked\ngo to x: (120) y: (-60)\nwait (2) seconds\nsay [I am a robot from the future.] for (2) seconds",
      tip: "Now change line 1 to say for <b>4</b> seconds and click the green flag. B talks on top of A! With wait, every time you change one line, you must fix the wait times too. Broadcasts fix this. Change it back to 2."
    },
    {
      title: "Choose your timing method",
      short: "Pick relay or leader. Make Character A send B a cue.",
      text: "Instead of guessing the time, A will send B a <b>cue</b> (a broadcast message). Pick one way to do it. Both ways work.<br><b>Relay</b>: each character sends the next cue, like passing a ball.<br><b>Leader</b>: A uses <b>broadcast and wait</b>, so A waits until B is done, then says the next line.<br>To make a message, open the broadcast dropdown and choose <b>New message</b>. Name it after the line it starts, like <b>line 2</b>.",
      where: "Character A",
      change: "replace",
      changeNote: "Replaces Character A's green flag script from step 3.",
      scaffold: "full",
      options: [
        {
          label: "Relay: broadcast",
          short: "A says line 1, sends line 2, then waits for line 3.",
          blocks: "when green flag clicked\ngo to x: (-120) y: (-60)\nsay [Hi! Who are you?] for (2) seconds\nbroadcast (line 2 v)\n\nwhen I receive [line 3 v]\nsay [Whoa! Why are you here?] for (2) seconds\nbroadcast (line 4 v)"
        },
        {
          label: "Leader: broadcast and wait",
          short: "A keeps the whole order in one script and waits for B each time.",
          blocks: "when green flag clicked\ngo to x: (-120) y: (-60)\nsay [Hi! Who are you?] for (2) seconds\nbroadcast (line 2 v) and wait\nsay [Whoa! Why are you here?] for (2) seconds\nbroadcast (line 4 v) and wait"
        }
      ],
      shots: ["cat-events"],
      tip: "Choose the message from the dropdown every time. If you type a new message with a different spelling, like <b>Line 2</b> and <b>line 2</b>, you get two different messages."
    },
    {
      title: "Character B answers",
      short: "Pick the same method as before. Make B answer its cue.",
      text: "Now B listens for its cue with <b>when I receive</b>. Pick the same tab you picked in step 4. Put the blocks together, then click the green flag. You should hear three lines in the right order.<br><b>Relay</b>: B must send the next cue back to A.<br><b>Leader</b>: B does not send anything. A is already waiting for B to finish.",
      where: "Character B",
      change: "replace",
      changeNote: "Replaces Character B's green flag script from step 3. Keep go to x: y:, but delete the wait and say blocks.",
      scaffold: "parsons",
      options: [
        {
          label: "Relay: broadcast",
          short: "B answers line 2, then sends the line 3 cue back to A.",
          blocks: "when green flag clicked\ngo to x: (120) y: (-60)\n\nwhen I receive [line 2 v]\nsay [I am a robot from the future.] for (2) seconds\nbroadcast (line 3 v)"
        },
        {
          label: "Leader: broadcast and wait",
          short: "B answers line 2. A waits until B is finished.",
          blocks: "when green flag clicked\ngo to x: (120) y: (-60)\n\nwhen I receive [line 2 v]\nsay [I am a robot from the future.] for (2) seconds"
        }
      ],
      tip: "Test the overlap again: change B's line to 4 seconds. Nobody talks on top of anyone now, because the next line waits for the cue."
    },
    {
      title: "Finish the conversation",
      short: "Add lines four to six yourself, using the same method.",
      text: "Build the rest of your 6 lines on your own. Use the same method you picked. You already know every block you need: <b>when I receive</b>, <b>say for seconds</b>, and <b>broadcast</b> or <b>broadcast and wait</b>.<br><b>Relay</b>: every line is a when I receive script that ends by sending the next cue.<br><b>Leader</b>: add more say and broadcast and wait blocks to the bottom of A's green flag script, and give B a when I receive script for each of its lines.<br>Test after each new line.",
      where: "Character A and Character B",
      change: "add",
      changeNote: "Adds new when I receive scripts. Leader method: also adds blocks to the bottom of Character A's green flag script.",
      scaffold: "goal",
      options: [
        {
          label: "Relay: broadcast",
          short: "B gets line 4, A gets line 5, B gets line 6.",
          blocks: "when I receive [line 4 v]\nsay [I came to find the last slice of pizza.] for (2) seconds\nbroadcast (line 5 v)\n\nwhen I receive [line 5 v]\nsay [I ate it this morning.] for (2) seconds\nbroadcast (line 6 v)\n\nwhen I receive [line 6 v]\nsay [Oh no!] for (2) seconds"
        },
        {
          label: "Leader: broadcast and wait",
          short: "A's script grows. B gets one when I receive script per line.",
          blocks: "say [I ate it this morning.] for (2) seconds\nbroadcast (line 6 v) and wait\n\nwhen I receive [line 4 v]\nsay [I came to find the last slice of pizza.] for (2) seconds\n\nwhen I receive [line 6 v]\nsay [Oh no!] for (2) seconds"
        }
      ],
      tip: "Relay method: the line 5 script goes on Character A. The line 4 and line 6 scripts go on Character B. Leader method: the two loose blocks go at the bottom of A's green flag script."
    },
    {
      title: "Add personality",
      short: "Add a thought, a costume change, or a sound to one line.",
      text: "Make your characters feel alive. Use <b>think for seconds</b> for a secret thought, <b>next costume</b> when a character gets excited, or <b>start sound</b> on a funny line. Add them inside any when I receive script.",
      where: "Either character",
      change: "add",
      changeNote: "Add these blocks inside one of your when I receive scripts, before or after its say block.",
      scaffold: "full",
      blocks: "when I receive [line 4 v]\nthink [Hmm... should I tell them?] for (2) seconds\nnext costume\nsay [I came to find the last slice of pizza.] for (2) seconds",
      stretch: true,
      tip: "If you change costumes, add <b>switch costume to</b> under the green flag too, so the character looks normal every time the story starts."
    },
    {
      title: "Watch, fix, and share",
      short: "Watch the whole conversation twice. Fix overlaps, then save and share.",
      text: "Click the green flag and watch with your eyes on the Stage only. Do the lines come in the right order? Does anyone talk at the same time? Does a bubble stay up forever? Click the green flag a second time to check that the characters go back to their places. Then save and share.",
      tip: "A speech bubble that never goes away means you used <b>say</b> instead of <b>say for seconds</b>. A line that never comes means a message name does not match, or nobody sends that message."
    }
  ],
  quiz: [
    {
      q: "Character A runs the top script. Character B runs the bottom one. When does A say Done?",
      blocks: "when green flag clicked\nbroadcast (line 2 v) and wait\nsay [Done!] for (2) seconds\n\nwhen I receive [line 2 v]\nsay [Hello!] for (3) seconds",
      choices: ["Right away, at the same time B says Hello", "After about 3 seconds, when B is finished", "Never", "Before B says anything"],
      answer: 1,
      explain: "broadcast and wait waits until B's when I receive script is finished, so A speaks after B's 3 seconds."
    },
    {
      q: "Now A uses plain broadcast. What happens when you click the green flag?",
      blocks: "when green flag clicked\nbroadcast (line 2 v)\nsay [Done!] for (2) seconds\n\nwhen I receive [line 2 v]\nsay [Hello!] for (3) seconds",
      choices: ["A says Done after B finishes", "Only B talks", "A and B talk at the same time", "Nothing happens"],
      answer: 2,
      explain: "Plain broadcast does not wait. A keeps going right away, so both bubbles appear at once."
    }
  ],
  challenge: {
    title: "Third character",
    short: "Add a third character who jumps into the middle of the conversation.",
    text: "Add a third sprite who is hidden at the start. In the middle of the conversation, it appears, says one surprising line, and hides again. The other characters must wait for it and then keep talking. The story must still reset when you click the green flag again.",
    answer: "when green flag clicked\nhide\n\nwhen I receive [surprise v]\nshow\nsay [Wait! Nobody move!] for (2) seconds\nhide\n\nwhen I receive [line 4 v]\nbroadcast (surprise v) and wait\nsay [I came to find the last slice of pizza.] for (2) seconds"
  },
  checklist: [
    "Two named characters and a backdrop",
    "At least 6 lines of dialogue",
    "Turns use broadcast or broadcast and wait, not only wait blocks",
    "No lines overlap when I watch it",
    "Characters go back to their start places on the green flag"
  ],
  submit: "Share your conversation with at least 6 lines. Name your project anything you like (idea: \"Pirate Meets Robot\"). Paste the link. You will add more scenes to this same project next quest.",
  teacherNotes: "Pacing (45 min): warmup 3, cast 5, script writing 7, wait method 5, choose method 7, B answers 5, finish 8, watch and share 5. The personality step is a stretch.<br><b>Key idea</b>: plain broadcast starts other scripts and keeps going; broadcast and wait pauses until every receiving script ends. The step 3 tip (change a line to 4 seconds) makes students feel why wait timing breaks. Students pick Relay or Leader; both are correct. Leader keeps the whole order in one place and is easier to read; Relay shows clearly how cues pass. Students must pick the same tab in steps 4 to 6 (the app remembers each step's tab separately).<br><b>Common misconceptions</b>: say without seconds stays up forever and looks like overlap; making two messages with different spellings; in Leader, B also broadcasting the next line (it then runs twice); thinking broadcast and wait waits for the sprite to say something, when it waits for the whole receiving script.<br><b>Accommodations</b>: this lesson is typing-heavy. Let students write lines in a doc and copy and paste into say blocks, use speech-to-text in the doc, or use the example dialogue and change only names and a few words. Students with writing goals may do 4 lines instead of 6. English learners may write lines in their home language (Scratch shows any language in speech bubbles) plus one English line. Read-aloud covers the step cards; pair the frame with a quick verbal rehearsal."
};
