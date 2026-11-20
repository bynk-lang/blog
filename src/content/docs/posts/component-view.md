---
title: "A diagram that can't go out of date"
description: "The Bynk extension for VS Code can draw any context as a UML component diagram, straight from the code. A tour of the component view and the architecture map on two showcase projects, where their information comes from, and what they don't show."
date: 2026-11-27
authors: matthew
tags: [tooling, capabilities]
excerpt: "Architecture diagrams go stale the week they're drawn. The Bynk extension draws them from the code, so they can't."
series: a-closer-look
level: designing
showcase: [capabilities-and-providers, events]
bynkVersion: 0.639.1
---

## What it's for

Most teams have an architecture diagram somewhere: a whiteboard photo, a
Miro board, a box-and-arrow drawing in the wiki. It was right on the day
someone drew it. A sprint later a service gained a dependency, another lost
one, and nobody updated the picture, because nothing told them to.

The questions such a diagram answers are still worth answering. What does
this part of the system offer? What does it need from outside? Who depends
on it? The Bynk extension for VS Code answers them with diagrams drawn from
the code itself, so they're as current as the last time you saved. This post
looks at two of them: the **component view**, which opens up one context (a
separate part of a Bynk system, with its own services and agents, deployed on
its own), and the **architecture map**, which shows the whole project. (It
describes version 0.639.4 of the extension.)

Drawing diagrams from code isn't a new idea, and the tools for it are good.
Structurizr and Mermaid let you write a diagram as text and keep it in the
repository. Nx, dependency-cruiser and IntelliJ draw graphs from the code
itself. But a diagram written as text is still a second description that
someone has to update, and a graph drawn from imports shows which files
mention which, not what a piece of code is *allowed* to reach. Bynk's views
read the compiler's own model: which capabilities each handler asks for,
which contexts depend on which, and which events flow between them.

## A tour

**One context, opened up.** The
[`capabilities-and-providers`](https://github.com/bynk-lang/showcase/tree/main/capabilities-and-providers)
showcase project is a small weather service: one HTTP route that gives advice
for a city's forecast. Its context, `weather.api`, declares a capability of
its own, a typed contract for what the app needs:

```bynk
capability Forecasts {
	fn today(city: City) -> Effect[Result[Forecast, ForecastError]]
}
```

It supplies that capability with a **provider**, which says what it uses in
turn:

```bynk
provides Forecasts = HttpForecasts given Fetch, Secrets {
```

and its one HTTP handler asks only for the forecast and a logger:

```bynk
on GET("/forecast/:city") (
	city: String
) -> Effect[HttpResult[String]] by Visitor given Forecasts, Logger {
```

With the cursor anywhere in that file, **Bynk: Show Component View** draws
this:

![The component view of the weather.api context. Inside the context box are the http service api, with its operation, a GET of /forecast/ followed by a city, and the provider HttpForecasts, which provides Forecasts and has the operation today. A Visitor actor on the left connects to the service's provided port, labelled api · http. A dashed arrow labelled Forecasts runs from the service to the provider. On the right edge are three required ports: Fetch and Secrets, connected to the provider, and Logger, connected to the service. All three connect to the bynk platform outside the box.](../../../assets/component-view/weather-api.svg)

It's a UML component diagram, and the notation is worth a sentence. The big
box is the context, and the boxes inside it are its parts: here a service and
a provider. A small square on the edge is a **port**. A ball on a stalk is a
*provided* port, something the context offers (here, the HTTP route a
`Visitor` calls). A socket, the open half-circle, is a *required* port,
something the context needs from outside. Shapes outside the box are the
neighbours: who calls in, and what satisfies the requirements. Other contexts
and the platform are drawn in grey.

Now read it against the code. The handler's `given Forecasts, Logger` is the
dashed arrow to the provider and the line to the `Logger` port. The
provider's `given Fetch, Secrets` is its two lines to `Fetch` and `Secrets`.
So the picture shows, at a glance, the point of the whole project: the
handler can't reach the network or the secrets directly. Only the provider
can.

**The view follows you.** Move the cursor into another context's file, and
the view redraws for that context. Click any element and the editor opens its
source. The ↗ beside an operation opens that handler's sequence diagram, and
the ↗ on a grey neighbouring context opens that context's own component view.
(Those links work in the editor, not in the images here.) **Save as SVG** and
**Save as PNG** export the diagram; every diagram in this post was exported
that way.

**Who depends on you.** The
[`events`](https://github.com/bynk-lang/showcase/tree/main/events) project,
from [the post on events](../events/), has a checkout that announces each
order without naming its listeners. Its component view is small:

![The component view of the shop.orders context. Inside is one service, checkout, with the operation call. It has a provided port, checkout, on the left, and a required port, Events, on the right, connected to the bynk platform. On the left, outside the box and in grey, are the contexts shop.loyalty and shop.sales, both connected to shop.orders.](../../../assets/component-view/shop-orders.svg)

The checkout's code never mentions `shop.loyalty` or `shop.sales`. The view
shows them anyway, in grey, because each of them names `shop.orders` in its
own `consumes`. The code stays decoupled, but you can still see who would be
affected by a change.

One of those listeners, opened up, shows an agent's insides as well (an agent
is a piece of state, here each customer's points, together with the handlers
that change it):

![The component view of the shop.loyalty context. Inside are the events service AwardPoints, with the operation event, and the agent Points, which lists key customer: String, store balance, awarded, and the operations award and current. A dashed arrow labelled award runs from the service to the agent. The service's provided port on the left is labelled AwardPoints · events. On the right are two required ports: Clock, connected to the bynk platform, and shop.orders, connected to the shop.orders context in grey.](../../../assets/component-view/shop-loyalty.svg)

An agent lists its key, its stores and its handlers. The `Clock` port is
there because the agent's `award` handler asks for `given Clock` (its `Cache`
reads the clock to expire entries), and the `shop.orders` port because the
context consumes it to name the event it listens for.

**The whole system.** **Bynk: Show Architecture Map** steps back to show
every context in the project at once, with the events between them:

![The architecture map of the events project. Inside a dashed system boundary are three contexts: shop.loyalty and shop.sales, each with one service and one agent, and shop.orders, with one service. An OrderPlaced event sits on the left. A dotted line shows shop.orders emitting it, and two more show shop.loyalty, labelled pattern, and shop.sales subscribing to it. Dashed arrows show both listeners consuming shop.orders. Outside the boundary, the bynk platform supplies Clock to both listeners and Events to shop.orders.](../../../assets/component-view/events-architecture.svg)

This is where the events show up. The checkout emits `OrderPlaced`, both
listeners subscribe, and the loyalty scheme's subscription is marked
`pattern`, because it filters to domestic orders. Each context has a ↗ that
opens its component view, so the map and the component views work as one
zoomable picture.

## How it works

Neither view reads your files itself. The Bynk language server, the same one that gives the editor its errors and
completions, builds a model of the whole project from its analysis of the
code: every context, what each one `consumes`, its services,
agents, capabilities and providers, the capabilities each handler asks for in
its `given`, and every event with its emitters and subscribers. The extension
asks for that model and draws it. The component view and the architecture map
both come from the same model, so they always agree with each other, and
with the compiler.

Three things follow from that.

- **It can't drift.** There's no second copy of the architecture to keep in
  step. Change a `given`, save, and the port appears or disappears. (By
  default the views refresh when you save; a setting makes them follow as you
  type.)
- **It's what the code says, not what someone meant.** If a handler can reach
  something it shouldn't, the diagram shows it, because the diagram is the
  code's own account of itself.
- **It costs nothing to keep.** Nobody maintains it. The layout is worked out
  each time it's drawn, by a layout engine, so there's nothing to rearrange
  either.

## Its limits

- **Structure, not behaviour.** The views show what each part *may* use and
  who depends on whom, not what happens on a particular request, or in what
  order. For that, use the sequence diagram, which can also show a live
  request's trace while `bynk dev` is running.
- **One level at a time.** A component view shows one context and its direct
  neighbours, in grey, but not their neighbours. To see further, follow the ↗
  links or open the architecture map.
- **The component view doesn't show events.** The checkout's view shows that
  it needs `Events`, but not which event it emits or who listens. Only the
  architecture map draws events.
- **You can't arrange it.** The layout is automatic. That keeps it free to
  maintain, but you can't move a box to tell a story the way you could on a
  whiteboard.
- **An export keeps the editor's colours.** A saved SVG is drawn in your
  editor's theme: the diagrams here come from a dark theme, background
  included. Export from a light theme if that suits where it's going.
- **It's VS Code only.** The model comes from the language server, which any
  editor could ask for, but the drawings are part of the VS Code extension.

## Try it

Clone the showcase and open it in VS Code, as below, or open the repository
on GitHub in a Codespace (**Code → Codespaces**). Then install the Bynk
extension from the Marketplace (`bynk-lang.bynk-vscode`). If you don't have
the Bynk toolchain, **Bynk: Install Toolchain** downloads it.

```sh
git clone https://github.com/bynk-lang/showcase
code showcase
```

Then open `capabilities-and-providers/src/weather/api.bynk` and run **Bynk:
Show Component View** from the Command Palette. Try adding `Secrets` to the
handler's `given` and saving. The compiler warns that the handler doesn't use
it (`bynk.given.unused_capability`), and the diagram gains a line from the
handler to the `Secrets` port: the handler could now reach the secrets
directly. Then take it out again. For the whole system,
open any file in `events/` and run **Bynk: Show Architecture Map**.

To go further:

- The extension's
  [README](https://github.com/bynk-lang/vscode-bynk#views-of-the-project), for
  every view, including the sequence diagram, the agent state view and the
  contract diff
- [Understand the capability model](https://bynk-lang.org/book/guides/effects-and-capabilities/understand-the-capability-model/),
  for what the ports on these diagrams mean
- The [`capabilities-and-providers`](https://github.com/bynk-lang/showcase/tree/main/capabilities-and-providers)
  and [`events`](https://github.com/bynk-lang/showcase/tree/main/events)
  showcase projects

An architecture diagram is only useful while it's true. These ones are
generated from the code each time you look, so they stay true for as long as
the code compiles.
