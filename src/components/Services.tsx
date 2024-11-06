import React, { useState } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { Scissors, Edit2, Trash2 } from 'lucide-react';

function Services() {
  const { services, addService, updateService, removeService } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService({
        id: editingService,
        ...formData
      });
    } else {
      addService({
        id: crypto.randomUUID(),
        ...formData
      });
    }
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: '', price: 0, duration: 30 });
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration
    });
    setEditingService(service.id);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <button
          onClick={() => {
            setFormData({ name: '', price: 0, duration: 30 });
            setEditingService(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Scissors className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">{service.name}</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => removeService(service.id)}
                  className="text-gray-600 hover:text-red-600"
                  disabled={service.id <= '6'} // Previne edição dos serviços padrão
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="text-gray-600">
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(service.price)}
              </p>
              <p>Duração: {service.duration} minutos</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço
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
                  Preço (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg p-2"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora e 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingService ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;