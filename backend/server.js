import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB before starting the server
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB. Exiting. Error:', err.message);
    process.exit(1);
  }
})();

// Initialize express app
const app = express();

// Security: Helmet HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Environment-based CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply standard rate limiter to all API endpoints
app.use('/api', apiLimiter);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'O2 Herbal Care - Enterprise E-Commerce API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'Operational',
  });
});

// 404 error handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isProd = process.env.NODE_ENV === 'production';

  // Protect sensitive data from leaking in production
  let clientMessage = err.message || 'Internal server error';
  if (isProd) {
    if (statusCode === 500 || err.name === 'MongoServerError' || err.name === 'CastError') {
      clientMessage = 'An unexpected server error occurred. Please try again later.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(isProd ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   O2 HERBAL PRODUCTS - BACKEND API     ║
    ╠════════════════════════════════════════╣
    ║   ✓ Server running on port ${PORT}     ║
    ║   ✓ Environment: ${process.env.NODE_ENV || 'development'}     ║
    ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
