import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import tournamentsAPI from '../api/tournaments';
import teamsAPI from '../api/teams';
import paymentsAPI from '../api/payments';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import StageForm from '../components/tournament/StageForm';
import TeamList from '../components/team/TeamList';
import RosterManager from '../components/team/RosterManager';
import TeamForm from '../components/team/TeamForm';
import Button from '../components/common/Button';
import apiClient from '../api/client';
import { Calendar, Users, Trophy, Plus, Target, Zap, UserPlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TournamentDetailPage = () => {
    const { id } = useParams();
    const { isGuest } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStageModal, setShowStageModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [creatingStage, setCreatingStage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const activeTeam = teams.find(t => t.id === selectedTeamId);

    useEffect(() => {
        fetchTournamentData();
    }, [id]);

    const fetchTournamentData = async () => {
        if (isGuest) {
            const mockTournaments = {
                'dummy-1': {
                    id: 'dummy-1',
                    name: 'FREE FIRE: GLOBAL SHOWDOWN',
                    game: 'free_fire',
                    status: 'registration_open',
                    startDate: new Date().toISOString(),
                    maxTeams: 48,
                    description: 'The ultimate battle royale competition with top guilds competing for the glory.',
                    stages: [
                        { id: 'mock-stage-1', name: 'Qualifiers', stageNumber: 1, numberOfMatches: 12, status: 'ongoing' },
                        { id: 'mock-stage-2', name: 'Grand Finals', stageNumber: 2, numberOfMatches: 6, status: 'scheduled' }
                    ],
                    teams: [
                        { id: 'mock-team-1', name: 'Team Shadow', status: 'approved' },
                        { id: 'mock-team-2', name: 'Phantom Guild', status: 'approved' },
                        { id: 'mock-team-3', name: 'Cyber Warriors', status: 'pending' }
                    ]
                }
            };

            const mockData = mockTournaments[id] || mockTournaments['dummy-1'];
            setTournament(mockData);
            setTeams(mockData.teams);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await tournamentsAPI.getById(id);
            const tournamentData = response.data.tournament;
            setTournament(tournamentData);
            setTeams(tournamentData.teams || []);
        } catch (error) {
            toast.error('Failed to load tournament data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStage = async (stageData) => {
        if (isGuest) {
            toast.error('Guest access restricted.');
            return;
        }
        try {
            setCreatingStage(true);
            await tournamentsAPI.createStage(id, stageData);
            toast.success('Stage created successfully!');
            setShowStageModal(false);
            fetchTournamentData();
        } catch (error) {
            toast.error('Failed to create stage');
        } finally {
            setCreatingStage(false);
        }
    };

    const handleManageRoster = (team) => {
        setSelectedTeamId(team.id);
        setShowPlayerModal(true);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleDownloadReceipt = async (paymentId, receiptNumber) => {
        try {
            const blob = await paymentsAPI.getReceipt(paymentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${receiptNumber || 'payment'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    const handleRegisterTeam = async (teamData) => {
        if (isGuest) {
            toast.error('Guest access restricted.');
            return;
        }

        const isFull = tournament?.maxTeams > 0 && teams.length >= tournament.maxTeams;
        if (isFull) {
            toast.error(`Tournament is full (${tournament.maxTeams}/${tournament.maxTeams} teams).`);
            return;
        }

        // Logic for PAID Tournament
        if (tournament.tournamentType === 'PAID') {
            try {
                setSubmitting(true);
                const isRpayLoaded = await loadRazorpay();
                if (!isRpayLoaded) {
                    toast.error('Failed to load Razorpay SDK. Please check your connection.');
                    return;
                }

                // 1. Create Order
                const orderResponse = await paymentsAPI.createOrder(id);
                const { order_id, amount, razorpay_key_id } = orderResponse.data;

                // 2. Open Razorpay Checkout
                const options = {
                    key: razorpay_key_id,
                    amount: amount,
                    currency: 'INR',
                    name: 'Esports Points Table',
                    description: `Entry Fee for ${tournament.name}`,
                    order_id: order_id,
                    handler: async (response) => {
                        try {
                            setSubmitting(true);
                            // 3. Verify Payment and Register Team
                            const verifyRes = await paymentsAPI.verify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                tournamentId: id,
                                teamData: teamData
                            });

                            toast.success('Registration & Payment Successful!');
                            setShowTeamModal(false);
                            fetchTournamentData();

                            // 4. Receipt Download Option
                            const paymentId = verifyRes.data.data.paymentId;
                            const receiptNo = verifyRes.data.data.receiptNumber;
                            if (window.confirm('Registration successful! Download your receipt now?')) {
                                handleDownloadReceipt(paymentId, receiptNo);
                            }
                        } catch (err) {
                            toast.error(err.response?.data?.message || 'Payment verification failed');
                        } finally {
                            setSubmitting(false);
                        }
                    },
                    prefill: {
                        name: teamData.contactName || '',
                        email: teamData.contactEmail || '',
                        contact: teamData.contactPhone || ''
                    },
                    modal: {
                        ondismiss: () => setSubmitting(false)
                    },
                    theme: {
                        color: '#00F3FF'
                    }
                };

                const rpay = new window.Razorpay(options);
                rpay.open();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to initialize payment');
                setSubmitting(false);
            }
            return;
        }

        // Logic for FREE Tournament
        try {
            setSubmitting(true);
            await teamsAPI.register(id, teamData);
            toast.success('Team registered successfully.');
            setShowTeamModal(false);
            fetchTournamentData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register team');
        } finally {
            setSubmitting(false);
        }
    };



    const handleApproveTeam = async (teamId) => {
        if (isGuest) return;
        try {
            await teamsAPI.updateStatus(teamId, 'approved');
            toast.success('Team approved.');
            fetchTournamentData();
        } catch (error) {
            toast.error('Approval failed');
        }
    };

    const handleRejectTeam = async (teamId) => {
        if (isGuest) return;
        try {
            await teamsAPI.updateStatus(teamId, 'rejected');
            toast.success('Team rejected.');
            fetchTournamentData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDeleteStage = async (stageId) => {
        if (isGuest) return;
        if (!window.confirm("Are you sure you want to delete this stage? All matches within it will also be deleted.")) return;

        try {
            await tournamentsAPI.deleteStage(id, stageId);
            toast.success('Stage deleted successfully');
            fetchTournamentData();
        } catch (error) {
            toast.error('Failed to delete stage');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (isGuest) return;
        try {
            await teamsAPI.remove(teamId);
            toast.success('Team record removed.');
            fetchTournamentData();
        } catch (error) {
            toast.error('Failed to remove team');
        }
    };

    const handleEraseAllTeams = async () => {
        if (isGuest) return;
        if (!window.confirm("WARNING: This will permanently delete ALL teams from this tournament. Continue?")) return;

        try {
            setSubmitting(true);
            await teamsAPI.deleteAll(id);
            toast.success('All teams have been removed.');
            fetchTournamentData();
        } catch (error) {
            toast.error('Failed to clear teams.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportTeams = async () => {
        try {
            const blob = await tournamentsAPI.exportTeams(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tournament-teams-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Teams exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export teams');
        }
    };

    if (loading) return <Loader text="Loading tournament details..." />;
    if (!tournament) return <div className="text-center py-12 text-gray-400 font-mono italic">TOURNAMENT NOT FOUND</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Cinematic Hero */}
            <header className="relative overflow-hidden rounded-3xl border border-dark-600 bg-dark-950/40 backdrop-blur-xl p-8 md:p-12">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neon-blue/10 to-transparent pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-neon-green/10 text-neon-green border-neon-green/30 animate-pulse">
                                {tournament.status?.replace('_', ' ') || 'ACTIVE'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic leading-[1.1] mb-4 pr-4">
                                {tournament.name.toUpperCase()}
                            </h1>
                            <p className="border-l-2 border-neon-blue pl-6 py-2 text-gray-400 text-lg font-medium">
                                {tournament.description || 'Participate in upcoming tournaments and leagues.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-dark-800/40 p-4 rounded-2xl border border-dark-600">
                                <Trophy className="w-5 h-5 text-neon-blue mb-2" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Game</p>
                                <p className="text-white font-black text-sm uppercase">{tournament.game.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-dark-800/40 p-4 rounded-2xl border border-dark-600">
                                <Calendar className="w-5 h-5 text-neon-purple mb-2" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Date</p>
                                <p className="text-white font-black text-sm">{tournament.startDate ? format(new Date(tournament.startDate), 'MMM dd, yyyy') : 'Pending'}</p>
                            </div>
                            <div className="bg-dark-800/40 p-4 rounded-2xl border border-dark-600">
                                <Users className="w-5 h-5 text-neon-pink mb-2" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Teams</p>
                                <p className="text-white font-black text-sm">{teams.length} / {tournament.maxTeams || '∞'}</p>
                            </div>
                            <div className="bg-dark-800/40 p-4 rounded-2xl border border-dark-600">
                                <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Status</p>
                                <p className="text-white font-black text-sm uppercase">Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-900/60 p-6 rounded-2xl border border-dark-600 space-y-4 shadow-2xl min-w-[260px]">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center border-b border-white/5 pb-3">Actions</p>
                        {!isGuest && (
                            <Link to={`/dashboard/tournaments/${id}/edit`} className="w-full btn-secondary text-[10px] font-black tracking-widest py-3 flex items-center justify-center gap-2 group italic">
                                <Zap className="w-4 h-4 text-neon-blue group-hover:scale-125 transition-transform" />
                                Edit Tournament
                            </Link>
                        )}
                        <Link to={`/leaderboard/${id}`} className="w-full bg-dark-800/50 border border-neon-blue/30 text-neon-blue text-[10px] font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-neon-blue/10 hover:border-neon-blue hover:text-white hover:shadow-[0_0_20px_rgba(0,243,255,0.25)] transition-all duration-300 italic group overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            View Standings
                        </Link>
                        {!isGuest && (
                            <button onClick={handleExportTeams} className="w-full bg-dark-800/50 border border-neon-green/30 text-neon-green text-[10px] font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-neon-green/10 hover:border-neon-green hover:text-white hover:shadow-[0_0_20px_rgba(0,255,102,0.25)] transition-all duration-300 italic group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Export Teams (PDF)
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stages */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black italic text-white flex items-center uppercase tracking-tighter">
                                <span className="w-2 h-8 bg-neon-purple mr-3 rounded-full shadow-[0_0_15px_rgba(188,19,254,0.5)]"></span>
                                Tournament Stages
                            </h2>
                            {!isGuest && (
                                <Button onClick={() => setShowStageModal(true)} variant="outline" size="sm" className="!rounded-xl border-neon-purple/50 text-neon-purple hover:bg-neon-purple hover:text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Stage
                                </Button>
                            )}
                        </div>
                        {tournament.stages?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tournament.stages.map(stage => (
                                    <div key={stage.id} className="group card-interactive min-h-[160px] flex flex-col justify-between hover:border-neon-blue/40 transition-all">
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <h3 className="text-lg font-black italic text-white group-hover:text-neon-blue transition-colors uppercase">{stage.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono tracking-widest mt-1">MATCHES: {stage.matches ? stage.matches.length : (stage.totalMatches || stage.numberOfMatches || 0)}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black px-2 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded uppercase">STAGE {stage.stageNumber}</span>
                                                    {!isGuest && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDeleteStage(stage.id);
                                                            }}
                                                            className="p-1.5 bg-red-500/10 text-red-500 rounded border border-red-500/10 hover:border-red-500/50 transition-all active:scale-90 hover:bg-red-500/20"
                                                            title="Delete Stage"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neon-purple italic">
                                                {(!stage.matches || stage.matches.length === 0) ? 'NO MATCHES YET' : (stage.status === 'pending' ? 'ACTIVE' : stage.status)}
                                            </span>
                                            <Link
                                                to={`/dashboard/tournaments/${id}/stages/${stage.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-neon-blue hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/link transition-all"
                                            >
                                                {isGuest ? 'View Results' : 'Manage Matches +'}
                                                <Plus className="w-3 h-3 group-hover/link:rotate-90 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border-2 border-dark-600 bg-dark-800/10 text-center py-20 rounded-3xl italic text-gray-500">
                                No stages created yet.
                            </Card>
                        )}
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Teams Sidebar */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black italic text-white flex items-center uppercase tracking-tighter">
                                <span className="w-2 h-8 bg-neon-pink mr-3 rounded-full shadow-[0_0_15px_rgba(255,46,151,0.5)]"></span>
                                Teams
                            </h2>
                            {!isGuest && (
                                <div className="flex gap-2">
                                    {teams.length > 0 && (
                                        <Button
                                            onClick={handleEraseAllTeams}
                                            variant="ghost"
                                            size="sm"
                                            className="!text-[10px] !p-2 !rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                        >
                                            ERASE ALL TEAMS
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setShowTeamModal(true)}
                                        variant="primary"
                                        className={`!px-6 !py-2.5 !rounded-xl text-[10px] font-black shadow-neon-pink/20 uppercase tracking-widest italic ${teams.length >= tournament.maxTeams ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        disabled={tournament.maxTeams > 0 && teams.length >= tournament.maxTeams}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {tournament.maxTeams > 0 && teams.length >= tournament.maxTeams
                                            ? 'LIMIT REACHED'
                                            : tournament.tournamentType === 'PAID'
                                                ? `Register Team (₹${tournament.entryFee})`
                                                : 'Register Team'}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Card className="bg-dark-800/40 border-neon-pink/20 p-0 overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neon-pink">
                                <span>Roster Overview</span>
                                <span className="text-gray-500">{teams.length} Teams</span>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6">
                                <TeamList
                                    teams={teams}
                                    showActions={!isGuest}
                                    onApprove={handleApproveTeam}
                                    onReject={handleRejectTeam}
                                    onDelete={handleDeleteTeam}
                                    onAddPlayer={handleManageRoster}
                                    onDownloadReceipt={handleDownloadReceipt}
                                    className="grid grid-cols-1 gap-6"
                                />
                            </div>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={showStageModal} onClose={() => setShowStageModal(false)} title="Create New Stage">
                <div className="p-6 bg-dark-900/50"><StageForm onSubmit={handleCreateStage} loading={creatingStage} tournamentGame={tournament.game} /></div>
            </Modal>
            <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Register New Team">
                <div className="p-6 bg-dark-900/50"><TeamForm onSubmit={handleRegisterTeam} loading={submitting} /></div>
            </Modal>

            <Modal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} title="Manage Team Roster">
                <div className="p-6 bg-dark-900/50">
                    {activeTeam && (
                        <RosterManager
                            team={activeTeam}
                            onUpdate={fetchTournamentData}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default TournamentDetailPage;