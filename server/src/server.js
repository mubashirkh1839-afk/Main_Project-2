import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import claimsRoutes from './routes/claims.js';
import esgRoutes from './routes/esg.js';
import { startExpirySweeper } from './expirySweeper.js';
import { connectDB } from './db.js';

// Global error protection
process.on('uncaughtException', (err) => {
  console.warn('⚠️ Handled uncaught exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ Handled unhandled rejection:', reason?.message || reason);
});

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/esg', esgRoutes);

app.get('/', (req, res) => {
  res.json({
    status: '✅ FoodRescue Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_mission_room', (missionId) => {
    socket.join(`mission_${missionId}`);
  });

  socket.on('volunteer_location_update', ({ missionId, lat, lng, speed, heading }) => {
    socket.to(`mission_${missionId}`).emit('volunteer_position', {
      lat, lng, speed, heading, timestamp: new Date().toISOString(),
    });
  });

  socket.on('mission_status_change', ({ missionId, status }) => {
    io.to(`mission_${missionId}`).emit('status_update', { status, timestamp: new Date().toISOString() });
  });
});

const startServer = async () => {
  await connectDB();
  startExpirySweeper();

  httpServer.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║      🍲  FoodRescue Backend Server Running  🍲    ║');
    console.log(`║      🌐  API: http://localhost:${PORT}              ║`);
    console.log(`║      🔌  Socket.io: ws://localhost:${PORT}          ║`);
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');
  });
};

startServer().catch((err) => {
  console.error('Server error:', err.message);
});

export { io };
