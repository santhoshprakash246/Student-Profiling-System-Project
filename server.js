require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const insightRoutes = require('./routes/insightRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/insights', insightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Student Academic Personal and Career Profiling System',
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found`
  });
});

// Default catch-all redirects to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start server after connecting to database
async function startServer() {
  try {
    console.log('================================================================');
    console.log(' Student Academic Personal and Career Profiling System (SPS)   ');
    console.log(' byteXL NIMBUS Environment Ready                               ');
    console.log('================================================================');
    
    await connectDB();

    // Check if database is empty; if so, auto-seed realistic sample data
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Seeding initial demo faculty and students...');
      const { seedData } = require('./seed');
      await seedData(true);
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Application running successfully at: http://localhost:${PORT}`);
      console.log(`[Server] Faculty Portal: http://localhost:${PORT}/faculty.html`);
      console.log(`[Server] Student Portal: http://localhost:${PORT}/student.html`);
    });

    // Handle termination gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('[FATAL] Failed to initialize server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
