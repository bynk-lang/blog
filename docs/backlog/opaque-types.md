---
slug: opaque-types
series: from-typescript
workingTitle: "A brand the compiler keeps"
level: first-steps
showcase: websocket
tags: [types, getting-started]
status: ready
pr:
published:
video: none
---

## Brief

For TypeScript developers who have written `string & { __brand: "UserId" }`
to stop a room id being passed where a user id belongs. The brand works, but
it's a convention: any `as` can forge one. The reader leaves knowing what an
opaque type is, who may construct one, and what Bynk emits for it.

## Hook

A function takes `(userId: string, roomId: string)`, and someone swaps the
arguments. TypeScript is happy, because both are strings. The branded-type
trick fixes that, until a cast in a test helper quietly makes one from
anything.

## Outline

### What you'd write today

- The branded type, a constructor function that validates, and the `as` it
  hides. Say what it gets right: zero run-time cost, and good errors.
- Where it stops: the brand is opt-in, `as` bypasses it anywhere, and
  nothing stops a second module minting its own.

### What Bynk declares instead

- `type RoomId = opaque String` and `type UserId = opaque String` from the
  `websocket` showcase: nominally distinct, though both are strings
  underneath.
- Construction and inspection are confined to the defining context, through
  `.of` (checked, a `Result`) or `.unsafe` there only.
- Opaque types are excluded from literal admission, unlike refined types:
  a bare string literal is never a `RoomId`.
- Compare refined types briefly (a rule attached, constructible anywhere
  through `.of`) and link *Check once, trust everywhere*.

### What the compiler emits

- The branded TypeScript type and constructor object Bynk generates for
  `RoomId` (from a build of `websocket`, or **Bynk: Show Compiled Output**).
- Since 0182, refined types export no `.unsafe` at all; opaque types keep
  theirs, confined to the defining unit.

### What you give up

- Ceremony at the edges: values must be wrapped and unwrapped where they cross
  the context.
- An opaque type isn't `Ord` outside its unit unless it `derives Ord`.
- No literal shortcut, even in tests.

### Try it

- Clone the showcase, open `websocket/src/chat/room.bynk`, and try passing a
  `UserId` where a `RoomId` belongs: quote the diagnostic.
- Book: opaque types in the types reference, and *Coming from TypeScript*.

## Code to quote

- `websocket/tests/chat/room.bynk`: `UserId.unsafe("alice")`, if the rule
  above makes it worth showing.
- `websocket/src/chat/room.bynk`: the two `opaque String` declarations, the
  `actor Participant` line (its `identity = UserId`), and `Room(roomId)` keyed
  by `RoomId`.

## Facts to check

- Run a build of `websocket` at the post's `bynkVersion` and copy the emitted
  TypeScript for `RoomId`; confirm what a call with swapped arguments reports.
- The TypeScript handbook's position on branded types (it has no official
  brand feature; check the current wording before saying so).
- The rules for opaque `.unsafe` and `.of` in the types reference: who may
  call them, and the diagnostic outside the defining unit
  (`bynk.types.opaque_unsafe_outside`).
- How `roomId` becomes a `RoomId` when it arrives in the request, given that
  construction is confined to the context: the language server's wire
  contract describes an opaque type's boundary check as structural only.
  Explain this honestly; it's the question an experienced reader will ask.
- `websocket/tests/chat/room.bynk` builds `UserId.unsafe("alice")` in a test
  suite: say where `.unsafe` on an opaque type may be called (its defining
  unit, and its tests?), from the types reference.

## Sources

- Book: [Coming from TypeScript](https://bynk-lang.org/book/introduction/coming-from-typescript/)
- Book: [Types reference: opaque types](https://bynk-lang.org/reference/types/)
- Decision record 0182 (refined `.unsafe` removed; opaque keeps it)
- Showcase README: `websocket`

## Video angle

Two identical grey luggage tags are swapped on a conveyor; then each gets a
coloured stamp that only one desk can apply, and the swap is caught. About
2:00.

1. Title
2. Two strings, swapped
3. The branded type trick
4. The `as` that forges a brand
5. `opaque String`
6. Who may stamp: the defining context
7. What the compiler emits
8. What you give up
9. Close
