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
import { Building2, Gamepad2, AlignLeft, CalendarDays, Users, Globe, Swords, Trophy, CreditCard, QrCode, Upload, X } from 'lucide-react';

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
        isPaid: false,
        entryFee: 0,
        paymentMethod: 'razorpay',
        paymentInstructions: '',
        paymentQrCode: '',
        upiId: '',
    });

    const [qrPreview, setQrPreview] = useState(null);

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
                paymentQrCode: initialData.paymentQrCode || '',
                upiId: initialData.upiId || '',
            });
            if (initialData.paymentQrCode) {
                setQrPreview(initialData.paymentQrCode);
            }
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

    const handleQrChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('QR code file size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, paymentQrCode: base64String });
                setQrPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQr = () => {
        setFormData({ ...formData, paymentQrCode: '' });
        setQrPreview(null);
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
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Tournament Identity</span>
                </div>

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

            {/* Section: Visibility & Payment */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <Globe className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Visibility & Monetization</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-neon-blue/40 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-yellow-500/70" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Public Tournament</p>
                                <p className="text-[11px] text-gray-500">Visible to everyone</p>
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

                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-neon-pink/40 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-neon-pink/70" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Paid Tournament</p>
                                <p className="text-[11px] text-gray-500">Require entry fee</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative ${formData.isPaid ? 'bg-neon-pink' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${formData.isPaid ? 'left-7' : 'left-1'}`} />
                            <input
                                type="checkbox"
                                name="isPaid"
                                checked={formData.isPaid}
                                onChange={handleChange}
                                className="sr-only"
                            />
                        </div>
                    </label>
                </div>

                {formData.isPaid && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 duration-300">
                        <Input
                            label="Entry Fee (INR)"
                            icon={<CreditCard className="w-3.5 h-3.5" />}
                            type="number"
                            name="entryFee"
                            value={formData.entryFee}
                            onChange={handleChange}
                            placeholder="e.g. 50"
                            min="0"
                            required
                        />
                        <Select
                            label="Payment Collection Method"
                            icon={<CreditCard className="w-3.5 h-3.5" />}
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="razorpay">Razorpay (Automatic)</option>
                            <option value="manual">Manual (QR / UPI / Bank)</option>
                        </Select>

                        {formData.paymentMethod === 'manual' && (
                            <div className="md:col-span-2 space-y-6">
                                <Textarea
                                    label="Payment Instructions"
                                    icon={<QrCode className="w-3.5 h-3.5" />}
                                    name="paymentInstructions"
                                    value={formData.paymentInstructions}
                                    onChange={handleChange}
                                    placeholder="Enter your payment instructions / Bank details"
                                    rows={3}
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            UPI ID for Automatic QR
                                        </label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            value={formData.upiId}
                                            onChange={handleChange}
                                            placeholder="e.g. yourname@upi"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 transition-all font-mono"
                                        />
                                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest italic">
                                            Recommended: Scanning this QR will open GPay/PhonePe directly.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            OR Upload Custom QR
                                        </label>
                                        {qrPreview ? (
                                            <div className="relative inline-block group/qr">
                                                <img src={qrPreview} alt="QR Preview" className="w-24 h-24 rounded-2xl border border-white/10 shadow-lg object-contain bg-white" />
                                                <button
                                                    type="button"
                                                    onClick={removeQr}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-3 p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-neon-purple/50 transition-all group">
                                                <Upload className="w-5 h-5 text-gray-500 group-hover:text-neon-purple" />
                                                <span className="text-[10px] font-black text-gray-500 group-hover:text-white uppercase">Upload QR Graphic</span>
                                                <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {formData.upiId && (
                                    <div className="p-6 bg-neon-purple/5 border border-neon-purple/20 rounded-3xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-ping"></div>
                                            <span className="text-[10px] font-black text-neon-purple uppercase tracking-widest">Live QR Gateway Preview</span>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl shadow-2xl">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${formData.upiId}&pn=${formData.name}&am=${formData.entryFee}&tn=Registration for ${formData.name}`)}`}
                                                alt="Functional UPI QR"
                                                className="w-32 h-32 object-contain"
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-mono text-center uppercase tracking-widest">
                                            Redirects to Payment Gateway on Scan
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full py-5 text-sm" loading={loading}>
                {initialData ? 'Save Changes' : 'Create Tournament'}
            </Button>
        </form>
    );
};

export default TournamentForm;