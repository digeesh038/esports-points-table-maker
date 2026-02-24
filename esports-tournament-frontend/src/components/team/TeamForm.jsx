import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus, Trash2, Upload, X, Shield, Mail, Phone, Users, Zap, Database, Cpu, Activity, Receipt, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const getUpiQrUrl = (upiId, amount, name = 'Tournament') => {
    if (!upiId) return null;
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Tournament Entry Fee')}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10`;
};

const TeamForm = ({ onSubmit, loading, tournaments = [], tournament = null }) => {
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
        upiTransactionId: '',
    });

    const [logoPreview, setLogoPreview] = useState(null);

    // Use directly-passed tournament OR find from dropdown selection
    const selectedT = tournament || tournaments.find(t => t.id === formData.tournamentId);
    const isManualPayment = selectedT?.isPaid && selectedT?.entryFee > 0;
    const qrUrl = getUpiQrUrl(selectedT?.upiId, selectedT?.entryFee, selectedT?.name);

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

        if (isManualPayment && !formData.upiTransactionId?.trim()) {
            toast.error('Enter your UPI Transaction ID after paying');
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

            {/* --- UPI PAYMENT --- */}
            {isManualPayment && (
                <div className="relative p-8 bg-dark-900/40 rounded-[2.5rem] border border-neon-green/20 overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-neon-green/10 rounded-2xl border border-neon-green/30">
                            <QrCode className="w-5 h-5 text-neon-green" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Pay Entry Fee</h3>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">SCAN QR TO PAY · THEN ENTER TRANSACTION ID</p>
                        </div>
                    </div>

                    {/* Amount + UPI */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-black/40 rounded-3xl border border-white/5 mb-6">
                        {/* Auto QR */}
                        {qrUrl ? (
                            <div className="flex-shrink-0 p-3 bg-white rounded-2xl shadow-2xl shadow-neon-green/10">
                                <img
                                    src={qrUrl}
                                    alt="Pay via UPI"
                                    className="w-36 h-36 object-contain"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        ) : (
                            <div className="w-36 h-36 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                <QrCode className="w-10 h-10 text-gray-600" />
                            </div>
                        )}

                        <div className="space-y-3 text-center md:text-left">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Entry Fee</p>
                                <p className="text-3xl font-black text-white italic">₹{selectedT.entryFee}</p>
                            </div>
                            {selectedT.upiId && (
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 inline-block">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Pay to UPI ID</p>
                                    <p className="text-sm font-black text-neon-green font-mono">{selectedT.upiId}</p>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-500">
                                Scan QR with Google Pay, PhonePe, Paytm, or BHIM
                            </p>
                            {selectedT.paymentInstructions && (
                                <p className="text-xs text-gray-400 italic">{selectedT.paymentInstructions}</p>
                            )}
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <Input
                        label="UPI Transaction ID *"
                        icon={<Zap className="w-4 h-4" />}
                        type="text"
                        name="upiTransactionId"
                        value={formData.upiTransactionId || ''}
                        onChange={handleChange}
                        placeholder="e.g. 402312345678 (copy from your payment app)"
                        required={isManualPayment}
                    />
                    <p className="text-[10px] text-gray-600 mt-2 ml-1">
                        After paying, open your UPI app → go to transaction history → copy the 12-digit Transaction ID.
                    </p>
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