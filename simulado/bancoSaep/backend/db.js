const Sequelize = require('sequelize');
const sequelize = new Sequelize('saep', 'root', 'Privada030412', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
});

module.exports = sequelize;