import { useState, useEffect, useCallback } from 'react';
import { tournamentsAPI } from '../api/tournaments';
import { toast } from 'react-toastify';

export const useTournaments = (initialFetch = true) => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTournaments = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.getUserTournaments(params);
            setTournaments(data);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch tournaments');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicTournaments = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.getAll(params);
            setTournaments(data);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch public tournaments');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getTournamentById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.getById(id);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch tournament details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTournament = useCallback(async (tournamentData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.create(tournamentData);
            setTournaments(prev => [data, ...prev]);
            toast.success('Tournament created successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to create tournament');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTournament = useCallback(async (id, tournamentData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.update(id, tournamentData);
            setTournaments(prev =>
                prev.map(t => t.id === id ? data : t)
            );
            toast.success('Tournament updated successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update tournament');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTournament = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await tournamentsAPI.delete(id);
            setTournaments(prev => prev.filter(t => t.id !== id));
            toast.success('Tournament deleted successfully!');
            return { success: true };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to delete tournament');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTournamentStatus = useCallback(async (id, status) => {
        setLoading(true);
        setError(null);
        try {
            const data = await tournamentsAPI.updateStatus(id, status);
            setTournaments(prev =>
                prev.map(t => t.id === id ? { ...t, status } : t)
            );
            toast.success(`Tournament ${status}!`);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update tournament status');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFetch) {
            fetchTournaments();
        }
    }, [initialFetch, fetchTournaments]);

    return {
        tournaments,
        loading,
        error,
        fetchTournaments,
        fetchPublicTournaments,
        getTournamentById,
        createTournament,
        updateTournament,
        deleteTournament,
        updateTournamentStatus,
    };
};

export default useTournaments;