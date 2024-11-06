import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

function WhatsAppQR() {
  const [qrCode, setQrCode] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    socket.on('qr', (url: string) => {
      setQrCode(url);
    });

    socket.on('whatsapp_ready', () => {
      setIsReady(true);
    });

    return () => {
      socket.off('qr');
      socket.off('whatsapp_ready');
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Conexão WhatsApp</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {isReady ? (
          <div className="text-center">
            <div className="text-green-500 text-xl mb-4">
              WhatsApp conectado com sucesso!
            </div>
            <p className="text-gray-600">
              O sistema está pronto para receber e enviar mensagens.
            </p>
          </div>
        ) : qrCode ? (
          <div className="text-center">
            <p className="mb-4">Escaneie o código QR com seu WhatsApp:</p>
            <img
              src={qrCode}
              alt="WhatsApp QR Code"
              className="mx-auto max-w-xs"
            />
          </div>
        ) : (
          <div className="text-center">
            <p>Gerando código QR...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatsAppQR;