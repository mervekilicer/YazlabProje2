const User = require('../models/User');
const Follow = require('../models/Follow');
const UserContent = require('../models/UserContent');
const Content = require('../models/Content');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const CustomList = require('../models/CustomList');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');


exports.getFeed = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                { model: User, attributes: ['id', 'username', 'avatar'] },
                { model: Like }, 
                { model: Comment, include: [User] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(posts);
    } catch (error) { 
        res.status(500).json({ error: 'Hata' }); 
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, bio, avatar, password } = req.body;
        
        console.log("Gelen Güncelleme İsteği:", req.body); 

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        if (username) user.username = username;
        if (bio !== undefined) user.bio = bio; 
        if (avatar) user.avatar = avatar;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        
        
        await user.reload();

        res.json({ message: 'Güncellendi', user });
    } catch (error) { 
        console.error("Update Hatası:", error);
        res.status(500).json({ error: 'Güncelleme yapılamadı.' }); 
    }
};
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, { 
            attributes: ['id', 'username', 'avatar', 'bio'] 
        });
        res.json(user);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.getFollowData = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            include: [
                { model: User, as: 'Followers' }, 
                { model: User, as: 'Following' }
            ]
        });

        res.json({
            followersCount: user.Followers.length,
            followingCount: user.Following.length,
            followers: user.Followers,
            following: user.Following
        });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({ 
            where: { UserId: req.params.userId }, 
            include: [Like] 
        });
        res.json(posts);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.toggleLike = async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const existing = await Like.findOne({ where: { UserId: userId, PostId: postId } });

        if (existing) { 
            await existing.destroy(); 
        } else { 
            await Like.create({ UserId: userId, PostId: postId }); 
        }

        res.json({ status: 'ok' });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.addComment = async (req, res) => {
    try {
        const { userId, postId, text } = req.body;
        const comment = await Comment.create({ UserId: userId, PostId: postId, text });
        res.json(comment);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.deleteComment = async (req, res) => {
    try {
        await Comment.destroy({ where: { id: req.params.id } });
        res.json({ status: 'ok' });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.getLikedPosts = async (req, res) => {
    try {
        const likes = await Like.findAll({ 
            where: { UserId: req.params.userId }, 
            include: [{ model: Post, include: [User] }] 
        });
        res.json(likes.map(l => l.Post));
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.createCustomList = async (req, res) => {
    try {
        const list = await CustomList.create({ 
            UserId: req.body.userId, 
            title: req.body.title 
        });
        res.json(list);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.getCustomLists = async (req, res) => {
    try {
        const lists = await CustomList.findAll({ 
            where: { UserId: req.params.userId },
            include: [{ model: Content }]
        });
        res.json(lists);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.addToCustomList = async (req, res) => {
    try {
        const { listId, content } = req.body;
        
        
        const [savedContent] = await Content.findOrCreate({
            where: { 
                external_id: content.external_id.toString(), 
                type: content.type 
            },
            defaults: {
                ...content,
                external_id: content.external_id.toString() 
            }
        });

        const list = await CustomList.findByPk(listId);
        if (!list) return res.status(404).json({ error: 'Liste yok' });
        
        await list.addContent(savedContent);
        
        res.json({ message: 'Eklendi' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Hata' }); 
    }
};

exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await UserContent.findAll({
            where: { 
                UserId: req.params.userId,
                [Op.or]: [
                    { rating: { [Op.gt]: 0 } },
                    { review: { [Op.ne]: null } }
                ]
            },
            include: [{ model: Content }],
            order: [['updatedAt', 'DESC']], 
            limit: 10
        });

        res.json(activities);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};


exports.followUser = async (req, res) => { 
    try { 
        await Follow.findOrCreate({ 
            where: { followerId: req.body.followerId, followingId: req.body.followingId } 
        }); 
        res.json({ msg: 'Ok' }); 
    } catch(e){ res.status(500).json({error:'Hata'}) } 
};

exports.unfollowUser = async (req, res) => { 
    try { 
        await Follow.destroy({ 
            where: { followerId: req.body.followerId, followingId: req.body.followingId } 
        }); 
        res.json({ msg: 'Ok' }); 
    } catch(e){ res.status(500).json({error:'Hata'}) } 
};

exports.searchUsers = async (req, res) => { 
    try { 
        const users = await User.findAll({ 
            where: { username: { [Op.like]: `%${req.query.q}%` } } 
        }); 
        res.json(users); 
    } catch(e){ res.status(500).json({error:'Hata'}) } 
};


exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ error: 'Gönderi bulunamadı.' });

        if (post.UserId !== userId) {
            return res.status(403).json({ error: 'Bunu silmeye yetkiniz yok.' });
        }

        await post.destroy();
        res.json({ message: 'Gönderi silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
};


exports.deleteContentReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const { userId } = req.body;

        const entry = await UserContent.findByPk(id);
        if (!entry) return res.status(404).json({ error: 'Bulunamadı' });
        if (entry.UserId !== userId) return res.status(403).json({ error: 'Yetkisiz' });

       
        entry.review = null;
        await entry.save();

        res.json({ message: 'Silindi' });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
};