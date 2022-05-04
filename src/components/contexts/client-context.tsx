import {createContext, useEffect, useLayoutEffect, useState} from "react";
import storage from "../../constants/local-storage";
import {of} from "rxjs";

export interface IClient {
    id: string | undefined,
    name: string | undefined
    setClient:React.Dispatch<React.SetStateAction<IClientState>>
}

interface IClientState {
    id: string | undefined,
    name: string | undefined
}

const ClientContext = createContext<IClient>({id: undefined, name: undefined, setClient: () => null})

// @ts-ignore
const ClientProvider = ({children}) => {
    const [client, setClient] = useState<IClientState>({id: undefined, name: undefined});

    const setClientName = (name: string) => {
        if(client.name) localStorage.setItem(storage.CLIENT_NAME, name)
        setClient({...client, name})
    }

    useLayoutEffect(() => {
        of(localStorage.getItem(storage.CLIENT_NAME)).subscribe((clientName) => {
            if (clientName) setClient({...client, name: clientName})
        }).unsubscribe()
    }, [])

    return (
        <ClientContext.Provider value={{id: client.id, name: client.name, setClient}}>
            {children}
        </ClientContext.Provider>
    )
}

export {ClientContext, ClientProvider}