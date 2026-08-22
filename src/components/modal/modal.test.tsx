import { FC, useContext, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Modal from "./modal";
import { ClientContext, ClientProvider } from "../contexts/client-context";

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

const inputOf = (container: HTMLElement) => container.querySelector("input") as HTMLInputElement;

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

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  installLocalStorage();
});

describe("modal", () => {
  it("keeps the typed name across client context provider re-renders", () => {
    const { baseElement } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ModalHarness />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("set-client"));
    const input = inputOf(baseElement);
    expect(input.value).toBe("saved-name");
    fireEvent.change(input, { target: { value: "typed-name" } });
    expect(input.value).toBe("typed-name");
    fireEvent.click(screen.getByTestId("tick"));
    expect(input.value).toBe("typed-name");
  });
});
