import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessageSquare, Settings, Users, Scissors } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, text: 'Dashboard' },
    { path: '/calendar', icon: Calendar, text: 'Agenda' },
    { path: '/appointments', icon: Calendar, text: 'Agendamentos' },
    { path: '/barbers', icon: Scissors, text: 'Barbeiros' },
    { path: '/clients', icon: Users, text: 'Clientes' },
    { path: '/services', icon: Scissors, text: 'Serviços' },
    { path: '/whatsapp', icon: MessageSquare, text: 'WhatsApp' },
  ];

  return (
    <div className="w-64 bg-white h-full shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">AgendAqui</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  );
}