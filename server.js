import express from 'express';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';

configDotenv();
const app = express();
let messages = [
  {
    id: 1,
    sender: 'Emmanuel',
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

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Server is live!');
});

const expressServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: [
      'https://chat-app-mkp.netlify.app',
      'https://demochat.emmanuelp.dev',
      'http://localhost:5173',
    ],
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

  io.emit('welcome', messages);
}

setInterval(() => {
  clearOldMessages();
}, 60 * 60 * 1000);
