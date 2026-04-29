const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard stats
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get all dashboard statistics
 *     description: Returns totals, revenue, charts data, and recent bookings
 *     responses:
 *       200:
 *         description: Dashboard stats
 *       401:
 *         description: Unauthorized
 */
// router.get('/stats', authenticate, requireRole('admin'), dashboardController.getStats);
router.get('/stats', authenticate, requireRole('admin', 'super_admin'), dashboardController.getStats);

module.exports = router;
