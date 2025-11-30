const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


router.post('/follow', userController.followUser);
router.post('/unfollow', userController.unfollowUser);
router.get('/feed/:userId', userController.getFeed);
router.get('/search', userController.searchUsers);
router.get('/stats/:userId', userController.getFollowData);
router.get('/posts/:userId', userController.getUserPosts);
router.post('/like', userController.toggleLike);
router.post('/comment', userController.addComment);
router.delete('/comment/:id', userController.deleteComment);
router.get('/liked/:userId', userController.getLikedPosts);
router.delete('/content-review/:id', userController.deleteContentReview);

router.put('/:userId', userController.updateProfile);
router.get('/:userId', userController.getUserProfile);

router.post('/custom-list', userController.createCustomList);
router.get('/custom-list/:userId', userController.getCustomLists);
router.post('/custom-list/add', userController.addToCustomList);

router.get('/activities/:userId', userController.getRecentActivities);


router.post('/share', upload.single('image'), async (req, res) => {
    try {
        const { userId, caption } = req.body;
        let imageUrl = null;
        
        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
        
        await Post.create({ UserId: userId, imageUrl, caption });
        res.json({ message: 'Paylaşıldı!' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Hata' }); 
    }
});

module.exports = router;
