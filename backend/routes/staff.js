const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const staffController = require('../controllers/staffController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management
 */

/**
 * @swagger
 * /staff:
 *   get:
 *     tags: [Staff]
 *     summary: List active staff (public)
 *     security: []
 *     responses:
 *       200:
 *         description: List of staff
 */
router.get('/', staffController.getPublicStaff);

/**
 * @swagger
 * /staff/admin/all:
 *   get:
 *     tags: [Staff]
 *     summary: List all staff (admin)
 *     responses:
 *       200:
 *         description: All staff
 */
router.get('/admin/all', authenticate, requireRole('admin'), staffController.adminGetStaff);

/**
 * @swagger
 * /staff:
 *   post:
 *     tags: [Staff]
 *     summary: Create staff member (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, role]
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               experience:
 *                 type: string
 *               specialization:
 *                 type: string
 *                 description: Comma-separated list
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Staff created
 */
router.post(
  '/',
  authenticate, requireRole('admin'),
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('role').trim().notEmpty().withMessage('Role required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
  ],
  validate,
  staffController.createStaff
);

/**
 * @swagger
 * /staff/{id}:
 *   put:
 *     tags: [Staff]
 *     summary: Update staff member (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated staff
 */
router.put('/:id', authenticate, requireRole('admin'), upload.single('image'), staffController.updateStaff);

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     tags: [Staff]
 *     summary: Delete staff member (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authenticate, requireRole('admin'), staffController.deleteStaff);

module.exports = router;
