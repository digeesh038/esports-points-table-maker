import { useEffect, useState } from 'react';
import teamsAPI from '../api/teams';
import Loader from '../components/common/Loader';
import TeamList from '../components/team/TeamList';
import Card from '../components/common/Card';
import { Users, Search, Filter, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import tournamentsAPI from '../api/tournaments';
import Modal from '../components/common/Modal';
import TeamForm from '../components/team/TeamForm';
import RosterManager from '../components/team/RosterManager';
import SquadListView from '../components/team/SquadListView';
import { useAuth } from '../contexts/AuthContext';
import paymentsAPI from '../api/payments';
import { Download } from 'lucide-react';

const TeamsPage = () => {
    const { isGuest } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // View State
    const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'squad'
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    useEffect(() => {
        fetchTeams();
        fetchTournaments();
    }, []);

    const fetchTeams = async () => {
        if (isGuest) {
            setTeams([
                { id: 'mock-team-1', name: 'Team Shadow', tournament: { name: 'FREE FIRE: GLOBAL SHOWDOWN' }, players: [{}, {}, {}, {}], status: 'approved' },
                { id: 'mock-team-2', name: 'Phantom Guild', tournament: { name: 'FREE FIRE: GLOBAL SHOWDOWN' }, players: [{}, {}, {}, {}], status: 'approved' },
                { id: 'mock-team-3', name: 'Cyber Warriors', tournament: { name: 'FREE FIRE: GLOBAL SHOWDOWN' }, players: [{}, {}, {}, {}], status: 'pending' },
                { id: 'mock-team-4', name: 'Hydra Pro', tournament: { name: 'BGMI PRO LEAGUE S4' }, players: [{}, {}, {}, {}], status: 'approved' }
            ]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await teamsAPI.getAll();
            setTeams(response?.data?.teams || response?.teams || []);
        } catch (error) {
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchTournaments = async () => {
        try {
            const response = await tournamentsAPI.getAll({ mine: true });
            setTournaments(response?.data?.tournaments || []);
        } catch (error) {
            console.error('Failed to fetch tournaments', error);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
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
            const response = await paymentsAPI.downloadReceipt(paymentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${receiptNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Receipt Download Error:', error);
            toast.error('Failed to download receipt');
        }
    };

    const handleRegisterTeam = async (formData) => {
        if (isGuest) {
            toast.error('GUEST: Registration is restricted.');
            return;
        }

        const tournament = tournaments.find(t => t.id === formData.tournamentId);
        if (!tournament) {
            toast.error('Please select a valid tournament');
            return;
        }

        // Logic for PAID Tournament
        if (tournament.tournamentType === 'PAID') {
            try {
                setSubmitting(true);
                const isRpayLoaded = await loadRazorpay();
                if (!isRpayLoaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                // Create Order on Backend
                const orderRes = await paymentsAPI.createOrder(tournament.id);
                const { order_id, amount, razorpay_key_id } = orderRes.data;

                const options = {
                    key: razorpay_key_id,
                    amount: amount,
                    currency: "INR",
                    name: "ESPORTS_MANAGER",
                    description: `Entry Fee for ${tournament.name}`,
                    order_id: order_id,
                    handler: async (response) => {
                        try {
                            setSubmitting(true);
                            const verifyRes = await paymentsAPI.verify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                tournamentId: tournament.id,
                                teamData: formData
                            });

                            toast.success('Registration & Payment Successful!');
                            setShowModal(false);
                            fetchTeams();

                            if (window.confirm('Registration successful! Download your receipt now?')) {
                                handleDownloadReceipt(verifyRes.data.data.paymentId, verifyRes.data.data.receiptNumber);
                            }
                        } catch (err) {
                            console.error('Verification Error:', err);
                            toast.error(err.response?.data?.message || 'Payment verification failed');
                        } finally {
                            setSubmitting(false);
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: formData.captainEmail,
                        contact: formData.captainPhone
                    },
                    modal: {
                        ondismiss: () => {
                            setSubmitting(false);
                            toast.error('Payment cancelled by user');
                        }
                    },
                    theme: {
                        color: "#00b7ff"
                    }
                };

                const rpay = new window.Razorpay(options);
                rpay.open();
            } catch (error) {
                console.error('Payment/Registration error:', error);
                toast.error(error.response?.data?.message || 'Action failed');
            } finally {
                // Done via rpay handler or modal dismiss
            }
            return;
        }

        // Logic for FREE Tournament
        try {
            setSubmitting(true);
            await teamsAPI.register(formData.tournamentId, formData);
            toast.success('Team registered successfully');
            setShowModal(false);
            fetchTeams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (teamId) => {
        if (isGuest) {
            toast.error('GUEST: This action is restricted.');
            return;
        }
        try {
            await teamsAPI.updateStatus(teamId, 'approved');
            toast.success('Team approved');
            fetchTeams();
        } catch (error) {
            toast.error('Failed to approve team');
        }
    };

    const handleReject = async (teamId) => {
        if (isGuest) {
            toast.error('GUEST: This action is restricted.');
            return;
        }
        try {
            await teamsAPI.updateStatus(teamId, 'rejected');
            toast.success('Team rejected');
            fetchTeams();
        } catch (error) {
            toast.error('Failed to reject team');
        }
    };

    const handleDelete = async (teamId) => {
        if (isGuest) {
            toast.error('GUEST: Delete operations are disabled.');
            return;
        }
        try {
            await teamsAPI.remove(teamId);
            toast.success('Team deleted');
            fetchTeams();
        } catch (error) {
            toast.error('Failed to delete team');
        }
    };

    const handleManageRoster = (team) => {
        setSelectedTeamId(team.id);
        setShowRosterModal(true);
    };

    const handleRosterUpdate = () => {
        fetchTeams(); // Refresh to show updated player counts/lists
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.tournament?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader text="Loading teams..." />;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="relative mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-pink/40 via-transparent to-transparent" />
                    <span className="text-[10px] font-mono text-neon-pink uppercase tracking-[0.4em] opacity-60">
                        Team Management
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <button
                                onClick={() => setActiveTab('registry')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                    ${activeTab === 'registry'
                                        ? 'bg-neon-pink text-black shadow-[0_0_15px_rgba(255,0,212,0.4)]'
                                        : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20'}`}
                            >
                                TEAMS
                            </button>
                            <button
                                onClick={() => setActiveTab('squad')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                    ${activeTab === 'squad'
                                        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                        : 'bg-dark-800/50 text-gray-400 border border-dark-600 hover:border-gray-500 hover:text-white'}`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                SQUAD LIST
                            </button>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none pr-4">
                            <span className="text-white">TEAM</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-pink to-purple-600 drop-shadow-[0_0_15px_rgba(255,0,212,0.3)] pr-4">REGISTRY</span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-2xl border-l-2 border-neon-pink/30 pl-4 py-1">
                            Manage all teams and players across your tournaments.
                        </p>
                    </div>

                    {!isGuest && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary py-5 px-10 text-xs font-black uppercase tracking-[0.2em] flex items-center whitespace-nowrap shadow-[0_0_40px_rgba(255,0,212,0.3)] hover:scale-105 active:scale-95 transition-all !rounded-2xl"
                        >
                            <UserPlus className="w-5 h-5 mr-3" />
                            Register New Team
                        </button>
                    )}
                </div>

                {/* Enhanced Search Terminal */}
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-neon-pink transition-colors" />
                    <input
                        type="text"
                        placeholder="Search teams or tournaments..."
                        className="w-full bg-[#0d0d12]/40 backdrop-blur-xl border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-mono text-xs focus:border-neon-pink focus:ring-0 outline-none transition-all placeholder:text-gray-700 shadow-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-[10px] font-mono text-gray-600 border border-white/5 px-2 py-1 rounded-lg uppercase">Search</span>
                    </div>
                </div>
            </div>

            {/* Content View */}
            {filteredTeams.length === 0 ? (
                <Card className="bg-dark-800/30 border-dashed border-2 border-dark-600 py-20 text-center rounded-2xl">
                    <p className="text-gray-500 italic text-xl">
                        No {activeTab === 'registry' ? 'teams' : 'squads'} found matching your search.
                    </p>
                </Card>
            ) : activeTab === 'registry' ? (
                <div className="bg-dark-800/30 backdrop-blur-md rounded-2xl border border-dark-600 overflow-hidden shadow-2xl">
                    <TeamList
                        teams={filteredTeams}
                        showActions={!isGuest}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={handleDelete}
                        onAddPlayer={handleManageRoster}
                        onDownloadReceipt={handleDownloadReceipt}
                    />
                </div>
            ) : (
                <SquadListView
                    teams={filteredTeams}
                    onManageRoster={handleManageRoster}
                    onDelete={handleDelete}
                    showActions={!isGuest}
                    onDownloadReceipt={handleDownloadReceipt}
                />
            )}

            {/* New Squad Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Register New Team"
            >
                <TeamForm
                    onSubmit={handleRegisterTeam}
                    loading={submitting}
                    tournaments={tournaments}
                />
            </Modal>

            {/* Roster Management Modal */}
            <Modal
                isOpen={showRosterModal}
                onClose={() => setShowRosterModal(false)}
                title={`Manage Team: ${selectedTeam?.name || 'Unknown Team'}`}
            >
                {selectedTeam && (
                    <RosterManager
                        team={selectedTeam}
                        onUpdate={handleRosterUpdate}
                    />
                )}
            </Modal>
        </div>
    );
};

export default TeamsPage;