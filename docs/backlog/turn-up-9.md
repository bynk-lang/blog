---
slug: turn-up-9
series: build-it
workingTitle: "Ship it"
level: building
repo: turn-up/09-ship-it
tags: [deployment, tooling]
status: idea                      # ready once 09-ship-it/ is merged in bynk-lang/turn-up
pr:
published:
video: none
---

## Brief

Part 9 puts Turn up on the internet. The reader deploys it to their own
Cloudflare account, sets its secrets, watches live logs, and rolls back a bad
release. They leave with a running service they built from an empty folder,
and a clear list of what to try next.

## Hook

Eight posts of tests passing on your laptop. One command to make it real.

## Outline

### Where we are

- Part 8: the whole service, tested. Link `08-tapped-twice/`.

### What you'll build

- Turn up running on `*.workers.dev`, with its organiser secret set, and a
  rollback you've tried once on purpose.

### The steps

1. Sign in to Cloudflare and check `bynk.toml` (name, account, the email
   sender).
2. Set the secret for the organiser's token.
3. `bynk deploy`; create an event and sign up with `curl` against the live
   URL.
4. `bynk tail` while you do it.
5. Ship a deliberate mistake, see it in the logs, `bynk revert`.

### Check it works

- The live `curl` calls, the email in your inbox, the logs in the terminal.

### What you've learned

- Deploy, secrets, logs and rollback. A recap of the series: what each part
  added, as one list with links.

### Next time

- Where to go from here: the Book's tutorials, the showcase, and the other
  series on this blog.

## Code to quote

- `09-ship-it/`: `bynk.toml` and any change needed for deployment.

## Facts to check

- `bynk deploy`, `bynk tail` and `bynk revert` flags and output at the pinned
  version; how secrets are set.
- What sending real email needs on Cloudflare (a verified sender or domain),
  and whether that's a blocker for a reader without a domain: if it is, keep
  the stub for the live deploy and say so.
- Whether the reader needs a paid Workers plan for anything used.

## Sources

- Book: [Deploy to Cloudflare](https://bynk-lang.org/book/guides/projects-build-and-deployment/deploy-to-cloudflare/)
- Book: [Roll back a deployment](https://bynk-lang.org/book/guides/projects-build-and-deployment/roll-back-a-deployment/)
- Book: [The `bynk` CLI](https://bynk-lang.org/reference/tooling/bynk-cli/)
- Getting started (the prologue) for the install steps.

## Video angle

The map from every part, lit up one context at a time, then a terminal: one
command, a URL, a phone opening it. About 4:00.
