const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

router.post('/login', systemController.checkLogin);
router.get('/getPrefix', systemController.getPrefix);
router.get('/getMemberType', systemController.getMemberType);
router.get('/getProductType', systemController.getProductType);

module.exports = router;