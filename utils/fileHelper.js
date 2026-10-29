const fs = require('fs/promises');
const path = require('path');

// Asosiy fayl yo'li (loyiha papkasidagi data/books.json)
const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'books.json');

// Vercel serverless muhitida faqat /tmp papkasiga yozish mumkin (read-only filesystem cheklovini yechish uchun)
const TMP_DATA_PATH = path.join('/tmp', 'books.json');

/**
 * Ma'lumotlar saqlanadigan to'g'ri fayl yo'lini aniqlash
 */
function getFilePath() {
  if (process.env.VERCEL) {
    return TMP_DATA_PATH;
  }
  return DEFAULT_DATA_PATH;
}

/**
 * Barcha kitoblarni JSON fayldan o'qish (FileReader vazifasi)
 * @returns {Promise<Array>} Kitoblar massivi
 */
async function readBooks() {
  const filePath = getFilePath();

  try {
    // Agar Vercel-da bo'lsak va /tmp/books.json hali yaratilmagan bo'lsa,
    // dastlabki data/books.json faylidan nusxa ko'chirib olamiz
    if (process.env.VERCEL) {
      try {
        await fs.access(TMP_DATA_PATH);
      } catch {
        const initialData = await fs.readFile(DEFAULT_DATA_PATH, 'utf-8');
        await fs.writeFile(TMP_DATA_PATH, initialData, 'utf-8');
      }
    }

    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Fayldan o\'qishda xatolik:', error.message);
    // Agar fayl topilmasa yoki bo'sh bo'lsa, bo'sh massiv qaytaramiz
    return [];
  }
}

/**
 * Kitoblarni JSON faylga yozish
 * @param {Array} books - Saqlanadigan kitoblar ro'yxati
 * @returns {Promise<boolean>}
 */
async function writeBooks(books) {
  const filePath = getFilePath();

  try {
    const jsonString = JSON.stringify(books, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
    return true;
  } catch (error) {
    console.error('Faylga yozishda xatolik:', error.message);
    throw new Error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
  }
}

module.exports = {
  readBooks,
  writeBooks,
};
