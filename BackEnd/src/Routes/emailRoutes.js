const express = require('express');
const router = express.Router();
const emailController = require('../Controllers/EmailController');

router.post('/newsletter/subscribe', emailController.subscribeToNewsletter);
router.post('/newsletter/unsubscribe', emailController.unsubscribeFromNewsletter);
router.post('/booking-confirmation', emailController.sendBookingConfirmationEmail);
router.post('/contact', emailController.submitContactInquiry);

module.exports = router;
