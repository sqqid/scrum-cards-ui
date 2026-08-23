import { afterEach, describe, expect, it, vi } from "vitest";
import { firstValueFrom } from "rxjs";

vi.hoisted(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { protocol: "http:", host: "localhost:3000" } },
  });
});

import scrumCardsApi from "./scrum-cards-api";

const jsonResponse = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("scrum-cards-api", () => {
  it("resolves with the JSON body on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, "room-1")));
    await expect(firstValueFrom(scrumCardsApi.createRoom())).resolves.toBe("room-1");
  });

  it("rejects with the API error message on a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(404, { message: "room not found" }))
    );
    await expect(firstValueFrom(scrumCardsApi.createRoom())).rejects.toThrow("room not found");
  });

  it("rejects with the status when the error body has no message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, {})));
    await expect(firstValueFrom(scrumCardsApi.createRoom())).rejects.toThrow("500");
  });

  it("rejects when the network request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(firstValueFrom(scrumCardsApi.createRoom())).rejects.toThrow("Failed to fetch");
  });

  it("does not expose the removed websocket stream API", () => {
    const api = scrumCardsApi as unknown as Record<string, unknown>;
    expect(api.openStrem).toBeUndefined();
    expect(api.disconnectStrem).toBeUndefined();
    expect(api.getStream).toBeUndefined();
  });
});
