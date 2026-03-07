const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/getAdmin', adminController.getAdmin);
router.post('/addAdmin', adminController.addAdmin);

module.exports = router;