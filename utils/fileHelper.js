const fs = require('fs/promises');
const path = require('path');

// 3 ta standart boshlang'ich demo kitob
const DEFAULT_BOOKS = [
  {
    id: "1",
    name: "O'tkan kunlar",
    author: "Abdulla Qodiriy",
    description: "O'zbek adabiyotidagi birinchi roman. Otabek va Kumushbibi muhabbati hamda o'sha davrdagi ijtimoiy hayot haqida hikoya qiladi."
  },
  {
    id: "2",
    name: "Alkimyogar",
    author: "Paulo Koelo",
    description: "O'z orzusi va taqdiri ortidan piramidalar tomon safarga chiqqan andalusiyalik cho'pon yigit Santyago haqidagi falsafiy asar."
  },
  {
    id: "3",
    name: "Atom odatlari",
    author: "Jeyms Klir",
    description: "Kichik o'zgarishlar orqali hayotda ulkan natijalarga erishish va yaxshi odatlarni shakllantirish bo'yicha amaliy qo'llanma."
  }
];

// Vercel serverless va lokal muhitlar uchun fayl yo'llari
const DEFAULT_DATA_PATH = path.join(process.cwd(), 'data', 'books.json');
const TMP_DATA_PATH = path.join('/tmp', 'books.json');

// Vercelda xotirada saqlash uchun kesh (in-memory fallback)
let inMemoryBooks = [...DEFAULT_BOOKS];

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

  // 1. Agar Vercel muhitida bo'lsak va /tmp/books.json hali yaratilmagan bo'lsa:
  if (process.env.VERCEL) {
    try {
      await fs.access(TMP_DATA_PATH);
    } catch {
      try {
        // Avval lokal fayldan o'qishga urinib ko'ramiz
        const initial = await fs.readFile(DEFAULT_DATA_PATH, 'utf-8');
        await fs.writeFile(TMP_DATA_PATH, initial, 'utf-8');
      } catch {
        // Agar Vercel bundle-da data/books.json bo'lmasa, DEFAULT_BOOKS ni yozamiz
        await fs.writeFile(TMP_DATA_PATH, JSON.stringify(DEFAULT_BOOKS, null, 2), 'utf-8');
      }
    }
  }

  // 2. Fayldan o'qish
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data || '[]');
    inMemoryBooks = parsed;
    return parsed;
  } catch (error) {
    console.warn('Fayldan o\'qishda xatolik, xotiradagi ma\'lumotlar ishlatiladi:', error.message);
    return inMemoryBooks;
  }
}

/**
 * Kitoblarni JSON faylga yozish
 * @param {Array} books - Saqlanadigan kitoblar ro'yxati
 * @returns {Promise<boolean>}
 */
async function writeBooks(books) {
  inMemoryBooks = books;
  const filePath = getFilePath();

  try {
    const jsonString = JSON.stringify(books, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
    return true;
  } catch (error) {
    console.warn('Faylga yozishda xatolik, lekin xotiraga saqlandi:', error.message);
    // Vercel serverless-da xotirada baribir saqlanadi
    return true;
  }
}

module.exports = {
  readBooks,
  writeBooks,
  DEFAULT_BOOKS,
};
