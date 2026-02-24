import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import organizationsAPI from '../api/organizations';
import tournamentsAPI from '../api/tournaments';
import dashboardAPI from '../api/dashboard';

import Loader from '../components/common/Loader';
import DashboardStats from '../components/dashboard/DashboardStats';
import OrganizationCard from '../components/dashboard/OrganizationCard';
import Card from '../components/common/Card';

import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Building2, Plus } from 'lucide-react';

const DashboardPage = () => {
    const { user, isGuest } = useAuth();

    const [stats, setStats] = useState({
        organizations: 0,
        tournaments: 0,
        activeTeams: 0,
        completedMatches: 0,
        totalMatches: 0
    });

    const [organizations, setOrganizations] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (isGuest) {
            const mockOrgs = [
                { id: 'mock-org-1', name: 'PREMIER ESPORTS LEAGUE', description: 'Global competitive circuit.', logo: '' },
                { id: 'mock-org-2', name: 'CYBER STRIKE FRANCHISE', description: 'Elite pro gaming organization.', logo: '' }
            ];
            const mockTours = [
                { id: 'dummy-1', name: 'FREE FIRE: GLOBAL SHOWDOWN', game: 'free_fire', status: 'registration_open' },
                { id: 'dummy-2', name: 'BGMI PRO LEAGUE S4', game: 'bgmi', status: 'ongoing' },
                { id: 'dummy-3', name: 'VALORANT: RADIANT CUP', game: 'valorant', status: 'completed' }
            ];

            setOrganizations(mockOrgs);
            setTournaments(mockTours);
            setStats({
                organizations: 2,
                tournaments: 12,
                activeTeams: 156,
                completedMatches: 1024,
                totalMatches: 1200
            });
            setLoading(false);
            return;
        }

        try {
            const [orgRes, tourRes, statsRes] = await Promise.all([
                organizationsAPI.getAll({ mine: true }),
                tournamentsAPI.getAll({ mine: true }),
                dashboardAPI.getStats()
            ]);

            const orgs = orgRes.data.organizations || [];
            const tours = tourRes.data.tournaments || [];
            const statsData = statsRes.data || { organizations: orgs.length, tournaments: tours.length, activeTeams: 0, completedMatches: 0, totalMatches: 0 };

            setOrganizations(orgs);
            setTournaments(tours.slice(0, 5));
            setStats(statsData);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader text="Synchronizing dashboard..." />;
    }

    return (
        <div className="space-y-12 relative animate-fade-in">
            {/* HEADER */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-blue/40 via-transparent to-transparent" />
                    <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] opacity-60">
                        Overview // Control Center
                    </span>
                </div>
                <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-7xl font-black italic leading-tight tracking-tighter uppercase">
                    <span className="text-white">DASHBOARD</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-blue to-neon-purple drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">OVERVIEW</span>
                </h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base font-medium flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#39ff14] animate-pulse" />
                    {isGuest ? 'GUEST_PROTO_RESTRICTED: Limited functionality enabled.' : `Welcome back, ${user?.name}`}
                </p>
            </div>

            {/* STATS */}
            <DashboardStats stats={stats} />

            {/* ORGANIZATIONS */}
            <section>
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center">
                        <span className="w-2 h-8 bg-neon-blue mr-3 rounded-full"></span>
                        My Organizations
                    </h2>
                    <Link
                        to="/dashboard/organizations"
                        className="text-neon-blue font-bold text-xs md:text-sm tracking-widest hover:text-white transition-colors flex items-center ml-5 xs:ml-0"
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {organizations.length === 0 ? (
                    <Card className="bg-dark-800/30 border-dashed border-2 border-dark-600 py-16 text-center rounded-3xl group hover:border-neon-blue/40 transition-all">
                        <div className="max-w-md mx-auto px-4">
                            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20 group-hover:opacity-40 transition-opacity" />
                            <p className="text-gray-400 font-medium text-lg mb-2">
                                {isGuest ? 'No organizations found.' : 'Create Your First Organization'}
                            </p>
                            <p className="text-gray-500 text-sm mb-8">
                                {isGuest ? 'Browse existing organizations.' : 'Create an organization to start managing tournaments.'}
                            </p>
                            {!isGuest && (
                                <Link
                                    to="/dashboard/organizations"
                                    className="btn-primary py-4 px-10 shadow-[0_0_20px_rgba(0,183,255,0.2)]"
                                >
                                    <Plus className="w-5 h-5 mr-3" />
                                    Create Organization
                                </Link>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.slice(0, 3).map((org) => (
                            <OrganizationCard key={org.id} org={org} />
                        ))}
                    </div>
                )}
            </section>

            {/* RECENT TOURNAMENTS */}
            <section>
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center">
                        <span className="w-2 h-8 bg-neon-purple mr-3 rounded-full"></span>
                        Active Tournaments
                    </h2>
                    <Link
                        to="/dashboard/tournaments"
                        className="text-neon-purple font-bold text-xs md:text-sm tracking-widest hover:text-white transition-colors flex items-center ml-5 xs:ml-0"
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {tournaments.length === 0 ? (
                    <Card className="bg-dark-800/30 border-dark-600 border-dashed py-12 text-center">
                        <p className="text-gray-500 italic">
                            No active tournaments found.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {tournaments.map((t) => (
                            <div key={t.id} className="bg-dark-800/40 backdrop-blur-md border border-dark-600 rounded-2xl p-4 md:p-5 hover:border-neon-purple/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-lg">
                                <div className="flex items-center gap-4 md:gap-5 w-full">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-dark-700 rounded-xl flex items-center justify-center border border-dark-600 shrink-0">
                                        <Trophy className="w-6 h-6 md:w-7 md:h-7 text-neon-purple opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white text-base md:text-lg group-hover:text-neon-purple transition-colors truncate">
                                            {t.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5">
                                            <span className="text-[10px] font-mono uppercase tracking-tighter text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">
                                                {t.game.replace('_', ' ')}
                                            </span>
                                            <span className="hidden xs:inline text-xs text-gray-500">•</span>
                                            <span className="text-[10px] md:text-xs font-bold text-gray-400 capitalize whitespace-nowrap">
                                                STATUS: <span className="text-white/80">{t.status.replace('_', ' ')}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/dashboard/tournaments/${t.id}`}
                                    className="w-full sm:w-auto flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-neon-purple group-hover:text-white transition-all bg-neon-purple/5 px-6 py-3 rounded-xl border border-neon-purple/20 hover:bg-neon-purple hover:shadow-[0_0_20px_rgba(188,19,254,0.3)] shrink-0"
                                >
                                    Manage
                                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;
