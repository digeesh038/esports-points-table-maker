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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`bg-dark-800/20 backdrop-blur-xl border-l-4 ${item.borderColor.replace('border-', 'border-l-')} border-t border-b border-r border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 shadow-2xl`}
                >
                    {/* Futuristic Background Pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />

                    {/* Animated Glow Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.borderColor.replace('border-', 'bg-')} shadow-[0_0_8px_currentColor]`}></span>
                                <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.25em]">
                                    {item.label}
                                </p>
                            </div>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-md">
                                {item.value?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <div className={`w-14 h-14 bg-dark-900/80 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-blue/30 transition-all duration-500 shadow-inner ${item.shadowColor}`}>
                            {item.icon}
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-4 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className={`h-1 w-8 rounded-full ${item.borderColor.replace('border-', 'bg-')}`}></div>
                        <div className="h-1 w-2 rounded-full bg-white/10"></div>
                        <div className="h-1 w-1 rounded-full bg-white/10"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
