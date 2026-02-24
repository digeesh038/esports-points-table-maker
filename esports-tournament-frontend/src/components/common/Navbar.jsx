import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, LogOut, User, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStandings } from '../../contexts/StandingsContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { openStandings } = useStandings();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Organizations', path: '/dashboard/organizations' },
        { name: 'Tournaments', path: '/dashboard/tournaments' },
        { name: 'Teams', path: '/dashboard/teams' },
        { name: 'Matches', path: '/dashboard/matches' },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <nav className="bg-dark-900/90 backdrop-blur-xl border-b border-dark-600 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-neon-blue/20 blur-lg rounded-full group-hover:bg-neon-blue/40 transition-all"></div>
                                <Trophy className="relative w-8 h-8 text-neon-blue group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent hidden sm:block pr-4">
                                ESPORTS_MANAGER
                            </span>
                            <span className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent sm:hidden pr-2">
                                EM
                            </span>
                        </Link>

                        {isAuthenticated && (
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group
                                            ${isActive(link.path)
                                                ? 'text-white bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="relative z-10">{link.name}</span>
                                        {isActive(link.path) && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple"></div>
                                        )}
                                    </Link>
                                ))}
                                <button
                                    onClick={() => {
                                        const match = location.pathname.match(/\/tournaments\/([a-f0-9-]+)/);
                                        const tId = match ? match[1] : null;
                                        openStandings(tId);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-neon-blue hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2 group"
                                >
                                    <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Points Table</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Profile & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard/profile" className="hidden sm:flex items-center gap-3 px-1 py-1 pr-4 bg-dark-800 rounded-full border border-dark-600 hover:border-neon-blue/30 transition-colors cursor-pointer group">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border border-neon-blue"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600">
                                            <User className="w-4 h-4 text-neon-blue" />
                                        </div>
                                    )}
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xs font-bold text-white uppercase group-hover:text-neon-blue transition-colors">{user?.name}</span>
                                        <span className="text-[10px] text-neon-blue font-mono">ONLINE</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={logout}
                                    className="hidden sm:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="px-6 py-2 bg-neon-blue text-black font-black uppercase text-sm tracking-wider hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all rounded"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isAuthenticated && isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-dark-900/95 backdrop-blur-xl border-b border-white/5 animate-fade-in z-40">
                    <div className="px-4 py-4 space-y-2">
                        {/* Mobile User Profile */}
                        <Link
                            to="/dashboard/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl mb-4 border border-white/5 transition-colors group"
                        >
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full border border-neon-blue group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600 group-hover:border-neon-blue/50 transition-colors">
                                    <User className="w-5 h-5 text-neon-blue" />
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-bold text-white group-hover:text-neon-blue transition-colors">{user?.name}</div>
                                <div className="text-xs text-neon-blue font-mono">VIEW PROFILE • ONLINE</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                        </Link>

                        {/* Mobile Nav Links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                                    ${isActive(link.path)
                                        ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <button
                            onClick={() => {
                                const match = location.pathname.match(/\/tournaments\/([a-f0-9-]+)/);
                                const tId = match ? match[1] : null;
                                openStandings(tId);
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-neon-blue hover:bg-neon-blue/10 transition-all flex items-center gap-2 group"
                        >
                            <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Points Table</span>
                        </button>

                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
