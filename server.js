const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chessRoutes = require('./routes/chess');
const errorHandler = require('./middleware/errorHandler');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/chess', chessRoutes);

// Health check dengan info stockfish
app.get('/health', (req, res) => {
  const stockfishPath = path.join(__dirname, 'stockfish', 'stockfish-ubuntu');
    const stockfishExists = fs.existsSync(stockfishPath);
      
        res.json({ 
            status: 'OK', 
                message: 'Stockfish Chess API is running',
                    platform: process.platform,
                        arch: process.arch,
                            stockfish: stockfishExists ? 'installed' : 'missing',
                                solution: stockfishExists ? null : 'Run: npm run setup'
                                  });
                                  });

                                  // Setup endpoint untuk memudahkan
                                  app.get('/setup-info', (req, res) => {
                                    res.json({
                                        message: 'To setup Stockfish, run one of these commands:',
                                            commands: [
                                                  'npm run setup (recommended)',
                                                        'npm run setup-simple (alternative)'
                                                            ],
                                                                manual: {
                                                                      description: 'Or download manually from:',
                                                                            url: 'https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar',
                                                                                  steps: [
                                                                                          '1. Download the tar file',
                                                                                                  '2. Extract to stockfish/ directory',
                                                                                                          '3. Rename to stockfish-ubuntu',
                                                                                                                  '4. Make executable: chmod +x stockfish/stockfish-ubuntu'
                                                                                                                        ]
                                                                                                                            }
                                                                                                                              });
                                                                                                                              });

                                                                                                                              // Root endpoint
                                                                                                                              app.get('/', (req, res) => {
                                                                                                                                res.json({
                                                                                                                                    message: 'Stockfish Chess API',
                                                                                                                                        status: 'running',
                                                                                                                                            endpoints: {
                                                                                                                                                  health: '/health',
                                                                                                                                                        setup: '/setup-info',
                                                                                                                                                              chess: '/api/chess',
                                                                                                                                                                    info: '/api/chess/info',
                                                                                                                                                                          bestmove: '/api/chess/bestmove (POST)',
                                                                                                                                                                                analyze: '/api/chess/analyze (POST)'
                                                                                                                                                                                    }
                                                                                                                                                                                      });
                                                                                                                                                                                      });

                                                                                                                                                                                      // Error handling
                                                                                                                                                                                      app.use(errorHandler);

                                                                                                                                                                                      app.listen(PORT, '0.0.0.0', () => {
                                                                                                                                                                                        console.log(`🚀 Stockfish Chess API running on port ${PORT}`);
                                                                                                                                                                                          console.log(`📍 Local: http://localhost:${PORT}`);
                                                                                                                                                                                            console.log(`🌐 Health: http://localhost:${PORT}/health`);
                                                                                                                                                                                              console.log(`⚙️  Setup: http://localhost:${PORT}/setup-info`);
                                                                                                                                                                                              });