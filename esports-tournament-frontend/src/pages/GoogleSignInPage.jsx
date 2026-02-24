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
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050508] p-4">
            <GamingBackground />

            {/* Content Container - No Scroll Frame */}
            <div className="w-full max-w-[420px] relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="bg-[#0a0a0f]/95 backdrop-blur-3xl rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-6 md:p-8 border border-white/10 relative overflow-hidden group">
                        {/* Interactive Corner Accents */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-neon-blue/30 rounded-tl-[40px] pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-neon-purple/30 rounded-br-[40px] pointer-events-none" />

                        {/* Header Section */}
                        <div className="text-center mb-8 md:mb-10 relative pt-2">
                            <motion.div
                                animate={{
                                    boxShadow: ["0 0 20px rgba(0,240,255,0.1)", "0 0 40px rgba(0,240,255,0.3)", "0 0 20px rgba(0,240,255,0.1)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="inline-flex mb-6 p-4 rounded-3xl bg-dark-800 border border-neon-blue/20 relative z-10"
                            >
                                <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-neon-blue drop-shadow-[0_0_15px_#00f0ff]" />
                            </motion.div>

                            <div className="relative mb-6 px-4">
                                <h1 className="text-2xl xs:text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase relative z-10 leading-none drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                                    <span className="text-neon-blue inline-block pl-2">TOURNAMENT</span><br />CONSOLE
                                </h1>
                                {/* Glitch Layers */}
                                <h1 className="absolute inset-0 text-2xl xs:text-3xl md:text-5xl font-black text-red-500 italic tracking-tighter uppercase opacity-20 animate-glitch-1 select-none pointer-events-none translate-x-[2px] px-4">
                                    <span className="text-red-500 inline-block pl-2">TOURNAMENT</span><br />CONSOLE
                                </h1>
                                <h1 className="absolute inset-0 text-2xl xs:text-3xl md:text-5xl font-black text-neon-blue italic tracking-tighter uppercase opacity-20 animate-glitch-2 select-none pointer-events-none -translate-x-[2px] px-4">
                                    <span className="text-neon-blue inline-block pl-2">TOURNAMENT</span><br />CONSOLE
                                </h1>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] w-6 md:w-10 bg-gradient-to-r from-transparent to-neon-blue/30" />
                                <p className="text-[8px] md:text-[9px] font-mono text-neon-blue/80 font-bold uppercase tracking-[0.4em] animate-pulse">
                                    V_AUTHENTICATION_REQ
                                </p>
                                <div className="h-[1px] w-6 md:w-10 bg-gradient-to-l from-transparent to-neon-blue/30" />
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="mb-6 md:mb-8 p-4 rounded-[24px] bg-white/[0.03] border border-white/10 group-hover:border-neon-blue/30 transition-all duration-500">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <div className="relative flex items-center shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer hidden"
                                    />
                                    <div className="w-7 h-7 rounded-xl border-2 border-white/10 bg-dark-900 transition-all peer-checked:bg-neon-blue peer-checked:border-neon-blue peer-checked:shadow-[0_0_20px_#00f0ff]" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <Zap className="w-3.5 h-3.5 text-black fill-current" />
                                    </div>
                                </div>
                                <div className="text-[10px] md:text-[11px] leading-tight text-gray-400 font-bold select-none">
                                    Confirmed <span className="text-white underline decoration-neon-blue/50 underline-offset-2">18+ Operative</span>. Accept <Link to="/terms" className="text-neon-blue hover:underline">Strategic Protocols</Link>.
                                </div>
                            </label>
                        </div>

                        {/* Google Action Button - Fixed Frame Scaling */}
                        <div className={`relative p-1 rounded-[24px] transition-all duration-700 ${!agreed ? 'opacity-30 filter grayscale blur-[0.2px]' : 'opacity-100'}`}>
                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/40 via-neon-purple/40 to-neon-blue/40 rounded-[24px] animate-shimmer opacity-20" />

                            <div className="relative bg-[#0d0d12]/80 backdrop-blur-xl rounded-[22px] p-5 md:p-6 border border-white/10 flex flex-col items-center justify-center gap-4 shadow-3xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                <div className="z-10 w-full flex justify-center scale-[0.9] md:scale-100">
                                    <div className="shadow-[0_0_30px_rgba(0,183,255,0.2)] rounded-full">
                                        <div className="hidden md:block">
                                            <GoogleLogin
                                                onSuccess={handleSuccess}
                                                onError={handleError}
                                                theme="outline"
                                                size="large"
                                                text="signin_with"
                                                shape="pill"
                                                width="240"
                                            />
                                        </div>
                                        <div className="block md:hidden">
                                            <GoogleLogin
                                                onSuccess={handleSuccess}
                                                onError={handleError}
                                                theme="outline"
                                                size="large"
                                                text="signin_with"
                                                shape="pill"
                                                width="200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-40">
                                    <Shield className="w-3 h-3 text-neon-blue" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Google Encrypted Link</span>
                                </div>
                            </div>
                        </div>

                        {/* Connection Warning */}
                        <div className="mt-6 text-center">
                            <p className="text-[8px] text-amber-500/50 uppercase tracking-[0.2em] font-black italic">
                                disable ad-block if terminal fails
                            </p>
                        </div>

                        {/* Bottom Status Branding */}
                        <div className="mt-8 flex items-center justify-between text-[8px] font-mono text-gray-800 uppercase tracking-widest px-2 group-hover:text-gray-600 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-neon-green/40 rounded-full shadow-[0_0_10px_#39ff14]" />
                                <span>SECURE: OK</span>
                            </div>
                            <span>V4.0.2</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GoogleSignInPage;
