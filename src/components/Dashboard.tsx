import React, { useMemo } from 'react';
import { useAppointments } from '../contexts/AppointmentContext';
import { useBarbers } from '../contexts/BarberContext';
import { Calendar, Scissors, Users, Clock, TrendingUp, Trophy } from 'lucide-react';
import { format, parse, isAfter, startOfToday, endOfToday, isBefore, startOfMonth, endOfMonth, addMinutes, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function Dashboard() {
  const { appointments = [], loading } = useAppointments();
  const { barbers = [] } = useBarbers();

  const todayAppointmentsByBarber = useMemo(() => {
    const counts = new Map();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    barbers.forEach(barber => {
      counts.set(barber.name, 0);
    });

    appointments
      .filter(app => app.date === today)
      .forEach(app => {
        const current = counts.get(app.barber) || 0;
        counts.set(app.barber, current + 1);
      });

    return counts;
  }, [appointments, barbers]);

  const nextAvailableSlots = useMemo(() => {
    const slots = new Map();
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    barbers.forEach(barber => {
      const [startHour] = (barber.startTime || '08:00').split(':').map(Number);
      const [endHour] = (barber.endTime || '18:00').split(':').map(Number);
      
      let currentDate = now;
      let found = false;

      // Look for slots in the next 7 days
      for (let day = 0; day < 7 && !found; day++) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        let currentSlot = setHours(setMinutes(currentDate, 0), startHour);
        const endTime = setHours(setMinutes(currentDate, 30), endHour - 1);

        while (currentSlot <= endTime && !found) {
          const timeStr = format(currentSlot, 'HH:mm');
          const isBooked = appointments.some(apt => 
            apt.date === dateStr && 
            apt.time === timeStr && 
            apt.barber === barber.name
          );

          if (!isBefore(currentSlot, now) && !isBooked) {
            slots.set(barber.name, {
              time: timeStr,
              date: dateStr,
              isToday: dateStr === today
            });
            found = true;
          }

          currentSlot = addMinutes(currentSlot, 30);
        }

        currentDate = addMinutes(currentDate, 24 * 60);
      }

      if (!found) {
        slots.set(barber.name, null);
      }
    });

    return slots;
  }, [appointments, barbers]);

  // Cálculo do ranking de barbeiros e faturamento
  const barberStats = useMemo(() => {
    const currentMonth = new Date();
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);

    const stats = barbers.map(barber => {
      const barberAppointments = appointments.filter(apt => {
        const aptDate = parse(apt.date, 'yyyy-MM-dd', new Date());
        return apt.barber === barber.name && 
               isAfter(aptDate, firstDay) && 
               isBefore(aptDate, lastDay);
      });

      const scheduledRevenue = barberAppointments
        .filter(apt => apt.status === 'scheduled')
        .reduce((total, apt) => total + apt.totalPrice, 0);

      const completedRevenue = barberAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((total, apt) => total + apt.totalPrice, 0);

      return {
        barberName: barber.name,
        scheduledRevenue,
        completedRevenue,
        totalRevenue: scheduledRevenue + completedRevenue,
        appointmentCount: barberAppointments.length
      };
    });

    return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [appointments, barbers]);

  const totalMonthlyRevenue = useMemo(() => {
    return barberStats.reduce((total, barber) => total + barber.scheduledRevenue, 0);
  }, [barberStats]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="text-center text-gray-500 mt-8">
          Carregando informações...
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="text-center text-gray-500 mt-8">
          Você verá um resumo de seus agendamentos aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Appointments by Barber */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500">Agendamentos Hoje</p>
              <div className="mt-2 space-y-1">
                {Array.from(todayAppointmentsByBarber.entries()).map(([barber, count]) => (
                  <div key={barber} className="flex justify-between items-center">
                    <span className="text-sm">{barber}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        {/* Next Available Slots */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500">Próximos Horários Disponíveis</p>
            <Clock className="h-10 w-10 text-green-500" />
          </div>
          <div className="space-y-2">
            {Array.from(nextAvailableSlots.entries()).map(([barber, slot]) => (
              <div key={barber} className="text-sm">
                <span className="font-medium">{barber}:</span>
                {slot ? (
                  <span className="ml-2">
                    {slot.isToday ? (
                      <span className="text-green-600">Hoje às {slot.time}</span>
                    ) : (
                      <span>
                        {format(parse(slot.date, 'yyyy-MM-dd', new Date()), "dd/MM 'às' ")}
                        {slot.time}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="ml-2 text-gray-400">Sem horários próximos</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Forecast */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Previsão de Faturamento (Mês Atual)</p>
              <h2 className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalMonthlyRevenue)}
              </h2>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Barber Ranking */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold">Ranking de Barbeiros (Mês Atual)</h2>
          </div>
          <div className="space-y-4">
            {barberStats.map((barber, index) => (
              <div key={barber.barberName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                  {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mr-2" />}
                  {index === 2 && <Trophy className="h-5 w-5 text-amber-700 mr-2" />}
                  <div>
                    <h3 className="font-medium">{barber.barberName}</h3>
                    <p className="text-sm text-gray-500">{barber.appointmentCount} agendamentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(barber.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Realizado: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(barber.completedRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Próximos Agendamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Barbeiro</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Horário</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(apt => isAfter(parse(`${apt.date} ${apt.time}`, 'yyyy-MM-dd HH:mm', new Date()), new Date()))
                  .sort((a, b) => {
                    const dateA = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date());
                    const dateB = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date());
                    return dateA.getTime() - dateB.getTime();
                  })
                  .slice(0, 5)
                  .map((appointment) => (
                    <tr key={appointment.id} className="border-b">
                      <td className="py-3">{appointment.clientName}</td>
                      <td className="py-3">{appointment.barber}</td>
                      <td className="py-3">{format(parse(appointment.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}</td>
                      <td className="py-3">{appointment.time}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Agendado' :
                           appointment.status === 'completed' ? 'Concluído' :
                           'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;