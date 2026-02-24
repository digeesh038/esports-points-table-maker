import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Trophy, LayoutGrid, Target, FileText, Zap, ChevronRight, BarChart3, Users, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tournamentsAPI from '../../api/tournaments';
import leaderboardAPI from '../../api/leaderboard';
import LeaderboardTable from './LeaderboardTable';
import { useAuth } from '../../contexts/AuthContext';
import { useStandings } from '../../contexts/StandingsContext';
import toast from 'react-hot-toast';

const StandingsOverlay = () => {
    const { isOpen, id, closeStandings } = useStandings();
    const { isGuest } = useAuth();
    const location = useLocation();
    const [tournament, setTournament] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [selectedStageId, setSelectedStageId] = useState('overall');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTournamentId, setSelectedTournamentId] = useState(null);

    // Auto-close on page navigation
    useEffect(() => {
        if (isOpen) closeStandings();
    }, [location.pathname]);

    useEffect(() => {
        if (isOpen) {
            fetchAllTournaments();
            if (id) setSelectedTournamentId(id);
            else fetchFirstTournament();
        }
    }, [isOpen, id]);

    useEffect(() => {
        if (isOpen && selectedTournamentId) {
            fetchTournamentDetails(selectedTournamentId);
            fetchStandings();
        }
    }, [isOpen, selectedTournamentId, selectedStageId]);

    const fetchFirstTournament = async () => {
        try {
            const response = await tournamentsAPI.getAll({ mine: !isGuest });
            const list = response?.data?.tournaments || response?.tournaments || [];
            if (list.length > 0) setSelectedTournamentId(list[0].id);
        } catch (err) { }
    };

    const fetchAllTournaments = async () => {
        try {
            const response = await tournamentsAPI.getAll({ mine: !isGuest });
            setTournaments(response?.data?.tournaments || response?.tournaments || []);
        } catch (err) { }
    };

    const fetchTournamentDetails = async (tId) => {
        try {
            const response = await tournamentsAPI.getById(tId);
            setTournament(response?.data?.tournament || response?.tournament);
        } catch (err) { }
    };

    const fetchStandings = async () => {
        if (!selectedTournamentId) return;
        setLoading(true);
        try {
            let response;
            if (selectedStageId === 'overall') {
                response = await leaderboardAPI.getTournamentLeaderboard(selectedTournamentId);
            } else {
                response = await leaderboardAPI.getByStage(selectedStageId);
            }

            let rawData = response?.data?.leaderboard || response?.leaderboard || [];
            if (rawData && !Array.isArray(rawData) && rawData.leaderboard) {
                rawData = rawData.leaderboard;
            }

            if (Array.isArray(rawData)) setLeaderboard(rawData);
            else setLeaderboard([]);
        } catch (err) {
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePoints = async () => {
        if (isGuest) return;
        if (selectedStageId === 'overall') {
            toast.error('Recalculation unavailable for overall view. please select a specific stage.');
            return;
        }
        try {
            const tid = toast.loading('Updating standings...');
            await leaderboardAPI.recalculate(selectedStageId);
            await fetchStandings();
            toast.success('Scores updated.', { id: tid });
        } catch (err) {
            toast.error('Sync failed.');
        }
    };

    const handleExportPDF = async () => {
        if (isGuest) { toast.error('Access restricted.'); return; }
        try {
            const toastId = toast.loading('Generating report...');
            const blob = selectedStageId === 'overall'
                ? await tournamentsAPI.exportTeams(selectedTournamentId)
                : await leaderboardAPI.exportExcel(selectedStageId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Standings-${selectedStageId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Exported successfully.', { id: toastId });
        } catch (err) {
            toast.error('Export failed.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-[#050508] flex flex-col pt-4 md:pt-20 overflow-hidden"
                >
                    {/* Background Visuals */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.05),transparent_70%)]"></div>
                        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-neon-blue/5 blur-[120px] rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-neon-purple/5 blur-[120px] rounded-full delay-700 animate-pulse"></div>
                    </div>

                    {/* ── TOP HUB: CLOSE BUTTON ── */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-4 md:top-2 right-4 md:left-1/2 md:-translate-x-1/2 z-[110]"
                    >
                        <button
                            onClick={closeStandings}
                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110 group shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                            <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                        </button>
                    </motion.div>

                    <div className="flex-1 flex flex-col lg:flex-row gap-8 px-4 md:px-10 pb-10 mt-6 md:mt-10 relative z-10 min-h-0 overflow-y-auto lg:overflow-hidden">

                        {/* ── LEFT SIDEBAR ── */}
                        <motion.aside
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                            className="w-full lg:w-80 flex flex-col shrink-0 gap-8 h-auto lg:h-full min-h-0"
                        >
                            <div className="pt-4 shrink-0">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-neon-blue text-[10px] font-black tracking-[0.4em] uppercase"
                                >
                                    LIVE FEED
                                </motion.span>
                                <motion.h1
                                    key={tournament?.id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-4xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none mt-2"
                                >
                                    {tournament?.name?.split(' ')[0] || 'FFMC'}
                                </motion.h1>
                            </div>

                            <div className="flex-1 overflow-y-auto lg:overflow-y-auto pr-2 custom-scrollbar space-y-6 md:space-y-10 scroll-smooth">
                                {/* Phase Navigation */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1 opacity-40">
                                        <LayoutGrid className="w-4 h-4 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Menu</span>
                                    </div>
                                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedStageId('overall')}
                                            className={`flex-shrink-0 md:w-full text-left p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between group ${selectedStageId === 'overall'
                                                ? 'bg-neon-blue/10 border-neon-blue/40 text-white shadow-[0_0_25px_rgba(0,183,255,0.1)]'
                                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <Trophy className={`w-3 h-3 md:w-4 md:h-4 ${selectedStageId === 'overall' ? 'text-neon-blue' : 'text-gray-700 group-hover:text-neon-blue'}`} />
                                                <span className="font-bold uppercase tracking-tight text-[10px] md:text-sm">Overall</span>
                                            </div>
                                            <ChevronRight className={`hidden md:block w-4 h-4 transition-transform ${selectedStageId === 'overall' ? 'translate-x-1 text-neon-blue' : 'opacity-0'}`} />
                                        </button>
                                        {tournament?.stages?.map((stage, idx) => (
                                            <button
                                                key={stage.id}
                                                onClick={() => setSelectedStageId(stage.id)}
                                                className={`flex-shrink-0 md:w-full text-left p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between group ${selectedStageId === stage.id
                                                    ? 'bg-neon-blue/10 border-neon-blue/40 text-white shadow-[0_0_25px_rgba(0,183,255,0.1)]'
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className={`text-[10px] font-mono font-black ${selectedStageId === stage.id ? 'text-neon-blue' : 'text-gray-700'}`}>0{idx + 1}</span>
                                                    <span className="font-bold text-[10px] md:text-sm tracking-tight uppercase truncate max-w-[80px] md:max-w-none">{stage.name}</span>
                                                </div>
                                                {selectedStageId === stage.id && <div className="hidden md:block w-1.5 h-1.5 bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,183,255,0.8)]"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tournament Select */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1 opacity-40">
                                        <Target className="w-4 h-4 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Tournament Choice</span>
                                    </div>
                                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 custom-scrollbar">
                                        {tournaments.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setSelectedTournamentId(t.id);
                                                    setSelectedStageId('overall');
                                                }}
                                                className={`flex-shrink-0 md:w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-lg md:rounded-xl border transition-all text-[10px] md:text-[11px] font-black uppercase tracking-tight truncate max-w-[120px] md:max-w-none ${selectedTournamentId === t.id
                                                    ? 'bg-dark-800 border-neon-blue/30 text-neon-blue shadow-lg'
                                                    : 'bg-white/3 border-white/3 text-gray-600 hover:text-gray-400 hover:border-white/10'
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tournament Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1 opacity-40">
                                        <BarChart3 className="w-4 h-4 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Stats</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pb-4">
                                        <div className="bg-white/3 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Game</p>
                                            <p className="text-[10px] font-black text-white uppercase">{tournament?.game?.replace(/_/g, ' ') || '-'}</p>
                                        </div>
                                        <div className="bg-white/3 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Stages</p>
                                            <p className="text-[10px] font-black text-neon-blue uppercase">{tournament?.stages?.length || '0'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>

                        {/* ── MAIN LEADERBOARD SECTION ── */}
                        <motion.main
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25, type: 'spring', damping: 25 }}
                            className="flex-1 flex flex-col h-auto lg:h-full min-h-0"
                        >

                            {/* Header Controls */}
                            <header className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 shrink-0">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <motion.div
                                        animate={{ height: [30, 50, 30] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        className="w-1.5 bg-neon-blue shadow-[0_0_20px_rgba(0,183,255,0.6)]"
                                    ></motion.div>
                                    <div>
                                        <h2 className="text-3xl md:text-7xl font-black italic tracking-tighter text-white leading-none uppercase pr-4">
                                            STANDINGS <span className="text-neon-blue animate-pulse">.</span>
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2 opacity-30">
                                            <span className="text-[9px] font-mono tracking-[0.2em] md:tracking-[0.5em] uppercase text-white">OFFICIAL STANDINGS</span>
                                            <div className="hidden md:block h-[1px] w-48 bg-gradient-to-r from-white to-transparent"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start sm:items-end gap-3 md:gap-5 p-2 w-full sm:w-auto">
                                    <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                                        {!isGuest && (
                                            <button
                                                onClick={handleUpdatePoints}
                                                disabled={selectedStageId === 'overall'}
                                                className={`px-4 md:px-8 h-10 md:h-12 font-black text-[10px] tracking-widest transition-all flex items-center gap-3 uppercase rounded-xl shadow-[0_0_30px_rgba(0,183,255,0.3)] group active:scale-95 whitespace-nowrap ${selectedStageId === 'overall'
                                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                                    : 'bg-neon-blue text-black hover:bg-white animate-in slide-in-from-right duration-500'
                                                    }`}
                                            >
                                                <Zap className={`w-4 h-4 ${selectedStageId !== 'overall' ? 'group-hover:animate-bounce' : ''}`} />
                                                <span className="sm:inline">Update Scores</span>
                                            </button>
                                        )}
                                        <button onClick={fetchStandings} className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10 active:scale-90 shrink-0">
                                            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="px-4 md:px-8 h-10 md:h-12 bg-dark-800 border border-white/10 rounded-xl text-white font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 uppercase shadow-xl active:scale-95 whitespace-nowrap shrink-0"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span className="hidden sm:inline">Export</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full">
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic pr-4">Connection Status</span>
                                        <div className="flex gap-1.5 items-center">
                                            <div className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_12px_rgba(40,255,0,0.8)] animate-pulse"></div>
                                            <span className="text-[9px] text-neon-green font-black uppercase tracking-wider">Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Table Container */}
                            <div className="flex-1 bg-white/[0.015] border border-white/5 rounded-3xl md:rounded-[50px] p-4 md:p-12 flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-[0.03] select-none scale-[1.5] md:scale-[2.5] transform -rotate-12">
                                    <h3 className="text-[80px] md:text-[150px] font-black italic tracking-tighter text-white uppercase truncate max-w-[1200px]">
                                        {tournament?.name || 'SYNC'}
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar relative z-10 transition-all duration-500 scroll-smooth min-h-0">
                                    <LeaderboardTable leaderboard={leaderboard} loading={loading} />
                                </div>

                                {/* Bottom Analytics */}
                                <footer className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between opacity-20 shrink-0">
                                    <div className="flex items-center gap-12">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic pr-4">{leaderboard.length} Teams Registered</span>
                                        </div>
                                        <span className="text-[10px] font-mono tracking-[0.2em] text-white">UID: {location.pathname.split('/').pop() || 'GLOBAL'}</span>
                                    </div>
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="flex items-center gap-3 text-neon-blue"
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic font-mono pr-4">SYSTEM RUNNING STABLE</span>
                                    </motion.div>
                                </footer>
                            </div>
                        </motion.main>
                    </div>

                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(0, 183, 255, 0.2);
                            border-radius: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.05);
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgba(0, 183, 255, 0.4);
                        }
                    `}</style>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default StandingsOverlay;
