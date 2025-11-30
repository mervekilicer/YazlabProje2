const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserContent = sequelize.define('UserContent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    status: {
        type: DataTypes.ENUM('watched', 'to_watch', 'read', 'to_read'),
        allowNull: false
    },
    
rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0, 
    validate: {
        min: 0, 
        max: 10
    }
},
   
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true 
});

module.exports = UserContent;