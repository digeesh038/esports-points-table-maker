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
import paymentsAPI from '../api/payments';
import { Calendar, Users, Trophy, UserPlus, Target, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const PublicTournamentPage = () => {
    const { id } = useParams();
    const { isGuest } = useAuth();
    const { subscribeToLeaderboard, unsubscribeFromLeaderboard } = useSocket();
    const [tournament, setTournament] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registering, setRegistering] = useState(false);

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
        } catch (error) {
            toast.error('Failed to load tournament info');
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
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
            toast.error('Registration is restricted in guest mode.');
            return;
        }

        // Logic for PAID Tournament
        if (tournament.tournamentType === 'PAID') {
            try {
                setRegistering(true);
                const isRpayLoaded = await loadRazorpay();
                if (!isRpayLoaded) {
                    toast.error('Failed to load Razorpay SDK. Please check your connection.');
                    return;
                }

                // 1. Create Order
                const orderResponse = await paymentsAPI.createOrder(tournament.id);
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
                            setRegistering(true);
                            // 3. Verify Payment and Register Team
                            const verifyRes = await paymentsAPI.verify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                tournamentId: tournament.id,
                                teamData: teamData
                            });

                            toast.success('Registration & Payment Successful!');
                            setShowRegisterModal(false);
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
                            setRegistering(false);
                        }
                    },
                    prefill: {
                        name: teamData.contactName || '',
                        email: teamData.contactEmail || teamData.captainEmail || '',
                        contact: teamData.contactPhone || ''
                    },
                    modal: {
                        ondismiss: () => setRegistering(false)
                    },
                    theme: {
                        color: '#00F3FF'
                    }
                };

                const rpay = new window.Razorpay(options);
                rpay.open();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to initialize payment');
                setRegistering(false);
            }
            return;
        }

        // Logic for FREE Tournament
        try {
            setRegistering(true);
            await teamsAPI.register(tournament.id, teamData);
            toast.success('Team registered successfully! Awaiting approval.');
            setShowRegisterModal(false);
            fetchTournamentData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register team');
        } finally {
            setRegistering(false);
        }
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
                            <Users className="w-5 h-5 mr-3 text-neon-pink" />
                            <span className="font-bold text-white">{tournament.teams?.length || 0} Entities Registered</span>
                        </div>
                    </div>

                    {canRegister && (
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="btn-primary py-4 px-12 text-lg font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(0,183,255,0.4)]"
                        >
                            <UserPlus className="w-6 h-6 mr-3" />
                            {tournament.tournamentType === 'PAID' ? `Register Your Team (₹${tournament.entryFee})` : 'Register Your Team'}
                        </button>
                    )}
                    {isGuest && (
                        <div className="text-xs font-mono text-neon-blue/60 uppercase tracking-widest italic">
                            Spectator View Only • Authorization Required for Registration
                        </div>
                    )}
                </div>
            </div>

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
                    <TeamForm onSubmit={handleRegisterTeam} loading={registering} />
                </div>
            </Modal>
        </div>
    );
};
export default PublicTournamentPage;
