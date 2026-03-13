const express = require('express');
const router = express.Router();
const emailController = require('../Controllers/EmailController');

router.post('/newsletter/subscribe', emailController.subscribeToNewsletter);
router.post('/newsletter/unsubscribe', emailController.unsubscribeFromNewsletter);

module.exports = router;
