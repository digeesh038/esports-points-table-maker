import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Gamepad2, Zap, Rocket } from 'lucide-react';
import GamingBackground from '../components/common/GamingBackground';
import toast from 'react-hot-toast';

const GoogleSignInPage = () => {
    const { googleLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential);

        if (!res?.success) {
            toast.error(res?.error || 'Google sign-in failed');
            return;
        }

        toast.success('System Linked. Welcome, Commander! 🎮');
        navigate('/dashboard', { replace: true });
    };

    const handleError = () => {
        toast.error('Authentication Error. System access denied.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
            <GamingBackground />

            {/* Content Container */}
            <div className="w-full max-w-md px-6 relative z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="bg-[#0a0a0f]/90 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-6 md:p-10 border border-white/10 relative overflow-hidden group">
                        {/* Interactive Corner Accents */}
                        <div className="absolute top-0 left-0 w-12 h-12 md:w-20 md:h-20 border-t-2 border-l-2 border-neon-blue/30 rounded-tl-[32px] md:rounded-tl-[40px] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-20 md:h-20 border-b-2 border-r-2 border-neon-purple/30 rounded-br-[32px] md:rounded-br-[40px] pointer-events-none" />

                        {/* Header Section */}
                        <div className="text-center mb-10 md:mb-12 relative">
                            <motion.div
                                animate={{
                                    boxShadow: ["0 0 20px rgba(0,240,255,0.2)", "0 0 40px rgba(0,240,255,0.4)", "0 0 20px rgba(0,240,255,0.2)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="inline-flex mb-6 md:mb-8 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-dark-800 border border-neon-blue/30 relative z-10"
                            >
                                <Gamepad2 className="w-10 h-10 md:w-14 md:h-14 text-neon-blue drop-shadow-[0_0_15px_#00f0ff]" />
                            </motion.div>

                            <div className="relative mb-6">
                                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase relative z-10 leading-[0.9] md:leading-none">
                                    <span className="text-neon-blue">TOURNAMENT</span><br />CONSOLE
                                </h1>
                                {/* Glitch Layers - Constant subtle movement */}
                                <h1 className="absolute inset-0 text-3xl md:text-5xl font-black text-red-500 italic tracking-tighter uppercase opacity-30 animate-glitch-1 select-none pointer-events-none translate-x-[2px] leading-[0.9] md:leading-none">
                                    <span className="text-red-500">TOURNAMENT</span><br />CONSOLE
                                </h1>
                                <h1 className="absolute inset-0 text-3xl md:text-5xl font-black text-neon-blue italic tracking-tighter uppercase opacity-30 animate-glitch-2 select-none pointer-events-none -translate-x-[2px] leading-[0.9] md:leading-none">
                                    <span className="text-neon-blue">TOURNAMENT</span><br />CONSOLE
                                </h1>
                            </div>

                            <div className="flex items-center justify-center gap-3 md:gap-4">
                                <div className="h-[1px] md:h-[2px] w-8 md:w-12 bg-gradient-to-r from-transparent to-neon-blue/20" />
                                <p className="text-[9px] md:text-[10px] font-mono text-neon-blue font-bold uppercase tracking-[0.4em] animate-pulse">
                                    V_AUTHENTICATION_REQ
                                </p>
                                <div className="h-[1px] md:h-[2px] w-8 md:w-12 bg-gradient-to-l from-transparent to-neon-blue/20" />
                            </div>
                        </div>

                        {/* Terms Section - Redesigned for mobile */}
                        <div className="mb-8 p-5 md:p-6 rounded-[20px] md:rounded-[24px] bg-white/[0.02] border border-white/5 group-hover:border-neon-blue/20 transition-all duration-500">
                            <label className="flex items-start gap-3 md:gap-4 cursor-pointer">
                                <div className="relative flex items-center mt-1 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer hidden"
                                    />
                                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 border-white/10 bg-dark-900 transition-all peer-checked:bg-neon-blue peer-checked:border-neon-blue peer-checked:shadow-[0_0_15px_#00f0ff]" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 text-black fill-current" />
                                    </div>
                                </div>
                                <div className="text-[11px] md:text-[12px] leading-relaxed text-gray-400 font-medium select-none">
                                    Confirmed <span className="text-white font-bold underline decoration-neon-blue/50 underline-offset-4">18+ Operative</span> status. Accept all <Link to="/terms" className="text-neon-blue hover:text-white transition-colors">Strategic Protocols</Link>.
                                </div>
                            </label>
                        </div>

                        {/* Google Action Button Container - Fixed Sizing & Polish */}
                        <div className={`relative p-0.5 md:p-1 rounded-[20px] md:rounded-[24px] transition-all duration-700 ${!agreed ? 'opacity-10 filter grayscale blur-[1px]' : 'opacity-100'}`}>
                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/40 via-neon-purple/40 to-neon-blue/40 rounded-[20px] md:rounded-[24px] animate-shimmer opacity-20" />

                            <div className="relative bg-[#0a0a0f] rounded-[18px] md:rounded-[22px] p-4 md:p-6 border border-white/10 flex flex-col items-center justify-center gap-4 md:gap-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                <div className="transform origin-center">
                                    <div className="max-w-full flex justify-center">
                                        <GoogleLogin
                                            onSuccess={handleSuccess}
                                            onError={handleError}
                                            theme="filled_black"
                                            size="large"
                                            text="signin_with"
                                            shape="pill"
                                            width="230"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-30">
                                    <Shield className="w-3 h-3 text-neon-blue" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Google Encrypted Pipeline</span>
                                </div>
                            </div>
                        </div>

                        {/* Connection Warning */}
                        <div className="mt-6 md:mt-8 text-center px-2">
                            <p className="text-[8px] md:text-[9px] text-amber-500/60 uppercase tracking-widest font-black italic">
                                deactivate ad-block if terminal stays hidden
                            </p>
                        </div>

                        {/* Bottom Status Branding */}
                        <div className="mt-10 md:mt-12 flex items-center justify-between text-[8px] md:text-[9px] font-mono text-gray-700 uppercase tracking-widest px-1 md:px-2">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <div className="w-1.5 h-1.5 bg-neon-green rounded-full shadow-[0_0_10px_#39ff14] animate-pulse" />
                                <span>SECURE_LINK: ACTIVE</span>
                            </div>
                            <span>V4.0.2 // R5</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GoogleSignInPage;
