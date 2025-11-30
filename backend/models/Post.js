const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, { timestamps: true });

module.exports = Post;