import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import gameRoutes from './routes/gameRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { AdminService } from './services/adminService.js';
import { WalletService } from './services/walletService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://diuwin.art:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'https://diuwin.art:5173', 'https://diuwin.art:5173'],
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Initialize DB defaults and start server
async function bootstrap() {
  try {
    await AdminService.getConfig();
    await WalletService.getWallet();
    logger.info('System configurations and wallet initialized successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on https://diuwin.art:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to bootstrap server:', err);
    process.exit(1);
  }
}

bootstrap();
