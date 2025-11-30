const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Content = sequelize.define('Content', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    
    
    external_id: { type: DataTypes.STRING, allowNull: false },
    
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
 poster_path: { type: DataTypes.TEXT, allowNull: true },
backdrop_path: { type: DataTypes.TEXT, allowNull: true },
    release_date: { type: DataTypes.STRING }
}, { 
    timestamps: true,
    indexes: [
        { unique: true, fields: ['external_id', 'type'] }
    ]
});

module.exports = Content;