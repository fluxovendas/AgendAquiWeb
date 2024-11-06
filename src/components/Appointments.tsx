import React, { useState, useMemo } from 'react';
import { useAppointments } from '../contexts/AppointmentContext';
import { useBarbers } from '../contexts/BarberContext';
import { useClients } from '../contexts/ClientContext';
import { useServices } from '../contexts/ServiceContext';
import { format, parse, isBefore, addMinutes, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Calendar, Clock, User } from 'lucide-react';

function Appointments() {
  const { appointments, createAppointment } = useAppointments();
  const { barbers } = useBarbers();
  const { clients } = useClients();
  const { services } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    barberId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    selectedServices: [] as string[]
  });

  const availableTimeSlots = useMemo(() => {
    if (!formData.date || !formData.barberId) return [];

    const selectedBarber = barbers.find(b => b.id === formData.barberId);
    if (!selectedBarber) return [];

    const slots = [];
    const [startHour] = selectedBarber.startTime.split(':').map(Number);
    const [endHour] = selectedBarber.endTime.split(':').map(Number);
    
    const selectedDate = parse(formData.date, 'yyyy-MM-dd', new Date());
    let currentSlot = setHours(setMinutes(selectedDate, 0), startHour);
    const endTime = setHours(setMinutes(selectedDate, 30), endHour - 1);

    while (currentSlot <= endTime) {
      const timeString = format(currentSlot, 'HH:mm');
      const isInPast = isBefore(currentSlot, new Date());
      const isBooked = appointments.some(apt => 
        apt.date === formData.date && apt.time === timeString
      );

      if (!isInPast && !isBooked) {
        slots.push(timeString);
      }

      currentSlot = addMinutes(currentSlot, 30);
    }

    return slots;
  }, [formData.date, formData.barberId, appointments, barbers]);

  const totalPrice = useMemo(() => {
    return formData.selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  }, [formData.selectedServices, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.selectedServices.length === 0) {
      setError('Selecione pelo menos um serviço');
      return;
    }

    const appointmentDate = parse(`${formData.date} ${formData.time}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (isBefore(appointmentDate, new Date())) {
      setError('Não é possível agendar para um horário no passado');
      return;
    }

    const client = clients.find(c => c.id === formData.clientId);
    const barber = barbers.find(b => b.id === formData.barberId);
    
    if (client && barber) {
      createAppointment({
        clientName: client.name,
        barber: barber.name,
        date: formData.date,
        time: formData.time,
        phone: client.phone,
        services: formData.selectedServices,
        totalPrice
      });
      setShowForm(false);
      setFormData({
        clientId: '',
        barberId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        selectedServices: []
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Novo Agendamento
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Próximos Agendamentos</h2>
        </div>
        <div className="divide-y">
          {appointments
            .sort((a, b) => {
              const dateA = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date());
              const dateB = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date());
              return dateA.getTime() - dateB.getTime();
            })
            .map((appointment) => {
              const appointmentDate = parse(
                `${appointment.date} ${appointment.time}`,
                'yyyy-MM-dd HH:mm',
                new Date()
              );
              const isPast = isBefore(appointmentDate, new Date());

              return (
                <div
                  key={appointment.id}
                  className={`p-4 ${isPast ? 'bg-gray-50' : 'hover:bg-blue-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{appointment.clientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(appointmentDate, "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{appointment.barber}</span>
                      <div className="text-sm text-green-600 font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(appointment.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Novo Agendamento</h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barbeiro
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.barberId}
                  onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                  required
                >
                  <option value="">Selecione um barbeiro</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviços
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={(e) => {
                          const updatedServices = e.target.checked
                            ? [...formData.selectedServices, service.id]
                            : formData.selectedServices.filter(id => id !== service.id);
                          setFormData({ ...formData, selectedServices: updatedServices });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{service.name}</span>
                      <span className="text-green-600 ml-auto">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(service.price)}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.selectedServices.length > 0 && (
                  <div className="mt-2 text-right font-medium">
                    Total: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalPrice)}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={formData.date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  disabled={!formData.date || !formData.barberId}
                >
                  <option value="">Selecione um horário</option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {formData.date && formData.barberId && availableTimeSlots.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    Não há horários disponíveis nesta data
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;