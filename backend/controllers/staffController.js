const { Staff } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/staff
 * Public – list active staff for booking form
 */
exports.getPublicStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'role', 'specialization', 'imageUrl'],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/staff/admin/all
 */
exports.adminGetStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({ order: [['createdAt', 'DESC']] });
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/staff
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, role, phone, email, experience, specialization, isActive } = req.body;

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const staff = await Staff.create({
      name: name.trim(),
      role: role.trim(),
      phone: phone || null,
      email: email || null,
      experience: experience || null,
      specialization: specialization
        ? (typeof specialization === 'string'
            ? specialization.split(',').map(s => s.trim()).filter(Boolean)
            : specialization)
        : [],
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/staff/:id
 */
exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    const { name, role, phone, email, experience, specialization, isActive } = req.body;

    if (req.file) {
      // Remove old image
      if (staff.imageUrl) {
        const oldPath = path.join(__dirname, '..', staff.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      staff.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (name !== undefined)          staff.name = name.trim();
    if (role !== undefined)          staff.role = role.trim();
    if (phone !== undefined)         staff.phone = phone;
    if (email !== undefined)         staff.email = email;
    if (experience !== undefined)    staff.experience = experience;
    if (specialization !== undefined) {
      staff.specialization = typeof specialization === 'string'
        ? specialization.split(',').map(s => s.trim()).filter(Boolean)
        : specialization;
    }
    if (isActive !== undefined)      staff.isActive = isActive;

    await staff.save();
    res.json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/staff/:id
 */
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    if (staff.imageUrl) {
      const imgPath = path.join(__dirname, '..', staff.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await staff.destroy();
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
};
