// ===== src/utils/validators.js =====
const Joi = require('joi');

/**
 * Centralized validation schemas using Joi
 * All validation rules in one place for consistency
 */
const validators = {
  // ===== AUTH VALIDATION =====
  auth: {
    register: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
      password: Joi.string().min(8).required(),
      passwordConfirm: Joi.string().valid(Joi.ref('password')).required(),
      role: Joi.string().valid('customer', 'provider').default('customer')
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      rememberMe: Joi.boolean().default(false)
    }),

    forgotPassword: Joi.object({
      email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
      password: Joi.string().min(8).required(),
      passwordConfirm: Joi.string().valid(Joi.ref('password')).required()
    }),

    changePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required(),
      newPasswordConfirm: Joi.string().valid(Joi.ref('newPassword')).required()
    }),

    updateMe: Joi.object({
      firstName: Joi.string().min(2).max(50),
      lastName: Joi.string().min(2).max(50),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      profileImage: Joi.string().uri(),
      dateOfBirth: Joi.date(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string().default('Kenya')
      })
    })
  },

  // ===== BOOKING VALIDATION =====
  booking: {
    create: Joi.object({
      vehicleId: Joi.string().when('serviceType', {
        is: 'rental',
        then: Joi.required()
      }),
      serviceType: Joi.string().valid('rental', 'car_wash', 'repair', 'delivery').required(),
      startDate: Joi.date().greater('now').required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      pickupTime: Joi.string(),
      dropoffTime: Joi.string(),
      pickupLocation: Joi.object({
        type: Joi.string().valid('showroom', 'address', 'airport', 'hotel').required(),
        name: Joi.string(),
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          zipCode: Joi.string()
        }),
        coordinates: Joi.object({
          lat: Joi.number(),
          lng: Joi.number()
        })
      }).required(),
      dropoffLocation: Joi.object({
        type: Joi.string().valid('showroom', 'address', 'airport', 'hotel'),
        name: Joi.string(),
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          zipCode: Joi.string()
        }),
        coordinates: Joi.object({
          lat: Joi.number(),
          lng: Joi.number()
        })
      }),
      extras: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          name: Joi.string(),
          price: Joi.number(),
          quantity: Joi.number().default(1),
          perDay: Joi.boolean().default(false)
        })
      ),
      specialRequests: Joi.string().max(500),
      customerInfo: Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string().email(),
        phone: Joi.string()
      })
    }),

    updateBooking: Joi.object({
      startDate: Joi.date().greater('now'),
      endDate: Joi.date().greater(Joi.ref('startDate')),
      pickupTime: Joi.string(),
      dropoffTime: Joi.string(),
      extras: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          name: Joi.string(),
          price: Joi.number(),
          quantity: Joi.number(),
          perDay: Joi.boolean()
        })
      ),
      specialRequests: Joi.string().max(500)
    }),

    cancelBooking: Joi.object({
      reason: Joi.string().max(200).required()
    }),

    checkAvailability: Joi.object({
      vehicleId: Joi.string(),
      serviceType: Joi.string().valid('rental', 'car_wash', 'repair'),
      startDate: Joi.date().greater('now').required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required()
    }),

    calculatePrice: Joi.object({
      vehicleId: Joi.string(),
      serviceType: Joi.string().valid('rental', 'car_wash', 'repair', 'delivery').required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      extras: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          price: Joi.number(),
          quantity: Joi.number(),
          perDay: Joi.boolean()
        })
      )
    })
  },

  // ===== VEHICLE VALIDATION =====
  vehicle: {
    create: Joi.object({
      name: Joi.string().required(),
      make: Joi.string().required(),
      model: Joi.string().required(),
      year: Joi.number().min(1900).max(new Date().getFullYear() + 1).required(),
      category: Joi.string().valid('supercar', 'luxury', 'sports', 'suv', 'exotic', 'grand_tourer').required(),
      price: Joi.object({
        daily: Joi.number().min(0).required(),
        weekly: Joi.number().min(0),
        monthly: Joi.number().min(0),
        deposit: Joi.number().min(0),
        insurance: Joi.number().min(0)
      }).required(),
      specifications: Joi.object({
        engine: Joi.string(),
        power: Joi.string(),
        acceleration: Joi.string(),
        topSpeed: Joi.string(),
        transmission: Joi.string().valid('manual', 'automatic', 'semi-automatic', 'dual-clutch'),
        drivetrain: Joi.string().valid('FWD', 'RWD', 'AWD', '4WD'),
        fuelType: Joi.string().valid('petrol', 'diesel', 'hybrid', 'electric'),
        seatingCapacity: Joi.number(),
        doors: Joi.number()
      }),
      features: Joi.array().items(Joi.string()),
      colors: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          code: Joi.string(),
          image: Joi.string().uri(),
          available: Joi.boolean()
        })
      ),
      location: Joi.string().valid('beverly-hills', 'miami', 'manhattan').required()
    }),

    updateVehicle: Joi.object({
      name: Joi.string(),
      make: Joi.string(),
      model: Joi.string(),
      year: Joi.number().min(1900).max(new Date().getFullYear() + 1),
      price: Joi.object({
        daily: Joi.number().min(0),
        weekly: Joi.number().min(0),
        monthly: Joi.number().min(0),
        deposit: Joi.number().min(0),
        insurance: Joi.number().min(0)
      }),
      specifications: Joi.object({
        engine: Joi.string(),
        power: Joi.string(),
        acceleration: Joi.string(),
        topSpeed: Joi.string(),
        transmission: Joi.string().valid('manual', 'automatic', 'semi-automatic', 'dual-clutch'),
        drivetrain: Joi.string().valid('FWD', 'RWD', 'AWD', '4WD'),
        fuelType: Joi.string().valid('petrol', 'diesel', 'hybrid', 'electric'),
        seatingCapacity: Joi.number(),
        doors: Joi.number()
      }),
      features: Joi.array().items(Joi.string()),
      location: Joi.string().valid('beverly-hills', 'miami', 'manhattan')
    }),

    checkAvailability: Joi.object({
      startDate: Joi.date().greater('now').required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required()
    }),

    addReview: Joi.object({
      bookingId: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required(),
      title: Joi.string().max(100).required(),
      content: Joi.string().max(1000).required(),
      pros: Joi.array().items(Joi.string()),
      cons: Joi.array().items(Joi.string()),
      categories: Joi.object({
        cleanliness: Joi.number().min(1).max(5),
        service: Joi.number().min(1).max(5),
        value: Joi.number().min(1).max(5),
        communication: Joi.number().min(1).max(5),
        condition: Joi.number().min(1).max(5)
      }),
      wouldRecommend: Joi.boolean().default(true)
    })
  },

  // ===== PAYMENT VALIDATION =====
  payment: {
    process: Joi.object({
      bookingId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      currency: Joi.string().default('USD'),
      method: Joi.string().valid('card', 'paypal', 'mpesa', 'square', 'flutterwave').required(),
      paymentMethodId: Joi.string().when('method', {
        is: 'card',
        then: Joi.required()
      }),
      phoneNumber: Joi.string().when('method', {
        is: 'mpesa',
        then: Joi.required()
      }),
      billingDetails: Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string().email(),
        address: Joi.object({
          line1: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          postalCode: Joi.string(),
          country: Joi.string()
        })
      }),
      savePaymentMethod: Joi.boolean().default(false)
    }),

    refund: Joi.object({
      amount: Joi.number().positive(),
      reason: Joi.string().max(200).required()
    }),

    addPaymentMethod: Joi.object({
      type: Joi.string().valid('card', 'paypal', 'mpesa').required(),
      paymentMethodId: Joi.string().when('type', {
        is: 'card',
        then: Joi.required()
      }),
      details: Joi.object({
        email: Joi.string().email(),
        phoneNumber: Joi.string()
      }).when('type', {
        is: 'paypal',
        then: Joi.object({ email: Joi.string().email().required() }),
        is: 'mpesa',
        then: Joi.object({ phoneNumber: Joi.string().required() })
      })
    })
  },

  // ===== DELIVERY VALIDATION =====
  delivery: {
    create: Joi.object({
      bookingId: Joi.string().required(),
      type: Joi.string().valid('pickup', 'delivery', 'exchange', 'concierge').required(),
      priority: Joi.string().valid('normal', 'express', 'urgent').default('normal'),
      pickup: Joi.object({
        type: Joi.string().valid('showroom', 'address', 'airport', 'hotel').required(),
        name: Joi.string(),
        address: Joi.object({
          street: Joi.string().required(),
          city: Joi.string().required(),
          state: Joi.string().required(),
          zipCode: Joi.string().required(),
          country: Joi.string().default('Kenya')
        }),
        coordinates: Joi.object({
          lat: Joi.number().required(),
          lng: Joi.number().required()
        }),
        contact: Joi.object({
          name: Joi.string(),
          phone: Joi.string()
        })
      }).required(),
      dropoff: Joi.object({
        type: Joi.string().valid('showroom', 'address', 'airport', 'hotel').required(),
        name: Joi.string(),
        address: Joi.object({
          street: Joi.string().required(),
          city: Joi.string().required(),
          state: Joi.string().required(),
          zipCode: Joi.string().required(),
          country: Joi.string().default('Kenya')
        }),
        coordinates: Joi.object({
          lat: Joi.number().required(),
          lng: Joi.number().required()
        }),
        contact: Joi.object({
          name: Joi.string(),
          phone: Joi.string()
        })
      }).required(),
      schedule: Joi.object({
        pickupDate: Joi.date().greater('now').required(),
        pickupTime: Joi.string(),
        dropoffDate: Joi.date().greater(Joi.ref('pickupDate')).required(),
        dropoffTime: Joi.string()
      }).required()
    }),

    updateStatus: Joi.object({
      status: Joi.string().valid(
        'pending', 'assigned', 'en_route_pickup', 'arrived_pickup',
        'picked_up', 'en_route_dropoff', 'arrived_dropoff', 'delivered'
      ).required(),
      location: Joi.object({
        lat: Joi.number(),
        lng: Joi.number()
      }),
      note: Joi.string().max(200)
    }),

    updateLocation: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      accuracy: Joi.number()
    }),

    assignDriver: Joi.object({
      driverId: Joi.string().required()
    }),

    rateDelivery: Joi.object({
      score: Joi.number().min(1).max(5).required(),
      feedback: Joi.string().max(500),
      categories: Joi.object({
        timeliness: Joi.number().min(1).max(5),
        professionalism: Joi.number().min(1).max(5),
        vehicleCondition: Joi.number().min(1).max(5),
        communication: Joi.number().min(1).max(5)
      })
    }),

    cancelDelivery: Joi.object({
      reason: Joi.string().max(200).required()
    })
  },

  // ===== ADMIN VALIDATION =====
  admin: {
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),

    createAdmin: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      role: Joi.string().valid('admin', 'super_admin', 'manager', 'support', 'finance').required(),
      permissions: Joi.array().items(Joi.string()),
      department: Joi.string().valid('management', 'operations', 'finance', 'support', 'sales', 'technical'),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
    }),

    updateAdmin: Joi.object({
      firstName: Joi.string().min(2).max(50),
      lastName: Joi.string().min(2).max(50),
      role: Joi.string().valid('admin', 'super_admin', 'manager', 'support', 'finance'),
      permissions: Joi.array().items(Joi.string()),
      department: Joi.string().valid('management', 'operations', 'finance', 'support', 'sales', 'technical'),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    }),

    toggleUserStatus: Joi.object({
      isActive: Joi.boolean().required(),
      reason: Joi.string().max(200)
    }),

    updateBookingStatus: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'processing', 'completed', 'cancelled').required(),
      note: Joi.string().max(200)
    }),

    processRefund: Joi.object({
      amount: Joi.number().positive(),
      reason: Joi.string().max(200).required()
    }),

    updateSetting: Joi.object({
      key: Joi.string().required(),
      value: Joi.any().required(),
      reason: Joi.string().max(200)
    }),

    sendNotification: Joi.object({
      recipients: Joi.alternatives().try(
        Joi.string().valid('all'),
        Joi.object({
          role: Joi.string().valid('customer', 'provider', 'admin'),
          userIds: Joi.array().items(Joi.string())
        })
      ).required(),
      type: Joi.string().required(),
      title: Joi.string().required(),
      message: Joi.string().required(),
      data: Joi.object()
    })
  },

  // ===== REPORT VALIDATION =====
  report: {
    dateRange: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      groupBy: Joi.string().valid('hour', 'day', 'week', 'month', 'year').default('day')
    }),

    exportReport: Joi.object({
      type: Joi.string().valid('revenue', 'bookings', 'users', 'vehicles', 'deliveries').required(),
      format: Joi.string().valid('csv', 'excel', 'pdf').required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required()
    })
  }
};

module.exports = validators;