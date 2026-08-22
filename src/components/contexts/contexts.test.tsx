import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ClientContext, ClientProvider } from "./client-context";
import { ModalContext, ModalContextProvider } from "./modal-context";
import { RoomStateContext, RoomStateProvider } from "./room-context";
import { ThemeContext, ThemeProvider } from "./theme-context";

const ClientProbe: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const { changeClient } = useContext(ClientContext);
  seen.current.push(changeClient);
  return null;
};

const RoomStateProbe: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const { setRoomState } = useContext(RoomStateContext);
  seen.current.push(setRoomState);
  return null;
};

const ModalProbe: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const { setVisible } = useContext(ModalContext);
  seen.current.push(setVisible);
  return null;
};

const ThemeProbe: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const { toggleTheme } = useContext(ThemeContext);
  seen.current.push(toggleTheme);
  return null;
};

const ClientHarness: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const [tick, setTick] = useState(0);
  return (
    <div>
      <ClientProvider>
        <ClientProbe seen={seen} />
      </ClientProvider>
      <button onClick={() => setTick(tick + 1)}>tick</button>
    </div>
  );
};

const RoomStateHarness: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const [tick, setTick] = useState(0);
  return (
    <div>
      <RoomStateProvider>
        <RoomStateProbe seen={seen} />
      </RoomStateProvider>
      <button onClick={() => setTick(tick + 1)}>tick</button>
    </div>
  );
};

const ModalHarness: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const [tick, setTick] = useState(0);
  return (
    <div>
      <ModalContextProvider>
        <ModalProbe seen={seen} />
      </ModalContextProvider>
      <button onClick={() => setTick(tick + 1)}>tick</button>
    </div>
  );
};

const ThemeHarness: FC<{ seen: { current: unknown[] } }> = ({ seen }) => {
  const [tick, setTick] = useState(0);
  return (
    <div>
      <ThemeProvider>
        <ThemeProbe seen={seen} />
      </ThemeProvider>
      <button onClick={() => setTick(tick + 1)}>tick</button>
    </div>
  );
};

// Node's native globalThis.localStorage shadows the jsdom one in this
// vitest version, so install a minimal in-memory Storage for the tests.
const installLocalStorage = () => {
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

beforeAll(() => {
  installLocalStorage();
});

afterEach(() => {
  cleanup();
});

describe("context providers", () => {
  it("keep changeClient reference stable across provider re-renders", () => {
    const seen: { current: unknown[] } = { current: [] };
    const { getByRole } = render(<ClientHarness seen={seen} />);
    fireEvent.click(getByRole("button"));
    expect(seen.current.length).toBeGreaterThan(1);
    expect(new Set(seen.current).size).toBe(1);
  });

  it("keep setRoomState reference stable across provider re-renders", () => {
    const seen: { current: unknown[] } = { current: [] };
    const { getByRole } = render(<RoomStateHarness seen={seen} />);
    fireEvent.click(getByRole("button"));
    expect(seen.current.length).toBeGreaterThan(1);
    expect(new Set(seen.current).size).toBe(1);
  });

  it("keep setVisible reference stable across provider re-renders", () => {
    const seen: { current: unknown[] } = { current: [] };
    const { getByRole } = render(<ModalHarness seen={seen} />);
    fireEvent.click(getByRole("button"));
    expect(seen.current.length).toBeGreaterThan(1);
    expect(new Set(seen.current).size).toBe(1);
  });

  it("keep toggleTheme reference stable across provider re-renders", () => {
    const seen: { current: unknown[] } = { current: [] };
    const { getByRole } = render(<ThemeHarness seen={seen} />);
    fireEvent.click(getByRole("button"));
    expect(seen.current.length).toBeGreaterThan(1);
    expect(new Set(seen.current).size).toBe(1);
  });
});
