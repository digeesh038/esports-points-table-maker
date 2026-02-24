import apiClient from './client';

const paymentsAPI = {
    // Create a Razorpay order for team entry fee
    createOrder: (data) => apiClient.post('/payments/create-order', data),

    // Create a Razorpay order for platform activation fee (organizer)
    createPlatformOrder: (data) => apiClient.post('/payments/platform-order', data),

    // Verify HMAC signature on server then atomically create tournament
    verifyAndCreateTournament: (data) => apiClient.post('/payments/verify-and-create-tournament', data),

    // Verify payment signature only
    verifyPayment: (data) => apiClient.post('/payments/verify-payment', data),
};

export default paymentsAPI;
