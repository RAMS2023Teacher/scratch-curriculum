SQ_LESSONS.f3 = {
  title: "Showcase Day",
  tagline: "The final quest: show what you built, and prove what you can do.",
  mission: "Finish your capstone, share it, reflect, and solve one mystery mission.",
  minutes: "45",
  skill: "Presenting, Reflecting & Transfer",
  goal: "By the end of this quest you will finish and share your capstone, pitch it in one minute, give kind and specific comments, reflect on how you grew, and build a brand-new mini project on your own.",
  vocab: [
    { term: "Showcase", def: "An event where creators share their finished work.", icon: "🎪" },
    { term: "Pitch", def: "A short talk that tells people what your project is and why it is cool.", icon: "🎤" },
    { term: "Gallery walk", def: "Everyone tries projects, like visiting a museum.", icon: "🖼️" },
    { term: "Netiquette", def: "Being kind, safe, and respectful when you post online.", icon: "💬" },
    { term: "Reflection", def: "Thinking about what you learned and how you grew.", icon: "🪞" }
  ],
  warmup: "Think back to your first quest, when you made your first sprite move. What can you do now that you could not do then? Write down three things, alone or with a neighbor.",
  needs: [],
  starter: {
    name: "Capstone Skeleton",
    contains: "For absent students: the same skeleton as Capstone Build (a Player that moves with the arrow keys, a Title sprite, score and time variables, two level backdrops). A student who missed Capstone Build adds one feature to it and showcases that."
  },
  steps: [
    {
      title: "Final fixes",
      short: "Fix last bugs and play your capstone from start to finish.",
      text: "Open your capstone. You have about 8 minutes. Fix the biggest bug first. Then play it start to finish. Click the green flag 2 times in a row: does it start the same way both times? Do not add new features today. Finish what you have.",
      tip: "If a feature still does not work, hide it or remove it. A small project that works is better than a big one that breaks."
    },
    {
      title: "Project page",
      short: "Write instructions and credits on your project page.",
      text: "Click <b>See Project Page</b> and fill in:<br>• <b>Instructions</b>: how to play or use it, which keys or buttons.<br>• <b>Notes and Credits</b>: your first name, the skills you used, who tested it, and credit for any art, sounds, or ideas you did not make.<br>• <b>Thumbnail</b>: the picture on the Stage when you save becomes the thumbnail, so save on a cool screen.<br>Then click <b>Share</b> and add the project to the class studio your teacher made.",
      tip: "First name only. Never post your last name, school, or address.",
      frame: "Instructions:\nYour goal is to ...\nPress ... to ...\n\nNotes and Credits:\nMade by ...\nSkills I used: ...\nTested by ...\nThe ... is from ..."
    },
    {
      title: "Plan your pitch",
      short: "Plan a one minute pitch about your project.",
      text: "Get ready to present. A pitch is short: about <b>1 minute</b>. Fill in the frame. Pick one script to show, the one you are most proud of. Practice once, quietly, with a timer.",
      tip: "One minute is about 4 or 5 sentences. You do not need to explain every block.",
      frame: "My project is called ... It is a ... where ...\nTo use it, you ...\nThe coolest part of my code is ... (show the script)\nOne problem I had was ... I fixed it by ..."
    },
    {
      title: "Present",
      short: "Present your pitch and show your favorite script.",
      text: "Present your 1-minute pitch to your small group or the class. Show your project on the Stage and your favorite script. Listeners: look at the speaker, and save questions for the end.<br>Feeling nervous? You can choose another way. Any way counts the same.",
      tip: "Read from your frame if you want to. That is allowed.",
      solo: "If talking to a group feels too hard, pick one: <b>1.</b> Present only to your teacher. <b>2.</b> Record a short screen video of your project while you read your pitch, and share it with your teacher. <b>3.</b> Type your pitch into Notes and Credits so people can read it."
    },
    {
      title: "Gallery walk",
      short: "Try four projects and leave a kind, specific comment on each.",
      text: "Put your project in full screen. Walk around (or open the class studio) and try at least <b>4 classmates' projects</b>. Try different kinds: a game, a story, and an app. For each one, leave a comment in the <b>Scratch class studio</b> that is <b>kind</b> and <b>specific</b>.<br><b>Netiquette rules:</b> say what you liked and why; give ideas, not insults; never post personal information; if you see a mean comment, tell your teacher.",
      tip: "\"Cool\" is kind but not specific. \"The score sound made me want to play again\" is kind AND specific.",
      solo: "If the room is quiet or nobody is at their seat, open the class studio on your own computer and try 4 projects there. You can also try projects from another class studio your teacher shares.",
      frame: "I liked how ... because ...\nMy favorite part was ...\nOne idea: maybe you could ..."
    },
    {
      title: "Reflect",
      short: "Write three sentences about how you grew as a coder.",
      text: "Write a short reflection with 3 sentences. Think about the whole course, not just today. Paste it into Notes and Credits or turn it in to your teacher.",
      frame: "I used to ... (something that was hard or new for you)\nNow I can ... (a skill you are proud of)\nNext I want to ... (something you want to learn or build)"
    },
    {
      title: "Mystery Mission",
      short: "Build a brand new mini project alone in ten minutes.",
      text: "This is your exit ticket. It is a new problem you have never seen. Work alone, with no help and no Show me. You have <b>10 minutes</b>.<br><b>The mission:</b> Start a new project. Make a sprite that counts how many times it is clicked. The count must start at 0 every time you click the green flag, and you must be able to see the count on the Stage. When the count reaches 10, the sprite says a message, like \"You did it!\".<br><b>First, decompose it</b>: what are the parts? (Something to remember the count. Something that happens on a click. Something that checks for 10.) Then build each part and test it.",
      where: "Any sprite in a new project",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\nset [clicks v] to (0)\nshow variable [clicks v]\n\nwhen this sprite clicked\nchange [clicks v] by (1)\nif <(clicks) = (10)> then\nsay [You did it!] for (2) seconds\nend",
      tip: "Look in the Variables, Events, Control, and Operators categories. Everything you need, you have used before.",
      frame: "Parts of the mission:\n1. Remember the count: ...\n2. When clicked: ...\n3. Check for 10: ..."
    }
  ],
  quiz: [
    {
      q: "You click the green flag, then click the sprite again and again. On which click does it say Wow?",
      blocks: "when green flag clicked\nset [clicks v] to (0)\n\nwhen this sprite clicked\nchange [clicks v] by (2)\nif <(clicks) > (5)> then\nsay [Wow!]\nend",
      choices: ["The 2nd click", "The 3rd click", "The 5th click", "The 6th click"],
      answer: 1,
      explain: "Each click adds 2: then 2, 4, 6. Six is more than 5, so it says Wow on the 3rd click."
    },
    {
      q: "Which gallery comment follows netiquette best?",
      choices: [
        "This is too easy lol.",
        "Cool.",
        "Mine is better, check out my project.",
        "The timer made it exciting. Maybe add a sound when time runs out?"
      ],
      answer: 3,
      explain: "It is kind, it says what worked and why, and it gives a helpful idea."
    }
  ],
  challenge: {
    title: "Click race",
    short: "Count clicks for ten seconds only, then say the total.",
    text: "Make a new mini project: when the green flag is clicked, the player has 10 seconds to click a sprite as many times as possible. Clicks after the 10 seconds must NOT count. When time is up, the sprite says the total number of clicks. It must reset every time you click the green flag.",
    answer: "when green flag clicked\nset [clicks v] to (0)\nset [playing v] to (1)\nwait (10) seconds\nset [playing v] to (0)\nsay (clicks)\n\nwhen this sprite clicked\nif <(playing) = (1)> then\nchange [clicks v] by (1)\nend"
  },
  checklist: [
    "My project has Instructions and Notes and Credits, and it is shared in the class studio.",
    "My project starts the same way every time I click the green flag.",
    "I wrote my 3-sentence reflection.",
    "I tried the Mystery Mission and shared what I built."
  ],
  submit: "Paste the link to your finished capstone and your 3-sentence reflection. Then share your Mystery Mission project and paste that link too. Name your projects anything you like (idea: \"Mystery Mission\" plus your first name).",
  teacherNotes: "PACING: warm-up 3 min, final fixes 8, project page 4, pitch plan 4, presentations 10 (small groups of 4 run in parallel and save time), gallery walk 6, reflection 3, Mystery Mission 10 (exit ticket; last 10 minutes, timed). Set up a class Scratch Studio before class and turn on comments; check it after class.\nMYSTERY MISSION: it is a transfer check, not a grade on the capstone. Do not help, but you may read the mission aloud. Score it simply: count resets on the green flag; count goes up on click; message at 10; count is visible. Students who know broadcasts or custom blocks may use them; any working way counts.\nMISCONCEPTIONS: (1) Putting set clicks to 0 inside \"when this sprite clicked\", so the count never goes past 1. (2) Using a forever loop with if clicks = 10 that says the message again and again; this works but is not needed. (3) Gallery comments that are kind but not specific.\nACCOMMODATIONS: presenting to the whole class is never required; a teacher-only talk, a screen video, or a typed pitch counts the same. Reflection and pitch may be dictated or typed with speech-to-text. For the Mystery Mission, students with extended time get the time in their plan; you may read the mission aloud, and ELL students may use a picture card of the categories (Variables, Events, Control, Operators)."
};
