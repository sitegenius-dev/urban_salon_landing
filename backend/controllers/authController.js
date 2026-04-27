const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/login
 * Roles: admin, developer (public-facing users do not need this endpoint)
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Prevent regular 'user' role from logging in via admin panel
    if (user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Access denied for this role' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      admin: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    res.json({ ...req.user.toJSON() });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Public – creates a 'user' role account (for future customer portal)
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
    });

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
