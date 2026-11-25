---
slug: turn-up-3
series: build-it
workingTitle: "Who's coming?"
level: first-steps
repo: turn-up/03-whos-coming
tags: [agents, errors]
status: idea                      # ready once 03-whos-coming/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 3 gives each event a memory. An agent per event holds the people who've
signed up and refuses a sign-up when the event is full. The reader leaves
knowing what an agent is (one per key, its own state, changes committed
together), and how "full" is a value the handler must answer, not an
exception.

## Hook

Two people press "Sign up" for the last place at the same moment. Who gets
it, and what does the other one see?

## Outline

### Where we are

- Part 2's service: events can be created and read. Link `02-open-the-doors/`.

### What you'll build

- `POST /events/:id/signups`: a `201` while there's room, and a `409` once
  the event is full.

### The steps

1. `agent Signups` keyed by the gathering's id, with `store` fields for the details
   and the attendees.
2. `on call signUp(…)` returning `Result[…, Full]`.
3. The route calls the agent and turns `Err(Full)` into `Conflict`.
4. Tests: fill an event to capacity, then one more.
5. Say why two simultaneous sign-ups can't both take the last place: one
   agent handles one call at a time (check the exact wording in the agent
   model).

### Check it works

- `bynk test`, then fill a small event with `curl`.

### What you've learned

- Agents, `store`, `on call`; `Result` for an expected failure. Link
  *Missing isn't the same as wrong* and the Book's agent model.

### Next time

- Part 4: only the organiser may create events.

## Code to quote

- `03-whos-coming/`: the agent, the sign-up route and the tests.

## Facts to check

- What the agent model guarantees about concurrent calls to one agent, and
  what a caller sees when the agent is busy (record 0930: `503`).
- Which storage kind suits attendees (`Map`, `Set` or a `Cell` of a list).

## Sources

- Book: [Add a stateful agent](https://bynk-lang.org/book/tutorials/stateful-agent/)
- Book: [The agent model](https://bynk-lang.org/book/concepts/agents-and-state/the-agent-model/)
- Book: [Agents reference](https://bynk-lang.org/reference/agents/)

## Video angle

A clipboard per event; names are added one at a time, and when the last line
is filled the clipboard turns the next person away, politely. About 4:00.
