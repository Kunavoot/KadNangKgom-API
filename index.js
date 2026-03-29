const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Serves static files from the 'image' directory
app.use('/image', express.static(path.join(__dirname, 'image')));

const systemRoutes = require('./routes/system.routes');
const adminRoutes = require('./routes/admin.routes');
const traderRoutes = require('./routes/trader.routes');

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
app.use('/api/trader', traderRoutes);

// Global Error Handler สำหรับดักจับ Error ในระบบ
app.use((err, req, res, next) => {
    console.error("=== Server Error ===");
    console.error(err.stack); // แสดง Stack Trace ใน Console
    console.error("====================");

    res.status(500).json({
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});