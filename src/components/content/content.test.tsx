import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Content from "./content";
import { ClientContext, ClientProvider } from "../contexts/client-context";
import { ModalContextProvider } from "../contexts/modal-context";
import { RoomStateProvider } from "../contexts/room-context";

const { openEventStremSpy } = vi.hoisted(() => ({ openEventStremSpy: vi.fn() }));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    openEventStrem: (roomId: string, clientId: string) =>
      openEventStremSpy(roomId, clientId),
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

const ContentHarness: FC = () => {
  const [tick, setTick] = useState(0);
  return (
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
      <button data-testid="tick" onClick={() => setTick(tick + 1)}>
        tick
      </button>
    </>
  );
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  openEventStremSpy.mockClear();
  openEventStremSpy.mockReturnValue({ subscribe: () => ({ unsubscribe: vi.fn() }) });
});

describe("content", () => {
  it("opens a single stream per room and does not reopen it on re-renders", () => {
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    expect(openEventStremSpy).toHaveBeenCalledTimes(1);
    expect(openEventStremSpy).toHaveBeenCalledWith("room123", "client-1");
    fireEvent.click(screen.getByTestId("tick"));
    expect(openEventStremSpy).toHaveBeenCalledTimes(1);
  });
});
