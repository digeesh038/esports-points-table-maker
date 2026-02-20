import { useState } from 'react';
import Button from '../common/Button';
import { Trophy, Target, Hash, ChevronDown, ChevronUp, Users, FileText, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MatchResultForm = ({ teams, onSubmit, loading, initialResults = [], playerResults = [] }) => {
    const [results, setResults] = useState(
        teams.map((team, idx) => {
            const existing = initialResults.find(r => r.teamId === team.id);

            // Map existing player results or initialize from team roster
            const teamPlayerResults = (team.players || []).map(player => {
                const existingPlayerResult = playerResults.find(pr => pr.playerId === player.id && pr.teamId === team.id);
                return {
                    playerId: player.id,
                    inGameName: player.inGameName,
                    kills: existingPlayerResult ? existingPlayerResult.kills : 0
                };
            });

            return {
                teamId: team.id,
                teamName: team.name,
                kills: existing ? existing.kills : 0,
                placement: existing ? existing.placement : '',
                topPlayerName: existing ? existing.topPlayerName : '',
                topPlayerId: existing ? existing.topPlayerId : '',
                playerResults: teamPlayerResults,
                showPlayers: false
            };
        })
    );

    const handleChange = (index, field, value) => {
        const updatedResults = [...results];
        const updatedValue = (field === 'kills' || field === 'placement') ? (parseInt(value) || 0) : value;

        updatedResults[index] = {
            ...updatedResults[index],
            [field]: updatedValue
        };
        setResults(updatedResults);
    };

    const handlePlayerKillChange = (teamIndex, playerIndex, value) => {
        const updatedResults = [...results];
        const team = { ...updatedResults[teamIndex] };
        const playerResults = [...team.playerResults];
        const killsValue = parseInt(value) || 0;

        playerResults[playerIndex] = { ...playerResults[playerIndex], kills: killsValue };
        team.playerResults = playerResults;

        // Sum all player kills to get team total
        team.kills = playerResults.reduce((sum, p) => sum + p.kills, 0);

        updatedResults[teamIndex] = team;
        setResults(updatedResults);
    };

    const togglePlayers = (index) => {
        const updatedResults = [...results];
        updatedResults[index] = { ...updatedResults[index], showPlayers: !updatedResults[index].showPlayers };
        setResults(updatedResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const placements = results.map(r => r.placement);
        const uniquePlacements = new Set(placements);
        if (placements.length !== uniquePlacements.size) {
            toast.error('Each team must have a unique rank (e.g., two teams cannot be #1)');
            return;
        }

        onSubmit({
            results: results.map(r => ({
                teamId: r.teamId,
                kills: r.kills,
                placement: r.placement,
                topPlayerName: r.topPlayerName,
                topPlayerId: r.topPlayerId,
                playerResults: r.playerResults
            }))
        });
    };

    // Sort by name for stable editing
    const sortedResults = [...results].sort((a, b) => a.teamName.localeCompare(b.teamName));

    return (
        <div className="space-y-4">



            <form onSubmit={handleSubmit} className="overflow-hidden bg-[#0a0c10] border border-white/10 rounded-2xl shadow-2xl">
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {sortedResults.map((result) => {
                        const actualIndex = results.findIndex(r => r.teamId === result.teamId);
                        const isWinner = result.placement === 1;
                        const team = teams.find(t => t.id === result.teamId);

                        return (
                            <div
                                key={result.teamId}
                                className={`p-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${isWinner ? 'bg-yellow-500/[0.03]' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm italic ${isWinner ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                            #{result.placement}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {team?.logo && (
                                                <img
                                                    src={team.logo}
                                                    alt={team.name}
                                                    className="w-8 h-8 object-cover rounded shadow-lg border border-white/10"
                                                />
                                            )}
                                            <div>
                                                <h4 className={`text-base font-black tracking-tight uppercase italic flex items-center gap-2 ${isWinner ? 'text-yellow-500' : 'text-white'}`}>
                                                    {result.teamName}
                                                    {isWinner && <Trophy className="w-4 h-4" />}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pl-11 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3 h-3 text-red-500" /> KILLS
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={result.kills}
                                                onChange={(e) => handleChange(actualIndex, 'kills', e.target.value)}
                                                className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-red-500/50 outline-none transition-all"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePlayers(actualIndex)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-blue p-1 rounded-md"
                                            >
                                                {result.showPlayers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Hash className="w-3 h-3 text-yellow-500" /> RANK
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={result.placement}
                                            onChange={(e) => handleChange(actualIndex, 'placement', e.target.value)}
                                            className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-yellow-500/50 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {result.showPlayers && (
                                    <div className="pl-0 sm:pl-11 mb-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="bg-black/40 rounded-xl border border-white/5 p-4 space-y-4">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5" /> PLAYER PERFORMANCE
                                                </span>
                                            </div>

                                            {result.playerResults.length === 0 ? (
                                                <div className="text-[10px] text-gray-600 italic py-2 text-center">No roster data available.</div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {result.playerResults.map((pr, pIdx) => (
                                                        <div key={pr.playerId} className="flex items-center justify-between gap-4 bg-white/5 p-2.5 rounded-lg border border-white/5">
                                                            <span className="text-xs font-bold text-gray-200 truncate flex-1">{pr.inGameName}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-black text-gray-500 uppercase">KILLS</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={pr.kills}
                                                                    onChange={(e) => handlePlayerKillChange(actualIndex, pIdx, e.target.value)}
                                                                    className="w-16 bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-neon-blue font-black text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pl-11 border-t border-white/5 pt-4">
                                    <div className="max-w-xs">
                                        <label className="text-[9px] font-black text-neon-blue uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3" /> MATCH MVP:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. SKYLER"
                                            value={result.topPlayerName}
                                            onChange={(e) => handleChange(actualIndex, 'topPlayerName', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-blue/40"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-black/50 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Ready for Finalization</span>
                    </div>
                    <Button
                        type="submit"
                        loading={loading}
                        className="px-10 py-4 shadow-neon-green/20 min-w-[200px]"
                    >
                        {loading ? 'Transmitting...' : '💾 Save Match Results'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MatchResultForm;