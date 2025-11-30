const axios = require('axios');
const dotenv = require('dotenv');
const { Content, UserContent, User } = require('../models');
dotenv.config();

const tmdbClient = axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY, language: 'tr-TR' }
});


function formatMovie(m) {
    return {
        id: m.id,
        title: m.title,
        
        poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "https://placehold.co/500x750/333/FFF?text=Resim+Yok",
        backdrop_path: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
        overview: m.overview,
        release_date: m.release_date,
        vote_average: m.vote_average
    };
}

async function getPlatformData(externalId, type) {
    const content = await Content.findOne({ where: { external_id: externalId.toString(), type } });
    if (!content) return { averageRating: 0, totalVotes: 0, reviews: [] };

    const interactions = await UserContent.findAll({
        where: { ContentId: content.id },
        include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });

    const ratings = interactions.filter(i => i.rating > 0).map(i => i.rating);
    const avg = ratings.length > 0 ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : 0;
    
    return {
        averageRating: avg,
        totalVotes: ratings.length,
        reviews: interactions.filter(i => i.review).map(i => ({
            id: i.id, user: i.User, text: i.review, rating: i.rating, date: i.updatedAt
        }))
    };
}

exports.getMovieDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await tmdbClient.get(`/movie/${id}`, { params: { append_to_response: 'credits' } });
        const data = response.data;
        const platformData = await getPlatformData(id, 'movie');
        
        const director = data.credits.crew.find(p => p.job === 'Director')?.name || 'Bilinmiyor';
        const cast = data.credits.cast.slice(0, 5).map(c => ({
            name: c.name, 
            profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : "https://placehold.co/200x200/333/FFF?text=Oyuncu"
        }));

        res.json({
            id: data.id,
            title: data.title,
            overview: data.overview,
            poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://placehold.co/500x750/333/FFF?text=Resim+Yok",
            backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
            release_date: data.release_date,
            runtime: data.runtime,
            genres: data.genres.map(g => g.name),
            director, cast,
            platformRating: platformData.averageRating,
            totalVotes: platformData.totalVotes,
            reviews: platformData.reviews
        });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.getPopularMovies = async (req, res) => { try { const r = await tmdbClient.get('/movie/popular'); res.json(r.data.results.map(m => formatMovie(m))); } catch(e){res.status(500).json({error:'Hata'})} };
exports.getNowPlaying = async (req, res) => { try { const r = await tmdbClient.get('/movie/now_playing'); res.json(r.data.results.map(m => formatMovie(m))); } catch(e){res.status(500).json({error:'Hata'})} };
exports.getTopRated = async (req, res) => { try { const r = await tmdbClient.get('/movie/top_rated'); res.json(r.data.results.map(m => formatMovie(m))); } catch(e){res.status(500).json({error:'Hata'})} };
exports.searchMovies = async (req, res) => { try { const r = await tmdbClient.get('/search/movie', { params: { query: req.query.q, page: req.query.page } }); res.json(r.data.results.map(m => formatMovie(m))); } catch(e){res.status(500).json({error:'Hata'})} };
exports.getMoviesByGenre = async (req, res) => { try { const r = await tmdbClient.get('/discover/movie', { params: { with_genres: req.params.genreId } }); res.json(r.data.results.map(m => formatMovie(m))); } catch(e){res.status(500).json({error:'Hata'})} };
exports.discoverMovies = async (req, res) => { 
    try {
        const params = { language: 'tr-TR', sort_by: 'popularity.desc', page: 1, include_adult: false, primary_release_year: req.query.year, 'vote_average.gte': req.query.vote_average, with_genres: req.query.with_genres };
        const r = await tmdbClient.get('/discover/movie', { params }); 
        res.json(r.data.results.map(m => formatMovie(m))); 
    } catch(e){res.status(500).json({error:'Hata'})} 
};