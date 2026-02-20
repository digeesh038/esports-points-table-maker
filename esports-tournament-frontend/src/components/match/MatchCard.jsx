import { Calendar, MapPin, Trophy, Lock, Unlock, Edit, Target, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const MatchCard = ({ match, onEditResults, onEditDetails, onLock, onDelete }) => {
    const { isGuest } = useAuth();
    if (!match) return null;

    const statusConfig = {
        scheduled: { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20', label: 'Upcoming' },
        live: { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Live' },
        completed: { color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', label: 'Completed' },
        cancelled: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Cancelled' },
    };

    const config = statusConfig[match.status] || statusConfig.scheduled;
    const matchNo = match.matchNumber ? match.matchNumber.toString().padStart(3, '0') : '???';

    return (
        <div className="bg-dark-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 hover:border-neon-blue/40 transition-all group relative overflow-hidden">
            {/* Status Bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${config.color.replace('text-', 'bg-')} opacity-30 group-hover:opacity-100 transition-opacity`}></div>

            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-mono font-black border ${config.border} ${config.bg} ${config.color} px-1.5 py-0.5 rounded tracking-widest`}>
                            {config.label}
                        </span>
                        {match.isLocked && (
                            <span className="flex items-center text-[9px] font-mono font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded tracking-widest">
                                <Lock className="w-2.5 h-2.5 mr-1" /> FINALIZED
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-white italic group-hover:text-neon-blue transition-colors uppercase leading-tight">
                        {match.customTitle || `${match.stage?.name || 'Match'} #${matchNo}`}
                    </h3>
                </div>
            </div>

            <div className="space-y-1.5 mb-5">
                {match.mapName && (
                    <div className="flex items-center text-[11px] font-mono text-gray-400">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-neon-blue" />
                        <span className="text-gray-400">LOC:</span>
                        <span className="ml-2 font-black text-white uppercase">{match.mapName}</span>
                    </div>
                )}
                {match.scheduledTime && (
                    <div className="flex items-center text-[11px] font-mono text-gray-400">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-neon-purple" />
                        <span className="text-gray-400">TIME:</span>
                        <span className="ml-2 font-black text-white">
                            {(() => {
                                try {
                                    return format(new Date(match.scheduledTime), 'HH:mm | dd.MM.yy');
                                } catch (e) {
                                    return 'TBD';
                                }
                            })()}
                        </span>
                    </div>
                )}
            </div>

            {match.results && match.results.length > 0 && (
                <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-red-500" />
                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Top Players</span>
                    </div>
                    <div className="space-y-1.5">
                        {match.results
                            .sort((a, b) => b.kills - a.kills)
                            .slice(0, 3)
                            .map((result, index) => (
                                <div
                                    key={result.id}
                                    className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-1.5 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={`text-[9px] font-black w-3 shrink-0 ${index === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>#{index + 1}</span>
                                        {result.team?.logo && (
                                            <img
                                                src={result.team.logo}
                                                alt={result.team.name}
                                                className="w-4 h-4 object-cover rounded shadow-[0_0_5px_rgba(255,255,255,0.1)]"
                                            />
                                        )}
                                        <span className="text-[10px] font-black text-white truncate">
                                            {result.topPlayerName || result.team?.name}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-neon-blue">
                                        {result.kills}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                {!isGuest && match.status !== 'cancelled' && (
                    <button
                        onClick={() => onEditResults(match)}
                        className={`flex-1 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border 
                            ${match.isLocked
                                ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500/50 cursor-not-allowed'
                                : 'bg-white/5 border-white/10 hover:border-neon-blue/50 text-white hover:text-neon-blue active:scale-95'}`}
                        disabled={match.isLocked}
                        title="Edit Match Results"
                    >
                        {match.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                        {match.isLocked ? 'Locked' : 'Scoring'}
                    </button>
                )}
                {!isGuest && (
                    <button
                        onClick={() => onEditDetails(match)}
                        className="px-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-neon-blue hover:border-neon-blue/50 transition-all flex items-center justify-center active:scale-95"
                        title="Edit Match Details (Map, Time, Title)"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                )}
                {!isGuest && match.status === 'completed' && (
                    <button
                        onClick={() => onLock(match.id)}
                        className={`px-3 rounded-xl transition-all flex items-center justify-center border active:scale-95
                            ${match.isLocked
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                : 'bg-dark-700 border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                        title={match.isLocked ? "Unlock Results" : "Finalize & Lock Results"}
                    >
                        {match.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                )}
                {!isGuest && (
                    <button
                        onClick={() => {
                            if (window.confirm('Delete this match and all its results?')) {
                                onDelete(match.id);
                            }
                        }}
                        className="px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-95"
                        title="Delete Match"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};
export default MatchCard;