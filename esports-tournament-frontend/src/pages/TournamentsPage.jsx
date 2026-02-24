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
            {/* HEADER */}
            <div className="relative mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-purple/40 via-transparent to-transparent" />
                    <span className="text-[10px] font-mono text-neon-purple uppercase tracking-[0.4em] opacity-60">
                        Admin // Tournaments
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            <span className="text-white">MY</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-purple to-purple-600 drop-shadow-[0_0_15px_rgba(188,19,254,0.3)] pr-4">TOURNAMENTS</span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-2xl border-l-2 border-neon-purple/30 pl-4 py-1">
                            Create and manage your esports tournaments from one place.
                        </p>
                    </div>

                    {!isGuest && (
                        <Link
                            to="/dashboard/tournaments/create"
                            className="bg-neon-blue py-5 px-10 text-xs font-black uppercase tracking-[0.2em] flex items-center whitespace-nowrap shadow-[0_0_40px_rgba(0,183,255,0.3)] hover:scale-105 active:scale-95 transition-all rounded-2xl text-black"
                        >
                            <Trophy className="w-5 h-5 mr-3" />
                            New Tournament
                        </Link>
                    )}
                </div>
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
                                placeholder="Search tournaments by name..."
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