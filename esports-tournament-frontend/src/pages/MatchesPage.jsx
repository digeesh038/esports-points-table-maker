import { useEffect, useState } from 'react';
import matchesAPI from '../api/matches';
import tournamentsAPI from '../api/tournaments';
import teamsAPI from '../api/teams';
import Loader from '../components/common/Loader';
import MatchList from '../components/match/MatchList';
import Modal from '../components/common/Modal';
import MatchResultForm from '../components/match/MatchResultForm';
import Card from '../components/common/Card';
import { Target, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const MatchesPage = () => {
    const { isGuest } = useAuth();
    const [matches, setMatches] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [teams, setTeams] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMatches();
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        if (isGuest) {
            setTournaments([{ id: 'dummy-1', name: 'FFMC: PRO LEAGUE' }]);
            return;
        }
        try {
            const response = await tournamentsAPI.getAll({ mine: true });
            setTournaments(response?.data?.tournaments || response?.tournaments || []);
        } catch (error) {
            console.error('Failed to load tournaments for selector', error);
        }
    };

    const fetchMatches = async () => {
        if (isGuest) {
            setMatches([
                { id: 'mock-match-1', matchNumber: 1, customTitle: 'TEAM SHADOW VS PHANTOM GUILD', stage: { name: 'Qualifiers', tournamentId: 'dummy-1', tournament: { name: 'FFMC: PRO LEAGUE' } }, status: 'completed', mapName: 'Bermuda', isLocked: true, results: [{ id: 'r1', team: { name: 'Team Shadow' }, kills: 12, totalPoints: 20, placementPoints: 8 }] },
                { id: 'mock-match-2', matchNumber: 2, customTitle: 'CYBER WARRIORS VS HYDRA PRO', stage: { name: 'Qualifiers', tournamentId: 'dummy-1', tournament: { name: 'FFMC: PRO LEAGUE' } }, status: 'live', mapName: 'Purgatory', results: [] }
            ]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await matchesAPI.getAll({ mine: true });
            setMatches(response?.data?.matches || response?.matches || []);
        } catch (error) {
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    // Derived tournaments list from all tournaments fetched
    const tournamentList = tournaments;

    const handleEditResults = async (match) => {
        if (isGuest) {
            toast.error('Guest access restricted.');
            return;
        }
        setSelectedMatch(match);
        setShowResultModal(true);
        try {
            const tournamentId = match.stage?.tournamentId;
            if (tournamentId) {
                const response = await teamsAPI.getByTournament(tournamentId);
                const allTeams = response.data.teams || [];
                setTeams(allTeams);
            }
        } catch (error) {
            toast.error('Failed to load roster for match');
        }
    };

    const handleSubmitResults = async (resultData) => {
        if (isGuest) {
            toast.error('Guest access restricted.');
            return;
        }
        try {
            setSubmitting(true);
            await matchesAPI.submitResult(selectedMatch.id, resultData);
            toast.success('Match results saved');
            setShowResultModal(false);
            // Refresh feed
            await fetchMatches();
        } catch (error) {
            toast.error('Error recording match results');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLock = async (matchId) => {
        if (isGuest) {
            toast.error('Guest access restricted.');
            return;
        }
        try {
            const response = await matchesAPI.lock(matchId);
            toast.success(response.message || 'Match status updated');
            fetchMatches();
        } catch (error) {
            toast.error('Failed to update match status');
        }
    };

    const handleDeleteMatch = async (matchId) => {
        if (isGuest) return;
        try {
            await matchesAPI.delete(matchId);
            toast.success('Match deleted successfully');
            fetchMatches();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete match');
        }
    };

    const filteredMatches = matches.filter(match => {
        if (statusFilter === 'all') return true;
        return match.status === statusFilter;
    });

    if (loading) return <Loader text="Synchronizing feed..." />;

    return (
        <div className="space-y-10 px-2 lg:px-6">
            {/* Header */}
            {/* HEADER */}
            <div className="relative mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-blue/40 via-transparent to-transparent" />
                    <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] opacity-60">
                        Tactical // Match Feed
                    </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            <span className="text-white">COMBAT</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-blue to-neon-purple drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">INTELLIGENCE</span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-2xl border-l-2 border-neon-blue/30 pl-4 py-1">
                            Monitor and process real-time match data across all active tournament nodes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 custom-scrollbar">
                {[
                    { id: 'all', label: 'All', icon: <Target className="w-5 h-5 text-neon-blue" />, color: 'neon-blue' },
                    { id: 'live', label: 'Live', icon: <Target className="w-5 h-5 text-neon-green animate-pulse" />, color: 'neon-green' },
                    { id: 'completed', label: 'Completed', icon: <Target className="w-5 h-5 text-neon-purple" />, color: 'neon-purple' }
                ].map((filter) => (
                    <Card
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id)}
                        className={`flex-shrink-0 w-[200px] xs:w-[240px] md:w-auto bg-dark-800/20 p-4 flex items-center justify-between group transition-all cursor-pointer ${statusFilter === filter.id
                            ? `border-${filter.color} shadow-[0_0_15px_rgba(0,183,255,0.1)]`
                            : 'border-dark-700/50 hover:border-dark-400'
                            }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center mr-4 border border-dark-600 transition-all ${statusFilter === filter.id ? 'scale-110' : ''}`}>
                                {filter.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Filter</p>
                                <p className={`font-bold text-sm md:text-base transition-colors ${statusFilter === filter.id ? `text-${filter.color}` : 'text-white'}`}>
                                    {filter.label}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-all ${statusFilter === filter.id ? `text-${filter.color} translate-x-1` : 'text-gray-700 group-hover:text-gray-400'}`} />
                    </Card>
                ))}
            </div>

            {/* Match Feed */}
            <div className="bg-dark-800/20 backdrop-blur-md rounded-2xl border border-dark-600 p-8 shadow-2xl">
                {filteredMatches.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-500 italic text-xl uppercase tracking-widest">
                            No {statusFilter} matches found.
                        </p>
                    </div>
                ) : (
                    <MatchList
                        matches={filteredMatches}
                        onEditResults={handleEditResults}
                        onLock={handleLock}
                        onDelete={handleDeleteMatch}
                    />
                )}
            </div>

            {/* Modal: Results Update */}
            <Modal
                isOpen={showResultModal}
                onClose={() => setShowResultModal(false)}
                title={`UPDATE RESULT: MATCH ${selectedMatch?.matchNumber || selectedMatch?.matchNo || '#'}`}
            >
                <div className="min-h-[400px]">
                    {teams.length > 0 ? (
                        <MatchResultForm
                            teams={teams}
                            initialResults={selectedMatch?.results || []}
                            playerResults={selectedMatch?.playerResults || []}
                            onSubmit={handleSubmitResults}
                            loading={submitting}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Fetching Team Rosters...</p>
                        </div>
                    )}
                </div>
            </Modal>

        </div>
    );
};

export default MatchesPage;