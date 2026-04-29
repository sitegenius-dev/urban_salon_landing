require('dotenv').config();
const { sequelize, User, Setting, Service, Staff, SiteContent } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // Sync all tables
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    // ── Users ─────────────────────────────────────────────────────────────────
    const adminExists = await User.findOne({ where: { email: 'admin@rootandrise.in' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@rootandrise.in',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Admin user created  →  admin@rootandrise.in / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    
    // ── Default Settings ──────────────────────────────────────────────────────
    const defaultSettings = [
      { key: 'service_name',             value: 'Root & Rise',                    description: 'Salon name' },
      { key: 'hero_tagline',             value: 'Professional Grooming & Beauty', description: 'Hero banner tagline' },
      { key: 'contact_phone',            value: '+91 98765 43210',                description: 'Contact phone' },
      { key: 'contact_whatsapp',         value: '919876543210',                   description: 'WhatsApp number' },
      { key: 'contact_address',          value: 'Koregaon Park, Pune, Maharashtra', description: 'Salon address' },
      { key: 'owner_name',               value: 'Balam Kumar',                   description: 'Owner name' },
      { key: 'partial_payment_percent',  value: '10',                             description: 'Advance payment %' },
      { key: 'about_description',        value: 'Root & Rise is a unisex salon delivering elevated grooming and beauty services across Pune and nearby areas.', description: 'About text' },
    ];

    for (const s of defaultSettings) {
      await Setting.upsert(s);
    }
    console.log('✅ Default settings seeded');

    // ── Default Services ──────────────────────────────────────────────────────
    const svcCount = await Service.count();
    if (svcCount === 0) {
      await Service.bulkCreate([
        { name: 'Hair Cut',        category: 'Hair',   price: 250,  duration: 30,  description: 'Classic haircut by expert stylists' },
        { name: 'Hair Color',      category: 'Hair',   price: 800,  duration: 90,  description: 'Full hair colouring with premium products' },
        { name: 'Hair Treatment',  category: 'Hair',   price: 600,  duration: 60,  description: 'Deep conditioning and repair treatment' },
        { name: 'Beard Trim',      category: 'Beard',  price: 150,  duration: 20,  description: 'Shape and trim your beard' },
        { name: 'Beard Style',     category: 'Beard',  price: 300,  duration: 40,  description: 'Full beard styling and grooming' },
        { name: 'Facial',          category: 'Skin',   price: 500,  duration: 60,  description: 'Deep cleansing facial' },
        { name: 'Skin Care',       category: 'Skin',   price: 400,  duration: 45,  description: 'Customised skin care treatment' },
        { name: 'Makeup',          category: 'Makeup', price: 1000, duration: 60,  description: 'Party or event makeup' },
        { name: 'Bridal Makeup',   category: 'Makeup', price: 5000, duration: 120, description: 'Complete bridal makeup package' },
        { name: 'Nail Art',        category: 'Nails',  price: 300,  duration: 45,  description: 'Creative nail art designs' },
        { name: 'Waxing',          category: 'Skin',   price: 350,  duration: 30,  description: 'Full body or partial waxing' },
      ]);
      console.log('✅ Default services seeded');
    } else {
      console.log('ℹ️  Services already exist, skipping');
    }

    // ── Default Staff ─────────────────────────────────────────────────────────
    const staffCount = await Staff.count();
    if (staffCount === 0) {
      await Staff.bulkCreate([
        { name: 'Rahul Sharma',  role: 'Hair Stylist',     experience: '5 years', specialization: JSON.stringify(['Hair Cut', 'Hair Color']) },
        { name: 'Priya Patel',   role: 'Makeup Artist',    experience: '3 years', specialization: JSON.stringify(['Makeup', 'Bridal Makeup']) },
        { name: 'Amit Verma',    role: 'Beard Specialist', experience: '4 years', specialization: JSON.stringify(['Beard Trim', 'Beard Style']) },
      ]);
      console.log('✅ Default staff seeded');
    } else {
      console.log('ℹ️  Staff already exist, skipping');
    }

    // ── Default Site Content ──────────────────────────────────────────────────
    const heroExists = await SiteContent.findOne({ where: { section: 'hero' } });
    if (!heroExists) {
      await SiteContent.bulkCreate([
        {
          section: 'hero',
          content: JSON.stringify({
            title: 'Root & Rise',
            subtitle: 'Professional Grooming & Beauty Service',
            description: 'Hair • Beard • Skin • Makeup – Expert care in Pune',
            imageUrl: '',
          }),
        },
        {
          section: 'services',
          content: JSON.stringify({
            heading: 'Our Services',
            subheading: 'Expert care for every style',
            items: [],
          }),
        },
        {
          section: 'about',
          content: JSON.stringify({
            heading: 'About Root & Rise',
            description: 'Root & Rise is a unisex salon delivering elevated grooming and beauty services across Pune and nearby areas.',
            imageUrl: '',
            highlights: ['5+ Years Experience', '2000+ Happy Clients', 'Premium Products Used'],
          }),
        },
        {
          section: 'contact',
          content: JSON.stringify({
            heading: 'Get In Touch',
            email: '',
            mapEmbed: '',
            workingHours: '9am – 9pm, Mon – Sun',
          }),
        },
      ]);
      console.log('✅ Default site content seeded');
    } else {
      console.log('ℹ️  Site content already exists, skipping');
    }

    console.log('\n🚀 Seeding complete! You can now start the server.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
