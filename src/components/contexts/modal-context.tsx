import {createContext, useEffect, useState} from "react";

interface IModalState {
    visible: boolean,
    setVisible: (visible: boolean) => void
}

const ModalContext = createContext<IModalState>({
    visible: false,
    setVisible: () => null
})

// @ts-ignore
const ModalContextProvider = ({children}) => {
    const [state, setState] = useState<boolean>(false)

    const setVisible = (visible: boolean) => {
        setState(visible)
    }

    return (
        <ModalContext.Provider value={{visible: state, setVisible}}>
            {children}
        </ModalContext.Provider>
    )
}

export {ModalContext, ModalContextProvider}
