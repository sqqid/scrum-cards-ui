import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import { pickerCardActions } from "./picker-card-actions";

const { addScoreSpy, removeScoreSpy } = vi.hoisted(() => ({
  addScoreSpy: vi.fn(),
  removeScoreSpy: vi.fn(),
}));

vi.mock("../../../../services/scrum-cards-api", () => ({
  default: {
    addScore: (roomId: string, clientId: string, score: string) =>
      addScoreSpy(roomId, clientId, score),
    removeScore: (roomId: string, clientId: string) => removeScoreSpy(roomId, clientId),
  },
}));

describe("pickerCardActions", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => null);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("pickCard logs the error and reports it to the error handler", () => {
    addScoreSpy.mockReturnValue(throwError(() => new Error("pick failed")));
    const onError = vi.fn();
    pickerCardActions.pickCard("room123", "client-1", "5", onError);
    expect(addScoreSpy).toHaveBeenCalledWith("room123", "client-1", "5");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to pick card:", expect.any(Error));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("pick failed");
  });

  it("pickCard does not log on success", () => {
    addScoreSpy.mockReturnValue(of("client-1"));
    pickerCardActions.pickCard("room123", "client-1", "5");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("removeCard logs the error and reports it to the error handler", () => {
    removeScoreSpy.mockReturnValue(throwError(() => new Error("remove failed")));
    const onError = vi.fn();
    pickerCardActions.removeCard("room123", "client-1", onError);
    expect(removeScoreSpy).toHaveBeenCalledWith("room123", "client-1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to remove card:", expect.any(Error));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("remove failed");
  });

  it("removeCard does not log on success", () => {
    removeScoreSpy.mockReturnValue(of("client-1"));
    pickerCardActions.removeCard("room123", "client-1");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
