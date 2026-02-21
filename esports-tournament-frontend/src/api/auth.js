import apiClient from './client';

export const authAPI = {
    login: (credentials) =>
        apiClient.post('/auth/login', credentials).then(res => res.data),

    googleSignIn: (credential) =>
        apiClient.post('/auth/google-signin', { credential }).then(res => res.data),

    signup: (userData) =>
        apiClient.post('/auth/signup', userData).then(res => res.data),

    logout: () =>
        apiClient.post('/auth/logout').then(res => res.data),

    getCurrentUser: () =>
        apiClient.get('/auth/me').then(res => res.data),

    refreshToken: () =>
        apiClient.post('/auth/refresh').then(res => res.data),

    updateProfile: (userData) =>
        apiClient.put('/auth/profile', userData).then(res => res.data),

    changePassword: (passwords) =>
        apiClient.put('/auth/password', passwords).then(res => res.data),
};

export default authAPI;