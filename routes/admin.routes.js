const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// จัดการข้อมูลผู้บริหาร
router.get('/getAdmin', adminController.getAdmin);
router.post('/addAdmin', adminController.addAdmin);
router.put('/editAdmin/:admin_no', adminController.editAdmin);
router.delete('/delAdmin/:admin_no', adminController.delAdmin);

// จัดการข้อมูลผู้ค้า
router.get('/getTrader', adminController.getTrader);
// router.post('/addTrader', adminController.addTrader);
// router.put('/editTrader/:trader_no', adminController.editTrader);
// router.delete('/delTrader/:trader_no', adminController.delTrader);

module.exports = router;