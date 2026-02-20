import apiClient from './client';

export const matchesAPI = {
    // Get all matches
    getAll: async (params = {}) => {
        const response = await apiClient.get('/matches', { params });
        return response.data;
    },

    // Get match by ID
    getById: async (id) => {
        const response = await apiClient.get(`/matches/${id}`);
        return response.data;
    },

    // Create match
    create: async (matchData) => {
        const response = await apiClient.post('/matches', matchData);
        return response.data;
    },

    // Update match
    update: async (id, matchData) => {
        const response = await apiClient.put(`/matches/${id}`, matchData);
        return response.data;
    },

    // Delete match
    delete: async (id) => {
        const response = await apiClient.delete(`/matches/${id}`);
        return response.data;
    },

    // Submit match result
    submitResult: async (id, resultData) => {
        const response = await apiClient.post(`/matches/${id}/result`, resultData);
        return response.data;
    },

    // Update match status
    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/matches/${id}/status`, { status });
        return response.data;
    },

    // Lock match results
    lock: async (id) => {
        const response = await apiClient.patch(`/matches/${id}/lock`);
        return response.data;
    },

    // Submit bulk match results
    submitBulkResult: async (id, results) => {
        const response = await apiClient.post(`/matches/${id}/result/bulk`, { results });
        return response.data;
    },

    // Get tournament matches
    getTournamentMatches: async (tournamentId, params = {}) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/matches`, { params });
        return response.data;
    },

    // Get live matches
    getLiveMatches: async () => {
        const response = await apiClient.get('/matches/live');
        return response.data;
    },

    // Get upcoming matches
    getUpcomingMatches: async (params = {}) => {
        const response = await apiClient.get('/matches/upcoming', { params });
        return response.data;
    },

    // Get completed matches
    getCompletedMatches: async (params = {}) => {
        const response = await apiClient.get('/matches/completed', { params });
        return response.data;
    },
};

export default matchesAPI;