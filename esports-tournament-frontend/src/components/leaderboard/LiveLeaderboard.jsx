import { useEffect, useState, useMemo } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import LeaderboardTable from './LeaderboardTable';
import leaderboardAPI from '../../api/leaderboard';
import { Radio, Target, TrendingUp, Activity, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LiveLeaderboard = ({ stageId, tournamentId, tournamentName }) => {
    const { isGuest } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [killLeaders, setKillLeaders] = useState([]);
    const [logs, setLogs] = useState([
        { id: 1, message: 'System Ready', type: 'system', time: new Date() },
        { id: 2, message: 'Live Monitoring Active', type: 'system', time: new Date() }
    ]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const socket = useSocket();
    const { subscribeToLeaderboard, unsubscribeFromLeaderboard, connected } = socket || {};

    useEffect(() => {
        if (!stageId) return;
        fetchLeaderboard();
    }, [stageId, tournamentId]);

    useEffect(() => {
        if (!connected || !stageId) return;

        const handleLeaderboardUpdate = (data) => {
            console.log('[LiveLeaderboard] Received socket update:', data);

            // Check if this update belongs to our current view
            const isStageUpdate = data && data.stageId;
            const updatedLbArray = isStageUpdate
                ? (Array.isArray(data.leaderboard) ? data.leaderboard : (data.leaderboard?.leaderboard ?? []))
                : (Array.isArray(data) ? data : (data?.leaderboard ?? []));

            const isMatch = stageId === 'overall' ? !isStageUpdate : (stageId === data.stageId);

            if (isMatch) {
                // Determine rank changes
                setLeaderboard(prev => {
                    try {
                        const prevArray = Array.isArray(prev) ? prev : [];
                        if (!Array.isArray(updatedLbArray)) return prevArray;

                        const updated = updatedLbArray.map(team => {
                            if (!team || !team.teamId) return team || {};

                            const oldIdx = prevArray.findIndex(p => p.teamId === team.teamId);
                            if (oldIdx === -1) return { ...team, delta: 0 };

                            const oldRank = prevArray[oldIdx].rank;
                            const newRank = team.rank;
                            const delta = (oldRank || 0) - (newRank || 0);

                            if (delta !== 0) {
                                const msg = `${team.teamName || team.team?.name} moved ${delta > 0 ? 'UP' : 'DOWN'} by ${Math.abs(delta)} rank(s)`;
                                setLogs(prevLogs => [
                                    { id: Date.now(), message: msg, type: delta > 0 ? 'positive' : 'negative', time: new Date() },
                                    ...prevLogs.slice(0, 5)
                                ]);
                            }
                            return { ...team, delta };
                        });
                        return updated;
                    } catch (err) {
                        console.error("Critical error in leaderboard state update:", err);
                        return prev;
                    }
                });
                setIsLive(true);
            }
        };

        const type = stageId === 'overall' ? 'tournament' : 'stage';
        const id = stageId === 'overall' ? tournamentId : stageId;

        if (subscribeToLeaderboard && typeof subscribeToLeaderboard === 'function') {
            subscribeToLeaderboard(id, type, handleLeaderboardUpdate);
        }

        return () => {
            if (unsubscribeFromLeaderboard && typeof unsubscribeFromLeaderboard === 'function') {
                unsubscribeFromLeaderboard(id, type, handleLeaderboardUpdate);
            }
        };
    }, [stageId, tournamentId, connected, subscribeToLeaderboard, unsubscribeFromLeaderboard]);

    const fetchLeaderboard = async () => {
        if (isGuest) {
            const mockRankings = [
                { team: { name: 'Team Shadow' }, teamName: 'Team Shadow', totalPoints: 145, totalKills: 32, rank: 1, wins: 2 },
                { team: { name: 'Phantom Guild' }, teamName: 'Phantom Guild', totalPoints: 128, totalKills: 28, rank: 2, wins: 1 },
                { team: { name: 'Cyber Warriors' }, teamName: 'Cyber Warriors', totalPoints: 112, totalKills: 24, rank: 3, wins: 1 }
            ];
            setLeaderboard(mockRankings);
            setIsLive(true);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = stageId === 'overall'
                ? await leaderboardAPI.getTournamentLeaderboard(tournamentId)
                : await leaderboardAPI.getByStage(stageId);

            let lbData = [];
            let klData = [];

            const rawContent = response?.data?.leaderboard ?? response?.leaderboard ?? response;

            if (rawContent?.leaderboard && Array.isArray(rawContent.leaderboard)) {
                lbData = rawContent.leaderboard;
                klData = rawContent.killLeaders || [];
            } else if (Array.isArray(rawContent)) {
                lbData = rawContent;
            }

            setLeaderboard(Array.isArray(lbData) ? lbData : []);
            setKillLeaders(Array.isArray(klData) ? klData : []);

        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
            setKillLeaders([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-1">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-2 gap-4">
                <div className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-2 h-10 bg-black rounded-full border border-white/20"></div>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-blue to-white uppercase drop-shadow-[0_0_10px_rgba(0,183,255,0.5)]">
                        Live Standings
                    </h2>
                </div>
                {/* Header Stats Removed as per user request */}
            </div>

            <div className="w-full animate-in fade-in duration-700">
                <div id="leaderboard-capture-area" className="bg-gradient-to-br from-[#1a0b0b] to-[#0f0505] rounded-2xl overflow-hidden border border-white/10 p-4 md:p-10 shadow-2xl relative">
                    {/* Header Section inside Capture Area */}
                    <div className="relative z-10 text-center mb-10 pt-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-orange-500/50"></div>
                            <span className="text-[10px] md:text-[12px] font-mono tracking-[0.4em] font-black text-orange-500 uppercase">OFFICIAL TOURNAMENT STANDINGS</span>
                            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-orange-500/50"></div>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,1)] leading-tight py-2 mb-2">
                            {tournamentName || 'TOURNAMENT NAME'}
                        </h2>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto">
                        <LeaderboardTable leaderboard={leaderboard} loading={loading} />
                    </div>
                </div>
            </div>


        </div>
    );
};
export default LiveLeaderboard