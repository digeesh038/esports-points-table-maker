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
        draft: { label: 'DRAFT', color: 'text-gray-500 border-gray-800' },
        registration_open: { label: 'REGISTRATION OPEN', color: 'text-neon-green border-neon-green/30 shadow-[0_0_10px_rgba(40,255,0,0.1)]' },
        ongoing: { label: 'ONGOING', color: 'text-neon-blue border-neon-blue/30 shadow-[0_0_10px_rgba(0,183,255,0.1)]' },
        completed: { label: 'COMPLETED', color: 'text-neon-purple border-neon-purple/30' },
        cancelled: { label: 'CANCELLED', color: 'text-red-500 border-red-500/30' },
    };

    const status = statusConfig[tournament.status] || statusConfig.draft;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative bg-[#0d0d12]/40 border border-white/5 rounded-[40px] p-8 overflow-hidden backdrop-blur-xl hover:border-white/10 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
        >
            {/* Corner Decorative Trims */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/5 rounded-tl-[40px] pointer-events-none group-hover:border-neon-blue/30 transition-colors" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/5 rounded-br-[40px] pointer-events-none group-hover:border-neon-purple/30 transition-colors" />

            {/* Scanline Effect on Hover */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-full group-hover:animate-scan-fast pointer-events-none" />

            {/* Background Index Watermark */}
            <div className="absolute -bottom-6 -right-6 text-[140px] font-black italic text-white/[0.02] select-none pointer-events-none group-hover:text-white/[0.04] transition-all duration-1000 uppercase leading-none">
                {tournament.game?.charAt(0) || 'T'}
            </div>

            <div className="relative z-10 h-full flex flex-col">
                {/* Header: Game & Status */}
                <div className="flex items-center justify-between mb-10">
                    <div className={`px-4 py-2 rounded-xl border text-[9px] font-black tracking-[0.2em] uppercase backdrop-blur-md ${gameColors[tournament.game] || gameColors.free_fire}`}>
                        {tournament.game?.replace('_', ' ') || 'GAME'}
                    </div>
                    <div className={`flex items-center gap-2`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${statusConfig[tournament.status]?.color?.split(' ')[0] || 'text-gray-500'}`} />
                        <span className={`text-[9px] font-black tracking-widest uppercase ${status.color.split(' ')[0]}`}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Tournament Title */}
                <div className="mb-6">
                    <h3 className="text-3xl font-black italic tracking-tighter text-white leading-none mb-3 group-hover:text-neon-blue transition-colors duration-500 line-clamp-2">
                        {tournament.name}
                    </h3>
                    <div className="h-0.5 w-12 bg-neon-blue/40 group-hover:w-full transition-all duration-700" />
                </div>

                <p className="text-gray-500 text-[13px] font-medium leading-relaxed mb-10 line-clamp-2 h-10 opacity-80 group-hover:opacity-100 transition-opacity">
                    {tournament.description || 'No description available for this tournament.'}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-[#050508]/60 border border-white/5 p-5 rounded-[24px] flex flex-col gap-1 hover:border-white/10 transition-colors group/item">
                        <span className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.3em] flex items-center gap-2 group-hover/item:text-neon-blue transition-colors">
                            <Calendar className="w-2.5 h-2.5" />
                            Date
                        </span>
                        <span className="text-[11px] font-black text-white/80 tracking-tight">
                            {tournament.startDate ? format(new Date(tournament.startDate), 'MMM dd | yyyy') : 'TBD'}
                        </span>
                    </div>

                    <div className="bg-[#050508]/60 border border-white/5 p-5 rounded-[24px] flex flex-col gap-1 hover:border-white/10 transition-colors group/item">
                        <span className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.3em] flex items-center gap-2 group-hover/item:text-neon-purple transition-colors">
                            <Users className="w-2.5 h-2.5" />
                            Capacity
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-white">{tournament.teams?.length || 0}</span>
                            <span className="text-[10px] font-bold text-gray-700">/ {tournament.maxTeams || '∞'}</span>
                        </div>
                    </div>
                </div>

                {/* CTA Action */}
                <div className="mt-auto">
                    <Link
                        to={isDashboard ? `/dashboard/tournaments/${tournament.id}` : `/tournaments/public/${tournament.id}`}
                        className="w-full h-16 bg-[#12121a] hover:bg-neon-blue border border-white/5 hover:border-neon-blue/20 rounded-[22px] flex items-center justify-center gap-4 group/btn transition-all duration-700 relative overflow-hidden group"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />

                        <Target className="w-4 h-4 text-gray-600 group-hover/btn:text-black transition-colors" />
                        <span className="text-[11px] font-black text-white group-hover/btn:text-black tracking-[0.4em] uppercase">
                            {isDashboard ? 'Manage' : 'View Hub'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-800 group-hover/btn:text-black group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                </div>
            </div>

            {/* Ambient Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-blue/5 blur-[100px] group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};

export default TournamentCard;