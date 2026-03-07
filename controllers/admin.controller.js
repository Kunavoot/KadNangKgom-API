const promisePool = require('../config/db.js');

const getAdmin = async (req, res) => {
    const sql = `
    SELECT 
        *, 
        DATE_FORMAT(admin_birth, '%Y-%m-%d') AS admin_birth, 
        DATE_FORMAT(admin_date, '%Y-%m-%d') AS admin_date 
    FROM admin_table;
    `;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลผู้บริหารสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error get data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้บริหาร" });
    }
}

const addAdmin = async (req, res) => {
    const sql_1 = `
    SELECT * FROM (
        SELECT 
            admin_un AS username
        FROM admin_table

        UNION ALL

        SELECT 
            trader_un AS username
        FROM trader_table
    ) AS users
    WHERE username = :username;
    `;

    try {
        const [rows] = await promisePool.query(sql_1, { username: req.body.admin_un });

        if (rows.length > 0) {
            return res.status(400).json({ message: "ชื่อผู้ใช้ซ้ำ" });
        }
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้บริหาร" });
    }

    const sql_2 = `
    INSERT INTO admin_table (
        admin_pname,
        admin_name,
        admin_sname,
        admin_birth,
        admin_job,
        admin_gender,
        admin_tel,
        admin_addr,
        admin_un,
        admin_pw,
        admin_date
    ) VALUES (
        :admin_pname,
        :admin_name,
        :admin_sname,
        :admin_birth,
        :admin_job,
        :admin_gender,
        :admin_tel,
        :admin_addr,
        :admin_un,
        :admin_pw,
        :admin_date
    );
    `;

    try {
        const [rows] = await promisePool.query(sql_2, req.body);

        res.status(200).json({
            message: "เพิ่มข้อมูลผู้บริหารสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้บริหาร" });
    }
}

module.exports = {
    getAdmin,
    addAdmin,
};