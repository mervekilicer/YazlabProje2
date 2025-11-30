const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/details', contentController.getContentDetails);
router.get('/trends', contentController.getPlatformTrends); // <-- YENİ ROTA

module.exports = router;