import { Building2, Trophy, Users, Zap } from 'lucide-react';

const DashboardStats = ({ stats }) => {
    const items = [
        {
            label: 'Organizations',
            value: stats.organizations,
            icon: <Building2 className="w-6 h-6 text-neon-blue" />,
            color: 'from-neon-blue/20 to-transparent',
            borderColor: 'border-neon-blue/30',
            shadowColor: 'shadow-neon-blue/10'
        },
        {
            label: 'Tournaments',
            value: stats.tournaments,
            icon: <Trophy className="w-6 h-6 text-neon-purple" />,
            color: 'from-neon-purple/20 to-transparent',
            borderColor: 'border-neon-purple/30',
            shadowColor: 'shadow-neon-purple/10'
        },
        {
            label: 'Active Teams',
            value: stats.activeTeams,
            icon: <Users className="w-6 h-6 text-neon-green" />,
            color: 'from-neon-green/20 to-transparent',
            borderColor: 'border-neon-green/30',
            shadowColor: 'shadow-neon-green/10'
        },
        {
            label: 'Total Matches',
            value: stats.totalMatches,
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            color: 'from-yellow-500/20 to-transparent',
            borderColor: 'border-yellow-500/30',
            shadowColor: 'shadow-yellow-500/10'
        },
    ];

    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`bg-[#0d0d12]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[24px] relative overflow-hidden group hover:border-white/10 transition-all duration-700 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]`}
                >
                    {/* Corner Accent */}
                    <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${item.borderColor.replace('border-', 'border-')} opacity-40 rounded-tl-2xl group-hover:opacity-100 transition-opacity`} />

                    {/* Animated Scanning Bar */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5 overflow-hidden">
                        <div className={`h-full w-1/3 ${item.borderColor.replace('border-', 'bg-')} shadow-[0_0_10px_currentColor] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-dark-900/50 flex items-center justify-center border border-white/5 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-gray-500 font-bold text-[9px] uppercase tracking-[0.3em] leading-none mb-1">
                                        Status // Active
                                    </p>
                                    <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest leading-none">
                                        {item.label}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                {item.value?.toLocaleString() || '0'}
                            </h3>
                            <div className={`w-2 h-2 rounded-full ${item.borderColor.replace('border-', 'bg-')} animate-pulse shadow-[0_0_10px_currentColor]`} />
                        </div>
                    </div>

                    {/* Background Light Spike */}
                    <div className={`absolute -bottom-12 -right-12 w-32 h-32 ${item.borderColor.replace('border-', 'bg-')} opacity-[0.03] group-hover:opacity-[0.08] blur-[40px] rounded-full transition-all duration-700`} />
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
