import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './lib/db';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import leaveRoutes from './routes/leaves';
import mealRoutes from './routes/meals';
import complaintRoutes from './routes/complaints';
import attendanceRoutes from './routes/attendance';
import behaviourRoutes from './routes/behaviour';
import healthRoutes from './routes/health';
import notificationRoutes from './routes/notifications';
import { markMealAttendance } from './controllers/mealController';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.set('trust proxy', 1);
app.set('etag', false);
const PORT = process.env.PORT || 5000;

// Prevent HTTP 304 caching on all API routes
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// ─── Security middleware ───────────────────────────────────────────────────────
const corsOptions: cors.CorsOptions = {
  origin: true, // Dynamically reflect request origin to enable credentials across all dev/prod origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Helmet after CORS with non-restrictive cross-origin policies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
// Use 'combined' (Apache format) in production for Render log visibility
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/leaves', leaveRoutes);
app.use('/leaves', leaveRoutes);

app.use('/api/meals', mealRoutes);
app.use('/meals', mealRoutes);

app.post('/api/warden/meal-attendance', markMealAttendance);
app.post('/warden/meal-attendance', markMealAttendance);

app.use('/api/complaints', complaintRoutes);
app.use('/complaints', complaintRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);

app.use('/api/behaviour', behaviourRoutes);
app.use('/behaviour', behaviourRoutes);

app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server after DB connects ───────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  });
};

start();

export default app;
