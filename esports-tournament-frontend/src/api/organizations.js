import apiClient from './client';

export const organizationsAPI = {
    // Get all organizations
    getAll: async (params = {}) => {
        const response = await apiClient.get('/organizations', { params });
        return response.data;
    },

    // Get organization by ID
    getById: async (id) => {
        const response = await apiClient.get(`/organizations/${id}`);
        return response.data;
    },

    // Create organization
    create: async (organizationData) => {
        const response = await apiClient.post('/organizations', organizationData);
        return response.data;
    },

    // Update organization
    update: async (id, organizationData) => {
        const response = await apiClient.put(`/organizations/${id}`, organizationData);
        return response.data;
    },

    // Delete organization
    delete: async (id) => {
        const response = await apiClient.delete(`/organizations/${id}`);
        return response.data;
    },

    // Get organization members
    getMembers: async (organizationId) => {
        const response = await apiClient.get(`/organizations/${organizationId}/members`);
        return response.data;
    },

    // Add organization member
    addMember: async (organizationId, memberData) => {
        const response = await apiClient.post(`/organizations/${organizationId}/members`, memberData);
        return response.data;
    },

    // Remove organization member
    removeMember: async (organizationId, memberId) => {
        const response = await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
        return response.data;
    },

    // Get organization tournaments
    getTournaments: async (organizationId) => {
        const response = await apiClient.get(`/organizations/${organizationId}/tournaments`);
        return response.data;
    },
};

export default organizationsAPI;