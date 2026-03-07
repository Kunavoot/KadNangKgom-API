const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const systemRoutes = require('./routes/system.routes');
const adminRoutes = require('./routes/admin.routes');

// Middleware สำหรับ CORS
app.use(cors());

// Middleware สำหรับอ่าน JSON และ Form Data จาก Body (กำหนดขนาด limit เพื่อความปลอดภัย)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ทดสอบ Route พื้นฐาน
app.get('/', (req, res) => {
    res.send('Hello, Welcome to KadNangKgom API');
});

// นำเข้า Route
app.use('/api/system', systemRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});