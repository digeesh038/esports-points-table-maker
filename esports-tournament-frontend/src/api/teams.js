import apiClient from './client';

export const teamsAPI = {
    // Get all teams
    getAll: async (params = {}) => {
        const response = await apiClient.get('/teams', { params });
        return response.data;
    },

    // Get team by ID
    getById: async (id) => {
        const response = await apiClient.get(`/teams/${id}`);
        return response.data;
    },

    // Create team
    create: async (teamData) => {
        const response = await apiClient.post('/teams', teamData);
        return response.data;
    },

    // Alias for create (used in registration)
    register: async (tournamentId, teamData) => {
        const response = await apiClient.post('/teams', { ...teamData, tournamentId });
        return response.data;
    },

    // Update team
    update: async (id, teamData) => {
        const response = await apiClient.put(`/teams/${id}`, teamData);
        return response.data;
    },

    // Update team status
    updateStatus: async (id, status) => {
        const response = await apiClient.put(`/teams/${id}`, { status });
        return response.data;
    },

    // Delete team
    remove: async (id) => {
        const response = await apiClient.delete(`/teams/${id}`);
        return response.data;
    },

    // Get team members
    getMembers: async (teamId) => {
        const response = await apiClient.get(`/teams/${teamId}/members`);
        return response.data;
    },

    // Add team member
    addMember: async (teamId, memberData) => {
        const response = await apiClient.post(`/teams/${teamId}/players`, memberData);
        return response.data;
    },

    // Remove team member
    removeMember: async (teamId, memberId) => {
        const response = await apiClient.delete(`/teams/${teamId}/players/${memberId}`);
        return response.data;
    },

    // Update team member
    updateMember: async (teamId, memberId, memberData) => {
        const response = await apiClient.put(`/teams/${teamId}/players/${memberId}`, memberData);
        return response.data;
    },

    // Get team statistics
    getStats: async (teamId) => {
        const response = await apiClient.get(`/teams/${teamId}/stats`);
        return response.data;
    },

    // Register team for tournament
    registerForTournament: async (teamId, tournamentId) => {
        const response = await apiClient.post(`/teams/${teamId}/register`, { tournamentId });
        return response.data;
    },

    // Get teams by tournament
    getByTournament: async (tournamentId) => {
        const response = await apiClient.get('/teams', { params: { tournamentId } });
        return response.data;
    },

    // Delete all teams for a tournament
    deleteAll: async (tournamentId) => {
        const response = await apiClient.delete(`/teams/tournament/${tournamentId}`);
        return response.data;
    },
};

export default teamsAPI;