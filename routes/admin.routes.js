const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const multer = require('multer');
const path = require('path');

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'trader_pic_trader') {
            cb(null, 'image/trader/');
        } else if (file.fieldname === 'trader_pic_product') {
            cb(null, 'image/product/');
        } else {
            cb(null, 'image/');
        }
    },
    filename: (req, file, cb) => {
        const id = req.params.trader_no || req.body.trader_no || req.body.trader_un || Date.now();
        const prefix = file.fieldname === 'trader_pic_trader' ? 'trader' : 'product';
        cb(null, `${prefix}_${id}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const traderUpload = upload.fields([
    { name: 'trader_pic_trader', maxCount: 1 },
    { name: 'trader_pic_product', maxCount: 1 }
]);

// จัดการข้อมูลผู้บริหาร
router.get('/getAdmin', adminController.getAdmin);
router.post('/addAdmin', adminController.addAdmin);
router.put('/editAdmin/:admin_no', adminController.editAdmin);
router.delete('/delAdmin/:admin_no', adminController.delAdmin);

// จัดการข้อมูลผู้ค้า
router.get('/getTrader', adminController.getTrader);
router.post('/addTrader', traderUpload, adminController.addTrader);
router.put('/editTrader/:trader_no', traderUpload, adminController.editTrader);
router.delete('/delTrader/:trader_no', adminController.delTrader);

module.exports = router;