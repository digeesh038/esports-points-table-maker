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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <GamingBackground />

            {/* Content Container */}
            <div className="w-full max-w-md px-6 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 border border-white/10 relative overflow-hidden group hover:border-neon-blue/40 transition-all duration-700">
                        {/* Internal Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent" />

                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <motion.div
                                animate={{
                                    rotateY: [0, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="inline-block mb-6 p-4 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                            >
                                <Gamepad2 className="w-12 h-12 text-neon-blue drop-shadow-[0_0_10px_#00f0ff]" />
                            </motion.div>

                            <div className="relative group">
                                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-3 relative z-10">
                                    <span className="text-neon-blue">Tournament</span> Console
                                </h1>
                                {/* Glitch Layers */}
                                <h1 className="absolute inset-0 text-4xl md:text-5xl font-black text-red-500 italic tracking-tighter uppercase mb-3 opacity-30 group-hover:animate-glitch-1 hidden md:block">
                                    <span className="text-red-500">Tournament</span> Console
                                </h1>
                                <h1 className="absolute inset-0 text-4xl md:text-5xl font-black text-cyan-500 italic tracking-tighter uppercase mb-3 opacity-30 group-hover:animate-glitch-2 hidden md:block">
                                    <span className="text-cyan-500">Tournament</span> Console
                                </h1>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <span className="h-px w-8 bg-white/10" />
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em]">
                                    Identity Verification Required
                                </p>
                                <span className="h-px w-8 bg-white/10" />
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer hidden"
                                    />
                                    <div className="w-5 h-5 rounded border border-white/20 bg-dark-900 transition-all peer-checked:bg-neon-blue peer-checked:border-neon-blue group-hover:border-neon-blue" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <Zap className="w-3 h-3 text-black fill-current" />
                                    </div>
                                </div>
                                <div className="text-[11px] leading-relaxed text-gray-400 select-none">
                                    I confirm I am <span className="text-neon-blue font-bold">18 years or older</span>. I accept the <Link to="/privacy" className="text-white hover:text-neon-blue transition-colors underline decoration-neon-blue/30" target="_blank">Privacy Clause</Link> and <Link to="/terms" className="text-white hover:text-neon-blue transition-colors underline decoration-neon-blue/30" target="_blank">Operations Manual</Link>.
                                </div>
                            </label>
                        </div>

                        {/* Google Action Button */}
                        <div className={`relative transition-all duration-500 overflow-hidden rounded-2xl border ${!agreed ? 'opacity-20 pointer-events-none filter grayscale' : 'opacity-100 border-white/10 hover:border-neon-blue/50'}`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />
                            <div className="flex justify-center items-center py-1 bg-white/[0.02] w-full min-h-[50px]">
                                <div className="scale-[0.85] md:scale-100 transition-transform">
                                    <GoogleLogin
                                        onSuccess={handleSuccess}
                                        onError={handleError}
                                        theme="filled_black"
                                        size="large"
                                        text="signin_with"
                                        shape="rectangular"
                                        width="280"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Status Branding */}
                        <div className="mt-10 flex items-center justify-between text-[8px] font-mono text-gray-600 uppercase tracking-widest px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-neon-green rounded-full shadow-[0_0_5px_#39ff14] animate-pulse" />
                                <span>Global Nodes: ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-2.5 h-2.5" />
                                <span>Secured by Google</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Background Floating Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -top-12 -right-12 text-neon-blue/20 blur-[1px] hidden md:block"
                >
                    <Rocket className="w-24 h-24" />
                </motion.div>
            </div>
        </div>
    );
};

export default GoogleSignInPage;

