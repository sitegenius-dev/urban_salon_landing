const { Setting } = require('../models');

const DEFAULT_SETTINGS = {
  site_title: 'Urban Company',
  site_logo: '',
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

const normalizeSettings = (rows) => {
  const result = { ...DEFAULT_SETTINGS };
  rows.forEach(r => { result[r.key] = r.value; });

  const normalizedTitle = (result.site_title || '').trim();
  if (normalizedTitle) {
    result.service_name = normalizedTitle;
  } else if ((result.service_name || '').trim()) {
    result.site_title = result.service_name.trim();
  }

  return result;
};
/**
 * GET /api/settings/public
 * Returns all settings as flat key-value object
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    const rows = await Setting.findAll();
    res.json(normalizeSettings(rows));
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
    res.json(normalizeSettings(rows));
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
    const payload = { ...req.body };
    if (typeof payload.site_title === 'string' && payload.site_title.trim()) {
      payload.service_name = payload.site_title.trim();
    }

    const entries = Object.entries(payload);
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
