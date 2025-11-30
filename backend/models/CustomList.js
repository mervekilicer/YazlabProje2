const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomList = sequelize.define('CustomList', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

module.exports = CustomList;