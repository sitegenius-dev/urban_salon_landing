const { Booking } = require('../models');
const { Op } = require('sequelize');

// Generates ["09:00", "09:30", ..., "19:30"]
function generateSlots(openTime, closeTime, durationMins) {
  const slots = [];
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  while (cur < end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += durationMins;
  }
  return slots;
}

// Returns { "09:00": 2, "09:30": 1 } — booking count per slot on a date
async function getBookingCountsByDate(date) {
  const bookings = await Booking.findAll({
    where: { travelDate: date, bookingStatus: { [Op.ne]: 'cancelled' } },
    attributes: ['timeSlot'],
  });
  return bookings.reduce((acc, b) => {
    acc[b.timeSlot] = (acc[b.timeSlot] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { generateSlots, getBookingCountsByDate };