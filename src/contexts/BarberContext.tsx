import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../socket';

interface Barber {
  id: string;
  name: string;
  phone: string;
  startTime: string;
  endTime: string;
  daysOff: number[];
}

interface BarberContextType {
  barbers: Barber[];
  addBarber: (barber: Barber) => void;
  removeBarber: (id: string) => void;
}

const BarberContext = createContext<BarberContextType | undefined>(undefined);

// Barbeiro exemplo
const exampleBarber: Barber = {
  id: '1',
  name: 'João Silva',
  phone: '(11) 99999-9999',
  startTime: '08:00',
  endTime: '18:00',
  daysOff: [0] // Domingo
};

export function BarberProvider({ children }: { children: React.ReactNode }) {
  const [barbers, setBarbers] = useState<Barber[]>([exampleBarber]);

  useEffect(() => {
    socket.emit('get_barbers');

    socket.on('barbers', (data) => {
      setBarbers(data.length > 0 ? data : [exampleBarber]);
    });

    return () => {
      socket.off('barbers');
    };
  }, []);

  const addBarber = (barber: Barber) => {
    socket.emit('add_barber', barber);
    setBarbers(prev => [...prev, barber]);
  };

  const removeBarber = (id: string) => {
    if (id === '1') return; // Previne remover o barbeiro exemplo
    socket.emit('remove_barber', id);
    setBarbers(prev => prev.filter(barber => barber.id !== id));
  };

  return (
    <BarberContext.Provider value={{ barbers, addBarber, removeBarber }}>
      {children}
    </BarberContext.Provider>
  );
}

export function useBarbers() {
  const context = useContext(BarberContext);
  if (context === undefined) {
    throw new Error('useBarbers must be used within a BarberProvider');
  }
  return context;
}