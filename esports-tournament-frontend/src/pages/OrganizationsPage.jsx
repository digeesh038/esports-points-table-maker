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
            {/* HEADER */}
            <div className="relative mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-neon-blue/40 via-transparent to-transparent" />
                    <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] opacity-60">
                        Admin // Organizations
                    </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            <span className="text-white">MY</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-blue to-neon-purple drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">ORGANIZATIONS</span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-sm md:text-base font-medium max-w-2xl border-l-2 border-neon-blue/30 pl-4 py-1">
                            {isGuest
                                ? 'View all gaming organizations and tournament hosts registered on the platform.'
                                : 'Manage your gaming organizations. You can create multiple organizations to host different types of tournaments.'}
                        </p>
                    </div>

                    {!isGuest && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            variant="primary"
                            className="shadow-[0_0_30px_rgba(0,183,255,0.3)] !rounded-2xl px-10 py-5 font-black italic uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
                            icon={Plus}
                        >
                            New Organization
                        </Button>
                    )}
                </div>
            </div>

            {organizations.length === 0 ? (
                <Card className="bg-dark-800/10 border-dashed border-2 border-dark-600/50 py-24 rounded-3xl group hover:border-neon-blue/30 transition-all">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Plus className="w-8 h-8 text-gray-600 group-hover:text-neon-blue transition-colors" />
                        </div>
                        <p className="text-gray-500 mb-8 text-lg italic">
                            {isGuest
                                ? 'No organizations found in the database.'
                                : 'You haven\'t created any organizations yet. Create one to start hosting tournaments.'}
                        </p>
                        {!isGuest && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                variant="outline"
                                className="group-hover:bg-neon-blue group-hover:text-black transition-all"
                            >
                                Start First Organization
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
                title="Create New Organization"
            >
                <form onSubmit={handleCreateOrganization} className="p-8 space-y-8 bg-dark-900/50">
                    <div className="space-y-6">
                        <Input
                            label="Organization Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Elite Gaming League"
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                                Description
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
                                label="Official Website"
                                name="website"
                                type="url"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://yourwebsite.com"
                            />

                            <Input
                                label="Logo URL"
                                name="logo"
                                type="url"
                                value={formData.logo}
                                onChange={handleInputChange}
                                placeholder="https://site.com/logo.png"
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={creating}
                            className="flex-[2] !rounded-2xl py-4 shadow-[0_0_20px_rgba(0,183,255,0.2)]"
                        >
                            Create Organization
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OrganizationsPage;
