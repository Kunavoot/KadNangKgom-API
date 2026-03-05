const express = require('express');
const app = express();
require('dotenv').config();

// Middleware สำหรับอ่าน JSON จาก Body
app.use(express.json());

// ทดสอบ Route พื้นฐาน
app.get('/', (req, res) => {
    res.send('Hello, Node.js Express MySQL API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});