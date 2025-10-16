function errorHandler(err, req, res, next) {
      console.error('❌ API Error:', err.message);
        
          // Stockfish related errors
            if (err.message.includes('Stockfish') || err.message.includes('stockfish')) {
                return res.status(500).json({
                      error: 'Chess engine error',
                            message: err.message,
                                  solution: 'Run "npm run setup" to download Stockfish',
                                        platform: process.platform,
                                              arch: process.arch
                                                  });
                                                    }
                                                      
                                                        // Timeout errors
                                                          if (err.message.includes('timeout')) {
                                                              return res.status(408).json({
                                                                    error: 'Analysis timeout',
                                                                          message: 'The analysis took too long to complete',
                                                                                suggestion: 'Try reducing the depth or movetime parameters'
                                                                                    });
                                                                                      }
                                                                                        
                                                                                          // General errors
                                                                                            res.status(500).json({
                                                                                                error: 'Internal server error',
                                                                                                    message: err.message,
                                                                                                        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
                                                                                                          });
                                                                                                          }

                                                                                                          module.exports = errorHandler;
