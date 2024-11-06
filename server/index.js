import express from 'express';
import { Server } from 'socket.io';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import Database from 'better-sqlite3';
import { format, addMinutes, parseISO } from 'date-fns';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
});

const db = new Database('appointments.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    clientName TEXT,
    barber TEXT,
    date TEXT,
    time TEXT,
    phone TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS barbers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    startTime TEXT,
    endTime TEXT,
    daysOff TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT
  );
`);

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
    if (!err) {
      io.emit('qr', url);
    }
  });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  io.emit('whatsapp_ready');
});

client.initialize();

// Socket.IO event handlers
io.on('connection', (socket) => {
  // Appointments
  socket.on('get_appointments', () => {
    try {
      const appointments = db.prepare('SELECT * FROM appointments').all();
      socket.emit('appointments', appointments);
    } catch (error) {
      socket.emit('error', 'Error fetching appointments');
    }
  });

  socket.on('create_appointment', (appointment) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO appointments (id, clientName, barber, date, time, phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        appointment.id,
        appointment.clientName,
        appointment.barber,
        appointment.date,
        appointment.time,
        appointment.phone,
        'scheduled'
      );

      // Schedule reminder
      const appointmentTime = parseISO(`${appointment.date}T${appointment.time}`);
      const reminderTime = addMinutes(appointmentTime, -30);
      
      setTimeout(() => {
        client.sendMessage(
          appointment.phone + '@c.us',
          `Lembrete: Seu horário na barbearia é em 30 minutos!`
        );
      }, reminderTime.getTime() - Date.now());

      io.emit('appointment_created', appointment);
    } catch (error) {
      socket.emit('error', 'Error creating appointment');
    }
  });

  // Barbers
  socket.on('get_barbers', () => {
    try {
      const barbers = db.prepare('SELECT * FROM barbers').all();
      socket.emit('barbers', barbers);
    } catch (error) {
      socket.emit('error', 'Error fetching barbers');
    }
  });

  socket.on('add_barber', (barber) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO barbers (id, name, phone, startTime, endTime, daysOff)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        barber.id,
        barber.name,
        barber.phone,
        barber.startTime,
        barber.endTime,
        JSON.stringify(barber.daysOff)
      );

      io.emit('barber_added', barber);
    } catch (error) {
      socket.emit('error', 'Error adding barber');
    }
  });

  socket.on('remove_barber', (id) => {
    try {
      db.prepare('DELETE FROM barbers WHERE id = ?').run(id);
      io.emit('barber_removed', id);
    } catch (error) {
      socket.emit('error', 'Error removing barber');
    }
  });

  // Clients
  socket.on('get_clients', () => {
    try {
      const clients = db.prepare('SELECT * FROM clients').all();
      socket.emit('clients', clients);
    } catch (error) {
      socket.emit('error', 'Error fetching clients');
    }
  });

  socket.on('add_client', (client) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO clients (id, name, phone, email)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(
        client.id,
        client.name,
        client.phone,
        client.email
      );

      io.emit('client_added', client);
    } catch (error) {
      socket.emit('error', 'Error adding client');
    }
  });

  socket.on('remove_client', (id) => {
    try {
      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      io.emit('client_removed', id);
    } catch (error) {
      socket.emit('error', 'Error removing client');
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});