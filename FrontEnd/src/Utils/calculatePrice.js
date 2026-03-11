// ===== src/Utils/calculatePrice.js =====
/**
 * PRICE CALCULATOR - GOD MODE
 * Comprehensive price calculation for all services
 * Supports: Rentals, Car Wash, Repairs, Sales, Extras, Discounts
 */

import { TAX_RATE, DEPOSIT_RATES, VEHICLE_CATEGORIES } from './constants';

// ===== BASE RATES =====
const BASE_RATES = {
  // Rental rates per day by category
  rental: {
    supercar: 899,
    luxury: 599,
    sports: 749,
    suv: 449,
    exotic: 1299,
    grand_tourer: 699
  },
  
  // Car wash rates
  carWash: {
    express: 29,
    premium: 79,
    ultimate: 199,
    ceramic: 399
  },
  
  // Repair service rates (base)
  repair: {
    diagnostic: 89,
    maintenance: 199,
    repair: 349,
    performance: 599,
    emergency: 899
  }
};

// ===== EXTRA FEES =====
const EXTRA_FEES = {
  insurance: 50,      // per day
  gps: 15,            // per day
  childSeat: 10,      // per day
  additionalDriver: 25, // per day
  roadside: 20,       // per day
  delivery: 75,       // flat fee
  afterHours: 50,     // flat fee
  weekend: 25,        // per day
  holiday: 50,        // per day
  oneWay: 100         // flat fee
};

// ===== DISCOUNT RATES =====
const DISCOUNT_RATES = {
  weekly: 0.1,        // 10% off for weekly rental
  monthly: 0.2,       // 20% off for monthly rental
  earlyBird: 0.15,    // 15% off for booking 30+ days in advance
  lastMinute: 0.05,   // 5% off for last minute (within 48 hours)
  loyalty: 0.1,       // 10% off for returning customers
  referral: 0.1,      // 10% off for referrals
  corporate: 0.15,    // 15% off for corporate accounts
  military: 0.1,      // 10% off for military
  student: 0.05       // 5% off for students
};

/**
 * Calculate rental price
 * @param {Object} params - Rental parameters
 * @returns {Object} - Price breakdown
 */
export const calculateRentalPrice = (params) => {
  const {
    vehicleCategory,
    days = 1,
    extras = [],
    insurance = false,
    gps = false,
    childSeat = false,
    additionalDriver = false,
    location,
    isWeekend = false,
    isHoliday = false,
    afterHours = false,
    oneWay = false,
    discounts = []
  } = params;

  // Base price
  const baseRate = BASE_RATES.rental[vehicleCategory] || BASE_RATES.rental.luxury;
  let basePrice = baseRate * days;

  // Apply time-based multipliers
  if (isWeekend) basePrice += EXTRA_FEES.weekend * days;
  if (isHoliday) basePrice += EXTRA_FEES.holiday * days;

  // Calculate extras
  let extrasCost = 0;
  const extrasList = [];

  if (insurance) {
    extrasCost += EXTRA_FEES.insurance * days;
    extrasList.push({ name: 'Premium Insurance', cost: EXTRA_FEES.insurance * days, perDay: true });
  }

  if (gps) {
    extrasCost += EXTRA_FEES.gps * days;
    extrasList.push({ name: 'GPS Navigation', cost: EXTRA_FEES.gps * days, perDay: true });
  }

  if (childSeat) {
    extrasCost += EXTRA_FEES.childSeat * days;
    extrasList.push({ name: 'Child Seat', cost: EXTRA_FEES.childSeat * days, perDay: true });
  }

  if (additionalDriver) {
    extrasCost += EXTRA_FEES.additionalDriver * days;
    extrasList.push({ name: 'Additional Driver', cost: EXTRA_FEES.additionalDriver * days, perDay: true });
  }

  // Custom extras
  if (extras && extras.length > 0) {
    extras.forEach(extra => {
      if (EXTRA_FEES[extra.id]) {
        const cost = EXTRA_FEES[extra.id] * (extra.perDay ? days : 1);
        extrasCost += cost;
        extrasList.push({ name: extra.name, cost, perDay: extra.perDay });
      }
    });
  }

  // Flat fees
  if (afterHours) {
    extrasCost += EXTRA_FEES.afterHours;
    extrasList.push({ name: 'After Hours Pickup', cost: EXTRA_FEES.afterHours, perDay: false });
  }

  if (oneWay) {
    extrasCost += EXTRA_FEES.oneWay;
    extrasList.push({ name: 'One Way Drop-off', cost: EXTRA_FEES.oneWay, perDay: false });
  }

  // Calculate discounts
  let totalDiscount = 0;
  const appliedDiscounts = [];

  // Duration-based discounts
  if (days >= 7 && days < 30) {
    const discount = basePrice * DISCOUNT_RATES.weekly;
    totalDiscount += discount;
    appliedDiscounts.push({ name: 'Weekly Discount (10%)', amount: discount });
  } else if (days >= 30) {
    const discount = basePrice * DISCOUNT_RATES.monthly;
    totalDiscount += discount;
    appliedDiscounts.push({ name: 'Monthly Discount (20%)', amount: discount });
  }

  // Custom discounts
  discounts.forEach(discount => {
    if (DISCOUNT_RATES[discount.type]) {
      const discountAmount = basePrice * DISCOUNT_RATES[discount.type];
      totalDiscount += discountAmount;
      appliedDiscounts.push({ name: discount.name, amount: discountAmount });
    } else if (discount.fixed) {
      totalDiscount += discount.amount;
      appliedDiscounts.push({ name: discount.name, amount: discount.amount });
    }
  });

  // Calculate subtotal and tax
  const subtotal = basePrice + extrasCost;
  const taxableAmount = subtotal;
  const tax = taxableAmount * TAX_RATE;
  const total = subtotal - totalDiscount + tax;

  // Calculate deposit
  const category = VEHICLE_CATEGORIES.find(c => c.id === vehicleCategory);
  const depositRate = category?.deposit || DEPOSIT_RATES.standard;
  const deposit = total * depositRate;

  return {
    breakdown: {
      base: {
        rate: baseRate,
        days,
        total: basePrice,
        description: `${days} day(s) at ${formatCurrency(baseRate)}/day`
      },
      extras: extrasList,
      discounts: appliedDiscounts,
      subtotal,
      tax,
      total
    },
    deposit,
    summary: {
      basePrice,
      extrasCost,
      totalDiscount,
      subtotal,
      tax,
      total,
      deposit
    }
  };
};

/**
 * Calculate car wash price
 * @param {Object} params - Wash parameters
 * @returns {Object} - Price breakdown
 */
export const calculateCarWashPrice = (params) => {
  const {
    package: washPackage,
    vehicleSize = 'standard',
    extras = [],
    location,
    isWeekend = false,
    isHoliday = false,
    discounts = []
  } = params;

  // Base price
  const baseRate = BASE_RATES.carWash[washPackage] || BASE_RATES.carWash.premium;
  let basePrice = baseRate;

  // Vehicle size multiplier
  const sizeMultipliers = {
    compact: 0.8,
    standard: 1.0,
    suv: 1.3,
    luxury: 1.5,
    exotic: 2.0
  };
  const multiplier = sizeMultipliers[vehicleSize] || 1.0;
  basePrice = basePrice * multiplier;

  // Time-based fees
  if (isWeekend) basePrice += 10;
  if (isHoliday) basePrice += 20;

  // Calculate extras
  let extrasCost = 0;
  const extrasList = [];

  if (extras && extras.length > 0) {
    extras.forEach(extra => {
      extrasCost += extra.price || 0;
      extrasList.push({ name: extra.name, cost: extra.price });
    });
  }

  // Calculate discounts
  let totalDiscount = 0;
  const appliedDiscounts = [];

  discounts.forEach(discount => {
    if (DISCOUNT_RATES[discount.type]) {
      const discountAmount = basePrice * DISCOUNT_RATES[discount.type];
      totalDiscount += discountAmount;
      appliedDiscounts.push({ name: discount.name, amount: discountAmount });
    } else if (discount.fixed) {
      totalDiscount += discount.amount;
      appliedDiscounts.push({ name: discount.name, amount: discount.amount });
    }
  });

  // Calculate totals
  const subtotal = basePrice + extrasCost;
  const tax = subtotal * TAX_RATE;
  const total = subtotal - totalDiscount + tax;

  return {
    breakdown: {
      base: {
        package: washPackage,
        vehicleSize,
        rate: baseRate,
        multiplier,
        total: basePrice,
        description: `${washPackage} wash for ${vehicleSize} vehicle`
      },
      extras: extrasList,
      discounts: appliedDiscounts,
      subtotal,
      tax,
      total
    },
    summary: {
      basePrice,
      extrasCost,
      totalDiscount,
      subtotal,
      tax,
      total
    }
  };
};

/**
 * Calculate repair price
 * @param {Object} params - Repair parameters
 * @returns {Object} - Price breakdown
 */
export const calculateRepairPrice = (params) => {
  const {
    serviceType,
    vehicleType = 'standard',
    hours = 1,
    parts = [],
    emergency = false,
    location,
    discounts = []
  } = params;

  // Base price
  const baseRate = BASE_RATES.repair[serviceType] || BASE_RATES.repair.repair;
  let laborCost = baseRate * hours;

  // Vehicle type multiplier
  const vehicleMultipliers = {
    compact: 1.0,
    standard: 1.0,
    luxury: 1.5,
    exotic: 2.0,
    electric: 1.2
  };
  const multiplier = vehicleMultipliers[vehicleType] || 1.0;
  laborCost = laborCost * multiplier;

  // Emergency fee
  if (emergency) {
    laborCost += EXTRA_FEES.emergency || 200;
  }

  // Parts cost
  let partsCost = 0;
  const partsList = [];

  if (parts && parts.length > 0) {
    parts.forEach(part => {
      partsCost += part.price * (part.quantity || 1);
      partsList.push({
        name: part.name,
        quantity: part.quantity || 1,
        price: part.price,
        total: part.price * (part.quantity || 1)
      });
    });
  }

  // Calculate discounts
  let totalDiscount = 0;
  const appliedDiscounts = [];

  discounts.forEach(discount => {
    if (DISCOUNT_RATES[discount.type]) {
      const discountAmount = laborCost * DISCOUNT_RATES[discount.type];
      totalDiscount += discountAmount;
      appliedDiscounts.push({ name: discount.name, amount: discountAmount });
    } else if (discount.fixed) {
      totalDiscount += discount.amount;
      appliedDiscounts.push({ name: discount.name, amount: discount.amount });
    }
  });

  // Calculate totals
  const subtotal = laborCost + partsCost;
  const tax = subtotal * TAX_RATE;
  const total = subtotal - totalDiscount + tax;

  return {
    breakdown: {
      labor: {
        rate: baseRate,
        hours,
        multiplier,
        total: laborCost,
        description: `${serviceType} service for ${hours} hour(s)`
      },
      parts: partsList,
      discounts: appliedDiscounts,
      subtotal,
      tax,
      total
    },
    summary: {
      laborCost,
      partsCost,
      totalDiscount,
      subtotal,
      tax,
      total
    }
  };
};

/**
 * Calculate sales price (vehicle purchase)
 * @param {Object} params - Sales parameters
 * @returns {Object} - Price breakdown
 */
export const calculateSalesPrice = (params) => {
  const {
    vehiclePrice,
    tradeInValue = 0,
    downPayment = 0,
    financing = false,
    interestRate = 0.05,
    loanTerm = 60, // months
    tax = vehiclePrice * TAX_RATE,
    fees = [],
    discounts = []
  } = params;

  // Base calculations
  let subtotal = vehiclePrice;
  const feesList = [];

  // Add fees
  fees.forEach(fee => {
    subtotal += fee.amount;
    feesList.push({ name: fee.name, amount: fee.amount });
  });

  // Apply discounts
  let totalDiscount = 0;
  const appliedDiscounts = [];

  discounts.forEach(discount => {
    if (discount.percentage) {
      const discountAmount = vehiclePrice * (discount.percentage / 100);
      totalDiscount += discountAmount;
      appliedDiscounts.push({ name: discount.name, amount: discountAmount });
    } else {
      totalDiscount += discount.amount;
      appliedDiscounts.push({ name: discount.name, amount: discount.amount });
    }
  });

  // Calculate final price
  const taxableAmount = vehiclePrice - totalDiscount;
  const taxAmount = tax || (taxableAmount * TAX_RATE);
  const totalPrice = taxableAmount + taxAmount + subtotal - vehiclePrice;
  
  // Calculate financing if applicable
  let monthlyPayment = null;
  let totalInterest = null;
  
  if (financing) {
    const loanAmount = totalPrice - downPayment - tradeInValue;
    const monthlyRate = interestRate / 12;
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
    totalInterest = (monthlyPayment * loanTerm) - loanAmount;
  }

  return {
    breakdown: {
      vehiclePrice,
      tradeInValue,
      downPayment,
      fees: feesList,
      discounts: appliedDiscounts,
      subtotal: totalPrice,
      tax: taxAmount,
      total: totalPrice
    },
    financing: financing ? {
      loanAmount: totalPrice - downPayment - tradeInValue,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalInterest,
      totalPayments: monthlyPayment * loanTerm
    } : null,
    summary: {
      vehiclePrice,
      tradeInValue,
      downPayment,
      feesTotal: subtotal - vehiclePrice,
      totalDiscount,
      tax: taxAmount,
      totalPrice,
      amountDue: totalPrice - downPayment - tradeInValue
    }
  };
};

/**
 * Calculate price with promo code
 * @param {number} originalPrice - Original price
 * @param {string} promoCode - Promo code
 * @param {Object} promoRules - Promo rules
 * @returns {Object} - Discounted price
 */
export const applyPromoCode = (originalPrice, promoCode, promoRules = {}) => {
  const validPromos = {
    'WELCOME10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
    'SUMMER50': { type: 'fixed', value: 50 },
    'VIP100': { type: 'fixed', value: 100, minPurchase: 500 },
    'FREESHIP': { type: 'freeShipping', value: 0 }
  };

  const promo = validPromos[promoCode?.toUpperCase()];
  
  if (!promo) {
    return {
      valid: false,
      message: 'Invalid promo code',
      originalPrice,
      finalPrice: originalPrice,
      discount: 0
    };
  }

  // Check minimum purchase
  if (promo.minPurchase && originalPrice < promo.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of $${promo.minPurchase} required`,
      originalPrice,
      finalPrice: originalPrice,
      discount: 0
    };
  }

  let discount = 0;
  
  if (promo.type === 'percentage') {
    discount = originalPrice * (promo.value / 100);
  } else if (promo.type === 'fixed') {
    discount = promo.value;
  } else if (promo.type === 'freeShipping') {
    discount = promoRules.shippingCost || 0;
  }

  const finalPrice = Math.max(0, originalPrice - discount);

  return {
    valid: true,
    message: 'Promo code applied successfully',
    originalPrice,
    finalPrice,
    discount,
    promoCode: promoCode.toUpperCase()
  };
};

/**
 * Calculate split payment
 * @param {number} total - Total amount
 * @param {Array} splits - Payment splits
 * @returns {Object} - Split payment breakdown
 */
export const calculateSplitPayment = (total, splits = []) => {
  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  
  if (Math.abs(totalSplit - total) > 0.01) {
    throw new Error('Split amounts must equal total');
  }

  return {
    total,
    splits: splits.map(split => ({
      ...split,
      percentage: (split.amount / total) * 100
    })),
    verified: true
  };
};

/**
 * Calculate tip
 * @param {number} subtotal - Subtotal amount
 * @param {number} tipPercentage - Tip percentage
 * @param {string} tipType - 'percentage' or 'fixed'
 * @returns {Object} - Tip calculation
 */
export const calculateTip = (subtotal, tipValue, tipType = 'percentage') => {
  let tipAmount = 0;
  
  if (tipType === 'percentage') {
    tipAmount = subtotal * (tipValue / 100);
  } else {
    tipAmount = tipValue;
  }

  return {
    tipAmount,
    tipType,
    tipValue,
    totalWithTip: subtotal + tipAmount
  };
};

/**
 * Format currency helper
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// ===== EXPORT ALL =====
export default {
  calculateRentalPrice,
  calculateCarWashPrice,
  calculateRepairPrice,
  calculateSalesPrice,
  applyPromoCode,
  calculateSplitPayment,
  calculateTip,
  
  // Constants for external use
  BASE_RATES,
  EXTRA_FEES,
  DISCOUNT_RATES
};