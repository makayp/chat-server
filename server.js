import express from 'express';
import { Server } from 'socket.io';

const app = express();
const messages = [
  {
    id: 1,
    sender: 'Em',
    message: 'Hello',
    time: '2024-06-14T14:53:10.665Z',
  },
  {
    id: 2,
    sender: 'David',
    message: 'Hi',
    time: '2024-06-14T15:02:55.504Z',
  },
  {
    id: 3,
    sender: 'Emmanuel',
    message: 'How are you all doing today?',
    time: '2024-06-14T15:02:55.504Z',
  },
  {
    id: 4,
    sender: 'Em',
    message: 'Hi',
    time: '2024-06-14T15:02:55.504Z',
  },
  {
    id: 5,
    sender: 'David',
    message: 'Hi',
    time: '2024-06-14T15:02:55.504Z',
  },
  {
    id: 6,
    sender: 'Emmanuel',
    message:
      'I am doing great, thanks, how are you doing too? and how is the weather over there?',
    time: '2024-06-14T15:02:55.504Z',
  },
  {
    id: 7,
    sender: 'Em',
    message:
      'I am doing great, thanks, how are you doing too? and how is the weather over there?',
    time: '2024-06-14T15:02:55.504Z',
  },
];

const PORT = 1111;

const expressServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected');
  io.emit('welcome', socket.handshake.auth.user);
  socket.emit('messages', messages);

  setInterval(() => {
    io.emit('messages', messages);
  }, 60000);

  socket.on('message', (data) => {
    messages.push(data);
    io.emit('messages', messages);
  });

  socket.on('disconnect', () => {
    console.log(socket.handshake.auth.user);
    io.emit('leave-chat', socket.handshake.auth.user);
  });
});
