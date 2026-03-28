const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

router.post('/login', systemController.checkLogin);
router.get('/getPrefix', systemController.getPrefix);
router.get('/getMemberType', systemController.getMemberType);
router.get('/getProductType', systemController.getProductType);
router.get('/getGroup', systemController.getGroup);
router.post('/registerTrader', systemController.registerTrader);

module.exports = router;