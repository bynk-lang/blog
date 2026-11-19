---
title: "Getting started with Bynk"
description: "From nothing installed to a deployed service in one sitting: open the Bynk starter in a codespace, run its tests, read its code, change it and deploy it, with the reasons for what you see along the way."
date: 2026-10-31
authors: matthew
tags: [getting-started, starter, agents, refined-types]
excerpt: "Open the Bynk starter in your browser, run it, change it and deploy it, and see why the code looks the way it does."
level: first-steps
repo: starter
bynkVersion: 0.639.1
---

Bynk is a statically typed language for building services. You write Bynk,
and the compiler produces TypeScript that runs on Cloudflare Workers. This post
takes you from nothing installed to a deployed service, using a small starter
project: a guestbook, where people sign a book over HTTP and read back the
latest entries.

It's written for developers who know their way around a web service, probably
in TypeScript. Expect to spend about half an hour. Each step says what to do,
then explains what you're looking at.

## 1. Get the starter

Go to [bynk-lang/starter](https://github.com/bynk-lang/starter) and choose
**Use this template → Create a new repository**. Then, on your new repository,
choose **Code → Codespaces → Create codespace on main**.

That gives you VS Code in the browser, with the Bynk compiler, Node, wrangler
and the Bynk extension already installed. The first start takes a minute or
two. If you'd rather work locally, the starter's README covers that too:
install Bynk, clone your copy, and run `bynk doctor`, which tells you what's
missing and how to fix it.

The Bynk version comes from one file, `BYNK_VERSION`. The codespace, CI and the
deploy all read it, so they always use the same compiler.

## 2. Run the tests

In the terminal:

```sh
bynk test .
```

The tests pass, in three groups. The first tests the rules about what an entry
may contain. The second tests the guestbook's storage directly. The third,
marked `system`, sends raw JSON through the HTTP service, including requests
that should be refused.

That third group matters more than it looks. In many frameworks, the code that
checks a request body is separate from the types your handler uses, so it's
possible to test one and not the other. Schema libraries such as Zod or
Pydantic close that gap by deriving the type from a schema. In Bynk the type
*is* the check, with no separate library, and a system test proves it from the
outside.

## 3. Read the rules

Open `src/guestbook/entries.bynk`. This file is a **commons**: plain types and
pure functions, with no state and no access to the outside world.

```bynk
type Name = String where NonEmpty && MaxLength(40)

type Message = String where NonEmpty && MaxLength(280)

type Entry = {
	name: Name,
	message: Message,
}
```

`Name` and `Message` are **refined types**: a type with a rule attached. A
`Message` is a `String`, but only one between 1 and 280 characters long
(counted the way JavaScript's `.length` counts, so some emoji count as two). You
can't get a `Message` that breaks the rule. A value written in your code is
checked when it compiles, and one that arrives while the program runs is
checked on the way in.

So an `Entry` is valid by construction. Code that receives one doesn't need to
check it again, and can't forget to.

## 4. Read the guestbook

Now open `src/guestbook/app.bynk`. It's a **context**: the part of the app that
has state and talks to the world. First comes the agent that keeps the entries:

```bynk
agent Guestbook {
	key book: BookName

	store entries: Log[Entry]

	on call sign(entry: Entry) -> Effect[()] given Clock {
		do entries.append(entry)
	}

	on call latest(count: Int) -> Effect[List[Entry]] {
		entries.recent(count).collect()
	}
}
```

An **agent** is a piece of state together with the handlers that change it.
Each guestbook name gets its own agent, so `Guestbook("cafe")` and
`Guestbook("library")` never share entries. The name is a `BookName`, declared
at the top of `app.bynk`: one more refined type, any non-empty string. On
Cloudflare, each agent is a Durable Object (Cloudflare's way of giving one key
its own state and a single instance that handles it), but you don't write any
of that code: the compiler generates it.

`store entries: Log[Entry]` is the stored state: a `Log`, an append-only list
that stamps each entry with the time it was added. Bynk has five kinds of
store, and you pick the one that fits how the data lives.

Look at the end of the `sign` line: `given Clock`. Adding to a `Log` reads the
time, so the handler has to say it uses the clock. In Bynk, the outside world
(time, the network, secrets, randomness) is reached through **capabilities**,
and a handler lists the ones it uses. You can tell what any handler might
touch by reading its signature, and tests can control the clock, moving time
forward without waiting.

`Effect[...]` marks something that does work rather than just computing a
value. `do` performs an effect when you don't need its result.

## 5. Read the service

Below the agent is the HTTP service:

```bynk
service api from http {
	on POST("/books/:book/entries") (
		book: BookName,
		body: Entry
	) -> Effect[HttpResult[Entry]] by Visitor {
		do Guestbook(book).sign(body)
		Created(body)
	}

	on GET("/books/:book/entries") (book: BookName) -> Effect[HttpResult[List[Entry]]] by Visitor {
		let entries <- Guestbook(book).latest(20)
		Ok(entries)
	}
}
```

A few things are worth noticing.

- **The route parameters and body are typed.** `book` is a `BookName` and
  `body` is an `Entry`, so the request is checked against those types before
  the handler runs. A bad request never reaches your code.
- **`by Visitor` says who may call.** `Visitor` means anyone, with no sign-in.
  A route that needs a signed-in user names a different actor, and every HTTP
  route has to say who it's for, or it doesn't compile.
- **The status is a value.** `Created(body)` is a 201 and `Ok(entries)` is a
  200. They're ordinary values of the route's return type, `HttpResult`, not
  calls on a response object.
- **`<-` waits for an effect's result.** `let entries <- …` calls the agent and
  binds what it returns.

## 6. Run it

```sh
bynk dev
```

This serves the app on port 8787 and rebuilds when you save. The codespace
forwards the port for you. In a second terminal, sign the book and read it:

```sh
curl -X POST localhost:8787/books/cafe/entries \
  -H 'content-type: application/json' \
  -d '{"name": "Ada", "message": "Lovely tea."}'

curl localhost:8787/books/cafe/entries
```

Then try an empty message. The service refuses it with a `400` before your
handler runs. In the response, `path` names the field, and the violation names
the type whose rule it broke:

```text
{"kind":"RefinementViolation","path":"$.message","violation":{"field":"Message","message":"must be non-empty","value":""}}
```

That's the `Message` type from step 3, enforced at the edge of the service.
There's no validation code anywhere in the app.

## 7. Make a change

Let people rate their visit from 1 to 5. In `entries.bynk`, add a refined type
and a field on `Entry`:

```bynk nocheck
type Rating = Int where InRange(1, 5)

type Entry = {
	name: Name,
	message: Message,
	rating: Rating,
}
```

Run `bynk check .`. The compiler reports two kinds of problem. The first is
every place that builds an `Entry` without a rating, all of them in the tests:

```text
[bynk.resolve.missing_field] Error: missing required field `rating` for record `Entry`
```

The second is about data you've already stored:

```text
[bynk.agent.non_additive_state_change] Error: agent `Guestbook`'s stored state
  changed in a way deployed data cannot be read through — field(s) retyped:
  entries (entries.rating added without a default)
```

When you ran `bynk dev` in step 6, Bynk recorded the shape of everything the
guestbook stores in a file called `bynk.schema.lock`. A deployed guestbook
would hold entries with no rating, and a required `rating` would make them
unreadable, so the compiler stops you before that can happen. The error's note
lists the safe ways forward: give the field a default, stage the change through
a new field, or write a migration that carries the old entries forward.

Nothing has been deployed yet, so there are no real entries to protect. The
note says that in this case you can drop the guestbook's entry from
`bynk.schema.lock`; with only one agent, it's simplest to delete the whole file,
and the next build records the new shape as a fresh starting point. Locally,
`bynk dev` starts each run with empty storage, so there are no old entries to
carry over either.

Now fix the tests. Add a rating to each `Entry` the compiler pointed at, and add
`"rating": 5` to the raw JSON in the system tests, which the compiler can't see
inside. Then copy the "empty message" system test into one that sends a rating
of 6, and check it's refused.

Notice what you *didn't* change: the service and the agent. Both work in terms
of `Entry`, so the new field is checked on the way in and stored with the rest
without another line of service or agent code.

## 8. Deploy it

The starter's deploy workflow deploys to Cloudflare Workers on every push to
`main`, once you add two repository secrets: `CLOUDFLARE_API_TOKEN` (a token
that can edit Workers) and `CLOUDFLARE_ACCOUNT_ID`. Until then, it skips the
deploy with a warning, and each pull request shows a dry run of what would be
deployed. To deploy from your codespace instead, run `bynk deploy`.

Once you've deployed, commit `bynk.schema.lock`. From then on, it describes
data that really exists, so deleting an entry from it is no longer the answer:
when the compiler refuses a change to stored data, as it did in step 7, take
one of the safe routes its note describes.

## What you've seen

In one small app, you've met the main ideas in Bynk:

- **Refined types** carry their rules with them, so a value is checked once,
  where it enters, and trusted everywhere after.
- **Agents** hold state, one per key, and the compiler generates the Durable
  Object.
- **Capabilities** like `Clock` appear in a handler's signature, so you can see
  what code touches.
- **Services** take typed requests and return statuses as values, and the
  boundary refuses bad input before your code runs.

## Where next

- The [Bynk Book](https://bynk-lang.org/book/): tutorials, guides and the full
  reference. If you're coming from TypeScript, start with
  [Coming from TypeScript](https://bynk-lang.org/book/introduction/coming-from-typescript/).
- The [showcase](https://github.com/bynk-lang/showcase): small projects, one
  feature each, from money to webhooks.
- The rest of this blog, especially
  [The problem with money](../the-problem-with-money/), for the
  thinking behind one of those features.

The starter is small on purpose. Make it yours: change the guestbook into
whatever you meant to build, and keep the tests passing as you go.
