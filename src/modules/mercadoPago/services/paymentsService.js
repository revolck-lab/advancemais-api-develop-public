const mercadopago = require('../../../services/mercadoPagoService');
const paymentsModel = require('../models/paymentsModel');

const createPayment = async ({ company_id, package_id }) => {
  const db = await knexInstance();
  const company = await db('company').where({ id: company_id }).first();
  const package = await db('signatures_packages').where({ id: package_id }).first();

  const preference = {
    items: [
      {
        title: `Pacote ID: ${package_id}`,
        quantity: 1,
        unit_price: package.price, // Preço dinâmico
        currency_id: 'BRL',
      },
    ],
    payer: {
      email: company.email,
    },
    payment_methods: {
      excluded_payment_types: [
        { id: 'atm' },
        { id: 'prepaid_card' },
      ], // Permite todos os métodos de pagamento - menos caixas eletrônicos e cartões pré-pagos
      excluded_payment_methods: [], // Permite todos os métodos de pagamento
      installments: 1, // Número de parcelas (1 para PIX e Boleto)
    },
    back_urls: {
      success: `${process.env.FRONTEND_URL}/sucesso`,
      failure: `${process.env.FRONTEND_URL}/falha`,
      pending: `${process.env.FRONTEND_URL}/pendente`,
    },
    auto_return: 'approved',
    notification_url: `${process.env.BASE_URL}/api/checkout/webhook?secret=${process.env.WEBHOOK_SECRET}`,
  };

  const response = await mercadopago.preferences.create(preference);
  const paymentData = {
    company_id,
    package_id,
    mp_preference_id: response.body.id,
    status: 'PENDING',
    payment_id: null, // Será atualizado pelo webhook
  };

  const payment = await paymentsModel.createPayment(paymentData);
  return { init_point: response.body.init_point, paymentId: payment.id };
};

const updatePaymentStatus = async (paymentId, status) => {
  const payment = await paymentsModel.getPaymentByPaymentId(paymentId);
  if (!payment) {
    const db = await knexInstance();
    await db('company_payments').insert({ payment_id: paymentId, status });
    return;
  }
  return paymentsModel.updatePaymentByPaymentId(paymentId, status);
};

const getAllPayments = async () => {
  return paymentsModel.getAllPayments();
};

const getPaymentByCompany = async (company_id) => {
  return paymentsModel.getPaymentByCompany(company_id);
};

module.exports = { createPayment, updatePaymentStatus, getAllPayments, getPaymentByCompany };