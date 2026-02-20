import { useState, useEffect, useCallback } from 'react';
import { matchesAPI } from '../api/matches';
import { toast } from 'react-toastify';

export const useMatches = (initialFetch = true) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMatches = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await matchesAPI.getAll(params);
            setMatches(data);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch matches');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getMatchById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await matchesAPI.getById(id);
            return data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch match details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createMatch = useCallback(async (matchData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await matchesAPI.create(matchData);
            setMatches(prev => [data, ...prev]);
            toast.success('Match created successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to create match');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMatch = useCallback(async (id, matchData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await matchesAPI.update(id, matchData);
            setMatches(prev => prev.map(m => m.id === id ? data : m));
            toast.success('Match updated successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update match');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const submitMatchResult = useCallback(async (id, resultData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await matchesAPI.submitResult(id, resultData);
            setMatches(prev => prev.map(m => m.id === id ? data : m));
            toast.success('Match result submitted successfully!');
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to submit match result');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteMatch = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await matchesAPI.delete(id);
            setMatches(prev => prev.filter(m => m.id !== id));
            toast.success('Match deleted successfully!');
            return { success: true };
        } catch (err) {
            setError(err.message);
            toast.error('Failed to delete match');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFetch) {
            fetchMatches();
        }
    }, [initialFetch, fetchMatches]);

    return {
        matches,
        loading,
        error,
        fetchMatches,
        getMatchById,
        createMatch,
        updateMatch,
        submitMatchResult,
        deleteMatch,
    };
};

export default useMatches;