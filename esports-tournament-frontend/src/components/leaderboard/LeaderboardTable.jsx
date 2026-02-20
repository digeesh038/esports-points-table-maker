import React from 'react';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeaderboardTable = ({ leaderboard, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl w-full"></div>
                ))}
            </div>
        );
    }

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-[40px] animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:border-neon-blue transition-all">
                    <Trophy className="w-8 h-8 text-gray-800" />
                </div>
                <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-[10px]">No telemetry detected in this sector</p>
                <div className="mt-4 flex gap-2">
                    <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                </div>
            </div>
        );
    }

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const rowVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        },
        exit: { x: 20, opacity: 0 }
    };

    return (
        <div className="w-full">
            <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 w-24 text-center italic"># Rank</th>
                        <th className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 italic">Squad Identifier</th>
                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 w-24 text-center italic">WWCD</th>
                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 w-24 text-center italic">Pos</th>
                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 w-24 text-center italic">Fin</th>
                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 w-28 text-center italic">Total</th>
                    </tr>
                </thead>
                <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode='popLayout'>
                        {leaderboard.map((entry, index) => {
                            const rank = entry.rank || index + 1;
                            const teamName = (entry.teamName || entry.team?.name || 'Unknown').toUpperCase();
                            const wins = entry.wins || 0;
                            const totalPoints = entry.totalPoints || 0;
                            const totalKills = entry.totalKills || 0;
                            const posPoints = entry.placementPoints !== undefined ? entry.placementPoints : (totalPoints - totalKills);

                            const isTop3 = rank <= 3;
                            const rankColors = rank === 1 ? 'bg-yellow-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.2)]' :
                                rank === 2 ? 'bg-slate-300 text-black ' :
                                    rank === 3 ? 'bg-[#CD7F32] text-black' :
                                        'bg-dark-800 text-gray-600 border border-white/5';

                            const teamAccent = rank === 1 ? 'bg-yellow-500' :
                                rank === 2 ? 'bg-slate-300' :
                                    rank === 3 ? 'bg-[#CD7F32]' :
                                        'bg-neon-blue';

                            return (
                                <motion.tr
                                    key={entry.teamId || index}
                                    variants={rowVariants}
                                    layout
                                    className="group"
                                >
                                    {/* RANK */}
                                    <td className="p-0">
                                        <div className={`h-16 w-16 mx-auto flex items-center justify-center font-black text-2xl italic rounded-2xl transition-all duration-300 group-hover:scale-110 ${rankColors}`}>
                                            {rank < 10 ? `0${rank}` : rank}
                                        </div>
                                    </td>

                                    {/* TEAM ENTITY */}
                                    <td className="p-0">
                                        <div className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl ml-3 flex items-center px-8 relative overflow-hidden group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all duration-300">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${teamAccent} shadow-[0_0_15px_rgba(0,183,255,0.3)] group-hover:w-3 transition-all`}></div>
                                            <span className="text-base font-black uppercase tracking-wider text-white group-hover:text-neon-blue group-hover:translate-x-2 transition-all">
                                                {teamName}
                                            </span>
                                            {isTop3 && (
                                                <div className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <Trophy className={`w-5 h-5 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-300' : 'text-[#CD7F32]'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* WINS */}
                                    <td className="p-0">
                                        <div className="h-16 flex items-center justify-center">
                                            <span className={`font-mono text-lg font-bold ${wins > 0 ? 'text-neon-blue' : 'text-gray-800'}`}>
                                                {wins > 0 ? (wins < 10 ? `0${wins}` : wins) : '--'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* PLACEMENT POINTS */}
                                    <td className="p-0">
                                        <div className="h-16 bg-white/[0.01] border border-white/2 rounded-2xl mx-1.5 flex items-center justify-center font-mono text-base font-bold text-gray-500 group-hover:text-white transition-colors">
                                            {posPoints < 10 && posPoints >= 0 ? `0${posPoints}` : posPoints}
                                        </div>
                                    </td>

                                    {/* KILLS */}
                                    <td className="p-0">
                                        <div className="h-16 bg-white/[0.01] border border-white/2 rounded-2xl mx-1.5 flex items-center justify-center font-mono text-base font-bold text-gray-500 group-hover:text-white transition-colors">
                                            {totalKills < 10 ? `0${totalKills}` : totalKills}
                                        </div>
                                    </td>

                                    {/* TOTAL SCORE */}
                                    <td className="p-0">
                                        <div className="h-16 bg-dark-800/60 border border-white/5 rounded-2xl ml-2 flex items-center justify-center relative overflow-hidden group-hover:border-neon-blue/40 group-hover:bg-dark-800 transition-all duration-300">
                                            <span className={`text-2xl font-black tracking-tighter ${isTop3 ? 'text-neon-blue animate-pulse' : 'text-white'}`}>
                                                {totalPoints < 10 ? `0${totalPoints}` : totalPoints}
                                            </span>
                                            {isTop3 && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </motion.tbody>
            </table>
        </div>
    );
};

export default LeaderboardTable;