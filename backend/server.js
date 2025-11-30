const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const path = require('path');
const fs = require('fs');


const { User, Content, UserContent, Follow, Post, Like, Comment, CustomList } = require('./models');


User.belongsToMany(Content, { through: UserContent });
Content.belongsToMany(User, { through: UserContent });
User.hasMany(UserContent); UserContent.belongsTo(User);
Content.hasMany(UserContent); UserContent.belongsTo(Content);
User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId', otherKey: 'followingId' });
User.hasMany(Post); Post.belongsTo(User);
User.hasMany(Like); Like.belongsTo(User);
Post.hasMany(Like); Like.belongsTo(Post);
User.hasMany(Comment); Comment.belongsTo(User);
Post.hasMany(Comment); Comment.belongsTo(Post);
User.hasMany(CustomList); CustomList.belongsTo(User);
CustomList.belongsToMany(Content, { through: 'CustomListItems' });
Content.belongsToMany(CustomList, { through: 'CustomListItems' });

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookRoutes = require('./routes/bookRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/users', userRoutes);


sequelize.authenticate().then(() => {
    console.log('✅ Veritabanı Bağlandı');
    
    return sequelize.sync({ alter: true }); 
}).then(() => console.log('✅ TABLOLAR SIFIRLANDI VE HAZIR')).catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));