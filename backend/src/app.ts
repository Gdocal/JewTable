import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error';
import { authenticate } from './middleware/auth';
import { AuthService } from './services/auth.service';
import { TableController } from './controllers/table.controller';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes
app.post(`${env.API_PREFIX}/auth/login`, async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
  }
});

// Table routes (protected)
app.get(`${env.API_PREFIX}/tables/employees/data`, authenticate, TableController.getData);
app.post(`${env.API_PREFIX}/tables/employees/rows`, authenticate, TableController.createRow);
app.put(`${env.API_PREFIX}/tables/employees/rows/:id`, authenticate, TableController.updateRow);
app.delete(`${env.API_PREFIX}/tables/employees/rows/:id`, authenticate, TableController.deleteRow);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📍 API: http://localhost:${env.PORT}${env.API_PREFIX}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
