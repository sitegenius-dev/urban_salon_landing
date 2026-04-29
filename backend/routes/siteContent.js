const express = require('express');
const router = express.Router();
const siteContentController = require('../controllers/siteContentController');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/site-content/public — public
router.get('/public', siteContentController.getAllSections);

// GET /api/site-content/:section — admin
router.get('/:section',
  authenticate,
  requireRole('super_admin', 'admin'),
  siteContentController.getSection
);

// PUT /api/site-content/:section — admin
router.put('/:section',
  authenticate,
  requireRole('super_admin', 'admin'),
  siteContentController.updateSection
);

module.exports = router;