import { Chess } from 'chess.js';
import stockfish from 'stockfish';

// Vercel akan otomatis menangani fungsi ini sebagai endpoint API
export default async function handler(req, res) {
  // 1. Pastikan request adalah metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Ambil FEN dan depth dari body request.
  // Depth default 15 (cukup untuk analisis cepat). Turunkan jika sering timeout.
  const { fen, depth = 15 } = req.body;

  if (!fen) {
    return res.status(400).json({ error: 'FEN string is required' });
  }

  // 2. Validasi FEN menggunakan chess.js
  try {
    new Chess(fen);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid FEN string.' });
  }

  // 3. Jalankan analisis menggunakan paket stockfish
  let engine;
  try {
    // Inisialisasi engine. Paket ini mengembalikan sebuah Promise.
    engine = await stockfish(); 
    
    let bestMove = '';
    let evaluation = null;

    // Buat listener untuk "mendengarkan" output dari engine
    engine.onmessage = function (line) {
      // Log untuk debugging di Vercel
      console.log("Stockfish:", line);

      // Ambil info evaluasi (score)
      if (line.includes('score cp')) {
          const scoreMatch = line.match(/score cp (-?\d+)/);
          if (scoreMatch) {
              evaluation = parseInt(scoreMatch[1], 10) / 100.0;
          }
      }
      
      // Jika menemukan baris 'bestmove', analisis selesai
      if (line.startsWith('bestmove')) {
        bestMove = line.split(' ')[1];
      }
    };
    
    // Kirim perintah ke engine. Perintah 'go' akan berjalan sampai 'bestmove' ditemukan.
    await engine.uciCmd(`position fen ${fen}`);
    await engine.uciCmd(`go depth ${depth}`);

    // Beri sedikit waktu agar pesan 'bestmove' terakhir sempat diproses
    await new Promise(resolve => setTimeout(resolve, 100));

    if (bestMove) {
      res.status(200).json({
        fen: fen,
        bestmove: bestMove,
        evaluation: evaluation,
        depth: depth
      });
    } else {
      throw new Error("Analysis failed to produce a best move within the given constraints.");
    }

  } catch (error) {
    console.error('Stockfish analysis error:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze the position.',
      details: error.message
    });
  } finally {
    // Pastikan untuk selalu mematikan engine untuk membersihkan proses
    if (engine) {
      await engine.quit();
    }
  }
}
