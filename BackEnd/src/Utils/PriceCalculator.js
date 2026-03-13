// ===== src/utils/priceCalculator.js =====
const Vehicle = require('../Models/Vehicle');
const SystemSettings = require('../Models/SystemSettings');

/**
 * Advanced price calculator for all service types
 * Supports rentals, car wash, repairs, and custom services
 */
exports.calculatePrice = async ({
  vehicleId,
  serviceType,
  startDate,
  endDate,
  extras = [],
  listedPrice,
  packageId,
  inquiryType,
  discountCode,
  userId
}) => {
  let basePrice = 0;
  let extrasPrice = 0;
  let insurancePrice = 0;
  let tax = 0;
  let discount = 0;

  // Get tax rate from settings
  const taxRate = await SystemSettings.get('tax_rate', 0.1);

  const explicitListedPrice = Number(listedPrice || 0);
  if (explicitListedPrice > 0 && (serviceType !== 'rental' || !vehicleId)) {
    basePrice = explicitListedPrice;
  } else {
    try {
      switch (serviceType) {
        case 'rental':
          basePrice = await calculateRentalPrice(vehicleId, startDate, endDate, listedPrice);
          insurancePrice = await calculateInsurance(vehicleId, startDate, endDate);
          break;

        case 'car_wash':
          basePrice = await calculateCarWashPrice(extras, listedPrice);
          break;

        case 'repair':
          basePrice = await calculateRepairPrice(extras, listedPrice);
          break;

        case 'delivery':
          basePrice = await calculateDeliveryPrice(extras);
          break;

        case 'sales':
          basePrice = await calculateSalesPrice(extras, listedPrice, inquiryType);
          break;

        default:
          throw new Error(`Unsupported service type: ${serviceType}`);
      }
    } catch (error) {
      const fallbackBase = {
        rental: Number(listedPrice || 18000),
        car_wash: Number(listedPrice || 3500),
        repair: Number(listedPrice || 8500),
        delivery: Number(listedPrice || 3500),
        sales: Number(listedPrice || 5000)
      };
      basePrice = fallbackBase[serviceType] || 0;
      insurancePrice = serviceType === 'rental' ? await calculateInsurance(vehicleId, startDate, endDate) : 0;
    }
  }

  // Calculate extras
  if (extras.length > 0) {
    extrasPrice = await calculateExtras(extras, serviceType, { startDate, endDate });
  }

  // Calculate subtotal
  const subtotal = basePrice + extrasPrice + insurancePrice;

  // Apply discount if valid
  if (discountCode) {
    discount = await applyDiscount(discountCode, subtotal, userId);
  }

  // Calculate tax
  tax = (subtotal - discount) * taxRate;

  // Calculate total
  const total = subtotal - discount + tax;

  // Calculate deposit (if applicable)
  const deposit = serviceType === 'rental' ? await calculateDeposit(vehicleId, total) : 0;

  return {
    basePrice,
    extrasPrice,
    insurancePrice,
    subtotal,
    discount,
    tax,
    total,
    deposit,
    currency: 'USD',
    breakdown: {
      base: { amount: basePrice, description: getBaseDescription(serviceType) },
      extras: extras.map(e => ({ name: e.name, price: e.price })),
      insurance: insurancePrice > 0 ? { amount: insurancePrice, description: 'Insurance coverage' } : null,
      discount: discount > 0 ? { amount: discount, code: discountCode } : null
    }
  };
};

/**
 * Calculate rental price based on vehicle and duration
 */
const calculateRentalPrice = async (vehicleId, startDate, endDate, listedPrice = 0) => {
  const listed = Number(listedPrice || 0);
  if (!vehicleId && listed > 0) return listed;

  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
  const dailyRate = Number(vehicle.dailyRate);

  // Apply weekly/monthly discounts
  if (days >= 30) {
    return days * dailyRate * 0.7; // 30% off for monthly
  } else if (days >= 7) {
    return days * dailyRate * 0.85; // 15% off for weekly
  }

  return days * dailyRate;
};

/**
 * Calculate car wash price based on package and vehicle size
 */
const calculateCarWashPrice = async (extras, listedPrice = 0) => {
  const listed = Number(listedPrice || 0);
  if (listed > 0) return listed;

  const washPackageIds = ['basic', 'premium', 'ultimate', 'ceramic'];
  const washPackage = extras.find((e) => {
    const extraId = String(e.id || '').toLowerCase();
    return e.type === 'wash_package' || washPackageIds.includes(extraId);
  });
  if (!washPackage) return 79;

  const prices = {
    basic: 29,
    premium: 79,
    ultimate: 199,
    ceramic: 399
  };

  return prices[washPackage.id] || 79;
};

/**
 * Calculate repair price based on service type and hours
 */
const calculateRepairPrice = async (extras, listedPrice = 0) => {
  const listed = Number(listedPrice || 0);
  if (listed > 0) return listed;

  const repairServiceIds = ['diagnostic', 'maintenance', 'repair', 'performance'];
  const repairService = extras.find((e) => {
    const extraId = String(e.id || '').toLowerCase();
    return e.type === 'repair_service' || repairServiceIds.includes(extraId);
  });
  if (!repairService) return 99;

  const hourlyRates = {
    diagnostic: 89,
    maintenance: 99,
    repair: 129,
    performance: 199
  };

  const hours = repairService.hours || 1;
  return (hourlyRates[repairService.id] || 99) * hours;
};

/**
 * Calculate delivery price based on distance and type
 */
const calculateDeliveryPrice = async (extras) => {
  const deliveryInfo = extras.find((e) => e.type === 'delivery' || String(e.id || '').toLowerCase() === 'delivery');
  if (!deliveryInfo) return 0;

  const baseRate = 35;
  const perKm = 2.5;
  const distance = deliveryInfo.distance || 10;

  return baseRate + (distance * perKm);
};

/**
 * Calculate sales booking price (e.g. reservation/deposit)
 */
const calculateSalesPrice = async (extras, listedPrice = 0, inquiryType = '') => {
  const listed = Number(listedPrice || 0);
  if (listed > 0) return listed;
  if (!Array.isArray(extras) || extras.length === 0) {
    const salesDefaults = {
      purchase: 25000,
      test_drive: 5000,
      inspection: 3500
    };
    return salesDefaults[String(inquiryType || '').toLowerCase()] || 5000;
  }

  const primary = extras.find((e) =>
    ['sales', 'deposit', 'reservation', 'purchase'].includes(String(e.type || '').toLowerCase()) ||
    ['sales', 'deposit', 'reservation', 'purchase'].includes(String(e.id || '').toLowerCase())
  ) || extras[0];

  const amount = Number(primary.price || primary.amount || 0);
  return Number.isFinite(amount) ? amount : 0;
};

/**
 * Calculate extras cost
 */
const calculateExtras = async (extras, serviceType, { startDate, endDate }) => {
  let total = 0;

  const extraRates = {
    gps: 15,
    childSeat: 10,
    additionalDriver: 25,
    insurance: 50,
    roadside: 20,
    ceramic: 199,
    interior: 79,
    engine: 49
  };

  const days = serviceType === 'rental' 
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 1;

  extras.forEach(extra => {
    const rate = extraRates[extra.id] || extra.price || 0;
    total += rate * (extra.perDay ? days : 1) * (extra.quantity || 1);
  });

  return total;
};

/**
 * Calculate insurance cost
 */
const calculateInsurance = async (vehicleId, startDate, endDate) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return 0;

  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
  const insuranceRate = vehicle.insuranceRate || Number(vehicle.dailyRate) * 0.15;

  return days * insuranceRate;
};

/**
 * Calculate deposit amount
 */
const calculateDeposit = async (vehicleId, total) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return total * 0.2;

  // Use vehicle-specific deposit rate or default to 20%
  const depositAmount = vehicle.depositAmount || total * 0.2;
  return depositAmount;
};

/**
 * Apply discount code
 */
const applyDiscount = async (code, amount, userId) => {
  // Check if discount code is valid
  const validCodes = {
    WELCOME10: 0.1,
    SAVE20: 0.2,
    VIP25: 0.25,
    REFERRAL15: 0.15
  };

  const discountRate = validCodes[code.toUpperCase()];
  if (!discountRate) return 0;

  // Check if user has already used this code
  // This would check against a database of used codes

  return amount * discountRate;
};

/**
 * Get base price description
 */
const getBaseDescription = (serviceType) => {
  const descriptions = {
    rental: 'Daily rental rate',
    car_wash: 'Wash package',
    repair: 'Labor and diagnostics',
    delivery: 'Delivery fee',
    sales: 'Sales reservation amount'
  };

  return descriptions[serviceType] || 'Service fee';
};
