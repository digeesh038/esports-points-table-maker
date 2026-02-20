import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import organizationsAPI from '../api/organizations';
import tournamentsAPI from '../api/tournaments';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import TournamentCard from '../components/tournament/TournamentCard';
import { Plus, Trophy, Globe, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const OrganizationDetailPage = () => {
    const { id } = useParams();
    const { isGuest } = useAuth();
    const [organization, setOrganization] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganizationData();
    }, [id]);

    const fetchOrganizationData = async () => {
        if (isGuest) {
            const mockOrgs = {
                'mock-org-1': {
                    id: 'mock-org-1',
                    name: 'Global Pro League',
                    description: 'The leading esports circuit for international competition.',
                    website: 'proleague.gg',
                    logo: ''
                },
                'mock-org-2': {
                    id: 'mock-org-2',
                    name: 'Nexus Gaming Org',
                    description: 'Empowering local talent through structured tournaments.',
                    website: 'nexus.play',
                    logo: ''
                },
                'mock-org-3': {
                    id: 'mock-org-3',
                    name: 'Prime Esports Group',
                    description: 'Focusing on grassroot level scouting and development.',
                    website: 'prime-esports.com',
                    logo: ''
                }
            };

            const mockTournaments = [
                { id: 'dummy-1', name: 'FREE FIRE: GLOBAL SHOWDOWN', game: 'free_fire', status: 'registration_open' },
                { id: 'dummy-2', name: 'BGMI PRO LEAGUE S4', game: 'bgmi', status: 'ongoing' }
            ];

            const orgData = mockOrgs[id] || mockOrgs['mock-org-1'];
            setOrganization(orgData);
            setTournaments(mockTournaments);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await organizationsAPI.getById(id);
            setOrganization(response.data.organization);

            // Fetch tournaments for this organization specifically
            const toursResponse = await tournamentsAPI.getAll({ organizationId: id });
            setTournaments(toursResponse.data.tournaments || []);
        } catch (error) {
            toast.error('Failed to load organization details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Loading organization console..." />;

    if (!organization) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400">Organization node not found</h2>
                <Link to="/dashboard/organizations" className="text-neon-blue mt-4 inline-block hover:underline">
                    Return to Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="bg-dark-800/50 backdrop-blur-md rounded-2xl p-8 border border-dark-600">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 bg-dark-700 rounded-2xl border-2 border-neon-blue/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,183,255,0.1)]">
                        {organization.logo ? (
                            <img src={organization.logo} alt={organization.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-12 h-12 text-neon-blue" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                            {organization.name}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            {organization.description || 'No descriptive data available for this entity.'}
                        </p>
                        {organization.website && (
                            <a
                                href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-neon-blue hover:text-neon-purple mt-4 transition-colors font-medium"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                {organization.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>
                    {!isGuest && (
                        <div className="flex-shrink-0">
                            <Link
                                to="/dashboard/tournaments/create"
                                className="btn-primary py-3 px-8 flex items-center shadow-[0_0_15px_rgba(0,183,255,0.3)]"
                            >
                                <Trophy className="w-5 h-5 mr-3" />
                                Launch Tournament
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Tournaments list */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <span className="w-2 h-8 bg-neon-purple mr-3 rounded-full shadow-[0_0_10px_rgba(188,19,254,0.5)]"></span>
                        Deployed Tournaments
                    </h2>
                </div>

                {tournaments.length === 0 ? (
                    <Card className="bg-dark-800/30 border-dashed border-2 border-dark-600 py-16 text-center rounded-2xl">
                        <p className="text-gray-500 italic text-lg mb-6">
                            No tournament signals detected from this organization.
                        </p>
                        {!isGuest && (
                            <Link to="/dashboard/tournaments/create" className="btn-secondary py-2 px-6">
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Tournament
                            </Link>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tournaments.map(t => (
                            <TournamentCard key={t.id} tournament={t} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationDetailPage;
