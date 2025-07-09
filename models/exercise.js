const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const User = require('./user');

const Exercise = sequelize.define('Exercise', {
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

// Associations
User.hasMany(Exercise);
Exercise.belongsTo(User);

module.exports = Exercise;