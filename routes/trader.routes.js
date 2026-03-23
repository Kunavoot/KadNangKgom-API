const express = require('express');
const router = express.Router();
const traderController = require('../controllers/trader.controller');
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
        } else {
            cb(null, 'image/');
        }
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

router.get('/getProfile', traderController.getProfile);
router.put('/editProfile/:trader_no', traderUpload, traderController.editProfile);

module.exports = router;