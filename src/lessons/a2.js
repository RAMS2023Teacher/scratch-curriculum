SQ_LESSONS.a2 = {
  title: "Quiz Builder",
  tagline: "Turn your chatbot into a quiz app that keeps score.",
  mission: "Build a quiz app that checks answers and keeps score.",
  minutes: "45",
  skill: "App Logic, Score and Feedback",
  goal: "By the end of this quest you will build a quiz that asks questions, checks right and wrong answers with clickable buttons or typed answers, keeps a score, and shows a results message.",
  vocab: [
    { term: "Button", def: "Something on the screen you click to make the app do something.", icon: "🔘" },
    { term: "Feedback", def: "How the app tells the user what happened, like Correct or Try again.", icon: "✅" },
    { term: "Score", def: "A variable that counts how many answers were right.", icon: "🏆" },
    { term: "State", def: "Where the app is right now, like which question it is on.", icon: "📍" }
  ],
  warmup: "Think of any app or game you use. Name three buttons on it. How do you know they are buttons: shape, color, or words? Think alone or share with a neighbor.",
  needs: [],
  starter: {
    name: "Quiz App starter",
    contains: "A sprite named Bot. Its chatbot script from a1 (ask, join, if else) may be there, but its hat block is changed to when c key pressed so it does not run on the green flag. No score or question variables yet."
  },
  project: { name: "Quiz App", part: "Part 2 of 2" },
  steps: [
    {
      title: "Plan your quiz",
      short: "Open your app, pick a topic, and write two questions.",
      text: "Open your Quiz App from last quest (or the starter project). Your Bot will be the quiz host. First, move the chatbot out of the way: drag a <b>when key pressed</b> hat (set to c) onto the chat script and remove its green flag hat, so it does not run during the quiz. Then pick a topic you know well and write <b>2 questions</b>. Each has 3 choices: A, B, and C. You can add questions 3 to 5 later.",
      frame: "Topic: ____\n\nQ1: ____?\n  A: ____   B: ____   C: ____\n  Right answer: ____\n\nQ2: ____?\n  A: ____   B: ____   C: ____\n  Right answer: ____",
      tip: "Short questions are easier to read on the Stage. Try to keep each question under 12 words."
    },
    {
      title: "Set up score and question",
      short: "Make the score and question variables. Reset them on the green flag.",
      text: "Make two variables, For all sprites: <b>score</b> counts right answers, and <b>question</b> remembers which question the quiz is on. On the green flag, score goes to 0 and question goes to 1. Every new quiz starts fresh. Show the score on the Stage so the player can see it.",
      where: "Bot",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nset [score v] to (0)\nset [question v] to (1)\nshow variable [score v]",
      shots: ["make-variable"],
      tip: "Check the box next to question too while you build. It helps you see what the app is doing. Uncheck it when you are done."
    },
    {
      title: "Question 1: pick how players answer",
      short: "Pick buttons or typed answers. Ask question one and check it.",
      text: "Pick one way for players to answer. Both check the answer, add 1 to score if it is right, give feedback if it is wrong, and then add 1 to question.<br><b>Clickable buttons</b>: make a variable <b>right answer</b>. The Bot sets it to the right letter, shows the question, and waits until a button is clicked. Paint a sprite with the letter A and name it <b>Button A</b>. Give it the bottom script. Then duplicate it to make Button B and Button C, and change the letter in each copy.<br><b>Typed answers</b>: the Bot asks and the player types the answer. Everything is on the Bot.",
      where: "Bot (and Button A if you pick buttons)",
      change: "add",
      changeNote: "The Bot blocks go at the bottom of the Bot's green flag script from step 2. The when this sprite clicked script is a new script on Button A.",
      scaffold: "full",
      options: [
        {
          label: "Clickable buttons",
          short: "Bot shows Q1 and waits. Button A checks if A is the right answer.",
          blocks: "set [right answer v] to [A]\nsay [Q1: Which planet is closest to the Sun? A: Mercury B: Mars C: Venus]\nwait until <(question) = [2]>\n\nwhen this sprite clicked\nif <(right answer) = [A]> then\nchange [score v] by (1)\nsay [Correct!] for (1) seconds\nelse\nsay [Not this one.] for (1) seconds\nend\nchange [question v] by (1)"
        },
        {
          label: "Typed answers",
          short: "Bot asks Q1, checks the typed answer, and gives feedback.",
          blocks: "ask [Q1: Which planet is closest to the Sun?] and wait\nif <(answer) = [Mercury]> then\nchange [score v] by (1)\nsay [Correct!] for (1) seconds\nelse\nsay [Not quite. It is Mercury.] for (2) seconds\nend\nchange [question v] by (1)"
        }
      ],
      shots: ["make-variable", "ask"],
      tip: "Test the wrong path too! Click a wrong button or type a wrong answer: the score must stay the same, and the quiz must still go on. Buttons: in Button B, change the A in the if block to B."
    },
    {
      title: "Question 2",
      short: "Add question two the same way. Use the same tab as before.",
      text: "Add question 2 to the bottom of the Bot's green flag script. Pick the same tab you picked in step 3. The pattern is the same, only the words and the right answer change. Put the blocks in order.<br><b>Buttons</b>: you do not need to change the buttons at all. They check the right answer variable, and the Bot changes it for each question.",
      where: "Bot",
      change: "add",
      changeNote: "Add to the bottom of the Bot's green flag script, under your question 1 blocks.",
      scaffold: "parsons",
      options: [
        {
          label: "Clickable buttons",
          short: "Set the right answer, show Q2, and wait for question 3.",
          blocks: "set [right answer v] to [B]\nsay [Q2: How many legs does a spider have? A: 6 B: 8 C: 10]\nwait until <(question) = [3]>"
        },
        {
          label: "Typed answers",
          short: "Ask Q2, check it, give feedback, and add 1 to question.",
          blocks: "ask [Q2: How many legs does a spider have?] and wait\nif <(answer) = [8]> then\nchange [score v] by (1)\nsay [Correct!] for (1) seconds\nelse\nsay [Not quite. It is 8.] for (2) seconds\nend\nchange [question v] by (1)"
        }
      ],
      tip: "Typed answers: = ignores capital letters but not extra spaces, so 8 with a space after it is wrong. Tell the player to type just the answer."
    },
    {
      title: "Results screen",
      short: "After the last question, show the score and a message.",
      text: "Build this yourself at the bottom of the Bot's script. Show the score in a sentence with join. If the score is more than 1, say a happy message. If not, say an encouraging one. If you used buttons, they should hide at the end: broadcast a message like <b>quiz over</b>, and give each button a when I receive script that hides it. The buttons also need <b>show</b> on the green flag.<br>Blocks that help: join, say for seconds, if else, the greater than block, broadcast, when I receive, hide, show.",
      where: "Bot (and each button if you used buttons)",
      change: "add",
      changeNote: "Add to the bottom of the Bot's green flag script. Buttons get two new scripts.",
      scaffold: "goal",
      blocks: "broadcast (quiz over v)\nsay (join [You scored: ] (score)) for (3) seconds\nif <(score) > [1]> then\nsay [Quiz master!] for (2) seconds\nelse\nsay [Nice try! Play again?] for (2) seconds\nend\n\nwhen green flag clicked\nshow\n\nwhen I receive [quiz over v]\nhide",
      tip: "Remember the space after You scored: inside join. If you add more questions, change the number in the greater than block, like more than 3 for 5 questions."
    },
    {
      title: "Questions 3 to 5",
      short: "If you have time, add three more questions with the same pattern.",
      text: "Write questions 3 to 5 with the frame. Then right-click the blocks for question 2, choose <b>duplicate</b>, and change the words, the right answer, and the number. Put them before the results blocks. Buttons: the wait until number goes up by one each time.",
      where: "Bot",
      change: "add",
      changeNote: "Add between your question 2 blocks and your results blocks.",
      scaffold: "goal",
      blocks: "set [right answer v] to [C]\nsay [Q3: What do bees make? A: Milk B: Bread C: Honey]\nwait until <(question) = [4]>",
      frame: "Q3: ____?  A: ____  B: ____  C: ____  Right: ____\nQ4: ____?  A: ____  B: ____  C: ____  Right: ____\nQ5: ____?  A: ____  B: ____  C: ____  Right: ____",
      stretch: true
    },
    {
      title: "Test every path and share",
      short: "Test right and wrong answers for every question, then share.",
      text: "Play the quiz three times: once with all right answers, once with all wrong answers, and once mixed. Check the score each time. Then have a classmate try it without your help. Save and share.",
      frame: "All right: score was ____ (should be ____)\nAll wrong: score was ____ (should be 0)\nMixed: score was ____ (should be ____)\nWhat I fixed: ____",
      solo: "No one free? Play it yourself as if you had never seen it. Look only at the Stage. Click fast, click the wrong button, or type an answer with a capital letter. Write down anything that surprised you.",
      tip: "Buttons: click only once per question. If you click a button again before it finishes talking, the score can go up twice."
    }
  ],
  quiz: [
    {
      q: "right answer is B and score is 0. The player clicks Button A. What happens?",
      blocks: "when this sprite clicked\nif <(right answer) = [A]> then\nchange [score v] by (1)\nsay [Correct!] for (1) seconds\nelse\nsay [Not this one.] for (1) seconds\nend\nchange [question v] by (1)",
      choices: ["It says Correct and score becomes 1", "Nothing happens", "It says Not this one, and the quiz stays on the same question", "It says Not this one, score stays 0, and question goes up by 1"],
      answer: 3,
      explain: "B is not A, so the else part runs. The last block is outside the if, so question still goes up."
    },
    {
      q: "This is the Bot. Nobody clicks any button. What does the Bot do?",
      blocks: "when green flag clicked\nset [question v] to (1)\nsay [Q1: Which planet is closest to the Sun?]\nwait until <(question) = [2]>\nsay [Q2: How many legs does a spider have?]",
      choices: ["Shows Q1 and keeps waiting", "Shows Q1, then Q2 after 2 seconds", "Shows Q2 right away", "Stops with an error"],
      answer: 0,
      explain: "wait until pauses the script until question is 2. Only a button click changes question."
    }
  ],
  challenge: {
    title: "Start menu",
    short: "Add a title screen and a Start button before the quiz begins.",
    text: "Add a backdrop named <b>title</b> and a Start button sprite. On the green flag, show the title backdrop and the Start button. The quiz must not begin until Start is clicked. When it is clicked, the Start button hides, the backdrop changes, and the Bot begins the quiz. Answer buttons stay hidden until the quiz begins.",
    answer: "when green flag clicked\nshow\nswitch backdrop to (title v)\n\nwhen this sprite clicked\nhide\nswitch backdrop to (quiz v)\nbroadcast (start quiz v)"
  },
  checklist: [
    "score and question reset on the green flag",
    "At least 2 questions that check the answer",
    "A right answer adds 1 to score, and a wrong answer gives feedback",
    "A results message that shows the score",
    "I tested right and wrong answers"
  ],
  submit: "Share your quiz app. Name your project anything you like (idea: \"Space Quiz\"). Paste the link.",
  teacherNotes: "Pacing (45 min): warmup 3, plan 6, setup 5, question 1 10, question 2 6, results 8, test 5. Questions 3 to 5 are a stretch. Absent students start from the starter project.<br><b>Logic</b>: both variables are made and reset in step 2, so question is 1 before any answer is checked. Buttons option: the Bot sets right answer, shows the question, and waits until question changes; each button only compares its own letter with right answer, so buttons never need editing for new questions. Typed option: everything is on the Bot; question is a progress counter. Both options show the wrong-answer path in the else branch. For the challenge, the Bot's quiz script moves from when green flag clicked to when I receive start quiz.<br><b>Common misconceptions</b>: putting change question by 1 inside the if (wrong answers then freeze the quiz); forgetting to reset score; a missing space in join; buttons left visible on the results screen; with typed answers, = ignores capitals but not extra spaces.<br><b>Accommodations</b>: the core is 2 questions, so writing load stays small; the frame keeps each question to one line. Students may use the sample questions. Typed answers need more typing from players; buttons need painting. Let students choose. Students who need it can follow the typed option, where all code is on one sprite. English learners may write the quiz in their home language."
};
