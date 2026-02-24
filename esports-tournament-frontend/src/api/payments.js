import axiosInstance from './axiosInstance';

const paymentsAPI = {
    // Get UPI ID + entry fee info for a tournament
    getPaymentInfo: (tournamentId) =>
        axiosInstance.get(`/payments/info/${tournamentId}`),

    // Organizer: approve or reject a team's payment by UPI Transaction ID
    verifyTeamPayment: (teamId, action) =>
        axiosInstance.post(`/payments/verify-team/${teamId}`, { action }),
};

export default paymentsAPI;
