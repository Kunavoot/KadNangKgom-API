const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
// ตรวจสอบให้มั่นใจว่าอ่านจากไฟล์ .env ที่ root เสมอ
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let sslConfig = undefined;

// ถ้าโฮสต์ไม่ใช่ localhost (เช่น TiDB) หรือมีการระบุ CA_PATH จะกำหนดค่า SSL
if ((process.env.DB_HOST && process.env.DB_HOST !== 'localhost') || process.env.CA_PATH) {
    sslConfig = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    };
    if (process.env.CA_PATH) {
        const caPath = path.join(__dirname, '..', process.env.CA_PATH);
        if (fs.existsSync(caPath)) {
            sslConfig.ca = fs.readFileSync(caPath);
        } else {
            console.warn(`⚠️ Warning: CA file not found at ${caPath}`);
        }
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
});

const promisePool = pool.promise();

// ทดสอบการเชื่อมต่อ Database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
    } else {
        console.log('✅ Database connected successfully!');
        if (connection) connection.release();
    }
});

module.exports = promisePool;
