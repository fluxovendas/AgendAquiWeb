import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../socket';
import { Service } from '../types';

interface ServiceContextType {
  services: Service[];
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  removeService: (id: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Serviços exemplo
const defaultServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', price: 45, duration: 30 },
  { id: '2', name: 'Barba', price: 35, duration: 30 },
  { id: '3', name: 'Cabelo e Barba', price: 70, duration: 60 },
  { id: '4', name: 'Pintura de Cabelo', price: 90, duration: 90 },
  { id: '5', name: 'Penteado', price: 60, duration: 45 },
  { id: '6', name: 'Maquiagem', price: 80, duration: 60 },
];

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>(defaultServices);

  useEffect(() => {
    socket.emit('get_services');

    socket.on('services', (data) => {
      setServices(data.length > 0 ? data : defaultServices);
    });

    return () => {
      socket.off('services');
    };
  }, []);

  const addService = (service: Service) => {
    socket.emit('add_service', service);
    setServices(prev => [...prev, service]);
  };

  const updateService = (service: Service) => {
    socket.emit('update_service', service);
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
  };

  const removeService = (id: string) => {
    if (defaultServices.some(s => s.id === id)) return; // Previne remover serviços padrão
    socket.emit('remove_service', id);
    setServices(prev => prev.filter(service => service.id !== id));
  };

  return (
    <ServiceContext.Provider value={{ services, addService, updateService, removeService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}