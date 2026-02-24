import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Award, Clock, Copy, Check, Activity, HardDrive, Cpu, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card';
import dashboardAPI from '../api/dashboard';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, logout, isGuest } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(!isGuest);
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (!isGuest) {
            fetchStats();
        }
    }, [isGuest]);

    const fetchStats = async () => {
        try {
            const res = await dashboardAPI.getStats();
            setStats(res.data || res);
        } catch (err) {
            console.error('Failed to fetch profile stats');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('System ID copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-20"
        >
            {/* Holographic Header */}
            <motion.div variants={itemVariants} className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-neon-blue via-neon-purple to-transparent hidden md:block"></div>
                <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic uppercase tracking-tighter flex items-center gap-4">
                    <Terminal className="w-8 h-8 md:w-12 md:h-12 text-neon-blue" />
                    Operative Profile
                </h1>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 md:w-2 h-1 bg-neon-blue/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                    </div>
                    <p className="text-gray-400 text-xs md:text-base font-mono uppercase tracking-widest opacity-60">
                        {isGuest ? 'AUTH_STATUS: TEMPORARY_VISITOR' : 'AUTH_STATUS: ESTABLISHED_NODE'}
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Identity Card */}
                <motion.div variants={itemVariants} className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                    <Card className="bg-[#050508]/60 backdrop-blur-2xl border-white/5 relative overflow-hidden group">
                        {/* Interactive Scanline effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                            <div className="w-full h-1 bg-neon-blue absolute top-0 animate-[scan_3s_linear_infinite]"></div>
                        </div>

                        <div className="flex flex-col items-center text-center p-8 relative z-10">
                            <div className="relative mb-8 pt-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 -m-4 border border-dashed border-neon-blue/20 rounded-full"
                                ></motion.div>

                                <div className="absolute inset-0 bg-neon-blue/20 blur-2xl rounded-full"></div>

                                <div className="relative">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.2)] object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-dark-800 flex items-center justify-center border-4 border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                                            <User className="w-16 h-16 text-neon-blue" />
                                        </div>
                                    )}
                                    {/* Online Indicator */}
                                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-dark-900 rounded-full flex items-center justify-center border-2 border-white/10">
                                        <div className="w-4 h-4 bg-neon-green rounded-full shadow-[0_0_10px_#39ff14] animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">
                                    {user?.name}
                                </h2>
                                <div className={`px-2 py-0.5 rounded border text-[9px] font-black font-mono shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isGuest ? 'border-neon-blue/40 text-neon-blue' : 'border-neon-green/40 text-neon-green bg-neon-green/5'}`}>
                                    {isGuest ? 'LVL_1' : 'LVL_5'}
                                </div>
                            </div>

                            <div className="relative px-6 py-1.5 overflow-hidden rounded-md border border-neon-purple/30 bg-neon-purple/10 mb-8">
                                <span className="relative z-10 text-neon-purple font-mono text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                                    {isGuest ? 'GUEST_PROTO_USER' : (user?.role === 'admin' ? 'SYSTEM_ADMINISTRATOR' : 'ORGANIZATION_LEADER')}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 font-bold uppercase tracking-widest text-[10px] transition-all rounded-xl flex items-center justify-center group active:scale-95"
                            >
                                <span className="mr-3">{isGuest ? 'DROP GUEST CONNECTION' : 'TERMINATE SYSTEM SESSION'}</span>
                                <div className="w-2 h-2 bg-white/20 rounded-full group-hover:bg-red-500 animate-pulse"></div>
                            </button>
                        </div>
                    </Card>

                    {/* Quick System Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-dark-800/30 border border-white/5 p-4 rounded-2xl">
                            <Activity className="w-4 h-4 text-neon-blue mb-2" />
                            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Pulse</div>
                            <div className="text-white font-black italic">NOMINAL</div>
                        </div>
                        <div className="bg-dark-800/30 border border-white/5 p-4 rounded-2xl">
                            <Cpu className="w-4 h-4 text-neon-purple mb-2" />
                            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sync</div>
                            <div className="text-white font-black italic">ACTIVE</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Technical Details & Metrics */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
                    {/* Security Record */}
                    <Card className="bg-dark-800/20 border-white/5 p-6 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl"></div>

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white flex items-center italic tracking-tight">
                                <Shield className="w-6 h-6 text-neon-blue mr-3" />
                                SECURITY_DOSSIER
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Registered Email', value: isGuest ? 'guest@simulation.node' : user?.email, icon: Mail, color: 'text-neon-blue' },
                                { label: 'Latest Check-in', value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), icon: Clock, color: 'text-neon-green' }
                            ].map((field, idx) => (
                                <div key={idx} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/field">
                                    <div className="flex items-center text-gray-500 mb-2">
                                        <field.icon className={`w-3.5 h-3.5 mr-2 ${field.color}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{field.label}</span>
                                    </div>
                                    <div className="text-sm md:text-base text-white font-bold truncate">
                                        {field.value}
                                    </div>
                                </div>
                            ))}

                            {/* System ID Field - Hidden by default */}
                            <div className="md:col-span-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/key">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center text-gray-500">
                                        <HardDrive className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Access Key</span>
                                    </div>
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="text-[9px] font-black uppercase text-neon-blue hover:text-white transition-colors"
                                    >
                                        {showKey ? '[ HIDE_KEY ]' : '[ REVEAL_KEY ]'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className={`font-mono text-xs transition-all duration-300 flex-1 truncate ${showKey ? 'text-gray-300 opacity-100' : 'text-gray-700 opacity-30 select-none blur-sm'}`}>
                                        {showKey ? (!isGuest ? user?.id : 'GUEST_PROTO_KEY_RESTRICTED') : '••••••••••••••••••••••••••••••••'}
                                    </div>
                                    {showKey && !isGuest && (
                                        <button
                                            onClick={() => copyToClipboard(user?.id)}
                                            className="p-2 bg-neon-blue/10 text-neon-blue rounded-lg hover:bg-neon-blue hover:text-black transition-all"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Operational Metrics (DYNAMIC) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Status Panel */}
                        <Card className={`p-8 border relative overflow-hidden flex flex-col justify-center min-h-[160px] ${isGuest ? 'bg-neon-blue/5 border-neon-blue/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                            <div className="absolute top-2 right-2 opacity-5">
                                {isGuest ? <Shield className="w-32 h-32" /> : <Award className="w-32 h-32" />}
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${isGuest ? 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                    {isGuest ? <Shield className="w-7 h-7" /> : <Award className="w-7 h-7" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-black text-lg md:text-xl uppercase italic tracking-tighter ${isGuest ? 'text-neon-blue' : 'text-yellow-500'}`}>
                                        {isGuest ? 'RESTRICTED_MODE' : 'PRO_LICENSE_ACTIVE'}
                                    </h4>
                                    <p className="text-gray-400 text-xs mt-1 font-medium leading-relaxed">
                                        {isGuest ? 'System is running in simulation. Profile data will not be persisted.' : 'Total access to tournament cloud authorized. Match processing tools active.'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Real Stats Panel */}
                        <Card className="bg-dark-800/40 border-white/5 p-8 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.35em] mb-2">Deployments</div>
                                    <div className="text-3xl md:text-4xl font-black text-white italic">
                                        {loading ? <div className="w-8 h-8 bg-white/5 animate-pulse rounded"></div> : (stats?.tournaments || 0)}
                                    </div>
                                    <div className="text-[9px] font-mono text-neon-blue mt-1 uppercase">Active Tournaments</div>
                                </div>
                                <div className="border-l border-white/5 pl-8">
                                    <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.35em] mb-2">Branches</div>
                                    <div className="text-3xl md:text-4xl font-black text-white italic">
                                        {loading ? <div className="w-8 h-8 bg-white/5 animate-pulse rounded"></div> : (stats?.organizations || 0)}
                                    </div>
                                    <div className="text-[9px] font-mono text-neon-purple mt-1 uppercase">Managed Orgs</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Desktop Command Footer Styling */}
                    <div className="hidden md:flex items-center justify-between py-6 px-10 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_8px_#39ff14]"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Telemetry: ACTIVE</span>
                            </div>
                            <div className="w-px h-6 bg-white/5"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_8px_#00f0ff]"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Secure Shell: ENCRYPTED</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-600">
                            SESSION_ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;
