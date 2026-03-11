# CarEase Sequelize/PostgreSQL Migration Guide

## Overview
CarEase has been successfully migrated from MongoDB to PostgreSQL using Sequelize ORM. This guide covers the migration details, setup instructions, and how to verify the application is functioning correctly.

## ✅ Migration Status: COMPLETE

### What Was Done

#### 1. **Database Layer Migration**
- ✅ Sequelize ORM configured with PostgreSQL
- ✅ All models migrated from Mongoose to Sequelize
- ✅ Foreign key relationships properly established
- ✅ JSONB columns used for complex data (addresses, metadata, etc.)

#### 2. **Controllers Migration**
- ✅ ServiceController - Sequelize verified
- ✅ ReviewController - Sequelize verified  
- ✅ DeliveryController - Sequelize verified, helper utilities created
- ✅ LocationController - Sequelize verified
- ✅ AdminController - Sequelize verified
- ✅ ReportController - FIXED: MongoDB aggregation → Sequelize grouping
- ✅ BookingController - Sequelize verified
- ✅ PaymentController - Sequelize verified

#### 3. **Payment Integration**
- ✅ Stripe service configured and integrated
- ✅ PayPal service configured and integrated
- ✅ M-PESA service ready
- ✅ Square payment processor ready
- ✅ Flutterwave integration ready
- ✅ Payment webhooks configured

#### 4. **Helper Utilities Created**
- ✅ `DeliveryHelper.js` - Delivery pricing, status transitions, notifications
- ✅ All required exports and helper functions verified

#### 5. **Testing**
- ✅ Comprehensive end-to-end booking workflow tests created
- ✅ Payment integration tests included
- ✅ Error handling tests added
- ✅ Ready for CI/CD integration

---

## Prerequisites

### System Requirements
- Node.js v16+ 
- PostgreSQL 12+
- npm or yarn package manager
- Redis (optional, for caching/queue management)

### Installation Steps

#### 1. Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Or start manually
pg_ctl -D /usr/local/var/postgres start
```

#### 2. Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE carease_dev;
CREATE DATABASE carease_test;
CREATE DATABASE carease_prod;

# Create user (if not exists)
CREATE USER carease WITH PASSWORD 'secure_password';
ALTER ROLE carease WITH CREATEDB;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE carease_dev TO carease;
GRANT ALL PRIVILEGES ON DATABASE carease_test TO carease;
GRANT ALL PRIVILEGES ON DATABASE carease_prod TO carease;

# Exit psql
\q
```

#### 3. Environment Configuration
Create or update `.env` file in `BackEnd/` directory:

```env
# ===== NODE ENVIRONMENT =====
NODE_ENV=development
PORT=5000

# ===== DATABASE (PostgreSQL) =====
DB_NAME=carease_dev
DB_USER=carease
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

# Using DATABASE_URL (optional, takes precedence)
# DATABASE_URL=postgresql://carease:secure_password@localhost:5432/carease_dev

# ===== PAYMENT GATEWAYS =====
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CURRENCY=usd

PAYPAL_CLIENT_ID=xxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxx
PAYPAL_ENVIRONMENT=sandbox

# ===== JWT =====
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=90d

# ===== EMAIL =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=CAR EASE <noreply@carease.com>

# ===== FRONTEND URL =====
CLIENT_URL=http://localhost:3000
CLIENT_URL_PROD=https://carease.com

# ===== ADMIN =====
ADMIN_EMAIL=admin@carease.com
ADMIN_PASSWORD=Admin@123456

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===== GOOGLE MAPS =====
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxx
```

#### 4. Install Dependencies
```bash
cd BackEnd
npm install

cd ../FrontEnd
npm install
```

---

## Running the Application

### Database Initialization

```bash
cd BackEnd

# Sync database with models (creates/updates tables)
npm run db:sync

# Optional: Run seeders to populate test data
npm run db:seed
```

### Development Server

```bash
# Backend
cd BackEnd
npm run dev

# Frontend (in another terminal)
cd FrontEnd
npm run dev
```

The application will be available at:
- **API**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Production Deployment

```bash
# Build frontend
cd FrontEnd
npm run build

# Backend production start
cd ../BackEnd
NODE_ENV=production npm start
```

---

## Testing

### Run End-to-End Booking Workflow Tests

```bash
cd BackEnd

# Run all tests
npm test

# Run specific test file
npm test tests/booking-workflow.test.js

# Run with coverage
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] User registration and authentication
- [ ] Browse vehicles and services
- [ ] Create booking with price calculation
- [ ] Process payment (use Stripe test card: 4242 4242 4242 4242)
- [ ] Confirm booking after payment
- [ ] Create delivery for rental
- [ ] Add review for completed booking
- [ ] View reports and analytics
- [ ] Process refund
- [ ] Admin dashboard functions

---

## Key Features Verified

### 1. **Booking Management** ✅
- Create bookings with date validation
- Calculate pricing with extras and discounts
- Confirm booking after payment
- Track booking status

### 2. **Payment Processing** ✅
- Stripe card payments
- PayPal integration
- M-PESA mobile payments
- Payment status tracking
- Refund processing

### 3. **Delivery Management** ✅
- Create deliveries from bookings
- Track real-time location
- Update delivery status
- Calculate ETA
- Send notifications

### 4. **Reporting & Analytics** ✅
- Revenue reports with grouping
- Booking analytics
- User growth tracking
- Vehicle utilization metrics
- Delivery performance stats

### 5. **Reviews & Ratings** ✅
- Post reviews for completed bookings
- Filter and sort reviews
- Mark reviews as helpful
- Admin review moderation

---

## Database Schema Overview

### Core Tables
```
Users
├── UserAddresses
├── UserPaymentMethods
├── Bookings
│   ├── Payments
│   ├── Deliveries
│   └── Reviews
├── Notifications
├── AuditLogs
└── Wishlist

Vehicles
├── Reviews
└── Maintenance

Services
├── Reviews
└── Bookings

Payments
├── Refunds
└── GatewayResponses

Deliveries
├── Timeline
└── TrackingHistory

Admin
├── AuditLogs
└── SystemSettings
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U carease -d carease_dev -h localhost -p 5432

# Check connection settings in src/Config/sequelize.js
# Ensure DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT are correct
```

### Payment Integration Issues

```bash
# Verify Stripe keys
curl https://api.stripe.com/v1/charges -u sk_test_xxxxx:

# Check PayPal sandbox credentials
# Ensure PAYPAL_ENVIRONMENT=sandbox for testing
```

### Test Failures

```bash
# Clear test database
npm run db:reset -- NODE_ENV=test

# Run tests with verbose output
npm test -- --verbose

# Check logs in BackEnd/src/Logs/
```

---

## Migration Checklist for Deployment

- [ ] Update environment variables on production server
- [ ] Create PostgreSQL database on production
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Run tests: `npm test`
- [ ] Update backup strategies (PostgreSQL dumps instead of MongoDB)
- [ ] Configure database replication/failover if needed
- [ ] Test payment gateway webhooks on production
- [ ] Set up monitoring and alerting for database performance
- [ ] Update documentation for operations team
- [ ] Plan rollback strategy

---

## Useful SQL Queries for Debugging

```sql
-- Check all tables
\dt

-- Check table structure
\d "Bookings"

-- View active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check indexes
\di

-- Count records in each table
SELECT 'Users' as table, COUNT(*) FROM "Users"
UNION ALL SELECT 'Bookings', COUNT(*) FROM "Bookings"
UNION ALL SELECT 'Payments', COUNT(*) FROM "Payments"
UNION ALL SELECT 'Reviews', COUNT(*) FROM "Reviews";
```

---

## Support & Documentation

- **Sequelize Documentation**: https://sequelize.org/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Stripe API Docs**: https://stripe.com/docs/api
- **PayPal Developer**: https://developer.paypal.com/

---

## Version History

- **v2.0.0** (Current): Sequelize/PostgreSQL migration complete
- **v1.0.0**: MongoDB/Mongoose original version

---

**Last Updated**: March 11, 2026
**Status**: Production Ready ✅
