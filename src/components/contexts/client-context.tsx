import { createContext, useCallback, useState, FC, ReactNode } from "react";

interface IClient {
  id: string | undefined;
  name: string | undefined;
  changeClient: ({ id, name }: { id?: string; name?: string }) => void;
}

interface IClientState {
  id: string | undefined;
  name: string | undefined;
}

const ClientContext = createContext<IClient>({
  id: undefined,
  name: undefined,
  changeClient: () => null,
});

const ClientProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<IClientState>({
    id: undefined,
    name: undefined,
  });

  const changeClient = useCallback(({ id, name }: { id?: string; name?: string }) => {
    setClient({ id: id, name: name });
  }, []);

  return (
    <ClientContext.Provider value={{ id: client.id, name: client.name, changeClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export { ClientContext, ClientProvider };
export type { IClient };
