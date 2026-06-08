require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes      = require('./routes/auth.routes');
const drugRoutes      = require('./routes/drugs.routes');
const herbRoutes      = require('./routes/herbs.routes');
const searchRoutes    = require('./routes/search.routes');
const alertRoutes     = require('./routes/alerts.routes');
const profileRoutes   = require('./routes/profile.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const adminRoutes     = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Body parsing
app.use(express.json({ limit: '10kb' }));

// ── Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Global rate limit: 200 requests / 15 min per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
}));

// ── Routes
app.use('/api/auth',      authRoutes);
app.use('/api/drugs',     drugRoutes);
app.use('/api/herbs',     herbRoutes);
app.use('/api/search',    searchRoutes);
app.use('/api/alerts',    alertRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin',     adminRoutes);

// ── Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SmartPharma API running on port ${PORT}`));

module.exports = app;
