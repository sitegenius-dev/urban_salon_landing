const { Review } = require('../models');

// Public — सगळ्यांना दिसणाऱ्या reviews (फक्त visible, फक्त 4)
exports.getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { isVisible: 1 },
      order: [['createdAt', 'DESC']],
      limit: 4,
    });
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

// Public — customer review submit करतो
exports.submitReview = async (req, res, next) => {
  try {
    const { name, phone, rating, review } = req.body;
    if (!name || !phone || !review) {
      return res.status(400).json({ success: false, message: 'Name, phone and review are required' });
    }
    const r = await Review.create({
      name: name.trim(),
      phone: phone.trim(),
      rating: parseInt(rating) || 5,
      review: review.trim(),
      isVisible: 0, // Admin approve केल्यावरच दिसेल
    });
    res.status(201).json({ success: true, review: r });
  } catch (err) { next(err); }
};

// Admin — सगळ्या reviews (visible + hidden)
exports.adminGetReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

// Admin — visible toggle करा
exports.adminToggleVisibility = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.isVisible = review.isVisible ? 0 : 1;
    await review.save();
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

// Admin — delete करा
exports.adminDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await review.destroy();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};