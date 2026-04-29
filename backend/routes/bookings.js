const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

// ── PUBLIC ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking (public)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [passengerName, passengerPhone, travelDate, serviceName]
 *             properties:
 *               passengerName:
 *                 type: string
 *               passengerPhone:
 *                 type: string
 *               passengerEmail:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               serviceName:
 *                 type: string
 *               serviceId:
 *                 type: integer
 *               travelDate:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *                 enum: [Morning, Afternoon, Evening]
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('passengerName').trim().notEmpty().withMessage('Name required'),
    body('passengerPhone').trim().notEmpty().isLength({ min: 7 }).withMessage('Valid phone required'),
    body('travelDate').isDate().withMessage('Valid appointment date required'),
    body('serviceName').trim().notEmpty().withMessage('Service is required'),
    body('passengerEmail').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email required'),
  ],
  validate,
  bookingController.createBooking
);

/**
 * @swagger
 * /bookings/track/{bookingId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Track a booking by ID (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         example: RNR-20240401-0001
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Not found
 */
router.get('/track/:bookingId', bookingController.trackBooking);
 router.get('/available-slots', bookingController.getAvailableSlots);
// ── ADMIN ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /bookings/admin/all:
 *   get:
 *     tags: [Bookings]
 *     summary: Get paginated bookings (admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 15 }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Filter by exact appointment date
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, completed, cancelled] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, phone, booking ID or service
 *     responses:
 *       200:
 *         description: Paginated booking list
 */
// router.get('/admin/all', authenticate, requireRole('admin'), bookingController.adminGetBookings);
router.get('/admin/all', authenticate, requireRole('admin', 'super_admin'), bookingController.adminGetBookings);
router.get('/admin/export', authenticate, requireRole('admin', 'super_admin'), bookingController.exportBookings);

/**
 * @swagger
 * /bookings/admin/export:
 *   get:
 *     tags: [Bookings]
 *     summary: Export bookings to Excel (admin)
 *     description: Accepts same filters as /admin/all. Returns .xlsx file download.
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Excel file download
 */
// router.get('/admin/export', authenticate, requireRole('admin'), bookingController.exportBookings);

/**
 * @swagger
 * /bookings/admin/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking status or notes (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingStatus:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, partial, paid]
 *               adminNote:
 *                 type: string
 *               staffId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated booking
 */
// router.put('/admin/:id', authenticate, requireRole('admin'), bookingController.adminUpdateBooking);
router.put('/admin/:id', authenticate, requireRole('admin', 'super_admin'), bookingController.adminUpdateBooking);

/**
 * @swagger
 * /bookings/admin/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete a booking (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
// router.delete('/admin/:id', authenticate, requireRole('admin'), bookingController.adminDeleteBooking);
router.delete('/admin/:id', authenticate, requireRole('admin', 'super_admin'), bookingController.adminDeleteBooking);

// router.put('/confirm-payment/:id', bookingController.confirmPayment);
router.put('/confirm-payment/new', bookingController.confirmPayment);

router.put('/update-upi/:bookingId', bookingController.updateUpiTransaction);
router.post('/create-order', bookingController.createRazorpayOrder);
router.post('/verify-payment', bookingController.verifyRazorpayPayment);

module.exports = router;
