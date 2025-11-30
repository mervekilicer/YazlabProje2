const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },

    username: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true 
    },

    
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    email: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true 
    },

    password: { 
        type: DataTypes.STRING,
        allowNull: false 
    },

    avatar: { 
        type: DataTypes.TEXT,
        defaultValue: 'https://placehold.co/150x150/333/FFF?text=User'
    },

    resetToken: { 
        type: DataTypes.STRING,
        allowNull: true 
    },

    resetTokenExpiration: { 
        type: DataTypes.DATE,
        allowNull: true 
    }

}, { 
    timestamps: true 
});

module.exports = User;