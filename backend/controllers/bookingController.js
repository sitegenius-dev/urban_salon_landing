 const { Booking, Setting, Service } = require('../models');
const { Staff } = require('../models');
const { generateSlots, getBookingCountsByDate } = require('../utils/slotHelper');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');

// Helper: generate human-readable booking ID
const generateBookingId = async () => {
  const today = new Date();
  const prefix = `RNR-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await Booking.count({ where: { bookingId: { [Op.like]: `${prefix}%` } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

// Helper: get setting value
const getSetting = async (key, defaultVal) => {
  const row = await Setting.findOne({ where: { key } });
  return row ? row.value : defaultVal;
};


exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

    const openTime   = await getSetting('salon_opening_time', '09:00');
    const closeTime  = await getSetting('salon_closing_time', '20:00');
    const duration   = await getSetting('slot_duration_minutes', '30');
    const staffCount = await Staff.count({ where: { isActive: true } });

    const allSlots = generateSlots(openTime, closeTime, parseInt(duration));
    const counts   = await getBookingCountsByDate(date);

    const now = new Date();
    const todayStr    = now.toISOString().split('T')[0];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const result = allSlots
      .filter(slot => {
        if (date === todayStr) {
          const [h, m] = slot.split(':').map(Number);
          return (h * 60 + m) > currentMins;
        }
        return true;
      })
      .map(slot => ({
        slot,
        booked:    counts[slot] || 0,
        available: Math.max(0, staffCount - (counts[slot] || 0)),
      }));

    res.json({ success: true, date, staffCount, slots: result });
  } catch (err) {
    next(err);
  }
};

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Public – create a new booking from the landing page
 */
// exports.createBooking = async (req, res, next) => {
//   try {
//     const {
//       passengerName, passengerPhone, passengerEmail,
//       gender, serviceName, serviceId,
//       travelDate, timeSlot, staffId, message,
//       upiTransactionId,
//     } = req.body;

//     // Check slot capacity before booking
//     const staffCount = await Staff.count({ where: { isActive: true } });
//     const existingCount = await Booking.count({
//       where: { travelDate, timeSlot, bookingStatus: { [Op.ne]: 'cancelled' } },
//     });
//     if (existingCount >= staffCount) {
//       return res.status(409).json({ success: false, message: 'This time slot is fully booked' });
//     }

//     // Get pricing from services table if serviceId given, else 0
//     // let totalFare = 0;
//     // if (serviceId) {
//     //   const svc = await Service.findByPk(serviceId);
//     //   if (svc) totalFare = parseFloat(svc.price);
//     // }
//     // Get pricing from services table — support both single serviceId and serviceIds array
// let totalFare = 0;
// const ids = req.body.serviceIds && req.body.serviceIds.length > 0
//   ? req.body.serviceIds
//   : (serviceId ? [serviceId] : []);

// if (ids.length > 0) {
//   const svcs = await Service.findAll({ where: { id: ids } });
//   totalFare = svcs.reduce((sum, svc) => sum + parseFloat(svc.price || 0), 0);
// }

//     // Get partial payment config
//     const partialPct = parseFloat(await getSetting('partial_payment_percent', 0));
//     const partialAmt = parseFloat(((partialPct / 100) * totalFare).toFixed(2));
//     const remaining  = parseFloat((totalFare - partialAmt).toFixed(2));

//     const bookingId = await generateBookingId();

//     const booking = await Booking.create({
//       bookingId,
//       passengerName:        passengerName.trim(),
//       passengerPhone:       passengerPhone.trim(),
//       passengerEmail:       passengerEmail || null,
//       gender:               gender || 'Male',
//       serviceName:          serviceName || 'General',
//       serviceId:            serviceId || null,
//       travelDate,
//       timeSlot:             timeSlot || null,
//       staffId:              staffId || null,
//       message:              message || null,
//       totalFare,
//       partialPaymentPercent: partialPct,
//       partialPaymentAmount:  partialAmt,
//       remainingAmount:       remaining,
//       paymentStatus:         partialAmt > 0 ? 'partial' : 'unpaid',
//       bookingStatus:         'pending',
//       upiTransactionId:      upiTransactionId || null,
//     });

//     res.status(201).json({ success: true, booking });
//   } catch (err) {
//     next(err);
//   }
// };
exports.createBooking = async (req, res, next) => {
  try {
    const {
      passengerName, passengerPhone, passengerEmail,
      gender, serviceName, serviceId,
      travelDate, timeSlot, staffId, message,
    } = req.body;

    // Check slot capacity
    const staffCount = await Staff.count({ where: { isActive: true } });
    const existingCount = await Booking.count({
      where: { travelDate, timeSlot, bookingStatus: { [Op.ne]: 'cancelled' } },
    });
    if (existingCount >= staffCount) {
      return res.status(409).json({ success: false, message: 'This time slot is fully booked' });
    }

    // Calculate total fare from serviceIds or serviceId
    let totalFare = 0;
    const ids = req.body.serviceIds && req.body.serviceIds.length > 0
      ? req.body.serviceIds
      : (serviceId ? [serviceId] : []);

    if (ids.length > 0) {
      const svcs = await Service.findAll({ where: { id: ids } });
      totalFare = svcs.reduce((sum, svc) => sum + parseFloat(svc.price || 0), 0);
    }

    // Calculate partial payment
    const partialPct = parseFloat(await getSetting('partial_payment_percent', 0));
    const partialAmt = parseFloat(((partialPct / 100) * totalFare).toFixed(2));
    const remaining  = parseFloat((totalFare - partialAmt).toFixed(2));

    // ✅ DB मध्ये SAVE करायचं नाही — फक्त amount return करा
    // User ने transaction ID confirm केल्यावर /confirm-booking ला save होईल
    res.status(200).json({
      success: true,
      preview: {
        passengerName:        passengerName.trim(),
        passengerPhone:       passengerPhone.trim(),
        passengerEmail:       passengerEmail || null,
        gender:               gender || 'Male',
        serviceName:          serviceName || 'General',
        serviceId:            serviceId || null,
        serviceIds:           req.body.serviceIds || [],
        travelDate,
        timeSlot:             timeSlot || null,
        staffId:              staffId || null,
        message:              message || null,
        totalFare,
        partialPaymentPercent: partialPct,
        partialPaymentAmount:  partialAmt,
        remainingAmount:       remaining,
      }
    });
  } catch (err) {
    next(err);
  }
};
/**
 * GET /api/bookings/track/:bookingId
 * Public – customer can look up their booking by ID
 */
exports.trackBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      where: { bookingId: req.params.bookingId },
      include: [
        { association: 'service', attributes: ['name', 'category'] },
        { association: 'staff',   attributes: ['name', 'role'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

/**
 * GET /api/bookings/admin/all
 * Admin – paginated list with filters
 */
exports.adminGetBookings = async (req, res, next) => {
  try {
    // const {
    //   page = 1, limit = 15,
    //   date, status,
    //   search, dateFrom, dateTo,
    // } = req.query;
    const {
      page = 1, limit = 15,
      date, status,
      search, dateFrom, dateTo,
      staffId,
    } = req.query;

    const where = {};

    if (date) {
      where.travelDate = date;
    } else if (dateFrom || dateTo) {
      where.travelDate = {};
      if (dateFrom) where.travelDate[Op.gte] = dateFrom;
      if (dateTo)   where.travelDate[Op.lte] = dateTo;
    }

  if (status)  where.bookingStatus = status;
if (staffId) where.staffId = staffId;

    if (search) {
      where[Op.or] = [
        { passengerName:  { [Op.like]: `%${search}%` } },
        { passengerPhone: { [Op.like]: `%${search}%` } },
        { bookingId:      { [Op.like]: `%${search}%` } },
        { serviceName:    { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const offset   = (pageNum - 1) * limitNum;

    const { count, rows } = await Booking.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { association: 'service', attributes: ['id', 'name', 'category'] },
        { association: 'staff',   attributes: ['id', 'name', 'role'] },
      ],
    });

    res.json({
      success: true,
      bookings: rows,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/admin/:id
 * Admin – update booking status / note / upi transaction id
 */
exports.adminUpdateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // ✅ upiTransactionId added here so payment confirmation works
    // const allowed = ['bookingStatus', 'paymentStatus', 'adminNote', 'staffId', 'upiTransactionId'];
    const allowed = ['bookingStatus', 'paymentStatus', 'adminNote', 'staffId', 'upiTransactionId', 'serviceName', 'totalFare'];
    allowed.forEach(k => { if (req.body[k] !== undefined) booking[k] = req.body[k]; });

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bookings/admin/:id
 */
exports.adminDeleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await booking.destroy();
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/admin/export
 * Admin – download bookings as Excel file
 */
exports.exportBookings = async (req, res, next) => {
  try {
    const { date, status, dateFrom, dateTo, search } = req.query;
    const where = {};

    if (date) {
      where.travelDate = date;
    } else if (dateFrom || dateTo) {
      where.travelDate = {};
      if (dateFrom) where.travelDate[Op.gte] = dateFrom;
      if (dateTo)   where.travelDate[Op.lte] = dateTo;
    }
    if (status) where.bookingStatus = status;
    if (search) {
      where[Op.or] = [
        { passengerName:  { [Op.like]: `%${search}%` } },
        { passengerPhone: { [Op.like]: `%${search}%` } },
        { bookingId:      { [Op.like]: `%${search}%` } },
      ];
    }

    const bookings = await Booking.findAll({
      where,
      order: [['travelDate', 'DESC']],
      include: [
        { association: 'service', attributes: ['name'] },
        { association: 'staff',   attributes: ['name'] },
      ],
    });

    const rows = bookings.map(b => ({
      'Booking ID':       b.bookingId,
      'Customer Name':    b.passengerName,
      'Phone':            b.passengerPhone,
      'Email':            b.passengerEmail || '',
      'Gender':           b.gender,
      'Service':          b.serviceName,
      'Appointment Date': b.travelDate,
      'Time Slot':        b.timeSlot,
      'Staff':            b.staff?.name || '',
      'Total Fare (₹)':   parseFloat(b.totalFare),
      'Advance (₹)':      parseFloat(b.partialPaymentAmount),
      'Remaining (₹)':    parseFloat(b.remainingAmount),
      'UPI Txn ID':       b.upiTransactionId || '',
      'Payment Status':   b.paymentStatus,
      'Booking Status':   b.bookingStatus,
      'Message':          b.message || '',
      'Booked On':        new Date(b.createdAt).toLocaleString('en-IN'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="bookings-${Date.now()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// exports.confirmPayment = async (req, res, next) => {

//   try {
//     const booking = await Booking.findByPk(req.params.id);
//     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

//     const { upiTransactionId } = req.body;
//     if (!upiTransactionId || !upiTransactionId.trim()) {
//       return res.status(400).json({ success: false, message: 'UPI Transaction ID required' });
//     }

//     booking.upiTransactionId = upiTransactionId.trim();
//     booking.bookingStatus = 'confirmed';
//     booking.paymentStatus = 'partial';
//     await booking.save();

//     res.json({ success: true, booking });
//   } catch (err) {
//     next(err);
//   }
// };
exports.confirmPayment = async (req, res, next) => {
  try {
    const { upiTransactionId, bookingData } = req.body;

    if (!upiTransactionId || !upiTransactionId.trim()) {
      return res.status(400).json({ success: false, message: 'UPI Transaction ID required' });
    }
    if (!bookingData) {
      return res.status(400).json({ success: false, message: 'Booking data missing' });
    }

    // ✅ आता इथे DB मध्ये save होतं — transaction ID सोबतच
    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      passengerName:         bookingData.passengerName,
      passengerPhone:        bookingData.passengerPhone,
      passengerEmail:        bookingData.passengerEmail || null,
      gender:                bookingData.gender || 'Male',
      serviceName:           bookingData.serviceName || 'General',
      serviceId:             bookingData.serviceId || null,
      travelDate:            bookingData.travelDate,
      timeSlot:              bookingData.timeSlot || null,
      staffId:               bookingData.staffId || null,
      message:               bookingData.message || null,
      totalFare:             bookingData.totalFare || 0,
      partialPaymentPercent: bookingData.partialPaymentPercent || 0,
      partialPaymentAmount:  bookingData.partialPaymentAmount || 0,
      remainingAmount:       bookingData.remainingAmount || 0,
      upiTransactionId:      upiTransactionId.trim(),
      paymentStatus:         bookingData.partialPaymentAmount > 0 ? 'partial' : 'unpaid',
      bookingStatus:         'pending',
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.updateUpiTransaction = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { upiTransactionId } = req.body;

    if (!upiTransactionId || !upiTransactionId.trim()) {
      return res.status(400).json({ success: false, message: 'UPI Transaction ID required' });
    }

    const booking = await Booking.findOne({ where: { bookingId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // फक्त pending bookings चाच UPI update होईल
    if (booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot update transaction ID for confirmed bookings' });
    }

    booking.upiTransactionId = upiTransactionId.trim();
    await booking.save();

    res.json({ success: true, message: 'Transaction ID updated successfully' });
  } catch (err) {
    next(err);
  }
};