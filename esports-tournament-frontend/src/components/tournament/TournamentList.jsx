import TournamentCard from './TournamentCard';
import Loader from '../common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

const TournamentList = ({ tournaments, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-neon-blue/20 rounded-full animate-ping absolute inset-0"></div>
                    <div className="w-20 h-20 border-t-2 border-neon-blue rounded-full animate-spin"></div>
                </div>
                <p className="text-neon-blue font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Loading Tournaments...</p>
            </div>
        );
    }

    if (!tournaments || tournaments.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-dashed border-white/5 rounded-[40px]"
            >
                <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Trophy className="w-10 h-10 text-gray-800 group-hover:text-neon-purple transition-colors relative z-10" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-white mb-3 pr-4">NO TOURNAMENTS FOUND</h3>
                <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.4em]">No records match your search criteria.</p>
                <div className="mt-8 flex gap-2">
                    <div className="w-1.5 h-1.5 bg-neon-purple/40 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-neon-purple/20 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-neon-purple/10 rounded-full"></div>
                </div>
            </motion.div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
            <AnimatePresence>
                {tournaments.map((tournament) => (
                    <motion.div
                        key={tournament.id}
                        variants={item}
                        layout
                    >
                        <TournamentCard tournament={tournament} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};
export default TournamentList;