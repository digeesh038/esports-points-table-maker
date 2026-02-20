import { Trophy, Shield, Cpu, Zap, Target, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Loader = ({ text = 'Loading System...', fullScreen = true }) => {
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState('Connecting...');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 150);

        const msgs = [
            'Connecting to Server...',
            'Loading Tournament Data...',
            'Syncing Match Data...',
            'Verifying Players...',
            'Preparing Standings...',
            'Ready to Start.'
        ];

        let msgIdx = 0;
        const msgInterval = setInterval(() => {
            msgIdx = (msgIdx + 1) % msgs.length;
            setStatusMsg(msgs[msgIdx]);
        }, 800);

        return () => {
            clearInterval(interval);
            clearInterval(msgInterval);
        };
    }, []);

    const containerClasses = fullScreen
        ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-900"
        : "relative w-full h-[60vh] bg-dark-900/50 rounded-3xl flex flex-col items-center justify-center overflow-hidden border border-dark-600";

    const loaderContent = (
        <div className={containerClasses}>
            {/* Background Effects */}
            <div className="absolute inset-0 cyber-grid opacity-10 animate-rotate-slow scale-150"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 via-transparent to-neon-purple/5"></div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
                <div className="w-full h-[10vh] bg-neon-blue/10 blur-3xl animate-scanline"></div>
            </div>

            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-20 animate-float-particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`
                    }}
                />
            ))}

            {/* Center Piece */}
            <div className="relative group">
                {/* Rotating Reticles */}
                <div className="absolute -inset-16 border border-neon-blue/20 rounded-full animate-spin-reticle"></div>
                <div className="absolute -inset-24 border border-dashed border-neon-purple/20 rounded-full animate-spin-reticle" style={{ animationDirection: 'reverse' }}></div>

                {/* Glowing Core */}
                <div className="relative bg-dark-900/80 backdrop-blur-xl border-2 border-neon-blue p-12 rounded-3xl shadow-[0_0_80px_rgba(0,183,255,0.3)] group-hover:shadow-[0_0_100px_rgba(0,183,255,0.5)] transition-all duration-500">
                    <div className="absolute -top-3 -right-3">
                        <div className="p-2 bg-dark-800 border border-neon-blue rounded-lg shadow-lg">
                            <Zap className="w-4 h-4 text-neon-blue animate-pulse" />
                        </div>
                    </div>

                    <Trophy className="w-20 h-20 text-white animate-bounce-slow drop-shadow-[0_0_15px_rgba(0,183,255,0.8)]" />

                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-blue rounded-tl-xl translate-x-[-2px] translate-y-[-2px]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-blue rounded-tr-xl translate-x-[2px] translate-y-[-2px]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-blue rounded-bl-xl translate-x-[-2px] translate-y-[2px]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-blue rounded-br-xl translate-x-[2px] translate-y-[2px]"></div>
                </div>
            </div>

            {/* Loading Stats Container */}
            <div className="mt-24 w-full max-w-sm px-6 flex flex-col items-center text-center space-y-6 z-20">
                <div className="w-full space-y-2">
                    <div className="flex justify-between items-end w-full">
                        <div className="text-left">
                            <p className="text-[10px] font-mono text-neon-blue uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-neon-blue animate-ping rounded-full"></span>
                                Status
                            </p>
                            <p className="text-white font-black text-xs uppercase tracking-tight animate-pulse">{statusMsg}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-neon-blue italic leading-none">{progress}%</p>
                        </div>
                    </div>

                    {/* Cyber Loading Bar */}
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-neon-blue via-cyan-400 to-neon-purple shadow-[0_0_15px_rgba(0,183,255,0.6)] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Sub-icons System */}
                <div className="flex justify-between w-full px-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <Cpu className="w-5 h-5 text-neon-blue animate-pulse" />
                    <Database className="w-5 h-5 text-neon-purple animate-pulse delay-75" />
                    <Shield className="w-5 h-5 text-neon-pink animate-pulse delay-150" />
                    <Target className="w-5 h-5 text-white animate-pulse delay-300" />
                </div>
            </div>

            {/* Decorative Footers */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-[8px] font-mono text-gray-600 uppercase tracking-[0.4em]">
                <div className="flex items-center gap-4">
                    <span>v2.0</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span>Stable</span>
                </div>
                <span>Powered by Esports Manager</span>
            </div>
        </div>
    );
    if (fullScreen) {
        if (!mounted) return null;
        return createPortal(loaderContent, document.body);
    }

    return loaderContent;
};

export default Loader;
