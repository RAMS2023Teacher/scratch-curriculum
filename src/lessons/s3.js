SQ_LESSONS.s3 = {
  title: "Choose Your Path",
  tagline: "Your reader is the hero, and the reader decides what happens next.",
  mission: "Write a story where the reader chooses what happens next.",
  minutes: "45",
  skill: "Branching Stories and Choices",
  goal: "By the end of this quest you will plan a story map, use a scene variable and choice buttons, and use broadcasts to send the story down different paths to at least three endings.",
  vocab: [
    { term: "Branching story", def: "A story that splits into different paths based on the reader's choices.", icon: "🌳" },
    { term: "Story map", def: "A drawing of every scene and the choices that connect them.", icon: "🗺️" },
    { term: "Choice point", def: "A moment where the reader picks what happens next.", icon: "🔀" },
    { term: "Ending", def: "One way the story can finish. Branching stories have more than one.", icon: "🏁" },
    { term: "scene variable", def: "A variable that remembers which scene the story is in right now.", icon: "📍" }
  ],
  warmup: "You find a strange door in the school library. Choice A: open it. Choice B: go get help. What happens next for each choice? Think alone or tell a neighbor.",
  needs: ["textStrings", "askAnswer"],
  project: { name: "Interactive Adventure", part: "Part 1 of 2" },
  steps: [
    {
      title: "Draw your story map",
      short: "Plan a small story map with two choices and three endings.",
      text: "On paper or in a doc, draw a box for each scene and an arrow for each choice. Keep it small: <b>5 to 7 scenes</b>, at least <b>2 choice points</b>, and at least <b>3 endings</b>. Give every box a short one-word name, like <b>cave</b>. You will use these exact names for backdrops and messages.<br>Example map: <b>start</b>: A goes to <b>cave</b>, B goes to <b>forest</b> (an ending). <b>cave</b>: A goes to <b>treasure</b> (an ending), B goes to <b>home</b> (an ending).",
      frame: "START scene name: ____\n  What happens: ____\n  Choice A: ____  goes to scene ____\n  Choice B: ____  goes to scene ____\n\nScene name: ____\n  What happens: ____\n  Choice A: ____  goes to scene ____\n  Choice B: ____  goes to scene ____\n\nEnding 1 name: ____  What happens: ____\nEnding 2 name: ____  What happens: ____\nEnding 3 name: ____  What happens: ____",
      tip: "Story maps grow very fast. Two choices in every scene means many scenes. Let some choices go straight to an ending."
    },
    {
      title: "Set up the scenes",
      short: "Start a new project. Add one backdrop for each box on your map.",
      text: "Start a new project. Click the Stage, open the <b>Backdrops</b> tab, and add one backdrop for each box on your map. Rename each backdrop to match your map exactly, like <b>start</b>, <b>cave</b>, <b>forest</b>. Add one sprite to be the <b>Narrator</b> and rename it.",
      shots: ["select-stage", "backdrops", "choose-sprite"],
      tip: "Use the same names everywhere: backdrop, message, and scene variable. cave and Cave will match, but cave and the cave will not."
    },
    {
      title: "Choice buttons and the scene variable",
      short: "Paint a Choice A button. Make a scene variable for all sprites.",
      text: "Paint a new sprite: a rounded rectangle with the letter <b>A</b> on it. Name it <b>Choice A</b>. Make a variable named <b>scene</b> (For all sprites), so every sprite knows where the story is. Add this code so the button hides until a choice point. Then right-click Choice A and pick <b>duplicate</b>. Rename the copy <b>Choice B</b> and change its letter.",
      where: "Choice A (then duplicate it to make Choice B)",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nhide\n\nwhen I receive [show choices v]\nshow\n\nwhen I receive [hide choices v]\nhide",
      shots: ["choose-sprite", "make-variable"],
      tip: "Variables can hold words, not just numbers. The scene variable will hold names like start or cave. Uncheck its box if you do not want it on the Stage."
    },
    {
      title: "The opening scene",
      short: "Make the Narrator tell the opening and show the choices.",
      text: "On the green flag, the Narrator goes to the start backdrop, sets <b>scene</b> to <b>start</b>, tells the opening, and shows the buttons. The say block here has <b>no seconds</b>, so the words stay on screen while the reader decides.",
      where: "Narrator",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nswitch backdrop to (start v)\nset [scene v] to [start]\nsay [You find a glowing door. A: open it. B: walk into the forest.]\nbroadcast (show choices v)",
      tip: "Type start into the set block exactly as you named it. The buttons will compare against these words."
    },
    {
      title: "Wire the buttons",
      short: "Make Choice A check the scene and send the right message.",
      text: "One button is used at every choice point, so it must check which scene it is in. Put the blocks together on <b>Choice A</b>. Then build the same kind of script on <b>Choice B</b>, with B's messages from your map (in the example: start goes to forest, cave goes to home).",
      where: "Choice A",
      change: "new",
      scaffold: "parsons",
      blocks: "when this sprite clicked\nbroadcast (hide choices v)\nif <(scene) = [start]> then\nbroadcast (go cave v)\nend\nif <(scene) = [cave]> then\nbroadcast (go treasure v)\nend",
      tip: "Use plain broadcast here, not broadcast and wait. With and wait, the scene changes to cave before the second if checks, and the story jumps two scenes."
    },
    {
      title: "Build each path",
      short: "For each message, switch the backdrop, set scene, and tell that part.",
      text: "Now build every scene on your map on the Narrator. For each go message: switch to that backdrop, set <b>scene</b> to its name, and say what happens. A scene with a choice ends by showing the choices. An ending does <b>not</b> show the choices: it says THE END instead.<br>Blocks that help: when I receive, switch backdrop to, set scene to, say, broadcast.",
      where: "Narrator",
      change: "new",
      scaffold: "goal",
      blocks: "when I receive [go cave v]\nswitch backdrop to (cave v)\nset [scene v] to [cave]\nsay [It is dark. You hear a growl. A: light a torch. B: run home.]\nbroadcast (show choices v)\n\nwhen I receive [go treasure v]\nswitch backdrop to (treasure v)\nset [scene v] to [treasure]\nsay [You found the treasure! THE END]",
      tip: "Build one scene, test it, then build the next. Every message a button sends needs one when I receive script on the Narrator."
    },
    {
      title: "Test every path",
      short: "Play the story once for each ending. Fix any path that gets stuck.",
      text: "Click the green flag and play until you reach an ending. Do it again for <b>every</b> ending on your map. Also click the green flag in the middle of a story: it should go back to the start with the buttons hidden. Write down each test. Save and share.",
      frame: "Path: start, then ____, then ____\nEnding I reached: ____\nDid it work? yes / no\nWhat went wrong: ____\nHow I fixed it: ____",
      tip: "A button that does nothing usually means the scene name in the if block does not match the set block. = ignores capital letters, but not extra spaces: cave with a space at the end is not cave."
    }
  ],
  quiz: [
    {
      q: "The scene variable is cave. The reader clicks Choice A. Which message does it send?",
      blocks: "when this sprite clicked\nbroadcast (hide choices v)\nif <(scene) = [start]> then\nbroadcast (go cave v)\nend\nif <(scene) = [cave]> then\nbroadcast (go treasure v)\nend",
      choices: ["go cave", "go treasure", "Both go cave and go treasure", "No go message at all"],
      answer: 1,
      explain: "scene is cave, so the first if is false and the second if is true. It sends hide choices and go treasure."
    },
    {
      q: "Your map has 3 choice points with 2 choices each, and every path splits. What keeps the story small enough to finish?",
      choices: ["Add more choices to each scene", "Use only one backdrop for everything", "Delete the story map", "Let some choices go straight to an ending or join another path"],
      answer: 3,
      explain: "Paths that end early or join together keep the number of scenes small."
    }
  ],
  challenge: {
    title: "Typed password",
    short: "At one choice point, the reader types a password instead of clicking.",
    text: "Add a scene where a guard asks the reader for a password. Do not show the buttons in this scene. If the reader types the right password, go to one scene. Any other answer goes to a different scene. Use ask and wait and the answer block from Sensing. Test the right password, a wrong one, and the right one in capital letters.",
    answer: "when I receive [go gate v]\nswitch backdrop to (gate v)\nset [scene v] to [gate]\nask [The guard says: What is the password?] and wait\nif <(answer) = [dragonfruit]> then\nbroadcast (go castle v)\nelse\nbroadcast (go dungeon v)\nend"
  },
  checklist: [
    "A story map with at least 3 endings",
    "At least 2 choice points with buttons that show and hide",
    "Every button click goes to the right scene",
    "Every path reaches an ending, and I tested each one",
    "The green flag always starts the story from the beginning"
  ],
  submit: "Share your adventure with at least 2 choice points and 3 endings. Name your project anything you like (idea: \"The Glowing Door\"). Paste the link. Next quest you will add sound and mood.",
  teacherNotes: "Pacing (45 min): warmup 3, story map 8, backdrops 5, buttons 5, opening 4, wire buttons 6, build paths 10, test 4. Students who need more time can finish paths at the start of s4.<br>Students arrive from Games, Stories, or Apps at fork 1, plus m1 and m2. Games students may not have used variables to hold words (textStrings primer). The challenge uses ask and answer, so Games and Stories students see the askAnswer primer.<br><b>Common misconceptions</b>: the same button means different things in different scenes (that is why it checks scene); using broadcast and wait in the button, which makes the story jump two scenes; a misspelled scene name in set vs. if; forgetting that an ending must not show the buttons; a say block with seconds makes the question disappear before the reader picks.<br><b>Accommodations</b>: writing-heavy. Each scene needs only one sentence plus the choices. Students may use the example map (start, cave, forest, treasure, home) and only write their own sentences. Allow speech-to-text in a doc for scene text, then copy and paste. For IEP writing goals, 1 choice point and 2 endings is a fair core. English learners may write scene text in their home language. Keep the paper map on the desk: it is the best debugging tool for this lesson."
};
