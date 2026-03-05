const promisePool = require('../config/db.js');

// ตัวอย่างฟังก์ชันดึงข้อมูลผู้ใช้
const getUsers = (req, res) => {
    res.status(200).json({
        message: "ดึงข้อมูลผู้ใช้สำเร็จ",
        data: [{ id: 1, name: "Gemini" }]
    });
};

const checkLogin = async (req, res) => {
    console.log("Request Query:", req.query); // เพิ่มดูค่าที่ถูกส่งมา
    const username = req.query?.username;
    const password = req.query?.password;

    if (!username || !password) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const sql = `
    SELECT * FROM (
        SELECT 
            admin_un AS username,
            admin_pw AS password,
            'admin' AS role
        FROM admin_table

        UNION ALL

        SELECT 
            trader_un AS username,
            trader_pw AS password,
            'trader' AS role
        FROM trader_table
    ) AS users
    WHERE username = :username AND password = :password;
    `;

    try {
        const [rows] = await promisePool.query(sql, { username, password });

        if (rows.length === 0) {
            return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }

        res.status(200).json({
            message: "เข้าสู่ระบบสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
};

module.exports = {
    getUsers,
    checkLogin
};