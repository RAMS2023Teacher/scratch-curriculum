SQ_LESSONS.f1 = {
  title: "Playtest & Polish",
  tagline: "Real creators test with real users. Get feedback and level up your project.",
  mission: "Test a project, get feedback, and polish your own project.",
  minutes: "45",
  skill: "Feedback & Iteration",
  goal: "By the end of this quest you will playtest a project, give kind and useful feedback, make a fix list, and polish your own project with a title screen, instructions, and credits.",
  vocab: [
    { term: "Playtest", def: "Someone uses your project while you watch and learn.", icon: "🎮" },
    { term: "Glow", def: "Feedback about something that works really well.", icon: "🌟" },
    { term: "Grow", def: "Kind, specific feedback about something that could be better.", icon: "🌱" },
    { term: "Iterate", def: "Make a change, test it, and repeat.", icon: "🔁" },
    { term: "Credits", def: "Saying who made the art, sounds, or ideas you used.", icon: "🙏" }
  ],
  warmup: "Read these two comments: \"This is bad.\" and \"The jump was hard to time. Maybe make it a little higher?\" Which one helps the creator more? Why? Think alone or talk with a neighbor.",
  needs: [],
  starter: {
    name: "Polish Starter",
    contains: "A finished catch game from the teacher: a Cat player that moves with the arrow keys, an Apple that falls from the top, a score variable, and green flag scripts that reset everything (score to 0, positions, costumes). It has NO title screen, NO instructions, and one small bug (the Apple sometimes starts too low). Students who missed a project can polish this one."
  },
  steps: [
    {
      title: "Pick your project",
      short: "Pick your best project. Make sure it is saved and shared.",
      text: "Choose your best project so far (from either branch project). Open it, click the green flag, and play it once. Then click <b>Share</b> so other people can open it. If you do not have a finished project, open the teacher's <b>Polish Starter</b> instead.",
      tip: "Pick a project that works from the green flag. You will polish it today, not start over."
    },
    {
      title: "Silent playtest",
      short: "Watch someone use your project. Do not talk or help.",
      text: "Swap seats with a partner who is also ready. They use your project for 5 minutes <b>without you explaining anything</b>. You watch quietly and take notes:<br>• Where did they get stuck or confused?<br>• What made them smile?<br>Then switch: you test their project in silence.",
      tip: "Creators: NO helping! If the tester is stuck, that is useful information. Write it down.",
      solo: "No partner free? Pick one: <b>1.</b> Ask your teacher to try it while you watch. <b>2.</b> Record a short screen video of yourself playing, then watch it. <b>3.</b> Test it yourself as if you have never seen it: click the full screen button, keep your eyes on the Stage only, and answer these: Do I know what to do in the first 5 seconds? Do I know which keys to press? Do I know how to win or finish? Does it start the same way every time I click the green flag? Write down every time you feel confused.",
      frame: "Playtest notes\nThe tester got stuck when ...\nThe tester smiled when ...\nThe tester did not know ..."
    },
    {
      title: "Glow & Grow",
      short: "Write two Glows and one Grow. Say what and why.",
      text: "Testers write 2 <b>Glows</b> (things that work well) and 1 <b>Grow</b> (one thing that could be better) for the creator. Be specific: say <b>what</b> happened and <b>why</b> it matters. A Grow is kind: it gives an idea, not just a problem. Give your notes to the creator.",
      tip: "\"It's good\" does not help. \"I liked how the score went up with a sound\" helps a lot.",
      solo: "If you tested alone or your teacher tested it, write the Glows and the Grow for your own project, using your playtest notes. You can also ask your teacher for one Grow.",
      frame: "Glow 1: I really liked how ... because ...\nGlow 2: It was fun when ... because ...\nGrow: I was confused when ... Maybe you could ..."
    },
    {
      title: "Make a fix list",
      short: "Write three fixes in order, biggest problem first.",
      text: "Read your feedback and your notes. Write a fix list of 3 things, in this order:<br><b>1. Biggest problem</b>: something broken or very confusing.<br><b>2. Easier to understand</b>: something that helps a new user.<br><b>3. Cooler</b>: something that makes it more fun.<br>Fix number 1 first.",
      tip: "Keep each fix small. \"Add 5 new levels\" is too big for today. \"Make the jump higher\" is just right.",
      frame: "My fix list\n1. Biggest problem: ... I will fix it by ...\n2. Easier to understand: ... I will fix it by ...\n3. Cooler: ... I will fix it by ..."
    },
    {
      title: "Make a Title sprite",
      short: "Paint a Title sprite that shows at start and hides when space is pressed.",
      text: "A polished project starts with a title. We will use a simple, safe way: a <b>Title</b> sprite that covers the Stage.<br>1. Hover over Choose a Sprite and click <b>Paint</b>. Name the sprite <b>Title</b>.<br>2. In the Costumes tab, draw a big rectangle that covers the Stage. Use the Text tool to write your project's name and \"Press SPACE to start\".<br>3. Add this script to the Title sprite.<br>You do NOT change any of your old green flag scripts. They still reset everything like before.",
      where: "Title sprite",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\ngo to x: (0) y: (0)\ngo to [front v] layer\nshow\nwait until <key (space v) pressed?>\nhide",
      shots: ["choose-sprite", "costumes-tab"],
      tip: "If your project already uses the space key (for example, to jump), pick a different key like s. Use the same key here and in the next step."
    },
    {
      title: "Wait for the start key",
      short: "Make your main scripts wait until the start key is pressed.",
      text: "Right now your game might start moving behind the title. Fix that: in each green flag script that <b>moves things or starts a timer</b>, keep the reset blocks at the top (set score to 0, go to x and y, switch costume). Right <b>after</b> the reset blocks, before the forever or repeat loop, add a block that waits until the start key is pressed. Use the same key as your Title sprite. Look in the Control category.",
      where: "Your main sprite (and any other sprite or the Stage with a moving green flag script)",
      change: "add",
      changeNote: "In each green flag script that moves things: add one block after the reset blocks, just above the forever or repeat loop.",
      scaffold: "goal",
      blocks: "when green flag clicked\nset [score v] to (0)\ngo to x: (0) y: (-150)\nwait until <key (space v) pressed?>\nforever\nif <key (right arrow v) pressed?> then\nchange x by (10)\nend\nif <key (left arrow v) pressed?> then\nchange x by (-10)\nend\nend",
      tip: "Put the wait AFTER the reset blocks, not before. Then everything resets on the green flag even while the title is showing. Story or app? Add it before your first say or scene block."
    },
    {
      title: "Instructions and credits",
      short: "Write instructions and credits on your project page.",
      text: "Click <b>See Project Page</b>. Fill in two boxes:<br>• <b>Instructions</b>: how to play or use it, and which keys or buttons to press.<br>• <b>Notes and Credits</b>: who made it, who tested it, and credit for any art, sounds, music, or ideas you did not make yourself. If you remixed a project or followed a tutorial, say so.<br>Giving credit is honest and kind. It is a rule of the Scratch community.",
      tip: "Use your first name only. Never put your last name, school, or address online.",
      frame: "Instructions:\nYour goal is to ...\nPress ... to ...\nYou win (or finish) when ...\n\nNotes and Credits:\nMade by (first name) ...\nTested by ...\nThe ... sound is from the Scratch library.\nThe idea for ... came from ..."
    },
    {
      title: "Fix, retest, share",
      short: "Fix your list, test again, then save and share.",
      text: "Fix as many items on your fix list as you can, starting with number 1. After each fix, click the green flag and test. Then ask your tester to try the new version. Save and share.",
      tip: "Test from the green flag after every fix. One fix can sometimes break something else.",
      solo: "If your tester is busy, retest it yourself with the same \"never seen it\" checklist from the Silent playtest step, or ask your teacher for a quick look."
    }
  ],
  quiz: [
    {
      q: "You click the green flag but do NOT press any key. What do you see?",
      blocks: "when green flag clicked\ngo to x: (0) y: (0)\ngo to [front v] layer\nshow\nwait until <key (space v) pressed?>\nhide",
      choices: [
        "The Title sprite shows and hides right away",
        "The Title sprite stays on the Stage until space is pressed",
        "Nothing shows at all",
        "The Title sprite hides and never comes back"
      ],
      answer: 1,
      explain: "The script stops at wait until. It only goes on to hide when space is pressed."
    },
    {
      q: "Which is the most helpful Grow feedback?",
      choices: [
        "It's boring.",
        "Make it better.",
        "I did not know which key jumps. Maybe add it to the title screen.",
        "I like it."
      ],
      answer: 2,
      explain: "Helpful feedback is specific and kind, and it gives an idea to make the project better."
    }
  ],
  challenge: {
    title: "Fancy exit",
    short: "Make the title glide up off the Stage when the start key is pressed.",
    text: "Change your Title sprite so that when the start key is pressed, the title glides up and off the top of the Stage in 1 second, then hides. It must come back to the middle and show again every time you click the green flag.",
    answer: "when green flag clicked\ngo to x: (0) y: (0)\ngo to [front v] layer\nshow\nwait until <key (space v) pressed?>\nglide (1) secs to x: (0) y: (360)\nhide"
  },
  checklist: [
    "My project has a fix list with 3 fixes, and fix number 1 is done.",
    "My project has a Title sprite that hides when the start key is pressed.",
    "My project still resets correctly every time I click the green flag.",
    "My project page has Instructions and Notes and Credits filled in."
  ],
  submit: "Save and share your polished project and paste the link. Put your fix list in Notes and Credits. Name your project anything you like (idea: add \"Polished\" to the old name).",
  teacherNotes: "PACING: warm-up 3 min, pick project 3, silent playtest 10 (5 each way), Glow and Grow 5, fix list 4, Title sprite 6, wait step 5, instructions 4, fix and retest in the time left. Model a silent playtest and Glow and Grow with a teacher project first (2 min). Pair students across branch types when possible; fresh eyes find more. Because students are self-paced, keep a \"ready to playtest\" spot on the board: students write their name there and pair with the next name. If nobody is there, they use the solo checklist, a screen video, or you.\nWHY THIS TITLE SCREEN: we do NOT ask students to re-wire every green flag script to a new broadcast. That refactor often breaks resets. The Title sprite plus one wait until block after the resets is safe: resets still run on the green flag. Projects that already use space can use another key.\nMISCONCEPTIONS: (1) Putting wait until above the reset blocks, so old positions show behind the title; it still works but resets late. (2) Forgetting the Title sprite needs go to front layer, so it hides behind other sprites. (3) Stories with \"when this sprite clicked\" scripts can still be clicked under the title; that is fine. (4) Grows that are only complaints; point to the frame.\nACCOMMODATIONS: all writing has sentence frames; students may dictate feedback or fix lists to you or use speech-to-text. The silent playtest can be done as a teacher test or a screen video for students who find partner work stressful. Students with fine motor needs can type the title with the Text tool on a plain colored rectangle; no drawing needed."
};
