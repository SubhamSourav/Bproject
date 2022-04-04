const express = require('express');
const { sendStripeKey, sendRazorPayKey, captureStripePayment, captureRazorPayPayment } = require('../controllers/paymentController');
const router = express.Router();
const { isLoggedIn,} = require("../middleware/user");

router.route("/stripekey").get(isLoggedIn,sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn,sendRazorPayKey);

router.route("/capturestripe").get(isLoggedIn,captureStripePayment);
router.route("/capturerazorpay").get(isLoggedIn,captureRazorPayPayment);

module.exports = router;