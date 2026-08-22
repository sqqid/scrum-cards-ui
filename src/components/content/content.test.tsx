import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Content from "./content";
import { ClientContext, ClientProvider } from "../contexts/client-context";
import { ModalContextProvider } from "../contexts/modal-context";
import { RoomStateProvider } from "../contexts/room-context";

const { openEventStreamSpy, unsubscribeSpy } = vi.hoisted(() => ({
  openEventStreamSpy: vi.fn(),
  unsubscribeSpy: vi.fn(),
}));

vi.mock("../../services/scrum-cards-api", () => ({
  default: {
    openEventStream: (roomId: string, clientId: string) => openEventStreamSpy(roomId, clientId),
  },
}));

const SetClientButton: FC<{ id: string; name: string; testId: string }> = ({
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

const ContentHarness: FC = () => {
  const [tick, setTick] = useState(0);
  return (
    <>
      <ClientProvider>
        <SetClientButton id="client-1" name="tester" testId="set-client" />
        <SetClientButton id="client-2" name="second" testId="set-second-client" />
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
  openEventStreamSpy.mockClear();
  unsubscribeSpy.mockClear();
  openEventStreamSpy.mockReturnValue({ subscribe: () => ({ unsubscribe: unsubscribeSpy }) });
});

describe("content", () => {
  it("opens a single stream per room and does not reopen it on re-renders", () => {
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    expect(openEventStreamSpy).toHaveBeenCalledTimes(1);
    expect(openEventStreamSpy).toHaveBeenCalledWith("room123", "client-1");
    fireEvent.click(screen.getByTestId("tick"));
    expect(openEventStreamSpy).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes the stream when the component unmounts", () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    expect(openEventStreamSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it("closes the previous stream when the client changes", () => {
    render(
      <MemoryRouter initialEntries={["/room123"]}>
        <ContentHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(screen.getByTestId("set-second-client"));
    expect(openEventStreamSpy).toHaveBeenCalledTimes(2);
    expect(openEventStreamSpy).toHaveBeenLastCalledWith("room123", "client-2");
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
