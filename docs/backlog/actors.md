---
slug: actors
series: inside-the-showcase
workingTitle: "Anyone may read, only you may write"
level: building
showcase: actors-and-authorisation
tags: [security, http, agents]
status: ready
pr:
published:
video: none
---

## Brief

For developers who have written authentication middleware and then an
ownership check in every handler. The `actors-and-authorisation` project is a
blog's author bios: anyone reads, a signed-in author writes their own, a
moderator clears one. The reader leaves knowing how actors put "who may
call this?" on the route itself, and why keying an agent by the verified
identity removes the ownership check altogether.

## Hook

The classic bug: `PUT /users/:id/bio` checks you're signed in, but not that
`:id` is you. Here, there is no `:id` to forge.

## Outline

### What it builds

- A tiny HTTP service in one file, and what it shows: actors, `by` clauses,
  a refinement actor, and an agent keyed by identity.

### The layout

- `src/blog/authors.bynk` and `tests/blog/authors.bynk`; a small diagram of
  the three routes and the actor each names.

### A walk through the code

- `actor Author { auth = Bearer(…), identity = UserId }`: how a caller proves
  who they are, and what their identity becomes.
- `actor Moderator = Author where hasClaim("moderator")`: authorisation on top
  of authentication; a valid token without the claim is a `403`, not a `401`.
- `by Visitor` as the service default, so the `GET` is public on purpose. Every
  HTTP route names its caller; there's no unguarded default to forget (record
  0082).
- `PUT /me/bio` writes to `Bios(a.identity)`: a write can only reach the
  caller's own bio.
- `DELETE /authors/:id/bio` names `Moderator` with no binder, because it only
  gates.

### The tests

- `by Author("ada")` supplies the identity; the cases show each caller doing
  what it may, including that bob's write lands on bob's bio, not ada's.
- What's left to the `system` tier (real tokens), if the project covers it.

### Make it yours

- Add an `Editor` refinement actor who may write any bio, and see what the
  compiler asks for. How to clone and run.

## Code to quote

- `src/blog/authors.bynk`: both actor declarations, the `PUT /me/bio` and
  `DELETE /authors/:id/bio` handlers, and the service's default `by Visitor`.
- `tests/blog/authors.bynk`: the case where bob's write lands on bob's bio.

## Facts to check

- What a `Bearer` actor verifies (algorithm, expiry, issuer) from the actors
  reference, so the post doesn't overclaim.
- The `401` versus `403` split, and the `WWW-Authenticate` header on a `401`
  (record 0918).
- Whether `bynk.actor.missing_by_on_http` is still the diagnostic name.

## Sources

- Book: [Authorisation](https://bynk-lang.org/book/guides/actors/authorisation/)
- Book: [Public and authenticated routes](https://bynk-lang.org/book/guides/actors/public-and-authenticated/)
- Book: [Actors reference](https://bynk-lang.org/reference/actors/)
- Decision records 0082, 0091 and 0918 in `bynk-lang/bynk`
- Showcase README: `actors-and-authorisation`

## Video angle

Three doors on one corridor, each with a sign saying who may enter (anyone,
an author, a moderator). An author's key opens only their own room, because
the room is found by the key. About 2:15.

1. Title
2. The `:id` you could forge
3. Three routes, three callers
4. `actor Author`
5. `Moderator`: 401 versus 403
6. Public on purpose: `by Visitor`
7. The agent keyed by identity
8. The tests
9. Close
