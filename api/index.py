import chess
import chess.engine
import os
from flask import Flask, request, jsonify

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# --- Konfigurasi Path Engine ---
# Path ini akan berfungsi baik di Codespaces maupun Vercel
ENGINE_PATH = os.path.join(os.path.dirname(__file__), '..', 'engine', 'stockfish')

# --- Memberi Izin Eksekusi pada Binary Stockfish ---
# Ini sangat penting agar binary bisa dijalankan!
if os.path.exists(ENGINE_PATH) and not os.access(ENGINE_PATH, os.X_OK):
    os.chmod(ENGINE_PATH, 0o700)

# --- Blok untuk memuat engine dengan indentasi yang benar ---
engine = None
engine_error = "Engine path not set."
try:
    if os.path.exists(ENGINE_PATH):
        engine = chess.engine.SimpleEngine.popen_uci(ENGINE_PATH)
    else:
        engine_error = f"Engine binary not found at path: {ENGINE_PATH}"
except Exception as e:
    engine_error = str(e)

# --- Definisi Endpoint API ---

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Endpoint utama untuk mengecek status API."""
    if not engine:
        return jsonify({
            "status": "error",
            "message": "Stockfish engine gagal diinisialisasi.",
            "error_details": engine_error
        }), 500
    
    return jsonify({
        "status": "success",
        "message": "Stockfish API is running."
    })

@app.route('/get_best_move', methods=['POST'])
def get_best_move():
    """Endpoint untuk mendapatkan langkah terbaik dari posisi FEN."""
    if not engine:
        return jsonify({"error": "Stockfish engine is not available."}), 500
    
    data = request.json
    fen = data.get('fen')
    move_time = data.get('movetime', 2000) / 1000.0

    if not fen:
        return jsonify({"error": "FEN string is required."}), 400
    
    try:
        board = chess.Board(fen)
        result = engine.play(board, chess.engine.Limit(time=move_time))
        best_move = result.move
        return jsonify({
            "fen_before": fen,
            "best_move_uci": best_move.uci(),
            "best_move_san": board.san(best_move),
            "thinking_time_ms": move_time * 1000
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate', methods=['POST'])
def evaluate_position():
    """Endpoint untuk mendapatkan evaluasi skor dari posisi FEN."""
    if not engine:
        return jsonify({"error": "Stockfish engine is not available."}), 500
    
    data = request.json
    fen = data.get('fen')
    move_time = data.get('movetime', 1000) / 1000.0

    if not fen:
        return jsonify({"error": "FEN string is required."}), 400
    
    try:
        board = chess.Board(fen)
        info = engine.analyse(board, chess.engine.Limit(time=move_time))
        score = info["score"].relative
        return jsonify({
            "fen": fen,
            "evaluation": {
                "type": score.score_type(),
                "value": score.score(),
                "mate_in": score.mate()
            },
            "turn": "white" if board.turn == chess.WHITE else "black"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Blok ini HANYA untuk menjalankan server saat testing di Codespaces ---
# Vercel akan mengabaikan blok ini.
if __name__ == '__main__':
    if not engine:
        print(f"GAGAL MEMUAT ENGINE: {engine_error}")
    else:
        print("Menjalankan server Flask untuk testing lokal...")
        app.run(host='0.0.0.0', port=5000)