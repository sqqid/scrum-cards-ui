import { describe, expect, it } from "vitest";

import { httpProtocol, resolveOrigin } from "./api-url";

describe("httpProtocol", () => {
  it("follows the page protocol for https pages", () => {
    expect(httpProtocol("https:")).toBe("https:");
  });

  it("falls back to http for non-https pages", () => {
    expect(httpProtocol("http:")).toBe("http:");
  });
});

describe("resolveOrigin", () => {
  it("prepends the page protocol to a protocol-less base URL", () => {
    expect(resolveOrigin("localhost:8080/api", "https:")).toBe("https://localhost:8080/api");
  });

  it("keeps http for http pages", () => {
    expect(resolveOrigin("example.com/api", "http:")).toBe("http://example.com/api");
  });

  it("replaces a baked-in http protocol with the page protocol", () => {
    expect(resolveOrigin("http://localhost:8080/api", "https:")).toBe("https://localhost:8080/api");
  });

  it("replaces a baked-in https protocol with the page protocol", () => {
    expect(resolveOrigin("https://localhost:8080/api", "http:")).toBe("http://localhost:8080/api");
  });
});
