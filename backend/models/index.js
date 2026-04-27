const sequelize = require('../config/database');
const User = require('./User');
const Staff = require('./Staff');
const Service = require('./Service');
const Booking = require('./Booking');
const Setting = require('./Setting');
const SiteContent = require('./SiteContent');
const Review = require('./Review');

// Associations
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Booking.belongsTo(Staff,   { foreignKey: 'staffId',   as: 'staff'   });
Service.hasMany(Booking,   { foreignKey: 'serviceId', as: 'bookings' });
Staff.hasMany(Booking,     { foreignKey: 'staffId',   as: 'bookings' });
SiteContent.belongsTo(User, { foreignKey: 'updatedBy', as: 'editor' });

module.exports = { sequelize, User, Staff, Service, Booking, Setting, SiteContent,Review };
