---
slug: turn-up-5
series: build-it
workingTitle: "A place on the waiting list"
level: building
repo: turn-up
tags: [types, agents]
status: idea                      # ready once 05-waiting-list/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 5 adds the rules that make the service feel real. A full event keeps a
waiting list; anyone can cancel with the code they were given; a cancellation
promotes the first person waiting. The reader leaves knowing how a sum type
names each outcome of a sign-up, how an opaque type keeps a cancellation code
unforgeable, and how an invariant makes "never more attendees than places"
true of every saved state.

## Hook

Someone drops out the night before. The place should go to whoever has waited
longest, without the organiser lifting a finger.

## Outline

### Where we are

- Part 4: the organiser creates events, anyone signs up until it's full.
  Link `04-only-the-organiser/`.

### What you'll build

- A sign-up answers `Confirmed(code)` or `Waitlisted(position, code)`; a
  cancellation with a code promotes the next in line.

### The steps

1. A sum type for the outcome of a sign-up, replacing "full" as an error.
2. An opaque `CancelCode`, made only inside the agent.
3. The waiting list in the agent's state, in arrival order.
4. `cancel(code)`, which removes the person and promotes the first waiting.
5. An `invariant` that attendees never exceed capacity; show what happens
   when a deliberately wrong edit breaks it.
6. Routes and tests for each path, using `match`.

### Check it works

- `bynk test`, then fill an event, join the waiting list, cancel, and see the
  promotion with `curl`.

### What you've learned

- Sum types and exhaustive `match`; opaque types; agent invariants. Link *A
  brand the compiler keeps* and the agent invariants reference.

### Next time

- Part 6: tell people they're in.

## Code to quote

- `05-waiting-list/`: the outcome type, `CancelCode`, the agent's waiting
  list, `cancel`, and the invariant.

## Facts to check

- How an invariant failure surfaces at run time and in tests, from the agent
  invariants reference.
- How an opaque code is generated (a `Random` capability?) and returned over
  HTTP.
- If this part runs long, split the invariant into its own part and renumber.

## Sources

- Book: [Agent invariants](https://bynk-lang.org/reference/agent-invariants/)
- Book: [Invariants as contracts](https://bynk-lang.org/book/concepts/agents-and-state/understand-invariants/)
- Book: [Types reference: opaque types](https://bynk-lang.org/reference/types/)

## Video angle

A queue at a door with a numbered ticket for each person; when someone leaves
the room, the front of the queue steps in. A counter over the door can never
go above the number of chairs. About 4:30.
