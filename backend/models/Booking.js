const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  bookingId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Human-readable booking reference e.g. RNR-20240101-0001',
  },
  // Customer details
  passengerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  passengerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: true },
  },
  passengerEmail: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    defaultValue: 'Male',
     allowNull: true,
  },
  // Appointment details
  serviceName: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'services', key: 'id' },
  },
  travelDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Appointment date',
  },
 timeSlot: {
  type: DataTypes.STRING(10),
  allowNull: true,
  comment: 'Time in HH:MM format e.g. 09:00, 09:30',
},
  staffId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'staff', key: 'id' },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Payment details
  totalFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  partialPaymentPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  partialPaymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
    defaultValue: 'unpaid',
  },
  // Booking status
  bookingStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  // Admin notes
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Payment proof
upiTransactionId: {
  type: DataTypes.STRING(100),
  allowNull: true,
},
paymentQrUrl: {
  type: DataTypes.STRING(255),
  allowNull: true,
},
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['travelDate'] },
    { fields: ['bookingStatus'] },
    { fields: ['passengerPhone'] },
  ],
});

module.exports = Booking;
