import apiClient from './client';

export const leaderboardAPI = {
    // Get tournament leaderboard
    getTournamentLeaderboard: async (tournamentId, params = {}) => {
        const response = await apiClient.get(`/leaderboard/tournament/${tournamentId}`, { params });
        return response.data;
    },

    // Get public leaderboard alias
    getPublic: async (tournamentId) => {
        const response = await apiClient.get(`/leaderboard/tournament/${tournamentId}`);
        return response.data;
    },

    // Get team standings
    getTeamStandings: async (tournamentId) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/standings`);
        return response.data;
    },

    // Get player rankings
    getPlayerRankings: async (tournamentId) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/rankings`);
        return response.data;
    },

    // Get live leaderboard (real-time)
    getLiveLeaderboard: async (tournamentId) => {
        const response = await apiClient.get(`/tournaments/${tournamentId}/leaderboard/live`);
        return response.data;
    },

    // Get leaderboard by stage ID
    getByStage: async (stageId) => {
        const response = await apiClient.get(`/leaderboard/stage/${stageId}`);
        return response.data;
    },

    // Export stage leaderboard as Excel/CSV
    exportExcel: async (stageId) => {
        const response = await apiClient.get(`/leaderboard/stage/${stageId}/export`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Recalculate stage points
    recalculate: async (stageId) => {
        const response = await apiClient.post(`/leaderboard/stage/${stageId}/recalculate`);
        return response.data;
    }
};

export default leaderboardAPI;