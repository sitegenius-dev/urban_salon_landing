const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { notEmpty: true },
  },
  category: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'e.g. Hair, Beard, Skin, Makeup',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  duration: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: 'Duration in minutes',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'services',
});

module.exports = Service;
