import { useState, useEffect } from 'react';
import LeaderboardTable from './LeaderboardTable';
import leaderboardAPI from '../../api/leaderboard';
import matchesAPI from '../../api/matches';
import Card from '../common/Card';
import Button from '../common/Button';
import {
    RefreshCw,
    Trophy,
    Zap,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const PointsTable = ({ tournamentId, stageId, teams = [] }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const { subscribeToLeaderboard, unsubscribeFromLeaderboard } = useSocket();

    useEffect(() => {
        if (stageId) {
            fetchData();

            // Subscribe to live updates
            if (subscribeToLeaderboard) {
                subscribeToLeaderboard(stageId, 'stage', (data) => {
                    // Handle various data shapes from socket emits
                    const updatedLb = data.leaderboard?.leaderboard || data.leaderboard || data;
                    if (Array.isArray(updatedLb)) {
                        setLeaderboard(updatedLb);
                    }
                });
            }

            return () => {
                if (unsubscribeFromLeaderboard) {
                    unsubscribeFromLeaderboard(stageId, 'stage');
                }
            };
        }
    }, [stageId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await leaderboardAPI.getByStage(stageId);
            setLeaderboard(response.data?.leaderboard || response.leaderboard || []);
        } catch (error) {
            console.error('Failed to sync points table:', error);
            toast.error('Sync failed: Offline mode active');
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            setSyncing(true);
            const toastId = toast.loading('Recalibrating node scores...');
            await leaderboardAPI.recalculate(stageId);
            await fetchData();
            toast.success('Standings synchronized successfully!', { id: toastId });
        } catch (error) {
            toast.error('Recalculation protocol failed.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <Card className="bg-[#0a0a0f] border-white/5 overflow-hidden shadow-2xl relative">
            {/* Header / Command Strip */}
            <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-dark-900 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.15)]">
                        <Trophy className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic text-white uppercase tracking-tight flex items-center gap-2">
                            Points Table
                            {syncing && <span className="text-[10px] text-neon-blue animate-pulse font-mono tracking-widest ml-2">UPDATING...</span>}
                        </h3>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em]">Phase Telemetry & Rankings</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchData}
                        disabled={loading || syncing}
                        className="text-gray-400 border-white/5 hover:bg-white/5 hover:text-white"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRecalculate}
                        loading={syncing}
                        className="shadow-[0_0_20px_rgba(0,183,255,0.2)]"
                    >
                        <Zap className="w-3.5 h-3.5 mr-2" />
                        Update Points
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-2 sm:p-4">
                {leaderboard.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <LeaderboardTable leaderboard={leaderboard} loading={loading} />
                    </div>
                ) : !loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                            <Target className="w-8 h-8 text-gray-700 opacity-20" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-500 italic uppercase">Awaiting Deployments</h4>
                        <p className="text-xs text-gray-600 font-mono mt-2 max-w-xs mx-auto">Standings will materialize once match data is processed for this phase.</p>
                        <Button variant="outline" size="sm" onClick={handleRecalculate} className="mt-8 border-neon-blue/20 text-neon-blue/60 hover:text-neon-blue">
                            Force Node Update
                        </Button>
                    </div>
                ) : (
                    <div className="py-24 flex flex-center flex-col items-center gap-4">
                        <RefreshCw className="w-8 h-8 text-neon-blue animate-spin opacity-50" />
                        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Retrieving Standings...</span>
                    </div>
                )}
            </div>

            {/* Footer / Status Bar */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(40,255,0,0.5)]"></div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">Live Feed</span>
                    </div>
                    <div className="h-3 w-px bg-white/10"></div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{leaderboard.length} Entities Indexed</span>
                </div>
                <div className="text-[9px] font-mono text-gray-700 flex items-center gap-2 italic">
                    <Zap className="w-3 h-3" />
                    SYNC_STABLE
                </div>
            </div>
        </Card>
    );
};

export default PointsTable;
