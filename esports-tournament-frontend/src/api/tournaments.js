import apiClient from './client';

export const tournamentsAPI = {
    // Get all tournaments
    getAll: async (params = {}) => {
        const response = await apiClient.get('/tournaments', { params });
        return response.data;
    },

    // Get user's tournaments
    getUserTournaments: async (params = {}) => {
        const response = await apiClient.get('/tournaments', { params });
        return response.data;
    },

    // Get tournament by ID
    getById: async (id) => {
        const response = await apiClient.get(`/tournaments/${id}`);
        return response.data;
    },

    // Get public tournament details
    getPublicById: async (id) => {
        const response = await apiClient.get(`/tournaments/public/${id}`);
        return response.data;
    },

    // Create tournament
    create: async (tournamentData) => {
        const response = await apiClient.post('/tournaments', tournamentData);
        return response.data;
    },

    // Update tournament
    update: async (id, tournamentData) => {
        const response = await apiClient.put(`/tournaments/${id}`, tournamentData);
        return response.data;
    },

    // Delete tournament (standard)
    delete: async (id) => {
        const response = await apiClient.delete(`/tournaments/${id}`);
        return response.data;
    },

    // Force-delete tournament using raw SQL cascade (bypasses FK constraints)
    forceDelete: async (id) => {
        const response = await apiClient.delete(`/tournaments/${id}/force-delete`);
        return response.data;
    },

    // Get tournament statistics
    getStats: async (id) => {
        const response = await apiClient.get(`/tournaments/${id}/stats`);
        return response.data;
    },

    // Update tournament status
    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/tournaments/${id}/status`, { status });
        return response.data;
    },

    // Get tournament stages
    getStages: async (tournamentId) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/stages`);
        return response.data;
    },

    // Create tournament stage
    createStage: async (tournamentId, stageData) => {
        const response = await apiClient.post(`/tournaments/${tournamentId}/stages`, stageData);
        return response.data;
    },

    // Update tournament stage
    updateStage: async (tournamentId, stageId, stageData) => {
        const response = await apiClient.put(`/tournaments/${tournamentId}/stages/${stageId}`, stageData);
        return response.data;
    },

    // Delete tournament stage
    deleteStage: async (tournamentId, stageId) => {
        const response = await apiClient.delete(`/tournaments/${tournamentId}/stages/${stageId}`);
        return response.data;
    },

    // Export teams
    exportTeams: async (tournamentId) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/teams/export`, {
            responseType: 'blob'
        });
        return response.data;
    },
};

export default tournamentsAPI;