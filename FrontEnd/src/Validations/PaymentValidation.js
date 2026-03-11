// ===== src/Validations/payment.validation.js =====
/**
 * PAYMENT VALIDATION - GOD MODE
 * Comprehensive validation for payment operations
 */

import { 
  validateEmail, 
  validateCreditCard, 
  validateCVV, 
  validateExpiryDate,
  validatePhone 
} from '../Utils/validation';

// ===== PAYMENT METHOD VALIDATION =====
export const validatePaymentMethod = (data) => {
  const errors = {};

  const validMethods = ['card', 'paypal', 'mpesa', 'cash', 'bank_transfer'];
  
  if (!data.method) {
    errors.method = 'Payment method is required';
  } else if (!validMethods.includes(data.method)) {
    errors.method = 'Invalid payment method';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== CREDIT CARD VALIDATION =====
export const validateCreditCardPayment = (data) => {
  const errors = {};

  // Card number validation
  if (!data.cardNumber) {
    errors.cardNumber = 'Card number is required';
  } else {
    const cleaned = data.cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) {
      errors.cardNumber = 'Card number can only contain digits';
    } else if (!validateCreditCard(cleaned)) {
      errors.cardNumber = 'Please enter a valid card number';
    }
  }

  // Cardholder name validation
  if (!data.cardholderName) {
    errors.cardholderName = 'Cardholder name is required';
  } else if (data.cardholderName.length < 3) {
    errors.cardholderName = 'Please enter the full name on card';
  }

  // Expiry date validation
  if (!data.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else if (!validateExpiryDate(data.expiryDate)) {
    errors.expiryDate = 'Invalid or expired card';
  }

  // CVV validation
  if (!data.cvv) {
    errors.cvv = 'CVV is required';
  } else {
    const cardType = data.cardType || 'unknown';
    if (!validateCVV(data.cvv, cardType)) {
      errors.cvv = `CVV must be ${cardType === 'amex' ? '4' : '3'} digits`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYPAL VALIDATION =====
export const validatePayPalPayment = (data) => {
  const errors = {};

  if (!data.paypalEmail) {
    errors.paypalEmail = 'PayPal email is required';
  } else if (!validateEmail(data.paypalEmail)) {
    errors.paypalEmail = 'Please enter a valid PayPal email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== M-PESA VALIDATION =====
export const validateMpesaPayment = (data) => {
  const errors = {};

  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else {
    // M-PESA specific phone validation (Kenyan format)
    const cleaned = data.phoneNumber.replace(/\s+/g, '');
    const mpesaRegex = /^(254|0)?[71]\d{8}$/;
    
    if (!mpesaRegex.test(cleaned)) {
      errors.phoneNumber = 'Please enter a valid M-PESA phone number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYMENT AMOUNT VALIDATION =====
export const validatePaymentAmount = (data) => {
  const errors = {};

  if (!data.amount) {
    errors.amount = 'Amount is required';
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (amount > 100000) {
      errors.amount = 'Amount exceeds maximum limit';
    }
  }

  if (!data.currency) {
    errors.currency = 'Currency is required';
  } else if (!['USD', 'EUR', 'GBP', 'KES', 'CAD'].includes(data.currency)) {
    errors.currency = 'Unsupported currency';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYMENT PROCESSING VALIDATION =====
export const validatePaymentProcessing = (data) => {
  const methodValidation = validatePaymentMethod(data);
  const amountValidation = validatePaymentAmount(data);
  
  let methodSpecificErrors = {};

  switch (data.method) {
    case 'card':
      methodSpecificErrors = validateCreditCardPayment(data).errors;
      break;
    case 'paypal':
      methodSpecificErrors = validatePayPalPayment(data).errors;
      break;
    case 'mpesa':
      methodSpecificErrors = validateMpesaPayment(data).errors;
      break;
    // cash and bank_transfer don't need additional validation
  }

  // Booking ID validation (if provided)
  if (data.bookingId && typeof data.bookingId !== 'string') {
    methodSpecificErrors.bookingId = 'Invalid booking ID';
  }

  const errors = {
    ...methodValidation.errors,
    ...amountValidation.errors,
    ...methodSpecificErrors
  };

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== REFUND VALIDATION =====
export const validateRefund = (data) => {
  const errors = {};

  if (!data.transactionId) {
    errors.transactionId = 'Transaction ID is required';
  }

  if (!data.amount) {
    errors.amount = 'Refund amount is required';
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Refund amount must be greater than 0';
    }
    if (data.maxRefundAmount && amount > data.maxRefundAmount) {
      errors.amount = 'Refund amount cannot exceed original payment';
    }
  }

  if (!data.reason) {
    errors.reason = 'Refund reason is required';
  } else if (data.reason.length < 5) {
    errors.reason = 'Please provide a valid reason (minimum 5 characters)';
  } else if (data.reason.length > 500) {
    errors.reason = 'Reason cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYMENT STATUS UPDATE VALIDATION =====
export const validatePaymentStatusUpdate = (data) => {
  const errors = {};

  if (!data.paymentId) {
    errors.paymentId = 'Payment ID is required';
  }

  if (!data.status) {
    errors.status = 'Status is required';
  } else if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(data.status)) {
    errors.status = 'Invalid payment status';
  }

  // Gateway-specific status validation
  if (data.gatewayStatus && typeof data.gatewayStatus !== 'string') {
    errors.gatewayStatus = 'Invalid gateway status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYMENT RECEIPT VALIDATION =====
export const validatePaymentReceipt = (data) => {
  const errors = {};

  if (!data.paymentId) {
    errors.paymentId = 'Payment ID is required';
  }

  if (!data.email) {
    errors.email = 'Email is required for receipt';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== SAVED CARD VALIDATION =====
export const validateSavedCard = (data) => {
  const errors = {};

  if (!data.cardId) {
    errors.cardId = 'Card ID is required';
  }

  if (!data.cardholderName) {
    errors.cardholderName = 'Cardholder name is required';
  }

  if (!data.last4) {
    errors.last4 = 'Last 4 digits are required';
  } else if (!/^\d{4}$/.test(data.last4)) {
    errors.last4 = 'Invalid last 4 digits';
  }

  if (!data.expiryMonth || !data.expiryYear) {
    errors.expiry = 'Expiry date is required';
  } else {
    const month = parseInt(data.expiryMonth);
    const year = parseInt(data.expiryYear);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      errors.expiryMonth = 'Invalid month';
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiry = 'Card has expired';
    }
  }

  if (!data.cardType) {
    errors.cardType = 'Card type is required';
  } else if (!['visa', 'mastercard', 'amex', 'discover'].includes(data.cardType)) {
    errors.cardType = 'Invalid card type';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== PAYMENT SEARCH VALIDATION =====
export const validatePaymentSearch = (data) => {
  const errors = {};

  // At least one search criteria must be provided
  if (!data.paymentId && !data.transactionId && !data.bookingId && !data.customerEmail) {
    errors.search = 'Please provide at least one search criteria';
  }

  // Payment ID validation
  if (data.paymentId && typeof data.paymentId !== 'string') {
    errors.paymentId = 'Invalid payment ID';
  }

  // Transaction ID validation
  if (data.transactionId && typeof data.transactionId !== 'string') {
    errors.transactionId = 'Invalid transaction ID';
  }

  // Booking ID validation
  if (data.bookingId && typeof data.bookingId !== 'string') {
    errors.bookingId = 'Invalid booking ID';
  }

  // Customer email validation
  if (data.customerEmail && !validateEmail(data.customerEmail)) {
    errors.customerEmail = 'Invalid email format';
  }

  // Date range validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    if (start > end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  // Status filter validation
  if (data.status && !['pending', 'processing', 'completed', 'failed', 'refunded'].includes(data.status)) {
    errors.status = 'Invalid status filter';
  }

  // Method filter validation
  if (data.method && !['card', 'paypal', 'mpesa', 'cash', 'bank_transfer'].includes(data.method)) {
    errors.method = 'Invalid payment method filter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== EXPORT ALL =====
export default {
  validatePaymentMethod,
  validateCreditCardPayment,
  validatePayPalPayment,
  validateMpesaPayment,
  validatePaymentAmount,
  validatePaymentProcessing,
  validateRefund,
  validatePaymentStatusUpdate,
  validatePaymentReceipt,
  validateSavedCard,
  validatePaymentSearch
};