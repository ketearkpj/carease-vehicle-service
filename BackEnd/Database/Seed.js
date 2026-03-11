// ===== src/config/seed.js =====
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./Connection');
const { logger } = require('../src/Middleware/Logger.md.js');

/**
 * Database seeding script
 * Populates database with initial data for development and testing
 */
class DatabaseSeeder {
  constructor() {
    this.client = null;
  }

  /**
   * Run all seeders
   */
  async seed() {
    try {
      this.client = await db.getClient();
      
      logger.info('🌱 Starting database seeding...');

      await this.seedUsers();
      await this.seedVehicles();
      await this.seedServices();
      await this.seedBookings();
      await this.seedPayments();
      await this.seedDeliveries();
      await this.seedReviews();
      await this.seedSystemSettings();

      logger.info('✅ Database seeding completed successfully');

    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      if (this.client) {
        this.client.release();
      }
    }
  }

  /**
   * Seed users table
   */
  async seedUsers() {
    logger.info('Seeding users...');

    const passwordHash = await bcrypt.hash('Password123!', 12);

    const users = [
      {
        id: uuidv4(),
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@carease.com',
        phone: '+1234567890',
        password_hash: passwordHash,
        role: 'super_admin',
        is_email_verified: true,
        is_phone_verified: true,
        is_active: true,
        preferences: JSON.stringify({
          newsletter: true,
          smsNotifications: true,
          emailNotifications: true,
          preferredLanguage: 'en',
          preferredCurrency: 'USD'
        })
      },
      {
        id: uuidv4(),
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1987654321',
        password_hash: passwordHash,
        role: 'customer',
        is_email_verified: true,
        is_phone_verified: true,
        is_active: true,
        preferences: JSON.stringify({
          newsletter: true,
          smsNotifications: true,
          emailNotifications: true,
          preferredLanguage: 'en',
          preferredCurrency: 'USD'
        })
      },
      {
        id: uuidv4(),
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1122334455',
        password_hash: passwordHash,
        role: 'customer',
        is_email_verified: true,
        is_phone_verified: true,
        is_active: true,
        preferences: JSON.stringify({
          newsletter: false,
          smsNotifications: true,
          emailNotifications: true,
          preferredLanguage: 'en',
          preferredCurrency: 'USD'
        })
      },
      {
        id: uuidv4(),
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert.johnson@example.com',
        phone: '+1555666777',
        password_hash: passwordHash,
        role: 'provider',
        is_email_verified: true,
        is_phone_verified: true,
        is_active: true,
        preferences: JSON.stringify({
          newsletter: true,
          smsNotifications: true,
          emailNotifications: true,
          preferredLanguage: 'en',
          preferredCurrency: 'USD'
        })
      }
    ];

    for (const user of users) {
      await this.client.query(
        `INSERT INTO users (
          id, first_name, last_name, email, phone, password_hash, role,
          is_email_verified, is_phone_verified, is_active, preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO NOTHING`,
        [
          user.id, user.first_name, user.last_name, user.email, user.phone,
          user.password_hash, user.role, user.is_email_verified,
          user.is_phone_verified, user.is_active, user.preferences
        ]
      );
    }

    logger.info(`✅ Seeded ${users.length} users`);
  }

  /**
   * Seed vehicles table
   */
  async seedVehicles() {
    logger.info('Seeding vehicles...');

    const vehicles = [
      {
        id: uuidv4(),
        name: 'Lamborghini Huracán EVO',
        make: 'Lamborghini',
        model: 'Huracán EVO',
        year: 2023,
        category: 'supercar',
        daily_rate: 1299.00,
        deposit_amount: 5000.00,
        insurance_rate: 150.00,
        main_image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a',
        gallery_images: ['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a'],
        features: ['carbon-ceramic-brakes', 'lift-system', 'apple-carplay'],
        location: 'beverly-hills',
        is_available: true,
        is_featured: true,
        transmission: 'dual-clutch',
        drivetrain: 'AWD',
        fuel_type: 'petrol',
        seating_capacity: 2,
        doors: 2,
        colors: JSON.stringify([
          { name: 'Verde Mantis', code: '#00FF00', available: true },
          { name: 'Giallo Orion', code: '#FFFF00', available: true }
        ])
      },
      {
        id: uuidv4(),
        name: 'Rolls-Royce Ghost',
        make: 'Rolls-Royce',
        model: 'Ghost',
        year: 2023,
        category: 'luxury',
        daily_rate: 1899.00,
        deposit_amount: 7000.00,
        insurance_rate: 200.00,
        main_image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4',
        gallery_images: ['https://images.unsplash.com/photo-1631295868223-63265b40d9e4'],
        features: ['starlight-headliner', 'massage-seats', 'champagne-cooler'],
        location: 'beverly-hills',
        is_available: true,
        is_featured: true,
        transmission: 'automatic',
        drivetrain: 'AWD',
        fuel_type: 'petrol',
        seating_capacity: 5,
        doors: 4,
        colors: JSON.stringify([
          { name: 'Arctic White', code: '#FFFFFF', available: true },
          { name: 'Black', code: '#000000', available: true }
        ])
      },
      {
        id: uuidv4(),
        name: 'Porsche 911 Turbo S',
        make: 'Porsche',
        model: '911 Turbo S',
        year: 2023,
        category: 'sports',
        daily_rate: 899.00,
        deposit_amount: 3500.00,
        insurance_rate: 120.00,
        main_image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e',
        gallery_images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e'],
        features: ['sport-chrono', 'pdk-transmission', 'sport-exhaust'],
        location: 'miami',
        is_available: true,
        is_featured: true,
        transmission: 'dual-clutch',
        drivetrain: 'AWD',
        fuel_type: 'petrol',
        seating_capacity: 4,
        doors: 2,
        colors: JSON.stringify([
          { name: 'GT Silver', code: '#C0C0C0', available: true },
          { name: 'Guards Red', code: '#FF0000', available: true }
        ])
      },
      {
        id: uuidv4(),
        name: 'Ferrari F8 Tributo',
        make: 'Ferrari',
        model: 'F8 Tributo',
        year: 2022,
        category: 'supercar',
        daily_rate: 1399.00,
        deposit_amount: 5500.00,
        insurance_rate: 160.00,
        main_image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333',
        gallery_images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333'],
        features: ['carbon-fiber-package', 'racing-seats', 'telemetry-system'],
        location: 'miami',
        is_available: true,
        is_featured: false,
        transmission: 'dual-clutch',
        drivetrain: 'RWD',
        fuel_type: 'petrol',
        seating_capacity: 2,
        doors: 2,
        colors: JSON.stringify([
          { name: 'Rosso Corsa', code: '#FF0000', available: true },
          { name: 'Giallo Modena', code: '#FFFF00', available: true }
        ])
      },
      {
        id: uuidv4(),
        name: 'Bentley Continental GT',
        make: 'Bentley',
        model: 'Continental GT',
        year: 2022,
        category: 'grand_tourer',
        daily_rate: 1099.00,
        deposit_amount: 4000.00,
        insurance_rate: 140.00,
        main_image: 'https://images.unsplash.com/photo-1622194996008-2c22880c0b7b',
        gallery_images: ['https://images.unsplash.com/photo-1622194996008-2c22880c0b7b'],
        features: ['naim-audio', 'rotating-display', 'mulliner-package'],
        location: 'manhattan',
        is_available: true,
        is_featured: true,
        transmission: 'dual-clutch',
        drivetrain: 'AWD',
        fuel_type: 'petrol',
        seating_capacity: 4,
        doors: 2,
        colors: JSON.stringify([
          { name: 'Beluga Black', code: '#000000', available: true },
          { name: 'Light Gazelle', code: '#F5F5DC', available: true }
        ])
      },
      {
        id: uuidv4(),
        name: 'Range Rover Autobiography',
        make: 'Range Rover',
        model: 'Autobiography',
        year: 2023,
        category: 'suv',
        daily_rate: 699.00,
        deposit_amount: 2500.00,
        insurance_rate: 90.00,
        main_image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
        gallery_images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6'],
        features: ['executive-seats', 'meridian-audio', 'off-road-package'],
        location: 'manhattan',
        is_available: true,
        is_featured: false,
        transmission: 'automatic',
        drivetrain: 'AWD',
        fuel_type: 'diesel',
        seating_capacity: 5,
        doors: 5,
        colors: JSON.stringify([
          { name: 'Santorini Black', code: '#000000', available: true },
          { name: 'Fuji White', code: '#FFFFFF', available: true }
        ])
      }
    ];

    for (const vehicle of vehicles) {
      await this.client.query(
        `INSERT INTO vehicles (
          id, name, make, model, year, category, daily_rate, deposit_amount,
          insurance_rate, main_image, gallery_images, features, location,
          is_available, is_featured, transmission, drivetrain, fuel_type,
          seating_capacity, doors, colors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT DO NOTHING`,
        [
          vehicle.id, vehicle.name, vehicle.make, vehicle.model, vehicle.year,
          vehicle.category, vehicle.daily_rate, vehicle.deposit_amount,
          vehicle.insurance_rate, vehicle.main_image, vehicle.gallery_images,
          vehicle.features, vehicle.location, vehicle.is_available,
          vehicle.is_featured, vehicle.transmission, vehicle.drivetrain,
          vehicle.fuel_type, vehicle.seating_capacity, vehicle.doors,
          vehicle.colors
        ]
      );
    }

    logger.info(`✅ Seeded ${vehicles.length} vehicles`);
  }

  /**
   * Seed services table
   */
  async seedServices() {
    logger.info('Seeding services...');

    const services = [
      {
        id: uuidv4(),
        name: 'Luxury Rentals',
        type: 'rental',
        description_short: 'Experience the finest collection of exotic and luxury vehicles.',
        description_long: 'Our luxury rental service offers an unparalleled driving experience. Each vehicle in our fleet is meticulously maintained and less than 2 years old.',
        icon: '🚗',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
        features: ['Daily/Weekly Rates', 'Insurance Included', 'Free Delivery', '24/7 Support'],
        price_type: 'range',
        min_price: 299,
        max_price: 2999,
        currency: 'USD',
        deposit_amount: 500,
        is_available: true,
        available_locations: ['beverly-hills', 'miami', 'manhattan'],
        requirements: ['valid-license', 'minimum-age', 'credit-card'],
        min_age: 25,
        is_popular: true,
        is_featured: true
      },
      {
        id: uuidv4(),
        name: 'Car Wash & Detailing',
        type: 'car_wash',
        description_short: 'Professional detailing and ceramic coating services.',
        description_long: 'Our premium car wash and detailing services go beyond the ordinary. Using only the finest products and techniques.',
        icon: '🧼',
        image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f',
        features: ['Express Wash', 'Premium Detail', 'Ceramic Coating', 'Interior Cleaning'],
        price_type: 'range',
        min_price: 29,
        max_price: 399,
        currency: 'USD',
        is_available: true,
        available_locations: ['beverly-hills', 'miami', 'manhattan'],
        time_slots: ['9:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        is_popular: true,
        is_featured: true
      },
      {
        id: uuidv4(),
        name: 'Repairs & Maintenance',
        type: 'repair',
        description_short: 'Expert mechanical services for all luxury vehicles.',
        description_long: 'Our state-of-the-art service center is equipped to handle all makes and models of luxury vehicles.',
        icon: '🔧',
        image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f',
        features: ['Diagnostics', 'Performance Tuning', 'Factory Repairs', 'Genuine Parts'],
        price_type: 'range',
        min_price: 89,
        max_price: 2500,
        currency: 'USD',
        is_available: true,
        available_locations: ['beverly-hills', 'manhattan'],
        min_age: 18,
        is_featured: true
      },
      {
        id: uuidv4(),
        name: 'Concierge Service',
        type: 'concierge',
        description_short: 'Personalized automotive concierge for all your vehicle needs.',
        description_long: 'Our white-glove concierge service handles everything from vehicle registration to maintenance scheduling.',
        icon: '👔',
        image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df',
        features: ['Registration', 'Maintenance Scheduling', 'Insurance Management', 'Vehicle Sourcing'],
        price_type: 'custom',
        is_available: true,
        available_locations: ['beverly-hills', 'miami', 'manhattan'],
        is_popular: false,
        is_featured: true
      },
      {
        id: uuidv4(),
        name: 'Vehicle Storage',
        type: 'storage',
        description_short: 'Secure, climate-controlled storage for your luxury vehicles.',
        description_long: 'Our state-of-the-art storage facility offers the ultimate protection for your prized possessions.',
        icon: '🏢',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d',
        features: ['Climate Controlled', '24/7 Security', 'Regular Maintenance', 'Vehicle Transport'],
        price_type: 'range',
        min_price: 299,
        max_price: 899,
        currency: 'USD',
        duration_unit: 'months',
        is_available: true,
        available_locations: ['beverly-hills', 'miami'],
        is_featured: false
      }
    ];

    for (const service of services) {
      await this.client.query(
        `INSERT INTO services (
          id, name, type, description_short, description_long, icon, image,
          features, price_type, min_price, max_price, currency, deposit_amount,
          is_available, available_locations, time_slots, requirements, min_age,
          is_popular, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT DO NOTHING`,
        [
          service.id, service.name, service.type, service.description_short,
          service.description_long || null, service.icon, service.image,
          service.features, service.price_type, service.min_price || null,
          service.max_price || null, service.currency, service.deposit_amount || null,
          service.is_available, service.available_locations,
          service.time_slots || null, service.requirements || null,
          service.min_age || null, service.is_popular, service.is_featured
        ]
      );
    }

    logger.info(`✅ Seeded ${services.length} services`);
  }

  /**
   * Seed bookings table
   */
  async seedBookings() {
    logger.info('Seeding bookings...');

    // Get user IDs
    const userResult = await this.client.query(
      'SELECT id FROM users WHERE email = $1',
      ['john.doe@example.com']
    );
    const userId = userResult.rows[0]?.id;

    // Get vehicle IDs
    const vehicleResult = await this.client.query(
      'SELECT id FROM vehicles LIMIT 3'
    );
    const vehicleIds = vehicleResult.rows.map(r => r.id);

    if (!userId || vehicleIds.length === 0) {
      logger.warn('Skipping bookings: missing users or vehicles');
      return;
    }

    const bookings = [
      {
        user_id: userId,
        vehicle_id: vehicleIds[0],
        service_type: 'rental',
        status: 'confirmed',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        pickup_location_type: 'showroom',
        pickup_location_name: 'Beverly Hills Showroom',
        pickup_address: JSON.stringify({
          street: '123 Luxury Lane',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210'
        }),
        pickup_coordinates: JSON.stringify({ lat: 34.0736, lng: -118.4004 }),
        base_price: 1299.00 * 7,
        tax_amount: 909.30,
        total_amount: (1299.00 * 7) * 1.1,
        currency: 'USD',
        customer_first_name: 'John',
        customer_last_name: 'Doe',
        customer_email: 'john.doe@example.com',
        customer_phone: '+1987654321'
      },
      {
        user_id: userId,
        vehicle_id: vehicleIds[1],
        service_type: 'rental',
        status: 'pending',
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
        pickup_location_type: 'showroom',
        pickup_location_name: 'Miami Showroom',
        pickup_address: JSON.stringify({
          street: '456 Ocean Drive',
          city: 'Miami Beach',
          state: 'FL',
          zipCode: '33139'
        }),
        pickup_coordinates: JSON.stringify({ lat: 25.7907, lng: -80.1300 }),
        base_price: 899.00 * 7,
        tax_amount: 629.30,
        total_amount: (899.00 * 7) * 1.1,
        currency: 'USD',
        customer_first_name: 'John',
        customer_last_name: 'Doe',
        customer_email: 'john.doe@example.com',
        customer_phone: '+1987654321'
      }
    ];

    for (const booking of bookings) {
      await this.client.query(
        `INSERT INTO bookings (
          user_id, vehicle_id, service_type, status, start_date, end_date,
          pickup_location_type, pickup_location_name, pickup_address,
          pickup_coordinates, base_price, tax_amount, total_amount, currency,
          customer_first_name, customer_last_name, customer_email, customer_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          booking.user_id, booking.vehicle_id, booking.service_type,
          booking.status, booking.start_date, booking.end_date,
          booking.pickup_location_type, booking.pickup_location_name,
          booking.pickup_address, booking.pickup_coordinates,
          booking.base_price, booking.tax_amount, booking.total_amount,
          booking.currency, booking.customer_first_name,
          booking.customer_last_name, booking.customer_email,
          booking.customer_phone
        ]
      );
    }

    logger.info(`✅ Seeded ${bookings.length} bookings`);
  }

  /**
   * Seed payments table
   */
  async seedPayments() {
    logger.info('Seeding payments...');

    // Get user ID
    const userResult = await this.client.query(
      'SELECT id FROM users WHERE email = $1',
      ['john.doe@example.com']
    );
    const userId = userResult.rows[0]?.id;

    // Get booking ID
    const bookingResult = await this.client.query(
      'SELECT id FROM bookings LIMIT 1'
    );
    const bookingId = bookingResult.rows[0]?.id;

    if (!userId || !bookingId) {
      logger.warn('Skipping payments: missing users or bookings');
      return;
    }

    const payments = [
      {
        user_id: userId,
        booking_id: bookingId,
        amount: 9999.30,
        method: 'card',
        status: 'completed',
        gateway: 'stripe',
        transaction_id: 'pi_' + uuidv4().replace(/-/g, ''),
        card_last4: '4242',
        card_brand: 'Visa',
        billing_first_name: 'John',
        billing_last_name: 'Doe',
        billing_email: 'john.doe@example.com',
        billing_address: JSON.stringify({
          line1: '123 Main St',
          city: 'Beverly Hills',
          state: 'CA',
          postalCode: '90210'
        }),
        processed_at: new Date()
      }
    ];

    for (const payment of payments) {
      await this.client.query(
        `INSERT INTO payments (
          user_id, booking_id, amount, method, status, gateway, transaction_id,
          card_last4, card_brand, billing_first_name, billing_last_name,
          billing_email, billing_address, processed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          payment.user_id, payment.booking_id, payment.amount, payment.method,
          payment.status, payment.gateway, payment.transaction_id,
          payment.card_last4, payment.card_brand, payment.billing_first_name,
          payment.billing_last_name, payment.billing_email,
          payment.billing_address, payment.processed_at
        ]
      );
    }

    logger.info(`✅ Seeded ${payments.length} payments`);
  }

  /**
   * Seed deliveries table
   */
  async seedDeliveries() {
    logger.info('Seeding deliveries...');

    // Get user ID
    const userResult = await this.client.query(
      'SELECT id FROM users WHERE email = $1',
      ['john.doe@example.com']
    );
    const userId = userResult.rows[0]?.id;

    // Get booking ID
    const bookingResult = await this.client.query(
      'SELECT id FROM bookings LIMIT 1'
    );
    const bookingId = bookingResult.rows[0]?.id;

    if (!userId || !bookingId) {
      logger.warn('Skipping deliveries: missing users or bookings');
      return;
    }

    const deliveries = [
      {
        booking_id: bookingId,
        user_id: userId,
        type: 'delivery',
        status: 'assigned',
        priority: 'normal',
        requested_pickup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requested_dropoff_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimated_pickup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        estimated_dropoff: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        pickup_type: 'showroom',
        pickup_name: 'Beverly Hills Showroom',
        pickup_address: JSON.stringify({
          street: '123 Luxury Lane',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210'
        }),
        pickup_coordinates: JSON.stringify({ lat: 34.0736, lng: -118.4004 }),
        dropoff_type: 'address',
        dropoff_name: 'Customer Address',
        dropoff_address: JSON.stringify({
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        }),
        dropoff_coordinates: JSON.stringify({ lat: 34.0522, lng: -118.2437 }),
        estimated_distance: 25.5,
        estimated_duration: 45,
        base_fee: 35.00,
        distance_fee: 63.75,
        tax_amount: 9.88,
        total_amount: 108.63,
        timeline: JSON.stringify([
          { status: 'pending', timestamp: new Date() },
          { status: 'assigned', timestamp: new Date() }
        ])
      }
    ];

    for (const delivery of deliveries) {
      await this.client.query(
        `INSERT INTO deliveries (
          booking_id, user_id, type, status, priority,
          requested_pickup_date, requested_dropoff_date,
          estimated_pickup, estimated_dropoff,
          pickup_type, pickup_name, pickup_address, pickup_coordinates,
          dropoff_type, dropoff_name, dropoff_address, dropoff_coordinates,
          estimated_distance, estimated_duration,
          base_fee, distance_fee, tax_amount, total_amount,
          timeline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          delivery.booking_id, delivery.user_id, delivery.type,
          delivery.status, delivery.priority,
          delivery.requested_pickup_date, delivery.requested_dropoff_date,
          delivery.estimated_pickup, delivery.estimated_dropoff,
          delivery.pickup_type, delivery.pickup_name,
          delivery.pickup_address, delivery.pickup_coordinates,
          delivery.dropoff_type, delivery.dropoff_name,
          delivery.dropoff_address, delivery.dropoff_coordinates,
          delivery.estimated_distance, delivery.estimated_duration,
          delivery.base_fee, delivery.distance_fee, delivery.tax_amount,
          delivery.total_amount, delivery.timeline
        ]
      );
    }

    logger.info(`✅ Seeded ${deliveries.length} deliveries`);
  }

  /**
   * Seed reviews table
   */
  async seedReviews() {
    logger.info('Seeding reviews...');

    // Get user ID
    const userResult = await this.client.query(
      'SELECT id FROM users WHERE email = $1',
      ['john.doe@example.com']
    );
    const userId = userResult.rows[0]?.id;

    // Get booking ID
    const bookingResult = await this.client.query(
      'SELECT id FROM bookings WHERE status = $1 LIMIT 1',
      ['completed']
    );
    const bookingId = bookingResult.rows[0]?.id;

    // Get vehicle ID
    const vehicleResult = await this.client.query(
      'SELECT id FROM vehicles LIMIT 1'
    );
    const vehicleId = vehicleResult.rows[0]?.id;

    if (!userId || !bookingId || !vehicleId) {
      logger.warn('Skipping reviews: missing data');
      return;
    }

    const reviews = [
      {
        user_id: userId,
        booking_id: bookingId,
        vehicle_id: vehicleId,
        rating: 5,
        title: 'Amazing Experience!',
        content: 'The Lamborghini was incredible. Everything was perfect from start to finish.',
        pros: ['Fast pickup', 'Clean vehicle', 'Great service'],
        cons: [],
        would_recommend: true,
        would_rent_again: true,
        cleanliness_rating: 5,
        service_rating: 5,
        value_rating: 4,
        communication_rating: 5,
        condition_rating: 5,
        status: 'approved',
        verified: true
      }
    ];

    for (const review of reviews) {
      await this.client.query(
        `INSERT INTO reviews (
          user_id, booking_id, vehicle_id, rating, title, content,
          pros, cons, would_recommend, would_rent_again,
          cleanliness_rating, service_rating, value_rating,
          communication_rating, condition_rating, status, verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          review.user_id, review.booking_id, review.vehicle_id, review.rating,
          review.title, review.content, review.pros, review.cons,
          review.would_recommend, review.would_rent_again,
          review.cleanliness_rating, review.service_rating, review.value_rating,
          review.communication_rating, review.condition_rating,
          review.status, review.verified
        ]
      );
    }

    logger.info(`✅ Seeded ${reviews.length} reviews`);
  }

  /**
   * Seed system settings table
   */
  async seedSystemSettings() {
    logger.info('Seeding system settings...');

    const settings = [
      {
        key: 'tax_rate',
        category: 'general',
        value: JSON.stringify(0.1),
        type: 'number',
        description: 'Default tax rate for all services',
        is_public: true,
        group_name: 'Pricing',
        display_order: 10
      },
      {
        key: 'booking_min_days',
        category: 'booking',
        value: JSON.stringify(1),
        type: 'number',
        description: 'Minimum booking days',
        is_public: true,
        group_name: 'Booking Limits',
        display_order: 20
      },
      {
        key: 'booking_max_days',
        category: 'booking',
        value: JSON.stringify(30),
        type: 'number',
        description: 'Maximum booking days',
        is_public: true,
        group_name: 'Booking Limits',
        display_order: 30
      },
      {
        key: 'cancellation_hours',
        category: 'booking',
        value: JSON.stringify(48),
        type: 'number',
        description: 'Hours before booking for free cancellation',
        is_public: true,
        group_name: 'Cancellation',
        display_order: 40
      },
      {
        key: 'deposit_rate_standard',
        category: 'payment',
        value: JSON.stringify(0.2),
        type: 'number',
        description: 'Standard deposit rate',
        is_public: false,
        group_name: 'Deposits',
        display_order: 50
      },
      {
        key: 'deposit_rate_luxury',
        category: 'payment',
        value: JSON.stringify(0.3),
        type: 'number',
        description: 'Luxury vehicle deposit rate',
        is_public: false,
        group_name: 'Deposits',
        display_order: 60
      },
      {
        key: 'late_fee_daily',
        category: 'booking',
        value: JSON.stringify(50),
        type: 'number',
        description: 'Daily late fee',
        is_public: true,
        group_name: 'Fees',
        display_order: 70
      },
      {
        key: 'business_hours',
        category: 'general',
        value: JSON.stringify({
          monday: { open: '09:00', close: '20:00' },
          tuesday: { open: '09:00', close: '20:00' },
          wednesday: { open: '09:00', close: '20:00' },
          thursday: { open: '09:00', close: '20:00' },
          friday: { open: '09:00', close: '20:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: { open: '11:00', close: '17:00' }
        }),
        type: 'object',
        description: 'Business hours for all locations',
        is_public: true,
        group_name: 'Hours',
        display_order: 80
      },
      {
        key: 'contact_email',
        category: 'general',
        value: JSON.stringify('support@carease.com'),
        type: 'string',
        description: 'Support email address',
        is_public: true,
        group_name: 'Contact',
        display_order: 90
      },
      {
        key: 'contact_phone',
        category: 'general',
        value: JSON.stringify('+1-800-555-0123'),
        type: 'string',
        description: 'Support phone number',
        is_public: true,
        group_name: 'Contact',
        display_order: 100
      },
      {
        key: 'maintenance_mode',
        category: 'system',
        value: JSON.stringify(false),
        type: 'boolean',
        description: 'Enable maintenance mode',
        is_public: false,
        group_name: 'System',
        display_order: 110
      }
    ];

    for (const setting of settings) {
      await this.client.query(
        `INSERT INTO system_settings (
          key, category, value, type, description, is_public,
          group_name, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP`,
        [
          setting.key, setting.category, setting.value, setting.type,
          setting.description, setting.is_public, setting.group_name,
          setting.display_order
        ]
      );
    }

    logger.info(`✅ Seeded ${settings.length} system settings`);
  }
}

module.exports = new DatabaseSeeder();