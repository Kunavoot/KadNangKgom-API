const promisePool = require('../config/db.js');
const dayjs = require('dayjs');


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

const getSales = async (req, res) => {

    const username = req.query?.username;

    if (!username) {
        return res.status(400).json({ message: "กรุณาระบุชื่อผู้ใช้" });
    }

    const sql = `
    SELECT 
        t.trader_no AS sale_trader, 
        t.trader_ptype, 
        t.trader_shop,
        pt.ptype_name AS trader_ptype_name,
        t.trader_mtype,
        mt.memtype_name AS trader_mtype_name
    FROM trader_table t
    JOIN product_type_table pt ON t.trader_ptype = pt.ptype_id
    JOIN member_type_table mt ON t.trader_mtype = mt.memtype_id
    WHERE t.trader_un = :username;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            username: username
        });

        if (rows.trader_mtype === 1) {
            return res.status(400).json({ message: "คุณยังไม่ได้เป็นสมาชิกผู้ค้า" });
        }

        res.status(200).json({
            message: "ดึงข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error get data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ค้า" });
    }
}

const getAgreement = async (req, res) => {
    const sql = `
    SELECT a.*,
    DATE_FORMAT(a.agmt_start, '%Y-%m-%d') AS agmt_start,
    DATE_FORMAT(a.agmt_end, '%Y-%m-%d') AS agmt_end,
    m.market_group, 
    g.group_name 
    FROM agreement_table a
    JOIN market_table m ON a.agmt_market = m.market_id
    JOIN group_table g ON m.market_group = g.group_id
    WHERE a.agmt_trader = :trader_no`;

    try {
        const [rows] = await promisePool.query(sql, {
            trader_no: req.query.trader_no
        });

        res.status(200).json({
            message: "ดึงข้อมูลข้อตกลงสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลข้อตกลง" });
    }
}

const sendSales = async (req, res) => {
    const sql_validate = `
    SELECT * FROM sales_table WHERE sale_date = :sale_date AND sale_id = :sale_id;
    `;

    try {
        const [rows] = await promisePool.query(sql_validate, {
            sale_date: req.body.sale_date,
            sale_id: req.body.sale_id
        });

        if (rows.length > 0) {
            return res.status(400).json({ message: "คุณได้ส่งข้อมูลยอดขายวันนั้นแล้ว" });
        }
    } catch (error) {
        console.error("Error validating data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" });
    }

    const sql_date = `
    SELECT * FROM agreement_table WHERE agmt_start > :sale_date AND agmt_end < :sale_date AND agmt_id = :sale_id;
    `;

    try {
        const [rows] = await promisePool.query(sql_date, {
            sale_date: req.body.sale_date,
            sale_id: req.body.sale_id
        });

        if (rows.length > 0) {
            return res.status(400).json({ message: "วันที่ส่งยอดขายมากว่าหรือน้อยกว่าที่กำหนด" });
        }
    } catch (error) {
        console.error("Error validating data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" });
    }

    const dayOfWeek = dayjs(req.body.sale_date).day();
    const sell_day = req.body.sale_sell_day;

    if (sell_day === '1') {
        if (dayOfWeek !== 6) {
            return res.status(400).json({ message: "ต้องส่งข้อมูลยอดขายในวันเสาร์เท่านั้น" });
        }
    } else if (sell_day === '2') {
        if (dayOfWeek !== 0) {
            return res.status(400).json({ message: "ต้องส่งข้อมูลยอดขายในวันอาทิตย์เท่านั้น" });
        }
    } else if (sell_day === '3') {
        if (dayOfWeek !== 0 || dayOfWeek !== 6) {
            return res.status(400).json({ message: "ต้องส่งข้อมูลยอดขายในวันอาทิตย์หรือวันเสาร์เท่านั้น" });
        }
    }

    const sql = `
    INSERT INTO sales_table (
        sale_id,
        sale_date,
        sale_trader,
        sale_shop,
        sale_ptype,
        sale_group,
        sale_amount,
        sale_best,
        sale_suggest
    ) VALUES (
        :sale_id,
        :sale_date,
        :sale_trader,
        :sale_shop,
        :sale_ptype,
        :sale_group,
        :sale_amount,
        :sale_best,
        :sale_suggest
    );
    `;

    try {
        const result = await promisePool.query(sql, {
            sale_id: req.body.sale_id,
            sale_date: req.body.sale_date,
            sale_trader: req.body.sale_trader,
            sale_shop: req.body.sale_shop,
            sale_ptype: req.body.sale_ptype,
            sale_group: req.body.sale_group,
            sale_amount: req.body.sale_amount,
            sale_best: req.body.sale_best,
            sale_suggest: req.body.sale_suggest
        });

        res.status(200).json({
            message: "เพิ่มข้อมูลยอดขายสำเร็จ",
            data: result
        });
    } catch (error) {
        console.error("Error add data in sendSales:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลยอดขาย" });
    }
}

module.exports = {
    getProfile,
    editProfile,
    getSales,
    getAgreement,
    sendSales
};