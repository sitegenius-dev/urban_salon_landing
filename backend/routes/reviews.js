const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public
router.get('/public', reviewController.getPublicReviews);
router.post('/', reviewController.submitReview);

// Admin
router.get('/admin/all', authenticate, requireRole('admin'), reviewController.adminGetReviews);
router.put('/admin/:id/toggle', authenticate, requireRole('admin'), reviewController.adminToggleVisibility);
router.delete('/admin/:id', authenticate, requireRole('admin'), reviewController.adminDeleteReview);

module.exports = router;