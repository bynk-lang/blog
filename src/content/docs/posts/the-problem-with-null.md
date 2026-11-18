---
title: "The problem with null"
description: "A value can be missing, and an operation can fail, and in most languages nothing in a function's type tells you which. Why Bynk has no null and no exceptions, and what it has instead."
date: 2026-12-02
authors: matthew
tags: [types, option, result, errors]
excerpt: "A value can be missing, and an operation can fail, and in most languages nothing in a function's type tells you which. Why Bynk has no `null` and no exceptions."
draft: true
series: the-problem-with
level: first-steps
showcase: results-and-optionals
bynkVersion: 0.639.1
---

Picture a café till. The barista types in an order line: a product code and a
quantity. The till looks up the product, works out the price and checks the
customer's loyalty card for a discount.

Three things can go wrong with that, and they aren't the same kind of thing.
The customer might not have a loyalty card, which is perfectly normal. The
barista might type a product the café doesn't sell. Or they might type "lots"
where a number should be. The first is just something *missing*. The other two
are *failures* the till has to explain.

Most languages give you no way to tell these apart by looking at the code. This
post is about why that matters, and what Bynk does instead.

## The problem

In most languages, a function that says it returns a product can hand you
nothing at all. In JavaScript that's `null` or `undefined`; in Java, Python and
C# it's `null` or `None`. The function's type says *product*, but the honest
answer is *product, or possibly nothing*, and nothing in the code tells you
which functions mean the second.

Failures have the same problem. A function that can fail usually *throws an
exception*: it stops and hands an error to whoever is willing to catch it,
however far up the program that is. Nothing in the function's type says it can
throw, or what it throws, so you find out by reading its code, its
documentation or, most often, a stack trace in production.

Tony Hoare, who added null references to ALGOL W in 1965, later called them his
"billion-dollar mistake". The cost isn't the idea of a missing value. It's that
the possibility is invisible, so it's easy to forget to check for it.

## How it's usually handled

**Check, and be disciplined about it.** Test for `null` before using a value,
and wrap risky calls in `try` and `catch`. This works, until the one place
someone forgets. Because nothing marks which values can be missing, it's hard
to know where the checks are needed, so people either miss one or add them
everywhere "just in case".

**Make missing values visible in the type.** This is a real improvement, and
it's widespread. TypeScript's `strictNullChecks` makes a possibly-missing value
`Product | undefined`, Kotlin writes it `Product?`, and Swift calls it an
optional. The compiler then insists you check before you use it. But these
languages still use exceptions for failure, so half the problem remains: a
function's type still doesn't say what can go wrong.

**Return errors as values.** Rust's `Option` and `Result`, Haskell's `Maybe` and
`Either`, and libraries such as neverthrow for TypeScript all return a failure
as an ordinary value, so the type says when a function can fail and how. This
is the approach Bynk takes. In a language built around exceptions, though, a
`Result` library is something you opt into: the standard library and every
package you use still throw, so the guarantee only holds in your own code.

## Bynk's answer

Bynk has **no `null` and no exceptions**. Missing values and failures are both
ordinary values, with types that say so.

**A value that might be missing is an `Option`.** An `Option[Product]` is
either `Some(product)` or `None`. Looking a product up on the menu returns one,
because a lookup can come up empty:

```bynk
fn findProduct(sku: String) -> Option[Product] {
	menu().filter((p) => p.sku == sku).first()
}
```

You can't use what's inside without first dealing with the `None` case. Try to
read the price straight off a lookup, and the program doesn't compile:

```bynk nocheck
fn careless(sku: String) -> Int {
	findProduct(sku).pence
}
```

```text
[bynk.types.field_access_on_non_record] Error:
  field access requires a record type,
  but the receiver has type `Option[Product]`
```

The compiler isn't being fussy. It's pointing at the exact line where, in
another language, a missing product would have crashed the till.

Absence is often fine, and `Option` comes with small methods for handling it
without ceremony. Here is how the till works out a discount, where the customer
might have no card, and a card might not belong to any member:

```bynk
fn discountFor(card: Option[String]) -> Int {
	card.andThen(findMember).map((m) => m.percent).getOrElse(0)
}
```

Read it left to right. `andThen` looks the card up, if there is one. `map`
takes the member's percentage, if a member was found. `getOrElse(0)` says what
to use when either step came up empty: no discount.

**An operation that might fail returns a `Result`.** A `Result` is either
`Ok(value)` or `Err(error)`. The error is a type you design, with a variant for
each way things can go wrong and the details the till needs to explain it:

```bynk
type OrderError =
	| UnknownProduct(sku: String)
	| NotANumber(text: String)
	| OutOfRange(quantity: Int, rule: String)
```

Pricing a line can fail in any of those ways, so it returns
`Result[Priced, OrderError]`:

```bynk
fn priceLine(sku: String, quantity: String) -> Result[Priced, OrderError] {
	let product = findProduct(sku).okOr(UnknownProduct(sku))?
	let n = parseQuantity(quantity)?
	Ok(Priced { quantity: n, pence: product.pence * n })
}
```

Two small pieces of syntax do the work here. `okOr` turns a missing product into
an error, because *here* absence is a mistake: the barista typed something the
café doesn't sell. And `?` means "if this is an error, stop and return it to my
caller; otherwise, give me the value". So the happy path reads straight down
the page, and each failure leaves at the step where it happens.

**Missing and failing are different, and the types keep them apart.** The
loyalty card is an `Option`, because having no card is normal. The product
lookup is an `Option` too, until the till decides that a missing product is an
error and converts it with `okOr`. That decision is written in the code, where
it can be reviewed, rather than living in whoever remembered to add a check.

**Handling an error means covering every case.** The till explains a refused
line with a `match`, which picks a branch for each variant:

```bynk
fn explain(error: OrderError) -> String {
	match error {
		UnknownProduct(sku) => "we don't sell \(sku)",
		NotANumber(text) => "\"\(text)\" is not a number",
		OutOfRange(n, rule) => "\(n) \(rule)",
	}
}
```

Leave a variant out and the program doesn't compile. The compiler names the
missing case (`variant OutOfRange(_, _) of OrderError is not covered`). The
same thing happens when someone adds a new kind of error later: every `match`
that doesn't handle it stops compiling, so the new error can't slip through
unexplained.

**For the truly impossible, there's a deliberate fault.** Some cases can't
happen, because the program has already ruled them out elsewhere. For those,
`unreachable("why this can't happen")` stops the handler with that message if
you were wrong, and `todo(...)` marks code that isn't written yet. There is
deliberately no general-purpose `panic`: a failure a caller could handle
belongs in a `Result`.

## The trade-offs

This approach has costs, and they're worth knowing before you start.

- **Every failure is handled or passed on.** You can't ignore an error and hope
  something further up catches it. `?` makes passing one on a single
  character, but you'll still write more error-handling code than in a language
  with exceptions, because the code you'd have skipped is now required.
- **Error types have to line up.** `?` won't quietly turn one error type into
  another. When a step fails with a `ValidationError` but your function returns
  an `OrderError`, the compiler stops you, and you convert it yourself with
  `mapErr` or declare the conversion once on the error type with an `embeds`
  clause.
- **There's no `unwrap`.** Many languages with `Option` let you say "I'm sure
  it's there" and crash if you're wrong. Bynk doesn't: `Option` has no
  `unwrap` method at all. You give a default with `getOrElse`, handle the
  missing case, or, if it truly can't happen, say so with `unreachable` and a
  reason.
- **There's a small vocabulary to learn.** `map`, `andThen`, `getOrElse`,
  `okOr`, `ok` and `?` take a little getting used to, especially if you come
  from JavaScript. Bynk keeps one name per operation (it's always `andThen`,
  never `flatMap`) to make the list shorter.
- **A fault is still a stop.** `unreachable` is a promise, not a proof. If the
  promise is wrong, the handler stops at runtime, as an exception would have.
  The difference is that you had to write it down, with a reason, in the one
  place it applies.

## See it working

The
[`results-and-optionals`](https://github.com/bynk-lang/showcase/tree/main/results-and-optionals)
project in the showcase is the café till from this post. Its tests try each
kind of mistake: an unknown product, "two" as a quantity, quantities just
inside and just outside the limits, and a bad line spoiling a whole order. They
also check that a loyalty discount never hides an error.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/results-and-optionals
bynk test .
```

To go further:

- [Work with `Result` and optional values](https://bynk-lang.org/book/guides/type-system/result-and-optionals/),
  the guide in the Bynk book
- [Fault on the impossible or the unfinished](https://bynk-lang.org/book/guides/type-system/fault-on-the-impossible/),
  for `unreachable` and `todo`
- The [`refined-types`](https://github.com/bynk-lang/showcase/tree/main/refined-types)
  and [`pattern-matching`](https://github.com/bynk-lang/showcase/tree/main/pattern-matching)
  showcase projects

Nothing in a program is ever free of things that are missing or go wrong.
What Bynk changes is where you find out about them: in a function's type, when
you write the code, rather than in production, when a customer is waiting.
