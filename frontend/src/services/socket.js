import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const initiateSocketConnection = (user) => {
  if (socket) return socket;

  console.log('Initiating Socket.io connection...');
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to AuraBite WebSocket server:', socket.id);
    
    // Auto-join appropriate rooms based on logged-in user profile
    if (user) {
      socket.emit('join_room', {
        userId: user._id,
        role: user.role,
        restaurantId: user.restaurantId
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from AuraBite WebSocket server');
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting WebSocket...');
    socket.disconnect();
    socket = null;
  }
};
