import { useState, useEffect, useCallback } from 'react';
import { teamsAPI } from '../api/teams';
import { toast } from 'react-toastify';

export const useTeams = (initialFetch = true) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTeams = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamsAPI.getAll(params);
            setTeams(data);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch teams');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getTeamById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamsAPI.getById(id);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch team details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTeam = useCallback(async (teamData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamsAPI.create(teamData);
            setTeams(prev => [data, ...prev]);
            toast.success('Team created successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to create team');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTeam = useCallback(async (id, teamData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await teamsAPI.update(id, teamData);
            setTeams(prev => prev.map(t => t.id === id ? data : t));
            toast.success('Team updated successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update team');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTeam = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await teamsAPI.delete(id);
            setTeams(prev => prev.filter(t => t.id !== id));
            toast.success('Team deleted successfully!');
            return { success: true };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to delete team');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFetch) {
            fetchTeams();
        }
    }, [initialFetch, fetchTeams]);

    return {
        teams,
        loading,
        error,
        fetchTeams,
        getTeamById,
        createTeam,
        updateTeam,
        deleteTeam,
    };
};

export default useTeams;