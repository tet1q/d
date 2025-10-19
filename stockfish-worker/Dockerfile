# Gunakan base image Node.js
FROM node:18-slim

# Set working directory di dalam container
WORKDIR /app

# Copy file package.json untuk install dependencies
COPY package*.json ./
RUN npm install

# Copy semua file proyek ke dalam container
COPY . .

# Pastikan Stockfish bisa dieksekusi
RUN chmod +x ./stockfish

# Expose port yang digunakan
EXPOSE 10000

# Perintah untuk menjalankan server saat container dimulai
CMD [ "node", "server.js" ]