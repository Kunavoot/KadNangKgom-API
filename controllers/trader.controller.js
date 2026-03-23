const promisePool = require('../config/db.js');

const getProfile = async (req, res) => {
    const username = req.query?.username;

    if (!username) {
        return res.status(400).json({ message: "กรุณาระบุชื่อผู้ใช้" });
    }

    const sql = `
    SELECT 
        t.*, 
        DATE_FORMAT(t.trader_business, '%Y-%m-%d') AS trader_business, 
        DATE_FORMAT(t.trader_date, '%Y-%m-%d') AS trader_date,
        mt.memtype_name AS trader_mtype_name,
        pt.ptype_name AS trader_ptype_name
    FROM trader_table t
    JOIN member_type_table mt ON t.trader_mtype = mt.memtype_id
    JOIN product_type_table pt ON t.trader_ptype = pt.ptype_id
    WHERE t.trader_un = :username;
    `;

    try {
        const [rows] = await promisePool.query(sql, { username });

        res.status(200).json({
            message: "ดึงข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error get data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ค้า" });
    }
}

const editProfile = async (req, res) => {
    // If files were uploaded, add the filenames to req.body
    if (req.files) {
        if (req.files['trader_pic_trader']) {
            req.body.trader_pic_trader = req.files['trader_pic_trader'][0].filename;
        }
        if (req.files['trader_pic_product']) {
            req.body.trader_pic_product = req.files['trader_pic_product'][0].filename;
        }
    }

    const sql = `
    UPDATE trader_table SET
        trader_pname = :trader_pname,
        trader_name = :trader_name,
        trader_sname = :trader_sname,
        trader_shop = :trader_shop,
        trader_product = :trader_product,
        trader_addr_product = :trader_addr_product,
        trader_addr = :trader_addr,
        trader_business = :trader_business,
        trader_fsale = :trader_fsale,
        trader_car = :trader_car,
        trader_course = :trader_course,
        trader_hobby = :trader_hobby,
        trader_tel = :trader_tel,
        trader_line = :trader_line,
        trader_facebook = :trader_facebook,
        trader_pic_trader = :trader_pic_trader,
        trader_pic_product = :trader_pic_product,
        trader_pw = :trader_pw,
        trader_date = :trader_date
    WHERE trader_no = :trader_no;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            trader_no: req.params.trader_no,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ค้า" });
    }
}

module.exports = {
    getProfile,
    editProfile
};