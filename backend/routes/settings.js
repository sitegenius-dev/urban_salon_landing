const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');


/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Site-wide settings
 */

/**
 * @swagger
 * /settings/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public settings (service name, contact info, etc.)
 *     security: []
 *     responses:
 *       200:
 *         description: Flat key-value settings object
 */
router.get('/public', settingController.getPublicSettings);

/**
 * @swagger
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get all settings (admin)
 *     responses:
 *       200:
 *         description: Flat key-value settings object
 */
// router.get('/', authenticate, requireRole('admin'), settingController.adminGetSettings); 
router.get('/', authenticate, requireRole('super_admin', 'admin'), settingController.adminGetSettings);

/**
 * @swagger
 * /settings/bulk:
 *   post:
 *     tags: [Settings]
 *     summary: Bulk upsert settings (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               service_name: Root & Rise
 *               contact_phone: "+91 98765 43210"
 *               partial_payment_percent: "10"
 *     responses:
 *       200:
 *         description: Settings updated
 */
// router.post('/bulk', authenticate, requireRole('admin'), settingController.bulkUpdateSettings);
router.post('/bulk', authenticate, requireRole('super_admin', 'admin'), settingController.bulkUpdateSettings);
// POST /api/settings/upload-qr  (admin)
 router.post('/upload-qr',
  authenticate,
  requireRole('super_admin', 'admin'),
  upload.single('qrImage'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const { Setting } = require('../models');
      const url = `/uploads/${req.file.filename}`;
      await Setting.upsert({ key: 'payment_qr_image', value: url });
      res.json({ success: true, url });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/settings/upload-hero  (admin)
router.post('/upload-hero',
  authenticate,
  requireRole('super_admin', 'admin'),
  upload.single('heroImage'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const { Setting } = require('../models');
      const url = `/uploads/${req.file.filename}`;
      await Setting.upsert({ key: 'hero_image', value: url });
      res.json({ success: true, url });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/settings/upload-about-image (super_admin only)
router.post('/upload-about-image',
  authenticate,
  requireRole('super_admin'),
  upload.single('aboutImage'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const { Setting } = require('../models');
      const url = `/uploads/${req.file.filename}`;
      await Setting.upsert({ key: 'about_image', value: url });
      res.json({ success: true, url });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
