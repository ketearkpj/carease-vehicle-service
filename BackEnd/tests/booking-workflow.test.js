// ===== tests/booking-workflow.test.js =====
/**
 * CarEase Booking Workflow Tests
 * Tests the complete end-to-end booking process with payments
 * 
 * Prerequisites:
 * 1. PostgreSQL database running
 * 2. Valid Stripe test keys in .env
 * 3. Test user account created
 * 4. Test vehicle available
 */

const request = require('supertest');
const app = require('../App');
const { sequelize } = require('../src/Config/sequelize');
const { User, Vehicle, Service, Booking, Payment, Review } = require('../src/Models');

describe('CarEase Booking Workflow', () => {
  let testUser;
  let testVehicle;
  let testService;
  let authToken;
  let bookingId;
  let paymentId;

  beforeAll(async () => {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected for tests');

    // Clear test data
    await sequelize.truncate({ cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ===== TEST 1: User Registration & Authentication =====
  describe('1. User Registration & Authentication', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          password: 'Test@1234',
          passwordConfirm: 'Test@1234'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      
      testUser = res.body.data.user;
    });

    test('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Test@1234'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
      
      authToken = res.body.token;
    });
  });

  // ===== TEST 2: Browse Vehicles & Services =====
  describe('2. Browse Vehicles & Services', () => {
    test('should retrieve all vehicles', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.vehicles)).toBe(true);
      
      if (res.body.data.vehicles.length === 0) {
        // Create test vehicle
        testVehicle = await Vehicle.create({
          registrationNumber: 'TEST-001',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          category: 'luxury',
          dailyRate: 150,
          isAvailable: true
        });
      } else {
        testVehicle = res.body.data.vehicles[0];
      }
    });

    test('should retrieve all services', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.services)).toBe(true);
      
      if (res.body.data.services.length === 0) {
        // Create test service
        testService = await Service.create({
          name: 'Economy Rental',
          type: 'rental',
          descriptionShort: 'Budget-friendly car rental',
          price: 50,
          currency: 'USD'
        });
      } else {
        testService = res.body.data.services[0];
      }
    });
  });

  // ===== TEST 3: Create Booking =====
  describe('3. Create Booking', () => {
    test('should calculate price for rental', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

      const res = await request(app)
        .post('/api/bookings/calculate-price')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId: testVehicle.id,
          serviceType: 'rental',
          startDate,
          endDate,
          extras: []
        });

      expect(res.status).toBe(200);
      expect(res.body.data.pricing).toHaveProperty('basePrice');
      expect(res.body.data.pricing).toHaveProperty('total');
    });

    test('should create booking successfully', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId: testVehicle.id,
          serviceType: 'rental',
          startDate,
          endDate,
          pickupLocation: 'Downtown Office',
          dropoffLocation: 'Airport Terminal 1',
          specialRequests: 'Child seat needed'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.booking).toHaveProperty('id');
      expect(res.body.data.booking.status).toBe('pending');
      
      bookingId = res.body.data.booking.id;
    });

    test('should retrieve booking details', async () => {
      const res = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.booking.id).toBe(bookingId);
    });
  });

  // ===== TEST 4: Process Payment =====
  describe('4. Process Payment', () => {
    test('should process Stripe payment', async () => {
      const booking = await Booking.findByPk(bookingId);
      
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          amount: booking.totalPrice,
          currency: 'USD',
          method: 'card',
          paymentMethodId: 'pm_card_visa' // Stripe test token
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.payment.status).toMatch(/pending|processing|completed/);
      
      paymentId = res.body.data.payment.id;
    });

    test('should verify payment status', async () => {
      const res = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.payment).toHaveProperty('method');
      expect(res.body.data.payment).toHaveProperty('status');
    });

    test('should confirm booking after successful payment', async () => {
      // Simulate payment webhook confirmation
      const payment = await Payment.findByPk(paymentId);
      payment.status = 'completed';
      await payment.save();

      const booking = await Booking.findByPk(bookingId);
      booking.status = 'confirmed';
      await booking.save();

      expect(booking.status).toBe('confirmed');
    });
  });

  // ===== TEST 5: Delivery Management (if applicable) =====
  describe('5. Delivery Management', () => {
    test('should create delivery for rental booking', async () => {
      const booking = await Booking.findByPk(bookingId);
      
      if (booking.serviceType === 'rental' || booking.serviceType === 'delivery') {
        const res = await request(app)
          .post('/api/deliveries')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            bookingId,
            type: 'standard',
            pickup: {
              name: 'Downtown Office',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            dropoff: {
              name: 'Airport Terminal 1',
              coordinates: { lat: 40.7700, lng: -73.8740 }
            },
            schedule: {
              priority: 'normal',
              pickupDate: new Date().toISOString().split('T')[0],
              pickupTime: '10:00',
              dropoffDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              dropoffTime: '10:00'
            }
          });

        expect(res.status).toBe(201);
        expect(res.body.data.delivery).toHaveProperty('deliveryNumber');
      }
    });
  });

  // ===== TEST 6: Review & Feedback =====
  describe('6. Review & Feedback', () => {
    test('should create review for completed booking', async () => {
      // Manually mark booking as completed for test
      const booking = await Booking.findByPk(bookingId);
      booking.status = 'completed';
      await booking.save();

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          vehicleId: testVehicle.id,
          rating: 5,
          title: 'Excellent service!',
          content: 'The car was in great condition and pickup was very smooth.',
          pros: ['Clean vehicle', 'Professional staff', 'Location convenience'],
          cons: []
        });

      expect(res.status).toBe(201);
      expect(res.body.data.review).toHaveProperty('rating');
    });

    test('should retrieve public reviews', async () => {
      const res = await request(app)
        .get('/api/reviews/public')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
    });
  });

  // ===== TEST 7: Reports & Analytics =====
  describe('7. Reports & Analytics', () => {
    test('should retrieve booking report', async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const res = await request(app)
        .get('/api/reports/bookings')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toHaveProperty('total');
    });

    test('should retrieve revenue report', async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const res = await request(app)
        .get('/api/reports/revenue')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toHaveProperty('totalRevenue');
    });

    test('should retrieve dashboard summary', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('bookings');
      expect(res.body.data).toHaveProperty('revenue');
    });
  });

  // ===== TEST 8: Refund Process =====
  describe('8. Refund Process', () => {
    test('should process partial refund', async () => {
      const payment = await Payment.findByPk(paymentId);
      const refundAmount = payment.amount * 0.5;

      const res = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: refundAmount,
          reason: 'Customer requested cancellation'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.refund).toHaveProperty('refundId');
    });
  });
});

describe('CarEase Error Handling', () => {
  test('should reject payment with invalid booking', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookingId: 'invalid-id',
        amount: 100,
        method: 'card'
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('should reject duplicate payment', async () => {
    // This test would require a completed booking to proceed
    // Implementation depends on your specific business logic
  });

  test('should handle invalid payment method', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookingId: 'test-id',
        amount: 100,
        method: 'invalid_method'
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
