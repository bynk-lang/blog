---
slug: turn-up-2
series: build-it
workingTitle: "Open the doors"
level: first-steps
repo: turn-up
tags: [http, getting-started]
status: idea                      # ready once 02-open-the-doors/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 2 puts an HTTP service in front of the model: create an event, read it
back. The reader leaves knowing how a route is declared, how a request body
becomes an `Event` before the handler runs (and why a bad one is a `400`
without a line of validation code), and how to try it with `bynk dev`.

## Hook

The `Event` type keeps its rules, but nobody can reach it yet. Open the doors,
and see what happens when someone sends a capacity of minus three.

## Outline

### Where we are

- Part 1's project: a commons with `Event` and its rules, and a test suite.
  Link `01-an-event/`.

### What you'll build

- `POST /events` and `GET /events/:id`, shown as two `curl` calls and their
  responses, including the `400`.

### The steps

1. A context and a `service … from http` with `by Visitor` (say that part 4
   tightens this).
2. `POST /events`: the body is a `NewEvent`; answer `Created`.
3. Where to keep events for now: decide in the code whether part 2 keeps them
   in memory or waits for the agent in part 3, and say so plainly. (The code
   decides; see *Facts to check*.)
4. `GET /events/:id` and `NotFound`.
5. `bynk dev`, then `curl` a good event and a bad one, and read the `400`.
6. A test that calls the routes in process.

### Check it works

- `bynk test`, then `bynk dev` and the `curl` calls.

### What you've learned

- Services and routes; decoding at the boundary; `HttpResult`. Link the
  Book's HTTP guide and *Check once, trust everywhere*.

### Next time

- Part 3 gives each event a memory: an agent.

## Code to quote

- `02-open-the-doors/`: the service and its two routes, and the route tests.

## Facts to check

- How the part stores events before agents arrive. If nothing sensible exists,
  merge parts 2 and 3's storage (an agent from the start) and adjust both
  items.
- Route matching order and typed path parameters at the post's `bynkVersion`
  (v0.659 changed matching).
- The exact `400` body a decoding failure returns.

## Sources

- Book: [Build a small HTTP service](https://bynk-lang.org/book/tutorials/http-service/)
- Book: [HTTP reference](https://bynk-lang.org/reference/http/)
- Book: [Run locally](https://bynk-lang.org/book/guides/projects-build-and-deployment/run-locally/)

## Video angle

Screen recording with a split view: the editor on the left, a terminal with
`curl` on the right. A door graphic opens for the good request and stays shut,
stamped 400, for the bad one. About 4:00.
