import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import WhatsAppQR from './components/WhatsAppQR';
import Appointments from './components/Appointments';
import Barbers from './components/Barbers';
import Clients from './components/Clients';
import Services from './components/Services';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { BarberProvider } from './contexts/BarberContext';
import { ClientProvider } from './contexts/ClientContext';
import { ServiceProvider } from './contexts/ServiceContext';

function App() {
  return (
    <ServiceProvider>
      <BarberProvider>
        <ClientProvider>
          <AppointmentProvider>
            <BrowserRouter>
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/barbers" element={<Barbers />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/whatsapp" element={<WhatsAppQR />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </AppointmentProvider>
        </ClientProvider>
      </BarberProvider>
    </ServiceProvider>
  );
}

export default App;