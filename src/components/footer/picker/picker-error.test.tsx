// @vitest-environment jsdom
import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import Picker from "./picker";
import { ClientContext, ClientProvider } from "../../contexts/client-context";
import { RoomStateProvider } from "../../contexts/room-context";

const { addScoreSpy, removeScoreSpy } = vi.hoisted(() => ({
  addScoreSpy: vi.fn(),
  removeScoreSpy: vi.fn(),
}));

vi.mock("../../../services/scrum-cards-api", () => ({
  default: {
    addScore: (roomId: string, clientId: string, score: string) =>
      addScoreSpy(roomId, clientId, score),
    removeScore: (roomId: string, clientId: string) => removeScoreSpy(roomId, clientId),
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

const Room: FC = () => {
  const [tick, setTick] = useState(0);
  return (
    <>
      <RoomStateProvider>
        <Picker />
      </RoomStateProvider>
      <button data-testid="tick" onClick={() => setTick(tick + 1)}>
        tick
      </button>
    </>
  );
};

const renderPicker = () =>
  render(
    <MemoryRouter initialEntries={["/room123"]}>
      <ClientProvider>
        <SetClientButton id="client-1" name="tester" />
        <Routes>
          <Route path="/:room_id" element={<Room />} />
        </Routes>
      </ClientProvider>
    </MemoryRouter>
  );

const card = (number: string) =>
  screen.getByText(number).closest(".picker__card") as HTMLElement;

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  addScoreSpy.mockClear();
  removeScoreSpy.mockClear();
});

describe("picker error feedback", () => {
  it("shows the API error message when picking a card fails", async () => {
    addScoreSpy.mockReturnValue(throwError(() => new Error("pick failed")));
    renderPicker();
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(card("5"));
    expect(await screen.findByText("pick failed")).toBeTruthy();
  });

  it("shows the API error message when removing a card fails", async () => {
    addScoreSpy.mockReturnValue(of("client-1"));
    removeScoreSpy.mockReturnValue(throwError(() => new Error("remove failed")));
    renderPicker();
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(card("5"));
    fireEvent.click(card("5"));
    expect(await screen.findByText("remove failed")).toBeTruthy();
  });

  it("does not show an error when picking a card succeeds", () => {
    addScoreSpy.mockReturnValue(of("client-1"));
    renderPicker();
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(card("5"));
    expect(screen.queryByText("pick failed")).toBeNull();
  });
});
