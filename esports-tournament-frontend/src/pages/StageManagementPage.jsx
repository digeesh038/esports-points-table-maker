import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matchesAPI from '../api/matches';
import teamsAPI from '../api/teams';
import tournamentsAPI from '../api/tournaments';
import Loader from '../components/common/Loader';
import MatchList from '../components/match/MatchList';
import Modal from '../components/common/Modal';
import MatchResultForm from '../components/match/MatchResultForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Target, Calendar, ChevronLeft, Plus, Zap, Shield, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const StageManagementPage = () => {
    const { tournamentId, stageId } = useParams();
    const navigate = useNavigate();
    const { isGuest } = useAuth();

    const [matches, setMatches] = useState([]);
    const [stage, setStage] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showResultModal, setShowResultModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [teams, setTeams] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [matchFormData, setMatchFormData] = useState({
        matchNumber: '',
        mapName: '',
        scheduledTime: '',
        customTitle: ''
    });

    useEffect(() => {
        if (!tournamentId || !stageId) {
            setError('Invalid access parameters. Please return to the tournament page.');
            setLoading(false);
            return;
        }
        fetchStageAndMatches();
    }, [stageId, tournamentId]);

    const fetchStageAndMatches = async () => {
        if (isGuest) {
            const mockStage = { id: stageId, name: 'Qualifier Phase', stageNumber: 1, status: 'active' };
            const mockTournament = { id: tournamentId, name: 'PREMIER CHAMPIONSHIP' };
            const mockMatches = [
                {
                    id: 'mock-match-1',
                    matchNumber: 1,
                    customTitle: 'TEAM SHADOW VS PHANTOM GUILD',
                    status: 'completed',
                    mapName: 'Bermuda',
                    scheduledTime: new Date().toISOString(),
                    isLocked: true,
                    results: [
                        { id: 'r1', team: { name: 'Team Shadow' }, kills: 12, topPlayerName: 'Ghost' },
                        { id: 'r2', team: { name: 'Phantom Guild' }, kills: 8, topPlayerName: 'Wraith' }
                    ]
                }
            ];

            setStage(mockStage);
            setTournament(mockTournament);
            setMatches(mockMatches);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [matchesResponse, tourneyResponse] = await Promise.all([
                matchesAPI.getAll({ stageId }).catch(e => ({ matches: [] })),
                tournamentsAPI.getById(tournamentId)
            ]);

            const matchesData = matchesResponse?.data?.matches || matchesResponse?.matches || [];
            const tournamentData = tourneyResponse?.data?.tournament || tourneyResponse?.tournament;

            if (!tournamentData) {
                throw new Error('Tournament data not found');
            }

            setMatches(Array.isArray(matchesData) ? matchesData : []);
            setTournament(tournamentData);

            const currentStage = tournamentData?.stages?.find(s => s.id === stageId);
            setStage(currentStage || (matchesData.length > 0 ? matchesData[0].stage : null));

        } catch (error) {
            console.error('Error in StageManagementPage:', error);
            setError('Failed to load stage data. Please try again.');
            toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEditResults = async (match) => {
        if (isGuest) return;
        setSelectedMatch(match);
        setShowResultModal(true);
        try {
            const tId = tournamentId;
            const response = await teamsAPI.getByTournament(tId);
            const teamsData = response?.data?.teams || response?.teams || [];
            setTeams(teamsData);
        } catch (error) {
            toast.error('Failed to load roster');
        }
    };

    const handleSubmitResults = async (resultData) => {
        if (!selectedMatch) return;
        try {
            setSubmitting(true);
            await matchesAPI.submitResult(selectedMatch.id, resultData);
            toast.success('Results saved successfully.');
            setShowResultModal(false);
            fetchStageAndMatches();
        } catch (error) {
            toast.error('Failed to save scores');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...matchFormData,
                stageId,
                matchNumber: parseInt(matchFormData.matchNumber)
            };

            if (selectedMatch) {
                await matchesAPI.update(selectedMatch.id, payload);
                toast.success('Match updated successfully.');
            } else {
                await matchesAPI.create(payload);
                toast.success('Match created successfully.');
            }
            setShowMatchModal(false);
            setMatchFormData({ matchNumber: '', mapName: '', scheduledTime: '', customTitle: '' });
            setSelectedMatch(null);
            fetchStageAndMatches();
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditMatchDetails = (match) => {
        setSelectedMatch(match);
        setMatchFormData({
            matchNumber: match.matchNumber?.toString() || '',
            customTitle: match.customTitle || '',
            mapName: match.mapName || '',
            scheduledTime: match.scheduledTime ? new Date(match.scheduledTime).toISOString().slice(0, 16) : ''
        });
        setShowMatchModal(true);
    };

    const handleLock = async (matchId) => {
        try {
            await matchesAPI.lock(matchId);
            toast.success('Status toggled');
            fetchStageAndMatches();
        } catch (error) {
            toast.error('Lock failed');
        }
    };

    const handleDeleteMatch = async (matchId) => {
        try {
            await matchesAPI.delete(matchId);
            toast.success('Match deleted');
            fetchStageAndMatches();
        } catch (error) {
            toast.error('Purge failed');
        }
    };

    if (loading) return <Loader text="Loading stage..." fullScreen={true} />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-mono italic">
                    {error}
                </div>
                <Button onClick={() => navigate(-1)} variant="outline">
                    Return to Tournament
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center hover:border-neon-blue transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-neon-blue" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-4 h-4 text-neon-purple" />
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                {tournament?.name || 'Tournament'} / {stage?.name || 'Phase'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent italic flex items-center italic uppercase">
                            Stage Management
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {!isGuest && (
                        <Button
                            onClick={() => {
                                const nextNumber = matches.length + 1;
                                const now = new Date();
                                setMatchFormData({
                                    matchNumber: nextNumber.toString(),
                                    customTitle: `Match #${nextNumber}`,
                                    mapName: '',
                                    scheduledTime: now.toISOString().slice(0, 16)
                                });
                                setSelectedMatch(null);
                                setShowMatchModal(true);
                            }}
                            variant="primary"
                            className="shadow-[0_0_20px_rgba(0,183,255,0.3)] !rounded-xl"
                        >
                            <Plus className="w-5 h-5 mr-3" />
                            Add New Match
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark-800/40 border-dark-600 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                        <Zap className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Status</p>
                    <h3 className="text-2xl font-black text-neon-green italic uppercase">Active</h3>
                </Card>
                <Card className="bg-dark-800/40 border-dark-600 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                        <Target className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Total Matches</p>
                    <h3 className="text-2xl font-black text-white italic uppercase">{matches.length}</h3>
                </Card>
                <Card className="bg-dark-800/40 border-dark-600 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                        <Shield className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Privacy</p>
                    <h3 className="text-2xl font-black text-neon-blue italic uppercase">Private</h3>
                </Card>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-neon-purple rounded-full shadow-neon-purple/50"></div>
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Scheduled Matches</h2>
                </div>

                {matches.length === 0 ? (
                    <Card className="border-dashed border-2 border-dark-600 bg-dark-800/20 py-24 text-center rounded-3xl">
                        <p className="text-gray-500 italic text-xl">No matches found in the current phase.</p>
                    </Card>
                ) : (
                    <div className="bg-dark-800/20 backdrop-blur-md rounded-2xl border border-dark-600 p-8 shadow-2xl">
                        <MatchList
                            matches={matches}
                            onEditResults={handleEditResults}
                            onEditDetails={handleEditMatchDetails}
                            onLock={handleLock}
                            onDelete={handleDeleteMatch}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={showResultModal}
                onClose={() => setShowResultModal(false)}
                title={`Enter Results: ${selectedMatch?.customTitle || 'Match'}`}
            >
                <div className="p-6 bg-dark-900/80">
                    {teams.length > 0 ? (
                        <MatchResultForm
                            teams={teams}
                            initialResults={selectedMatch?.results || []}
                            onSubmit={handleSubmitResults}
                            loading={submitting}
                        />
                    ) : (
                        <div className="py-10 text-center"><Loader text="Loading Teams..." /></div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showMatchModal}
                onClose={() => { setShowMatchModal(false); setSelectedMatch(null); }}
                title={selectedMatch ? "Edit Match" : "Add Match"}
            >
                <form onSubmit={handleCreateMatch} className="p-8 space-y-6 bg-dark-900/80">
                    <Input
                        label="Match Title"
                        type="text"
                        value={matchFormData.customTitle}
                        onChange={(e) => setMatchFormData({ ...matchFormData, customTitle: e.target.value })}
                        placeholder="e.g. SEMI FINALS #1"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Match Order"
                            type="number"
                            value={matchFormData.matchNumber}
                            onChange={(e) => setMatchFormData({ ...matchFormData, matchNumber: e.target.value })}
                            required
                        />
                        <Input
                            label="Map Name"
                            type="text"
                            value={matchFormData.mapName}
                            onChange={(e) => setMatchFormData({ ...matchFormData, mapName: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Scheduled Time"
                        type="datetime-local"
                        value={matchFormData.scheduledTime}
                        onChange={(e) => setMatchFormData({ ...matchFormData, scheduledTime: e.target.value })}
                        required
                    />
                    <Button type="submit" fullWidth loading={submitting} className="shadow-neon-blue/20 mt-4 py-4 italic">
                        {selectedMatch ? 'Saving Changes...' : 'Save Match'}
                    </Button>
                </form>
            </Modal>

        </div >
    );
};

export default StageManagementPage;
