import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../socket';
import { Appointment } from '../types';

interface AppointmentContextType {
  appointments: Appointment[];
  createAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  loading: boolean;
  error: string | null;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Exemplo de agendamento para demonstração
const exampleAppointment: Appointment = {
  id: 'example-1',
  clientName: 'Maria Santos',
  barber: 'João Silva',
  date: new Date().toISOString().split('T')[0],
  time: '14:00',
  phone: '(11) 98888-8888',
  status: 'scheduled',
  services: ['1', '2'],
  totalPrice: 80
};

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([exampleAppointment]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.emit('get_appointments');

    socket.on('appointments', (data) => {
      setAppointments(data.length > 0 ? data : [exampleAppointment]);
      setLoading(false);
    });

    socket.on('appointment_created', (appointment) => {
      setAppointments(prev => [...prev, appointment]);
    });

    socket.on('error', (message) => {
      setError(message);
      setLoading(false);
    });

    return () => {
      socket.off('appointments');
      socket.off('appointment_created');
      socket.off('error');
    };
  }, []);

  const createAppointment = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment = {
      ...appointmentData,
      id: crypto.randomUUID(),
      status: 'scheduled' as const
    };

    // Atualiza o estado imediatamente
    setAppointments(prev => [...prev, newAppointment]);
    
    // Envia para o servidor
    socket.emit('create_appointment', newAppointment);
  };

  return (
    <AppointmentContext.Provider value={{ appointments, createAppointment, loading, error }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}