import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import organizationsAPI from '../api/organizations';
import OrganizationCard from '../components/dashboard/OrganizationCard';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const OrganizationsPage = () => {
    const { isGuest } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        logo: '',
    });

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        if (isGuest) {
            setOrganizations([
                { id: 'mock-org-1', name: 'Global Pro League', description: 'The leading esports circuit for international competition.', logo: '' },
                { id: 'mock-org-2', name: 'Nexus Gaming Org', description: 'Empowering local talent through structured tournaments.', logo: '' },
                { id: 'mock-org-3', name: 'Prime Esports Group', description: 'Focusing on grassroot level scouting and development.', logo: '' }
            ]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await organizationsAPI.getAll({ mine: true });
            setOrganizations(response.data.organizations || []);
        } catch (error) {
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateOrganization = async (e) => {
        e.preventDefault();
        if (isGuest) return;

        if (!formData.name.trim()) {
            toast.error('Organization name is required');
            return;
        }

        try {
            setCreating(true);
            await organizationsAPI.create(formData);
            toast.success('Organization created successfully!');
            setShowCreateModal(false);
            setFormData({ name: '', description: '', website: '', logo: '' });
            fetchOrganizations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create organization');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (isGuest) {
            toast.error('Guest access restricted');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this organization? All tournaments and data inside it will be lost.')) {
            return;
        }

        try {
            await organizationsAPI.delete(id);
            toast.success('Organization deleted');
            fetchOrganizations();
        } catch (error) {
            toast.error('Failed to delete organization');
        }
    };

    if (loading) {
        return <Loader text="Loading organizations..." />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4 border-b border-white/5 pb-8">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-neon-blue/10 border border-neon-blue/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,183,255,0.15)]">
                            <Plus className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-neon-blue text-[9px] font-black tracking-[0.3em] uppercase opacity-50 block mb-0.5">Entity Management</span>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic tracking-tight leading-none pr-4">
                                MY ORGANIZATIONS
                            </h1>
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 mt-3 text-sm md:text-base font-medium opacity-80 max-w-2xl border-l-2 border-neon-blue pl-4">
                    {isGuest
                        ? 'Browse global esports collectives and institutional profiles indexed in the database.'
                        : 'Architect and oversee your esports infrastructure. Manage multiple organizations from a single console.'}
                </p>
            </div>

            {!isGuest && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        variant="primary"
                        className="shadow-[0_0_25px_rgba(0,183,255,0.3)] !rounded-2xl px-8 py-4 font-black italic uppercase tracking-widest text-sm"
                        icon={Plus}
                    >
                        Register Organization
                    </Button>
                </div>
            )}

            {organizations.length === 0 ? (
                <Card className="bg-dark-800/10 border-dashed border-2 border-dark-600/50 py-24 rounded-3xl group hover:border-neon-blue/30 transition-all">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Plus className="w-8 h-8 text-gray-600 group-hover:text-neon-blue transition-colors" />
                        </div>
                        <p className="text-gray-500 mb-8 text-lg italic">
                            {isGuest
                                ? 'No entities detected in the global registry.'
                                : 'Your organization index is currently empty. Initialize your first node to begin.'}
                        </p>
                        {!isGuest && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                variant="outline"
                                className="group-hover:bg-neon-blue group-hover:text-black transition-all"
                            >
                                Launch First Organization
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {organizations.map((org) => (
                        <OrganizationCard key={org.id} org={org} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Initialize_New_Entity"
            >
                <form onSubmit={handleCreateOrganization} className="p-8 space-y-8 bg-dark-900/50">
                    <div className="space-y-6">
                        <Input
                            label="ORGANIZATION_NAME"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. GALAXY_ESPORTS_PRO"
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                                ENTITY_DESCRIPTION
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Briefly describe the purpose and scope of this organization..."
                                className="w-full h-32 bg-dark-800/50 border border-white/5 rounded-2xl p-4 text-white font-medium text-sm focus:border-neon-blue outline-none transition-all placeholder:text-gray-700 custom-scrollbar resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="OFFICIAL_WEBSITE"
                                name="website"
                                type="url"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://nexus.gg"
                            />

                            <Input
                                label="LOGO_PROTOCOL_URL"
                                name="logo"
                                type="url"
                                value={formData.logo}
                                onChange={handleInputChange}
                                placeholder="https://assets.nexus.io/logo.png"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            variant="ghost"
                            className="flex-1 !rounded-2xl py-4 font-bold border-white/5"
                            disabled={creating}
                        >
                            ABORT
                        </Button>
                        <Button
                            type="submit"
                            loading={creating}
                            className="flex-[2] !rounded-2xl py-4 shadow-[0_0_20px_rgba(0,183,255,0.2)]"
                        >
                            CREATE_ORGANIZATION
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OrganizationsPage;
