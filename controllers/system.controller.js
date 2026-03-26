const promisePool = require('../config/db.js');

const checkLogin = async (req, res) => {
    // console.log("Request Query:", req.query);
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
    		admin_name AS name,
    		CONCAT(admin_pname, ' ', admin_name, ' ', admin_sname) AS fullname,
            'admin' AS role
        FROM admin_table

        UNION ALL

        SELECT 
            trader_un AS username,
            trader_pw AS password,
    		trader_name AS name,
    		CONCAT(trader_pname, ' ', trader_name, ' ', trader_sname) AS fullname,
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
            data: {
                username: rows[0].username,
                name: rows[0].name,
                fullname: rows[0].fullname,
                role: rows[0].role
            }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
};

const getPrefix = async (req, res) => {
    const sql = `SELECT * FROM sys_prefix_names`;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลคำนำหน้าชื่อสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำนำหน้าชื่อ" });
    }
}

const getMemberType = async (req, res) => {
    const sql = `SELECT * FROM member_type_table`;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลประเภทสมาชิกสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสมาชิก" });
    }
}

const getProductType = async (req, res) => {
    const sql = `SELECT * FROM product_type_table`;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลประเภทสินค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า" });
    }
}

const getGroup = async (req, res) => {
    const sql = `SELECT * FROM group_table`;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลกลุ่มสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่ม" });
    }
}

module.exports = {
    checkLogin,
    getPrefix,
    getMemberType,
    getProductType,
    getGroup
};