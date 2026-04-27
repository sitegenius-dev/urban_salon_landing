const { Service } = require('../models');

/**
 * GET /api/services
 * Public – active services for booking dropdown
 */
exports.getPublicServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'category', 'price', 'duration', 'description'],
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/services/admin/all
 */
exports.adminGetServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(services);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services
 */
exports.createService = async (req, res, next) => {
  try {
    const { name, category, description, price, duration, isActive } = req.body;
    const service = await Service.create({
      name: name.trim(),
      category: category?.trim() || null,
      description: description || null,
      price: parseFloat(price) || 0,
      duration: duration ? parseInt(duration) : null,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/services/:id
 */
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { name, category, description, price, duration, isActive } = req.body;
    if (name !== undefined)        service.name = name.trim();
    if (category !== undefined)    service.category = category?.trim() || null;
    if (description !== undefined) service.description = description;
    if (price !== undefined)       service.price = parseFloat(price) || 0;
    if (duration !== undefined)    service.duration = duration ? parseInt(duration) : null;
    if (isActive !== undefined)    service.isActive = isActive;

    await service.save();
    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/services/:id
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await service.destroy();
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};
 
exports.bulkAddServices = async (req, res) => {
  try {
    const services = Array.isArray(req.body) ? req.body : req.body.services;

    if (!services || services.length === 0) {
      return res.status(400).json({ message: "No services provided" });
    }

    const validServices = services.filter(s => s.name && s.price);

    if (validServices.length === 0) {
      return res.status(400).json({ message: "No valid services found" });
    }

    const created = await Service.bulkCreate(validServices);

    res.status(201).json({
      message: `${created.length} services added successfully`,
      data: created,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};