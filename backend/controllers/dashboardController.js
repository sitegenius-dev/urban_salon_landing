const { Booking, Staff, Service, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * GET /api/dashboard/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // --- Counts ---
    const [totalBookings, todayBookings, totalStaff, totalServices] = await Promise.all([
      Booking.count(),
      Booking.count({ where: { travelDate: today } }),
      Staff.count({ where: { isActive: true } }),
      Service.count({ where: { isActive: true } }),
    ]);

    // --- Revenue (only confirmed + completed) ---
    const revenueResult = await Booking.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('totalFare')), 0), 'totalRevenue'],
        [fn('COALESCE', fn('SUM', col('partialPaymentAmount')), 0), 'totalCollected'],
      ],
      where: { bookingStatus: { [Op.in]: ['confirmed', 'completed'] } },
      raw: true,
    });

    // --- Last 7 days bar chart data ---
    const last7Days = await sequelize.query(`
      SELECT 
        DATE(travelDate) AS date,
        COUNT(*) AS bookings
      FROM bookings
      WHERE travelDate >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND travelDate <= CURDATE()
      GROUP BY DATE(travelDate)
      ORDER BY date ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Fill in missing days
    const dateMap = {};
    last7Days.forEach(r => { dateMap[r.date] = parseInt(r.bookings); });
    const last7Filled = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7Filled.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        bookings: dateMap[key] || 0,
      });
    }

    // --- Bookings by service (for pie chart) ---
    const bookingsByService = await Booking.findAll({
      attributes: ['serviceName', [fn('COUNT', col('id')), 'count']],
      group: ['serviceName'],
      order: [[literal('count'), 'DESC']],
      limit: 5,
      raw: true,
    });

    // --- Recent bookings ---
    const recentBookings = await Booking.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        { association: 'service', attributes: ['name'] },
        { association: 'staff',   attributes: ['name'] },
      ],
    });

    // --- Status breakdown ---
    const statusBreakdown = await Booking.findAll({
      attributes: ['bookingStatus', [fn('COUNT', col('id')), 'count']],
      group: ['bookingStatus'],
      raw: true,
    });

    res.json({
      success: true,
      totalBookings,
      todayBookings,
      totalStaff,
      totalServices,
      totalRevenue: parseFloat(revenueResult.totalRevenue) || 0,
      totalCollected: parseFloat(revenueResult.totalCollected) || 0,
      last7Days: last7Filled,
      bookingsByRoute: bookingsByService.map(b => ({ name: b.serviceName, count: parseInt(b.count) })),
      recentBookings,
      statusBreakdown,
    });
  } catch (err) {
    next(err);
  }
};
