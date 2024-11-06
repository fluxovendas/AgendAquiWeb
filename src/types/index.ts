export interface Appointment {
  id: string;
  clientName: string;
  barber: string;
  date: string;
  time: string;
  phone: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  services: string[];
  totalPrice: number;
}

export interface Barber {
  id: string;
  name: string;
  phone: string;
  startTime: string;
  endTime: string;
  daysOff: number[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface BarberStats {
  barberName: string;
  scheduledRevenue: number;
  completedRevenue: number;
  appointmentCount: number;
}