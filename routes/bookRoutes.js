const express = require('express');
const router = express.Router();
const { readBooks, writeBooks } = require('../utils/fileHelper');

// ==============================================================================
// 1. GET - Barcha kitoblarni olish
// URL: GET /api/books
// ==============================================================================
router.get('/', async (req, res) => {
  try {
    const books = await readBooks();
    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi',
      error: error.message,
    });
  }
});

// ==============================================================================
// 2. GET - Bitta kitobni ID bo'yicha olish
// URL: GET /api/books/:id
// ==============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const books = await readBooks();
    const book = books.find((b) => String(b.id) === String(id));

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `ID raqami ${id} bo'lgan kitob topilmadi!`,
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi',
      error: error.message,
    });
  }
});

// ==============================================================================
// 3. POST - Yangi kitob qo'shish
// URL: POST /api/books
// Body: { name, author (yoki after), description }
// Status: 201 Created
// ==============================================================================
router.post('/', async (req, res) => {
  try {
    const { name, author, after, description } = req.body;
    const bookAuthor = author || after;

    // Validatsiya: name, author va description talab qilinadi
    if (!name || !bookAuthor) {
      return res.status(400).json({
        success: false,
        message: 'Kitob nomi (name) va muallifi (author/after) kiritilishi shart!',
      });
    }

    const books = await readBooks();

    // Yangi unikal ID yaratish
    const newId = books.length > 0
      ? String(Math.max(...books.map((b) => Number(b.id) || 0)) + 1)
      : '1';

    const newBook = {
      id: newId,
      name: name.trim(),
      author: bookAuthor.trim(),
      description: description ? description.trim() : 'Tavsif berilmagan.',
    };

    books.push(newBook);
    await writeBooks(books);

    res.status(201).json({
      success: true,
      message: 'Yangi kitob muvaffaqiyatli qo\'shildi!',
      data: newBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitobni qo\'shishda xatolik yuz berdi',
      error: error.message,
    });
  }
});

// ==============================================================================
// 4. PUT - Kitobni to'liq yangilash (O'rnini to'liq almashtirish)
// URL: PUT /api/books/:id
// Body: { name, author (yoki after), description }
// Dars uchun eslatma: PUT so'rovida barcha maydonlar to'liq yuborilishi shart!
// ==============================================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, author, after, description } = req.body;
    const bookAuthor = author || after;

    // PUT to'liq yangilash bo'lgani sababli, barcha maydonlarni tekshiramiz
    if (!name || !bookAuthor || !description) {
      return res.status(400).json({
        success: false,
        message: 'PUT so\'rovi to\'liq yangilash uchun ishlatiladi. name, author va description maydonlarining barchasi yuborilishi shart! (Qisman yangilash uchun PATCH ishlating).',
      });
    }

    const books = await readBooks();
    const index = books.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `ID raqami ${id} bo'lgan kitob topilmadi!`,
      });
    }

    // To'liq yangi obyekt yaratiladi (id saqlanib qoladi)
    const updatedBook = {
      id: String(id),
      name: name.trim(),
      author: bookAuthor.trim(),
      description: description.trim(),
    };

    books[index] = updatedBook;
    await writeBooks(books);

    res.status(200).json({
      success: true,
      message: `ID ${id} bo'lgan kitob to'liq yangilandi (PUT)!`,
      data: updatedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitobni yangilashda xatolik yuz berdi',
      error: error.message,
    });
  }
});

// ==============================================================================
// 5. PATCH - Kitobni qisman yangilash
// URL: PATCH /api/books/:id
// Body: Faqat o'zgartirmoqchi bo'lgan maydonlar (masalan: faqat { name: "Yangi nom" })
// Dars uchun eslatma: PATCH da faqat yuborilgan maydonlargina o'zgaradi!
// ==============================================================================
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, author, after, description } = req.body;
    const bookAuthor = author || after;

    if (!name && !bookAuthor && description === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Kamida bitta yangilanadigan maydon (name, author yoki description) yuborilishi kerak!',
      });
    }

    const books = await readBooks();
    const index = books.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `ID raqami ${id} bo'lgan kitob topilmadi!`,
      });
    }

    // Faqat kelgan maydonlarni yangilash
    const currentBook = books[index];
    const patchedBook = {
      ...currentBook,
      ...(name !== undefined && { name: name.trim() }),
      ...(bookAuthor !== undefined && { author: bookAuthor.trim() }),
      ...(description !== undefined && { description: description.trim() }),
    };

    books[index] = patchedBook;
    await writeBooks(books);

    res.status(200).json({
      success: true,
      message: `ID ${id} bo'lgan kitob qisman yangilandi (PATCH)!`,
      data: patchedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitobni qisman yangilashda xatolik yuz berdi',
      error: error.message,
    });
  }
});

// ==============================================================================
// 6. DELETE - Kitobni o'chirish
// URL: DELETE /api/books/:id
// Status: 200 OK (yoki 204 No Content)
// ==============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const books = await readBooks();
    const index = books.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `ID raqami ${id} bo'lgan kitob topilmadi!`,
      });
    }

    // O'chirilayotgan kitobni saqlab olamiz (javobda ko'rsatish uchun)
    const [deletedBook] = books.splice(index, 1);
    await writeBooks(books);

    res.status(200).json({
      success: true,
      message: `ID ${id} bo'lgan "${deletedBook.name}" kitobi muvaffaqiyatli o'chirildi!`,
      data: deletedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitobni o\'chirishda xatolik yuz berdi',
      error: error.message,
    });
  }
});

module.exports = router;
