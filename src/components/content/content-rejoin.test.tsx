// @vitest-environment jsdom
import { FC, useContext } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, Subject, tap, throwError } from "rxjs";
import Content from "./content";
import { ClientContext, ClientProvider } from "../contexts/client-context";
import { ModalContextProvider } from "../contexts/modal-context";
import { RoomStateProvider } from "../contexts/room-context";
import storage from "../../constants/local-storage";

const { openEventStreamSpy, registerClientSpy } = vi.hoisted(() => ({
  openEventStreamSpy: vi.fn(),
  registerClientSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    openEventStream: (roomId: string, clientId: string) => openEventStreamSpy(roomId, clientId),
    registerClient: (roomId: string, name: string) => registerClientSpy(roomId, name),
  },
}));

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

const SetClientButton: FC<{ id: string; name?: string; testId: string }> = ({
  id,
  name,
  testId,
}) => {
  const { changeClient } = useContext(ClientContext);
  return (
    <button data-testid={testId} onClick={() => changeClient({ id, name })}>
      set client
    </button>
  );
};

const ContentHarness: FC = () => (
  <>
    <ClientProvider>
      <SetClientButton id="client-1" name="tester" testId="set-client" />
      <SetClientButton id="client-1" testId="set-id-only" />
      <Routes>
        <Route
          path="/:room_id"
          element={
            <RoomStateProvider>
              <ModalContextProvider>
                <Content />
              </ModalContextProvider>
            </RoomStateProvider>
          }
        />
      </Routes>
    </ClientProvider>
  </>
);

const broadcast = (clients: unknown[]) => JSON.stringify({ state: "PICK", clients });

afterEach(() => {
  cleanup();
});

describe("content rejoin on stream loss", () => {
  let streams: Map<string, Subject<string>>;
  let closedStreams: string[];

  beforeEach(() => {
    installInMemoryLocalStorage();
    streams = new Map();
    closedStreams = [];
    openEventStreamSpy.mockClear();
    registerClientSpy.mockClear();
    openEventStreamSpy.mockImplementation((_roomId: string, clientId: string) => {
      let stream = streams.get(clientId);
      if (!stream) {
        stream = new Subject<string>();
        streams.set(clientId, stream);
      }
      return stream.asObservable().pipe(tap({ finalize: () => closedStreams.push(clientId) }));
    });
  });

  const renderRoom = () =>
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );

  it("re-registers the client with the same name and opens a fresh stream when the stream fails", async () => {
    registerClientSpy.mockReturnValue(of("client-2"));
    renderRoom();
    fireEvent.click(screen.getByTestId("set-client"));
    act(() => {
      streams
        .get("client-1")!
        .next(
          broadcast([{ client_id: "client-1", client_name: "tester", score: "5", selected: true }])
        );
    });
    expect(await screen.findByText("tester")).toBeTruthy();

    act(() => {
      streams.get("client-1")!.error(new Error("stream failed"));
    });

    expect(registerClientSpy).toHaveBeenCalledTimes(1);
    expect(registerClientSpy).toHaveBeenCalledWith("room123", "tester");
    expect(openEventStreamSpy).toHaveBeenLastCalledWith("room123", "client-2");
    expect(closedStreams).toContain("client-1");
    expect(closedStreams).not.toContain("client-2");
    expect(screen.queryByText("stream failed")).toBeNull();
  });

  it("shows the rejoined client with no score and not selected", async () => {
    registerClientSpy.mockReturnValue(of("client-2"));
    renderRoom();
    fireEvent.click(screen.getByTestId("set-client"));
    act(() => {
      streams
        .get("client-1")!
        .next(
          broadcast([{ client_id: "client-1", client_name: "tester", score: "5", selected: true }])
        );
    });
    expect(await screen.findByText("tester")).toBeTruthy();

    act(() => {
      streams.get("client-1")!.error(new Error("stream failed"));
    });
    expect(openEventStreamSpy).toHaveBeenLastCalledWith("room123", "client-2");

    act(() => {
      streams
        .get("client-2")!
        .next(
          broadcast([{ client_id: "client-2", client_name: "tester", score: "", selected: false }])
        );
    });

    expect(document.querySelectorAll(".table__card")).toHaveLength(1);
    expect(document.querySelector(".card__name")?.textContent).toBe("tester");
    expect(document.querySelector(".card__number--selected")).toBeNull();
    expect(document.querySelector(".card__number span")?.textContent).toBe("");
  });

  it("falls back to the stored display name when the client state has no name", async () => {
    registerClientSpy.mockReturnValue(of("client-2"));
    localStorage.setItem(storage.CLIENT_NAME, "stored-name");
    renderRoom();
    fireEvent.click(screen.getByTestId("set-id-only"));

    act(() => {
      streams.get("client-1")!.error(new Error("stream failed"));
    });

    expect(registerClientSpy).toHaveBeenCalledTimes(1);
    expect(registerClientSpy).toHaveBeenCalledWith("room123", "stored-name");
  });

  it("stops after 3 failed rejoins and surfaces the error", async () => {
    registerClientSpy.mockReturnValue(throwError(() => new Error("room not found")));
    renderRoom();
    fireEvent.click(screen.getByTestId("set-client"));

    act(() => {
      streams.get("client-1")!.error(new Error("stream failed"));
    });

    expect(registerClientSpy).toHaveBeenCalledTimes(3);
    expect(registerClientSpy).toHaveBeenLastCalledWith("room123", "tester");
    expect(await screen.findByText("room not found")).toBeTruthy();
    expect(openEventStreamSpy).toHaveBeenCalledTimes(1);
  });
});
