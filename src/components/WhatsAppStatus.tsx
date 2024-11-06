import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

function WhatsAppStatus() {
  const [status, setStatus] = useState('connecting');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    socket.on('qr', (url) => {
      setQrCode(url);
      setStatus('waiting_for_scan');
    });

    socket.on('whatsapp_ready', () => {
      setStatus('connected');
      setQrCode('');
    });

    return () => {
      socket.off('qr');
      socket.off('whatsapp_ready');
    };
  }, []);

  return (
    <div className="flex items-center">
      {status === 'waiting_for_scan' && qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Escaneie o QR Code no WhatsApp</h3>
            <img src={qrCode} alt="QR Code do WhatsApp" className="w-64 h-64" />
            <p className="mt-4 text-sm text-gray-600">Abra o WhatsApp no seu celular e escaneie o código para conectar</p>
          </div>
        </div>
      )}
      
      <div className={`flex items-center ${status === 'connected' ? 'text-green-600' : 'text-yellow-600'}`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${status === 'connected' ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
        {status === 'connected' ? 'WhatsApp Conectado' : 'Conectando WhatsApp...'}
      </div>
    </div>
  );
}

export default WhatsAppStatus;