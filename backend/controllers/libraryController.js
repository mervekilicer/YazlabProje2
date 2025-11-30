const { Content, UserContent } = require('../models');
const { Op } = require('sequelize'); 
exports.addToLibrary = async (req, res) => {
    try {
        const { userId, content, status, rating, review } = req.body;
        const extId = String(content.external_id);

        
        const allContents = await Content.findAll({ 
            where: { external_id: extId, type: content.type } 
        });

        let entry = null;

        
        if (allContents.length > 0) {
            const ids = allContents.map(c => c.id);
            entry = await UserContent.findOne({ 
                where: { UserId: userId, ContentId: { [Op.in]: ids } } 
            });
        }

        if (entry) {
            
            console.log(`Mevcut kayıt güncelleniyor: ${entry.status} -> ${status}`);
            
            if (status) entry.status = status;
            if (rating !== undefined) entry.rating = rating;
            if (review !== undefined) entry.review = review;
            
            await entry.save();
        } else {
            
            console.log(`Yeni kayıt oluşturuluyor: ${status}`);
            
            
            const [savedContent] = await Content.findOrCreate({
                where: { external_id: extId, type: content.type },
                defaults: {
                    title: content.title,
                    poster_path: content.poster_path,
                    release_date: content.release_date,
                    backdrop_path: content.backdrop_path,
                    external_id: extId
                }
            });
            
            entry = await UserContent.create({
                UserId: userId,
                ContentId: savedContent.id,
                status: status || 'to_watch',
                rating: rating || 0,
                review: review || null
            });
        }

        res.json({ message: 'Başarılı', data: entry });

    } catch (error) {
        console.error("Library Hatası:", error);
        res.status(500).json({ error: 'İşlem başarısız.' });
    }
};


exports.checkContentStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { externalId, type } = req.query;
        const extId = String(externalId);

        const contents = await Content.findAll({ 
            where: { external_id: extId, type } 
        });
        
        if (!contents.length) return res.json({ status: null, rating: 0, review: '' });

        const contentIds = contents.map(c => c.id);

   
        const entry = await UserContent.findOne({ 
            where: { UserId: userId, ContentId: { [Op.in]: contentIds } } 
        });

        if (!entry) return res.json({ status: null, rating: 0, review: '' });

        res.json({ 
            status: entry.status, 
            rating: entry.rating, 
            review: entry.review
        });

    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.getUserLibrary = async (req, res) => {
    try {
        const list = await UserContent.findAll({
            where: { UserId: req.params.userId },
            include: [{ model: Content }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(list);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};