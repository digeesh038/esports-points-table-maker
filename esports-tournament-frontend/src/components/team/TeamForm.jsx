import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus, Trash2, Upload, X, Shield, Mail, Phone, Users, Zap, Database, Cpu, Activity, Receipt, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamForm = ({ onSubmit, loading, tournaments = [] }) => {
    const [formData, setFormData] = useState({
        tournamentId: '',
        name: '',
        tag: '',
        logo: '',
        captainEmail: '',
        captainPhone: '',
        players: [
            { inGameName: '', inGameId: '', role: '' }
        ],
        paymentProof: '',
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);

    // Find current tournament if ID is selected
    const selectedT = tournaments.find(t => t.id === formData.tournamentId);
    const isManualPayment = selectedT?.isPaid && selectedT?.paymentMethod === 'manual';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                toast.error('Logo file size must be less than 3MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, logo: base64String });
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setFormData({ ...formData, logo: '' });
        setLogoPreview(null);
    };

    const handleProofChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Proof file size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, paymentProof: base64String });
                setProofPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProof = () => {
        setFormData({ ...formData, paymentProof: '' });
        setProofPreview(null);
    };

    const handlePlayerChange = (index, field, value) => {
        const updatedPlayers = [...formData.players];
        updatedPlayers[index][field] = value;
        setFormData({ ...formData, players: updatedPlayers });
    };

    const addPlayer = () => {
        setFormData({
            ...formData,
            players: [...formData.players, { inGameName: '', inGameId: '', role: '' }],
        });
    };

    const removePlayer = (index) => {
        const updatedPlayers = formData.players.filter((_, i) => i !== index);
        setFormData({ ...formData, players: updatedPlayers });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (tournaments.length > 0 && !formData.tournamentId) {
            toast.error('Please select a tournament');
            return;
        }

        if (!formData.logo) {
            toast.error('Team logo is mandatory');
            return;
        }

        if (isManualPayment && !formData.paymentProof) {
            toast.error('Payment proof screenshot is required');
            return;
        }

        const validPlayers = formData.players.filter((p) => p.inGameName.trim() !== '');

        onSubmit({
            ...formData,
            captainName: formData.name,
            players: validPlayers,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 p-2 max-h-[75vh] overflow-y-auto custom-scrollbar">

            {/* --- CORE SQUAD IDENTIFICATION --- */}
            <div className="relative p-8 bg-dark-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Database className="w-24 h-24 text-neon-blue" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neon-blue/10 rounded-2xl border border-neon-blue/30 shadow-[0_0_15px_rgba(0,183,255,0.1)]">
                        <Users className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Team Info</h3>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">GENERAL TEAM DETAILS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournaments.length > 0 && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                Select Tournament <span className="text-neon-pink">*</span>
                            </label>
                            <select
                                name="tournamentId"
                                value={formData.tournamentId}
                                onChange={handleChange}
                                className="w-full rounded-2xl bg-[#0d1117] border border-white/10 px-5 py-4 text-sm text-white focus:border-neon-blue/50 outline-none transition-all appearance-none cursor-not-allowed opacity-80"
                                required
                            >
                                <option value="">CHOOSE TOURNAMENT...</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Input
                        label="Team Name"
                        icon={<Shield className="w-4 h-4" />}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., TEAM PHOENIX"
                        required
                    />

                    <Input
                        label="Team Tag"
                        type="text"
                        name="tag"
                        value={formData.tag}
                        onChange={handleChange}
                        placeholder="e.g., PHX"
                        maxLength="5"
                    />
                </div>

                {/* --- DIGITAL INSIGNIA UPLOAD --- */}
                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="mb-4">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                            Team Logo <span className="text-neon-pink animate-pulse">*</span>
                        </label>
                    </div>

                    <div className="relative">
                        {logoPreview ? (
                            <div className="flex items-center gap-8 p-6 bg-white/[0.02] rounded-3xl border border-neon-blue/20 shadow-2xl relative overflow-hidden group/insignia">
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent opacity-0 group-hover/insignia:opacity-100 transition-opacity"></div>

                                <div className="relative">
                                    <div className="absolute -inset-2 bg-neon-blue/20 rounded-2xl blur-md opacity-50"></div>
                                    <img src={logoPreview} alt="Preview" className="relative w-24 h-24 object-cover rounded-2xl border border-white/20 shadow-black shadow-2xl" />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-xl p-2 hover:bg-red-600 transition-all shadow-lg border border-red-400/50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-neon-blue animate-pulse" />
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Logo Added</p>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed">STATUS: VERIFIED</p>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/5 rounded-[2.5rem] cursor-pointer hover:border-neon-blue/30 hover:bg-neon-blue/[0.03] transition-all group bg-black/40 shadow-inner">
                                <div className="p-5 rounded-2xl bg-white/5 mb-4 group-hover:bg-neon-blue/10 group-hover:scale-110 transition-all duration-500">
                                    <Upload className="w-7 h-7 text-neon-blue" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UPLOAD TEAM LOGO</span>
                                <span className="text-[8px] text-gray-700 font-mono mt-3 uppercase tracking-[0.1em]">MAX SIZE: 3.0MB</span>
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* --- OPERATIONAL CONTACT --- */}
            <div className="relative p-8 bg-dark-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-24 h-24 text-neon-purple" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neon-purple/10 rounded-2xl border border-neon-purple/30 shadow-[0_0_15px_rgba(188,19,254,0.1)]">
                        <Mail className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Contact Info</h3>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">ORGANIZER CONTACT DETAILS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Email Address"
                        icon={<Mail className="w-4 h-4 text-neon-purple" />}
                        type="email"
                        name="captainEmail"
                        value={formData.captainEmail}
                        onChange={handleChange}
                        placeholder="Email for communication"
                        required
                    />

                    <Input
                        label="Phone Number"
                        icon={<Phone className="w-4 h-4 text-neon-pink" />}
                        type="tel"
                        name="captainPhone"
                        value={formData.captainPhone}
                        onChange={handleChange}
                        placeholder="Contact number"
                        required
                    />
                </div>
            </div>

            {/* --- ROSTER REGISTRY --- */}
            <div className="relative p-8 bg-dark-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-neon-pink/10 rounded-2xl border border-neon-pink/30 shadow-[0_0_15px_rgba(255,46,151,0.1)]">
                            <Users className="w-5 h-5 text-neon-pink" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Team Roster</h3>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">LIST OF PLAYERS</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={addPlayer}
                        className="px-5 py-2.5 rounded-2xl bg-neon-pink/10 text-neon-pink border border-neon-pink/30 text-[10px] font-black uppercase tracking-[0.2em] flex items-center hover:bg-neon-pink hover:text-white transition-all shadow-[0_0_20px_rgba(255,46,151,0.2)]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Player
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.players.map((player, index) => (
                        <div key={index} className="group/player bg-black/40 border border-white/5 hover:border-neon-pink/30 rounded-3xl p-6 relative transition-all duration-500">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-neon-pink/20 rounded-full group-hover/player:bg-neon-pink transition-colors"></div>

                            {formData.players.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePlayer(index)}
                                    className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition-colors p-1.5 bg-white/5 rounded-xl border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <Input
                                    label={`Player ${index + 1} Name`}
                                    type="text"
                                    value={player.inGameName}
                                    onChange={(e) => handlePlayerChange(index, 'inGameName', e.target.value)}
                                    placeholder="In-Game Name"
                                />
                                <Input
                                    label="Player ID"
                                    type="text"
                                    value={player.inGameId}
                                    onChange={(e) => handlePlayerChange(index, 'inGameId', e.target.value)}
                                    placeholder="Game ID"
                                />
                                <Input
                                    label="Role"
                                    type="text"
                                    value={player.role}
                                    onChange={(e) => handlePlayerChange(index, 'role', e.target.value)}
                                    placeholder="e.g. SNIPER"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PAYMENT PROOF (Conditional) --- */}
            {isManualPayment && (
                <div className="relative p-8 bg-dark-900/40 rounded-[2.5rem] border border-neon-purple/20 overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Receipt className="w-24 h-24 text-neon-purple" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-neon-purple/10 rounded-2xl border border-neon-purple/30 shadow-[0_0_15px_rgba(188,19,254,0.1)]">
                            <QrCode className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Manual Payment</h3>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">FOLLOW INSTRUCTIONS BELOW</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/60 p-6 rounded-3xl border border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-neon-purple uppercase tracking-widest">Organizer Instructions:</p>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                {selectedT.paymentInstructions || 'Please contact organizer for payment details.'}
                            </p>
                            <div className="pt-2">
                                <span className="text-[10px] font-black text-neon-pink uppercase">Amount Due: </span>
                                <span className="text-xl font-black text-white italic">{selectedT.currency} {selectedT.entryFee}</span>
                            </div>

                            {selectedT.paymentQrCode && (
                                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center gap-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Scan QR to Pay</p>
                                    <div className="p-3 bg-white rounded-xl">
                                        <img src={selectedT.paymentQrCode} alt="Payment QR" className="w-32 h-32 object-contain" />
                                    </div>
                                    <p className="text-[8px] text-gray-600 font-mono text-center">SCAN USING ANY UPI/BANK APP</p>
                                </div>
                            )}

                            {selectedT.upiId && (
                                <div className="mt-6 p-6 bg-neon-purple/5 border border-neon-purple/20 rounded-3xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-ping"></div>
                                        <span className="text-[10px] font-black text-neon-purple uppercase tracking-widest">Direct UPI Gateway</span>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl shadow-2xl">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${selectedT.upiId}&pn=${selectedT.name}&am=${selectedT.entryFee}&tn=Registration for ${selectedT.name}`)}`}
                                            alt="Functional UPI QR"
                                            className="w-32 h-32 object-contain"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono text-center uppercase tracking-widest italic">
                                        Scan to open Payment Gateway
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                Upload Payment Screenshot <span className="text-neon-pink">*</span>
                            </label>

                            {proofPreview ? (
                                <div className="relative group/proof rounded-3xl overflow-hidden border border-neon-purple/30 bg-black/40 p-4 flex items-center gap-6">
                                    <img src={proofPreview} alt="Payment Proof" className="w-20 h-20 object-cover rounded-xl border border-white/10" />
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Screenshot Uploaded</p>
                                        <button
                                            type="button"
                                            onClick={removeProof}
                                            className="text-[10px] text-red-500 hover:underline uppercase font-bold"
                                        >
                                            Remove & Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neon-purple/20 rounded-[2.5rem] cursor-pointer hover:border-neon-purple/50 hover:bg-neon-purple/[0.03] transition-all bg-black/20 group/upload">
                                    <Upload className="w-6 h-6 text-neon-purple mb-2 group-hover/upload:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/upload:text-white">Select Screenshot</span>
                                    <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group perspective-1000"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <div className={`relative w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic flex items-center justify-center transition-all shadow-2xl overflow-hidden
                        ${loading
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-[#0d1117] text-white border border-white/10 group-hover:border-neon-blue/50'
                        }`}>
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
                                REGISTERING TEAM...
                            </div>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-4 text-neon-blue group-hover:animate-bounce" />
                                REGISTER TEAM
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </form>
    );
};

export default TeamForm;