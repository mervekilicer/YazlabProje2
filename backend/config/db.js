const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');


dotenv.config();


console.log("--- VERİTABANI AYARLARI KONTROL ---");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("-----------------------------------");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false 
    }
);

module.exports = sequelize;