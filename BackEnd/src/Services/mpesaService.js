// ===== src/services/mpesaService.js =====
const axios = require('axios');
const { logger } = require('../Middleware/Logger.md.js');

const getBaseUrl = () =>
  process.env.MPESA_ENVIRONMENT === 'live'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const getShortCode = () => process.env.MPESA_SHORT_CODE || process.env.MPESA_SHORTCODE;

// ===== GET ACCESS TOKEN =====
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.get(
      `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    logger.error('M-PESA get access token failed:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data
    });
    throw error;
  }
};

// ===== STK PUSH (LIPA NA M-PESA ONLINE) =====
exports.stkPush = async ({ amount, phoneNumber, accountReference }) => {
  try {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(
      `${getShortCode()}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: getShortCode(),
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: getShortCode(),
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: 'CAR EASE Payment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    logger.info(`M-PESA STK Push sent: ${response.data.CheckoutRequestID}`);

    return {
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    logger.error('M-PESA STK Push failed:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data
    });
    throw error;
  }
};

// ===== QUERY STK PUSH STATUS =====
exports.queryStatus = async (checkoutRequestId) => {
  try {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(
      `${getShortCode()}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      `${getBaseUrl()}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: getShortCode(),
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
      amount: response.data.ResultParameters?.Amount,
      mpesaReceipt: response.data.ResultParameters?.MpesaReceiptNumber,
      phoneNumber: response.data.ResultParameters?.PhoneNumber
    };
  } catch (error) {
    logger.error('M-PESA query status failed:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data
    });
    throw error;
  }
};

// ===== VERIFY WEBHOOK =====
exports.verifyWebhook = (payload, signature) => {
  // M-PESA webhook verification implementation
  return payload;
};

// ===== HELPER FUNCTION TO GET TIMESTAMP =====
const getTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
