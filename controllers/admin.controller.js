const promisePool = require('../config/db.js');
const fs = require('fs');
const path = require('path');

const getAdmin = async (req, res) => {
    const sql = `
    SELECT 
        *, 
        DATE_FORMAT(admin_birth, '%Y-%m-%d') AS admin_birth, 
        DATE_FORMAT(admin_date, '%Y-%m-%d') AS admin_date 
    FROM admin_table
    ORDER BY admin_no ASC;
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
        LPAD(t.trader_no, 8, '0') AS trader_no,
        DATE_FORMAT(t.trader_business, '%Y-%m-%d') AS trader_business,
        DATE_FORMAT(t.trader_date, '%Y-%m-%d') AS trader_date,
        mt.memtype_name AS trader_mtype_name,
        pt.ptype_name AS trader_ptype_name
    FROM trader_table t
    JOIN member_type_table mt ON t.trader_mtype = mt.memtype_id
    JOIN product_type_table pt ON t.trader_ptype = pt.ptype_id
    ORDER BY t.trader_no ASC;
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
    const trader_no = req.params.trader_no;
    const sql_select = `SELECT trader_pic_trader, trader_pic_product FROM trader_table WHERE trader_no = :trader_no;`;
    const sql_delete = `DELETE FROM trader_table WHERE trader_no = :trader_no;`;

    try {
        const [traderRows] = await promisePool.query(sql_select, { trader_no });
        const [rows] = await promisePool.query(sql_delete, { trader_no });

        if (traderRows.length > 0) {
            const picTrader = traderRows[0].trader_pic_trader;
            const picProduct = traderRows[0].trader_pic_product;

            if (picTrader) {
                const picTraderPath = path.join(__dirname, '../image/trader', picTrader);
                if (fs.existsSync(picTraderPath)) {
                    fs.unlinkSync(picTraderPath);
                }
            }
            if (picProduct) {
                const picProductPath = path.join(__dirname, '../image/product', picProduct);
                if (fs.existsSync(picProductPath)) {
                    fs.unlinkSync(picProductPath);
                }
            }
        }

        res.status(200).json({
            message: "ลบข้อมูลผู้ค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้ค้า" });
    }
}

const getGroup = async (req, res) => {
    const sql = `
    SELECT * 
    FROM group_table
    ORDER BY group_id ASC;
    `;

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

const addGroup = async (req, res) => {
    const sql = `
    INSERT INTO group_table (
        group_name,
        group_detail
    ) VALUES (
        :group_name,
        :group_detail
    );
    `;

    try {
        const [rows] = await promisePool.query(sql, req.body);

        res.status(200).json({
            message: "เพิ่มข้อมูลกลุ่มสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลกลุ่ม" });
    }
}

const editGroup = async (req, res) => {
    const sql = `
    UPDATE group_table SET
        group_name = :group_name,
        group_detail = :group_detail
    WHERE group_id = :group_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            group_id: req.params.group_id,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลกลุ่มสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลกลุ่ม" });
    }
}

const delGroup = async (req, res) => {
    const sql = `
    DELETE FROM group_table WHERE group_id = :group_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, { group_id: req.params.group_id });

        res.status(200).json({
            message: "ลบข้อมูลกลุ่มสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลกลุ่ม" });
    }
}

const getMemberType = async (req, res) => {
    const sql = `
    SELECT * 
    FROM member_type_table
    ORDER BY memtype_id ASC;
    `;

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

const addMemberType = async (req, res) => {
    const sql = `
    INSERT INTO member_type_table (
        memtype_name,
        memtype_detail
    ) VALUES (
        :memtype_name,
        :memtype_detail
    );
    `;

    try {
        const [rows] = await promisePool.query(sql, req.body);

        res.status(200).json({
            message: "เพิ่มข้อมูลประเภทสมาชิกสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลประเภทสมาชิก" });
    }
}

const editMemberType = async (req, res) => {
    const sql = `
    UPDATE member_type_table SET
        memtype_name = :memtype_name,
        memtype_detail = :memtype_detail
    WHERE memtype_id = :memtype_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            memtype_id: req.params.memtype_id,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลประเภทสมาชิกสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลประเภทสมาชิก" });
    }
}

const delMemberType = async (req, res) => {
    const sql = `
    DELETE FROM member_type_table WHERE memtype_id = :memtype_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, { memtype_id: req.params.memtype_id });

        res.status(200).json({
            message: "ลบข้อมูลประเภทสมาชิกสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลประเภทสมาชิก" });
    }
}

const getProductType = async (req, res) => {
    const sql = `
    SELECT * 
    FROM product_type_table
    ORDER BY ptype_id ASC;
    `;

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

const addProductType = async (req, res) => {
    const sql = `
    INSERT INTO product_type_table (
        ptype_name,
        ptype_detail
    ) VALUES (
        :ptype_name,
        :ptype_detail
    );
    `;

    try {
        const [rows] = await promisePool.query(sql, req.body);

        res.status(200).json({
            message: "เพิ่มข้อมูลประเภทสินค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลประเภทสินค้า" });
    }
}

const editProductType = async (req, res) => {
    const sql = `
    UPDATE product_type_table SET
        ptype_name = :ptype_name,
        ptype_detail = :ptype_detail
    WHERE ptype_id = :ptype_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            ptype_id: req.params.ptype_id,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลประเภทสินค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลประเภทสินค้า" });
    }
}

const delProductType = async (req, res) => {
    const sql = `
    DELETE FROM product_type_table WHERE ptype_id = :ptype_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, { ptype_id: req.params.ptype_id });

        res.status(200).json({
            message: "ลบข้อมูลประเภทสินค้าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลประเภทสินค้า" });
    }
}

const getMarket_Summary = async (req, res) => {
    const sql = `
    SELECT g.group_id , g.group_name, COUNT(m.market_id) AS total_stall , IFNULL(SUM(m.market_status = 1), 0) AS total_rented
    FROM group_table g
    LEFT JOIN market_table m ON g.group_id = m.market_group
    GROUP BY g.group_id
    ORDER BY g.group_id ASC;
    `;

    try {
        const [rows] = await promisePool.query(sql);

        res.status(200).json({
            message: "ดึงข้อมูลภาพรวมตลาดสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวมตลาด" });
    }
}

const getMarket_Detail = async (req, res) => {
    const sql = `
    SELECT * 
    FROM market_table
    WHERE market_group = :group_id
    ORDER BY market_id ASC;
    `;

    try {
        const [rows] = await promisePool.query(sql, { group_id: req.params.group_id });

        res.status(200).json({
            message: "ดึงข้อมูลรายละเอียดตลาดสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดตลาด" });
    }
}

const addMarket_Detail = async (req, res) => {
    if (req.files && req.files['market_img']) {
        req.body.market_img = req.files['market_img'][0].filename;
    }

    let { market_id, market_group, market_area, market_price, market_addr, market_img, market_status } = req.body;

    try {
        if (!market_id) {
            const groupStr = String(market_group).padStart(2, '0');

            const sql_get_id = `
            SELECT 
                LPAD(
                    IFNULL(
                        -- หาเลขที่น้อยที่สุดที่ (ตัวมันเอง + 1) แล้วยังไม่มีในตาราง
                        (SELECT MIN(CAST(SUBSTRING(t1.market_id, 3) AS UNSIGNED) + 1) 
                         FROM market_table t1 
                         LEFT JOIN market_table t2 
                           ON CAST(SUBSTRING(t1.market_id, 3) AS UNSIGNED) + 1 = CAST(SUBSTRING(t2.market_id, 3) AS UNSIGNED) 
                          AND LEFT(t2.market_id, 2) = :market_group
                         WHERE t2.market_id IS NULL 
                           AND LEFT(t1.market_id, 2) = :market_group),
                        1 
                    ), 
                    3, '0' 
                ) AS next_id;
            `;

            const [idRows] = await promisePool.query(sql_get_id, { market_group: groupStr });
            market_id = groupStr + idRows[0].next_id;
        }

        const sql = `
        INSERT INTO market_table (
            market_id,
            market_group,
            market_area,
            market_price,
            market_addr,
            market_img,
            market_status
        ) VALUES (
            :market_id,
            :market_group,
            :market_area,
            :market_price,
            :market_addr,
            :market_img,
            :market_status
        );
        `;

        const [rows] = await promisePool.query(sql, {
            market_id,
            market_group,
            market_area,
            market_price,
            market_addr,
            market_img,
            market_status
        });

        res.status(200).json({
            message: "เพิ่มข้อมูลพื้นที่ตลาดสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error add data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลพื้นที่ตลาด" });
    }
}

const editMarket_Detail = async (req, res) => {
    if (req.files && req.files['market_img']) {
        req.body.market_img = req.files['market_img'][0].filename;
    }

    const sql = `
    UPDATE market_table SET
        market_group = :market_group,
        market_area = :market_area,
        market_price = :market_price,
        market_addr = :market_addr,
        market_img = :market_img,
        market_status = :market_status
    WHERE market_id = :market_id;
    `;

    try {
        const [rows] = await promisePool.query(sql, {
            market_id: req.params.market_id,
            ...req.body
        });

        res.status(200).json({
            message: "แก้ไขข้อมูลพื้นที่ตลาดสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error edit data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลพื้นที่ตลาด" });
    }
}

const delMarket_Detail = async (req, res) => {
    const market_id = req.params.market_id;

    const sql_check = `SELECT market_status, market_img FROM market_table WHERE market_id = :market_id;`;

    try {
        const [checkRows] = await promisePool.query(sql_check, { market_id });

        if (checkRows.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลพื้นที่ตลาด" });
        }

        if (checkRows[0].market_status === '1') {
            return res.status(400).json({ message: "ไม่สามารถลบข้อมูลล็อคตลาดนี้ได้เนื่องจากมีการเช่าอยู่" });
        }

        const sql_delete = `DELETE FROM market_table WHERE market_id = :market_id;`;
        const [rows] = await promisePool.query(sql_delete, { market_id });

        const marketImg = checkRows[0].market_img;
        if (marketImg) {
            const marketImgPath = path.join(__dirname, '../image/stall', marketImg);
            if (fs.existsSync(marketImgPath)) {
                fs.unlinkSync(marketImgPath);
            }
        }

        res.status(200).json({
            message: "ลบข้อมูลพื้นที่ตลาดสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error delete data in:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลพื้นที่ตลาด" });
    }
}


const getAgreement_Summary = async (req, res) => {
    const filterDate = req.query.filterDate;

    if (!filterDate) {
        return res.status(400).json({ message: "กรุณาระบุวันที่เพื่อค้นหาข้อมูล" });
    }

    const sql = `
    SELECT 
        g.group_id,
        g.group_name,
        COUNT(m.market_id) AS total_stalls,
        (COUNT(m.market_id) - SUM(IFNULL(rented.is_rented_sat, 0))) AS available_sat,
        (COUNT(m.market_id) - SUM(IFNULL(rented.is_rented_sun, 0))) AS available_sun,
        SUM(CASE WHEN m.market_id IS NOT NULL AND IFNULL(rented.is_rented_sat, 0) = 0 AND IFNULL(rented.is_rented_sun, 0) = 0 THEN 1 ELSE 0 END) AS absolute_available,
        SUM(CASE WHEN m.market_id IS NOT NULL AND (IFNULL(rented.is_rented_sat, 0) = 1 OR IFNULL(rented.is_rented_sun, 0) = 1) THEN 1 ELSE 0 END) AS total_rented,
        :filterDate AS filter_date
    FROM group_table g
    LEFT JOIN market_table m ON g.group_id = m.market_group
    LEFT JOIN (
        SELECT 
            agmt_market,
            MAX(CASE WHEN agmt_status IN ('1', '3') THEN 1 ELSE 0 END) AS is_rented_sat,
            MAX(CASE WHEN agmt_status IN ('2', '3') THEN 1 ELSE 0 END) AS is_rented_sun
        FROM agreement_table
        WHERE :filterDate BETWEEN agmt_start AND agmt_end
        GROUP BY agmt_market
    ) rented ON m.market_id = rented.agmt_market
    GROUP BY g.group_id, g.group_name
    ORDER BY g.group_id ASC;
    `;

    try {
        const [rows] = await promisePool.query(sql, { filterDate });

        res.status(200).json({
            message: "ดึงข้อมูลสรุปการเช่าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching getAgreement_Summary:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุปการเช่า" });
    }
}

const getAgreement_Detail = async (req, res) => {
    const group_id = req.query.group_id || req.body.group_id;
    const agmt_status = req.query.agmt_status || req.body.agmt_status;
    const agmt_start = req.query.agmt_start || req.body.agmt_start;
    const agmt_end = req.query.agmt_end || req.body.agmt_end;

    if (!group_id || !agmt_status || !agmt_start || !agmt_end) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน (group_id, agmt_status, agmt_start, agmt_end)" });
    }

    const sql = `
    SELECT 
        m.*,
        MAX(CASE WHEN a.agmt_market IS NOT NULL THEN '1' ELSE '0' END) AS market_rented
    FROM market_table m
    LEFT JOIN agreement_table a 
        ON m.market_id = a.agmt_market
        AND a.agmt_start <= :agmt_end 
        AND a.agmt_end >= :agmt_start
        AND (
            (:agmt_status = '1' AND a.agmt_status IN ('1', '3')) OR
            (:agmt_status = '2' AND a.agmt_status IN ('2', '3')) OR
            (:agmt_status = '3' AND a.agmt_status IN ('1', '2', '3'))
        )
    WHERE m.market_group = :group_id
    GROUP BY m.market_id
    ORDER BY m.market_id ASC;
    `;

    try {
        const [rows] = await promisePool.query(sql, { 
            group_id, 
            agmt_status, 
            agmt_start, 
            agmt_end 
        });

        res.status(200).json({
            message: "ดึงข้อมูลรายละเอียดสัญญาเช่าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching getAgreement_Detail:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดสัญญาเช่า" });
    }
}

const addAgreement = async (req, res) => {
    let { agmt_trader, agmt_admin, agmt_market, agmt_status, agmt_start, agmt_end } = req.body;

    if (!agmt_trader || !agmt_admin || !agmt_market || !agmt_status || !agmt_start || !agmt_end) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" });
    }

    if (!/^\d+$/.test(agmt_trader)) {
        return res.status(400).json({ message: "รหัสผู้ค้าต้องเป็นตัวเลขเท่านั้น" });
    }

    if (!/^\d+$/.test(agmt_admin)) {
        return res.status(400).json({ message: "รหัสผู้บริหารต้องเป็นตัวเลขเท่านั้น" });
    }

    try {
        const checkTraderSql = 'SELECT trader_no FROM trader_table WHERE trader_no = :agmt_trader';
        const [traderRows] = await promisePool.query(checkTraderSql, { agmt_trader });
        if (traderRows.length === 0) {
            return res.status(400).json({ message: "ไม่พบข้อมูลผู้ค้าในระบบ" });
        }

        const checkAdminSql = 'SELECT admin_no FROM admin_table WHERE admin_no = :agmt_admin';
        const [adminRows] = await promisePool.query(checkAdminSql, { agmt_admin });
        if (adminRows.length === 0) {
            return res.status(400).json({ message: "ไม่พบข้อมูลผู้บริหารในระบบ" });
        }

        const sql = `
        INSERT INTO agreement_table (
            agmt_trader,
            agmt_admin,
            agmt_market,
            agmt_status,
            agmt_start,
            agmt_end
        ) VALUES (
            :agmt_trader,
            :agmt_admin,
            :agmt_market,
            :agmt_status,
            :agmt_start,
            :agmt_end
        );
        `;

        const updateMarketSql = `UPDATE market_table SET market_status = '1' WHERE market_id = :agmt_market`;
        
        let resultData = [];
        
        if (Array.isArray(agmt_market)) {
            for (let market of agmt_market) {
                const [rows] = await promisePool.query(sql, {
                    agmt_trader,
                    agmt_admin,
                    agmt_market: market,
                    agmt_status,
                    agmt_start,
                    agmt_end
                });
                await promisePool.query(updateMarketSql, { agmt_market: market });
                resultData.push(rows);
            }
        } else {
            const [rows] = await promisePool.query(sql, {
                agmt_trader,
                agmt_admin,
                agmt_market,
                agmt_status,
                agmt_start,
                agmt_end
            });
            await promisePool.query(updateMarketSql, { agmt_market });
            resultData = rows;
        }

        res.status(200).json({
            message: "เพิ่มข้อมูลสัญญาเช่าสำเร็จ",
            data: resultData
        });
    } catch (error) {
        console.error("Error addAgreement:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลสัญญาเช่า" });
    }
}

const getAgreement_List = async (req, res) => {
    const group_id = req.query.group_id || req.body.group_id;
    const agmt_status = req.query.agmt_status || req.body.agmt_status;
    const agmt_start = req.query.agmt_start || req.body.agmt_start;
    const agmt_end = req.query.agmt_end || req.body.agmt_end;

    if (!group_id || !agmt_status || !agmt_start || !agmt_end) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน (group_id, agmt_status, agmt_start, agmt_end)" });
    }

    const sql = `
    SELECT 
        a.agmt_id,
        a.agmt_market,
        a.agmt_status,
        DATE_FORMAT(a.agmt_start, '%Y-%m-%d') AS agmt_start,
        DATE_FORMAT(a.agmt_end, '%Y-%m-%d') AS agmt_end,
        t.trader_shop,
        pt.ptype_name,
        m.market_price
    FROM agreement_table a
    LEFT JOIN trader_table t ON a.agmt_trader = t.trader_no
    LEFT JOIN market_table m ON a.agmt_market = m.market_id
    LEFT JOIN product_type_table pt ON t.trader_ptype = pt.ptype_id
    WHERE m.market_group = :group_id
        AND a.agmt_start <= :agmt_end 
        AND a.agmt_end >= :agmt_start
        AND (
            (:agmt_status = '1' AND a.agmt_status IN ('1', '3')) OR
            (:agmt_status = '2' AND a.agmt_status IN ('2', '3')) OR
            (:agmt_status = '3' AND a.agmt_status IN ('1', '2', '3'))
        )
    ORDER BY a.agmt_market, a.agmt_start ASC;
    `;

    try {
        const [rows] = await promisePool.query(sql, { 
            group_id, 
            agmt_status, 
            agmt_start, 
            agmt_end 
        });

        res.status(200).json({
            message: "ดึงข้อมูลรายการสัญญาเช่าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error fetching getAgreement_List:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการสัญญาเช่า" });
    }
}

const delAgreement = async (req, res) => {
    const agmt_id = req.query.agmt_id || req.body.agmt_id;
    const agmt_market = req.query.agmt_market || req.body.agmt_market;

    if (!agmt_id || !agmt_market) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" });
    }

    const sqlDelete = `DELETE FROM agreement_table WHERE agmt_id = :agmt_id`;
    const sqlCheck = `SELECT COUNT(*) AS count FROM agreement_table WHERE agmt_market = :agmt_market`;
    const sqlUpdateMarket = `UPDATE market_table SET market_status = '0' WHERE market_id = :agmt_market`;

    try {
        const [rows] = await promisePool.query(sqlDelete, { agmt_id });

        const [checkRows] = await promisePool.query(sqlCheck, { agmt_market });
        if (checkRows[0].count === 0) {
            await promisePool.query(sqlUpdateMarket, { agmt_market });
        }

        res.status(200).json({
            message: "ลบข้อมูลสัญญาเช่าสำเร็จ",
            data: rows
        });
    } catch (error) {
        console.error("Error deleting delAgreement:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลสัญญาเช่า" });
    }
}   



module.exports = {
    // จัดการข้อมูลผู้บริหาร
    getAdmin,
    addAdmin,
    editAdmin,
    delAdmin,
    // จัดการข้อมูลผู้ค้า
    getTrader,
    addTrader,
    editTrader,
    delTrader,
    // จัดการข้อมูลกลุ่ม
    getGroup,
    addGroup,
    editGroup,
    delGroup,
    // จัดการข้อมูลประเภทสมาชิก
    getMemberType,
    addMemberType,
    editMemberType,
    delMemberType,
    // จัดการข้อมูลประเภทสินค้า
    getProductType,
    addProductType,
    editProductType,
    delProductType,
    // จัดการข้อมูลพื้นที่ตลาด
    getMarket_Summary,
    getMarket_Detail,
    addMarket_Detail,
    editMarket_Detail,
    delMarket_Detail,
    // จัดการข้อมูลสัญญาเช่า
    getAgreement_Summary,
    getAgreement_Detail,
    getAgreement_List,
    addAgreement,
    delAgreement
};