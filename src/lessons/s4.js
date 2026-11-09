SQ_LESSONS.s4 = {
  title: "Sound and Atmosphere",
  tagline: "Make your audience feel the story with music, sound, and effects.",
  mission: "Add music, sound effects, and mood to your adventure.",
  minutes: "45",
  skill: "Sound, Music and Visual Effects",
  goal: "By the end of this quest you will give each scene its own music that changes cleanly, add a voice line or sound effect, fade a character in, and use graphic effects to set the mood.",
  vocab: [
    { term: "Atmosphere", def: "The mood or feeling of a scene, like spooky, happy, or tense.", icon: "🌫️" },
    { term: "Sound effect", def: "A short sound for an action, like a door creak or a splash.", icon: "🔊" },
    { term: "Music loop", def: "A song that plays again and again in the background.", icon: "🔁" },
    { term: "Fade", def: "Slowly appearing or disappearing, made with the ghost effect.", icon: "👻" },
    { term: "stop other scripts in sprite", def: "Stops every other script in this sprite, but keeps this one running.", icon: "✋" }
  ],
  warmup: "Close your eyes. Imagine a spooky scene. What sounds do you hear? Now imagine a beach. How do the sounds change the mood? Think alone or share with a neighbor.",
  needs: [],
  starter: {
    name: "Interactive Adventure starter",
    contains: "Backdrops named start, cave, forest, treasure, and home; a Narrator sprite; Choice A and Choice B button sprites that hide on the green flag and show or hide on the messages show choices and hide choices; a scene variable (For all sprites); and Narrator scripts for the messages go cave, go forest, go treasure, and go home. forest, treasure, and home are endings."
  },
  project: { name: "Interactive Adventure", part: "Part 2 of 2" },
  steps: [
    {
      title: "Plan the mood",
      short: "Open your adventure. Pick a mood and sounds for each scene.",
      text: "Open your Interactive Adventure from last quest (or the starter project). For each scene on your story map, choose a mood, a music loop, and maybe one sound effect or visual effect. You will not have time for everything, so start with the start scene and one ending.",
      frame: "Scene ____ feels ____.\n  Music: ____\n  Sound effect: ____\n  Visual effect: darker / colorful / ghost fade / none\n\nScene ____ feels ____.\n  Music: ____\n  Sound effect: ____\n  Visual effect: ____",
      tip: "Use headphones if you have them, so you can hear your own project."
    },
    {
      title: "Make a Music sprite",
      short: "Add a hidden Music sprite that plays a loop in the start scene.",
      text: "All music will live in one sprite, so it is easy to control. Add any sprite and rename it <b>Music</b>. In its <b>Sounds</b> tab, click Choose a Sound and pick a song from the <b>Loops</b> category. Add this code. When the backdrop switches to start, it first stops any other song script in this sprite and any sound that is playing, then plays the loop forever.",
      where: "Music (new sprite)",
      change: "new",
      scaffold: "full",
      blocks: "when green flag clicked\nhide\n\nwhen backdrop switches to [start v]\nstop [other scripts in sprite v]\nstop all sounds\nset volume to (50) %\nforever\nplay sound (Dance Around v) until done\nend",
      shots: ["choose-sprite", "sounds-tab"],
      tip: "Use play sound until done inside forever. With start sound, the loop starts the song again many times every second and it sounds broken."
    },
    {
      title: "Change the music for each scene",
      short: "Give each scene its own song script in the Music sprite.",
      text: "Add a song for each scene to the Music sprite. Each scene gets its own <b>when backdrop switches to</b> script with the same pattern. Here is why <b>stop other scripts in sprite</b> matters: <b>stop all sounds</b> stops the song for a moment, but the old forever loop is still running, so it starts the old song again on top of the new one. Stopping the other scripts ends the old loop for real.",
      where: "Music",
      change: "new",
      scaffold: "parsons",
      blocks: "when backdrop switches to [cave v]\nstop [other scripts in sprite v]\nstop all sounds\nforever\nplay sound (Spooky String v) until done\nend",
      tip: "Keep all song scripts in the Music sprite only. If you put stop other scripts in sprite on the Stage or the Narrator, it would also stop their story scripts."
    },
    {
      title: "Add a voice line",
      short: "Record one dramatic line, or pick a sound, and play it in a scene.",
      text: "Pick a character or the Narrator. In its <b>Sounds</b> tab, point to the Choose a Sound button and click <b>Record</b>. Record one short line, like Who goes there? Then play it when that scene starts. The wait lets the music change first, because the music change uses stop all sounds.",
      where: "Narrator or a character",
      change: "new",
      scaffold: "parsons",
      blocks: "when I receive [go cave v]\nwait (1) seconds\nplay sound (recording1 v) until done",
      shots: ["sounds-tab"],
      tip: "No microphone, or too noisy to record? Choose a sound from the library instead, like a growl, a scream, or a laugh, and add a say block with the words. Keep recordings school-appropriate."
    },
    {
      title: "Fade a character in",
      short: "Make a My Block called fade in and use it when a scene starts.",
      text: "Pick a character who appears in one scene, like a dragon in the cave. Make a block in <b>My Blocks</b> named <b>fade in</b>. Ghost 100 is invisible. Changing ghost by minus 5, twenty times, makes it slowly appear. Also add <b>hide</b> and <b>clear graphic effects</b> to this character's green flag script, so it starts hidden every time.",
      where: "A character who appears in one scene",
      change: "new",
      scaffold: "parsons",
      blocks: "define fade in\nset [ghost v] effect to (100)\nshow\nrepeat (20)\nchange [ghost v] effect by (-5)\nend\n\nwhen backdrop switches to [cave v]\nfade in",
      shots: ["make-block"],
      tip: "A My Block only works in the sprite where you made it. To make the character leave when the reader clicks a choice, add: when I receive hide choices, then hide."
    },
    {
      title: "Set the mood with effects",
      short: "Make spooky scenes darker and happy endings colorful, on the Stage.",
      text: "Build this on the Stage by yourself. When the backdrop switches to a spooky scene, make the Stage darker. When it switches to a happy ending, make the colors change a few times. Every scene script should start with clear graphic effects, so effects from the last scene do not pile up. The green flag should also clear effects.<br>Blocks that help (Looks and Events): when backdrop switches to, clear graphic effects, set effect to, change effect by, repeat, wait.",
      where: "Stage",
      change: "new",
      scaffold: "goal",
      blocks: "when green flag clicked\nclear graphic effects\n\nwhen backdrop switches to [cave v]\nclear graphic effects\nset [brightness v] effect to (-40)\n\nwhen backdrop switches to [treasure v]\nclear graphic effects\nrepeat (10)\nchange [color v] effect by (25)\nwait (0.1) seconds\nend",
      shots: ["select-stage", "cat-looks"],
      tip: "Brightness minus 40 is darker. Plus 40 is lighter. Try other effects too, like whirl or fisheye for a dream."
    },
    {
      title: "Polish and test every path",
      short: "Give each ending a sound and message. Then test every path.",
      text: "Give each ending its own final sound and a message like THE END: you found 1 of 3 endings. Then play every path. Listen carefully: when the scene changes, does only the new song play? Click the green flag in the middle of a story: does everything reset? Save and share.",
      frame: "Path: start, then ____, then ____\nOnly one song plays at a time? yes / no\nEffects look right? yes / no\nWhat I fixed: ____",
      tip: "Two songs at once? That scene's song script is missing stop other scripts in sprite, or it is not in the Music sprite."
    }
  ],
  quiz: [
    {
      q: "This is the Music sprite. The backdrop switches from start to cave. What do you hear?",
      blocks: "when backdrop switches to [start v]\nforever\nplay sound (Dance Around v) until done\nend\n\nwhen backdrop switches to [cave v]\nstop all sounds\nforever\nplay sound (Spooky String v) until done\nend",
      choices: ["Only Spooky String", "Silence", "Both songs, because the start loop is still running", "Only Dance Around"],
      answer: 2,
      explain: "stop all sounds stops the sound, not the script. The old forever loop plays Dance Around again on top."
    },
    {
      q: "This music sounds broken and restarts very fast. What should you change?",
      blocks: "when green flag clicked\nforever\nstart sound (Dance Around v)\nend",
      choices: ["Use play sound until done inside the forever", "Add more forever loops", "Set the volume to 100 %", "Move the script to the Stage"],
      answer: 0,
      explain: "start sound does not wait, so forever starts the song again many times a second. play sound until done waits."
    }
  ],
  challenge: {
    title: "Ending tracker",
    short: "Show how many different endings the reader has found.",
    text: "Make a variable <b>endings found</b> and one variable for each ending, like <b>found treasure</b>. When the reader reaches an ending for the first time, add 1 to endings found. Reaching the same ending again must not add more. Show the endings found monitor on the Stage at every ending. Do not reset these variables on the green flag, so they last between plays. Use a key, like r, to reset them.",
    answer: "when I receive [go treasure v]\nif <(found treasure) = [0]> then\nset [found treasure v] to (1)\nchange [endings found v] by (1)\nend\nshow variable [endings found v]\n\nwhen [r v] key pressed\nset [found treasure v] to (0)\nset [found home v] to (0)\nset [found forest v] to (0)\nset [endings found v] to (0)"
  },
  checklist: [
    "Each scene has its own music",
    "Only one song plays at a time when scenes change",
    "One voice line or sound effect in a scene",
    "A visual effect or fade that sets the mood",
    "Every path still works and resets on the green flag"
  ],
  submit: "Share your finished adventure with music, sound, and effects. Name your project anything you like (idea: \"The Spooky Cave\"). Paste the link.",
  teacherNotes: "Pacing (45 min): warmup 3, plan 4, Music sprite 6, scene music 7, voice line 6, fade in 7, effects 7, polish and test 5. Absent students start from the starter project.<br><b>The music bug</b>: stop all sounds silences the current sound but does not stop a forever loop, so the old loop starts its song again over the new one. The fix used here: all music lives in one hidden Music sprite, and each scene's music script starts with stop other scripts in sprite and stop all sounds. Keeping music in its own sprite matters: stop other scripts in sprite on the Stage or Narrator would kill story scripts. stop all sounds also cuts sound effects that are playing when a scene changes, which is why the voice line waits 1 second.<br><b>Common misconceptions</b>: start sound inside forever (restarts constantly); effects piling up (set vs change, no clear graphic effects); a My Block used in another sprite; a fading character left invisible on the next run (needs clear graphic effects on the green flag).<br><b>Accommodations</b>: recording is optional; library sounds plus a say block are a full alternative for students without a microphone or who are uncomfortable recording. Set a headphones rule and a quiet recording corner. Students with hearing differences can focus on visual mood (effects, fades) and check music with a peer or by watching the Sounds tab. Typing is light in this lesson; the frames can be filled with single words."
};
