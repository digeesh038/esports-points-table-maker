import { useEffect, useState } from 'react';
import leaderboardAPI from '../../api/leaderboard';
import tournamentsAPI from '../../api/tournaments';
import LeaderboardTable from '../leaderboard/LeaderboardTable';
import { Trophy, LayoutGrid, Target, X, FileText, Gamepad2, Layers, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const PointsTable = ({ tournamentId, onClose }) => {
    const { isGuest } = useAuth();
    const socket = useSocket();
    const subscribeToLeaderboard = socket?.subscribeToLeaderboard;
    const unsubscribeFromLeaderboard = socket?.unsubscribeFromLeaderboard;
    const [tournament, setTournament] = useState(null);
    const [stages, setStages] = useState([]);
    const [selectedStageId, setSelectedStageId] = useState('overall'); // Default to overall
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingTournament, setLoadingTournament] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [deletingTournament, setDeletingTournament] = useState(false);

    useEffect(() => {
        if (!tournamentId) return;
        fetchTournamentAndStages();
    }, [tournamentId]);

    useEffect(() => {
        if (!selectedStageId) return;

        if (selectedStageId === 'overall') {
            fetchOverallLeaderboard(tournamentId);
        } else {
            fetchLeaderboard(selectedStageId);
        }

        // Real-time listener
        const handleUpdate = (data) => {
            console.log('[PointsTable] Received real-time update:', data);

            // Check if this update belongs to our current view
            const isStageUpdate = data && data.stageId;
            const updatedLbArray = isStageUpdate
                ? (Array.isArray(data.leaderboard) ? data.leaderboard : (data.leaderboard?.leaderboard ?? []))
                : (Array.isArray(data) ? data : (data?.leaderboard ?? []));

            if (selectedStageId === 'overall' && !isStageUpdate) {
                // If we are in overall view and get a tournament-level update
                setLeaderboard(updatedLbArray);
            } else if (selectedStageId === data.stageId) {
                // If we are in a specific stage view and it matches the update
                setLeaderboard(updatedLbArray);
            }
        };

        if (subscribeToLeaderboard) {
            const type = selectedStageId === 'overall' ? 'tournament' : 'stage';
            const id = selectedStageId === 'overall' ? tournamentId : selectedStageId;

            subscribeToLeaderboard(id, type, handleUpdate);

            return () => {
                if (unsubscribeFromLeaderboard) {
                    unsubscribeFromLeaderboard(id, type, handleUpdate);
                }
            };
        }
    }, [selectedStageId, tournamentId, subscribeToLeaderboard, unsubscribeFromLeaderboard]);

    const fetchTournamentAndStages = async () => {
        try {
            setLoadingTournament(true);

            // Fetch tournament info and stages in parallel
            const [tournamentRes, stagesRes] = await Promise.all([
                tournamentsAPI.getById(tournamentId),
                tournamentsAPI.getStages(tournamentId),
            ]);

            const tournamentData =
                tournamentRes?.data?.tournament ??
                tournamentRes?.tournament ??
                null;

            const stagesData =
                stagesRes?.data?.stages ??
                stagesRes?.stages ??
                tournamentData?.stages ??
                [];

            console.log('[PointsTable] Loaded stages:', stagesData.length);

            setTournament(tournamentData);
            setStages(Array.isArray(stagesData) ? stagesData : []);

            // If overall is not the goal, auto-select active stage
            // But we default to 'overall' now as per user request to see "all"
        } catch (error) {
            console.error('[PointsTable] fetchTournamentAndStages error:', error);
        } finally {
            setLoadingTournament(false);
        }
    };

    const fetchOverallLeaderboard = async (tId) => {
        if (!tId) return;
        try {
            setLoadingLeaderboard(true);
            console.log(`[PointsTable] Fetching overall leaderboard for: ${tId}`);
            const res = await leaderboardAPI.getTournamentLeaderboard(tId);
            const lbData = res?.data?.leaderboard ?? res?.leaderboard ?? [];
            console.log(`[PointsTable] Received ${lbData.length} overall entries`);
            setLeaderboard(Array.isArray(lbData) ? lbData : []);
        } catch (error) {
            console.error('[PointsTable] Overall fetch error:', error);
            setLeaderboard([]);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const fetchLeaderboard = async (sId) => {
        if (!sId || sId === 'overall') return;
        try {
            setLoadingLeaderboard(true);
            console.log(`[PointsTable] Fetching stage leaderboard for: ${sId}`);
            const res = await leaderboardAPI.getByStage(sId);

            // Handle different structure: { success, data: { leaderboard: [...], killLeaders: [...] } }
            const rawData = res?.data ?? res;
            const lbData = rawData?.leaderboard ?? (Array.isArray(rawData) ? rawData : []);

            console.log(`[PointsTable] Received ${lbData.length} stage entries`);
            setLeaderboard(Array.isArray(lbData) ? lbData : []);
        } catch (error) {
            console.error('[PointsTable] Stage fetch error:', error);
            setLeaderboard([]);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleDeleteTournament = async () => {
        if (isGuest) { toast.error('Access restricted for guests.'); return; }
        if (!window.confirm(`Delete "${tournament?.name}" and ALL its matches permanently? This cannot be undone.`)) return;
        try {
            setDeletingTournament(true);
            // Use forceDelete which runs raw SQL to bypass any FK constraint issues
            await tournamentsAPI.forceDelete(tournamentId);
            toast.success('Tournament and all matches deleted!');
            onClose();
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete tournament');
        } finally {
            setDeletingTournament(false);
        }
    };

    const handleExportPDF = async () => {
        if (isGuest) { toast.error('Export restricted for guests.'); return; }
        if (!selectedStageId) { toast.error('Select a stage first.'); return; }
        if (leaderboard.length === 0) {
            toast.error('No standings to export.');
            return;
        }
        try {
            const toastId = toast.loading('Generating PDF...');
            // For now, only stage export is clearly defined in API. 
            // If overall, we might need a tournament export endpoint.
            const blob = selectedStageId === 'overall'
                ? await tournamentsAPI.exportTeams(tournamentId) // Fallback or dedicated overall export
                : await leaderboardAPI.exportExcel(selectedStageId);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Leaderboard-${selectedStageId === 'overall' ? 'Overall' : selectedStageId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss(toastId);
            toast.success('PDF saved!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF.');
        }
    };

    const selectedStageName = selectedStageId === 'overall'
        ? 'Overall Standings'
        : (stages.find(s => s.id === selectedStageId)?.name || 'Stage Standings');

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="bg-[#0d0d14] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(188,19,254,0.15)] w-full max-w-5xl flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0 bg-gradient-to-r from-[#0d0d14] via-[#12091a] to-[#0d0d14]">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-neon-purple/15 border border-neon-purple/40 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.2)] mt-0.5">
                            <Trophy className="w-4 h-4 text-neon-purple" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-base font-black uppercase italic tracking-tighter text-white leading-tight">
                                Points Table
                            </h2>
                            {tournament && (
                                <p className="text-[10px] text-neon-purple/70 font-mono uppercase tracking-[0.2em] mt-0.5">
                                    {tournament.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => selectedStageId === 'overall' ? fetchOverallLeaderboard(tournamentId) : fetchLeaderboard(selectedStageId)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
                        </button>
                        {!isGuest && (
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                <FileText className="w-4 h-4" />
                                <span>PDF</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div className="flex flex-1 min-h-0">

                    {/* ── SIDEBAR ── */}
                    <div className="w-48 shrink-0 flex flex-col border-r border-white/5 bg-[#0a0a11]">

                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                            <div className="flex items-center gap-2 px-1 py-2">
                                <LayoutGrid className="w-3.5 h-3.5 text-neon-purple/70" />
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-600">
                                    Navigation
                                </span>
                            </div>

                            {/* Overall Standing Button */}
                            <button
                                onClick={() => setSelectedStageId('overall')}
                                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 group ${selectedStageId === 'overall'
                                    ? 'bg-neon-blue/15 border-neon-blue/50 text-white shadow-[0_0_10px_rgba(0,183,255,0.1)]'
                                    : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/15 hover:text-gray-300'
                                    }`}
                            >
                                <Trophy className={`w-3.5 h-3.5 ${selectedStageId === 'overall' ? 'text-neon-blue' : 'text-gray-700'}`} />
                                <span className="text-[11px] font-bold uppercase tracking-tighter">Overall</span>
                            </button>

                            <div className="h-px bg-white/5 my-2" />

                            {loadingTournament ? (
                                <div className="flex items-center gap-2 px-2 py-3">
                                    <div className="w-3 h-3 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] text-gray-600 italic">Syncing...</span>
                                </div>
                            ) : stages.length > 0 ? (
                                stages.map((stage, idx) => {
                                    const isSelected = selectedStageId === stage.id;
                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => setSelectedStageId(stage.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 group ${isSelected
                                                ? 'bg-neon-purple/15 border-neon-purple/50 text-white shadow-[0_0_10px_rgba(188,19,254,0.1)]'
                                                : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/15 hover:text-gray-300'
                                                }`}
                                        >
                                            <span className={`text-[9px] font-black font-mono shrink-0 ${isSelected ? 'text-neon-purple' : 'text-gray-700'}`}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className="text-[11px] font-bold truncate">{stage.name}</span>
                                            {isSelected && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-neon-purple rounded-full shadow-[0_0_5px_rgba(188,19,254,0.8)] shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-[10px] text-gray-600 italic px-2 py-2">No phases found.</p>
                            )}
                        </div>

                        {/* Info footer */}
                        {tournament && (
                            <div className="px-3 py-3 border-t border-white/5 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Gamepad2 className="w-3 h-3 text-neon-blue/60" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Info</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-gray-700 font-mono">Game</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                                            {tournament.game?.replace(/_/g, ' ') || '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-gray-700 font-mono">Stages</span>
                                        <span className="text-[9px] font-bold text-neon-purple">
                                            {stages.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── MAIN AREA ── */}
                    <div className="flex-1 overflow-y-auto">
                        {selectedStageId ? (
                            <div
                                id="pts-capture-area"
                                className="bg-gradient-to-br from-[#1a0b0b] via-[#130808] to-[#0f0505] m-4 rounded-2xl border border-white/8 overflow-hidden shadow-2xl"
                            >
                                {/* Stage badge */}
                                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Layers className={`w-3.5 h-3.5 ${selectedStageId === 'overall' ? 'text-neon-blue/70' : 'text-orange-400/70'}`} />
                                        <span className={`text-[9px] font-mono tracking-[0.3em] font-black uppercase ${selectedStageId === 'overall' ? 'text-neon-blue' : 'text-orange-500/80'}`}>
                                            {selectedStageName}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">
                                        Official Standings
                                    </span>
                                </div>

                                {/* Tournament name */}
                                <div className="text-center px-6 pb-6 pt-2">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${selectedStageId === 'overall' ? 'to-neon-blue/30' : 'to-orange-500/30'}`} />
                                        <span className={`text-[9px] font-mono tracking-[0.5em] font-black uppercase ${selectedStageId === 'overall' ? 'text-neon-blue/60' : 'text-orange-500/60'}`}>
                                            Tournament
                                        </span>
                                        <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${selectedStageId === 'overall' ? 'to-neon-blue/30' : 'to-orange-500/30'}`} />
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                        {tournament?.name || 'TOURNAMENT'}
                                    </h2>
                                </div>

                                {/* Table or empty warning */}
                                <div className="px-4 pb-6">
                                    {!loadingLeaderboard && leaderboard.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                            <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center">
                                                <AlertTriangle className="w-7 h-7 text-yellow-500/70" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-300 mb-1">No standings available</p>
                                                <p className="text-[11px] text-gray-600">
                                                    This tournament has no results yet, or it may have been deleted.
                                                </p>
                                            </div>
                                            {!isGuest && (
                                                <button
                                                    onClick={handleDeleteTournament}
                                                    disabled={deletingTournament}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/60 transition-all disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {deletingTournament ? 'Deleting...' : 'Delete this Tournament'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <LeaderboardTable leaderboard={leaderboard} loading={loadingLeaderboard} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-20">
                                <div className="w-16 h-16 bg-dark-800/40 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                                    <Trophy className="w-8 h-8 text-gray-700" />
                                </div>
                                <p className="text-gray-500 text-sm italic">
                                    {stages.length === 0 ? 'No stages found for this tournament.' : 'Select a stage to view standings.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointsTable;
