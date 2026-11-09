SQ_LESSONS.a4 = {
  title: "Drawing Tools",
  tagline: "Turn your app into a creative studio with a sketch mode.",
  mission: "Add a sketch mode and mode buttons to your Super App.",
  minutes: "45",
  skill: "Pen Tools & App Modes",
  goal: "By the end of this quest you will add mode buttons to your Super App, make your flashcards start from the Study button, and build a sketch mode with a brush and color tools.",
  vocab: [
    { term: "Mode", def: "One part of an app, like study mode or sketch mode.", icon: "🔀" },
    { term: "Tool", def: "A button that changes what the user can do, like picking a color.", icon: "🧰" },
    { term: "Pen", def: "Blocks that let a sprite draw lines on the Stage as it moves.", icon: "🖊️" },
    { term: "Broadcast", def: "A message one sprite sends so other sprites know to start.", icon: "📣" }
  ],
  warmup: "What tools does every drawing app have? List as many as you can in 1 minute. Circle the 3 most important. Do this alone or with a neighbor.",
  needs: ["askAnswer", "join"],
  starter: {
    name: "Super App (from List Master)",
    contains: "A Host sprite with the green flag flashcard script (card variable, questions and answers lists For all sprites with 5 cards each, review list), and an Add Card button sprite."
  },
  project: { name: "Super App", part: "Part 2 of 2" },
  steps: [
    {
      title: "Get ready",
      short: "Open your Super App, add the Pen, and add three new sprites.",
      text: "Open your Super App from the last quest. Click the <b>Add Extension</b> button at the bottom-left and choose <b>Pen</b>.<br>Paint three new sprites:<br>1. <b>Study</b> button (a small rectangle with the word Study).<br>2. <b>Sketch</b> button (the same, with the word Sketch).<br>3. <b>Brush</b> (a small dot).<br>Put the two mode buttons in a strip along the top of the Stage. Make sure the backdrop is white, so the eraser will match later.",
      shots: ["extensions", "choose-sprite"],
      tip: "Missed the last quest? Ask your teacher for the Super App starter project and begin here."
    },
    {
      title: "Mode buttons",
      short: "Make the Study button send study mode when it is clicked.",
      text: "Each mode button sends a message. The sprites that belong to that mode will listen for it. Build this on the Study button. Use <b>New message</b> and type <code>study mode</code>.<br>Then build the same script on the Sketch button, but choose <b>New message</b> and type <code>sketch mode</code>.",
      where: "Study button (then the Sketch button)",
      change: "new",
      scaffold: "full",
      blocks: "when this sprite clicked\nbroadcast (study mode v)",
      tip: "Message names must match exactly. A typo makes a different message, and nothing will listen to it."
    },
    {
      title: "Flashcards start from Study",
      short: "Change your flashcard script so it starts when study mode arrives.",
      text: "Right now your flashcards start on the green flag. Now they should start when someone clicks Study.<br>1. On the Host, drag the <code>when green flag clicked</code> hat off the top of your flashcard script. Put <code>when I receive [study mode]</code> on top instead, and add <code>show</code> under it. Everything else stays the same.<br>2. Add a short green flag script so the Host hides until a mode is picked.<br>3. Add a sketch mode script. <code>stop [other scripts in sprite]</code> stops the flashcard loop, so the Host does not keep asking while you draw.",
      where: "Host sprite",
      change: "replace",
      changeNote: "Changes your List Master flashcard script: only the hat changes, plus one show block. The two short scripts at the bottom are new.",
      scaffold: "full",
      blocks: "when I receive [study mode v]\nshow\nhide list [questions v]\nhide list [answers v]\ndelete all of [review v]\nhide list [review v]\nset [card v] to (1)\nrepeat (length of [questions v])\nask (item (card) of [questions v]) and wait\nif <(answer) = (item (card) of [answers v])> then\nsay [Correct!] for (1) seconds\nelse\nsay (join [It was: ] (item (card) of [answers v])) for (2) seconds\nadd (item (card) of [questions v]) to [review v]\nend\nchange [card v] by (1)\nend\nshow list [review v]\n\nwhen green flag clicked\nhide\n\nwhen I receive [sketch mode v]\nstop [other scripts in sprite v]\nhide",
      tip: "If you forget to remove the green flag hat, the flashcards start right away, before anyone clicks Study."
    },
    {
      title: "Draw with the mouse",
      short: "Make the brush follow the mouse and draw while the mouse is down.",
      text: "When sketch mode starts, the Brush shows and follows the mouse forever. If the mouse button is down, the pen is down. If not, the pen is up. Put the blocks in order on the Brush.",
      where: "Brush",
      change: "new",
      scaffold: "parsons",
      blocks: "when I receive [sketch mode v]\nshow\nforever\ngo to (mouse-pointer v)\nif <mouse down?> then\npen down\nelse\npen up\nend\nend",
      tip: "Pen lines are drawn behind all sprites, so your buttons always stay on top of the drawing."
    },
    {
      title: "Stop drawing in study mode",
      short: "Make the brush stop, lift the pen, and hide when study mode starts.",
      text: "Click Sketch, then Study. The brush still follows the mouse and draws! Fix it, using what you did on the Host in step 3.<br>Make TWO scripts on the Brush:<br>1. When <b>study mode</b> arrives: stop the drawing loop, lift the pen, and hide.<br>2. When the <b>green flag</b> is clicked: lift the pen, hide, clear the drawing, and set the pen color and size to a starting value.<br>Helpful blocks are in <b>Events</b>, <b>Control</b>, <b>Looks</b>, and <b>Pen</b>.",
      where: "Brush",
      change: "new",
      scaffold: "goal",
      blocks: "when I receive [study mode v]\nstop [other scripts in sprite v]\npen up\nhide\n\nwhen green flag clicked\npen up\nhide\nerase all\nset pen color to [#000000]\nset pen size to (3)",
      tip: "Test it: click Sketch, draw, click Study, move the mouse. Nothing should draw now."
    },
    {
      title: "Color buttons",
      short: "Make color buttons that send a message to change the brush color.",
      text: "Only the Brush can change its own pen color, so each color button sends a message to the Brush.<br>Paint a small red square sprite called <b>Red</b>. Its script sends <code>pick red</code>. On the Brush, add a script that sets the pen color when <code>pick red</code> arrives. Click the color circle in the set pen color block to choose red.<br>Then duplicate the Red button to make more colors. Change the message and the color for each one.",
      where: "Red button, then the Brush",
      change: "new",
      scaffold: "parsons",
      blocks: "when this sprite clicked\nbroadcast (pick red v)\n\nwhen I receive [pick red v]\nset pen color to [#ff0000]",
      shots: ["choose-sprite"],
      tip: "The first script goes on the Red button. The when I receive script goes on the Brush."
    },
    {
      title: "Every sprite in its mode",
      short: "Show each button only in its own mode, then test switching modes.",
      text: "Right now the color buttons show in study mode, and the Add Card button shows while you draw. Fix it:<br>1. Each color button shows on <b>sketch mode</b> and hides on <b>study mode</b> and on the <b>green flag</b>.<br>2. The Add Card button shows on <b>study mode</b> and hides on <b>sketch mode</b> and on the <b>green flag</b>.<br>Then test: click the green flag, then switch between Study and Sketch three times. Only the right sprites should show each time.",
      where: "Each color button (and the Add Card button)",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\nhide\n\nwhen I receive [sketch mode v]\nshow\n\nwhen I receive [study mode v]\nhide",
      tip: "Make the three scripts on the Red button first. Then drag each script onto another color button to copy it there."
    },
    {
      title: "Eraser, Clear, and brush size",
      short: "Add an eraser, a clear button, and keys for brush size.",
      stretch: true,
      text: "An eraser is a pen with the same color as the background. Add an <b>Eraser</b> button that sends <code>eraser</code> and a <b>Clear</b> button that sends <code>clear</code>. On the Brush: eraser makes the pen white and big; clear erases everything. Use the up and down arrow keys to make the brush bigger and smaller.",
      where: "Brush",
      change: "new",
      scaffold: "goal",
      blocks: "when I receive [eraser v]\nset pen color to [#ffffff]\nset pen size to (20)\n\nwhen I receive [clear v]\nerase all\n\nwhen [up arrow v] key pressed\nchange pen size by (2)\n\nwhen [down arrow v] key pressed\nchange pen size by (-2)",
      tip: "Eraser leaves white marks? Your backdrop is not white. Use a white backdrop for sketch mode."
    }
  ],
  quiz: [
    {
      q: "Someone clicks Sketch, holds the mouse down, and moves it around. Trace this Brush script. What happens?",
      blocks: "when I receive [sketch mode v]\nshow\ngo to (mouse-pointer v)\nif <mouse down?> then\npen down\nend",
      choices: [
        "The brush draws lines everywhere the mouse goes",
        "The brush jumps to the mouse one time and then stops following it",
        "The brush draws only red lines",
        "Nothing shows at all"
      ],
      answer: 1,
      explain: "There is no forever loop, so go to and the if run only once."
    },
    {
      q: "Why does the Host use stop other scripts in sprite when sketch mode arrives?",
      choices: [
        "To erase the drawing",
        "To change the pen color",
        "To delete the lists",
        "So the flashcard loop stops asking questions while you draw"
      ],
      answer: 3,
      explain: "The flashcard repeat loop is still running. Stopping it ends the questions until Study is clicked again."
    }
  ],
  challenge: {
    title: "Stamp tool",
    short: "Add a Stamp button that stamps a star where you click.",
    text: "Add a Stamp button. After it is clicked, each mouse click puts ONE star picture on the drawing where the mouse is. Holding the mouse down must not make a long line of stars. Clicking Sketch again goes back to normal drawing. Hint: the Pen extension has a stamp block, and the Brush can have a star costume.",
    answer: "when this sprite clicked\nbroadcast (stamp mode v)\n\nwhen I receive [stamp mode v]\nstop [other scripts in sprite v]\npen up\nswitch costume to (star v)\nforever\ngo to (mouse-pointer v)\nif <mouse down?> then\nstamp\nwait until <not <mouse down?>>\nend\nend"
  },
  checklist: [
    "My app has a Study button and a Sketch button",
    "My flashcards start when I click Study, not on the green flag",
    "In sketch mode I can draw with the mouse and pick a color",
    "Each sprite shows only in its own mode"
  ],
  submit: "Draw a picture in sketch mode, then share your finished Super App and paste the link. Name your project anything you like (idea: Super App).",
  teacherNotes: "Pacing: get ready 6 min, mode buttons 4, flashcards from Study 7, draw 6, stop drawing goal 7, color buttons 7, modes goal 8. Eraser/Clear/size is a stretch. Have the Super App starter (end of a3) ready for absent students. Misconceptions: (1) students leave the green flag hat on the flashcard script, so study mode starts at once; only the hat changes. (2) A hidden sprite's forever loop keeps running; hide does not stop scripts. That is why both the Host and the Brush use stop other scripts in sprite. (3) Students try to set pen color on the color button itself; pen settings belong to the sprite that draws. (4) Message typos create a second message. If an ask box is still on screen after switching to sketch mode, clicking the green flag resets it. Accommodations: step 7 can be done for just ONE color button plus Add Card; students who need fewer steps can use only the Red button. The 'Stuck? Show me' solutions are fine to use on goal steps for students with IEP reading or writing goals. Students with motor needs can draw with arrow keys instead of the mouse (change the brush to move with key presses)."
};
