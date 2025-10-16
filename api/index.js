const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chessRoutes = require('../routes/chess');
const errorHandler = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/chess', chessRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stockfish Chess API is running on Vercel',
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stockfish Chess API - Vercel Deployment',
    status: 'running',
    endpoints: {
      health: '/health',
      chess: '/api/chess',
      info: '/api/chess/info',
      bestmove: '/api/chess/bestmove (POST)',
      analyze: '/api/chess/analyze (POST)'
    },
    documentation: 'Use POST /api/chess/bestmove with FEN position'
  });
});

// Error handling
app.use(errorHandler);

// Export untuk Vercel serverless
module.exports = app;
