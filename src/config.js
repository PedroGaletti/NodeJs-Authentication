const Sequelize = require('sequelize');

module.exports = new Sequelize('authenticate', 'root', 'authenticate', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql', // sqlite postgresql mssql
  pool: {
    max: 5,
    min: 0,
    acquire: 50000,
    idle: 10000,
  },
  operatorsAliases: false,
});