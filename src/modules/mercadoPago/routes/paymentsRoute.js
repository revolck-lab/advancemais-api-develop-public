const express = require('express');
const authToken = require('../../../middlewares/authMiddleware');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const { paymentsController, webhookHandler } = require('../controllers/paymentsController');

const router = express.Router();

router.get('/payment', authToken, authorization.accessLevel(3,7,8), paymentsController.getAllPayments);
router.get('/company/:company_id', authToken, authorization.accessLevel(3,7,8), paymentsController.getPaymentByCompany);
router.post('/payment', authToken, authorization.accessLevel(3,7,8), paymentsController.createPayment);

router.post('/checkout/webhook', (req, res, next) => {
  const secret = req.query.secret || req.body.secret;
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Invalid webhook secret' });
  }
  next();
}, webhookHandler);

module.exports = router;