import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Summary from "./summary";
import { RoomStateContext, RoomStateProvider, RoomStateEnum } from "../../contexts/room-context";
import { averageOfScores } from "../../../utils/math-functions";

vi.mock("../../../utils/math-functions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../utils/math-functions")>();
  return {
    ...actual,
    averageOfScores: vi.fn(actual.averageOfScores),
  };
});

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

const SetZeroScoreButton: FC = () => {
  const { setRoomState } = useContext(RoomStateContext);
  return (
    <button
      data-testid="set-zero-room"
      onClick={() =>
        setRoomState(RoomStateEnum.PICK, [
          { client_id: "client-1", client_name: "a", score: "0", selected: true },
          { client_id: "client-2", client_name: "b", score: "4", selected: true },
        ])
      }
    >
      set zero room
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
        <SetZeroScoreButton />
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
  vi.mocked(averageOfScores).mockClear();
});

describe("summary", () => {
  it("recomputes the average only when the room clients change", () => {
    render(<Room />);
    expect(averageOfScores).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("tick"));
    expect(averageOfScores).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("set-room"));
    expect(averageOfScores).toHaveBeenCalledTimes(2);
  });

  it("includes a 0 score in the displayed average", () => {
    render(<Room />);
    fireEvent.click(screen.getByTestId("set-zero-room"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
