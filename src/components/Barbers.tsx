import React, { useState } from 'react';
import { useBarbers } from '../contexts/BarberContext';
import { Scissors } from 'lucide-react';

function Barbers() {
  const { barbers, addBarber, removeBarber } = useBarbers();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    startTime: '09:00',
    endTime: '18:00',
    daysOff: [] as number[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBarber({
      ...formData,
      id: crypto.randomUUID()
    });
    setShowForm(false);
    setFormData({ name: '', phone: '', startTime: '09:00', endTime: '18:00', daysOff: [] });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Barbeiros</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Novo Barbeiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Scissors className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">{barber.name}</h2>
              </div>
              <button
                onClick={() => removeBarber(barber.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>
            <div className="text-gray-600">
              <p>Telefone: {barber.phone}</p>
              <p>Horário: {barber.startTime} - {barber.endTime}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Novo Barbeiro</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full border rounded-lg p-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-lg p-2"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Término
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-lg p-2"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Barbers;