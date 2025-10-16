const app = require('./api/index.js');

const PORT = process.env.PORT || 3000;

// Hanya jalankan server jika tidak di Vercel
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
  });
}
