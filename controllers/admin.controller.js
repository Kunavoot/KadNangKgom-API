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

const editAdmin = async (req, res) => {
    const sql = `
    UPDATE admin_table SET
        admin_pname = :admin_pname,
        admin_name = :admin_name,
        admin_sname = :admin_sname,
        admin_birth = :admin_birth,
        admin_job = :admin_job,
        admin_gender = :admin_gender,
        admin_tel = :admin_tel,
        admin_addr = :admin_addr,
        admin_pw = :admin_pw,
        admin_date = :admin_date
    WHERE admin_no = :admin_no;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            admin_no: req.params.admin_no,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลผู้บริหารสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้บริหาร" });
    }
}

const delAdmin = async (req, res) => {
    const sql = `
    DELETE FROM admin_table WHERE admin_no = :admin_no;
    `;

    try {
        const [rows] = await promisePool.query(sql, { admin_no: req.params.admin_no });

        res.status(200).json({
            message: "ลบข้อมูลผู้บริหารสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้บริหาร" });
    }
}

const getTrader = async (req, res) => {
    const sql = `
    SELECT t.*,
        DATE_FORMAT(t.trader_business, '%Y-%m-%d') AS trader_business,
        DATE_FORMAT(t.trader_date, '%Y-%m-%d') AS trader_date,
        mt.memtype_name AS trader_mtype_name,
        pt.ptype_name AS trader_ptype_name
    FROM trader_table t
    JOIN member_type_table mt ON t.trader_mtype = mt.memtype_id
    JOIN product_type_table pt ON t.trader_ptype = pt.ptype_id
    `;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ค้า" });
    }
}

const addTrader = async (req, res) => {
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
    INSERT INTO trader_table (
        trader_mtype,
        trader_ptype,
        trader_pname,
        trader_name,
        trader_sname,
        trader_shop,
        trader_product,
        trader_addr_product,
        trader_addr,
        trader_business,
        trader_fsale,
        trader_car,
        trader_course,
        trader_hobby,
        trader_tel,
        trader_line,
        trader_facebook,
        trader_pic_trader,
        trader_pic_product,
        trader_un,
        trader_pw,
        trader_date,
        trader_status
    ) VALUES (
        :trader_mtype,
        :trader_ptype,
        :trader_pname,
        :trader_name,
        :trader_sname,
        :trader_shop,
        :trader_product,
        :trader_addr_product,
        :trader_addr,
        :trader_business,
        :trader_fsale,
        :trader_car,
        :trader_course,
        :trader_hobby,
        :trader_tel,
        :trader_line,
        :trader_facebook,
        :trader_pic_trader,
        :trader_pic_product,
        :trader_un,
        :trader_pw,
        :trader_date,
        :trader_status
    );
    `;

    try {
        const [rows] = await promisePool.query(sql, req.body);

        res.status(200).json({
            message: "เพิ่มข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้ค้า" });
    }
}

const editTrader = async (req, res) => {
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
        trader_mtype = :trader_mtype,
        trader_ptype = :trader_ptype,
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
        trader_un = :trader_un,
        trader_pw = :trader_pw,
        trader_date = :trader_date,
        trader_status = :trader_status
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

const delTrader = async (req, res) => {
    const sql = `
    DELETE FROM trader_table WHERE trader_no = :trader_no;
    `;

    try {
        const [rows] = await promisePool.query(sql, { trader_no: req.params.trader_no });

        res.status(200).json({
            message: "ลบข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้ค้า" });
    }
}

module.exports = {
    getAdmin,
    addAdmin,
    editAdmin,
    delAdmin,
    getTrader,
    addTrader,
    editTrader,
    delTrader
};