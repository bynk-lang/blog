# Making a video

How a post's video is put together, and the rules that came out of making
*Build it with Bynk*, part 1 (November 2026). The writing guide,
[Writing a post](writing-a-post.md), covers how a post links to its video.
This guide covers the video itself.

## The story

- **Start with the problem.** Before any code, show the viewer what goes wrong
  without the thing the video teaches. For example, a workshop with 40 places
  where 41 people turn up, or an event with no title and no places that nothing
  complains about. The viewer should know why they're watching before they see
  any syntax.
- **Show the evolution, not the answer.** Write the naive version first (plain
  `String` and `Int`), show what it still allows, then go back and improve it.
  The viewer learns more from the gap than from the finished code.
- **Switch between the editor and explainers.** The editor shows what you type,
  and an animation shows what it means: values falling off a ruler, two ways
  into a type, a box shared by two services. Cut to an explainer when the idea
  is about values or structure rather than syntax.
- **Explain a purpose before you type it.** When a feature appears for the
  first time (`commons`, `---`), the narration says what it's for, and the
  explainer or the paused editor holds while it does. Then the code is typed.
  The series plan's
  [First encounters](series/build-it.md#first-encounters) register says which
  part meets which feature first.
- **Give the reason, not just the rule.** "A commons holds shared types" is
  accurate but leaves the viewer asking why. Say what problem it solves
  ("an HTTP service and a notifications service both need to agree on what an
  event is"), and where there's a design reason (`---` echoes Markdown's
  thematic break), say that too. Check a design reason with the maintainers
  rather than guessing.
- **End with the next step.** The recap names what was learned, then one
  sentence says what the next part builds.

## The narration

- **Talk to the viewer.** Ask the questions they would ask ("Job done? Not
  quite.") and answer them. Use "you" and "we", and contractions.
- **Write the script before recording anything.** The script is a storyboard:
  one row per scene, with what's on screen and what's said. The video follows
  it, not the other way round.
- **Budget about 150 words a minute.** A four-minute part has about 600 words.
  Time each scene to its line, and hold the picture while the voice finishes.
- **Check every factual line against the code.** For example, if the voice
  says "six tests pass", the terminal should show six tests passing.
- **Voice it last.** Build and review the picture with scratch subtitles first.
  Generating the voice (ElevenLabs) costs about one credit per character for
  each take, so only generate it once the script and timings are agreed.

## The editor

- **Type what you mean to say, in the order you'll say it.** Record the takes
  in the storyboard's order, so the code on screen changes when the narration
  says it does.
- **Make room before inserting.** To add a declaration above existing code,
  first open a couple of blank lines, then type the new line in the gap. The
  viewer should see it written on its own line, not pushed in on top of other
  code.
- **Add docs after the declaration exists.** A `---` doc with nothing below it
  yet shows the `bynk.parse.orphan_doc_block` warning underline while it's
  being typed. Write the declaration first, then open a line above it and add
  the doc.
- **Cut the cursor's journeys.** Moving to the next insertion point (arrow
  keys, Home, End) is distracting. Mark it during recording and cut it from
  the edit, so the cursor jumps straight to where the typing starts.
- **Frame the code.** Crop or zoom to the code, not the whole window: no
  half-visible sidebar. Zoom further for a hover or a diagnostic, and keep
  the line numbers in view.
- **Show the real tools.** Use the real Bynk extension from the Marketplace
  and the released `bynk-lsp`, so hovers, diagnostics and colours are what
  viewers will see.

## Explainers and graphics

- **Be consistent.** Lines that connect two things start and end at the edges
  of the boxes they join. Boxes in a row are the same size, even when one has
  less in it.
- **Keep text clear of the subtitles.** Leave the bottom fifth of the frame
  free for subtitles and captions.
- **Use the brand.** Background `#0e1513`, accent `#5fd3a5`, Instrument Sans
  for prose and JetBrains Mono for code.

## Checking a render

- **Look at every scene.** Before sharing a cut, take a still from each scene,
  and from either side of each transition.
- **Check for single-frame glitches.** A frame that differs from both of its
  neighbours while they match each other is a glitch (a dropped caption, or a
  tiled frame under a zoom). Check the whole render for them. Drawing editor
  takes as still images, rather than as video, avoids both.

## Where the pipeline lives

The recording and rendering pipeline (code-server driven by Playwright, the
Remotion project, and the scripts) is kept with the video prototype in the
project's shared files, under `video-prototype/`. Its README says how to
re-record a take and re-render a cut.
