const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 5,
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isVisible: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
  },
}, {
  tableName: 'reviews',
});

module.exports = Review;