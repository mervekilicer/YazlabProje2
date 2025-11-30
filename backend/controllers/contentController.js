const UserContent = require('../models/UserContent');
const Content = require('../models/Content');
const User = require('../models/User');
const sequelize = require('../config/db');

exports.getContentDetails = async (req, res) => {
    try {
        const { externalId, type } = req.query; 

        
        const content = await Content.findOne({ where: { external_id: externalId, type } });

        if (!content) {
            return res.json({ averageRating: 0, reviews: [] });
        }

        
        const reviews = await UserContent.findAll({
            where: { ContentId: content.id },
            include: [{ model: User, attributes: ['username', 'avatar'] }],
            order: [['updatedAt', 'DESC']]
        });

        
        const result = await UserContent.findAll({
            where: { ContentId: content.id, rating: { [sequelize.Op.gt]: 0 } },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
        });
        
        const averageRating = result[0].dataValues.avgRating || 0;

        res.json({
            averageRating: parseFloat(averageRating).toFixed(1), 
            reviews: reviews
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Detaylar çekilemedi.' });
    }
};
const { Content, UserContent, User } = require('../models');
const sequelize = require('../config/db');


exports.getContentDetails = async (req, res) => {
    
    try {
        const { externalId, type } = req.query;
        const content = await Content.findOne({ where: { external_id: externalId, type } });
        
        if (!content) return res.json({ platformRating: 0, totalVotes: 0, reviews: [] });

        const interactions = await UserContent.findAll({
            where: { ContentId: content.id },
            include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
        });

        const ratings = interactions.filter(i => i.rating > 0).map(i => i.rating);
        const avg = ratings.length > 0 ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : 0;
        
        res.json({
            platformRating: avg,
            totalVotes: ratings.length,
            reviews: interactions.filter(i => i.review).map(i => ({
                id: i.id, user: i.User, text: i.review, rating: i.rating, date: i.updatedAt
            }))
        });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.getPlatformTrends = async (req, res) => {
    try {
        
        const trendIds = await UserContent.findAll({
            attributes: [
                'ContentId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['ContentId'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10, // İlk 10
            include: [{ model: Content }]
        });

        
        const trends = trendIds.map(t => t.Content);
        res.json(trends);
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Trendler alınamadı' }); 
    }
};