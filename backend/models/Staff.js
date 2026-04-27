const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  role: {
    type: DataTypes.STRING(80),
    allowNull: false,
    comment: 'e.g. Hair Stylist, Beard Specialist, Makeup Artist',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  experience: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g. 5 years',
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma-separated or JSON array of skills',
    get() {
      const val = this.getDataValue('specialization');
      if (!val) return [];
      try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()); }
    },
    set(val) {
      this.setDataValue('specialization', Array.isArray(val) ? JSON.stringify(val) : val);
    },
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'staff',
});

module.exports = Staff;
