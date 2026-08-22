import { createContext, useState, FC, ReactNode } from "react";

interface IModalState {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ModalContext = createContext<IModalState>({
  visible: false,
  setVisible: () => null,
});

const ModalContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<boolean>(false);

  const setVisible = (visible: boolean) => {
    setState(visible);
  };

  return (
    <ModalContext.Provider value={{ visible: state, setVisible }}>{children}</ModalContext.Provider>
  );
};

export { ModalContext, ModalContextProvider };
