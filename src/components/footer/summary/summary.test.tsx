import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Summary from "./summary";
import {
  RoomStateContext,
  RoomStateProvider,
  RoomStateEnum,
} from "../../contexts/room-context";

const { averageOfScoresSpy } = vi.hoisted(() => ({ averageOfScoresSpy: vi.fn(() => 0) }));

vi.mock("../../../utils/math-functions", () => ({
  averageOfScores: (scores: (string | number | null | undefined)[]) =>
    averageOfScoresSpy(scores),
  roundToTwo: (num: number) => num,
}));

const SetRoomButton: FC = () => {
  const { setRoomState } = useContext(RoomStateContext);
  return (
    <button
      data-testid="set-room"
      onClick={() =>
        setRoomState(RoomStateEnum.PICK, [
          { client_id: "client-1", client_name: "a", score: "2", selected: true },
          { client_id: "client-2", client_name: "b", score: "4", selected: true },
        ])
      }
    >
      set room
    </button>
  );
};

const Room: FC = () => {
  const [tick, setTick] = useState(0);
  return (
    <>
      <RoomStateProvider>
        <Summary />
        <SetRoomButton />
      </RoomStateProvider>
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
  averageOfScoresSpy.mockClear();
});

describe("summary", () => {
  it("recomputes the average only when the room clients change", () => {
    render(<Room />);
    expect(averageOfScoresSpy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("tick"));
    expect(averageOfScoresSpy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("set-room"));
    expect(averageOfScoresSpy).toHaveBeenCalledTimes(2);
  });
});
