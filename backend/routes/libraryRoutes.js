const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
router.get('/check/:userId', libraryController.checkContentStatus);
router.post('/add', libraryController.addToLibrary);
router.get('/:userId', libraryController.getUserLibrary);

module.exports = router;