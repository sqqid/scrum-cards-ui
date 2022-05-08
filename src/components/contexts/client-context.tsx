import {createContext, useState} from "react";
import storage from "../../constants/local-storage";

interface IClient {
    id: string | undefined,
    name: string | undefined
    changeClient: ({id, name}: { id?: string, name?: string }) => void
}

interface IClientState {
    id: string | undefined,
    name: string | undefined
}

const ClientContext = createContext<IClient>({
    id: undefined,
    name: undefined,
    changeClient: () => null
})

// @ts-ignore
const ClientProvider = ({children}) => {
    const localStorageName = localStorage.getItem(storage.CLIENT_NAME)
    const [client, setClient] = useState<IClientState>({id: undefined, name: localStorageName ? localStorageName : undefined});

    const changeClient = ({id, name}: { id?: string, name?: string }) => {
        if (name) localStorage.setItem(storage.CLIENT_NAME, name)
        setClient({...client, id, name})
    }

    return (
        <ClientContext.Provider value={{id: client.id, name: client.name, changeClient}}>
            {children}
        </ClientContext.Provider>
    )
}

export {ClientContext, ClientProvider}
export type {IClient};
