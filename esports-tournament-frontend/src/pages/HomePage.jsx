import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Trophy, ArrowRight, Target, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
    const { guestLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleGuestLogin = () => {
        guestLogin();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-16 py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[120px] -z-10"></div>

            {/* Header */}
            <div className="space-y-6 max-w-4xl px-4 animate-fade-in relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neon-blue text-xs font-bold uppercase tracking-widest mb-4">
                    <Target className="w-4 h-4" /> Tournament Manager
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white leading-tight pr-4">
                    SIMPLIFY YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple text-shadow-neon pr-4">ESPORTS</span>
                </h1>
                <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                    Manage your organizations, tournaments, and matches in one place. No clutter, just control.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="bg-neon-blue text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-neon-blue flex items-center justify-center gap-3"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/signup"
                                className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3"
                            >
                                Login / Signup <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleGuestLogin}
                                className="bg-dark-800 text-white border border-white/10 px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-dark-700 transition-all flex items-center justify-center gap-3"
                            >
                                Guest Access
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4 animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
                {/* Step 1 */}
                <div className="bg-dark-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-neon-blue/30 transition-all backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-8xl text-white leading-none">01</div>
                    <div className="w-16 h-16 bg-neon-blue/10 rounded-2xl flex items-center justify-center mb-6 text-neon-blue group-hover:scale-110 transition-transform">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase mb-3 pr-4">Create Organization</h3>
                    <p className="text-gray-400 leading-relaxed">First, set up your organization profile. This is the central hub for all your competitive events.</p>
                </div>

                {/* Step 2 */}
                <div className="bg-dark-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-neon-purple/30 transition-all backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-8xl text-white leading-none">02</div>
                    <div className="w-16 h-16 bg-neon-purple/10 rounded-2xl flex items-center justify-center mb-6 text-neon-purple group-hover:scale-110 transition-transform">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase mb-3 pr-4">New Tournament</h3>
                    <p className="text-gray-400 leading-relaxed">Create a tournament under your org. Configure scoring rules, stages, and registration requirements.</p>
                </div>

                {/* Step 3 */}
                <div className="bg-dark-800/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-neon-pink/30 transition-all backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-8xl text-white leading-none">03</div>
                    <div className="w-16 h-16 bg-neon-pink/10 rounded-2xl flex items-center justify-center mb-6 text-neon-pink group-hover:scale-110 transition-transform">
                        <Target className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase mb-3 pr-4">Manage Matches</h3>
                    <p className="text-gray-400 leading-relaxed">Register teams and track match results. Points and leaderboards are updated automatically in real-time.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;