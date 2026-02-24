import apiClient from './client';

const paymentsAPI = {
    /**
     * Create Razorpay Order
     * @param {string} tournamentId 
     * @returns {Promise}
     */
    createOrder: (tournamentId) => apiClient.post('/payments/create-order', { tournamentId }),

    /**
     * Verify payment and Register Team
     * @param {Object} paymentData 
     * @returns {Promise}
     */
    verify: (paymentData) => apiClient.post('/payments/verify', paymentData),

    /**
     * Get Receipt Blob
     * @param {string} paymentId 
     * @returns {Promise<Blob>}
     */
    getReceipt: async (paymentId) => {
        const response = await apiClient.get(`/payments/receipt/${paymentId}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

export default paymentsAPI;
