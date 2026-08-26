/**
 * ============================================================
 * 🚀 MAIN EXPRESS SERVER + SOCKET.IO SETUP
 * ============================================================
 *
 * Yeh main entry point hai. Yahan:
 * 1. Express server setup hota hai (CORS, JSON parsing, etc.)
 * 2. Sabhi API Routes register hote hain (/api/auth, /api/food, etc.)
 * 3. Socket.io initialize hota hai (live tracking ke liye)
 * 4. Automated Expiry Sweeper start hota hai
 * ============================================================
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

// ── Route Imports ────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import claimsRoutes from './routes/claims.js';
import esgRoutes from './routes/esg.js';

// ── Background Jobs ──────────────────────────────────────────
import { startExpirySweeper } from './expirySweeper.js';

// ── App & Server Setup ───────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/esg', esgRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ FoodRescue Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth (send-otp, verify-otp, me)',
      food: '/api/food (nearby, create, list)',
      claims: '/api/claims (reserve, verify-pickup-otp, verify-dropoff-otp)',
      esg: '/api/esg (my-records)',
    },
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
});

// ── Socket.io Setup (for Live Tracking — Step 4) ─────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [SOCKET] Client connected: ${socket.id}`);

  // Volunteer joins a mission room (e.g., "mission_cl123")
  socket.on('join_mission_room', (missionId) => {
    socket.join(`mission_${missionId}`);
    console.log(`📡 [SOCKET] Socket ${socket.id} joined room: mission_${missionId}`);
  });

  // Volunteer broadcasts their live GPS position
  socket.on('volunteer_location_update', ({ missionId, lat, lng, speed, heading }) => {
    socket.to(`mission_${missionId}`).emit('volunteer_position', {
      lat, lng, speed, heading, timestamp: new Date().toISOString(),
    });
  });

  // Mission status changed (OTP verified, delivery complete, etc.)
  socket.on('mission_status_change', ({ missionId, status }) => {
    io.to(`mission_${missionId}`).emit('status_update', { status, timestamp: new Date().toISOString() });
    console.log(`📢 [SOCKET] Mission ${missionId} status: ${status}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [SOCKET] Client disconnected: ${socket.id}`);
  });
});

// ── Start Automated Expiry Sweeper ───────────────────────────
startExpirySweeper();

// ── Start Server ─────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║      🍲  FoodRescue Backend Server Running  🍲    ║');
  console.log(`║      🌐  API: http://localhost:${PORT}              ║`);
  console.log(`║      🔌  Socket.io: ws://localhost:${PORT}          ║`);
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
});

export { io };

