/* "New to this?" primer cards.
 * A lesson lists the skills it uses in `needs`. If the student hasn't finished any lesson that
 * teaches that skill (their path skipped it), the quest shows this short primer card right after
 * the mission card. Students who already learned it never see it.
 */
var SQ_PRIMERS = {
  clones: {
    taughtIn: ['g2'], title: 'Clones: copies of a sprite', icon: '🐑',
    short: 'A sprite can make copies of itself called clones.',
    text: '<b>create clone of myself</b> makes a copy. Each copy runs the <b>when I start as a clone</b> script. <b>delete this clone</b> removes a copy when you are done with it. Tip: the original sprite usually hides, and only the clones show.',
    blocks: 'when green flag clicked\nhide\nrepeat (5)\ncreate clone of (myself v)\nwait (1) seconds\nend\n\nwhen I start as a clone\ngo to x: (pick random (-200) to (200)) y: (150)\nshow\nglide (2) secs to x: (x position) y: (-150)\ndelete this clone'
  },
  askAnswer: {
    taughtIn: ['a1'], title: 'Ask and answer', icon: '💬', shots: ['ask'],
    short: 'Ask a question, and the typed answer goes into the answer block.',
    text: 'In <b>Sensing</b>, <b>ask and wait</b> shows a box where the user types. Whatever they type is saved in the round <b>answer</b> block. Use answer anywhere a word or number can go.',
    blocks: 'when green flag clicked\nask [What is your favorite food?] and wait\nsay (answer) for (2) seconds'
  },
  join: {
    taughtIn: ['a1'], title: 'Join words together', icon: '🔗', shots: ['cat-operators'],
    short: 'Join sticks two pieces of text together into one.',
    text: '<b>join</b> is in <b>Operators</b> (green). It glues two things into one piece of text, like a greeting and a name. Remember to type a space at the end of the first part!',
    blocks: 'say (join [Hello, ] (answer)) for (2) seconds'
  },
  lists: {
    taughtIn: ['a3'], title: 'Lists hold many things', icon: '📋', shots: ['make-list'],
    short: 'A list is a variable that holds many items in order.',
    text: 'In <b>Variables</b>, click <b>Make a List</b>. <b>add thing to list</b> puts an item at the end. <b>item 1 of list</b> reads one item. <b>length of list</b> tells how many items there are.',
    blocks: 'when green flag clicked\ndelete all of [snacks v]\nadd [apple] to [snacks v]\nadd [pizza] to [snacks v]\nsay (item (1) of [snacks v]) for (2) seconds'
  },
  pen: {
    taughtIn: ['m2'], title: 'The Pen draws lines', icon: '🖊️', shots: ['extensions'],
    short: 'Add the Pen extension, then pen down draws wherever the sprite moves.',
    text: 'Click <b>Add Extension</b> (bottom left) and choose <b>Pen</b>. <b>pen down</b> starts drawing as the sprite moves. <b>pen up</b> stops. <b>erase all</b> clears the drawing.',
    blocks: 'when green flag clicked\nerase all\npen down\nrepeat (4)\nmove (100) steps\nturn cw (90) degrees\nend\npen up'
  },
  customBlocks: {
    taughtIn: ['m2'], title: 'Make your own block', icon: '🧩', shots: ['make-block'],
    short: 'In My Blocks, Make a Block turns many blocks into one.',
    text: 'Click <b>My Blocks</b>, then <b>Make a Block</b>. Give it a name. Put blocks under the <b>define</b> hat. Now you can use your block like any other block. It only works in the sprite where you made it.',
    blocks: 'define spin\nrepeat (36)\nturn cw (10) degrees\nend\n\nwhen green flag clicked\nspin'
  },
  random: {
    taughtIn: ['g1'], title: 'Pick a random number', icon: '🎲', shots: ['cat-operators'],
    short: 'Pick random gives a surprise number each time.',
    text: '<b>pick random 1 to 10</b> is in <b>Operators</b>. Every time it runs, it picks a new number between the two numbers. It is great for random positions and surprises.',
    blocks: 'go to x: (pick random (-200) to (200)) y: (0)'
  },
  math: {
    taughtIn: ['g2'], title: 'Math blocks', icon: '➗', shots: ['cat-operators'],
    short: 'The green Operators blocks can add, subtract, multiply, and divide.',
    text: 'Drop a variable into a math block to do math with it. A handy trick: <b>0 minus speed</b> gives the opposite of speed, so 5 becomes -5. That is how you turn "up" into "down".',
    blocks: 'set [speed v] to (5)\nchange y by ((0) - (speed))'
  },
  textStrings: {
    taughtIn: ['a1'], title: 'Variables can hold words', icon: '🔤',
    short: 'A variable can hold a word, not only a number.',
    text: 'You can <b>set</b> a variable to a word, like <i>cave</i> or <i>Sam</i>. Then compare it with <b>=</b>. Capital letters do not matter, but extra spaces do: <i>cave </i> with a space is not the same as <i>cave</i>.',
    blocks: 'set [scene v] to [cave]\nif <(scene) = [cave]> then\nsay [It is dark in here!]\nend'
  }
};
