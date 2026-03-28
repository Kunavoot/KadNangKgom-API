const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'trader_pic_trader') {
            cb(null, 'image/trader/');
        } else if (file.fieldname === 'trader_pic_product') {
            cb(null, 'image/product/');
        } else if (file.fieldname === 'market_img') {
            cb(null, 'image/stall/');
        } else {
            cb(null, 'image/');
        }
    },
    filename: (req, file, cb) => {
        const id = req.params.market_id || req.params.trader_no || req.body.trader_no || req.body.trader_un || Date.now();
        let prefix = 'image';
        let destFolder = 'image/';
        
        if (file.fieldname === 'trader_pic_trader') {
            prefix = 'trader';
            destFolder = 'image/trader/';
        } else if (file.fieldname === 'trader_pic_product') {
            prefix = 'product';
            destFolder = 'image/product/';
        } else if (file.fieldname === 'market_img') {
            prefix = 'stall';
            destFolder = 'image/stall/';
        }
        
        let filenameBase = `${prefix}_${id}`;
        
        if (file.fieldname === 'map_image') {
            filenameBase = 'map_kadnangkgom';
            destFolder = 'image/';
        }
        
        // Clear any old files with the same base name (but different extensions)
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

const marketUpload = upload.fields([
    { name: 'market_img', maxCount: 1 }
]);

const mapUpload = upload.single('map_image');

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

// จัดการข้อมูลกลุ่มสังกัด
router.get('/getGroup', adminController.getGroup);
router.post('/addGroup', adminController.addGroup);
router.put('/editGroup/:group_id', adminController.editGroup);
router.delete('/delGroup/:group_id', adminController.delGroup);

// จัดการข้อมูลประเภทสมาชิก
router.get('/getMemberType', adminController.getMemberType);
router.post('/addMemberType', adminController.addMemberType);
router.put('/editMemberType/:memtype_id', adminController.editMemberType);
router.delete('/delMemberType/:memtype_id', adminController.delMemberType);

// จัดการข้อมูลประเภทสินค้า
router.get('/getProductType', adminController.getProductType);
router.post('/addProductType', adminController.addProductType);
router.put('/editProductType/:ptype_id', adminController.editProductType);
router.delete('/delProductType/:ptype_id', adminController.delProductType);

// จัดการข้อมูลพื้นที่ตลาด
router.get('/getMarket_Summary', adminController.getMarket_Summary);
router.get('/getMarket_Detail/:group_id', adminController.getMarket_Detail);
router.post('/addMarket_Detail', marketUpload, adminController.addMarket_Detail);
router.put('/editMarket_Detail/:market_id', marketUpload, adminController.editMarket_Detail);
router.delete('/delMarket_Detail/:market_id', adminController.delMarket_Detail);

// จัดการข้อมูลสัญญาเช่า
router.get('/getAgreement_Summary', adminController.getAgreement_Summary);
router.get('/getAgreement_Detail', adminController.getAgreement_Detail);
router.get('/getAgreement_List', adminController.getAgreement_List);
router.post('/addAgreement', adminController.addAgreement);
router.delete('/delAgreement', adminController.delAgreement);
router.get('/getReportSale', adminController.getReportSale);

// จัดการแผนที่ตลาด
router.get('/getReportMap', adminController.getReportMap);
router.get('/getMapImage', adminController.getMapImage);
router.post('/uploadMapImage', mapUpload, adminController.uploadMapImage);

module.exports = router;