const axios = require('axios');
const { Content, UserContent, User } = require('../models');

async function getPlatformData(externalId, type) {
    const content = await Content.findOne({ where: { external_id: externalId.toString(), type } });
    if (!content) return { averageRating: 0, totalVotes: 0, reviews: [] };
    const interactions = await UserContent.findAll({ where: { ContentId: content.id }, include: [{ model: User, attributes: ['id', 'username', 'avatar'] }] });
    const ratings = interactions.filter(i => i.rating > 0).map(i => i.rating);
    const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / totalVotes).toFixed(1) : 0;
    const reviews = interactions.filter(i => i.review).map(i => ({ id: i.id, user: i.User, text: i.review, rating: i.rating, date: i.updatedAt }));
    return { averageRating: avg, totalVotes: ratings.length, reviews: reviews };
}


exports.getPopularBooks = async (req, res) => {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&langRestrict=tr&maxResults=12');
        const books = response.data.items ? response.data.items.map(item => formatBook(item)) : [];
        res.json(books);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.getNewestBooks = async (req, res) => {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&langRestrict=tr&maxResults=12');
        const books = response.data.items ? response.data.items.map(item => formatBook(item)) : [];
        res.json(books);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.searchBooks = async (req, res) => {
    try {
        const { q, subject, orderBy } = req.query;
        let query = q || (subject ? `subject:${subject}` : 'best sellers');
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', { params: { q: query, orderBy: orderBy || 'relevance', langRestrict: 'tr', maxResults: 20 } });
        const books = response.data.items ? response.data.items.map(item => formatBook(item)) : [];
        res.json(books);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
        const info = response.data.volumeInfo;
        const platformData = await getPlatformData(id, 'book');
        res.json({
            id: response.data.id,
            title: info.title,
            overview: info.description ? info.description.replace(/<[^>]*>?/gm, '') : "Açıklama yok.",
            poster_path: info.imageLinks?.thumbnail || 'https://placehold.co/300x450/333/FFF?text=Kitap',
            backdrop_path: info.imageLinks?.thumbnail,
            release_date: info.publishedDate,
            vote_average: info.averageRating || 0,
            genres: info.categories || [],
            director: info.authors ? info.authors.join(', ') : 'Yazar Bilinmiyor',
            pageCount: info.pageCount,
            platformRating: platformData.averageRating,
            totalVotes: platformData.totalVotes,
            reviews: platformData.reviews
        });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


function formatBook(item) {
    return {
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        cover_image: item.volumeInfo.imageLinks?.thumbnail || 'https://placehold.co/150x220/333/FFF?text=Kitap',
        publishedDate: item.volumeInfo.publishedDate,
        vote_average: item.volumeInfo.averageRating || 0
    };
}