import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Picker from "./picker";
import { ClientContext, ClientProvider } from "../../contexts/client-context";
import {
  RoomStateContext,
  RoomStateProvider,
  RoomStateEnum,
} from "../../contexts/room-context";
import { pickerCardActions } from "./picker-card/picker-card-actions";

vi.mock("./picker-card/picker-card-actions", () => ({
  pickerCardActions: {
    pickCard: vi.fn(),
    removeCard: vi.fn(),
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

const RevealButton: FC = () => {
  const { setRoomState } = useContext(RoomStateContext);
  return (
    <button data-testid="reveal" onClick={() => setRoomState(RoomStateEnum.REVEAL, [])}>
      reveal
    </button>
  );
};

const Room: FC = () => {
  const [tick, setTick] = useState(0);
  return (
    <>
      <RoomStateProvider>
        <Picker />
        <RevealButton />
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

const selectedCard = (number: string) =>
  screen.getByText(number).closest(".picker__card") as HTMLElement;

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.mocked(pickerCardActions.pickCard).mockClear();
  vi.mocked(pickerCardActions.removeCard).mockClear();
});

describe("picker", () => {
  it("resets the selected card when the room state becomes REVEAL", () => {
    renderPicker();
    fireEvent.click(screen.getByTestId("set-client"));
    const card = selectedCard("5");
    fireEvent.click(card);
    expect(pickerCardActions.pickCard).toHaveBeenCalledWith("room123", "client-1", "5");
    expect(card.className).toContain("picker__card--selected");
    fireEvent.click(screen.getByTestId("reveal"));
    expect(card.className).not.toContain("picker__card--selected");
  });

  it("keeps the selected card across room state provider re-renders", () => {
    renderPicker();
    fireEvent.click(screen.getByTestId("set-client"));
    fireEvent.click(screen.getByTestId("reveal"));
    const card = selectedCard("5");
    fireEvent.click(card);
    expect(card.className).toContain("picker__card--selected");
    fireEvent.click(screen.getByTestId("tick"));
    expect(card.className).toContain("picker__card--selected");
  });
});
