# Bloomme Admin Panel Setup Guide

## Overview
Complete admin panel for Bloomme at `/admin` with comprehensive management features for content, users, orders, and subscriptions.

## 🎯 Features Implemented

### 1. **Dashboard** (`📊 Dashboard`)
- Total users count
- Total subscriptions count
- Active subscriptions count
- Conversion rate calculation
- Subscription plans breakdown with visual progress bars

### 2. **Content Manager** (`📝 Content Manager`)
- Manage text and images organized by **pages** and **sections**
- **Supported Pages:** home, about, contact, faq, plans, privacy, signup, terms, etc.
- **Per Section Management:**
  - Title & Subtitle
  - Full description/body text
  - Image URL (with preview)
  - CTA (Call-to-Action) button text and links
  - Display order
- **Features:**
  - Edit existing content
  - Delete sections
  - Real-time preview of images
  - Organized by page selector

### 3. **Users Management** (`👥 Users`)
- View all users with:
  - Name, Email, Phone
  - Account creation date
  - Subscription count
- **Expandable Details:** Click "View Details" to see user's subscriptions including:
  - Plan type (BASIC, PREMIUM, ELITE)
  - Subscription status (active/paused/cancelled)
  - Price
  - Delivery frequency (delivery days)
  - Start date
  - **Next delivery date** (calculated)

### 4. **Orders Management** (`📦 Orders`)
- Complete order list with:
  - Order ID & Customer info
  - Order type (subscription/addon)
  - Amount & Status
  - Order creation date
- **Filters:** View all, paid, pending, or failed orders
- **Detailed View:** Includes:
  - Customer phone & email
  - Razorpay Order ID & Payment ID
  - Payment date
  - Promo code details & discounts
  - Referral discounts

### 5. **Subscriptions Management** (`💳 Subscriptions`)
- Overview stats:
  - Total subscriptions
  - Active, Paused, Cancelled counts
- **Table View with:**
  - Subscription ID
  - Customer name & email
  - Plan type & Price
  - Status (color-coded badges)
  - Delivery schedule
  - Start date
  - **Next delivery date** (calculated)
- **Filters:** By subscription status

## 🔐 Authentication

**Admin Login Credentials:**
- Username: `rushilpartner@gmail.com`
- Password: `gauravpartner`
(Configured in `/admin-portal/src/index.ts`)

Login is required to access any admin features. Token stored in localStorage.

## 📦 Database Changes

### New Table: `page_content`
```sql
CREATE TABLE page_content (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(100),
    section_name VARCHAR(100),
    display_order INTEGER,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(page_name, section_name)
);
```

## 🚀 Setup Instructions

### 1. **Run Database Migration**
```bash
cd /Users/karanbhatia/Desktop/Bloomme/backend

# Execute the init-db.ts (if running for first time) or manually run:
psql -U postgres -d bloomme < create-content-table.sql
```

### 2. **Restart Backend Server**
```bash
cd backend
npm run dev  # or start command
```

### 3. **Access Admin Panel**
Navigate to: **`http://bloomme.co.in/admin`** (or `localhost:3000/admin` for development)

Login with the credentials above.

## 📋 API Endpoints (Backend)

All endpoints require `Authorization: Bearer {token}` header.

### Content Management
- `GET /api/admin/page-content?page=home` - Get all sections for a page
- `GET /api/admin/page-content/list/pages` - Get all available pages
- `POST /api/admin/page-content` - Create/update content
- `PUT /api/admin/page-content/:id` - Update specific content
- `DELETE /api/admin/page-content/:id` - Delete content

### Users & Subscriptions
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users list
- `GET /api/admin/subscriptions` - All subscriptions with user details
- `GET /api/admin/orders` - All orders with user details

### Legacy (Still Supported)
- `GET /api/admin/homepage-content` - Old homepage content
- `PUT /api/admin/homepage-content/:section` - Update old content

## 📁 File Structure

```
frontend/
├── app/
│   └── admin/
│       └── page.tsx                 # Main admin page
└── components/
    └── admin/
        ├── AdminLogin.tsx           # Login component
        ├── AdminDashboard.tsx       # Main dashboard layout
        └── tabs/
            ├── DashboardTab.tsx     # Dashboard stats
            ├── ContentManagerTab.tsx# Content editor
            ├── UsersTab.tsx         # Users list
            ├── OrdersTab.tsx        # Orders list
            └── SubscriptionsTab.tsx # Subscriptions list

backend/
├── src/
│   ├── routes/
│   │   └── admin.ts                 # Admin routes (UPDATED)
│   └── init-db.ts                   # Database init (UPDATED)
└── create-content-table.sql         # Migration file
```

## 🎨 UI/UX Features

- **Responsive Design:** Works on desktop, tablet, mobile
- **Gradient Header:** Purple to pink gradient for branding
- **Color-Coded Badges:**
  - Green: Active/Paid
  - Yellow: Paused/Pending
  - Red: Cancelled/Failed
- **Expandable Rows:** Click to reveal detailed information
- **Image Previews:** Real-time image preview when editing URLs
- **Search/Filter:** Filter orders and subscriptions by status
- **Tab Navigation:** Easy switching between sections

## ⚙️ Configuration

### Authentication
- JWT tokens expire after 24 hours
- Tokens stored in browser localStorage
- Logout removes token from localStorage

### API Connection
- Uses relative URLs `/api/` which proxy through the frontend
- Admin portal backend at port 9000 (admin-portal/src/index.ts)
- Main backend at port 5000 (backend/src/index.ts)

## 🔄 Data Flow

```
Admin UI (React)
    ↓
Frontend API Routes (/api/admin/*)
    ↓
Admin Portal Backend (proxy)
    ↓
Main Backend (/api/admin/*)
    ↓
PostgreSQL Database
```

## 🛠️ Future Enhancements

- [ ] Bulk edit content
- [ ] Upload images directly from admin
- [ ] Custom schedule editor for subscriptions
- [ ] User action history/logs
- [ ] Analytics & reports
- [ ] Email templates editor
- [ ] SMS templates editor
- [ ] Notification management
- [ ] Export data to CSV/Excel

## 📝 Notes

1. **Page names** must match frontend routes (e.g., 'home', 'about', 'plans')
2. **Section names** should be unique per page (e.g., 'hero', 'features', 'pricing')
3. **Image URLs** should be full URLs or relative paths that exist on the server
4. **Next delivery date** is calculated as: `start_date + delivery_days`
5. All timestamps are in UTC

## 🐛 Troubleshooting

**Admin page not loading:**
- Check if `/admin` route is accessible
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure JWT token is valid in localStorage

**Content not saving:**
- Check network tab for failed requests
- Verify token is still valid (24h expiry)
- Ensure all required fields are filled
- Check backend logs for errors

**Subscriptions/Orders not showing:**
- Verify database tables exist: `subscriptions`, `orders`, `users`
- Check if data exists in database
- Verify API endpoints are returning data

---

**Last Updated:** March 29, 2026
**Version:** 1.0.0
