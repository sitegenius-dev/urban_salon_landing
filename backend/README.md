# Root & Rise Salon — Backend API

> Node.js + Express + MySQL backend for the Root & Rise salon booking system.  
> Supports three roles: **Admin**, **Developer**, and **User (Customer)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| File uploads | Multer |
| Excel export | xlsx |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, express-rate-limit, CORS |

---

## Project Structure

```
backend/
├── config/
│   ├── database.js       # Sequelize MySQL connection
│   └── swagger.js        # Swagger/OpenAPI spec config
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── dashboardController.js
│   ├── serviceController.js
│   ├── settingController.js
│   ├── siteContentController.js
│   └── staffController.js
├── middleware/
│   ├── auth.js           # JWT authenticate + requireRole()
│   ├── errorHandler.js   # validate(), globalErrorHandler, notFound
│   └── upload.js         # Multer image upload config
├── models/
│   ├── index.js          # Associations + exports
│   ├── Booking.js
│   ├── Service.js
│   ├── Setting.js
│   ├── SiteContent.js
│   ├── Staff.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── bookings.js
│   ├── dashboard.js
│   ├── services.js
│   ├── settings.js
│   ├── siteContent.js
│   └── staff.js
├── utils/
│   └── seed.js           # Seed admin users + default data
├── uploads/              # Auto-created; stores uploaded images
├── schema.sql            # Raw MySQL DDL (create tables + seed)
├── server.js             # Express app entry point
├── .env.example
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+ running locally
- npm or yarn

---

### 1 — Clone & install

```bash
# Inside the backend/ folder
npm install
```

---

### 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rootandrise_db

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

---

### 3 — Create the database

**Option A — Use the SQL schema file (recommended for fresh install):**

```bash
mysql -u root -p < schema.sql
```

This creates all tables **and** seeds default data (admin user, services, staff, settings).

**Option B — Let Sequelize auto-sync + run the seed script:**

```bash
# First create the empty database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rootandrise_db CHARACTER SET utf8mb4;"

# Then run the seed
npm run seed
```

---

### 4 — Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server starts at **http://localhost:5000**

---

### 5 — Connect the frontend

In your frontend `.env.development`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@rootandrise.in | admin123 |
| Developer | dev@rootandrise.in | dev123 |

> ⚠️ **Change these immediately in production.**

---

## API Documentation (Swagger)

Open **http://localhost:5000/api/docs** in your browser after starting the server.

Raw JSON spec: **http://localhost:5000/api/docs.json**

---

## API Endpoints Reference

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Admin / developer login |
| POST | `/api/auth/register` | Public | Customer registration |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/stats` | Admin | Totals, revenue, charts, recent bookings |

### Bookings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Public | Create appointment booking |
| GET | `/api/bookings/track/:bookingId` | Public | Track booking by ID |
| GET | `/api/bookings/admin/all` | Admin | Paginated list with filters |
| GET | `/api/bookings/admin/export` | Admin | Download as Excel (.xlsx) |
| PUT | `/api/bookings/admin/:id` | Admin | Update status / notes |
| DELETE | `/api/bookings/admin/:id` | Admin | Delete booking |

**Booking filters (query params):**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `limit` | int | `15` | Items per page (max 100) |
| `date` | date | `2024-04-01` | Exact appointment date |
| `dateFrom` | date | `2024-04-01` | Date range start |
| `dateTo` | date | `2024-04-30` | Date range end |
| `status` | string | `confirmed` | `pending \| confirmed \| completed \| cancelled` |
| `search` | string | `Rahul` | Search name, phone, booking ID, service |

### Staff

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/staff` | Public | Active staff list |
| GET | `/api/staff/admin/all` | Admin | All staff (incl. inactive) |
| POST | `/api/staff` | Admin | Create staff (multipart/form-data) |
| PUT | `/api/staff/:id` | Admin | Update staff |
| DELETE | `/api/staff/:id` | Admin | Delete staff |

### Services

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/services` | Public | Active services for booking form |
| GET | `/api/services/admin/all` | Admin | All services |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Delete service |

### Settings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/settings/public` | Public | All public settings as key-value |
| GET | `/api/settings` | Admin | All settings |
| POST | `/api/settings/bulk` | Admin | Bulk upsert settings |

**Available setting keys:**

| Key | Description |
|-----|-------------|
| `service_name` | Salon display name |
| `hero_tagline` | Landing page tagline |
| `contact_phone` | Public phone number |
| `contact_whatsapp` | WhatsApp number (digits only) |
| `contact_address` | Salon address |
| `owner_name` | Owner name |
| `partial_payment_percent` | Advance booking payment % |
| `about_description` | About section text |
| `hero_image` | Hero banner image URL |

### Site Content (CMS — Developer Role)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/site-content/public` | Public | All sections merged |
| GET | `/api/site-content/:section` | Admin / Developer | Get one section |
| PUT | `/api/site-content/:section` | Admin / Developer | Update one section |

**Sections:** `hero` · `services` · `about` · `contact`

---

## Role-Based Access Control (RBAC)

| Feature | User | Admin | Developer |
|---------|------|-------|-----------|
| Create booking (public form) | ✅ | ✅ | ✅ |
| Track own booking | ✅ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ❌ |
| Manage bookings | ❌ | ✅ | ❌ |
| Manage staff | ❌ | ✅ | ❌ |
| Manage services | ❌ | ✅ | ❌ |
| Change settings | ❌ | ✅ | ❌ |
| Edit CMS content | ❌ | ✅ | ✅ |
| Export Excel | ❌ | ✅ | ❌ |

---

## Database Schema (ERD summary)

```
users
 └─ id, name, email, password, role (admin|developer|user), isActive

staff
 └─ id, name, role, phone, email, experience, specialization (JSON), imageUrl, isActive

services
 └─ id, name, category, description, price, duration, isActive

bookings
 ├─ id, bookingId (RNR-YYYYMMDD-NNNN)
 ├─ passengerName, passengerPhone, passengerEmail, gender
 ├─ serviceName, serviceId → services.id
 ├─ travelDate, timeSlot, staffId → staff.id
 ├─ totalFare, partialPaymentAmount, remainingAmount, paymentStatus
 └─ bookingStatus, adminNote

settings
 └─ id, key (unique), value, description

site_content
 └─ id, section (hero|services|about|contact), content (JSON), updatedBy → users.id
```

---

## Frontend ↔ Backend Mapping

The frontend was originally built for a taxi app but was repurposed as a salon app. Here's how the API aliases work:

| Frontend API call | Actual backend route | Entity |
|---|---|---|
| `GET /api/routes` | `/api/services` | Salon services |
| `POST /api/routes` | `/api/services` | Create service |
| `PUT /api/routes/:id` | `/api/services/:id` | Update service |
| `DELETE /api/routes/:id` | `/api/services/:id` | Delete service |
| `GET /api/vehicles` | `/api/staff` | Staff members |
| `POST /api/vehicles` | `/api/staff` | Create staff |
| `PUT /api/vehicles/:id` | `/api/staff/:id` | Update staff |
| `DELETE /api/vehicles/:id` | `/api/staff/:id` | Delete staff |

---

## Excel Export

`GET /api/bookings/admin/export` returns an `.xlsx` file with columns:

> Booking ID · Customer Name · Phone · Email · Gender · Service · Appointment Date · Time Slot · Staff · Total Fare · Advance · Remaining · Payment Status · Booking Status · Message · Booked On

Supports the same date / status / search filters as the booking list endpoint.

---

## Security Notes

- All passwords are bcrypt-hashed (cost factor 12)
- JWT tokens expire in 7 days by default
- Rate limiting: 200 req/15min globally, 20 req/15min on auth routes
- Helmet sets secure HTTP headers
- CORS restricted to the configured frontend origin
- File uploads limited to 5 MB; only images allowed
- SQL injection prevented by Sequelize parameterised queries
- Input sanitised via express-validator on all write endpoints

---

## Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use a strong random `JWT_SECRET` (32+ chars)
- [ ] Change default admin / developer passwords
- [ ] Set `FRONTEND_URL` to your deployed domain
- [ ] Use `sequelize.sync({ force: false })` (never `alter`) in production — use migrations
- [ ] Put uploads behind a CDN or use S3/Cloudinary for image storage
- [ ] Enable SSL/HTTPS on the server
- [ ] Use a process manager like PM2: `pm2 start server.js --name rootandrise-api`
