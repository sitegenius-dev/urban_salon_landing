const { SiteContent, Setting } = require('../models');

const SECTION_DEFAULTS = {
  hero: {
    title: 'Root & Rise',
    subtitle: 'Professional Grooming & Beauty Service',
    description: 'Haircuts, Beard Styling, Skin Care, Makeup & More',
    imageUrl: '',
  },
  services: {
    heading: 'Our Services',
    subheading: 'Expert care for hair, skin and style',
    items: [],
  },
  about: {
    heading: 'About Us',
    description: 'Root & Rise is a unisex salon delivering elevated grooming and beauty services.',
    imageUrl: '',
    highlights: [],
  },
  contact: {
    heading: 'Get In Touch',
    email: '',
    mapEmbed: '',
    workingHours: '9am – 9pm, Mon – Sun',
  },
};

/**
 * GET /api/site-content/public
 * Returns all sections merged
 */
exports.getAllSections = async (req, res, next) => {
  try {
    const [rows, settingsRows] = await Promise.all([
      SiteContent.findAll(),
      Setting.findAll({ where: { key: ['site_title', 'service_name'] } }),
    ]);
    const result = {};
    Object.keys(SECTION_DEFAULTS).forEach(s => { result[s] = { ...SECTION_DEFAULTS[s] }; });
    rows.forEach(r => { result[r.section] = r.content; });

    const titleSetting = settingsRows.find((row) => row.key === 'site_title')?.value?.trim()
      || settingsRows.find((row) => row.key === 'service_name')?.value?.trim()
      || '';

    if (titleSetting) {
      const heroTitle = (result.hero?.title || '').trim();
      if (!heroTitle || heroTitle === SECTION_DEFAULTS.hero.title) {
        result.hero = {
          ...result.hero,
          title: titleSetting,
        };
      }
    }

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/site-content/:section
 */
exports.getSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!SECTION_DEFAULTS[section]) {
      return res.status(404).json({ success: false, message: 'Unknown section' });
    }

    const row = await SiteContent.findOne({ where: { section } });
    const content = row ? row.content : SECTION_DEFAULTS[section];
    res.json({ success: true, ...content });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/site-content/:section
 */
exports.updateSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!SECTION_DEFAULTS[section]) {
      return res.status(404).json({ success: false, message: 'Unknown section' });
    }

    const [row] = await SiteContent.upsert({
      section,
      content: req.body,
      updatedBy: req.user.id,
    });

    res.json({ success: true, content: row.content });
  } catch (err) {
    next(err);
  }
};
