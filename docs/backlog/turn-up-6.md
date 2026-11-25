---
slug: turn-up-6
series: build-it
workingTitle: "Tell them they're in"
level: building
repo: turn-up
tags: [capabilities, agents, testing]
status: idea                      # ready once 06-tell-them/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 6 splits the service in two. The events context announces each sign-up
and promotion as an event, and a new notifications context hears them and
sends an email through a capability. The reader leaves knowing how contexts
talk without naming each other, how a capability and its provider keep email
out of the business logic, and how a test checks an email was sent without
sending one.

## Hook

The sign-up code shouldn't know or care that an email goes out. Tomorrow it
might be a text message, or nothing at all.

## Outline

### Where we are

- Part 5: sign-ups, a waiting list and cancellations, in one context. Link
  `05-waiting-list/`.

### What you'll build

- A second context, `notify`, that emails each confirmed attendee, and a
  test that proves it.

### The steps

1. Event types (`SignedUp`, `Promoted`) in the shared commons.
2. `Events.emit` from the agent or route; say which, and why.
3. A `notify` context: a service `from Events(…)` with `on event`.
4. A capability for sending, provided by Cloudflare's `Email` (experimental:
   show the `[unstable] allow` line).
5. Tests: stub the mailer and `expect … called once`; deliver an event to
   `notify` in a test.
6. Look at the architecture map: two contexts and the arrow between them.

### Check it works

- `bynk test` across both contexts; `bynk dev`, sign up, and see the email
  in the dev output (or however `bynk dev` shows it).

### What you've learned

- Contexts, events, capabilities and providers, `stub`. Link *The checkout
  that doesn't know who's listening* and *A diagram that can't go out of
  date*.

### Next time

- Part 7: a reminder the day before.

## Code to quote

- `06-tell-them/`: the event types, the emit, the `notify` service, the
  capability declaration and the tests.

## Facts to check

- Whether `Email` is still experimental, and what `bynk dev` does with a send.
- Event delivery guarantees between contexts (at least once?), from the
  events concept page, so the post doesn't overclaim.
- Whether to wrap `Email` in a domain capability of the project's own (as the
  `capabilities-and-providers` showcase does) or use it directly; decide in the
  code.

## Sources

- Book: [Understand events](https://bynk-lang.org/book/concepts/events/understand-events/)
- Book: [Send transactional email](https://bynk-lang.org/book/guides/effects-and-capabilities/send-transactional-email/)
- Book: [Split into contexts](https://bynk-lang.org/book/tutorials/contexts/)
- Book: [Understand the capability model](https://bynk-lang.org/book/concepts/effects-and-capabilities/understand-the-capability-model/)

## Video angle

The events context rings a bell; the notifications context, in the next room,
hears it and posts a letter. Neither can see the other. About 4:30.
