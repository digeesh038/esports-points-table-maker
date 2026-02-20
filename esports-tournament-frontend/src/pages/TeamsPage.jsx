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
            toast.error('Failed to load global talent pool');
        } finally {
            setLoading(false);
        }
    };

    const fetchTournaments = async () => {
        try {
            // Use mine:true to only show the user's own active tournaments
            const response = await tournamentsAPI.getAll({ mine: true });
            setTournaments(response?.data?.tournaments || []);
        } catch (error) {
            console.error('Failed to fetch tournaments', error);
        }
    };

    const handleRegisterTeam = async (formData) => {
        if (isGuest) {
            toast.error('GUEST_ERROR: Squad registration restricted.');
            return;
        }
        try {
            setSubmitting(true);
            // formData will contain tournamentId because we passed the tournaments prop
            await teamsAPI.register(formData.tournamentId, formData);
            toast.success('Squad registered successfully');
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
            toast.error('GUEST_ERROR: Protocol authorization restricted.');
            return;
        }
        try {
            await teamsAPI.updateStatus(teamId, 'approved');
            toast.success('Team approved');
            fetchTeams();
        } catch (error) {
            toast.error('Protocol failure: Could not approve team');
        }
    };

    const handleReject = async (teamId) => {
        if (isGuest) {
            toast.error('GUEST_ERROR: Entity termination restricted.');
            return;
        }
        try {
            await teamsAPI.updateStatus(teamId, 'rejected');
            toast.success('Team rejected');
            fetchTeams();
        } catch (error) {
            toast.error('Protocol failure: Action denied');
        }
    };

    const handleDelete = async (teamId) => {
        if (isGuest) {
            toast.error('GUEST_ERROR: Delete operations are offline.');
            return;
        }
        try {
            await teamsAPI.remove(teamId);
            toast.success('Team deleted');
            fetchTeams();
        } catch (error) {
            toast.error('Critical failure: Could not delete team');
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
            {/* Cinematic Teams Hero */}
            <header className="relative overflow-hidden rounded-3xl border border-dark-600 bg-dark-950/40 backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-neon-pink/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-neon-pink/5 blur-[120px] pointer-events-none animate-pulse"></div>

                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
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

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-neon-pink/10 border border-neon-pink/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,212,0.15)]">
                                    <Users className="w-6 h-6 text-neon-pink" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-neon-pink text-[9px] font-black tracking-[0.3em] uppercase opacity-50 block mb-0.5">Talent Registry</span>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic tracking-tight leading-none pr-4">
                                        MY TEAMS
                                    </h1>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed border-l-2 border-neon-pink pl-6 py-2">
                                Manage team registrations and rosters for your tournaments.
                            </p>

                            {/* Enhanced Search Terminal */}
                            <div className="relative group max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-neon-pink transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search teams or tournaments..."
                                    className="w-full bg-dark-900/60 border border-dark-600 rounded-2xl py-4 pl-12 pr-4 text-white font-mono text-xs focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 outline-none transition-all placeholder:text-gray-600 shadow-2xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <span className="text-[8px] font-mono text-gray-500 border border-dark-600 px-1.5 py-0.5 rounded">SEARCH</span>
                                </div>
                            </div>
                        </div>

                        {!isGuest && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn-primary py-4 px-8 text-xs font-black uppercase tracking-[0.2em] flex items-center whitespace-nowrap shadow-[0_0_30px_rgba(255,0,212,0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                <UserPlus className="w-5 h-5 mr-3" />
                                Add New Team
                            </button>
                        )}
                    </div>
                </div>
            </header>

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
                    />
                </div>
            ) : (
                <SquadListView
                    teams={filteredTeams}
                    onManageRoster={handleManageRoster}
                    onDelete={handleDelete}
                    showActions={!isGuest}
                />
            )}

            {/* New Squad Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Register New Squad"
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