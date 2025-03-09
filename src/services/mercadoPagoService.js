require('dotenv').config();
const { MercadoPagoConfig, Payment, User } = require('mercadopago');

// Criando uma instância da configuração do Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// Criando instâncias das classes necessárias
const payment = new Payment(client);
const userClient = new User(client);

// Função para testar a conexão com o Mercado Pago
const testConnectionMercadoPago = async () => {
    try {
        const response = await userClient.get();
        console.log("✅ Conexão com Mercado Pago bem-sucedida:");
        return response;
    } catch (error) {
        console.error('Erro ao conectar ao Mercado Pago:', error);
        throw error;
    }
};

// Função para criar um pagamento
const createPayment = async (paymentData) => {
    try {
        const response = await payment.create(paymentData);
        return response;
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        throw error;
    }
};

// Função para obter o status de um pagamento
const getPaymentStatus = async (paymentId) => {
    try {
        const response = await payment.get({ id: paymentId });
        return response;
    } catch (error) {
        console.error('Erro ao obter status do pagamento:', error);
        throw error;
    }
};

module.exports = { testConnectionMercadoPago, createPayment, getPaymentStatus };
