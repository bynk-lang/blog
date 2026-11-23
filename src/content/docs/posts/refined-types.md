---
title: "One rule, everywhere it reaches"
description: "Refined types attach a rule to a type, and the rule follows the value everywhere: into the compiler, the HTTP boundary, the tests, the editor and the TypeScript the compiler writes. A tour of the whole feature, how it works, and where it stops."
date: 2026-11-18
authors: matthew
tags: [types, validation, testing, tooling]
excerpt: "One rule, written once in a type, and everywhere it reaches: the compiler, the boundary, the tests, the editor and the generated TypeScript."
series: a-closer-look
level: building
showcase: [refined-types, money, capabilities-and-providers, testing]
bynkVersion: 0.639.1
video: https://youtu.be/-jex83geABM
---

["Check once, trust everywhere"](../validation/) showed what
refined types are for: a rule written once, in the type, so a value is checked
where it arrives and trusted everywhere after. That post kept to the one idea.
This one takes the feature apart. It looks at which rules you can write,
what the compiler does with them, how they reach your tests and your editor,
and the edges where they stop.

## What it's for

A refined type answers a question that comes up in every service: *which
values of this type are allowed?* An `Int` can be any integer, but a seat
count can't be zero, a tax rate can't be 1.5, and a stock code has a format.
Most languages leave that answer in a function somewhere. Bynk writes it in
the type, as a **predicate** (a rule that is true or false for each value),
after `where`.

Once the rule is in the type, every tool that knows the type knows the rule.
That's the thread through the rest of this post.

## A tour

**Rules for numbers and strings.** The predicates come from a small, fixed
set. Numbers can be `Positive`, `NonNegative` or `InRange(lo, hi)`, and that
works for `Int`, `Float` and `Decimal` alike. Here are two from the
[`money`](https://github.com/bynk-lang/showcase/tree/main/money) project,
where a `Decimal` is an exact decimal number and `0.20d` is a `Decimal`
literal:

```bynk
type Price = Decimal where Positive

--- A tax rate as a fraction, so 20% is `0.20d`.
type Rate = Decimal where InRange(0.00d, 1.00d)
```

`InRange` includes both ends, and its bounds are written in the base type's
own literals: `0.00d` for a `Decimal`, `0` for an `Int`.

Strings can be `NonEmpty`, `MinLength(n)`, `MaxLength(n)`, `Length(n)`,
`IsoDate` (a calendar date written `YYYY-MM-DD`, which must exist, so
`2026-02-29` is refused), or `Matches(regex)`, where the whole string must
match. Rules combine with `&&`. The
[`capabilities-and-providers`](https://github.com/bynk-lang/showcase/tree/main/capabilities-and-providers)
project uses both kinds for a city name that's safe to put in a URL:

```bynk
type City = String where Matches("[a-z]+(-[a-z]+){0,3}") && MaxLength(40)
```

The compiler checks the rules themselves, too. A range with its bounds the
wrong way round, a negative length, an invalid regular expression, or a set of
rules that no value could satisfy are all compile errors, so a type can't
quietly reject everything.

**Two ways in, both checked.** A literal written where a refined type is
expected, such as a return value or an argument, is checked by the compiler.
Any other value goes through the type's `.of` constructor, which checks the
rule when the program runs and returns a `Result`. The validation post covers
both, so here's the one thing to add: Bynk also has `is` for checking a value
in an `if`. With the validation post's `Quantity` (an `Int` from 1 to 99),
`if n is Quantity { … }` runs the rule, and inside the branch `n`
*is* a `Quantity`, so it can be passed straight on without `.of`. It works
like a TypeScript type guard or a Kotlin smart cast, except that the compiler
writes the guard from the rule. Reach for
`.of` when the failure is something to report, and `is` when it just decides
which way the code goes.

**Reading a refined value.** A `Quantity` is still an `Int` when you read it.
You can compare it, do arithmetic with it, or call any `Int` method on it, and
a `Name` (a non-empty `String`) has all the `String` methods. What comes back
is the plain base type: `name.toUpper()` is a `String`, and for a quantity
`qty`, `qty + 1` is an `Int`, because the result might break the rule.

**Tests get valid values for free.** A test often needs a value of some type
and doesn't care which. `Val[T]` builds one from the type's rule. The
[`testing`](https://github.com/bynk-lang/showcase/tree/main/testing) project
describes seat holds at a box office:

```bynk
type HoldId = String where Matches("H-[0-9]{4}") @example("H-0001")

--- One booking holds between one and eight seats.
type Seats = Int where InRange(1, 8)
```

and its tests build a hold without caring about its reference or seat count:

```bynk
fn placedAtEpoch() -> Hold {
	Hold {
		id: Val[HoldId],
		seats: Val[Seats],
		placedAt: Instant.fromEpochMillis(0),
	}
}
```

`Val[Seats]` is `1`, the bottom of the range. A pattern is harder: the
compiler can't invent a string that matches any regular expression, so
`HoldId` carries an `@example`, and `Val[HoldId]` uses it. The compiler checks
the example against the rule when it compiles the type, so the example can't
drift out of date. When a test does care, it pins the value, and the pin is
checked too:

```bynk
case "eight seats is the most a booking may hold" {
	// `?` unwraps the `Ok`, and an `Err` would fail this case right here.
	let most = Seats.of(8)?
	expect most == Val[Seats](8)
	expect Seats.of(9) is Err(_)
	expect Seats.of(0) is Err(_)
}
```

`Val[Seats](9)` wouldn't compile. The rule also drives **property tests**,
which check a claim against many generated values: `for all n: Seats` tries
1, 8 and values in between, so the edges of the range are always tested. A
property that only restates the type's own rule, such as "every `Seats` is at
least 1", is flagged as proving nothing.

**The editor knows the rule.** In VS Code (the Bynk extension, version
0.639.4), hovering over a refined type lists
its rules in words, with a **Try values…** link. That opens a panel of example
values from the type's range, and a box where you can type a value and see
which part of the rule it breaks. It's a quick way to check a regular
expression does what you meant before a test does.

## How it works

**In TypeScript, a refined type is a branded type.** The compiler turns
`Seats` into a TypeScript type that is a `number` with a *brand*: a marker
that exists only while TypeScript checks the code, so a plain `number` won't
fit where a `Seats` is expected. Alongside it comes a `Seats.of` that runs the
rule. That's the pattern careful TypeScript developers write by hand, but
generated from one line. The generated code deliberately has no unchecked
constructor (no `.unsafe`), so Bynk code has only the two checked ways to a
`Seats`. The brand is still only a compile-time marker, so TypeScript written
by hand could cast with `as Seats`, as with any brand. A literal the compiler
already checked becomes a plain cast, with no check left to run.

**The rule runs wherever a value crosses a boundary.** The same rule is
applied to a request body, a path segment, a query string, a queue message,
an event, a call from another context, and the output of `Json.decode`. A
refused JSON body names the field that broke the rule, such as `$.qty`. The
generated TypeScript client for a front end (`bynk client`, still
experimental) runs the rules too, before it sends a request.

**Between contexts, a narrower rule is accepted.** A *context* is a separate
part of a Bynk system, with its own services and agents, that other parts can
reach only across an explicit boundary. When one context calls another, a value is compared by its shape and rules, not its name, and a value
with a stricter rule is accepted where a looser one is expected. A
`MaxLength(4)` string fits where `MaxLength(8)` is expected, and
`InRange(1, 5)` fits `InRange(0, 10)`. The compiler works this out by
comparing the ranges, so `NonEmpty` and `MinLength(1)` count as the same rule.
Within a context, though, two named types stay distinct, even when one's rule
is narrower.

**Patterns are checked for safety.** A `Matches` pattern runs against text
from outside, and some patterns can take exponential time on carefully
crafted input, a denial-of-service attack known as *ReDoS*. The compiler
analyses each pattern and refuses the dangerous ones, such as `(a+)+`, with
`bynk.types.catastrophic_regex`. `City`'s pattern passes because each repeat
must start with a `-`, which the letters before it can't match, so there's
only one way to split any string. Length rules are checked before the pattern
runs, so `MaxLength(40)` also limits how much text the pattern ever sees.

## Its limits

- **The rules are a fixed set.** You can't write your own predicate. Anything
  beyond ranges, lengths, patterns and dates, such as a checksum or a rule
  that compares two fields, needs code of your own, which the boundary and
  the generated client can't run for you.
- **Patterns can't be generated.** `Val` needs an `@example` for a `Matches`
  type, and a property test can't draw from a `Matches` type at all, since an
  `@example` would give it the same value every time: the compiler refuses
  it. Use a pinned value instead.
- **Some familiar patterns are refused.** A pattern copied from elsewhere
  can be dangerous without looking dangerous. With the dash optional,
  `[a-z]+(-?[a-z]+)*` is a repeat inside a repeat, which is catastrophic, so
  it's refused however short you meant the input to be. Making the dash
  required, `[a-z]+(-[a-z]+)*`, is safe. The check also refuses patterns it can't
  analyse, such as a backreference inside a repeat, even if they'd be safe.
  The milder case, two repeats that can split the same text (`\d*\d*`), is
  only a warning when a length rule keeps the input short enough.
- **Arithmetic and methods give the base type.** As the validation post
  says, results go back through `.of`. Nothing tries to prove that `qty + 1`
  stays in range.
- **Named types don't mix within a context.** A `String where MaxLength(4)`
  type isn't accepted where another type declared as `MaxLength(8)` is
  expected, though it would be safe. Only a call between contexts compares
  rules.
- **`is` narrows names, not expressions.** `if n is Quantity` narrows `n`,
  but `if f(x) is Quantity` is only a check, and narrows nothing. Bind the
  value with `let` first.

## Try it

The tour's tests come from the
[`testing`](https://github.com/bynk-lang/showcase/tree/main/testing) project,
and the shop from the validation post, with its `Quantity`, is the
[`refined-types`](https://github.com/bynk-lang/showcase/tree/main/refined-types)
project. Run their tests, then open `testing` in VS Code and hover over
`Seats` or `HoldId` to try the explorer.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/testing
bynk test .
cd ../refined-types
bynk test .
```

To go further:

- The [refined-type reference](https://bynk-lang.org/reference/refined-types/),
  with every predicate and every compile error
- [The refined-literal admission model](https://bynk-lang.org/book/concepts/type-system/refined-literal-admission/),
  for why literals and `.of` work as they do
- [Narrow and bind with `is`](https://bynk-lang.org/book/guides/type-system/narrow-with-is/)
- [`Val[T]` and property tests](https://bynk-lang.org/reference/testing/#val),
  in the testing reference

A refined type is one line of code, but it isn't one check. It's a single
rule that the compiler, the boundary, the tests, the editor and the generated
TypeScript all read the same way, so none of them can drift from the others.
