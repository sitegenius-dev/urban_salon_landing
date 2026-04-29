-- ============================================================
--  Cleaning Services Center — MySQL Schema
--  Run this file to create the database from scratch:
--    mysql -u root -p < schema.sql
-- ============================================================

-- ── users ─────────────────────────────────────────────────────────────────────
-- CREATE TABLE IF NOT EXISTS users (
--   id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
--   name         VARCHAR(100)    NOT NULL,
--   email        VARCHAR(150)    NOT NULL,
--   password     VARCHAR(255)    NOT NULL,
--   role         ENUM('admin','developer','user') NOT NULL DEFAULT 'user',
--   isActive     TINYINT(1)      NOT NULL DEFAULT 1,
--   createdAt    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (id),
--   UNIQUE KEY uq_users_email (email)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL,
  phone       VARCHAR(20)     NOT NULL,
  rating      TINYINT         NOT NULL DEFAULT 5,
  review      TEXT            NOT NULL,
  isVisible   TINYINT(1)      NOT NULL DEFAULT 1,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── staff ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100)  NOT NULL,
  role           VARCHAR(80)   NOT NULL COMMENT 'e.g. Cleaning Specialist, Pest Control Expert',
  phone          VARCHAR(20)   DEFAULT NULL,
  email          VARCHAR(150)  DEFAULT NULL,
  experience     VARCHAR(50)   DEFAULT NULL,
  specialization TEXT          DEFAULT NULL COMMENT 'JSON array of skills',
  imageUrl       VARCHAR(500)  DEFAULT NULL,
  isActive       TINYINT(1)    NOT NULL DEFAULT 1,
  createdAt      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── services ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120)    NOT NULL,
  category    VARCHAR(80)     DEFAULT NULL COMMENT 'e.g. Home Cleaning, Kitchen Cleaning, Pest Control',
  description TEXT            DEFAULT NULL,
  price       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  duration    INT UNSIGNED    DEFAULT NULL COMMENT 'Duration in minutes',
  isActive    TINYINT(1)      NOT NULL DEFAULT 1,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── bookings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  bookingId             VARCHAR(20)     NOT NULL COMMENT 'e.g. CLN-20240401-0001',
  passengerName         VARCHAR(100)    NOT NULL,
  passengerPhone        VARCHAR(20)     NOT NULL,
  passengerEmail        VARCHAR(150)    DEFAULT NULL,
  gender                ENUM('Male','Female','Other') NOT NULL DEFAULT 'Male',
  serviceName           VARCHAR(120)    NOT NULL,
  serviceId             INT UNSIGNED    DEFAULT NULL,
  travelDate            DATE            NOT NULL COMMENT 'Appointment date',
  timeSlot              ENUM('Morning','Afternoon','Evening') NOT NULL DEFAULT 'Morning',
  staffId               INT UNSIGNED    DEFAULT NULL,
  message               TEXT            DEFAULT NULL,
  totalFare             DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  partialPaymentPercent INT             NOT NULL DEFAULT 0,
  partialPaymentAmount  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  remainingAmount       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  paymentStatus         ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  bookingStatus         ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  adminNote             TEXT            DEFAULT NULL,
  createdAt             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_bookingId (bookingId),
  KEY idx_bookings_travelDate   (travelDate),
  KEY idx_bookings_status       (bookingStatus),
  KEY idx_bookings_phone        (passengerPhone),
  KEY idx_bookings_serviceId    (serviceId),
  KEY idx_bookings_staffId      (staffId),
  CONSTRAINT fk_bookings_service
    FOREIGN KEY (serviceId) REFERENCES services (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_staff
    FOREIGN KEY (staffId) REFERENCES staff (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── settings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `key`       VARCHAR(100)  NOT NULL,
  value       TEXT          DEFAULT NULL,
  description VARCHAR(255)  DEFAULT NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── site_content ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  section    ENUM('hero','services','about','contact') NOT NULL,
  content    LONGTEXT      DEFAULT NULL COMMENT 'JSON blob',
  updatedBy  INT UNSIGNED  DEFAULT NULL,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_content_section (section),
  KEY idx_site_content_updatedBy (updatedBy),
  CONSTRAINT fk_site_content_user
    FOREIGN KEY (updatedBy) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
--  Seed Data
-- ============================================================

-- ── Seed: admin + developer accounts ─────────────────────────────────────────
--  Passwords are bcrypt hashes of "admin123"
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin',     'admin@rootandrise.in', '$2a$12$Y5yBxOZz7pxk5eSNxGbGvuRkTfKV0FMoHMY/jXiOZC2pWYbBEjf9e', 'admin'),
   ('Super Admin', 'superadmin@rootandrise.in', '$2a$12$Y5yBxOZz7pxk5eSNxGbGvuRkTfKV0FMoHMY/jXiOZC2pWYbBEjf9e', 'super_admin');
   

-- ── Seed: settings ────────────────────────────────────────────────────────────
INSERT IGNORE INTO settings (`key`, value, description) VALUES
  ('service_name',            'Root & Rise',                                          'Company display name'),
  ('hero_tagline',            'Professional Home & Office Cleaning Services',         'Landing page tagline'),
  ('contact_phone',           '+91 98765 43210',                                      'Public phone number'),
  ('contact_whatsapp',        '919876543210',                                         'WhatsApp number (no spaces)'),
  ('contact_address',         'Koregaon Park, Pune, Maharashtra',                     'Office address'),
  ('owner_name',              'Balam Kumar',                                          'Owner name'),
  ('partial_payment_percent', '10',                                                   'Advance booking payment %'),
  ('about_description',       'Root & Rise is a professional cleaning services company offering expert home, kitchen, bathroom, pest control, and water tank cleaning across Pune and nearby areas.', 'About section text');

-- ── Seed: cleaning services (Urban Company style) ─────────────────────────────
INSERT IGNORE INTO services (name, category, price, duration, description) VALUES

  -- Home Cleaning
  ('Standard Home Cleaning',       'Home Cleaning',       599,  120, 'Dusting, sweeping, mopping all rooms — basic regular cleaning'),
  ('Deep Home Cleaning',           'Home Cleaning',      1499,  240, 'Intensive top-to-bottom cleaning including corners, fans, and fixtures'),
  ('Move-in / Move-out Cleaning',  'Home Cleaning',      1999,  300, 'Complete property cleaning before possession or after vacating'),
  ('Sofa Cleaning (2 Seater)',     'Home Cleaning',       799,   90, 'Foam extraction and dry cleaning for 2-seater sofas'),
  ('Sofa Cleaning (3 Seater)',     'Home Cleaning',       999,   90, 'Foam extraction and dry cleaning for 3-seater sofas'),
  ('Carpet / Rug Cleaning',        'Home Cleaning',       699,   60, 'Dry foam and vacuum extraction cleaning for carpets and rugs'),

  -- Kitchen Cleaning
  ('Kitchen Deep Cleaning',        'Kitchen Cleaning',    999,  180, 'Full degreasing of chimney, tiles, countertop, appliances, and sink'),
  ('Chimney Deep Cleaning',        'Kitchen Cleaning',    499,   60, 'Internal and external degreasing of kitchen chimney'),
  ('Refrigerator Deep Cleaning',   'Kitchen Cleaning',    399,   60, 'Complete interior and exterior refrigerator cleaning and deodorizing'),
  ('Modular Kitchen Cleaning',     'Kitchen Cleaning',   1299,  180, 'Full deep-clean of cabinets, shelves, tiles, and appliances in modular kitchen'),

  -- Bathroom Cleaning
  ('Bathroom Deep Cleaning',       'Bathroom Cleaning',   499,   90, 'Scrubbing tiles, toilet, basin, and taps — removes stains and limescale'),
  ('2 Bathrooms Combo Cleaning',   'Bathroom Cleaning',   799,  150, 'Deep cleaning of 2 bathrooms — includes tiles, fixtures, and exhaust fans'),
  ('Bathroom + Kitchen Combo',     'Bathroom Cleaning',  1299,  240, 'Combined deep clean of all bathrooms and kitchen in one visit'),

  -- Pest Control
  ('General Pest Control (1 BHK)', 'Pest Control',        599,   60, 'Cockroach, ants, and general pest spray treatment for 1 BHK'),
  ('General Pest Control (2 BHK)', 'Pest Control',        799,   75, 'Cockroach, ants, and general pest spray treatment for 2 BHK'),
  ('General Pest Control (3 BHK)', 'Pest Control',        999,   90, 'Cockroach, ants, and general pest spray treatment for 3 BHK'),
  ('Termite Control Treatment',    'Pest Control',       1999,  120, 'Chemical barrier treatment for termite prevention and elimination'),
  ('Mosquito Control Treatment',   'Pest Control',       1199,   90, 'Indoor spray and fogging treatment to eliminate mosquitoes'),
  ('Rodent Control Treatment',     'Pest Control',       1499,   90, 'Trap and bait station setup for rat and rodent control'),
  ('Bed Bug Treatment',            'Pest Control',       1799,  120, 'Steam and chemical treatment to eliminate bed bugs completely'),

  -- Water Tank Cleaning
  ('Water Tank Cleaning (500 L)',  'Water Tank Cleaning', 699,   90, 'Manual scrubbing and disinfection of 500-litre overhead water tank'),
  ('Water Tank Cleaning (1000 L)', 'Water Tank Cleaning', 999,  120, 'Manual scrubbing and disinfection of 1000-litre overhead water tank'),
  ('Sump Tank Cleaning',           'Water Tank Cleaning',1499,  150, 'Underground sump tank cleaning with pump-out and disinfection');

-- ── Seed: staff ───────────────────────────────────────────────────────────────
INSERT IGNORE INTO staff (name, role, experience, specialization) VALUES
  ('Rajesh Patil',   'Cleaning Specialist',    '5 years', '["Standard Home Cleaning","Deep Home Cleaning","Move-in / Move-out Cleaning"]'),
  ('Priya Sharma',   'Kitchen & Bath Expert',  '4 years', '["Kitchen Deep Cleaning","Chimney Deep Cleaning","Bathroom Deep Cleaning"]'),
  ('Suresh Jadhav',  'Pest Control Expert',    '6 years', '["General Pest Control (1 BHK)","Termite Control Treatment","Bed Bug Treatment"]'),
  ('Amit Kulkarni',  'Tank Cleaning Expert',   '3 years', '["Water Tank Cleaning (500 L)","Water Tank Cleaning (1000 L)","Sump Tank Cleaning"]');

-- ── Seed: site content ────────────────────────────────────────────────────────
INSERT IGNORE INTO site_content (section, content) VALUES
  ('hero',     '{"title":"Root & Rise","subtitle":"Professional Home & Office Cleaning Services","description":"Home • Kitchen • Bathroom • Pest Control • Water Tank – Expert cleaning in Pune","imageUrl":""}'),
  ('services', '{"heading":"Our Services","subheading":"Clean home, happy life","items":[]}'),
  ('about',    '{"heading":"About Root & Rise","description":"Root & Rise is a professional cleaning services company serving Pune and nearby areas.","imageUrl":"","highlights":["5+ Years Experience","5000+ Happy Clients","Trained & Verified Staff"]}'),
  ('contact',  '{"heading":"Get In Touch","email":"","mapEmbed":"","workingHours":"8am – 8pm, Mon – Sun"}');