const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../config');

const User = db.define('users', {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

User.beforeCreate((user) => {
  const salt = bcrypt.genSaltSync();
  user.password = bcrypt.hashSync(user.password, salt); 
});

User.prototype.validPassword = (password) => {
  return bcrypt.compareSync(password, this.password);
}

db.sync()
  .then(() => console.log('Table users created'))
  .catch(err => console.log('Error on create table users', err));

module.exports = User;