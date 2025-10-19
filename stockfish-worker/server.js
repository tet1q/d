const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// Render akan memberikan port melalui environment variable
const PORT = process.env.PORT || 10000;
const STOCKFISH_PATH = path.join(__dirname, 'stockfish');

app.post('/analyze', (req, res) => {
    // Ambil FEN dan depth dari request
        // Jika depth tidak diberikan, kita set ke 12 (angka aman untuk server lemah)
            const { fen, depth = 12 } = req.body;

                if (!fen) {
                        return res.status(400).json({ error: 'FEN string is required' });
                            }

                                const stockfish = spawn(STOCKFISH_PATH);
                                    let bestMove = '';
                                        let analysisOutput = '';

                                            // Dengar output dari Stockfish
                                                stockfish.stdout.on('data', (data) => {
                                                        const output = data.toString();
                                                                
                                                                        // Simpan baris yang berisi info evaluasi
                                                                                if (output.includes('score cp')) {
                                                                                            analysisOutput = output;
                                                                                                    }
                                                                                                            
                                                                                                                    // Jika menemukan baris bestmove, analisis selesai
                                                                                                                            if (output.startsWith('bestmove')) {
                                                                                                                                        bestMove = output.split(' ')[1];
                                                                                                                                                    stockfish.stdin.write('quit\n'); // Perintahkan Stockfish untuk berhenti
                                                                                                                                                            }
                                                                                                                                                                });

                                                                                                                                                                    // Saat proses Stockfish ditutup, kirim respons
                                                                                                                                                                        stockfish.on('close', () => {
                                                                                                                                                                                if (bestMove) {
                                                                                                                                                                                            const scoreMatch = analysisOutput.match(/score cp (-?\d+)/);
                                                                                                                                                                                                        const evaluation = scoreMatch ? parseInt(scoreMatch[1], 10) / 100.0 : null;

                                                                                                                                                                                                                    res.json({
                                                                                                                                                                                                                                    fen: fen,
                                                                                                                                                                                                                                                    bestmove: bestMove,
                                                                                                                                                                                                                                                                    evaluation: evaluation,
                                                                                                                                                                                                                                                                                    depth: depth
                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                    res.status(500).json({ error: 'Failed to get analysis from Stockfish' });
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                        stockfish.on('error', (err) => {
                                                                                                                                                                                                                                                                                                                                                console.error('Failed to start Stockfish process:', err);
                                                                                                                                                                                                                                                                                                                                                        res.status(500).json({ error: 'Internal server error with Stockfish process.' });
                                                                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                                                                                // Kirim perintah ke Stockfish
                                                                                                                                                                                                                                                                                                                                                                    console.log(`Analyzing FEN: ${fen} with depth ${depth}`);
                                                                                                                                                                                                                                                                                                                                                                        stockfish.stdin.write('setoption name Hash value 64\n'); // Batasi RAM ke 64MB
                                                                                                                                                                                                                                                                                                                                                                            stockfish.stdin.write(`position fen ${fen}\n`);
                                                                                                                                                                                                                                                                                                                                                                                stockfish.stdin.write(`go depth ${depth}\n`);
                                                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                                                app.listen(PORT, () => {
                                                                                                                                                                                                                                                                                                                                                                                    console.log(`Stockfish worker running on port ${PORT}`);
                                                                                                                                                                                                                                                                                                                                                                                    });