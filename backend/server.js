const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const enquiryRoutes = require('./routes/enquiries');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure WebSockets
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Inject socket io instance into request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Simple Healthcheck API
app.get('/', (req, res) => {
  res.json({ success: true, message: 'AuraBite Server API is running healthy.' });
});

// Socket.io Real-Time connection logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // User/Client joins role-specific rooms
  socket.on('join_room', (data) => {
    const { userId, role, restaurantId } = data;
    
    if (userId) {
      const userRoom = `customer_user_${userId}`;
      socket.join(userRoom);
      console.log(`Socket ${socket.id} joined customer room: ${userRoom}`);
    }

    if (role === 'seller' && restaurantId) {
      const sellerRoom = `seller_restaurant_${restaurantId}`;
      socket.join(sellerRoom);
      console.log(`Socket ${socket.id} joined seller restaurant room: ${sellerRoom}`);
    }

    if (role === 'admin') {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined global Admin room`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

module.exports = { app, server };
