export function httpProtocol(pageProtocol: string): string {
  return pageProtocol === "https:" ? "https:" : "http:";
}

export function resolveOrigin(baseUrl: string, protocol: string): string {
  const host = baseUrl.replace(/^https?:\/\//, "");
  return `${protocol}//${host}`;
}
