import express from 'express';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';

const app = express();

configDotenv();

let messages = [];

const PORT = 4000;

app.get('/', (req, res) => {
  res.send(`Server is live! ${new Date().toLocaleString('en')}`);
});

const expressServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: ['https://demochat.emmanuelp.dev', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`${socket.handshake.auth.currentUser} connected`);
  socket.join('public chat');

  socket.broadcast
    .to('public chat')
    .emit('join', socket.handshake.auth.currentUser);
  socket.emit('welcome', messages);

  socket.on('typing', (user) => {
    socket.broadcast.to('public chat').emit('typing', user);
  });

  socket.on('message', (message) => {
    messages.push(message);
    socket.broadcast.to('public chat').emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(socket.handshake.auth.currentUser);
    socket.broadcast.emit('leave-chat', socket.handshake.auth.currentUser);
  });
});

// Function to delete messages older than 1 hour
function clearOldMessages() {
  const ONE_HOUR = 60 * 60 * 1000;
  const currentTime = new Date().getTime();

  messages = messages.filter((message) => {
    const messageTime = new Date(message.time).getTime();
    return currentTime - messageTime < ONE_HOUR;
  });

  io.to('public chat').emit('clear messages', messages);
}

setInterval(() => {
  clearOldMessages();
}, 60 * 60 * 1000);
