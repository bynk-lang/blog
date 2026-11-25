---
slug: websocket
series: inside-the-showcase
workingTitle: "A connection with exactly one owner"
level: building
showcase: websocket
tags: [http, agents, security]
status: ready
pr:
published:
video: none
---

## Brief

For developers who have built a chat room or live feed on WebSockets and
chased a leaked connection. The `websocket` project accepts a connection,
authenticates it at the edge, hands it to an agent and broadcasts to a room.
The reader leaves knowing how Bynk treats a connection as a resource with one
owner, and how the compiler catches one that's dropped.

## Hook

An HTTP request ends when the handler returns. A WebSocket doesn't, so
someone has to own it afterwards. If nobody does, it leaks.

## Outline

### What it builds

- A chat room: the gateway authenticates the upgrade, and the `Room` agent
  holds each connection and broadcasts.
- Features shown: `from websocket(in:, out:)`, `on open` / `message` /
  `close`, an owned `Connection`, `bynk.held.leak`, and parallel broadcast.

### The layout

- One file, `src/chat/room.bynk`, and `tests/chat/room.bynk`. A small
  diagram: client → `ChatGateway` → `Room(roomId)` → every connection.

### A walk through the code

- The frame types and `actor Participant`: there's no anonymous upgrade, and
  the connection is handed over only once the token has verified.
- `on open` is given an owned `Connection` and must dispose of it: here, by
  transferring it into `Room(roomId).join`. Leave it undisposed and it's
  `bynk.held.leak`.
- The room stores connections only in a `Cell` or `Map`, and `remove` closes
  one. `post` broadcasts with `parTraverse`, so one slow client can't stall
  the rest.
- `RoomId` and `UserId` are opaque: link *A brand the compiler keeps*, if it
  has been published.

### The tests

- `TestConnection` records every frame the server sends; `message` and
  `close` take no route values or `by`, because the connection remembers them
  from `open`.
- A case drives the `Room` directly and checks that after `leave` the
  connection is closed.
- Why there's no `system` case (`bynk.test.ws_needs_in_process`).

### Make it yours

- Add a `typing` frame, or a room history kept in a `Log`, and what the
  compiler asks for. How to clone and run.

## Code to quote

- `src/chat/room.bynk`: the `actor Participant` line, the `ChatGateway`
  service's `on open`, and `post` with `parTraverse`.
- `tests/chat/room.bynk`: the `TestConnection` case the README quotes.

## Facts to check

- How Bynk maps the room onto Durable Objects and the WebSocket Hibernation
  API, if at all, from the WebSocket reference.
- How a browser client sends the bearer token on an upgrade (browsers can't
  set headers on `new WebSocket`): what the actor accepts, from the actors
  reference. An experienced reader will ask.
- What `parTraverse` does when one send fails.
- `List.parTraverse` changed in v0.646: it now returns the steps' values, and
  the unit-returning form is `parForEach`. The showcase is pinned at 0.639.1,
  so check which form it uses at the post's `bynkVersion` and describe that.

## Sources

- Book: [Handle a WebSocket connection](https://bynk-lang.org/book/guides/entry-points/websocket/)
- Book: [WebSocket reference](https://bynk-lang.org/reference/websocket/)
- Book: [Testing: driving a WebSocket service](https://bynk-lang.org/reference/testing/#websocket-address)
- Showcase README: `websocket`

## Video angle

A connection is drawn as a glowing cable handed from the gateway to the room;
the compiler refuses to let anyone drop it on the floor. Then the room lights
every cable at once to broadcast. About 2:15.

1. Title
2. A request ends; a connection doesn't
3. The gateway and the actor
4. An owned connection
5. Handing it to the room
6. `bynk.held.leak`
7. Broadcast in parallel
8. The tests
9. Close
