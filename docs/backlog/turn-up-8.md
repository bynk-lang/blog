---
slug: turn-up-8
series: build-it
workingTitle: "Tapped twice"
level: building
repo: turn-up
tags: [idempotency, http]
status: idea                      # ready once 08-tapped-twice/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 8 makes signing up safe to repeat. A phone on a train sends the same
sign-up twice; without care, that's two places taken and two emails. The
reader leaves knowing how an idempotency key turns a repeat into the same
answer, how Bynk's `Idempotency` claim and remember work, and where in the
flow to put them.

## Hook

The button said "Sign up". The train went into a tunnel. Your user pressed it
again. How many places did they take?

## Outline

### Where we are

- Part 7: reminders on a timetable. Link `07-see-you-tomorrow/`.

### What you'll build

- `POST /events/:id/signups` that accepts an `Idempotency-Key` header and
  gives the same answer however many times it's sent.

### The steps

1. Write a test that sends the same sign-up twice and fails: two places, two
   emails.
2. Read the key from the header; refuse a sign-up without one, or decide
   it's optional, and say why.
3. Claim the key, do the work, remember the answer; return the remembered
   answer on a repeat.
4. What happens if two copies arrive at the same moment.
5. Make the test pass.

### Check it works

- `bynk test`; two identical `curl` calls with the same key.

### What you've learned

- Idempotency keys, claim and remember. Link *Doing it twice should be the
  same as doing it once*.

### Next time

- Part 9: put it on the internet.

## Code to quote

- `08-tapped-twice/`: the sign-up route with the idempotency key, and the
  repeat test.

## Facts to check

- The `Idempotency` API and its retention, from the reference, at the
  version the turn-up repo pins.
- Whether the agent alone already makes a repeated sign-up harmless (same
  person twice): if so, say what idempotency adds (the same cancel code and a
  single email).

## Sources

- Book: [The `Idempotency` capability](https://bynk-lang.org/reference/bynk-capabilities/#the-idempotency-capability)
- Book: [Deduplicate at-least-once deliveries](https://bynk-lang.org/book/guides/effects-and-capabilities/deduplicate-at-least-once-deliveries/)

## Video angle

A finger taps a button twice; two identical envelopes travel to the server,
the second is stamped "seen" and gets a photocopy of the first answer. About
3:00.
