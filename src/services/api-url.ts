// Pure helpers for resolving API and stream URLs against the current page's
// protocol. They take the page protocol as an argument (instead of reading
// window) so they stay unit-testable in a non-DOM environment.
//
// The protocol always follows the current page so that HTTPS deployments never
// issue mixed (http) requests, which browsers block as mixed content.

export function httpProtocol(pageProtocol: string): string {
  return pageProtocol === "https:" ? "https:" : "http:";
}

// Resolves a configured base URL (which may or may not carry a protocol) into
// a full origin using the supplied protocol. Any protocol baked into the base
// is replaced by the supplied one so the page protocol always wins.
export function resolveOrigin(baseUrl: string, protocol: string): string {
  const host = baseUrl.replace(/^https?:\/\//, "");
  return `${protocol}//${host}`;
}
