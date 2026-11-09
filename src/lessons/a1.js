SQ_LESSONS.a1 = {
  title: "Ask Me Anything",
  tagline: "Build a chatbot that listens and talks back.",
  mission: "Build a chatbot that asks questions and answers back.",
  minutes: "45",
  skill: "Input, Join and Text Comparisons",
  goal: "By the end of this quest you will ask the user questions, keep their answer in a variable, build sentences with join, and use if else to reply to different answers.",
  vocab: [
    { term: "Input", def: "Information the user gives the program, like typing an answer.", icon: "⌨️" },
    { term: "answer", def: "A Sensing block that holds what the user typed last.", icon: "📥" },
    { term: "join", def: "An Operators block that puts two pieces of text together.", icon: "🔗" },
    { term: "Chatbot", def: "A program that has a conversation with a person.", icon: "🤖" },
    { term: "Text", def: "Letters and words. Variables can hold text, not just numbers.", icon: "🔤" }
  ],
  warmup: "If you built a robot helper for our school, what three questions would it ask a new student on the first day? Think alone or share with a neighbor.",
  needs: ["random"],
  project: { name: "Quiz App", part: "Part 1 of 2" },
  steps: [
    {
      title: "Meet your bot",
      short: "Start a new project and pick or paint a friendly bot.",
      text: "Start a new project. Pick or paint a friendly character to be your bot. Rename the sprite to <b>Bot</b>. You will turn this chatbot into a quiz app next quest.",
      shots: ["choose-sprite"]
    },
    {
      title: "Ask a question",
      short: "Use ask and wait to ask the user for their name.",
      text: "In <b>Sensing</b>, find <b>ask and wait</b>. When it runs, a box appears at the bottom of the Stage and the script waits. Whatever the user types goes into the round <b>answer</b> block. Build this and click the green flag. Type your name and press Enter.",
      where: "Bot",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nask [Hi! What is your name?] and wait\nsay (answer) for (2) seconds",
      shots: ["ask"],
      tip: "The script waits until the user presses Enter or clicks the check mark. That is the wait part of ask and wait."
    },
    {
      title: "Join the words",
      short: "Use join to say hello with their name in a sentence.",
      text: "Saying only a name is strange. In <b>Operators</b>, use <b>join</b> to stick two pieces of text together. Put a space after the comma in Nice to meet you, so the words do not touch.",
      where: "Bot",
      change: "replace",
      changeNote: "Replaces the say block in your step 2 script. Drag answer into the second slot of join.",
      scaffold: "full",
      blocks: "when green flag clicked\nask [Hi! What is your name?] and wait\nsay (join [Nice to meet you, ] (answer)) for (2) seconds",
      shots: ["cat-operators"],
      tip: "join does not add spaces for you. Without the space you get Nice to meet you,Sam."
    },
    {
      title: "Remember the name",
      short: "Keep their name in a variable called name.",
      text: "The <b>answer</b> block changes every time you ask something new. To keep the name for later, make a variable <b>name</b> and set it to answer right after the question. Then use name in the join. Put the blocks in order.",
      where: "Bot",
      change: "replace",
      changeNote: "Replaces your step 3 script.",
      scaffold: "parsons",
      blocks: "when green flag clicked\nask [Hi! What is your name?] and wait\nset [name v] to (answer)\nsay (join [Nice to meet you, ] (name)) for (2) seconds",
      shots: ["make-variable"],
      tip: "Variables can hold words, not only numbers. Uncheck the name box in the palette if you do not want it showing on the Stage."
    },
    {
      title: "Make decisions",
      short: "Ask a yes or no question and reply with if else.",
      text: "Ask a yes or no question. Use <b>if else</b> and <b>=</b> to reply in two different ways. Put the blocks in order and add them to the bottom of your script.",
      where: "Bot",
      change: "add",
      changeNote: "Add to the bottom of your step 4 script, under the say block.",
      scaffold: "parsons",
      blocks: "ask [Do you like pizza? Type yes or no.] and wait\nif <(answer) = [yes]> then\nsay [Me too! Pizza is the best.] for (2) seconds\nelse\nsay [Really? More for me then.] for (2) seconds\nend",
      tip: "= ignores capital letters, so YES and yes both match. But = does not ignore extra spaces: yes with a space at the end is not the same as yes, so it goes to else."
    },
    {
      title: "Ask for a number",
      short: "Ask for a number and reply one way if it is bigger than five.",
      text: "Build this yourself. Ask the user to pick a number from 1 to 10. If the number is more than 5, the bot says one thing. If not, it says something else. Use the person's name in one reply.<br>Blocks that help: ask and wait, if else, the greater than block from Operators, join, say for seconds.",
      where: "Bot",
      change: "add",
      changeNote: "Add to the bottom of your Bot's green flag script.",
      scaffold: "goal",
      blocks: "ask [Pick a number from 1 to 10.] and wait\nif <(answer) > [5]> then\nsay (join [That is a big one, ] (name)) for (2) seconds\nelse\nsay [Small but strong!] for (2) seconds\nend",
      tip: "The greater than block compares numbers. If the user types seven in letters, Scratch compares it as text, and the reply may surprise you."
    },
    {
      title: "Your own question",
      short: "Write one more question of your own and give two replies.",
      text: "Add one more question about anything you like: favorite animal, game, or food. Use ask and wait, then if else to give two replies. Write it with the frame first, then build it.",
      where: "Bot",
      change: "add",
      changeNote: "Add to the bottom of your Bot's green flag script.",
      scaffold: "goal",
      blocks: "ask [What is your favorite animal?] and wait\nif <(answer) = [cat]> then\nsay [Cats are my favorite too!] for (2) seconds\nelse\nsay (join (answer) [ is a great animal!]) for (2) seconds\nend",
      frame: "My question: ____?\nIf they type ____, the bot says: ____\nIf they type anything else, the bot says: ____",
      tip: "Do not ask for private information like a full name, address, or phone number. A first name is enough.",
      stretch: true
    },
    {
      title: "Test with surprise answers",
      short: "Let someone chat with your bot, then fix the surprises.",
      text: "Have a classmate chat with your bot while you watch. Do not help them. Did they type something you did not expect, like yeah instead of yes? Make your else replies friendly for surprises. Then save and share.",
      solo: "No one free? Test it yourself as if you had never seen it. Type surprise answers: YES, yeah, yes with a space at the end, seven, and 7. Write down what the bot did for each one, then fix one thing.",
      tip: "Your else reply catches everything that is not a match. Make it something like I did not understand, but that is OK!"
    }
  ],
  quiz: [
    {
      q: "The user types Sam. What does the bot say?",
      blocks: "when green flag clicked\nask [What is your name?] and wait\nsay (join [Hi] (answer)) for (2) seconds",
      choices: ["Hi Sam", "HiSam", "Hi answer", "join Hi Sam"],
      answer: 1,
      explain: "join does not add a space. There is no space after Hi, so the words touch: HiSam."
    },
    {
      q: "The user types YES in capital letters. What does the bot say?",
      blocks: "ask [Do you like pizza?] and wait\nif <(answer) = [yes]> then\nsay [Me too!] for (2) seconds\nelse\nsay [More for me!] for (2) seconds\nend",
      choices: ["More for me!", "Nothing", "Me too!", "Both lines"],
      answer: 2,
      explain: "= ignores capital letters, so YES matches yes and the if part runs."
    }
  ],
  challenge: {
    title: "Guess my number",
    short: "The bot picks a secret number and gives higher or lower clues.",
    text: "The bot picks a secret number from 1 to 10 and keeps it in a variable. The user guesses. If the guess is too low, the bot says Higher. If it is too high, it says Lower. The user keeps guessing until they get it, then the bot says You got it. Look at pick random in Operators and repeat until in Control.",
    answer: "when green flag clicked\nset [secret v] to (pick random (1) to (10))\nask [Guess my number from 1 to 10!] and wait\nrepeat until <(answer) = (secret)>\nif <(answer) < (secret)> then\nsay [Higher!] for (1) seconds\nelse\nsay [Lower!] for (1) seconds\nend\nask [Guess again!] and wait\nend\nsay [You got it!] for (2) seconds"
  },
  checklist: [
    "My bot asks for a name and uses it with join",
    "The name is kept in a variable",
    "At least one yes or no question with if else",
    "At least 3 questions in total",
    "I tested surprise answers"
  ],
  submit: "Share your chatbot. Name your project anything you like (idea: \"Robo Buddy\"). Paste the link. You will turn it into a quiz app next quest.",
  teacherNotes: "Pacing (45 min): warmup 3, meet bot 3, ask 5, join 5, remember 6, decisions 7, number 8, test 6. Your own question is a stretch.<br>This is the first lesson that teaches ask and wait, answer, join, and text in variables (Apps path). The challenge uses pick random (Games teaches it), so Apps students see the random primer.<br><b>Common misconceptions</b>: missing space inside join (HiSam) is very common and a great teachable moment; thinking answer remembers every reply (it only holds the latest one); = ignores capitals but not extra spaces; comparing a number typed in words with greater than.<br><b>Accommodations</b>: typing is moderate. Students may copy question text from the step cards. Allow speech-to-text for the frame. For students who type slowly, the core is 3 questions; the stretch question is optional. English learners can write bot replies in their home language. Remind everyone not to ask users for personal information beyond a first name."
};
