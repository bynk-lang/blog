---
title: "The Problem With Money"
description: "Floats drift, integer pence only move the problem, and someone has to decide who gets the penny. Why Bynk has a Decimal type, and why it has no `/`."
date: 2026-11-18
authors: matthew
tags: [types, decimal, refined-types]
excerpt: "Floats drift, integer pence only move the problem, and someone has to decide who gets the penny. Why Bynk has a `Decimal` type, and why it has no `/`."
series: the-problem-with
level: building
showcase: money
bynkVersion: 0.639.1
---

Open a JavaScript console and type `0.1 + 0.2`. The answer is
`0.30000000000000004`. (Python, Java and C# give the same answer. It's how
IEEE 754 floating-point numbers work everywhere.)

Most programmers meet this early, laugh, and move on. It's worth staying with
it a little longer, because it isn't really a story about precision. It's a
story about **who decides when a number gets rounded**. With money, the answer
should be *you*, in code someone can review.

## The problem

You can't write one third exactly as a decimal: 0.333… goes on for ever, and
you have to stop somewhere. A `Float` has the same problem with tenths. It
stores numbers in binary, so it can hold `0.5` and `0.25` exactly, but `0.1`
goes on for ever, and the computer stops somewhere.

So every float sum rounds a little, silently, at each step. Over a basket of
items, a month of transactions or a few million invoices, those small
roundings add up. Then `total == expected` fails, a reconciliation report is a
penny out, and someone spends an afternoon finding out why.

Rounding money is a business decision, not a technical detail. Tax rules say
when to round and in which direction, and when a bill is split three ways,
someone has to decide who gets the extra penny. Floats make all of these
decisions for you, everywhere, and leave no record of them in your code.

## How it's usually handled

There are three common approaches. Each one helps, and each one stops short.

**Use floats and round at the end.** This is quick to write, and it's where
most code starts. But "the end" is hard to pin down: values are compared,
stored and sent to other systems before anyone rounds them. A float that
travels as a JSON number is read as a float by whoever receives it, so the
problem spreads.

**Store whole pence as integers.** This is exact, and it's a
well-respected habit. But it moves the problem rather than solving it. Every
service has to agree on the unit, then handle its own rounding, formatting
and wire format. Anything finer than a penny, such as a fuel price or an
exchange rate quoted to four decimal places, needs a separate convention. And
as soon as you divide, say 1000 pence three ways, you're back to deciding what
happens to the remainder, with nothing in the language to remind you.

**Use a decimal library.** This is the right idea, and there's good prior art:
Java's `BigDecimal`, Python's `decimal` module and decimal.js in JavaScript.
`BigDecimal` is especially instructive. Ask it to divide 1 by 3 without saying
how many decimal places you want, and it refuses with an exception rather than
guess. But a library is something you opt into. Nothing stops a float from
creeping in at the edges, whether that's a literal someone forgot to wrap, a
JSON parser or a helper from another package. And the library can't decide how
your API sends amounts over the wire.

What all three have in common is that getting it right depends on discipline,
and discipline is hardest to keep when you're busy or under pressure.

## Bynk's answer

Bynk treats money as a type problem, and removes the places where the wrong
thing can happen quietly. The code below comes from the showcase project
linked at the end. In the tests, `expect` is an assertion: the test fails if
what follows is false.

**`Decimal` is a built-in type.** A literal ends in `d`, so `1.10d` is a
decimal and `1.10` is a float. Addition, subtraction and multiplication on
`Decimal` are exact, so they never round on your behalf:

```bynk
expect 0.1d + 0.2d == 0.3d
```

Exact multiplication means the number of decimal places, which Bynk calls the
*scale*, can grow: a product has the scales of its two operands added
together, so `1.10d * 1.10d` is `1.2100d`. There is a ceiling (100 decimal places, or 1,000 characters when written out,
whichever comes first), and going past it stops the program with a fault at
that point rather than rounding quietly. You'll never get near it with
prices.

**Rules about amounts live in the type.** Bynk has *refined types*: a type
with a rule attached. A price must be positive, and a tax rate must be between
0 and 1:

```bynk
type Price = Decimal where Positive

type Rate = Decimal where InRange(0.00d, 1.00d)
```

A value can only become a `Price` in two ways. If you write a literal, the
compiler checks it, so a `Price` of `0.00d` written in your code doesn't
compile. Anything worked out while the program runs goes through `Price.of`,
which returns a `Result`: either the price or an error you have to deal with.
Either way, a bad amount is caught when it first enters your program, not
discovered later in a report.

**Rounding happens only where you write it.** If an amount needs rounding to
pence, the code says so, and says how:

```bynk
fn withTax(net: Decimal, rate: Rate) -> Decimal {
	(net + net * rate).round(2, RoundingMode.HalfEven)
}
```

`HalfEven`, also called banker's rounding, rounds a value that's exactly
halfway between two options towards the even one, so over many roundings it
doesn't drift up or down on average. Other modes are available, including
`HalfUp`, the rule you learnt at school, and `Down`. What matters is that the
choice is written in the code, where a reviewer can see it.

**There is no `/` on `Decimal`.** This is the part that surprises people, and
it's the same lesson `BigDecimal` teaches. One third has no exact decimal
form, so any division has to choose a number of decimal places and a rounding
rule. If `/` made that choice for you, it would be making the same silent
decision floats make. C# comes closest to Bynk here: its built-in `decimal`
type even has a literal suffix, `m`, much like Bynk's `d`. But it also has
`/`, and `1m / 3m` quietly rounds to fit the 28 or so digits a `decimal` can
hold. So Bynk leaves `/` out and asks you to state both:

```bynk
fn baseShare(total: Decimal, ways: Int) -> Decimal {
	total.div(Decimal.fromInt(ways), 2, RoundingMode.Down)
}
```

Splitting £10.00 three ways gives £3.33 each, rounded down so the shares never
add up to more than the bill. The penny left over doesn't disappear. Because
subtraction and multiplication are exact,
`total - share * Decimal.fromInt(ways)` is exactly £0.01, and you decide who
gets it. The showcase gives it to the first share, so the bill comes out as
£3.34, £3.33 and £3.33, which adds up to exactly £10.00.

**Amounts cross the wire as strings.** A `Decimal` is sent in JSON as a
string, such as `"4.50"`, so no client can read it as a float by accident.
The scale is kept, so `4.50` stays `"4.50"`, and when decoding, a bare JSON
number is rejected rather than quietly accepted. If you're calling a Bynk
service from TypeScript, type these fields as `string`, and parse them with a
decimal library if you need to do arithmetic on your side.

**The numeric types never mix.** `Int`, `Float` and `Decimal` don't convert
into one another implicitly. Going between them takes a named function, such
as `Decimal.fromInt` or `toFloat`, so a lossy step is always visible. That's
why the split above says `Decimal.fromInt(ways)` rather than just `ways`.

## The trade-offs

None of this comes free, and it's worth being honest about the costs.

- **It's more to write.** `total.div(Decimal.fromInt(3), 2, RoundingMode.Down)`
  is longer than `total / 3`. That's deliberate, because the extra words are
  the decision, but you'll feel it the first few times.
- **The `d` suffix is easy to forget.** The compiler will tell you, because
  the types won't mix, but it's still friction.
- **Strings on the wire won't suit every API.** If a partner expects JSON
  numbers, you'll convert explicitly at that boundary.
- **Currency isn't part of the type yet.** A `Decimal` doesn't know whether
  it's pounds or yen. For now, keep the currency code in a record next to the
  amount. A money library is planned.
- **Exact arithmetic is slower than hardware floats.** For prices, totals and
  invoices this won't matter, but for heavy numerical work `Float` is still
  the right type. Bynk's guidance is to use `Decimal` where the digits you
  write are the digits you mean.

## See it working

The [`money`](https://github.com/bynk-lang/showcase/tree/main/money) project
in the showcase puts all of this into about 50 lines: refined `Price` and
`Rate` types, tax rounded in one place, and a bill split without losing a
penny. Its tests check each of the claims in this post.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/money
bynk test .
```

To go further:

- [Handle money correctly](https://bynk-lang.org/book/guides/type-system/handle-money-correctly/),
  the guide in the Bynk book
- [Reference: Decimal](https://bynk-lang.org/book/reference/types/#decimal)
- The [`refined-types`](https://github.com/bynk-lang/showcase/tree/main/refined-types)
  showcase project, for more on how refined types check literals and values

Money will always need rounding somewhere. Bynk's job isn't to avoid that
decision. It's to make sure that every time it happens, someone chose it and
wrote it down.
