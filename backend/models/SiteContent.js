const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteContent = sequelize.define('SiteContent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  section: {
    type: DataTypes.ENUM('hero', 'services', 'about', 'contact'),
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'JSON blob for section-specific content',
    get() {
      const val = this.getDataValue('content');
      if (!val) return {};
      try { return JSON.parse(val); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('content', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'site_content',
});

module.exports = SiteContent;
