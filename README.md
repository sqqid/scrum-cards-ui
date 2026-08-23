# Scrum Cards — Frontend

The client side of [Scrum Cards](https://github.com/sqqid/scrum-cards) — a
planning poker app I've been building as a hobby project. A chance to try a
modern React stack without the usual boilerplate. The CSS is written with
responsive design in mind, so the same layout works on a phone and a desktop.

## Stack

React and TypeScript, bundled with Vite. React Router handles navigation between
pages, and RxJS handles the parts where events actually flow: the server's SSE
stream is wrapped in an Observable, so subscribing, reconnecting, and tearing down
are just operators.

## Approaches

- **BEM CSS** — plain CSS, no framework, no preprocessor. Block/element/modifier
  naming keeps the stylesheets readable as the app grows, and light/dark theming is
  just a set of CSS custom properties.
- **A thin service layer** — the UI never touches `fetch` or `EventSource`
  directly. One small API class owns HTTP and the event stream, and the rest of the
  app consumes Observables.
- **Contexts instead of a global store** — room, client, theme, and modal state
  live in React contexts. The app is small enough that this beats introducing a
  state library.
