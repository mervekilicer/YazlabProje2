const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/popular', movieController.getPopularMovies);
router.get('/now_playing', movieController.getNowPlaying);
router.get('/top_rated', movieController.getTopRated);
router.get('/search', movieController.searchMovies);
router.get('/discover', movieController.discoverMovies); 
router.get('/genre/:genreId', movieController.getMoviesByGenre);
router.get('/:id', movieController.getMovieDetails);

module.exports = router;