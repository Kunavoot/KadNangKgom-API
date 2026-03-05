const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

router.get('/getUsers', systemController.getUsers);
router.post('/login', systemController.checkLogin);

module.exports = router;