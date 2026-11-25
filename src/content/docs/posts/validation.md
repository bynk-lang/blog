---
title: "Check once, trust everywhere"
description: "Input validation that can't be forgotten: Bynk puts the rule in the type, so a value is checked once, where it arrives, and trusted everywhere after."
date: 2026-11-15
authors: matthew
tags: [types, validation, data, http]
excerpt: "Checks get forgotten, repeated and drift apart. Bynk puts the rule in the type, so a value is checked once, where it arrives."
series: the-problem-with
level: first-steps
showcase: [refined-types, decode-json]
bynkVersion: 0.639.1
video: https://youtu.be/BB5PcsUyagY
---

Picture a small online shop. An order line has two parts: a stock code, such
as `TEA-0042`, and a quantity. The shop has a rule: a single line can ask for
between 1 and 99 of something.

The rule is easy to write down. The hard part is making sure it holds for
every order line the shop ever handles: the ones from the website, the ones
from the mobile app, the ones a partner sends overnight, and the ones a
colleague imports from a spreadsheet. This post is about why that's harder
than it looks, and what Bynk does about it.

## The problem

In most code, a quantity is a number. The type says *number*, and the rule
(*between 1 and 99*) lives somewhere else: in an `if` in the request handler,
in a form library, in a database constraint, or in someone's head.

That separation causes three kinds of trouble.

**A check gets forgotten.** The website's handler checks the quantity. Then
someone adds an import job, and it builds order lines straight from a file.
Nothing stops it, because a quantity of 0 is a perfectly good number.

**Checks get repeated, and drift apart.** Unsure whether a value was checked
upstream, the code that prices an order checks again, "just in case", and so
does the code that reserves stock. Now there are three copies of the rule.
One says 1 to 99, one says 1 to 100, and one only checks the number is
positive.

**A bad value travels a long way before anything notices.** A quantity of 0
doesn't crash anything when it arrives. It turns into an order for nothing, a
stock count that never moves, or a refund of £0.00, often several services
away from where it came in. By the time someone sees the symptom, the cause
is hard to find.

All three come from the same place: the rule isn't attached to the value.
Every function that receives a number has to decide whether to trust it, and
nothing in its type helps it decide.

## How it's usually handled

**Validate at the edge.** Check everything as it comes in, in middleware or
the request handler, and trust it afterwards. This is the right instinct, and
it works when there's one way in. When there are several, each edge needs its
own check, and the code further in can't tell which path a value took.

**Annotate the class.** Java's Jakarta Bean Validation (`@Min(1) @Max(99)`)
and .NET's data annotations attach the rule to a field, which keeps it close
to the data. But the rule is only checked when a validator runs, typically
when a framework hands it a request. An object built with `new` in your own
code isn't checked.

**Use a schema library.** Zod, Valibot and io-ts for TypeScript, and Pydantic
for Python, describe the shape and the rules together, and parse untrusted
input against them. They're a big step forward, and widely used for good
reason: one description gives you both the check and the type. Where they
stop is what happens *after* parsing. In TypeScript, the type Zod infers for
`z.number().int().min(1).max(99)` is plain `number`, so once a value is out
of the parser, the rule has gone from its type, and any number can be passed
where a quantity is expected. (Zod's `.brand()`, and the brands in Valibot
and io-ts, can carry it along, if you opt in.) Pydantic checks a model when it's built, but by default not when a
field is changed afterwards, and a function that takes an `int` can't tell a
checked one from any other.

**Parse, don't validate.** Alexis King's 2019 essay of that name gives the
idea its best-known form. Instead of checking a value and keeping the plain
version, turn it into a new type that can only hold valid values, so the
proof that it was checked travels with it. TypeScript's *branded types* (a
`number` tagged with a marker, so a plain `number` won't fit), Rust's *newtype*
pattern (a struct with a private field and a checked
constructor) and Haskell's *smart constructors* all do this. It works well,
but each rule needs its own wrapper type and constructor, written by hand.
And in TypeScript, the protection is a convention: a cast (`as Quantity`)
gets around it.

Some languages go further and put the rule in the type itself. Ada has had
range types (`range 1 .. 99`) since the 1980s, and research tools such as
Liquid Haskell (a checker that runs on Haskell code) attach logical rules to
types. Bynk takes this last route, in
a deliberately small form.

## Bynk's answer

Bynk has **refined types**: a type with a rule attached. Here are the shop's
stock code and quantity, from the showcase:

```bynk
type Sku = String where Matches("[A-Z]{3}-[0-9]{4}")

--- How many of one item a single order line may ask for.
type Quantity = Int where InRange(1, 99)
```

A `Quantity` is an `Int`, but only one from 1 to 99. A `Sku` is a `String`,
but only one that matches the pattern: three capital letters, a dash and four
digits. The rule after `where` is called a **predicate**, and Bynk has a small
set of them: ranges and signs for numbers (`InRange`, `Positive`,
`NonNegative`), lengths and patterns for strings (`NonEmpty`, `MaxLength`,
`Matches` and a few more), and `IsoDate` for dates written as text. You can
combine them with `&&`.

An order line is then a record of the two:

```bynk
type Line = {
	sku: Sku,
	qty: Quantity,
}
```

Because both fields are refined, a `Line` that exists is already valid. There's
no way to make one with a quantity of 0, so no function that takes a `Line`
ever needs to check.

**A refined type has two doors, and both are checked.** A value can become a
`Quantity` in only two ways.

The first is a **literal**: a number or string written in the code, where a
refined type is expected. The compiler checks it while it compiles. Here, a
new line starts with one of the item:

```bynk
fn firstQuantity() -> Quantity {
	1
}
```

`1` passes the rule, so it's admitted as it is. Change it to `0`, and the
project stops building:

```bynk nocheck
fn firstQuantity() -> Quantity {
	0
}
```

```text
[bynk.refine.literal_violates] Error: literal 0 does not satisfy `InRange` required by type `Quantity`
```

The second door is for **everything else**: values that aren't known until
the program runs. These go through the type's `.of` constructor, which checks
the rule and returns a `Result`, either `Ok` with the checked value or `Err`
with a `ValidationError` that says what was wrong. (`Result` is the subject of
[the previous post](../null/), which explains how
Bynk handles failure without exceptions.) Here's a function that adds one more
of an item to a line:

```bynk
fn addOne(line: Line) -> Result[Line, ValidationError] {
	let qty = Quantity.of(line.qty + 1)?
	Ok(Line { sku: line.sku, qty: qty })
}
```

`line.qty + 1` might be 100, so it goes back through `Quantity.of`. The `?`
means "if this failed, return the error to my caller; otherwise, give me the
value". The return type says `addOne` can fail, so its caller can't miss that
either.

There is no third door. Bynk deliberately gives refined types no unchecked
way in, no equivalent of a TypeScript cast, so every `Quantity` has passed
its rule.

**The edge of the program uses the second door for you.** Most values don't
come from your code: they arrive in a request. When an HTTP handler declares
that its body is a `Line`, Bynk checks the body against `Line`'s rules before
the handler runs:

```bynk
on POST("/quotes") (body: Line) -> Effect[HttpResult[Int]] by Visitor {
	Ok(linePrice(body))
}
```

(`Effect[...]` marks a handler that does work rather than just computing a
value, `by Visitor` says who may call it, here anyone, and `linePrice`, shown
below, works out the line's price.) A request with a
quantity of 0, or a stock code of `tea`, gets a `400 Bad Request` with a
`RefinementViolation` body that names the field, and the handler is never
called. The showcase tests this from the outside, sending raw JSON as a client
would:

```bynk
case "a quantity of zero is refused before the handler runs" {
	let r <- api.POST("/quotes", Wire("{\"sku\": \"TEA-0042\", \"qty\": 0}")) by Visitor
	expect r is Rejected(RefinementViolation(_))
}
```

A `case` is one test. `let r <- …` waits for the request to finish and names
the result `r` (`<-` is how Bynk waits for work, where `=` just names a value).
`Wire(...)` sends the text exactly as written, rather than a `Line`, so the
test can send something no valid `Line` could produce. And
`Rejected(RefinementViolation(_))` is the refusal described above: the request
never reached the handler.

On the wire, a `Quantity` is an ordinary JSON number and a `Sku` an ordinary
string. The rule isn't in the JSON; it's applied wherever the JSON is read.

The same applies to path segments, query strings and messages from other
services. If you build your front end in TypeScript, `bynk client` (still
experimental) generates a typed client. There a `Quantity` is a plain
`number`, but the client runs the same rules before it sends a request, so a
form can report a bad quantity without a round trip.

**JSON from anywhere else gets the same treatment.** Not every value arrives
through a handler. A message from a queue, a file from storage or a response
from a partner's API is just text until you decode it. The `decode-json`
showcase project decodes a sign-up form:

```bynk
type Name = String where NonEmpty

type Age = Int where InRange(13, 120)

type Signup = {
	name: Name,
	age: Age,
	note: Option[String],
}
```

```bynk
fn parse(raw: String) -> Result[Signup, DecodeError] {
	Json.decode[Signup](raw)
}
```

`Json.decode` checks the shape (the right fields, with the right base types)
and every rule on the way, so an `Ok` holds a `Signup` that is already valid.
If something is wrong, the `DecodeError` says what kind of problem it was
(the text isn't JSON, the shape is wrong, or a value broke a rule), where it
was (such as `$.age`) and why. `Yaml.decode` reads YAML into the same type,
with the same rules.

**Inside, nothing checks again.** Once a value has come through one of the
doors, every function past that point can rely on it. Pricing a line is one
line of arithmetic (`UnitPence` is the shop's price per item, a constant),
with no `if` in sight:

```bynk
fn linePrice(line: Line) -> Int {
	line.qty * UnitPence
}
```

That's the real difference from checking at the edge by hand. The rule is
written once, in the type, and the compiler, `.of`, the HTTP boundary and
`Json.decode` all apply that same rule. A new way in, such as an import job,
can't skip the check, because there's no way to make a `Line` without it.

In VS Code, hovering over a refined type shows its rule in words, with a
**Try values…** link. It opens a panel of example values and a box where you
can type your own and see which part of the rule it breaks.

## The trade-offs

Refined types are deliberately simple, and some of that simplicity has costs.

- **Arithmetic gives you the base type.** `line.qty + 1` is a plain `Int`,
  not a `Quantity`, because the result might break the rule. The same goes for
  methods: calling `.toUpper()` on a `Name` gives a `String`. To get back into
  the refined type, the value goes through `.of`, and you handle the `Result`.
  The compiler doesn't try to prove that a sum stays in range, so you'll write
  `.of` more often than you might expect.
- **The predicates are a fixed set.** Ranges, lengths, patterns and dates
  cover a lot, but you can't write your own predicate. A card number's
  checksum, or a rule that links two fields ("the end date is after the start
  date"), can't go in a refined type. For those, you write the check yourself:
  for example, an *opaque type* (one that only its own module can build), with
  a constructor that checks the rule and returns a `Result`. That check is your
  code, so it isn't part of the type the way a predicate is, and a generated
  client can't run it.
- **Some regular expressions are refused.** The boundary runs `Matches`
  patterns against untrusted input, and some patterns can take exponential
  time on cleverly crafted text (a *ReDoS* attack). The compiler refuses
  those, such as `(a+)+`, so a pattern you'd copy from elsewhere sometimes
  needs rewriting.
- **One problem at a time.** A `DecodeError` describes one problem, with one
  path. Zod and Pydantic can report every problem in a form at once, which is
  friendlier for someone filling it in. To do that in Bynk, you check the
  fields one by one with `.of` and collect the errors yourself.
- **The error doesn't carry the bad value.** A `ValidationError` has a field
  name and a message, but you can't yet get the rejected value back from it.

## See it working

The [`refined-types`](https://github.com/bynk-lang/showcase/tree/main/refined-types)
project in the showcase is the shop from this post. Its tests try the edges of
each rule (1 and 99 accepted, 0 and 100 refused, a lowercase stock code
refused), check that `addOne` fails at 99, and send raw JSON to the HTTP
service to show bad input refused before the handler runs. The
[`decode-json`](https://github.com/bynk-lang/showcase/tree/main/decode-json)
project decodes the sign-up form from JSON and YAML, and checks the kind and
path of each failure.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/refined-types
bynk test .
cd ../decode-json
bynk test .
```

To go further:

- [Define a refined type and validate untrusted input](https://bynk-lang.org/book/guides/type-system/define-and-validate/),
  the guide in the Bynk book
- [The refined-literal admission model](https://bynk-lang.org/book/concepts/type-system/refined-literal-admission/),
  for why literals and `.of` work the way they do
- [Decode untrusted JSON into a typed value](https://bynk-lang.org/book/guides/type-system/decode-json/)
- The [refined-type reference](https://bynk-lang.org/reference/refined-types/),
  with every predicate

Validation never goes away: someone always has to decide what a valid value
is. What Bynk changes is where that decision lives: in the value's type,
checked at every way in, rather than in whichever handler remembered to check.
