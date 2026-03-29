const express = require('express');
const router = express.Router();
const traderController = require('../controllers/trader.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'image/';
        if (file.fieldname === 'trader_pic_trader') {
            dest = 'image/trader/';
        } else if (file.fieldname === 'trader_pic_product') {
            dest = 'image/product/';
        }

        const absolutePath = path.join(__dirname, '..', dest);

        // ตรวจสอบและสร้างโฟลเดอร์ถ้าไม่มีอยู่
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
        }

        cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
        const id = req.params.trader_no || req.body.trader_no || req.body.trader_un || Date.now();
        let prefix = 'image';
        let destFolder = 'image/';
        
        if (file.fieldname === 'trader_pic_trader') {
            prefix = 'trader';
            destFolder = 'image/trader/';
        } else if (file.fieldname === 'trader_pic_product') {
            prefix = 'product';
            destFolder = 'image/product/';
        }
        
        const filenameBase = `${prefix}_${id}`;
        
        const dirPath = path.join(__dirname, '..', destFolder);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            for (const f of files) {
                if (f.startsWith(filenameBase + '.')) {
                    try {
                        fs.unlinkSync(path.join(dirPath, f));
                    } catch (err) {
                        console.error("Error deleting old image file:", err);
                    }
                }
            }
        }

        cb(null, `${filenameBase}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const traderUpload = upload.fields([
    { name: 'trader_pic_trader', maxCount: 1 },
    { name: 'trader_pic_product', maxCount: 1 }
]);

// แก้ไขข้อมูลผู้ค้า
router.get('/getProfile', traderController.getProfile);
router.put('/editProfile/:trader_no', traderUpload, traderController.editProfile);

// ส่งข้อมูลยอดขาย
router.get('/getSales', traderController.getSales);
router.get('/getAgreement', traderController.getAgreement);
router.post('/sendSales', traderController.sendSales);

// ประวัติการส่งยอดขาย
router.get('/getSalesHistory', traderController.getSalesHistory);

module.exports = router;