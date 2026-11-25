---
slug: sequence-diagrams
series: a-closer-look
workingTitle: "Watching a request happen"
level: building
showcase: concurrency
tags: [tooling, concurrency]
status: ready
pr:
published:
video: none
---

## Brief

For developers who have tried to work out, from code alone, what a handler
calls and in what order. **Bynk: Show Sequence Diagram** draws one handler's
calls as a sequence diagram, straight from the program, and `bynk dev
--trace-events` records what a real request did. The reader leaves knowing how
to read both, and why neither can fall out of date.

## Hook

A product page waits on three lookups, two price mirrors and a courier with a
time limit. Which of them ran in parallel, which won, and which was still
going when the page was sent? The diagram answers the first; a trace answers
the rest.

## Outline

### What it's for

- "What does this handler call, and in what order?", answered without
  reading every function it reaches.
- "What did this request actually do?", answered without logging.

### A tour

- Open the `concurrency` project's product handler and run **Bynk: Show
  Sequence Diagram**: lifelines for each capability, the `par` block, the
  `race` between the mirrors, the `within` on the courier.
- Run `bynk dev --trace-events`, make a request, and read the `request`
  event: route, status, duration and each step's kind, target, span, time and
  outcome.
- If the extension draws the trace over the diagram, show that; otherwise
  show the JSON beside the diagram and say how to read one against the other.

### How it works

- The diagram comes from the language server's `bynk/sequenceModel` request,
  so it's the compiler's own reading of the handler, re-drawn after edits.
- Traces are recorded in dev builds only; `bynk deploy` and `bynk compile`
  never record. A step records no argument values.
- For an agent's handler, the diagram also shows each write to its state.

### Its limits

- One handler at a time; the architecture map is the whole-project view (link
  *A diagram that can't go out of date*).
- A trace closes when the response is ready, so `waitUntil` work (a race's
  loser, a late `within`) shows as `pending`, not its result.
- At most 200 steps per request; the `nodejs_als` flag is added to traced
  builds.

### Try it

- Clone the showcase, open `concurrency`, run the command and `bynk dev
  --trace-events`. Link the extension's documentation and the CLI reference.

## Code to quote

- `concurrency/src/shop/product.bynk`: `fastestPrice` (the `race`), the
  `within` in `deliveryNote`, and the `par` block.

## Facts to check

- Whether the VS Code extension currently overlays a live trace on the
  sequence diagram, and how it's switched on; the series plan assumes it does.
- The extension version used, named in the post as the series asks.
- How `par`, `race` and `within` are drawn in the diagram.

## Screenshots needed

- The sequence diagram for the product handler (Save as SVG, as the series
  asks).
- The diagram with a trace over it, or the trace JSON beside it.

## Sources

- Book: [`bynk dev`: request traces](https://bynk-lang.org/reference/tooling/bynk-cli/#request-traces)
- Book: [VS Code extension](https://bynk-lang.org/reference/tooling/vscode-bynk/)
- Book: [Language server: capabilities](https://bynk-lang.org/reference/tooling/bynk-lsp/#capabilities)
- Showcase README: `concurrency`

## Video angle

The diagram draws itself lifeline by lifeline from the code, then a request
runs and each arrow lights up with its timing; the race's loser keeps going
in grey after the page is sent. About 2:00. Best recorded as a screen capture
in the editor, framed by motion graphics.

1. Title
2. What does this handler call?
3. Show Sequence Diagram
4. Reading `par`, `race` and `within`
5. A real request: `--trace-events`
6. Each step: kind, target, time, outcome
7. The loser still running: `pending`
8. Limits
9. Close
