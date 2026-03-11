-- ===== src/config/schema.sql =====
-- CAR EASE PostgreSQL Database Schema
-- Complete schema with tables, relationships, indexes, and constraints

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin', 'super_admin');

-- Service types
CREATE TYPE service_type AS ENUM ('rental', 'car_wash', 'repair', 'sales', 'concierge', 'storage', 'delivery');

-- Booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'processing', 'in_progress', 'completed', 'cancelled', 'refunded', 'no_show');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'mpesa', 'square', 'flutterwave', 'cash', 'bank_transfer');

-- Vehicle categories
CREATE TYPE vehicle_category AS ENUM ('supercar', 'luxury', 'sports', 'suv', 'exotic', 'grand_tourer', 'classic');

-- Vehicle transmission
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'semi-automatic', 'dual-clutch');

-- Vehicle drivetrain
CREATE TYPE drivetrain_type AS ENUM ('FWD', 'RWD', 'AWD', '4WD');

-- Fuel type
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'hybrid', 'electric');

-- Delivery status
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 'picked_up', 'en_route_dropoff', 'arrived_dropoff', 'delivered', 'cancelled', 'failed');

-- Delivery priority
CREATE TYPE delivery_priority AS ENUM ('normal', 'express', 'urgent');

-- Notification channels
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

-- Notification status
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- ============================================
-- TABLES
-- ============================================

-- ===== USERS TABLE =====
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    profile_image VARCHAR(500),
    date_of_birth DATE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    lock_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    paypal_account_id VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    preferences JSONB DEFAULT '{"newsletter": true, "smsNotifications": true, "emailNotifications": true, "preferredLanguage": "en", "preferredCurrency": "USD"}',
    address JSONB,
    permissions JSONB,
    assigned_locations JSONB,
    employment JSONB,
    metadata JSONB,
    backup_codes JSONB,
    device_tokens JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$')
);

-- ===== USER ADDRESSES TABLE =====
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'home',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'Kenya',
    is_default BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    place_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== USER PAYMENT METHODS TABLE =====
CREATE TABLE user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type payment_method NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    last4 VARCHAR(4),
    card_brand VARCHAR(20),
    expiry_month INTEGER,
    expiry_year INTEGER,
    stripe_payment_method_id VARCHAR(255),
    paypal_email VARCHAR(255),
    mpesa_number VARCHAR(20),
    billing_address_id UUID REFERENCES user_addresses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== VEHICLES TABLE =====
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    category vehicle_category NOT NULL,
    vin VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20),
    
    -- Pricing
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2),
    monthly_rate DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2) NOT NULL,
    insurance_rate DECIMAL(10, 2) DEFAULT 0,
    
    -- Specifications
    engine VARCHAR(100),
    power VARCHAR(50),
    acceleration VARCHAR(20),
    top_speed VARCHAR(20),
    transmission transmission_type,
    drivetrain drivetrain_type,
    fuel_type fuel_type,
    fuel_economy VARCHAR(20),
    seating_capacity INTEGER,
    doors INTEGER,
    
    -- Features (array of strings)
    features TEXT[],
    
    -- Colors
    colors JSONB,
    
    -- Images
    main_image VARCHAR(500) NOT NULL,
    gallery_images TEXT[],
    interior_images TEXT[],
    
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    location VARCHAR(50) NOT NULL,
    current_mileage INTEGER,
    last_service_date TIMESTAMP,
    next_service_due TIMESTAMP,
    service_history JSONB,
    
    -- Ratings
    average_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Metadata
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    CONSTRAINT positive_rates CHECK (daily_rate > 0 AND deposit_amount > 0)
);

-- ===== VEHICLE_AVAILABILITY TABLE =====
CREATE TABLE vehicle_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    booking_id UUID,
    is_blocked BOOLEAN DEFAULT FALSE,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ===== SERVICES TABLE =====
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type service_type NOT NULL,
    description_short TEXT NOT NULL,
    description_long TEXT,
    icon VARCHAR(50),
    image VARCHAR(500),
    gallery TEXT[],
    features TEXT[],
    
    -- Pricing
    price_type VARCHAR(20) DEFAULT 'fixed',
    price DECIMAL(10, 2),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    deposit_amount DECIMAL(10, 2),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Duration
    min_duration INTEGER,
    max_duration INTEGER,
    duration_unit VARCHAR(10) DEFAULT 'hours',
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    available_locations TEXT[],
    time_slots TEXT[],
    
    -- Requirements
    requirements TEXT[],
    min_age INTEGER,
    max_age INTEGER,
    
    -- Addons
    addons JSONB,
    
    -- FAQs
    faqs JSONB,
    
    -- Metadata
    is_popular BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== LOCATIONS TABLE =====
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(20) DEFAULT 'showroom',
    address JSONB NOT NULL,
    contact JSONB,
    hours JSONB,
    services TEXT[],
    facilities TEXT[],
    staff JSONB,
    capacity JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_main_hub BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== MAINTENANCE TABLE =====
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'normal',
    schedule JSONB,
    service_provider JSONB,
    technician JSONB,
    description TEXT NOT NULL,
    diagnosis TEXT,
    findings TEXT[],
    work_performed JSONB,
    parts JSONB,
    costs JSONB,
    invoices JSONB,
    warranty JSONB,
    photos JSONB,
    documents JSONB,
    notes JSONB,
    next_maintenance JSONB,
    completion_report JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== BOOKINGS TABLE =====
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    service_id UUID REFERENCES services(id),
    service_type service_type NOT NULL,
    status booking_status DEFAULT 'pending',
    
    -- Dates
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    pickup_time VARCHAR(10),
    dropoff_time VARCHAR(10),
    actual_pickup TIMESTAMP,
    actual_dropoff TIMESTAMP,
    
    -- Locations
    pickup_location_type VARCHAR(20),
    pickup_location_name VARCHAR(100),
    pickup_address JSONB,
    pickup_coordinates JSONB,
    dropoff_location_type VARCHAR(20),
    dropoff_location_name VARCHAR(100),
    dropoff_address JSONB,
    dropoff_coordinates JSONB,
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    extras_price DECIMAL(10, 2) DEFAULT 0,
    insurance_price DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    discount_code VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Extras (JSON for flexibility)
    extras JSONB,
    
    -- Customer info (for guest bookings)
    customer_first_name VARCHAR(50),
    customer_last_name VARCHAR(50),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Driver info
    driver_license_number VARCHAR(50),
    driver_license_state VARCHAR(20),
    driver_license_expiry DATE,
    
    -- Special requests
    special_requests TEXT,
    
    -- Metadata
    special_requests TEXT,
    notes JSONB,
    timeline JSONB,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancellation_fee DECIMAL(10, 2),
    refunded BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_booking_dates CHECK (end_date > start_date)
);

-- ===== PAYMENTS TABLE =====
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    gateway VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- Payment details
    card_last4 VARCHAR(4),
    card_brand VARCHAR(20),
    paypal_email VARCHAR(255),
    mpesa_number VARCHAR(20),
    mpesa_receipt VARCHAR(50),
    
    -- Billing details
    billing_first_name VARCHAR(50),
    billing_last_name VARCHAR(50),
    billing_email VARCHAR(255),
    billing_phone VARCHAR(20),
    billing_address JSONB,
    
    -- Refunds
    refunds JSONB,
    
    -- Metadata
    metadata JSONB,
    error_message TEXT,
    
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== DELIVERIES TABLE =====
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number VARCHAR(20) UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    status delivery_status DEFAULT 'pending',
    priority delivery_priority DEFAULT 'normal',
    
    -- Schedule
    requested_pickup_date DATE,
    requested_pickup_time VARCHAR(10),
    requested_dropoff_date DATE,
    requested_dropoff_time VARCHAR(10),
    estimated_pickup TIMESTAMP,
    estimated_dropoff TIMESTAMP,
    actual_pickup TIMESTAMP,
    actual_dropoff TIMESTAMP,
    
    -- Locations
    pickup_type VARCHAR(20),
    pickup_name VARCHAR(100),
    pickup_address JSONB,
    pickup_coordinates JSONB,
    pickup_contact JSONB,
    pickup_instructions TEXT,
    
    dropoff_type VARCHAR(20),
    dropoff_name VARCHAR(100),
    dropoff_address JSONB,
    dropoff_coordinates JSONB,
    dropoff_contact JSONB,
    dropoff_instructions TEXT,
    
    -- Driver
    driver_id UUID REFERENCES users(id),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_photo VARCHAR(500),
    
    -- Tracking
    current_location JSONB,
    last_location_update TIMESTAMP,
    route JSONB,
    estimated_distance DECIMAL(10, 2),
    actual_distance DECIMAL(10, 2),
    estimated_duration INTEGER,
    actual_duration INTEGER,
    
    -- Pricing
    base_fee DECIMAL(10, 2),
    distance_fee DECIMAL(10, 2),
    surge_fee DECIMAL(10, 2),
    toll_fee DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    
    -- Communication
    customer_notifications JSONB,
    
    -- Issues
    issues JSONB,
    
    -- Rating
    rating_score INTEGER,
    rating_feedback TEXT,
    rating_categories JSONB,
    rated_at TIMESTAMP,
    
    -- Timeline
    timeline JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== REVIEWS TABLE =====
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    vehicle_id UUID REFERENCES vehicles(id),
    service_id UUID REFERENCES services(id),
    rating INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    pros TEXT[],
    cons TEXT[],
    images TEXT[],
    
    -- Category ratings
    cleanliness_rating INTEGER,
    service_rating INTEGER,
    value_rating INTEGER,
    communication_rating INTEGER,
    condition_rating INTEGER,
    
    would_recommend BOOLEAN DEFAULT TRUE,
    would_rent_again BOOLEAN DEFAULT TRUE,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    helpful_users UUID[],
    
    -- Response
    response_content TEXT,
    response_by UUID REFERENCES users(id),
    response_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

-- ===== NOTIFICATIONS TABLE =====
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels notification_channel[],
    status notification_status DEFAULT 'pending',
    read_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Delivery tracking
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt TIMESTAMP,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== AUDIT_LOGS TABLE =====
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    duration INTEGER,
    request_method VARCHAR(10),
    request_url TEXT,
    request_params JSONB,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== SYSTEM_SETTINGS TABLE =====
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    validation JSONB,
    default_value JSONB,
    group_name VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== SESSIONS TABLE =====
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== WISHLIST TABLE =====
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_vehicle UNIQUE (user_id, vehicle_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Vehicles indexes
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_location ON vehicles(location);
CREATE INDEX idx_vehicles_is_available ON vehicles(is_available);
CREATE INDEX idx_vehicles_featured ON vehicles(is_featured);
CREATE INDEX idx_vehicles_rating ON vehicles(average_rating DESC);
CREATE INDEX idx_vehicles_price ON vehicles(daily_rate);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Deliveries indexes
CREATE INDEX idx_deliveries_booking_id ON deliveries(booking_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Wishlist indexes
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_vehicle_id ON wishlist(vehicle_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix VARCHAR(2);
    month_prefix VARCHAR(2);
    day_prefix VARCHAR(2);
    sequence_num INTEGER;
BEGIN
    year_prefix = TO_CHAR(NEW.created_at, 'YY');
    month_prefix = TO_CHAR(NEW.created_at, 'MM');
    day_prefix = TO_CHAR(NEW.created_at, 'DD');
    
    SELECT COUNT(*) + 1 INTO sequence_num FROM bookings 
    WHERE DATE(created_at) = DATE(NEW.created_at);
    
    NEW.booking_number = 'BK' || year_prefix || month_prefix || day_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

-- Generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix VARCHAR(2);
    month_prefix VARCHAR(2);
    day_prefix VARCHAR(2);
    sequence_num INTEGER;
BEGIN
    year_prefix = TO_CHAR(NEW.created_at, 'YY');
    month_prefix = TO_CHAR(NEW.created_at, 'MM');
    day_prefix = TO_CHAR(NEW.created_at, 'DD');
    
    SELECT COUNT(*) + 1 INTO sequence_num FROM payments 
    WHERE DATE(created_at) = DATE(NEW.created_at);
    
    NEW.payment_number = 'PAY' || year_prefix || month_prefix || day_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_payment_number();

-- Generate delivery number
CREATE OR REPLACE FUNCTION generate_delivery_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix VARCHAR(2);
    month_prefix VARCHAR(2);
    day_prefix VARCHAR(2);
    sequence_num INTEGER;
BEGIN
    year_prefix = TO_CHAR(NEW.created_at, 'YY');
    month_prefix = TO_CHAR(NEW.created_at, 'MM');
    day_prefix = TO_CHAR(NEW.created_at, 'DD');
    
    SELECT COUNT(*) + 1 INTO sequence_num FROM deliveries 
    WHERE DATE(created_at) = DATE(NEW.created_at);
    
    NEW.delivery_number = 'DEL' || year_prefix || month_prefix || day_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_delivery_number
    BEFORE INSERT ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION generate_delivery_number();

-- Update vehicle rating on review insert/update
CREATE OR REPLACE FUNCTION update_vehicle_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vehicles SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE vehicle_id = NEW.vehicle_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE vehicle_id = NEW.vehicle_id AND status = 'approved'
        )
    WHERE id = NEW.vehicle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.vehicle_id IS NOT NULL AND NEW.status = 'approved')
    EXECUTE FUNCTION update_vehicle_rating();

-- Update service rating on review insert/update
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE service_id = NEW.service_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE service_id = NEW.service_id AND status = 'approved'
        )
    WHERE id = NEW.service_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.service_id IS NOT NULL AND NEW.status = 'approved')
    EXECUTE FUNCTION update_service_rating();

-- ============================================
-- VIEWS
-- ============================================

-- User summary view
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.role,
    u.is_active,
    u.created_at,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
    COALESCE(SUM(p.amount), 0) as total_spent,
    MAX(b.created_at) as last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
GROUP BY u.id;

-- Vehicle summary view
CREATE VIEW vehicle_summary AS
SELECT 
    v.id,
    v.name,
    v.make,
    v.model,
    v.year,
    v.category,
    v.daily_rate,
    v.is_available,
    v.location,
    v.average_rating,
    v.review_count,
    v.booking_count,
    v.view_count,
    COUNT(DISTINCT b.id) as current_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
    COALESCE(SUM(p.amount), 0) as revenue_generated
FROM vehicles v
LEFT JOIN bookings b ON v.id = b.vehicle_id
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
GROUP BY v.id;

-- Booking details view
CREATE VIEW booking_details AS
SELECT 
    b.id,
    b.booking_number,
    b.status,
    b.start_date,
    b.end_date,
    b.total_amount,
    b.created_at,
    u.id as user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    v.id as vehicle_id,
    v.name as vehicle_name,
    v.make || ' ' || v.model as vehicle_model,
    s.id as service_id,
    s.name as service_name,
    p.id as payment_id,
    p.status as payment_status,
    p.amount as payment_amount,
    d.id as delivery_id,
    d.status as delivery_status
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN payments p ON b.id = p.booking_id
LEFT JOIN deliveries d ON b.id = d.booking_id;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get revenue by period
CREATE OR REPLACE FUNCTION get_revenue_by_period(
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    period_type VARCHAR(10) DEFAULT 'day'
)
RETURNS TABLE(
    period TEXT,
    total DECIMAL,
    count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE period_type
            WHEN 'hour' THEN TO_CHAR(created_at, 'YYYY-MM-DD HH24:00')
            WHEN 'day' THEN TO_CHAR(created_at, 'YYYY-MM-DD')
            WHEN 'week' THEN TO_CHAR(created_at, 'YYYY-WW')
            WHEN 'month' THEN TO_CHAR(created_at, 'YYYY-MM')
            WHEN 'year' THEN TO_CHAR(created_at, 'YYYY')
        END as period,
        SUM(amount) as total,
        COUNT(*) as count
    FROM payments
    WHERE created_at BETWEEN start_date AND end_date
        AND status = 'completed'
    GROUP BY period
    ORDER BY period;
END;
$$ LANGUAGE plpgsql;

-- Get popular vehicles
CREATE OR REPLACE FUNCTION get_popular_vehicles(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    vehicle_id UUID,
    vehicle_name VARCHAR,
    make VARCHAR,
    model VARCHAR,
    booking_count INTEGER,
    revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.name,
        v.make,
        v.model,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(p.amount), 0) as revenue
    FROM vehicles v
    LEFT JOIN bookings b ON v.id = b.vehicle_id AND b.status = 'completed'
    LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
    GROUP BY v.id
    ORDER BY booking_count DESC, revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Search vehicles
CREATE OR REPLACE FUNCTION search_vehicles(
    search_query TEXT,
    category_filter vehicle_category DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    location_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    vehicle_id UUID,
    vehicle_name VARCHAR,
    make VARCHAR,
    model VARCHAR,
    year INTEGER,
    category vehicle_category,
    daily_rate DECIMAL,
    average_rating DECIMAL,
    location VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.name,
        v.make,
        v.model,
        v.year,
        v.category,
        v.daily_rate,
        v.average_rating,
        v.location
    FROM vehicles v
    WHERE 
        (search_query IS NULL OR 
         v.name ILIKE '%' || search_query || '%' OR
         v.make ILIKE '%' || search_query || '%' OR
         v.model ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR v.category = category_filter)
        AND (min_price IS NULL OR v.daily_rate >= min_price)
        AND (max_price IS NULL OR v.daily_rate <= max_price)
        AND (location_filter IS NULL OR v.location = location_filter)
        AND v.is_available = TRUE
    ORDER BY v.average_rating DESC, v.daily_rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANTS (for production)
-- ============================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO carease_app;
-- GRANT KenyaGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO carease_app;
