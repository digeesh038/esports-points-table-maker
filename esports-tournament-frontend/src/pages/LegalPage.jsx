import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Shield, FileText, Lock, ArrowLeft, Zap, Info, ShieldAlert, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import GamingBackground from '../components/common/GamingBackground';

const LegalPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-[#050508] relative overflow-hidden selection:bg-neon-blue/30">
            <GamingBackground />

            {/* HUD Scanning Line */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue z-50 origin-left"
                style={{ scaleX }}
            />

            {/* Back Button HUD */}
            <div className="fixed top-8 left-8 z-40">
                <Link to="/login" className="group flex items-center gap-3 bg-dark-900/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-2xl hover:border-neon-blue/40 transition-all duration-500">
                    <div className="relative">
                        <ArrowLeft className="w-5 h-5 text-neon-blue group-hover:-translate-x-1 transition-transform" />
                        <div className="absolute inset-0 blur-sm bg-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Return_Link</span>
                </Link>
            </div>

            <div className="max-w-5xl mx-auto relative z-10 py-32 px-6">
                {/* Cinematic Header Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-24 relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

                    <div className="relative inline-block mb-10">
                        <div className="absolute inset-0 bg-neon-blue/20 blur-2xl animate-pulse" />
                        <div className="relative p-6 rounded-3xl bg-dark-900 border border-neon-blue/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                            <Shield className="w-16 h-16 text-neon-blue drop-shadow-[0_0_15px_#00f0ff]" />
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none pr-4">
                            LEGAL <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-blue to-neon-purple drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">PROTOCOLS</span>
                        </h1>
                        <div className="h-px w-24 bg-neon-blue/40 mx-auto mt-8 animate-pulse" />
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-8">
                        <span className="text-[10px] font-mono text-neon-blue font-bold uppercase tracking-[0.4em] px-4 py-1.5 rounded-full bg-neon-blue/5 border border-neon-blue/20">
                            Version_4.0.2_COMMID
                        </span>
                        <div className="flex items-center gap-2 opacity-30">
                            <Cpu className="w-3 h-3 text-white" />
                            <span className="text-[9px] font-mono text-white uppercase tracking-widest">Sys_Secure_Active</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                    {/* Table of Contents / Status HUD */}
                    <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit">
                        <div className="bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                            <h3 className="text-[11px] font-black text-neon-blue uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <Zap className="w-3 h-3" /> System_Index
                            </h3>
                            <nav className="space-y-4">
                                {['Terms_Of_Service', 'Privacy_Policy', 'Cookies_Protocol', 'Intellectual_Rights'].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group/item cursor-pointer">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover/item:bg-neon-blue group-hover/item:shadow-[0_0_8px_#00f0ff] transition-all" />
                                        <span className="text-xs font-mono text-gray-500 group-hover/item:text-white transition-colors">{item}</span>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        <div className="bg-neon-purple/5 backdrop-blur-3xl border border-neon-purple/10 rounded-[32px] p-8 hidden lg:block">
                            <ShieldAlert className="w-8 h-8 text-neon-purple mb-6" />
                            <p className="text-[10px] leading-relaxed text-gray-500 uppercase tracking-widest font-black italic">
                                Unauthorized violations of these rules will result in account suspension.
                            </p>
                        </div>
                    </div>

                    {/* Main Legal Content */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Terms Section */}
                        <motion.section variants={itemVariants} className="relative">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center shadow-2xl group">
                                    <FileText className="w-6 h-6 text-neon-blue group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tight text-white uppercase leading-none pr-4">Terms of Service</h2>
                                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mt-2">Policy: TERMS OF SERVICE // 01</p>
                                </div>
                            </div>

                            <div className="bg-[#0d0d12]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 md:p-14 relative overflow-hidden">
                                <div className="prose prose-invert max-w-none text-gray-400 space-y-12 text-base md:text-lg leading-relaxed font-medium">
                                    <div className="relative pl-8 border-l-2 border-neon-blue/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">1. Grid Entry & Conduct</h3>
                                        <p>
                                            By accessing the <span className="text-neon-blue">Tournament Console</span>, you agree to our competitive rules. Fair play is mandatory. Users are prohibited from using cheats or automated scripts.
                                        </p>
                                    </div>

                                    <div className="relative pl-8 border-l-2 border-neon-blue/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">2. Entity Responsibility</h3>
                                        <p>
                                            You are responsible for your account security. Any unauthorized access should be reported to support immediately.
                                        </p>
                                    </div>

                                    <div className="relative pl-8 border-l-2 border-neon-blue/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">3. Competitive Termination</h3>
                                        <p>
                                            The platform reserves the right to suspend accounts that disrupt the competitive balance or behave inappropriately.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Info className="w-32 h-32 text-white" />
                                </div>
                            </div>
                        </motion.section>

                        {/* Privacy Protocol Section */}
                        <motion.section variants={itemVariants} className="relative">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center shadow-2xl group">
                                    <Lock className="w-6 h-6 text-neon-purple group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tight text-white uppercase leading-none pr-4">Privacy Protocol</h2>
                                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mt-2">Policy: PRIVACY POLICY // 02</p>
                                </div>
                            </div>

                            <div className="bg-[#0d0d12]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 md:p-14 relative overflow-hidden">
                                <div className="prose prose-invert max-w-none text-gray-400 space-y-12 text-base md:text-lg leading-relaxed font-medium">
                                    <div className="relative pl-8 border-l-2 border-neon-purple/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">1. Signal Capture</h3>
                                        <p>
                                            We archive only the data necessary for tournament management. This includes your <span className="text-neon-purple">Google Profile</span> information and performance metrics across matches.
                                        </p>
                                    </div>

                                    <div className="relative pl-8 border-l-2 border-neon-purple/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">2. Tactical Telemetry</h3>
                                        <p>
                                            Your match data—including scores and rankings—is displayed on public leaderboards. By participating, you authorize this data display.
                                        </p>
                                    </div>

                                    <div className="relative pl-8 border-l-2 border-neon-purple/20">
                                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 pr-4">3. Encryption Shielding</h3>
                                        <p>
                                            All data packets are routed through high-level encrypted tunnels. We do not expose your primary authentication vectors to third-party data harvesters or rogue syndicates.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Shield className="w-32 h-32 text-white" />
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </motion.div>

                {/* Closing Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 pt-12 border-t border-white/5 text-center flex flex-col items-center"
                >
                    <div className="flex items-center gap-8 mb-8">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.6em]">Protocol_EOF</span>
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                    <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest max-w-lg leading-loose">
                        Synchronized with GLOBAL_LEGAL_GRID_INTERFACE_V4 <br />
                        All rights encrypted &copy; 2026 Tournament Command
                    </p>
                </motion.div>
            </div>

            {/* Cinematic Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[60] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </div>
    );
};

export default LegalPage;
