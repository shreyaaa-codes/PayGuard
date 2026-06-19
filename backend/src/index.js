// Simple Express backend for PayGuard
// - Job endpoints
// - AI review endpoint (mock if CLAUDE_API_KEY is missing)
// - Integrates with on-chain contract for verifier actions

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const routes = require('./routes');
const contractService = require('./services/contractService');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
let server = null;

// Global error handlers for visibility
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally exit process after logging
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

async function start() {
  // Connect to MongoDB first
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payguard';
  try {
    await db.connect(mongoUri);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  // Health endpoint for quick readiness checks
  app.get('/api/health', (req, res) => {
    const dbState = db.getState(); // 0 = disconnected, 1 = connected
    const healthy = {
      db: dbState === 1,
      dbState,
      contractReady: contractService && typeof contractService.canAct === 'function' ? contractService.canAct() : false,
      env: process.env.NODE_ENV || 'development'
    };
    res.json(healthy);
  });

  // Mount API routes only after DB connected
  app.use('/api', routes);

  server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  if (server) {
    server.close(() => console.log('HTTP server closed'));
  }
  try {
    await db.close();
  } catch (err) {
    console.error('Error during DB close', err);
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('Failed to start backend', err);
  process.exit(1);
});
