const express = require('express');
const router = express.Router();
const siteContentController = require('../controllers/siteContentController');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: SiteContent
 *   description: CMS content editable by developer role (hero, services, about, contact sections)
 */

/**
 * @swagger
 * /site-content/public:
 *   get:
 *     tags: [SiteContent]
 *     summary: Get all site content sections (public)
 *     security: []
 *     responses:
 *       200:
 *         description: All sections merged
 */
router.get('/public', siteContentController.getAllSections);

/**
 * @swagger
 * /site-content/{section}:
 *   get:
 *     tags: [SiteContent]
 *     summary: Get a specific section (developer)
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           enum: [hero, services, about, contact]
 *     responses:
 *       200:
 *         description: Section content
 */
router.get(
  '/:section',
  authenticate,
  requireRole('admin', 'developer'),
  siteContentController.getSection
);

/**
 * @swagger
 * /site-content/{section}:
 *   put:
 *     tags: [SiteContent]
 *     summary: Update a CMS section (developer/admin)
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           enum: [hero, services, about, contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Section-specific JSON payload
 *     responses:
 *       200:
 *         description: Updated content
 */
router.put(
  '/:section',
  authenticate,
  requireRole('admin', 'developer'),
  siteContentController.updateSection
);

module.exports = router;
