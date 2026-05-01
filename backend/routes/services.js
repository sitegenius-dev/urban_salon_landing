const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const upload = require('../middleware/upload');
/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Salon services management
 */

/**
 * @swagger
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: List active services (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Active services list
 */
router.get('/', serviceController.getPublicServices);

/**
 * @swagger
 * /services/admin/all:
 *   get:
 *     tags: [Services]
 *     summary: List all services (admin)
 *     responses:
 *       200:
 *         description: All services
 */
router.get('/admin/all', authenticate, requireRole('admin'), serviceController.adminGetServices);

/**
 * @swagger
 * /services:
 *   post:
 *     tags: [Services]
 *     summary: Create a service (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 example: Hair
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Service created
 */
//  router.post(
//   '/',
//   authenticate, requireRole('admin'),
//   upload.single('image'),
//   [
//     body('name').trim().notEmpty().withMessage('Name required'),
//     body('price').isNumeric().withMessage('Valid price required'),
//   ],
//   validate,
//   serviceController.createService
// );
router.post(
  '/',
  authenticate, requireRole('admin'),
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('price').isNumeric().withMessage('Valid price required'),
  ],
  validate,
  serviceController.createService
);
router.post(
  '/bulk',
  authenticate,
  requireRole('admin'),
  serviceController.bulkAddServices
);
/**
 * @swagger
 * /services/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update a service (admin)
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
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated service
 */
// router.put('/:id', authenticate, requireRole('admin'), serviceController.updateService);
router.put('/:id', authenticate, requireRole('admin'), upload.single('image'), serviceController.updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete a service (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authenticate, requireRole('admin'), serviceController.deleteService);

module.exports = router;
