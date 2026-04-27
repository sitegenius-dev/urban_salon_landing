# Root & Rise — Salon Booking Frontend

React + Vite frontend for the Root & Rise Salon Booking System.

## Tech Stack
- **React 19** + **Vite 8**
- **Tailwind CSS 4** (via @tailwindcss/vite)
- **Axios** — API calls
- **React Router DOM 7** — Routing
- **React Hot Toast** — Notifications
- **Recharts** — Dashboard charts
- **Lucide React** — Icons

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment (optional)
By default, the Vite dev server proxies `/api` to `http://localhost:5000`.
If your backend runs on a different port, edit `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  },
},
```

### 3. Start development server
```bash
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 4. Build for production
```bash
npm run build
```

---

## Pages & Routes

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page (Hero, Booking, Services, About, Contact) |
| `/admin/login` | Public | Admin login |
| `/admin` | Admin | Dashboard with stats & charts |
| `/admin/bookings` | Admin | Booking management (filter, edit, export) |
| `/admin/services` | Admin | Services CRUD |
| `/admin/staff` | Admin | Staff CRUD |
| `/developer/login` | Public | Developer login |
| `/developer` | Developer | CMS overview |
| `/developer/hero` | Developer | Edit hero section |
| `/developer/services` | Developer | Edit services via CMS |
| `/developer/about` | Developer | Edit about section |
| `/developer/contact` | Developer | Edit contact info |

---

## API Endpoints Used

### Public
| Method | Endpoint | Used For |
|---|---|---|
| GET | `/api/site-content/public` | Hero, about, contact sections |
| GET | `/api/services` | Public services list |
| POST | `/api/bookings` | Submit booking form |

### Admin (JWT required, role: admin)
| Method | Endpoint | Used For |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/bookings/admin/all` | Paginated bookings list |
| PUT | `/api/bookings/admin/:id` | Update booking status |
| DELETE | `/api/bookings/admin/:id` | Delete booking |
| GET | `/api/bookings/admin/export` | Export bookings to Excel |
| GET | `/api/services/admin/all` | All services |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/staff/admin/all` | All staff |
| POST | `/api/staff` | Create staff (multipart) |
| PUT | `/api/staff/:id` | Update staff (multipart) |
| DELETE | `/api/staff/:id` | Delete staff |

### Developer (JWT required, role: developer)
| Method | Endpoint | Used For |
|---|---|---|
| POST | `/api/auth/login` | Developer login |
| GET | `/api/site-content/hero` | Load hero content |
| PUT | `/api/site-content/hero` | Save hero content |
| GET | `/api/site-content/about` | Load about content |
| PUT | `/api/site-content/about` | Save about content |
| GET | `/api/site-content/contact` | Load contact content |
| PUT | `/api/site-content/contact` | Save contact content |
| GET/POST/PUT/DELETE | `/api/services` | Services CMS |

---

## Design System

- **Primary Color:** `#D4AF37` (Gold)
- **Background:** `#0a0a0a` (Near black)
- **Cards:** `#111111`
- **Borders:** `rgba(255,255,255,0.1)`
- **Font:** Inter (system fallback)

---

## Notes
- JWT stored in `localStorage` as `salon_token`
- User info stored as `salon_user`
- Tokens auto-cleared on 401 responses
- Admin and Developer use the **same** `/api/auth/login` endpoint — roles are validated client-side after login
