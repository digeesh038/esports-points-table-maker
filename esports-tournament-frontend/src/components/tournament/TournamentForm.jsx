import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import organizationsAPI from '../../api/organizations';
import tournamentsAPI from '../../api/tournaments';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { Building2, Gamepad2, AlignLeft, CalendarDays, Users, Globe, Swords, Trophy, Zap, CreditCard } from 'lucide-react';

const GAME_OPTIONS = [
    { value: 'free_fire', label: 'Free Fire' },
    { value: 'bgmi', label: 'BGMI' },
    { value: 'valorant', label: 'Valorant' },
    { value: 'cod_mobile', label: 'Call of Duty Mobile' },
    { value: 'csgo', label: 'CS:GO' },
    { value: 'fortnite', label: 'Fortnite' },
];

const FORMAT_OPTIONS = [
    { value: 'league', label: 'League / Round Robin' },
    { value: 'group_stage', label: 'Group Stage' },
    { value: 'bracket', label: 'Single Elimination' },
    { value: 'swiss', label: 'Swiss System' },
    { value: 'double_elimination', label: 'Double Elimination' },
];

const TournamentForm = ({ onSubmit, loading, initialData = null }) => {
    const [formData, setFormData] = useState({
        organizationId: '',
        name: '',
        game: 'free_fire',
        description: '',
        format: 'league',
        startDate: '',
        endDate: '',
        maxTeams: '',
        registrationDeadline: '',
        isPublic: true,
        tournamentType: 'FREE',
        entryFee: 0,
    });

    const [organizations, setOrganizations] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: initialData.startDate?.split('T')[0] || '',
                endDate: initialData.endDate?.split('T')[0] || '',
                registrationDeadline: initialData.registrationDeadline?.split('T')[0] || '',
                tournamentType: initialData.tournamentType || 'FREE',
                entryFee: initialData.entryFee || 0,
            });
        }
    }, [initialData]);

    const fetchOrganizations = async () => {
        try {
            const response = await organizationsAPI.getAll({ mine: true });
            const orgs = response.data.organizations || [];
            setOrganizations(orgs);
            if (orgs.length > 0 && !initialData) {
                setFormData((prev) => ({
                    ...prev,
                    organizationId: orgs[0].id,
                }));
            }
        } catch (error) {
            toast.error('Failed to load organizations');
        } finally {
            setLoadingOrgs(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (loadingOrgs) {
        return (
            <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em]">Loading Config...</span>
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <Card className="bg-dark-800/30 border-2 border-dashed border-dark-600 p-12 text-center rounded-2xl">
                <div className="w-16 h-16 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-neon-blue/50" />
                </div>
                <p className="text-gray-400 mb-6 text-sm font-medium">
                    You need an organization before you can create a tournament.
                </p>
                <Link
                    to="/dashboard/organizations"
                    className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-bold"
                >
                    <Building2 className="w-4 h-4" />
                    Create Organization
                </Link>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Basic Info */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Trophy className="w-4 h-4 text-neon-purple" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Tournament Details</span>
                </div>

                {/* Organization */}
                <Select
                    label="Organization"
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    required
                    disabled={!!initialData}
                >
                    <option value="">Choose Organization...</option>
                    {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                            {org.name}
                        </option>
                    ))}
                </Select>

                {/* Tournament Name */}
                <Input
                    label="Tournament Name"
                    icon={<Trophy className="w-3.5 h-3.5" />}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. FFMC Pro League Season 3"
                    required
                />

                {/* Description */}
                <Textarea
                    label="Description"
                    icon={<AlignLeft className="w-3.5 h-3.5" />}
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Describe your tournament, rules, prize pool info..."
                />
            </div>

            {/* Section: Format & Game */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Swords className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Game & Format</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <Select
                        label="Game"
                        icon={<Gamepad2 className="w-3.5 h-3.5" />}
                        name="game"
                        value={formData.game}
                        onChange={handleChange}
                        required
                    >
                        {GAME_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>

                    <Select
                        label="Format"
                        icon={<Swords className="w-3.5 h-3.5" />}
                        name="format"
                        value={formData.format}
                        onChange={handleChange}
                        required
                        className="lg:col-span-2"
                    >
                        {FORMAT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Section: Schedule */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <CalendarDays className="w-4 h-4 text-neon-green" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Schedule & Limits</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Input
                        label="Start Date"
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="End Date"
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                    <Input
                        label="Max Teams"
                        icon={<Users className="w-3.5 h-3.5" />}
                        type="number"
                        name="maxTeams"
                        value={formData.maxTeams}
                        onChange={handleChange}
                        placeholder="e.g. 16"
                        min="2"
                    />
                    <Input
                        label="Registration Deadline"
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Section: Visibility */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Globe className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Visibility</span>
                </div>

                <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-neon-blue/40 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                            <Globe className="w-5 h-5 text-yellow-500/70" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Public Tournament</p>
                            <p className="text-[11px] text-gray-500">Anyone can view and browse this tournament</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative ${formData.isPublic ? 'bg-neon-blue' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${formData.isPublic ? 'left-7' : 'left-1'}`} />
                        <input
                            type="checkbox"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={handleChange}
                            className="sr-only"
                        />
                    </div>
                </label>
            </div>

            {/* Section: Entry Fee */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <CreditCard className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Registration Type</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                        label="Tournament Type"
                        icon={<Trophy className="w-3.5 h-3.5" />}
                        name="tournamentType"
                        value={formData.tournamentType}
                        onChange={handleChange}
                        required
                    >
                        <option value="FREE">FREE</option>
                        <option value="PAID">PAID</option>
                    </Select>

                    {formData.tournamentType === 'PAID' && (
                        <Input
                            label="Entry Fee (INR)"
                            icon={<Zap className="w-3.5 h-3.5" />}
                            type="number"
                            name="entryFee"
                            value={formData.entryFee}
                            onChange={handleChange}
                            placeholder="e.g. 100"
                            min="1"
                            required
                        />
                    )}
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full py-5 text-sm" loading={loading}>
                {initialData ? 'Save Changes' : 'Create Tournament'}
            </Button>
        </form>
    );
};

export default TournamentForm;