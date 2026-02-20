import apiClient from './client';

export const authAPI = {
    // Login user
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Google Sign-In
    googleSignIn: async (credential) => {
        const response = await apiClient.post('/auth/google-signin', { credential });
        return response.data;
    },

    // Register new user
    signup: async (userData) => {
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
    },

    // Logout user
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // Refresh token
    refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    // Update profile
    updateProfile: async (userData) => {
        const response = await apiClient.put('/auth/profile', userData);
        return response.data;
    },

    // Change password
    changePassword: async (passwords) => {
        const response = await apiClient.put('/auth/password', passwords);
        return response.data;
    },
};

export default authAPI;