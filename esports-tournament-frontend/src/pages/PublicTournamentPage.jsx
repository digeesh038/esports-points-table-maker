import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import TeamForm from '../components/team/TeamForm';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import tournamentsAPI from '../api/tournaments';
import leaderboardAPI from '../api/leaderboard';
import teamsAPI from '../api/teams';
import PaymentReceipt from '../components/payment/PaymentReceipt';
import TeamCard from '../components/team/TeamCard';
import { Calendar, Users, Trophy, UserPlus, Target, Zap, LayoutGrid, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
// UPI/QR manual payment — no external SDK needed

const PublicTournamentPage = () => {
    const { id } = useParams();
    const { isGuest } = useAuth();
    const { subscribeToLeaderboard, unsubscribeFromLeaderboard } = useSocket();
    const [tournament, setTournament] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [userTeams, setUserTeams] = useState([]);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedReceiptTeam, setSelectedReceiptTeam] = useState(null);

    useEffect(() => {
        fetchTournamentData();
    }, [id]);

    useEffect(() => {
        if (tournament?.stages?.[0]) {
            const stageId = tournament.stages[0].id;
            subscribeToLeaderboard(stageId, (data) => {
                // Handle nested structure from emitStageLeaderboardUpdate
                const updatedLeaderboard = data.leaderboard?.leaderboard || data.leaderboard || [];
                setLeaderboard(updatedLeaderboard);
            });

            return () => unsubscribeFromLeaderboard(stageId);
        }
    }, [tournament, subscribeToLeaderboard, unsubscribeFromLeaderboard]);

    const fetchTournamentData = async () => {
        if (isGuest) {
            // ... mock logic ...
            const mockTournaments = {
                'dummy-1': { id: 'dummy-1', name: 'FREE FIRE: GLOBAL SHOWDOWN', game: 'free_fire', status: 'registration_open', startDate: new Date().toISOString(), description: 'The ultimate battle royale competition with top guilds.', teams: new Array(12).fill({}), stages: [{ id: 'mock-stage' }] },
                'dummy-2': { id: 'dummy-2', name: 'BGMI PRO LEAGUE S4', game: 'bgmi', status: 'ongoing', startDate: new Date().toISOString(), description: 'Elite teams from across the country.', teams: new Array(8).fill({}), stages: [{ id: 'mock-stage' }] },
                'dummy-3': { id: 'dummy-3', name: 'VALORANT: RADIANT CUP', game: 'valorant', status: 'completed', startDate: new Date().toISOString(), description: '5v5 Tactical shooter tournament.', teams: new Array(8).fill({}), stages: [{ id: 'mock-stage' }] }
            };
            const mockRankings = [
                { team: { name: 'Team Shadow' }, totalPoints: 145, totalKills: 32, matchesPlayed: 6, rank: 1 },
                { team: { name: 'Phantom Guild' }, totalPoints: 128, totalKills: 28, matchesPlayed: 6, rank: 2 }
            ];
            const data = mockTournaments[id] || mockTournaments['dummy-1'];
            setTournament(data);
            setLeaderboard(mockRankings);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await tournamentsAPI.getPublicById(id);
            setTournament(response.data.tournament);

            // Fetch leaderboard for the first stage if available
            if (response.data.tournament.stages?.[0]) {
                const lbResponse = await leaderboardAPI.getByStage(response.data.tournament.stages[0].id);
                setLeaderboard(lbResponse.data.leaderboard || []);
            }

            // If user is logged in, find their teams
            if (response.data.tournament.teams) {
                // In a real app, we'd filter by user id. Since we don't have user object here easily, 
                // we'll assume for now we want to show teams if they exist. 
                // Actually, let's filter teams that might belong to this user if we had auth info.
                // For now, let's just show all for the owner/public view if applicable? 
                // No, better to keep it specific.
            }
        } catch (error) {
            toast.error('Failed to load tournament info');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterTeam = async (teamData) => {
        if (isGuest) {
            toast.error('Registration is restricted in guest mode.');
            return;
        }

        try {
            setRegistering(true);

            // For both paid and free — submit directly
            // Paid: teamData already includes paymentProof (screenshot) from TeamForm
            const result = await teamsAPI.register(tournament.id, teamData);

            if (tournament.isPaid && tournament.entryFee > 0) {
                toast.success('✅ Team registered! Your payment is pending organizer verification.');
                // Show receipt
                if (result.data?.team) {
                    setSelectedReceiptTeam(result.data.team);
                    setShowReceiptModal(true);
                }
            } else {
                toast.success('Team registered successfully! Awaiting approval.');
            }

            setShowRegisterModal(false);
            fetchTournamentData();

        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to register team');
        } finally {
            setRegistering(false);
        }
    };

    const handleViewReceipt = (team) => {
        setSelectedReceiptTeam(team);
        setShowReceiptModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <Loader text="Decrypting tournament broadcast..." />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-center p-4">
                <Trophy className="w-20 h-20 text-dark-600 mb-6" />
                <h1 className="text-3xl font-black text-gray-400 italic mb-4 uppercase">Node Not Found</h1>
                <p className="text-gray-600 mb-8">The requested tournament broadcast is offline or private.</p>
                <Link to="/tournaments" className="btn-primary px-8">Return to Archive</Link>
            </div>
        );
    }

    const canRegister = tournament.status === 'registration_open' && !isGuest;

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Hero Section */}
            <div className="relative border-b border-white/5 overflow-hidden py-24">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neon-blue/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-neon-purple/5 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-blue text-[10px] font-black uppercase tracking-widest mb-6">
                        <Target className="w-3 h-3" /> PUBLIC_BROADCAST_ACTIVE
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic mb-6 uppercase tracking-tighter">
                        {tournament.name}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
                        {tournament.description || 'Participate in the next generation of competitive gaming protocols.'}
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 mb-12">
                        <div className="flex items-center bg-dark-800/50 px-5 py-2 rounded-xl border border-dark-600">
                            <Trophy className="w-5 h-5 mr-3 text-neon-blue" />
                            <span className="font-bold text-white uppercase">{tournament.game?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center bg-dark-800/50 px-5 py-2 rounded-xl border border-dark-600">
                            <Calendar className="w-5 h-5 mr-3 text-neon-purple" />
                            <span className="font-bold text-white">{format(new Date(tournament.startDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center bg-dark-800/50 px-5 py-2 rounded-xl border border-dark-600">
                            <Zap className={`w-5 h-5 mr-3 ${tournament.isPaid ? 'text-neon-pink' : 'text-neon-green'}`} />
                            <span className="font-bold text-white">
                                {tournament.isPaid ? `Entry: ${tournament.currency} ${tournament.entryFee}` : 'FREE ENTRY'}
                            </span>
                        </div>
                    </div>

                    {canRegister && (
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="btn-primary py-4 px-12 text-lg font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(0,183,255,0.4)]"
                        >
                            <UserPlus className="w-6 h-6 mr-3" />
                            Register Your Team
                        </button>
                    )}
                    {isGuest && (
                        <div className="text-xs font-mono text-neon-blue/60 uppercase tracking-widest italic">
                            Spectator View Only • Authorization Required for Registration
                        </div>
                    )}
                </div>
            </div>

            {/* My Teams Section (Personal context) */}
            {tournament.teams?.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-12 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-8 bg-neon-blue rounded-full shadow-[0_0_15px_rgba(0,183,255,0.5)]"></div>
                        <div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Your_Registration.sys</h2>
                            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-1">Personal node status and payment verification</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournament.teams.map(team => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                onViewReceipt={handleViewReceipt}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Leaderboard Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-2 h-10 bg-neon-purple rounded-full shadow-[0_0_15px_rgba(188,19,254,0.5)]"></div>
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Broadcast_Rankings.exe</h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Real-time node telemetry and scoring</p>
                    </div>
                </div>

                <div className="bg-dark-800/20 backdrop-blur-md rounded-3xl border border-dark-600 overflow-hidden shadow-2xl">
                    {leaderboard.length > 0 ? (
                        <LeaderboardTable leaderboard={leaderboard} />
                    ) : (
                        <div className="text-center py-32 bg-dark-900/40">
                            <Zap className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-20" />
                            <p className="text-gray-600 text-xl font-medium italic">
                                Awaiting match data synchronization...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            <Modal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                title="Register Your Team"
            >
                <div className="bg-dark-900 p-8">
                    <TeamForm onSubmit={handleRegisterTeam} loading={registering} tournament={tournament} />
                </div>
            </Modal>

            {/* Receipt Modal */}
            <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Payment Verification Receipt">
                <div className="p-2 md:p-6 bg-dark-900 border-t border-white/5">
                    {selectedReceiptTeam && (
                        <PaymentReceipt
                            team={selectedReceiptTeam}
                            tournament={tournament}
                            onClose={() => setShowReceiptModal(false)}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};
export default PublicTournamentPage;
