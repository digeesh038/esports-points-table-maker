import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TournamentList from '../components/tournament/TournamentList';
import tournamentsAPI from '../api/tournaments';
import { Plus, Trophy, Search, Filter, LayoutGrid, SlidersHorizontal, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TournamentsPage = () => {
    const { isGuest } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        game: '',
    });

    useEffect(() => {
        fetchTournaments();
    }, [filters]);

    const fetchTournaments = async () => {
        const dummyData = [
            { id: 'dummy-1', name: 'FREE FIRE: GLOBAL SHOWDOWN', description: 'Ultimate pro battle royale.', game: 'free_fire', status: 'registration_open', startDate: new Date().toISOString(), maxTeams: 48, teams: new Array(12).fill({}), format: 'battle_royale', isDummy: true },
            { id: 'dummy-2', name: 'BGMI PRO LEAGUE S4', description: 'Elite pro circuit competition.', game: 'bgmi', status: 'ongoing', startDate: new Date().toISOString(), maxTeams: 16, teams: new Array(8).fill({}), format: 'battle_royale', isDummy: true },
            { id: 'dummy-3', name: 'VALORANT: RADIANT CUP', description: 'High-stakes 5v5 tactical shooter.', game: 'valorant', status: 'completed', startDate: new Date().toISOString(), maxTeams: 8, teams: new Array(8).fill({}), format: 'single_elimination', isDummy: true }
        ];

        if (isGuest) {
            setTournaments(dummyData);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await tournamentsAPI.getAll({ ...filters, mine: true });
            const data = response?.data?.tournaments || response?.tournaments || [];
            setTournaments(data);
        } catch (error) {
            toast.error('Failed to sync tournament registry');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const filteredTournaments = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 px-4 lg:px-0">
            {/* ── TOP SECTION: BRANDING & ACTION ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 min-w-0"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-neon-purple/10 border border-neon-purple/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(188,19,254,0.15)]">
                            <Trophy className="w-6 h-6 text-neon-purple" />
                        </div>
                        <div className="min-w-">
                            <span className="text-neon-purple text-[9px] font-black tracking-[0.3em] uppercase opacity-50 block mb-0.5">Management Console</span>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic tracking-tight leading-none pr-4">
                                MY TOURNAMENTS
                            </h1>
                        </div>
                    </div>
                </motion.div>

                {!isGuest && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="shrink-0"
                    >
                        <Link
                            to="/dashboard/tournaments/create"
                            className="bg-neon-blue h-14 md:h-16 px-8 text-black font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3 rounded-xl md:rounded-2xl shadow-[0_0_30px_rgba(0,183,255,0.1)] hover:shadow-[0_0_40px_rgba(0,183,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all group whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-500" />
                            Launch New Node
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* ── INTERACTIVE FILTER HUB ── */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-800/20 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-3xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 blur-[100px] pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                    {/* Search Field */}
                    <div className="flex-1 w-full group/search">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within/search:text-neon-blue transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH REGISTRY BY NAME..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-6 text-sm font-black tracking-widest text-white placeholder:text-gray-700 outline-none focus:border-neon-blue/40 focus:bg-white/[0.05] transition-all"
                            />
                        </div>
                    </div>

                    {/* Filter Group */}
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-56">
                            <SlidersHorizontal className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
                            <select
                                name="game"
                                value={filters.game}
                                onChange={handleFilterChange}
                                className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-10 text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:border-white/10 focus:border-neon-purple/40 appearance-none cursor-pointer transition-all"
                            >
                                <option value="">Filter by Game</option>
                                <option value="free_fire">Free Fire</option>
                                <option value="bgmi">BGMI</option>
                                <option value="valorant">Valorant</option>
                            </select>
                        </div>

                        <div className="relative flex-1 lg:w-56">
                            <RefreshCw className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-10 text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none hover:border-white/10 focus:border-neon-purple/40 appearance-none cursor-pointer transition-all"
                            >
                                <option value="">Filter by Status</option>
                                <option value="draft">Drafts</option>
                                <option value="registration_open">Recruiting</option>
                                <option value="ongoing">Active</option>
                                <option value="completed">Finished</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── RESULTS SECTION ── */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode='wait'>
                    <TournamentList
                        key={`${searchQuery}-${filters.game}-${filters.status}`}
                        tournaments={filteredTournaments}
                        loading={loading}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TournamentsPage;