export const conf = {
  // API base URL. VITE_API_URL is used when set (a full URL with protocol for
  // cross-origin deployments); otherwise fall back to the same-origin /api
  // (Vite dev proxy in dev, nginx in production). The protocol always follows
  // the current page (see scrum-cards-api.ts) so HTTPS never mixes content.
  API_URL: import.meta.env.VITE_API_URL || window.location.host + "/api",
  // How many times the UI re-registers the client after a room event stream
  // fails before giving up and surfacing the error (ADR 0005).
  MAX_REJOIN_ATTEMPTS: 3,
};

export default conf;
