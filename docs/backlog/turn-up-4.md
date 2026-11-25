---
slug: turn-up-4
series: build-it
workingTitle: "Only the organiser"
level: building
repo: turn-up/04-only-the-organiser
tags: [security, http]
status: idea                      # ready once 04-only-the-organiser/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 4 decides who may do what. Anyone may read an event and sign up; only
the organiser may create one. The reader leaves knowing how an actor puts
"who may call this?" on the route, why `401` and `403` are different answers,
and why every route has to say who may call it, even the public ones.

## Hook

Right now anyone with `curl` can create an event called "Free tickets". Time
to lock the front office and leave the box office open.

## Outline

### Where we are

- Part 3's service and agent. Link `03-whos-coming/`.

### What you'll build

- `POST /events` refuses a request with no token (`401`) and one from someone
  who isn't an organiser (`403`); reading and signing up still work for
  anyone.

### The steps

1. `actor Organiser { auth = Bearer(…), identity = … }`, with the secret's
   environment variable.
2. `by Organiser` on `POST /events`; keep `by Visitor` on the public routes,
   on purpose.
3. Record who created an event, from the verified identity.
4. Tests: `by Organiser("ada")`, and a call with no actor.
5. Try it with `bynk dev` and a token (say how to make one locally).

### Check it works

- `bynk test`; three `curl` calls: no token, wrong token, good token.

### What you've learned

- Actors, `by`, verified identity; `401` versus `403`. Link the Book's
  actors guides (and *Inside the showcase: actors*, if it's published by
  then).

### Next time

- Part 5: cancelling, and a waiting list.

## Code to quote

- `04-only-the-organiser/`: the actor, the routes' `by` clauses and the
  tests.

## Facts to check

- How to produce a valid bearer token for local testing, from the actors
  reference or guides.
- Whether a refinement actor (`… where hasClaim(…)`) is the better fit than a
  separate secret: decide in the code, and match the post to it.

## Sources

- Book: [Public and authenticated routes](https://bynk-lang.org/book/guides/actors/public-and-authenticated/)
- Book: [Authorisation](https://bynk-lang.org/book/guides/actors/authorisation/)
- Book: [Actors reference](https://bynk-lang.org/reference/actors/)

## Video angle

A building with two counters: a box office open to everyone, and a staff door
that checks a badge. No badge: 401. A badge, but not staff: 403. About 4:00.
