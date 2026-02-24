import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import organizationsAPI from '../../api/organizations';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Building2, Gamepad2, AlignLeft, CalendarDays, Users, Globe, Swords, Trophy, CreditCard, QrCode, Zap, CheckCircle } from 'lucide-react';

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

// Generates a real scannable UPI QR code URL
const getUpiQrUrl = (upiId, amount, name = 'Tournament') => {
    if (!upiId) return null;
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Tournament Entry Fee')}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10`;
};

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
        isPaid: false,
        entryFee: 0,
        paymentMethod: 'manual',
        paymentInstructions: '',
        upiId: '',
    });

    const [organizations, setOrganizations] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    useEffect(() => { fetchOrganizations(); }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                organizationId: initialData.organizationId || '',
                name: initialData.name || '',
                game: initialData.game || 'free_fire',
                description: initialData.description || '',
                format: initialData.format || 'league',
                startDate: initialData.startDate?.split('T')[0] || '',
                endDate: initialData.endDate?.split('T')[0] || '',
                maxTeams: initialData.maxTeams || '',
                registrationDeadline: initialData.registrationDeadline?.split('T')[0] || '',
                isPublic: initialData.isPublic !== false,
                isPaid: initialData.isPaid || false,
                entryFee: initialData.entryFee || 0,
                paymentMethod: 'manual',
                paymentInstructions: initialData.paymentInstructions || '',
                upiId: initialData.upiId || '',
            });
        }
    }, [initialData]);

    const fetchOrganizations = async () => {
        try {
            const response = await organizationsAPI.getAll({ mine: true });
            const orgs = response.data.organizations || [];
            setOrganizations(orgs);
            if (orgs.length > 0 && !initialData) {
                setFormData(prev => ({ ...prev, organizationId: orgs[0].id }));
            }
        } catch {
            toast.error('Failed to load organizations');
        } finally {
            setLoadingOrgs(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.isPaid && !formData.upiId.trim()) {
            toast.error('Please enter your UPI ID for paid tournaments');
            return;
        }
        onSubmit({ ...formData, paymentMethod: 'manual' });
    };

    // Live QR preview
    const qrUrl = getUpiQrUrl(formData.upiId, formData.entryFee, formData.name || 'Tournament');

    if (loadingOrgs) {
        return (
            <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em]">Loading...</span>
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <Card className="bg-dark-800/30 border-2 border-dashed border-dark-600 p-12 text-center rounded-2xl">
                <Building2 className="w-10 h-10 text-neon-blue/40 mx-auto mb-4" />
                <p className="text-gray-400 mb-6 text-sm">You need an organization first.</p>
                <Link to="/dashboard/organizations" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-bold">
                    <Building2 className="w-4 h-4" /> Create Organization
                </Link>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Tournament Identity ── */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Trophy className="w-4 h-4 text-neon-purple" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Tournament Identity</span>
                </div>
                <Select label="Organization" icon={<Building2 className="w-3.5 h-3.5" />}
                    name="organizationId" value={formData.organizationId} onChange={handleChange} required disabled={!!initialData}>
                    <option value="">Choose Organization...</option>
                    {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </Select>
                <Input label="Tournament Name" icon={<Trophy className="w-3.5 h-3.5" />}
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. FFMC Pro League Season 3" required />
                <Textarea label="Description" icon={<AlignLeft className="w-3.5 h-3.5" />}
                    name="description" value={formData.description || ''} onChange={handleChange}
                    placeholder="Describe your tournament, rules, prize pool..." />
            </div>

            {/* ── Game & Format ── */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Swords className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Game & Format</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Select label="Game" icon={<Gamepad2 className="w-3.5 h-3.5" />}
                        name="game" value={formData.game} onChange={handleChange} required>
                        {GAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <Select label="Format" icon={<Swords className="w-3.5 h-3.5" />}
                        name="format" value={formData.format} onChange={handleChange} required className="md:col-span-2">
                        {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                </div>
            </div>

            {/* ── Schedule & Limits ── */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <CalendarDays className="w-4 h-4 text-neon-green" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Schedule & Limits</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <Input label="Start Date" icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                    <Input label="End Date" icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    <Input label="Max Teams" icon={<Users className="w-3.5 h-3.5" />}
                        type="number" name="maxTeams" value={formData.maxTeams} onChange={handleChange}
                        placeholder="e.g. 16" min="2" />
                    <Input label="Reg. Deadline" icon={<CalendarDays className="w-3.5 h-3.5" />}
                        type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} />
                </div>
            </div>

            {/* ── Visibility & Payment ── */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Globe className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Visibility & Payment</span>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-neon-blue/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-yellow-500/70" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Public Tournament</p>
                                <p className="text-[11px] text-gray-500">Visible to all players</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative ${formData.isPublic ? 'bg-neon-blue' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${formData.isPublic ? 'left-7' : 'left-1'}`} />
                            <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="sr-only" />
                        </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-neon-pink/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-neon-pink/70" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Paid Tournament</p>
                                <p className="text-[11px] text-gray-500">Entry fee via UPI</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative ${formData.isPaid ? 'bg-neon-pink' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${formData.isPaid ? 'left-7' : 'left-1'}`} />
                            <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} className="sr-only" />
                        </div>
                    </label>
                </div>

                {/* UPI Payment Setup */}
                {formData.isPaid && (
                    <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Entry Fee (₹)" icon={<CreditCard className="w-3.5 h-3.5" />}
                                type="number" name="entryFee" value={formData.entryFee} onChange={handleChange}
                                placeholder="e.g. 100" min="1" required />
                            <Input label="Your UPI ID *" icon={<Zap className="w-3.5 h-3.5" />}
                                type="text" name="upiId" value={formData.upiId} onChange={handleChange}
                                placeholder="e.g. 9876543210@paytm" required />
                        </div>

                        {/* Live QR Preview */}
                        {formData.upiId && formData.entryFee > 0 ? (
                            <div className="p-5 bg-neon-green/5 border border-neon-green/20 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-4 h-4 text-neon-green" />
                                    <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">
                                        Payment QR — Auto Generated ✓
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="p-3 bg-white rounded-2xl shadow-lg shadow-neon-green/10 flex-shrink-0">
                                        <img
                                            src={qrUrl}
                                            alt="UPI QR Code"
                                            className="w-36 h-36 object-contain"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <p className="text-white font-black text-lg">₹{formData.entryFee}</p>
                                        <p className="text-[11px] text-gray-400 font-mono">{formData.upiId}</p>
                                        <p className="text-[10px] text-gray-500 max-w-xs">
                                            Players will see this QR when registering. They scan it, pay ₹{formData.entryFee}, then enter their UPI Transaction ID as proof.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                                <span key={app} className="text-[9px] font-black px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-500 uppercase">
                                                    {app}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-center gap-4">
                                <QrCode className="w-10 h-10 text-gray-700 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-gray-500">QR will auto-generate here</p>
                                    <p className="text-[11px] text-gray-700 mt-1">Enter your UPI ID and Entry Fee above — QR appears instantly.</p>
                                </div>
                            </div>
                        )}

                        <Textarea
                            label="Payment Instructions (optional — shown to players)"
                            icon={<AlignLeft className="w-3.5 h-3.5" />}
                            name="paymentInstructions"
                            value={formData.paymentInstructions}
                            onChange={handleChange}
                            placeholder="e.g. Scan QR & pay entry fee. Enter your UPI Transaction ID after payment. Join Discord server before registering."
                            rows={2}
                        />
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full py-5 text-sm" loading={loading}>
                {initialData ? 'Save Changes' : (formData.isPaid ? '🎯 Create Paid Tournament' : '🚀 Create Tournament')}
            </Button>
        </form>
    );
};

export default TournamentForm;