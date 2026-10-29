# 📚 Kitoblar CRUD API (Express.js & JSON File)

O'quvchilarga **HTTP so'rov turlari (GET, POST, PUT, PATCH, DELETE)**, **FileReader (`fs/promises`)**, **CORS** va **Vercel Deployment** mavzularini amalda o'rgatish uchun yaratilgan to'liq CRUD REST API loyihasi.

Ushbu loyihada **hech qanday tashqi ma'lumotlar bazasi (MongoDB, PostgreSQL va h.k.) ishlatilmagan**. Barcha ma'lumotlar to'g'ridan-to'g'ri `data/books.json` faylida saqlanadi.

---

## 🎯 Loyiha Xususiyatlari

- ✅ **Barcha HTTP metodlari qo'llab-quvvatlanadi**: GET, POST, PUT, PATCH, DELETE.
- ✅ **Database yo'q**: Ma'lumotlar toza Node.js `fs/promises` yordamida JSON faylda saqlanadi.
- ✅ **CORS to'liq sozlangan**: Frontend (React, Vue, oddiy HTML/JS) bemalol so'rov yuborishi mumkin.
- ✅ **Vercel Serverless Ready**: Vercel-da `read-only` fayl tizimi cheklovi `/tmp` papkasi orqali hal qilingan.
- ✅ **3 ta tayyor Demo data**: O'quvchilar darhol sinab ko'rishlari mumkin.
- ✅ **Interaktiv UI & Jonli Tester**: Loyihani brauzerda ochganda darslik va jonli tester interfeysi mavjud.

---

## 📂 Loyiha Strukturasi

```text
bookCrud/
├── data/
│   └── books.json             # Ma'lumotlar saqlanadigan JSON fayl (3 ta demo data)
├── routes/
│   └── bookRoutes.js          # CRUD marshrutlari (GET, POST, PUT, PATCH, DELETE)
├── utils/
│   └── fileHelper.js          # fs/promises orqali o'qish va yozish funksiyalari
├── public/
│   └── index.html             # O'quvchilar uchun interaktiv UI va API tester
├── index.js                   # Asosiy Express server fayli va CORS middleware
├── vercel.json                # Vercel serverless sozlamasi
├── package.json               # Loyiha sozlamalari va paketlar
└── README.md                  # Dars o'tish uchun to'liq qo'llanma
```

---

## 📦 Demo Ma'lumotlar Strukturasi

Har bir kitob obyekti quyidagi maydonlardan iborat:
```json
{
  "id": "1",
  "name": "O'tkan kunlar",
  "author": "Abdulla Qodiriy",
  "description": "O'zbek adabiyotidagi birinchi roman. Otabek va Kumushbibi muhabbati hamda o'sha davrdagi ijtimoiy hayot haqida hikoya qiladi."
}
```
*(Eslatma: so'rovlarda `author` yoki `after` kelsa ham qabul qilinadi).*

---

## 🎓 O'quvchilar Uchun Darslik: HTTP So'rov Turlari (Methods)

REST API arxitekturasida mijoz (Frontend / Postman) serverga nima qilmoqchi ekanligini HTTP metodlari orqali bildiradi:

| Metod | Nomi | Vazifasi | Status Kodi | Body kerakmi? |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | Olish | Ma'lumotlarni serverdan o'qib olish | `200 OK` | ❌ Yo'q |
| **POST** | Yaratish | Yangi ma'lumot (kitob) qo'shish | `201 Created` | ✅ Ha (JSON) |
| **PUT** | To'liq yangilash | Mavjud kitobni boshidan to'liq almashtirish | `200 OK` | ✅ Ha (Barcha maydonlar) |
| **PATCH**| Qisman yangilash | Faqat ko'rsatilgan 1-2 ta maydonni o'zgartirish | `200 OK` | ✅ Ha (Faqat o'zgargan maydon) |
| **DELETE**| O'chirish | Ko'rsatilgan ID dagi kitobni o'chirish | `200 OK` | ❌ Yo'q |

---

### 🔥 Muhim Mavzu: PUT va PATCH Farqi Nima?

O'quvchilar eng ko'p chalkashtiradigan mavzu:
- **`PUT` (To'liq almashtirish)**: Kitobning barcha maydonlarini yangidan yuborishingiz kerak (`name`, `author`, `description`). Agar birorta maydon qolib ketsa, server `400 Bad Request` xatolik qaytaradi.
- **`PATCH` (Qisman yangilash)**: Faqat o'zgartirmoqchi bo'lgan ma'lumotni yuborasiz. Masalan, faqat nomini o'zgartirmoqchi bo'lsangiz: `{"name": "Yangi nom"}` yuborish kifoya. Qolgan maydonlar o'z holicha saqlanib qoladi!

---

## 🚀 API Endpointlar va So'rov Namunalari

Baza URL (lokalda): `http://localhost:5000`

### 1. Barcha kitoblarni olish
- **Metod**: `GET`
- **URL**: `/api/books`
- **Javob**:
```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

### 2. Bitta kitobni ID bo'yicha olish
- **Metod**: `GET`
- **URL**: `/api/books/1`
- **Javob**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "O'tkan kunlar",
    "author": "Abdulla Qodiriy",
    "description": "..."
  }
}
```

---

### 3. Yangi kitob qo'shish
- **Metod**: `POST`
- **URL**: `/api/books`
- **Headers**: `Content-Type: application/json`
- **Body (JSON)**:
```json
{
  "name": "Yulduzli tunlar",
  "author": "Pirimqul Qodirov",
  "description": "Bobur Mirzo hayoti va kurashlari haqidagi tarixiy roman."
}
```
- **Javob (Status: 201 Created)**:
```json
{
  "success": true,
  "message": "Yangi kitob muvaffaqiyatli qo'shildi!",
  "data": {
    "id": "4",
    "name": "Yulduzli tunlar",
    "author": "Pirimqul Qodirov",
    "description": "Bobur Mirzo hayoti va kurashlari haqidagi tarixiy roman."
  }
}
```

---

### 4. Kitobni to'liq yangilash (PUT)
- **Metod**: `PUT`
- **URL**: `/api/books/1`
- **Headers**: `Content-Type: application/json`
- **Body (JSON - Barcha maydonlar shart)**:
```json
{
  "name": "O'tkan kunlar (Yangi nashr)",
  "author": "Abdulla Qodiriy",
  "description": "Tahrirlangan va to'ldirilgan maxsus nashr."
}
```

---

### 5. Kitobni qisman yangilash (PATCH)
- **Metod**: `PATCH`
- **URL**: `/api/books/1`
- **Headers**: `Content-Type: application/json`
- **Body (JSON - Faqat o'zgaradigan maydon)**:
```json
{
  "name": "O'tkan kunlar (Lotin alifbosida)"
}
```

---

### 6. Kitobni o'chirish (DELETE)
- **Metod**: `DELETE`
- **URL**: `/api/books/1`
- **Javob (Status: 200 OK)**:
```json
{
  "success": true,
  "message": "ID 1 bo'lgan \"O'tkan kunlar\" kitobi muvaffaqiyatli o'chirildi!",
  "data": { ... }
}
```

---

## 💻 Loyihani Lokal Ishga Tushirish

1. Ushbu papkaga terminal orqali kiring:
```bash
cd "c:\Users\aabdu\OneDrive\Ishchi stol\bookCrud"
```

2. Paketlarni o'rnating:
```bash
npm install
```

3. Serverni ishga tushiring:
```bash
npm start
# yoki avtomatik qayta yuklanadigan rejimda:
npm run dev
```

4. Brauzerda oching:
- Interaktiv UI: [http://localhost:5000](http://localhost:5000)
- API endpoint: [http://localhost:5000/api/books](http://localhost:5000/api/books)

---

## ☁️ Vercel-ga Joylashtirish (Deployment Guide)

Loyiha Vercel Serverless Functions bilan 100% moslashtirilgan. O'quvchilar 2 xil usulda Vercelga qo'yishlari mumkin:

### 1-usul: GitHub orqali (Eng qulay va tavsiya etiladi)
1. GitHub-da yangi repository oching (masalan: `book-crud-api`).
2. Loyihani GitHub-ga yuklang:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/book-crud-api.git
   git push -u origin main
   ```
3. [vercel.com](https://vercel.com) saytiga kiring va **"Add New Project"** tugmasini bosing.
4. GitHub repozitoriyangizni tanlang va **"Deploy"** tugmasini bosing.
5. Vercel sizga bepul `https://sizning-loyihangiz.vercel.app` domenini beradi!

### 2-usul: Vercel CLI orqali (Terminaldan to'g'ridan-to'g'ri)
1. Vercel CLI ni o'rnating:
   ```bash
   npm i -g vercel
   ```
2. Terminalda quyidagi buyruqni bering:
   ```bash
   vercel
   ```
3. Savollarga `Enter` bosib tasdiqlang.
4. Tayyor bo'lgach, production uchun:
   ```bash
   vercel --prod
   ```

---

## 🛡️ CORS Nima Uchun Kerak?

Agar siz o'quvchilarga React, Vue yoki oddiy HTML/JS bilan frontend yasab berayotganingizda boshqa portdan (masalan `http://localhost:3000` yoki `http://127.0.0.1:5500`) backendga (`http://localhost:5000`) so'rov yuborsangiz, brauzer xavfsizlik yuzasidan so'rovni bloklaydi (`CORS error`).

Ushbu loyihada `cors` middleware to'liq ulangan:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
```
Shu sababli o'quvchilar har qanday frontend texnologiyasidan bemalol murojaat qila olishadi!
