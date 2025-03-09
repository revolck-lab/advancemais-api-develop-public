const Joi = require('joi');

const paymentSchema = Joi.object({
  company_id: Joi.number().integer().required(),
  package_id: Joi.number().integer().required(),
});

const validatePayment = (req, res, next) => {
  const { error } = paymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validatePayment;