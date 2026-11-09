SQ_LESSONS.m1 = {
  title: "Bug Hunters & Code Readers",
  tagline: "Every coder makes bugs. Great coders can find them and read any code.",
  mission: "Find and fix bugs, then read code that someone else wrote.",
  minutes: "45",
  skill: "Debugging & Reading Code",
  goal: "By the end of this quest you will use four bug hunting strategies to fix four real bugs, and explain what a script in someone else's project does.",
  vocab: [
    { term: "Bug", def: "A mistake in code that makes the program do something you did not expect.", icon: "🐛" },
    { term: "Debugging", def: "Finding a bug and fixing it.", icon: "🔍" },
    { term: "Expected vs. actual", def: "What you wanted to happen, and what really happened. The difference is the bug.", icon: "⚖️" },
    { term: "Trace", def: "Read code one block at a time, the same way the computer runs it.", icon: "👣" },
    { term: "Test", def: "Run the program on purpose to check if it works.", icon: "🧪" }
  ],
  warmup: "Think of one bug you had in a project so far. What did you expect? What really happened? How did you fix it? Write one sentence, or tell a neighbor.",
  needs: [],
  steps: [
    {
      title: "The Bug Hunter's toolkit",
      short: "Write the four bug hunting strategies in your notes.",
      text: "Make a new project. Then write these four strategies in your notes. You will use them on every bug today.<br><b>1. Expected vs. actual:</b> say out loud what SHOULD happen and what DOES happen.<br><b>2. Trace:</b> read the script one block at a time, like the computer.<br><b>3. Test small:</b> click one script by itself and watch what it does.<br><b>4. Watch values:</b> check the box next to a variable so you can see it on the Stage while the project runs.",
      frame: "Strategy 1: Expected vs. actual means ___\nStrategy 2: Trace means ___\nStrategy 3: Test small means ___\nStrategy 4: Watch values means ___\nThe one I want to try first: ___",
      tip: "Name your project anything you like. One idea: Bug Hunt."
    },
    {
      title: "Bug #1: The frozen sprite (worked example)",
      short: "Build the buggy script, find the bug, and watch how we fix it.",
      text: "Build this buggy script on the cat sprite, exactly as you see it:<pre class=\"blocks\">when green flag clicked\nif &lt;key (right arrow v) pressed?&gt; then\nchange x by (10)\nend</pre>Click the green flag, then press the right arrow. The cat does not move!<br><b>Expected:</b> the cat moves every time I press the arrow. <b>Actual:</b> nothing happens.<br><b>Trace it:</b> the green flag is clicked. The <code>if</code> checks the key ONE time, right away. You were not pressing the key yet, so it skips the inside. Then the script is done. Nothing checks again.<br><b>Fix:</b> put the <code>if</code> inside a <code>forever</code> so the key is checked again and again. The fixed script is below.",
      where: "Cat sprite (Sprite1)",
      change: "replace",
      changeNote: "Fixes the buggy script you just built: drag a forever between the hat and the if.",
      scaffold: "full",
      blocks: "when green flag clicked\nforever\nif <key (right arrow v) pressed?> then\nchange x by (10)\nend\nend",
      tip: "Click the Stage first so Scratch hears your key presses."
    },
    {
      title: "Bug #2: The runaway score",
      short: "Build the score bug, then put the fixed blocks in order.",
      text: "Add the <b>Apple</b> sprite. Make a variable called <code>score</code> (For all sprites). On the cat, build this buggy script:<pre class=\"blocks\">when green flag clicked\nforever\nif &lt;touching (Apple v)?&gt; then\nchange [score v] by (1)\nend\nend</pre>Drag the cat onto the apple, then away. Click the green flag again. Watch the score.<br>This script has <b>TWO</b> bugs. Expected: the score starts at 0, and each touch gives 1 point. Actual: what do you see?<br>Fix both bugs. The fix uses one new block: <code>not</code>, the green block in <b>Operators</b>. <code>not &lt;touching Apple?&gt;</code> is true when the cat is NOT touching the apple.",
      where: "Cat sprite (Sprite1)",
      change: "replace",
      changeNote: "Replaces the buggy score script you built in this step.",
      scaffold: "parsons",
      blocks: "when green flag clicked\nset [score v] to (0)\nforever\nif <touching (Apple v)?> then\nchange [score v] by (1)\nwait until <not <touching (Apple v)?>>\nend\nend",
      shots: ["make-variable"],
      tip: "Use strategy 4: check the box next to score and watch it. How many times does the forever loop run while the cat sits on the apple?"
    },
    {
      title: "Bug #3: The missing hero",
      short: "Build the hide bug, then fix it without help.",
      text: "On the cat, build these two scripts:<pre class=\"blocks\">when [h v] key pressed\nhide\n\nwhen green flag clicked\ngo to x: (0) y: (0)\nsay [Here I am!] for (2) seconds</pre>Press <b>h</b>. Then click the green flag. The cat says \"Here I am!\" but you cannot see it!<br>Fix it so the cat is ALWAYS seen after you click the green flag, even if someone pressed h before.",
      where: "Cat sprite (Sprite1)",
      change: "add",
      changeNote: "Add to the green flag script from this step. Do not change the h key script.",
      scaffold: "goal",
      blocks: "when green flag clicked\nshow\ngo to x: (0) y: (0)\nsay [Here I am!] for (2) seconds",
      tip: "Trace it: what did the sprite do the LAST time the project ran? Does the green flag script undo that?"
    },
    {
      title: "Bug #4: The message that never arrives",
      short: "Build the message bug, then find out why the apple never talks.",
      text: "On the cat, build this script. Use <b>New message</b> and type <code>start game</code>:<pre class=\"blocks\">when green flag clicked\nsay [Ready?] for (2) seconds\nbroadcast (start game v)</pre>On the <b>Apple</b>, build this script. Use <b>New message</b> again and type the name with a typo: <code>start gmae</code>.<pre class=\"blocks\">when I receive [start gmae v]\nsay [Let's go!] for (2) seconds</pre>Click the green flag. The cat talks, but the apple never says \"Let's go!\". Find the bug and fix it.",
      where: "Apple sprite",
      change: "replace",
      changeNote: "Fixes the when I receive script on the Apple. Do not change the cat.",
      scaffold: "goal",
      blocks: "when I receive [start game v]\nsay [Let's go!] for (2) seconds",
      tip: "Test small: click the Apple script by itself. It works! So the problem is not inside it. Now read the message names on both scripts, letter by letter."
    },
    {
      title: "Code Reader",
      short: "Open a project from a different branch and explain one script.",
      text: "Good coders can read code they did not write. Open a classmate's shared project from a <b>different branch</b> than yours (Games, Stories, or Apps). Your teacher's class studio has them.<br>1. Click <b>See Inside</b>.<br>2. Pick ONE script with 4 to 10 blocks. Click each sprite to find one.<br>3. Trace it. Write what it does with the frame.<br>4. Predict: pick one number or word to change. Write what you think will happen.<br>5. Make the change and click the green flag. Were you right?<br>You do not need to save. Changes in See Inside are not saved unless you click <b>Remix</b>.",
      solo: "No classmate projects yet? Open your teacher's example project, or a Starter Project on the Scratch website: click <b>Ideas</b> at the top, then scroll to <b>Starter Projects</b>.",
      frame: "Project name: ___   Branch: ___\nSprite: ___\nThis script starts when ___.\nFirst it ___. Then it ___. Last it ___.\nI think the coder made it so that ___.\nMy prediction: if I change ___ to ___, then ___ will happen.\nWhat really happened: ___",
      tip: "See a block you do not know? Drag it out alone and click it to test it small. Then put it back."
    },
    {
      title: "Write a bug report",
      short: "Write about one bug you fixed in Notes and Credits.",
      text: "Click the green flag one more time and test all four fixes. Then click <b>Share</b>. On the project page, find the <b>Notes and Credits</b> box. Write a bug report about ONE bug you fixed today.",
      frame: "Bug: ___\nI expected ___.\nBut actually ___.\nThe strategy that helped me: ___.\nI fixed it by ___."
    },
    {
      title: "Bug swap",
      short: "Hide one bug in a copy of your project for a partner.",
      stretch: true,
      text: "Open your branch project. Click <b>File</b>, then <b>Save as a copy</b>, so your working project stays safe. In the copy, add ONE small bug: a wrong number, a missing reset, or a block in the wrong place. Swap computers with a partner who is also on this step. Find and fix their bug with the toolkit. Tell them which strategy helped.",
      solo: "No partner free? Open your teacher's Mystery Bug project. It has three hidden bugs. Find and fix as many as you can, and write which strategy helped for each one.",
      tip: "Keep it fair: only one small bug, and you must know how to fix it yourself."
    }
  ],
  quiz: [
    {
      q: "Trace this script. What happens when you click the green flag?",
      blocks: "when green flag clicked\nset [score v] to (0)\nwait until <(score) > (5)>\nsay [You win!]",
      choices: [
        "The sprite says You win! right away",
        "The sprite says You win! after 5 seconds",
        "The sprite never says anything",
        "The score goes up to 6"
      ],
      answer: 2,
      explain: "Nothing ever changes the score, so it stays 0. The wait until waits forever."
    },
    {
      q: "Trace this script. What will the sprite say?",
      blocks: "when green flag clicked\nset [lives v] to (3)\nchange [lives v] by (-1)\nif <(lives) = (3)> then\nsay [Full health!]\nelse\nsay [Ouch!]\nend",
      choices: [
        "Ouch!",
        "Full health!",
        "Both messages",
        "Nothing"
      ],
      answer: 0,
      explain: "Lives starts at 3, then changes by -1 to 2. 2 is not 3, so the else part runs."
    }
  ],
  challenge: {
    title: "Bug-proof countdown",
    short: "Build a countdown from ten that ends with Blast off.",
    text: "Make a variable called count. When the green flag is clicked, the sprite should say 10, then 9, then 8, and so on, one number each second, down to 1. Then it says Blast off! Test it two times in a row. Does it still start at 10 the second time? If not, you have a reset bug to fix.",
    answer: "when green flag clicked\nset [count v] to (10)\nrepeat (10)\nsay (count) for (1) seconds\nchange [count v] by (-1)\nend\nsay [Blast off!]"
  },
  checklist: [
    "All four bugs are fixed and I tested each one",
    "My score starts at 0 and adds only 1 point for each touch",
    "My Notes and Credits has a bug report: expected, actual, and fix",
    "I wrote what one script in someone else's project does"
  ],
  submit: "Share your bug project and paste the link. Name your project anything you like (idea: Bug Hunt).",
  teacherNotes: "Pacing: toolkit 4 min, Bug #1 5, Bug #2 8, Bug #3 4, Bug #4 6, Code Reader 10, bug report 5. Bug swap is a stretch. Before class: make a class studio where students add their fork-1 projects (for Code Reader), and make a 'Mystery Bug' project with 3 small bugs (for the solo option). Buggy scripts appear in the step text so students build the bug themselves; the fix is in the step blocks (Bug #1 is a worked example; Bugs #3 and #4 are hidden behind 'Stuck? Show me'). Misconceptions: (1) students think the if 'keeps watching' by itself; it checks once unless it is in a loop. (2) Bug #2: many fix the reset but not the repeat points; have them watch the score monitor while the cat sits on the apple. (3) In Bug #4 Scratch makes 'start gmae' a separate message, so nothing is 'broken' inside either script; the names just do not match. (4) In Code Reader, students describe what a script LOOKS like ('it has a forever') instead of what it DOES; push for 'when ___ happens, the sprite ___'. Accommodations: the frames can be answered out loud or typed as short phrases; students who need less reading can do Bugs #1-#3 plus Code Reader and skip Bug #4. ELLs can label each block of their chosen script with one word in their home language before writing. Pair a strong reader with a student for Code Reader if needed, but each writes their own frame."
};
