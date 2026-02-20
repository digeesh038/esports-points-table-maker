import { create } from 'zustand';
import { authAPI } from '../api/auth';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    // Login
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            set({
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true,
                loading: false,
            });
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Signup
    signup: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.signup(data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            set({
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true,
                loading: false,
            });
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Logout
    logout: () => {
        authAPI.logout();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

    // Clear error
    clearError: () => set({ error: null }),
}));