SQ_LESSONS.a3 = {
  title: "List Master",
  tagline: "Store a whole collection of data and build a study tool with it.",
  mission: "Build a flashcard study app with lists.",
  minutes: "45",
  skill: "Lists & Data",
  goal: "By the end of this quest you will make lists, add and delete items, read items by their position, and build a flashcard study app.",
  vocab: [
    { term: "List", def: "A variable that holds many items in order, like a shopping list.", icon: "📋" },
    { term: "Item", def: "One thing stored in a list.", icon: "🔖" },
    { term: "Index", def: "The position number of an item in a list: 1, 2, 3, and so on.", icon: "🔢" },
    { term: "Length", def: "How many items are in a list.", icon: "📏" }
  ],
  warmup: "Write down 5 things you need to study for a test: vocab words, math facts, capitals. How could a computer remember all of them? Do this alone or with a neighbor.",
  needs: ["askAnswer", "join"],
  project: { name: "Super App", part: "Part 1 of 2" },
  steps: [
    {
      title: "Start your Super App",
      short: "Make a new project and pick a study topic.",
      text: "Make a new project. Your Super App will have a flashcard study mode (this quest) and a sketch mode (next quest). Pick a sprite to be your <b>Host</b> (it asks the questions). Pick a study topic: vocab words, state capitals, Spanish words, times tables, or anything from class.",
      shots: ["choose-sprite"],
      tip: "Name your project anything you like. One idea: Super App."
    },
    {
      title: "Make two lists",
      short: "Make a questions list and an answers list with five items each.",
      text: "Click <b>Variables</b>, then <b>Make a List</b>. Name it <code>questions</code> and choose <b>For all sprites</b>. Do the same for <code>answers</code>. Both lists appear on the Stage.<br>Click the <b>+</b> at the bottom of each list to type 5 items. Item 1 of questions goes with item 1 of answers. For example: questions item 1 is <i>Capital of France?</i> and answers item 1 is <i>Paris</i>.<br>Items you type into a list are saved with the project.",
      shots: ["make-list"],
      tip: "Choose For all sprites. If you choose For this sprite only, your Add Card button will not be able to reach the lists later."
    },
    {
      title: "Read an item",
      short: "Use the item of block to show one flashcard.",
      text: "The <code>item (1) of [questions]</code> block reports the first item in the list. Build this script on the Host and click the green flag. The Host says the first question, then the first answer. Try changing the 1 to a 2.",
      where: "Host sprite",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nhide list [questions v]\nhide list [answers v]\nsay (item (1) of [questions v]) for (2) seconds\nsay (item (1) of [answers v]) for (2) seconds"
    },
    {
      title: "Loop through every card",
      short: "Use a card variable and a loop to quiz every card.",
      text: "Make a variable called <code>card</code>. It holds the index: which card we are on. The loop runs one time for each item, because it uses <code>length of [questions]</code>. Each time, the Host asks a question, checks the answer, then adds 1 to card to go to the next card.<br>Keep the hat and the two <b>hide list</b> blocks from step 3. Drag the two <b>say</b> blocks away and delete them. Add the new blocks under the hide list blocks.",
      where: "Host sprite",
      change: "replace",
      changeNote: "Changes your step 3 script: keep the green flag hat and both hide list blocks; delete the two say blocks; add the rest below.",
      scaffold: "full",
      blocks: "when green flag clicked\nhide list [questions v]\nhide list [answers v]\nset [card v] to (1)\nrepeat (length of [questions v])\nask (item (card) of [questions v]) and wait\nif <(answer) = (item (card) of [answers v])> then\nsay [Correct!] for (1) seconds\nelse\nsay (join [It was: ] (item (card) of [answers v])) for (2) seconds\nend\nchange [card v] by (1)\nend",
      shots: ["make-variable"],
      tip: "A space at the end of a list item breaks the equals check. Paris with a space after it does NOT equal Paris. Click each item in the list and check for extra spaces."
    },
    {
      title: "Add new cards from the app",
      short: "Make an Add Card button so users can add their own cards.",
      text: "Paint a new sprite that looks like a button and says <b>Add Card</b>. When someone clicks it, it asks for a new question and its answer, and adds them to the END of each list. Now users can add cards without changing the code.",
      where: "Add Card button (new sprite)",
      change: "new",
      scaffold: "parsons",
      blocks: "when this sprite clicked\nask [Type a new question:] and wait\nadd (answer) to [questions v]\nask [Type its answer:] and wait\nadd (answer) to [answers v]\nsay [Card added!] for (1) seconds",
      tip: "The two add blocks must go to different lists: the question goes to questions, the answer goes to answers."
    },
    {
      title: "Missed-it list",
      short: "Save every missed question in a review list and show it at the end.",
      text: "Make a third list called <code>review</code> (For all sprites). Change the Host's script so that:<br>1. At the start, the review list is emptied and hidden.<br>2. When the user gets a card WRONG, that question is added to review.<br>3. After the last card, the review list is shown, so the user knows what to practice.<br>Look in <b>Variables</b> for the list blocks: <b>delete all of</b>, <b>add to</b>, <b>hide list</b>, and <b>show list</b>.",
      where: "Host sprite",
      change: "add",
      changeNote: "Adds to your step 4 script: delete all and hide list go under the hat; add to review goes in the ELSE part, under the say It was block; show list goes at the very end, after the repeat.",
      scaffold: "goal",
      blocks: "when green flag clicked\nhide list [questions v]\nhide list [answers v]\ndelete all of [review v]\nhide list [review v]\nset [card v] to (1)\nrepeat (length of [questions v])\nask (item (card) of [questions v]) and wait\nif <(answer) = (item (card) of [answers v])> then\nsay [Correct!] for (1) seconds\nelse\nsay (join [It was: ] (item (card) of [answers v])) for (2) seconds\nadd (item (card) of [questions v]) to [review v]\nend\nchange [card v] by (1)\nend\nshow list [review v]",
      shots: ["make-list"],
      tip: "Trace it: which part runs when the answer is wrong, the if part or the else part? That is where the add block goes."
    },
    {
      title: "Test and share",
      short: "Test every card, miss one on purpose, add a card, then share.",
      text: "Click the green flag. Answer every card. Get one WRONG on purpose. Does it show up in the review list at the end? Click Add Card and add a new card. Click the green flag again. Does the new card get asked? Save and share."
    }
  ],
  quiz: [
    {
      q: "Trace this script. What will the sprite say?",
      blocks: "when green flag clicked\ndelete all of [pets v]\nadd [dog] to [pets v]\nadd [cat] to [pets v]\nadd [fish] to [pets v]\nsay (item (2) of [pets v])",
      choices: [
        "dog",
        "fish",
        "cat",
        "2"
      ],
      answer: 2,
      explain: "Scratch lists start counting at 1. Item 2 is the second item added: cat."
    },
    {
      q: "The questions list has 4 items. Trace this script. What number will the sprite say?",
      blocks: "when green flag clicked\nset [card v] to (1)\nrepeat (length of [questions v])\nchange [card v] by (1)\nend\nsay (card)",
      choices: [
        "4",
        "5",
        "1",
        "0"
      ],
      answer: 1,
      explain: "card starts at 1 and the loop adds 1 four times: 1 + 4 = 5."
    }
  ],
  challenge: {
    title: "Shuffle mode",
    short: "Ask five random cards instead of going in order.",
    text: "Make the Host ask 5 cards, but pick a RANDOM card each time instead of going 1, 2, 3. The pick random block in Operators gives a random number between two numbers. The random card must always be a real card, even after users add more cards.",
    answer: "when green flag clicked\nrepeat (5)\nset [card v] to (pick random (1) to (length of [questions v]))\nask (item (card) of [questions v]) and wait\nif <(answer) = (item (card) of [answers v])> then\nsay [Correct!] for (1) seconds\nelse\nsay (join [It was: ] (item (card) of [answers v])) for (2) seconds\nend\nend"
  },
  checklist: [
    "My app has a questions list and an answers list that match",
    "My Host asks every card with a loop and says if I am right",
    "My Add Card button adds a new card to both lists",
    "Missed questions go into a review list"
  ],
  submit: "Share your Super App and paste the link. Name your project anything you like (idea: Super App). Next quest you will add a sketch mode!",
  teacherNotes: "Pacing: start 3 min, lists 7, item of 5, loop 10, Add Card 8, review 8, test 4. Students may come from any fork-1 path; ask/answer and join have primers. Misconceptions: (1) off-by-one: students think item 0 is first; model the index with a real numbered list on the board. (2) 'For this sprite only' lists cannot be reached by the Add Card button; check scope first when Add Card 'does nothing'. (3) Trailing spaces in list items make = false even for a correct answer (= ignores upper/lower case but not spaces). (4) In step 6 many put 'add to review' in the if part; ask them to trace a wrong answer. (5) Students forget delete all, so review grows every run. Accommodations: students who find two matching lists hard may use 5 cards and the step 4 script as a full copy; the review list (step 6) can be done with the 'Stuck? Show me' solution. ELLs may write cards in their home language and English (a great study tool). Students with motor needs can type list items instead of dragging."
};
