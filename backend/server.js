 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

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
const PORT = process.env.PORT || 5000;

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
// app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')));

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
app.use(express.static(path.join(__dirname, 'public')));

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