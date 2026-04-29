const { Setting } = require('../models');

const DEFAULT_SETTINGS = {
  partial_payment_percent: '0',
  contact_phone: '',
  contact_whatsapp: '',
  contact_address: '',
  service_name: 'Root & Rise',
  hero_tagline: 'Professional Grooming & Beauty Service',
  owner_name: '',
  about_description: '',
  hero_image: '',
  salon_opening_time: '09:00',
  salon_closing_time: '20:00',
  payment_qr_image: '',
 };
/**
 * GET /api/settings/public
 * Returns all settings as flat key-value object
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const rows = await Setting.findAll();
    const result = { ...DEFAULT_SETTINGS };
    rows.forEach(r => { result[r.key] = r.value; });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/settings  (admin)
 */
exports.adminGetSettings = async (req, res, next) => {
  try {
    const rows = await Setting.findAll();
    const result = { ...DEFAULT_SETTINGS };
    rows.forEach(r => { result[r.key] = r.value; });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/settings/bulk  (admin)
 * Body: { key: value, ... }
 */
exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const entries = Object.entries(req.body);
    const allowed = Object.keys(DEFAULT_SETTINGS);

    await Promise.all(
      entries
        .filter(([k]) => allowed.includes(k))
        .map(([key, value]) =>
          Setting.upsert({ key, value: String(value) })
        )
    );

    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
};
