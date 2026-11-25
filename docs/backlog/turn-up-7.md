---
slug: turn-up-7
series: build-it
workingTitle: "See you tomorrow"
level: building
repo: turn-up/07-see-you-tomorrow
tags: [testing, concurrency]
status: idea                      # ready once 07-see-you-tomorrow/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 7 sends every attendee a reminder the day before their event. A
scheduled service wakes each hour, finds the events starting in about a day
and asks the notifications context to remind their attendees. The reader
leaves knowing how `from cron` runs code on a timetable, why the scheduled
time arrives as a parameter instead of a call to the clock, and how a test
moves time forward without waiting.

## Hook

Testing "the day before" shouldn't take a day.

## Outline

### Where we are

- Part 6: two contexts, and an email when you're in. Link `06-tell-them/`.

### What you'll build

- An hourly job that sends each reminder once, and a test that runs a week of
  hours in under a second.

### The steps

1. A service `from cron("0 * * * *")` with the scheduled time as a parameter.
2. Find events starting 23–24 hours after that time (say how the events are
   found: an index agent, or a list kept by the organiser's agent).
3. Emit `ReminderDue` for each; `notify` sends the email.
4. Remember which reminders went out so a rerun doesn't repeat them (a
   forward pointer to part 8).
5. Tests with virtual time: set the clock, run the schedule, advance an hour.

### Check it works

- `bynk test`; trigger the cron locally with `bynk dev` (say how).

### What you've learned

- Scheduled services, time as a value, virtual time in tests. Link *A clock
  you can stop* once it's published, and the Book's time pages.

### Next time

- Part 8: what happens when a request arrives twice.

## Code to quote

- `07-see-you-tomorrow/`: the cron service, the window calculation and the
  virtual-time tests.

## Facts to check

- The cron syntax Bynk accepts and how `bynk dev` triggers a scheduled
  service.
- How a context finds "all events" without a table scan: decide in the code
  (an index agent is the likely answer) and explain it briefly.
- The virtual-time API in tests.

## Sources

- Book: [Run a task on a schedule](https://bynk-lang.org/book/guides/entry-points/cron/)
- Book: [Cron reference](https://bynk-lang.org/reference/cron/)
- Book: [Testing reference: latency and virtual time](https://bynk-lang.org/reference/testing/#stub-latency)

## Video angle

A wall clock spun forward by hand while envelopes drop out of a letterbox,
one per event, never two. About 3:30.
