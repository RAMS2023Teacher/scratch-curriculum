SQ_LESSONS.t5 = {
  title: "Power-Up Pack",
  tagline: "Unlock the tools every big project needs: memory, messages, and choices.",
  mission: "Build a virtual pet that gets hungry and tells you how it feels.",
  minutes: "45",
  skill: "Variables, Broadcasts & Decisions",
  goal: "By the end of this quest you will make variables and use set and change, show a variable on the Stage, compare numbers with = < and >, choose between two actions with if-else, send messages with broadcast and when I receive, and wait until something is true.",
  vocab: [
    { term: "Variable", def: "A named box that holds a number or word. It can change.", icon: "📦" },
    { term: "Broadcast", def: "A message one sprite sends. Other sprites can hear it and react.", icon: "📣" },
    { term: "if else", def: "If the condition is true, do the first part. If not, do the second part.", icon: "🔀" },
    { term: "Compare", def: "Check if one number is equal to, less than, or greater than another.", icon: "⚖️" },
    { term: "Monitor", def: "The little box on the Stage that shows a variable's value.", icon: "📺" }
  ],
  warmup: "Think about a pet or a video game character. What numbers about it change over time? (Ideas: energy, health, coins, score.) Write two, and what makes each one go up or down. You can do this alone or share with a neighbor.",
  needs: [],
  steps: [
    {
      title: "Choose your pet and its food",
      short: "Start a new project and add a pet sprite and a food sprite.",
      text: "Start a new project and give it a name. Add a <b>pet</b> sprite: any animal, monster, or robot from Choose a Sprite, or paint your own. Then add a <b>food</b> sprite, like the Apple, Donut, or a food you paint. Rename them <b>Pet</b> and <b>Food</b> in the box above the sprite list. You can delete the cat if you do not use it.<br>Pick a backdrop for your pet's home.",
      tip: "Clear names help a lot today. Blocks will show sprite names in their dropdowns.",
      shots: ["choose-sprite", "delete-sprite", "backdrops"]
    },
    {
      title: "Make an energy variable",
      short: "Make a variable called energy and set it when the flag is clicked.",
      text: "Click the <b>Pet</b>. Open the orange <b>Variables</b> category and click <b>Make a Variable</b>. Type <b>energy</b>. Choose <b>For all sprites</b> and click OK.<br>Now a new <code>energy</code> block appears. The checkbox next to it shows the <b>monitor</b> on the Stage. Keep it checked so you can watch the number.<br>Build this script. <code>set</code> puts an exact number in the box. Every game needs this reset at the start.",
      where: "Pet",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nset [energy v] to (10)\nshow variable [energy v]\nsay [Hi! I am your new pet!] for (2) seconds",
      tip: "<b>For all sprites</b>: every sprite and the Stage can read and change it. Use this for things like score, time, or energy that other sprites need. <b>For this sprite only</b>: only this sprite can use it. Use this when each sprite needs its own, like its own speed. If you are not sure, choose For all sprites.",
      shots: ["make-variable"]
    },
    {
      title: "Getting hungry",
      short: "Make energy go down by one every two seconds.",
      text: "Pets get hungry over time. Add a forever loop under your say block. <code>change energy by -1</code> takes one away from whatever is in the box. Click the green flag and watch the monitor count down.<br><b>set</b> puts in an exact number. <b>change</b> adds to the number that is already there. A negative number takes away.",
      where: "Pet",
      change: "add",
      changeNote: "Add the forever loop to the bottom of your green flag script from step 2, under the say block.",
      scaffold: "full",
      blocks: "when green flag clicked\nset [energy v] to (10)\nshow variable [energy v]\nsay [Hi! I am your new pet!] for (2) seconds\nforever\nwait (2) seconds\nchange [energy v] by (-1)\nend",
      tip: "If energy goes up instead of down, check for the minus sign: it must be -1, not 1. If energy starts at the old number, the set block is missing or below the forever.",
      shots: ["cat-control"]
    },
    {
      title: "Feed with a message",
      short: "Click the food to send a message, and make the pet eat.",
      text: "The food and the pet are different sprites. They talk with <b>broadcast</b> messages.<br>1. Click the <b>Food</b>. Drag in <code>when this sprite clicked</code> and <code>broadcast</code> from Events. Click the dropdown in broadcast, choose <b>New message</b>, and type <b>feed</b>.<br>2. Click the <b>Pet</b>. Add the <code>when I receive feed</code> script.<br>Click the food on the Stage. Does energy go up?",
      where: "Food, then Pet",
      change: "new",
      scaffold: "full",
      blocks: "when this sprite clicked\nbroadcast (feed v)\n\nwhen I receive [feed v]\nchange [energy v] by (3)\nsay [Yum!] for (1) seconds",
      tip: "The first script goes on the Food. The second goes on the Pet. <b>broadcast</b> sends the message and keeps going right away. <b>broadcast and wait</b> sends it, then waits until every when I receive script for it is finished. Use broadcast and wait when the next block must happen after the other sprite is done.",
      shots: ["cat-events"]
    },
    {
      title: "Show its mood",
      short: "Put the blocks in order so the pet shows a hungry or happy mood.",
      text: "Now the pet makes a choice with <code>if else</code>. If energy is <b>less than 4</b>, it thinks I am hungry. Else (any other time), it thinks I feel great. Find the <code>( ) &lt; ( )</code> block in the green <b>Operators</b> category. Drop the <code>energy</code> block in the left side and type 4 in the right side.<br>Put these blocks in order on the Pet.",
      where: "Pet",
      change: "new",
      scaffold: "parsons",
      blocks: "when green flag clicked\nforever\nif <(energy) < (4)> then\nthink [I am hungry...]\nelse\nthink [I feel great!]\nend\nend",
      tip: "The forever is needed so the pet checks its energy again and again. Read the less than sign like a mouth: it opens toward the bigger number.",
      shots: ["cat-operators"]
    },
    {
      title: "Not too full",
      short: "Put the blocks in order so energy never goes above ten.",
      text: "Right now you can click the food again and again, and energy goes up to 50! Let's add a limit. Change your <b>when I receive feed</b> script: after energy goes up, if it is <b>greater than 10</b>, set it back to 10.",
      where: "Pet",
      change: "replace",
      changeNote: "Replaces the when I receive feed script on the Pet from step 4.",
      scaffold: "parsons",
      blocks: "when I receive [feed v]\nchange [energy v] by (3)\nif <(energy) > (10)> then\nset [energy v] to (10)\nsay [I am so full!] for (1) seconds\nend\nsay [Yum!] for (1) seconds",
      tip: "Use the greater than block, not less than. Test it: click the food many times. The monitor should stop at 10."
    },
    {
      title: "Fall asleep",
      short: "When energy reaches zero, make the pet fall asleep and stop the game.",
      text: "Build this one with no picture. Make a new green flag script on the Pet that:<br>1. Waits until energy <b>equals 0</b>.<br>2. Says a sleepy message, like Zzz.<br>3. Stops the whole game.<br>Helpful blocks: <b>wait until</b> (Control), the <b>=</b> block (Operators), your <b>energy</b> variable, <b>say</b>, and <b>stop all</b>.",
      where: "Pet",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\nwait until <(energy) = (0)>\nsay [Zzz... I fell asleep.] for (2) seconds\nstop [all v]",
      tip: "wait until pauses this script, but other scripts keep running. Test by not feeding the pet for 20 seconds."
    },
    {
      title: "Make it yours, then share",
      short: "Change one thing to make the pet yours, then save and share.",
      text: "Make the pet your own. Pick at least one:<br>Change how fast energy drops.<br>Change what the pet says or thinks.<br>Add a sound to the feed script.<br>Make the food go to a new spot after each click.<br>Then click <b>File</b>, then <b>Save now</b>. Click <b>Share</b> and copy the link.",
      tip: "Test everything again after you change it: start, feed, and let it fall asleep."
    }
  ],
  quiz: [
    {
      q: "You click the green flag. What number does the score monitor show at the end?",
      blocks: "when green flag clicked\nset [score v] to (5)\nchange [score v] by (2)\nset [score v] to (1)\nchange [score v] by (3)",
      choices: ["11", "4", "3", "8"],
      answer: 1,
      explain: "set puts in an exact number. change adds to it. 5, then 7, then set to 1, then 1 plus 3 is 4."
    },
    {
      q: "Energy is exactly 4. What does the pet think?",
      blocks: "if <(energy) < (4)> then\nthink [I am hungry...]\nelse\nthink [I feel great!]\nend",
      choices: ["I am hungry...", "Both messages", "I feel great!", "Nothing"],
      answer: 2,
      explain: "4 is not less than 4, so the condition is false. The else part runs."
    }
  ],
  challenge: {
    title: "Play time",
    short: "Add a toy and a happiness variable that drops and goes up.",
    text: "Add a second variable called <b>happiness</b> for all sprites, and a <b>toy</b> sprite. Happiness should start at 10 and drop by 1 every 3 seconds. When someone clicks the toy, it sends a <b>play</b> message, and the pet gets 2 more happiness and spins around. Bonus: if happiness is greater than 8, the pet says I love you! else it says Play with me! Use only blocks from this quest.",
    answer: "when green flag clicked\nset [happiness v] to (10)\nforever\nwait (3) seconds\nchange [happiness v] by (-1)\nend\n\nwhen this sprite clicked\nbroadcast (play v)\n\nwhen I receive [play v]\nchange [happiness v] by (2)\nrepeat (10)\nturn cw (36) degrees\nend"
  },
  checklist: [
    "My energy variable is set at the start and shows on the Stage.",
    "Energy goes down over time with change.",
    "Clicking the food sends a broadcast and the pet eats.",
    "My pet shows its mood with if else."
  ],
  submit: "Share your pet project and paste the link. Name your project anything you like (idea: My Pocket Pet).",
  teacherNotes: "PACING (45 min): warmup 3 min, choose pet and food 5 min (do not let students paint today - library sprites are fine), energy variable 6 min, getting hungry 5 min, feed with a message 7 min, show its mood 6 min, not too full 5 min, fall asleep (goal step) 5 min, make it yours + share 3 min. This lesson is the toolkit every later lesson relies on, so prioritize steps 2-7 over decoration.\nMISCONCEPTIONS: (1) set vs change: students use set when they mean change (energy jumps to 3 instead of going up by 3) - the quiz trace targets this. (2) No reset: forgetting set at the green flag, so the old value carries over between runs. (3) Choosing 'For this sprite only' and then not finding the variable on another sprite; explain the choice in step 2 and say 'when unsure, For all sprites'. (4) Typing the word 'energy' into the comparison instead of dragging in the energy reporter block. (5) Reading < and > backwards. (6) Thinking broadcast targets one sprite; every sprite with a matching when I receive hears it. (7) Boundary: 4 < 4 is false.\nACCOMMODATIONS: This is the most abstract trunk lesson. Students with working-memory or attention needs: keep the monitor visible and have them say the value out loud after each test click; a physical 'variable box' (a cup labeled energy with counters) helps show set vs change. Students who read below grade level: the read-aloud plus the screenshots for Make a Variable and Operators carry the step. English learners: post 'less than' and 'greater than' with the symbols and a number line. Students with fine-motor needs may have trouble dropping a reporter into a small operator slot - drop it on the left white oval until it highlights. Fast finishers go to the Play time challenge."
};
