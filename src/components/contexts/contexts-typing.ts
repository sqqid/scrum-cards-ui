import { FC, ReactNode } from "react";
import { ClientProvider } from "./client-context";
import { RoomStateProvider } from "./room-context";
import { ThemeProvider } from "./theme-context";
import { ModalContextProvider } from "./modal-context";
import DownArrow from "../header/svg/down-arrow";
import MoonSvg from "../header/svg/moon-svg";
import SunSvg from "../header/svg/sun-svg";

type PropsOf<T> = T extends FC<infer P> ? P : never;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type _clientProvider = Expect<Equal<PropsOf<typeof ClientProvider>, { children: ReactNode }>>;
type _roomStateProvider = Expect<Equal<PropsOf<typeof RoomStateProvider>, { children: ReactNode }>>;
type _themeProvider = Expect<Equal<PropsOf<typeof ThemeProvider>, { children: ReactNode }>>;
type _modalContextProvider = Expect<
  Equal<PropsOf<typeof ModalContextProvider>, { children: ReactNode }>
>;

type _downArrow = Expect<Equal<ReturnType<typeof DownArrow>, JSX.Element>>;
type _moonSvg = Expect<Equal<ReturnType<typeof MoonSvg>, JSX.Element>>;
type _sunSvg = Expect<Equal<ReturnType<typeof SunSvg>, JSX.Element>>;
