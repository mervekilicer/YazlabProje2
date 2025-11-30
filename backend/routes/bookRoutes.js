const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
router.get('/popular', bookController.getPopularBooks); 
router.get('/newest', bookController.getNewestBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookDetails); 

module.exports = router;