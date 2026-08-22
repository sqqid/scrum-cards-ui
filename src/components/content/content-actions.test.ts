import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import { contentActions } from "./content-actions";

const { revealSpy, pickSpy, openEventStreamSpy, registerClientSpy } = vi.hoisted(() => ({
  revealSpy: vi.fn(),
  pickSpy: vi.fn(),
  openEventStreamSpy: vi.fn(),
  registerClientSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    reveal: (roomId: string) => revealSpy(roomId),
    pick: (roomId: string) => pickSpy(roomId),
    openEventStream: (roomId: string, clientId: string) => openEventStreamSpy(roomId, clientId),
    registerClient: (roomId: string, name: string) => registerClientSpy(roomId, name),
  },
}));

describe("contentActions", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => null);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("reveal logs the error and reports it to the error handler", () => {
    revealSpy.mockReturnValue(throwError(() => new Error("room not found")));
    const onError = vi.fn();
    contentActions.reveal("room123", onError);
    expect(revealSpy).toHaveBeenCalledWith("room123");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to reveal cards:", expect.any(Error));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("room not found");
  });

  it("reveal does not log on success", () => {
    revealSpy.mockReturnValue(of(null));
    contentActions.reveal("room123");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("newVoting logs the error and reports it to the error handler", () => {
    pickSpy.mockReturnValue(throwError(() => new Error("room not found")));
    const onError = vi.fn();
    contentActions.newVoting("room123", onError);
    expect(pickSpy).toHaveBeenCalledWith("room123");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to start new voting:", expect.any(Error));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("room not found");
  });

  it("newVoting does not log on success", () => {
    pickSpy.mockReturnValue(of(null));
    contentActions.newVoting("room123");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("openStream forwards broadcast data to the observer", () => {
    openEventStreamSpy.mockReturnValue(of("payload"));
    const observer = { next: vi.fn(), error: vi.fn() };
    contentActions.openStream("room123", "client-1", observer);
    expect(observer.next).toHaveBeenCalledWith("payload");
    expect(observer.error).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("openStream logs stream errors and forwards them to the observer", () => {
    openEventStreamSpy.mockReturnValue(throwError(() => new Error("stream failed")));
    const observer = { next: vi.fn(), error: vi.fn() };
    contentActions.openStream("room123", "client-1", observer);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to open room event stream:",
      expect.any(Error)
    );
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error.mock.calls[0][0].message).toBe("stream failed");
  });

  it("rejoinClient reports the new client id on success", () => {
    registerClientSpy.mockReturnValue(of("client-2"));
    const onNext = vi.fn();
    contentActions.rejoinClient("room123", "tester", { next: onNext });
    expect(registerClientSpy).toHaveBeenCalledWith("room123", "tester");
    expect(onNext).toHaveBeenCalledWith("client-2");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("rejoinClient logs the error and reports it to the error handler", () => {
    registerClientSpy.mockReturnValue(throwError(() => new Error("room not found")));
    const onError = vi.fn();
    contentActions.rejoinClient("room123", "tester", { next: vi.fn(), error: onError });
    expect(registerClientSpy).toHaveBeenCalledWith("room123", "tester");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to rejoin room:", expect.any(Error));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("room not found");
  });
});
