export const conf = {
  // API base URL. VITE_API_URL is used when set (a full URL with protocol for
  // cross-origin deployments); otherwise fall back to the same-origin /api
  // (Vite dev proxy in dev, nginx in production). The protocol always follows
  // the current page (see scrum-cards-api.ts) so HTTPS never mixes content.
  API_URL: import.meta.env.VITE_API_URL || window.location.host + "/api",
};

export default conf;
