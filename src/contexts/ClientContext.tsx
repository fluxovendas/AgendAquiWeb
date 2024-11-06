import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../socket';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface ClientContextType {
  clients: Client[];
  addClient: (client: Client) => void;
  removeClient: (id: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Cliente exemplo
const exampleClient: Client = {
  id: '1',
  name: 'Maria Santos',
  phone: '(11) 98888-8888',
  email: 'maria@exemplo.com'
};

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([exampleClient]);

  useEffect(() => {
    socket.emit('get_clients');

    socket.on('clients', (data) => {
      setClients(data.length > 0 ? data : [exampleClient]);
    });

    return () => {
      socket.off('clients');
    };
  }, []);

  const addClient = (client: Client) => {
    socket.emit('add_client', client);
    setClients(prev => [...prev, client]);
  };

  const removeClient = (id: string) => {
    if (id === '1') return; // Previne remover o cliente exemplo
    socket.emit('remove_client', id);
    setClients(prev => prev.filter(client => client.id !== id));
  };

  return (
    <ClientContext.Provider value={{ clients, addClient, removeClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}