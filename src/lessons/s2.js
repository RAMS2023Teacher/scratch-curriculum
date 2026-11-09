SQ_LESSONS.s2 = {
  title: "Scene Changer",
  tagline: "Take your story on a journey: new places, new action.",
  mission: "Turn your story into three scenes that change by themselves.",
  minutes: "45",
  skill: "Backdrops, Scenes and Show or Hide",
  goal: "By the end of this quest you will build a story with three scenes, use messages to change the backdrop, start action with when backdrop switches to, and make characters enter and exit with show and hide.",
  vocab: [
    { term: "Scene", def: "One part of a story in one place. In Scratch, often one backdrop.", icon: "🎞️" },
    { term: "Backdrop", def: "The background picture on the Stage.", icon: "🏞️" },
    { term: "Enter and exit", def: "When a character comes into a scene or leaves it.", icon: "🚪" },
    { term: "Plot", def: "What happens in a story: the beginning, the middle, and the end.", icon: "🗺️" },
    { term: "Reset", def: "Putting everything back the way it was at the start of the story.", icon: "🔄" }
  ],
  warmup: "Think of a movie or book you like. Name three places where it happens. How do you know the story moved to a new place? Think alone or share with a neighbor.",
  needs: [],
  starter: {
    name: "Animated Story starter",
    contains: "Two character sprites named Character A and Character B, one backdrop named scene1, and a 6-line conversation that uses broadcast messages line 2 to line 6. The last line (line 6) is said by Character B in a when I receive [line 6] script. Each character has a green flag script with go to x: y:."
  },
  project: { name: "Animated Story", part: "Part 2 of 2" },
  steps: [
    {
      title: "Plan three scenes",
      short: "Open your story and plan three scenes with the frame.",
      text: "Open your Animated Story from last quest (or the starter project). A good story has a beginning, a middle, and an end. <b>Scene 1</b> is the conversation you already have. In <b>Scene 2</b> a problem happens somewhere new. In <b>Scene 3</b> the problem is solved. Each new scene only needs 2 to 4 short lines.",
      frame: "Scene 1 (backdrop scene1): the conversation I already have.\n  Last line of Scene 1: ____\n\nScene 2 (backdrop scene2): Where are we? ____\n  Who is here? ____\n  What problem happens? ____\n  Lines: ____ / ____\n\nScene 3 (backdrop scene3): Where are we? ____\n  How is the problem solved? ____\n  Last line of the story: ____",
      tip: "Keep it small. Three scenes with a few lines each is a full story. You can add more scenes later if you have time."
    },
    {
      title: "Add and name backdrops",
      short: "Add two backdrops. Name them scene1, scene2, and scene3.",
      text: "Click the <b>Stage</b> in the bottom right corner, then the <b>Backdrops</b> tab. Add two more backdrops (choose one or paint your own). Rename all three to <b>scene1</b>, <b>scene2</b>, and <b>scene3</b> in the name box, so they are easy to find in dropdowns.",
      shots: ["select-stage", "backdrops"],
      tip: "Delete the plain white backdrop1 if you do not use it, so it does not show up by mistake."
    },
    {
      title: "Make the Stage the director",
      short: "On the Stage, start at scene 1 and change scenes when messages arrive.",
      text: "The Stage will change scenes. On the green flag it always goes back to scene1. When it receives <b>end scene 1</b>, it switches to scene2. When it receives <b>end scene 2</b>, it switches to scene3. Make the two new messages in the dropdown. Nobody sends them yet, so the next steps will do that.",
      where: "Stage",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nswitch backdrop to (scene1 v)\n\nwhen I receive [end scene 1 v]\nswitch backdrop to (scene2 v)\n\nwhen I receive [end scene 2 v]\nswitch backdrop to (scene3 v)",
      shots: ["select-stage", "cat-events"],
      tip: "A when I receive script only runs if some sprite sends that message. If a scene never changes, check that something broadcasts it."
    },
    {
      title: "Send the end of Scene 1",
      short: "After your last Scene 1 line, broadcast end scene 1.",
      text: "Find the script that says the <b>last line</b> of your conversation. Add <b>broadcast (end scene 1)</b> at the very bottom. Click the green flag: after the last line, the backdrop should change to scene2.",
      where: "The character who says the last line of Scene 1",
      change: "add",
      changeNote: "Add the broadcast block at the bottom of the script that says your last Scene 1 line (in the starter, Character B's when I receive [line 6] script).",
      scaffold: "full",
      blocks: "when I receive [line 6 v]\nsay [Oh no!] for (2) seconds\nbroadcast (end scene 1 v)",
      tip: "Pick end scene 1 from the dropdown. Do not make a new message with a different name."
    },
    {
      title: "Enter and exit",
      short: "Hide characters on the green flag. Show them when their scene starts.",
      text: "Not every character is in every scene. A character who first appears in Scene 2 must <b>hide</b> on the green flag, then <b>show</b> when the backdrop switches to scene2. A character who is in Scene 1 must <b>show</b> on the green flag, so it is back after the last run. Use <b>when backdrop switches to</b> from Events. You can add a new sprite for Scene 2.",
      where: "A character who enters in Scene 2",
      change: "add",
      changeNote: "Put hide and go to at the top of this character's green flag script (make one if it has none). The backdrop script is a new script.",
      scaffold: "parsons",
      blocks: "when green flag clicked\nhide\ngo to x: (-250) y: (-80)\n\nwhen backdrop switches to [scene2 v]\nshow\nglide (2) secs to x: (-80) y: (-80)\nsay [Where are we now?] for (2) seconds",
      shots: ["cat-events"],
      tip: "Every character needs show or hide in its green flag script. If a character hides in Scene 3, it will still be hidden next time unless the green flag shows it again."
    },
    {
      title: "Build Scene 2",
      short: "Make a short Scene 2 conversation that ends with broadcast end scene 2.",
      text: "When the backdrop switches to scene2, your characters talk about the problem. Use broadcasts for turns, like last quest. The last line of Scene 2 must send <b>end scene 2</b>, so the Stage moves on to scene3. Put the blocks in order. The other character needs a when I receive [scene 2 line 2] script with its line.",
      where: "One character in Scene 2",
      change: "new",
      scaffold: "parsons",
      blocks: "when backdrop switches to [scene2 v]\nwait (2) seconds\nsay [Oh no! The map is gone!] for (2) seconds\nbroadcast (scene 2 line 2 v) and wait\nsay [We have to find it.] for (2) seconds\nbroadcast (end scene 2 v)",
      tip: "The wait at the top gives the entering character time to glide in first."
    },
    {
      title: "Build Scene 3 and the end",
      short: "Build Scene 3 yourself. End with a final line, a sound, and stop.",
      text: "Build Scene 3 on your own. When the backdrop switches to scene3, your characters solve the problem in 2 to 4 lines. After the last line, broadcast a new message <b>the end</b>. Something must receive it: play a happy sound and then stop the story. Other characters can also receive <b>the end</b> to cheer or change costume.<br>Blocks that help: when backdrop switches to, say for seconds, broadcast and wait, when I receive, play sound until done, stop all.",
      where: "The character who says the last line",
      change: "new",
      scaffold: "goal",
      blocks: "when backdrop switches to [scene3 v]\nsay [We found the map!] for (2) seconds\nbroadcast (scene 3 line 2 v) and wait\nsay [And that is how we saved the day!] for (3) seconds\nbroadcast (the end v) and wait\nstop [all v]\n\nwhen I receive [the end v]\nplay sound (Magic Spell v) until done",
      shots: ["sounds-tab"],
      tip: "Use play sound until done, not start sound, before stop all. Otherwise the story stops before you hear the sound. Pick any sound from the Sounds tab."
    },
    {
      title: "Watch twice, fix, share",
      short: "Watch the whole story two times in a row. Fix resets, then share.",
      text: "Click the green flag and watch the whole story. Then click it <b>again</b>. The second run shows reset bugs: a character still hidden, in the wrong place, or the wrong backdrop. Fix them, then save and share.",
      tip: "Character in the wrong place at the start? Add go to x: y: and show or hide to its green flag script. Story stuck on one scene? A message is received but never sent."
    }
  ],
  quiz: [
    {
      q: "This is the Dragon's code. The story goes scene1, then scene2, then scene3. When can you see the Dragon?",
      blocks: "when green flag clicked\nhide\n\nwhen backdrop switches to [scene3 v]\nshow",
      choices: ["In every scene", "Only in scene 1", "Never", "Only in scene 3"],
      answer: 3,
      explain: "It hides when the story starts and only shows when the backdrop switches to scene3."
    },
    {
      q: "This is on the Stage. No sprite ever broadcasts end scene 1. What happens?",
      blocks: "when green flag clicked\nswitch backdrop to (scene1 v)\n\nwhen I receive [end scene 1 v]\nswitch backdrop to (scene2 v)",
      choices: ["The story moves to scene2 after 2 seconds", "The story stays on scene1", "Scratch shows an error", "It skips to scene3"],
      answer: 1,
      explain: "A when I receive script waits for its message. If nobody sends it, the script never runs."
    }
  ],
  challenge: {
    title: "Title screen and credits",
    short: "Add a title screen before Scene 1 and a credits screen at the end.",
    text: "Add a backdrop named <b>title</b> with your story's name and the words Press space to start. Add a backdrop named <b>credits</b> that lists you as the director. On the green flag, show the title and wait until the space key is pressed, then go to scene1. Scene 1 must now start on when backdrop switches to scene1 instead of the green flag. At the end, show the credits.",
    answer: "when green flag clicked\nswitch backdrop to (title v)\nwait until <key (space v) pressed?>\nswitch backdrop to (scene1 v)\n\nwhen I receive [the end v]\nswitch backdrop to (credits v)"
  },
  checklist: [
    "Three backdrops named scene1, scene2, and scene3",
    "The story moves to each scene by itself",
    "Every character shows or hides on the green flag",
    "An ending with a last line and a sound",
    "It plays correctly two times in a row"
  ],
  submit: "Share your finished story with three scenes. Name your project anything you like (idea: \"The Lost Pizza Map\"). Paste the link.",
  teacherNotes: "Pacing (45 min): warmup 3, plan 6, backdrops 4, Stage director 5, send end scene 1 3, enter and exit 7, Scene 2 7, Scene 3 7, watch twice 3. Absent students start from the starter project.<br><b>Message map</b> (every received message is sent): end scene 1 is sent by the last Scene 1 line (step 4); end scene 2 by the last Scene 2 line (step 6); scene 2 line 2 and scene 3 line 2 are sent by the speaking character and received by the other one; the end is sent and received in step 7.<br><b>Common misconceptions</b>: thinking when I receive runs by itself; missing show on the green flag (characters stay hidden on the second run); using start sound before stop all (sound is cut off); switching backdrops in many sprites at once instead of letting the Stage direct. Note: switch backdrop to also triggers when backdrop switches to, even if it is the same backdrop.<br><b>Accommodations</b>: typing-heavy. Scenes 2 and 3 need only 2 lines each for students with writing goals; allow speech-to-text in a doc and copy and paste; the frame can be filled with single words. English learners may write lines in their home language. Students who struggle with the message map can draw arrows on paper from each broadcast to its when I receive."
};
