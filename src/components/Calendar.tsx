import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useAppointments } from '../contexts/AppointmentContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Calendar() {
  const { appointments } = useAppointments();

  const events = appointments.map(appointment => {
    const start = parse(`${appointment.date} ${appointment.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = addMinutes(start, 30); // Each appointment is 30 minutes
    
    return {
      title: `${appointment.clientName} com ${appointment.barber}`,
      start,
      end,
      resource: appointment,
    };
  });

  const eventStyleGetter = (event: any) => {
    const isPast = event.start < new Date();
    return {
      style: {
        backgroundColor: isPast ? '#9CA3AF' : '#2563EB',
        borderRadius: '4px',
      }
    };
  };

  return (
    <div className="p-6 h-full">
      <h1 className="text-3xl font-bold mb-8">Agenda</h1>
      
      <div className="bg-white rounded-lg shadow p-6 h-[calc(100vh-12rem)]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há agendamentos neste período",
          }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          min={new Date(2024, 0, 1, 8, 0)} // Start at 8:00
          max={new Date(2024, 0, 1, 18, 0)} // End at 18:00
          step={30} // 30 minute intervals
          timeslots={1}
        />
      </div>
    </div>
  );
}

export default Calendar;