// @vitest-environment jsdom
import { FC, useContext } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import Content from "./content";
import { ClientContext, ClientProvider } from "../contexts/client-context";
import { ModalContextProvider } from "../contexts/modal-context";
import { RoomStateProvider } from "../contexts/room-context";

const { openEventStreamSpy, revealSpy, registerClientSpy } = vi.hoisted(() => ({
  openEventStreamSpy: vi.fn(),
  revealSpy: vi.fn(),
  registerClientSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    openEventStream: (roomId: string, clientId: string) => openEventStreamSpy(roomId, clientId),
    reveal: (roomId: string) => revealSpy(roomId),
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

const ContentHarness: FC = () => (
  <>
    <ClientProvider>
      <SetClientButton id="client-1" name="tester" />
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

const broadcastWithSelectedClient = () =>
  of(
    JSON.stringify({
      state: "PICK",
      clients: [{ client_id: "client-1", client_name: "tester", score: "5", selected: true }],
    })
  );

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  openEventStreamSpy.mockClear();
  openEventStreamSpy.mockReturnValue(broadcastWithSelectedClient());
  revealSpy.mockClear();
  registerClientSpy.mockClear();
});

describe("content error feedback", () => {
  it("shows the API error message when reveal fails", async () => {
    revealSpy.mockReturnValue(throwError(() => new Error("reveal failed")));
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    const revealButton = await screen.findByRole("button", { name: /reveal cards/i });
    fireEvent.click(revealButton);
    expect(await screen.findByText("reveal failed")).toBeTruthy();
  });

  it("shows the error message when the room event stream fails and rejoining is exhausted", async () => {
    openEventStreamSpy.mockReturnValue(throwError(() => new Error("stream failed")));
    registerClientSpy.mockReturnValue(throwError(() => new Error("room not found")));
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    expect(await screen.findByText("room not found")).toBeTruthy();
  });
});
