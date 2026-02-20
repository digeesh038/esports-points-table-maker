import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Award, Clock } from 'lucide-react';
import Card from '../components/common/Card';

const ProfilePage = () => {
    const { user, logout, isGuest } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent italic uppercase">
                    Operative Profile
                </h1>
                <p className="text-gray-400 mt-2 text-lg font-medium">
                    {isGuest ? 'Temporary guest record and restricted access level.' : 'Personal dossier and system access level.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1 bg-dark-800/50 border-neon-blue/20">
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-neon-blue/20 blur-xl rounded-full animate-pulse"></div>
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="relative w-32 h-32 rounded-full border-4 border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.3)] object-cover"
                                />
                            ) : (
                                <div className="relative w-32 h-32 rounded-full bg-dark-700 flex items-center justify-center border-4 border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                    <User className="w-16 h-16 text-neon-blue" />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-dark-900 flex items-center justify-center">
                                <div className="w-full h-full rounded-full animate-ping bg-green-400 opacity-75 absolute"></div>
                                <div className="w-3 h-3 bg-white rounded-full relative z-10"></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-1">
                            {user?.name}
                        </h2>
                        <span className="text-neon-purple font-mono text-sm tracking-widest bg-neon-purple/10 px-3 py-1 rounded border border-neon-purple/20">
                            {isGuest ? 'READ_ONLY_VISITOR' : (user?.role === 'admin' ? 'SYSTEM_ADMIN' : 'TOURNAMENT_ORGANIZER')}
                        </span>

                        <button
                            onClick={logout}
                            className="mt-6 w-full py-3 bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center group"
                        >
                            <span className="mr-2">{isGuest ? 'EXIT_GUEST_MODE' : 'TERMINATE_SESSION'}</span>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse group-hover:bg-white"></div>
                        </button>
                    </div>
                </Card>

                {/* Details Card */}
                <Card className="lg:col-span-2 bg-dark-800/30 border-dashed border-dark-600">
                    <div className="p-6 space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <Shield className="w-5 h-5 text-neon-blue mr-3" />
                            Security Credentials
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-gray-400 mb-2">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-mono uppercase tracking-wider">Email Address</span>
                                </div>
                                <div className="text-white font-medium break-all">
                                    {isGuest ? 'guest@simulation.node' : user?.email}
                                </div>
                            </div>

                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-gray-400 mb-2">
                                    <Shield className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-mono uppercase tracking-wider">Clearance Level</span>
                                </div>
                                <div className="text-white font-medium">
                                    {isGuest ? 'LEVEL_1 (Guest / Spectator)' : 'LEVEL_5 (Authorized)'}
                                </div>
                            </div>

                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-gray-400 mb-2">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-mono uppercase tracking-wider">User ID</span>
                                </div>
                                <div className="text-white font-mono text-sm">
                                    {isGuest ? 'GUEST_PROTO_77' : user?.id?.slice(0, 18)}...
                                </div>
                            </div>

                            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-gray-400 mb-2">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-mono uppercase tracking-wider">Last Login</span>
                                </div>
                                <div className="text-white font-medium">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${isGuest ? 'bg-neon-blue/10 border border-neon-blue/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                                {isGuest ? <Shield className="w-8 h-8 text-neon-blue" /> : <Award className="w-8 h-8 text-yellow-500" />}
                                <div>
                                    <h4 className={`${isGuest ? 'text-neon-blue' : 'text-yellow-500'} font-bold text-sm uppercase`}>
                                        {isGuest ? 'GUEST_ACCESS_ENABLED' : 'Pro License Active'}
                                    </h4>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {isGuest ? 'You are currently viewing simulated data. Authenticate to manage actual tournament nodes.' : 'You have full access to all tournament management features.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div >
        </div >
    );
};

export default ProfilePage;
