 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const compression = require('compression');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sequelize } = require('./models');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes        = require('./routes/auth');
const dashboardRoutes   = require('./routes/dashboard');
// const bookingRoutes     = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const staffRoutes       = require('./routes/staff');
const serviceRoutes     = require('./routes/services');
const settingRoutes     = require('./routes/settings');
const siteContentRoutes = require('./routes/siteContent');
const bookingRoutes = require('./routes/bookings');
const app  = express();
// const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 3000;

// Trust proxy
app.set('trust proxy', 1);

// Security
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Security + HSTS + CSP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "checkout.razorpay.com", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "*"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));

// app.use(cors({
//   // origin: [
//   //   process.env.FRONTEND_URL || 'http://localhost:5173',
//   //   'http://localhost:3000',
//   //   'http://localhost:4173',
//   // ],
//   origin: [
//   process.env.FRONTEND_URL,
//   'http://localhost:5173',
// ],
//   credentials: true,
// }));
app.use(cors({
  origin: true,  
  credentials: true,
}));


// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
  },
});

app.use(limiter);
// Gzip compression — saves ~460ms render-blocking + reduces JS/CSS size
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
// app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
// app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')));
// Static uploads — 30 day cache for user images
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }
}));

// ✅ Swagger — API routes aadhi
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/site-content', siteContentRoutes);

// ✅ React frontend static files
// app.use(express.static(path.join(__dirname, 'public')));
// ✅ React frontend static files — aggressive caching for hashed assets
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',        // hashed JS/CSS files — 1 year cache (safe, they have hash in name)
  etag: true,
  setHeaders: (res, filePath) => {
    // index.html must never be cached (app entry point)
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    // Hashed assets (JS/CSS) — immutable 1 year
    else if (/\.(js|css)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Images in public/images
    else if (/\.(jpg|jpeg|png|webp|svg|gif|ico)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));


// ✅ React routing — /api routes exclude kele ahet
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handlers — sabhyat shevati
app.use(notFound);
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
       console.log(`📚 Swagger Docs: /api/docs`);
    });
  } catch (err) {
    console.error('❌ Server start failed:', err);
  }
};

startServer();