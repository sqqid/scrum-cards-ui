import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import { modalActions } from "./modal-actions";

const {
  createRoomSpy,
  registerClientSpy,
  changeClientNameSpy,
  disconnectStremSpy,
} = vi.hoisted(() => ({
  createRoomSpy: vi.fn(),
  registerClientSpy: vi.fn(),
  changeClientNameSpy: vi.fn(),
  disconnectStremSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    createRoom: () => createRoomSpy(),
    registerClient: (roomId: string, name: string) => registerClientSpy(roomId, name),
    changeClientName: (roomId: string, clientId: string, name: string) =>
      changeClientNameSpy(roomId, clientId, name),
    disconnectStrem: () => disconnectStremSpy(),
  },
}));

describe("modalActions", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => null);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("addRoomClicked reports the room and client ids on success", () => {
    createRoomSpy.mockReturnValue(of("room-1"));
    registerClientSpy.mockReturnValue(of("client-1"));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.addRoomClicked("tester", observer);
    expect(registerClientSpy).toHaveBeenCalledWith("room-1", "tester");
    expect(observer.next).toHaveBeenCalledWith({ roomId: "room-1", clientId: "client-1" });
    expect(observer.error).not.toHaveBeenCalled();
    expect(disconnectStremSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("addRoomClicked logs and reports the error when room creation fails", () => {
    createRoomSpy.mockReturnValue(throwError(() => new Error("room creation failed")));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.addRoomClicked("tester", observer);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to create room:",
      expect.any(Error)
    );
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error.mock.calls[0][0].message).toBe("room creation failed");
    expect(observer.next).not.toHaveBeenCalled();
  });

  it("addRoomClicked logs and reports the error when client registration fails", () => {
    createRoomSpy.mockReturnValue(of("room-1"));
    registerClientSpy.mockReturnValue(throwError(() => new Error("client registration failed")));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.addRoomClicked("tester", observer);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to create room:",
      expect.any(Error)
    );
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error.mock.calls[0][0].message).toBe("client registration failed");
    expect(observer.next).not.toHaveBeenCalled();
  });

  it("updateUserName logs and reports the error", () => {
    changeClientNameSpy.mockReturnValue(throwError(() => new Error("name change failed")));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.updateUserName("room123", { id: "client-1", name: "tester" }, observer);
    expect(changeClientNameSpy).toHaveBeenCalledWith("room123", "client-1", "tester");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to change client name:",
      expect.any(Error)
    );
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error.mock.calls[0][0].message).toBe("name change failed");
  });

  it("updateUserName reports success to the observer", () => {
    changeClientNameSpy.mockReturnValue(of("client-1"));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.updateUserName("room123", { id: "client-1", name: "tester" }, observer);
    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(observer.error).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("registerClient logs and reports the error", () => {
    registerClientSpy.mockReturnValue(throwError(() => new Error("registration failed")));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.registerClient("room123", "tester", observer);
    expect(registerClientSpy).toHaveBeenCalledWith("room123", "tester");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to register client:",
      expect.any(Error)
    );
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error.mock.calls[0][0].message).toBe("registration failed");
  });

  it("registerClient reports the client id to the observer on success", () => {
    registerClientSpy.mockReturnValue(of("client-1"));
    const observer = { next: vi.fn(), error: vi.fn() };
    modalActions.registerClient("room123", "tester", observer);
    expect(observer.next).toHaveBeenCalledWith("client-1");
    expect(observer.error).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
