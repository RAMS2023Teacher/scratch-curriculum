SQ_LESSONS.g4 = {
  title: "Level Up!",
  tagline: "Add levels, lives, and a win screen worth bragging about.",
  mission: "Add three levels, lives, and win and lose screens to your platformer.",
  minutes: "45",
  skill: "Levels, Lives & Win/Lose",
  goal: "By the end of this quest you will use a level variable and messages to run three levels, move a door for each level, give the player lives, and end with a You Win or Game Over screen.",
  vocab: [
    { term: "Level", def: "One part of a game. Each level is usually harder than the last.", icon: "🪜" },
    { term: "Lives", def: "How many more tries the player has.", icon: "❤️" },
    { term: "Win or lose rule", def: "The rule that decides when the game ends, and if you won.", icon: "🏁" },
    { term: "Message", def: "A signal one script sends with broadcast. Other scripts start when they receive it.", icon: "📣" }
  ],
  warmup: "Think of a great level complete moment in a game. What did the game do to make it feel good: a sound, a message, a new place? Tell a neighbor, or write one sentence.",
  needs: [],
  starter: {
    name: "Platformer starter",
    contains: "A backdrop named level1 with a ground and platforms in one color. A Player sprite with two green flag scripts: a walk script (go to x -200 y 0, then a forever loop with left and right arrow keys) and a gravity script (y speed For this sprite only; change y speed by -1 and change y by y speed; if touching the platform color, move back by 0 minus y speed, set y speed to 0, and jump with the up arrow by setting y speed to 14; if y position less than -170, go to x -200 y 0 and set y speed to 0)."
  },
  project: { name: "Platformer", part: "Part 2 of 2" },
  steps: [
    {
      title: "Make your backdrops",
      short: "Make three level backdrops, a You Win backdrop, and a Game Over backdrop.",
      text: "Open your Platformer from <b>My Stuff</b> (or Remix the starter project at the top of this quest). Click the <b>Stage</b> and open <b>Backdrops</b>. Right-click <b>level1</b> and choose <b>duplicate</b> two times. Rename the copies <b>level2</b> and <b>level3</b>, and move their platforms to make new levels. Make level3 the hardest.<br><br>Then paint two more backdrops with the text tool: <b>You Win</b> and <b>Game Over</b>.",
      shots: ["select-stage", "backdrops"],
      tip: "Keep the platform color the SAME on every level, so your gravity code still works. Do not use the platform color on the You Win or Game Over backdrops."
    },
    {
      title: "The level manager",
      short: "Make level and lives variables. The Stage starts the right level.",
      text: "Click the Stage. Make two variables, <code>level</code> and <code>lives</code> (on the Stage they are For all sprites). The Stage is the <b>level manager</b>. On the green flag, it sets level to 1 and lives to 3, then broadcasts a new message called <b>start level</b>. When it receives start level, it switches to the backdrop that matches the level number.",
      where: "Stage",
      change: "new",
      scaffold: "full",
      shots: ["make-variable"],
      blocks: "when green flag clicked\nset [level v] to (1)\nset [lives v] to (3)\nbroadcast (start level v)\n\nwhen I receive [start level v]\nif <(level) = [1]> then\nswitch backdrop to (level1 v)\nend\nif <(level) = [2]> then\nswitch backdrop to (level2 v)\nend\nif <(level) = [3]> then\nswitch backdrop to (level3 v)\nend",
      tip: "This step has TWO scripts, both on the Stage. The blank line shows where one script ends and the next begins."
    },
    {
      title: "A door that moves",
      short: "Add a Door sprite that moves to a new spot on each level.",
      text: "Add a sprite for the exit, like a door or a flag, and rename it <b>Door</b>. There is only ONE Door, so it must move to a new place for each level. When it receives start level, it shows and goes to the spot for that level. Put the blocks in order, then change the x and y numbers to fit YOUR levels.",
      where: "Door",
      change: "new",
      scaffold: "parsons",
      blocks: "when I receive [start level v]\nshow\nif <(level) = [1]> then\ngo to x: (200) y: (-120)\nend\nif <(level) = [2]> then\ngo to x: (190) y: (60)\nend\nif <(level) = [3]> then\ngo to x: (-180) y: (130)\nend",
      tip: "To find a spot: switch the Stage to that level backdrop, drag the Door there, and read its x and y in the sprite info under the Stage. Type those numbers into the go to block."
    },
    {
      title: "Touch the door",
      short: "When the Player touches the Door, go back to start and send next level.",
      text: "On the Player, check for the Door. First move the Player back to the start and stop its fall. Then broadcast a new message, <b>next level</b>. Moving first matters: if the Player stayed on the Door, it would send next level again and skip levels.",
      where: "Player",
      change: "add",
      changeNote: "Add this if block inside the forever loop of your Player gravity script, at the bottom, after the fall-off check.",
      scaffold: "parsons",
      blocks: "if <touching (Door v)?> then\ngo to x: (-200) y: (0)\nset [y speed v] to (0)\nbroadcast (next level v)\nend",
      tip: "Make the start spot (x: -200, y: 0) far away from every Door spot."
    },
    {
      title: "Win at level three",
      short: "The Stage adds one to level. After level three, show You Win.",
      text: "Click the Stage. Build ONE <b>when I receive next level</b> script, and keep it on the Stage only. It adds 1 to level. If level is now more than 3, the player beat level 3: switch to You Win, broadcast a new message <b>end game</b> and wait, then stop all. Else, broadcast start level, so the backdrop and the Door change. Put the blocks in order.",
      where: "Stage",
      change: "new",
      scaffold: "parsons",
      blocks: "when I receive [next level v]\nchange [level v] by (1)\nif <(level) > [3]> then\nswitch backdrop to (You Win v)\nbroadcast (end game v) and wait\nstop [all v]\nelse\nbroadcast (start level v)\nend",
      tip: "Only ONE script should receive next level. If two scripts both change level, they can run in either order and skip a level. There is no level4, so the game must end after level 3."
    },
    {
      title: "Lives and Game Over",
      short: "Falling off costs a life. With no lives left, show Game Over.",
      text: "Build this yourself. Change the fall-off check in the Player gravity script. When the Player falls below -170, it loses 1 life and goes back to the start with y speed 0, like before. Then, if lives is 0, switch the backdrop to <b>Game Over</b>, broadcast <b>end game</b> and wait, and stop all. Look at your Win script for ideas: the ending is almost the same.",
      where: "Player",
      change: "replace",
      changeNote: "Replaces the if y position less than -170 block inside your Player gravity script. Keep the touching color if and the touching Door if.",
      scaffold: "goal",
      blocks: "if <(y position) < [-170]> then\nchange [lives v] by (-1)\ngo to x: (-200) y: (0)\nset [y speed v] to (0)\nif <(lives) = [0]> then\nswitch backdrop to (Game Over v)\nbroadcast (end game v) and wait\nstop [all v]\nend\nend",
      tip: "Sprites can use <b>switch backdrop to</b> too. It is in Looks. Test quickly: set lives to 1 on the Stage, fall once, then set it back to 3."
    },
    {
      title: "Clean ending",
      short: "Hide the Player and Door at the end. Show the Player at the start.",
      text: "On the win and lose screens, the Player and the Door should not be there. Build it yourself: the <b>Player</b> and the <b>Door</b> each get a script that hides when they receive <b>end game</b>. Then the Player must show again when the green flag is clicked, or it stays hidden next game. (The Door already shows itself in its start level script.)",
      where: "Player and Door",
      change: "new",
      changeNote: "One new end game script on the Player and one on the Door. Also add show to the top of the Player walk script, right under the hat.",
      scaffold: "goal",
      blocks: "when I receive [end game v]\nhide\n\nwhen green flag clicked\nshow\ngo to x: (-200) y: (0)\nforever\nif <key (right arrow v) pressed?> then\nchange x by (5)\nend\nif <key (left arrow v) pressed?> then\nchange x by (-5)\nend\nend",
      tip: "Why broadcast and wait before stop all? It waits until every end game script is done, so the sprites hide before everything stops."
    },
    {
      title: "Coins and high score",
      short: "Add a coin for points, and keep the best score ever.",
      text: "Make two variables on the Stage: <code>score</code> and <code>high score</code>. Add <b>set score to 0</b> to the Stage green flag script. Do NOT reset high score on the green flag, so it stays from game to game.<br><br>Add a <b>Coin</b> sprite. On each level it shows, waits until the Player touches it, then adds 10 points and hides. Pick one spot that works on all three levels (or copy the Door's ifs). When the game ends, the Stage checks for a new high score.",
      where: "Coin and Stage",
      change: "new",
      changeNote: "First script goes on the Coin. Second script goes on the Stage. Also add set score to 0 to the Stage green flag script.",
      scaffold: "full",
      stretch: true,
      shots: ["make-variable"],
      blocks: "when I receive [start level v]\ngo to x: (0) y: (100)\nshow\nwait until <touching (Player v)?>\nchange [score v] by (10)\nhide\n\nwhen I receive [end game v]\nif <(score) > (high score)> then\nset [high score v] to (score)\nend",
      tip: "A new start level message restarts the Coin script from the top, so the coin comes back on each level. Give the Coin an end game script that hides it too, like the Player and Door."
    }
  ],
  quiz: [
    {
      q: "Level is 3. The Player touches the Door. What happens?",
      blocks: "when I receive [next level v]\nchange [level v] by (1)\nif <(level) > [3]> then\nswitch backdrop to (You Win v)\nbroadcast (end game v) and wait\nstop [all v]\nelse\nbroadcast (start level v)\nend",
      choices: ["The game goes to level 4", "The level 3 backdrop shows again", "You Win shows and the game stops", "Nothing happens"],
      answer: 2,
      explain: "Level becomes 4. 4 is more than 3, so the if part runs: You Win, then stop all."
    },
    {
      q: "High score is 40. You score 25 this game. What is high score after the game ends?",
      blocks: "when I receive [end game v]\nif <(score) > (high score)> then\nset [high score v] to (score)\nend",
      choices: ["40", "25", "65", "0"],
      answer: 0,
      explain: "25 is not more than 40, so the if does not run. High score stays 40."
    }
  ],
  challenge: {
    title: "Enemy patrol",
    short: "Add an enemy that walks on a platform and costs a life.",
    text: "Add an <b>Enemy</b> sprite. When a level starts, it goes to a platform and walks back and forth forever. It walks faster on higher levels: use the level variable in its speed. If the Player touches the Enemy, treat it like falling off: lose a life, go back to start, and check for Game Over. Use ONE Enemy sprite (no clones needed).",
    answer: "when I receive [start level v]\ngo to x: (0) y: (-110)\nshow\nforever\nrepeat (40)\nchange x by ((level) * (2))\nend\nrepeat (40)\nchange x by ((0) - ((level) * (2)))\nend\nend\n\nif <touching (Enemy v)?> then\nchange [lives v] by (-1)\ngo to x: (-200) y: (0)\nset [y speed v] to (0)\nif <(lives) = [0]> then\nswitch backdrop to (Game Over v)\nbroadcast (end game v) and wait\nstop [all v]\nend\nend"
  },
  checklist: [
    "Three level backdrops that the game moves through in order",
    "A Door that moves to a new spot on each level",
    "Lives that go down when the Player falls off",
    "A You Win screen after level 3 and a Game Over screen when lives run out",
    "The Player and Door hide at the end and come back on the green flag"
  ],
  submit: "Play your whole game from level 1 to You Win. Then save, share, and paste the link. Name your project anything you like (idea: \"Castle Climb\").",
  teacherNotes: "PACING: step 1 about 8 min (keep backdrop edits quick), steps 2-4 about 12 min, steps 5-7 about 15 min, playtest and quiz 8 min. Step 8 is stretch. PATHS: students may come from Stories or Apps at fork 1, so this lesson avoids clones, join, and pick random. The level manager uses if level = 1, 2, 3 instead of join. A student who missed g3 can Remix the starter. MISCONCEPTIONS: (1) Skipping levels: the Player stays on the Door and broadcasts next level many times. Moving the Player to start BEFORE broadcasting fixes it. (2) Two when I receive next level scripts (for example one on the Door and one on the Stage) both change level and race. Keep only the Stage one. (3) Door does not move: backdrop names or level numbers in the ifs do not match. (4) Player stays hidden after a win: show is missing on the green flag. (5) High score resets: a student added set high score to 0 on the green flag. (6) stop all before hiding: use broadcast end game and wait, then stop all. ACCOMMODATIONS: Core only mode hides step 8. For students who need less building, give a starter with level2 and level3 already painted, so step 1 is just painting two text backdrops. For the goal steps (6 and 7), a support option is to point at the Win script in step 5 and say: copy that ending. ELL: draw the message flow on the board (Player sends next level, Stage receives it, Stage sends start level, Door and Stage receive it)."
};
