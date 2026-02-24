import apiClient from './client';

const paymentsAPI = {
    createOrder: (data) => apiClient.post('/payments/create-order', data),
    verifyPayment: (data) => apiClient.post('/payments/verify-payment', data),
};

export default paymentsAPI;
