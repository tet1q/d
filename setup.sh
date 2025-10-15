#!/bin/bash

# Skrip ini akan mengunduh SOURCE CODE dan MENGKOMPILASI Stockfish.
# Ini adalah metode paling andal untuk mengatasi masalah unduhan.

echo "--- Memulai proses kompilasi Stockfish ---"

# Instal peralatan yang dibutuhkan untuk kompilasi
echo "1. Menginstal peralatan 'build-essential'..."
sudo apt-get update
sudo apt-get install -y build-essential

# Hapus folder engine lama untuk memastikan kebersihan
echo "2. Membersihkan direktori lama..."
cd /workspaces/legendary-scorn  # Pastikan kita ada di direktori utama
rm -rf engine

# Buat folder engine baru dan masuk ke dalamnya
echo "3. Membuat direktori baru..."
mkdir engine
cd engine

# Unduh file SOURCE CODE (karena ini yang selalu berhasil)
echo "4. Mengunduh Source Code Stockfish 17.1..."
curl -L -o stockfish_source.tar.gz https://github.com/official-stockfish/Stockfish/archive/refs/tags/sf_17.1.tar.gz

# Ekstrak source code
echo "5. Mengekstrak source code..."
tar -xzvf stockfish_source.tar.gz

# Masuk ke dalam folder 'src' dari source code
echo "6. Masuk ke direktori 'src'..."
cd Stockfish-sf_17.1/src

# Kompilasi program! Ini mungkin butuh waktu 1-2 menit.
echo "7. Mengkompilasi program Stockfish... (Harap tunggu)"
make -j build ARCH=x86-64-modern

# Pindahkan program 'stockfish' yang sudah jadi ke folder 'engine'
echo "8. Memindahkan program yang sudah jadi..."
mv stockfish ../../

# Kembali ke folder engine
cd ../../

# Bersihkan semua sisa file source code yang tidak perlu lagi
echo "9. Membersihkan file sisa..."
rm -rf Stockfish-sf_17.1 stockfish_source.tar.gz

# Beri izin eksekusi (meskipun seharusnya sudah ada)
chmod +x stockfish

echo "--- Kompilasi Stockfish Selesai! ---"
echo "Program 'stockfish' telah berhasil dibuat dan siap di dalam folder 'engine'."