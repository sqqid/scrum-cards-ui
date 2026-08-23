// @vitest-environment jsdom
import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import Modal from "./modal";
import { ClientContext, ClientProvider } from "../contexts/client-context";

const { createRoomSpy, registerClientSpy } = vi.hoisted(() => ({
  createRoomSpy: vi.fn(),
  registerClientSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    createRoom: () => createRoomSpy(),
    registerClient: (roomId: string, name: string) => registerClientSpy(roomId, name),
  },
}));

const SetClientButton: FC<{ id: string; name: string }> = ({ id, name }) => {
  const { changeClient } = useContext(ClientContext);
  return (
    <button data-testid="set-client" onClick={() => changeClient({ id, name })}>
      set client
    </button>
  );
};

const ModalHarness: FC = () => {
  const [tick, setTick] = useState(0);
  return (
    <>
      <ClientProvider>
        <SetClientButton id="client-1" name="saved-name" />
        <Routes>
          <Route path="/" element={<Modal />} />
        </Routes>
      </ClientProvider>
      <button data-testid="tick" onClick={() => setTick(tick + 1)}>
        tick
      </button>
    </>
  );
};

const installInMemoryLocalStorage = () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key) : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  });
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  installInMemoryLocalStorage();
  createRoomSpy.mockClear();
  registerClientSpy.mockClear();
});

describe("modal error feedback", () => {
  it("shows the API error message and keeps the modal open when room creation fails", async () => {
    createRoomSpy.mockReturnValue(throwError(() => new Error("room creation failed")));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ModalHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(screen.getByRole("button", { name: /new room/i }));
    expect(await screen.findByText("room creation failed")).toBeTruthy();
    expect(screen.getByRole("button", { name: /new room/i })).toBeTruthy();
  });

  it("shows the API error message when client registration fails", async () => {
    createRoomSpy.mockReturnValue(of("room-1"));
    registerClientSpy.mockReturnValue(throwError(() => new Error("client registration failed")));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ModalHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(screen.getByRole("button", { name: /new room/i }));
    expect(await screen.findByText("client registration failed")).toBeTruthy();
  });

  it("leaves the modal on successful room creation", () => {
    createRoomSpy.mockReturnValue(of("room-1"));
    registerClientSpy.mockReturnValue(of("client-1"));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ModalHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(screen.getByRole("button", { name: /new room/i }));
    expect(screen.queryByRole("button", { name: /new room/i })).toBeNull();
    expect(screen.queryByText("room creation failed")).toBeNull();
  });
});
