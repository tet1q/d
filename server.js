const express = require('express');
const fs = require('fs'); // Kita tambahkan modul 'fs' untuk memeriksa file
const path = require('path'); // dan modul 'path'

const app = express();
app.use(express.json());

app.post('/api/get-best-move', async (req, res) => {
    // --- KODE DEBUGGING DIMULAI ---
    console.log("--- REQUEST RECEIVED ---");
    console.log("Memulai eksekusi /api/get-best-move");

    try {
        // Coba cek apakah folder stockfish ada di node_modules
        const stockfishPath = path.dirname(require.resolve('stockfish/package.json'));
        console.log(`Path package stockfish ditemukan di: ${stockfishPath}`);

        // Coba daftar isi dari folder tersebut
        const files = fs.readdirSync(stockfishPath);
        console.log("Isi dari folder stockfish:", files);

    } catch (e) {
        console.error("DEBUG ERROR: Gagal menemukan path package stockfish atau membaca direktorinya.", e);
    }
    // --- KODE DEBUGGING SELESAI ---


    const { fen, depth, movetime } = req.body;
    if (!fen) {
        return res.status(400).json({
            success: false,
            error: 'FEN string is required in the request body.'
        });
    }

    const searchParam = movetime ? `movetime ${movetime}` : `depth ${depth || 15}`;
    let engine;

    try {
        console.log("Mencoba menjalankan: await import('stockfish')");
        const stockfishModule = await import('stockfish');
        const stockfish = stockfishModule.default;
        console.log("Berhasil meng-import stockfish.");

        engine = await stockfish();
        console.log("Berhasil menginisialisasi engine stockfish.");

        let bestMove = '';
        let lastInfo = '';

        const analysisPromise = new Promise((resolve, reject) => {
            engine.onmessage = (message) => {
                if (typeof message === 'string' && message.startsWith('bestmove')) {
                    const parts = message.split(' ');
                    bestMove = { move: parts[1], ponder: parts[3] || null };
                    resolve();
                } else if (typeof message === 'string' && message.startsWith('info')) {
                    lastInfo = message;
                }
            };
            setTimeout(() => reject(new Error('Engine analysis timed out.')), 10000);
        });

        await engine.uci();
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage(`go ${searchParam}`);

        await analysisPromise;

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        res.status(200).json({
            success: true, fen, search: searchParam,
            bestMove: bestMove.move, ponder: bestMove.ponder, info: lastInfo
        });

    } catch (error) {
        console.error("--- RUNTIME ERROR ---");
        console.error("Terjadi error saat eksekusi utama:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (engine) engine.postMessage('quit');
    }
});

app.get('/api', (req, res) => {
    res.status(200).send('Stockfish API is running. Use POST /api/get-best-move to get an analysis.');
});

module.exports = app;
