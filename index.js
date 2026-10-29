const express = require('express');
const cors = require('cors');
const path = require('path');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================================================================
// CORS sozlamalari
// Frontend yoki boshqa domenlardan (masalan, React, Vue, HTML frontend)
// bemalol so'rov yuborish uchun CORS to'liq sozlangan
// ==============================================================================
app.use(
  cors({
    origin: '*', // Har qanday domendan kelgan so'rovlarga ruxsat
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// So'rov tanasini (JSON body) o'qish uchun middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik fayllar (Frontend UI / API Documentation)
app.use(express.static(path.join(__dirname, 'public')));

// ==============================================================================
// Asosiy CRUD yo'llari (Routes)
// Vercel serverless va lokal uchun /api/books va /books ikkalasiga ham javob beradi
// ==============================================================================
app.use('/api/books', bookRoutes);
app.use('/books', bookRoutes);

// Salomatlik tekshiruvi (Health check)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Book CRUD API muvaffaqiyatli ishlamoqda!',
    timestamp: new Date().toISOString(),
  });
});

// Mavjud bo'lmagan marshrutlar uchun 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Kechirasiz, [${req.method}] ${req.originalUrl} manzili topilmadi!`,
  });
});

// Global xatoliklarni ushlovchi middleware
app.use((err, req, res, next) => {
  console.error('Server xatosi:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Ichki server xatoligi yuz berdi!',
    error: err.message,
  });
});

// ==============================================================================
// Serverni ishga tushirish
// Faqat fayl to'g'ridan-to'g'ri (node index.js) ishga tushirilganda listen qiladi
// Vercel serverless muhitida esa shunchaki modul sifatida eksport qilinadi
// ==============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server muvaffaqiyatli ishga tushdi!`);
    console.log(`🌐 Manzil: http://localhost:${PORT}`);
    console.log(`📚 Kitoblar API: http://localhost:${PORT}/api/books\n`);
  });
}

// Vercel serverless function uchun eksport
module.exports = app;
