---
title: "Who really sent this?"
description: "A webhook proves where it came from with a signature over its body, and checking one by hand goes wrong in quiet ways: the wrong bytes, a leaky comparison, no replay guard, or a route that skips it. Why Bynk generates the check from one declaration."
date: 2026-11-21
authors: matthew
tags: [security, http, validation]
excerpt: "Checking a webhook's signature by hand is easy to get subtly wrong. Bynk declares the sender once and generates the check."
series: the-problem-with
level: building
showcase: verify-webhooks
bynkVersion: 0.639.1
---

A payment processor sends your service a notice whenever a customer pays: a
`POST` to a URL you gave it, with a small JSON body. Your service marks the
order as paid and ships the goods.

The URL is on the public internet, so anyone can post to it. If your service
believes every notice it receives, anyone who finds the URL can mark orders
as paid. So the processor signs each notice, and your service checks the
signature before it believes a word. This post is about that check: why it's
easy to get wrong, and what Bynk does about it.

## The problem

Most webhook providers use the same scheme. The sender and receiver share a
secret. The sender computes an **HMAC** of the request body (a short code
that only someone holding the secret can produce for those exact bytes) and
sends it in a header. The receiver computes the same code over the body it
received and compares the two. If they match, the notice came from someone
who knows the secret, and nobody changed it on the way.

That's a few lines of code, and there are several quiet ways to get them
wrong. None of them fails a test that only sends good requests.

**Hashing the wrong bytes.** The signature is over the exact bytes the sender
sent. Most web frameworks parse a JSON body before your handler sees it, and
turning the parsed object back into JSON rarely gives the same bytes: the
spacing, the key order or the number formatting can differ. Then every
signature fails, and the tempting "fix" is to loosen the check.

**Comparing the wrong way.** An ordinary string comparison stops at the first
character that differs, so it takes slightly longer the more of the signature
an attacker has guessed right. Measured over enough requests, that difference
can leak the correct signature. The comparison has to take the same time
whatever the input: a *constant-time* comparison.

**Accepting old notices.** A signed notice stays validly signed for ever. If
someone captures one, they can send it again, and again. Without a signed
timestamp and a time limit, the receiver can't tell a replay from the
original.

**Forgetting a route.** The check lives in one handler, or in middleware
attached to some routes. When someone adds a second webhook route, nothing
reminds them to attach it.

## How it's usually handled

**Write the check by hand, carefully.** Every language has the pieces.
Express's body parser takes a `verify` callback that keeps the raw bytes, and
`express.raw()` skips parsing altogether. Node has `crypto.timingSafeEqual`,
Python has `hmac.compare_digest` and Java has `MessageDigest.isEqual` for the
comparison. Done well, this works. But each of the four mistakes above is
avoided only by remembering it, on every route.

**Use the provider's library.** Stripe's SDK has
`stripe.webhooks.constructEvent`, which takes the raw body, the signature
header and the secret, checks the signature in constant time, and refuses a
notice more than five minutes old by default. GitHub's Octokit has
`@octokit/webhooks`, and Svix publishes libraries for the Standard Webhooks
format. These are well made, and they're the right choice in most languages.
They still leave two jobs to you: getting the raw body to them before a
framework parses it, and calling them on every route that needs them.

**Test the failure cases.** A test suite that sends a forged signature, an
unsigned request and an old one catches most of these mistakes. In practice,
those tests are often skipped: building a correctly signed request in a test
is fiddly (Stripe's Node SDK has a helper for it,
`generateTestHeaderString`, but most providers don't), and building wrong
ones on purpose is more fiddly still.

## Bynk's answer

In Bynk, the sender of a webhook is an **actor**: a declaration of who may
call a route and how they prove it. The
[`verify-webhooks`](https://github.com/bynk-lang/showcase/tree/main/verify-webhooks)
showcase project receives payment notices:

```bynk
type Payment = {
	id: String,
	amountPence: Int,
}
```

from a processor declared as a `Signature` actor:

```bynk
actor Processor {
	auth = Signature(
		secret = "WEBHOOK_SECRET",
		header = "X-Signature",
		timestamp = "X-Timestamp",
		tolerance = 300
	)
}
```

`secret` names the environment variable that holds the shared secret (not
the secret itself). `header` is where the signature arrives, and `timestamp`
and `tolerance` say the sender also signs the time, and that a notice more
than 300 seconds old is refused.

The handler names the actor after `by`, and does nothing about signatures
itself:

```bynk
on POST("/webhooks/payment") (
	body: Payment
) -> Effect[HttpResult[String]] by Processor given Crypto, Secrets {
	let receipt <- receiptFor(body.id)
	match receipt {
		None => ServiceUnavailable("receipts are not configured"),
		Some(r) => Ok(r),
	}
}
```

The handler answers each notice with a receipt: `receiptFor` signs the
payment's id with a second key of the service's own, and returns `None` when
that key isn't configured, hence the `503`. That's the service's own
business, not part of the webhook check, and so is `given Crypto, Secrets`,
which lists what the handler itself uses to sign the receipt.

From that declaration, the compiler generates the check, and runs it before
the handler. It takes each of the four mistakes in turn:

- **The right bytes.** The generated code reads the body once, computes
  HMAC-SHA256 over what it read, and only then parses the `Payment`, from the
  same text. The parsed object is never turned back into JSON to be hashed.
- **The right comparison.** It verifies with `crypto.subtle.verify`, the
  HMAC check in the Web Crypto API (the cryptography built into the
  JavaScript runtimes Bynk compiles for), which Bynk's runtime relies on to
  compare in constant time, rather than comparing strings.
- **A replay window.** With a `timestamp`, the signed text is
  `<timestamp>.<body>`, and a timestamp more than `tolerance` seconds from now
  is refused.
- **Every route.** Every HTTP handler must name its caller after `by`; leave
  it out and the program doesn't compile. So whether a route checks a
  signature is part of its first line: `by Processor`. A route that doesn't
  check says `by Visitor` (anyone) instead, where a reviewer can see it.

Any signature failure answers `401 Unauthorized`, and the handler never runs;
a body that isn't a `Payment` is refused with a `400`. So by the time the
handler's first line runs, the notice is from the processor, a well-formed
`Payment` and, when the sender signs a timestamp, recent.

**The failure cases are easy to test.** A test at the `system` tier runs the
service as it will be deployed, so the generated check sees every request.
The test driver signs each request as `Processor` declares, so a plain call
is a correctly signed one. Three reserved names send what the check must
refuse: `by Nobody` sends no signature, `by Forged` signs with the wrong
secret, and `by Stale` sends an old timestamp:

```bynk
case "a notice signed with the wrong secret is refused" {
	let notice = Payment {
		id: "pay_1",
		amountPence: 1250,
	}
	let r <- webhooks.POST("/webhooks/payment", notice) by Forged
	expect r is Rejected(Unauthorized)
}
```

(`<-` waits for the request to finish, and `Rejected(Unauthorized)` is the
`401`, refused before the handler.)

A correct signature doesn't excuse a bad body, either. `Wire(...)` sends text
exactly as written, and the driver signs that text too, so this notice passes
the signature check and is then refused because its amount isn't a number:

```bynk
case "a signed but malformed body is refused" {
	let r <- webhooks.POST(
		"/webhooks/payment",
		Wire("{\"id\": \"pay_2\", \"amountPence\": \"lots\"}")
	)
	expect r is Rejected(StructuralMismatch(_))
}
```

## The trade-offs

- **One signature format.** The generated check handles HMAC-SHA256, sent as
  a hex digest (bare, or as `sha256=…`), with an optional timestamp in a
  header of its own. GitHub's format fits, though GitHub signs no timestamp,
  so a GitHub webhook gets no replay window. Others don't fit yet: Stripe's
  single header that carries both the timestamp and the signature
  (`t=…,v1=…`), signatures encoded as base64 (as Shopify's are), the Standard
  Webhooks format (base64, over the message id, timestamp and body), and
  public-key signatures (signed with the sender's private key and checked
  with their public key), such as Ed25519. Bynk's design notes plan particular providers'
  formats as a later layer over the same check. Until then, a route can take the raw body
  and the headers and check the signature itself with `bynk.crypto`. That
  capability is experimental, and you're back to writing the check by hand.
- **A window, not a guarantee.** The timestamp limits a replay to five
  minutes; it doesn't stop one. Providers retry, too, so the same genuine
  notice can arrive twice. Removing duplicates by the notice's id is a
  separate job, for the `Idempotency` capability.
- **A JSON body is checked as text.** On a JSON route, the check signs the
  body after decoding it as UTF-8, so a body with a byte-order mark or bytes
  that aren't valid UTF-8 won't verify, even if the sender signed it
  correctly. A route that takes the raw body (`@raw`, with `body: Bytes`)
  signs the bytes exactly as received.
- **One secret at a time.** The actor takes one secret, with no slot for the
  previous one while you rotate it. (Bynk's signed cookies have one; webhook
  signatures don't, yet.)
- **The body is read whole.** The signature covers the entire body, so a
  signed route can't stream its body as it arrives. That suits notices, which
  are small, but rules out a signed upload of a large file.
- **The check is all or nothing.** A failed signature is always a `401`
  before the handler runs. You can't log the rejected body or answer
  differently from inside the handler, because it never runs.

## See it working

The [`verify-webhooks`](https://github.com/bynk-lang/showcase/tree/main/verify-webhooks)
project is the payment service from this post. Its tests send a correctly
signed notice, an unsigned one, a forged one, a stale one and a signed but
malformed one. Its README also shows how to send a signed notice with `curl`
and `openssl` while the service runs locally.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/verify-webhooks
bynk test .
```

To go further:

- [Verify an inbound webhook](https://bynk-lang.org/book/guides/actors/verify-webhooks/),
  the guide in the Bynk book
- The [actors reference](https://bynk-lang.org/reference/actors/), for
  `Signature` and the other kinds of actor
- [The failure principals](https://bynk-lang.org/reference/testing/#failure-principals),
  for `Nobody`, `Forged` and `Stale`
- [Deduplicate at-least-once deliveries](https://bynk-lang.org/book/guides/effects-and-capabilities/deduplicate-at-least-once-deliveries/),
  for what the replay window leaves to you

Checking a webhook was never hard to write. It was hard to write correctly
every time, on every route. Bynk moves the check into a declaration, so
getting it right is a property of the route, not of whoever wrote it last.
