import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dashboardRoutes from './routes/dashboard.routes.js';
import exportRoutes from './routes/export.routes.js';
import lotRoutes from './routes/lot.routes.js';
import serialRoutes from './routes/serial.routes.js';

const app = express();

const normalizeOrigin = (origin) => origin.replace(/\/+$/, '');

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/serials', serialRoutes);
app.use('/api/export', exportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource id.' });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate record detected.',
      fields: err.keyValue
    });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error.'
  });
});

export default app;
