import { Calendar, Users, Trophy, Eye, Target, Zap, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const TournamentCard = ({ tournament }) => {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');

    const gameColors = {
        free_fire: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
        bgmi: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
        valorant: 'border-red-500/30 bg-red-500/5 text-red-500',
        cod_mobile: 'border-green-500/30 bg-green-500/5 text-green-400',
        csgo: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    };

    const statusConfig = {
        draft: { label: 'INTERNAL DRAFT', color: 'text-gray-500 border-gray-800' },
        registration_open: { label: 'ENROLLMENT LIVE', color: 'text-neon-green border-neon-green/30 shadow-[0_0_10px_rgba(40,255,0,0.1)]' },
        ongoing: { label: 'BROADCAST ACTIVE', color: 'text-neon-blue border-neon-blue/30 shadow-[0_0_10px_rgba(0,183,255,0.1)]' },
        completed: { label: 'MISSION CONCLUDED', color: 'text-neon-purple border-neon-purple/30' },
        cancelled: { label: 'NODE TERMINATED', color: 'text-red-500 border-red-500/30' },
    };

    const status = statusConfig[tournament.status] || statusConfig.draft;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative bg-dark-800/10 border border-white/5 rounded-[40px] p-8 overflow-hidden backdrop-blur-sm hover:border-white/10 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
            {/* Background Branding Watermark */}
            <div className="absolute -bottom-6 -right-6 text-[120px] font-black italic text-white/[0.02] select-none pointer-events-none group-hover:text-white/[0.04] transition-all duration-700">
                {tournament.game?.charAt(0).toUpperCase() || 'T'}
            </div>

            {/* Corner Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative z-10 h-full flex flex-col">
                {/* Header: Game & Status */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black tracking-[0.2em] uppercase ${gameColors[tournament.game] || gameColors.free_fire}`}>
                        {tournament.game?.replace('_', ' ') || 'SYSTEM_NODE'}
                    </div>
                    <div className={`px-3 py-1 border-l-2 text-[8px] font-black tracking-widest uppercase ${status.color}`}>
                        {status.label}
                    </div>
                </div>

                {/* Tournament Title */}
                <h3 className="text-3xl font-black italic tracking-tighter text-white leading-tight mb-4 group-hover:text-neon-blue transition-colors duration-300 line-clamp-2">
                    {tournament.name}
                </h3>

                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-10 line-clamp-2 h-9">
                    {tournament.description || 'System encryption error: No descriptive records found for this tournament identifier.'}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl flex flex-col gap-1 hover:border-white/10 transition-colors">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Calendar className="w-2.5 h-2.5 text-neon-blue" />
                            DEPLOYED
                        </span>
                        <span className="text-[11px] font-black text-gray-300 tracking-tight">
                            {tournament.startDate ? format(new Date(tournament.startDate), 'MMM dd | yyyy') : 'TBD_NODE'}
                        </span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl flex flex-col gap-1 hover:border-white/10 transition-colors">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Users className="w-2.5 h-2.5 text-neon-purple" />
                            CAPACITY
                        </span>
                        <div className="flex items-end gap-1.5">
                            <span className="text-sm font-black text-white">{tournament.teams?.length || 0}</span>
                            <span className="text-[10px] font-black text-gray-700 mb-0.5">/ {tournament.maxTeams || '∞'}</span>
                        </div>
                    </div>

                    <div className="col-span-2 bg-dark-900 border border-white/5 p-5 rounded-3xl flex items-center justify-between hover:border-white/10 transition-colors">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Trophy className="w-2.5 h-2.5 text-yellow-500" />
                                PROTOCOL
                            </span>
                            <span className="text-[11px] font-black text-gray-400 italic uppercase">
                                {tournament.format?.replace('_', ' ') || 'Hybrid Tournament'}
                            </span>
                        </div>
                        <Zap className="w-5 h-5 text-yellow-500/20 group-hover:text-yellow-500 transition-colors" />
                    </div>
                </div>

                {/* CTA Action */}
                <div className="mt-auto">
                    <Link
                        to={isDashboard ? `/dashboard/tournaments/${tournament.id}` : `/tournaments/public/${tournament.id}`}
                        className="w-full h-16 bg-white/[0.03] hover:bg-neon-blue border border-white/5 hover:border-neon-blue/20 rounded-2xl flex items-center justify-center gap-4 group/btn transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left"></div>
                        <Target className="w-4 h-4 text-gray-600 group-hover/btn:text-black group-hover/btn:rotate-12 transition-all" />
                        <span className="text-[10px] font-black text-white group-hover/btn:text-black tracking-[0.3em] uppercase">
                            {isDashboard ? 'ACCESS CONSOLE' : 'ENGAGE NODE'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-800 group-hover/btn:text-black translate-x-0 group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default TournamentCard;