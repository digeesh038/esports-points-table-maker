import React from 'react';
import { Users, User, Trash2, Edit2, Shield, Target } from 'lucide-react';
import Card from '../common/Card';

const SquadListView = ({ teams, onManageRoster, onDelete, showActions }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {teams.map((team) => (
                <div key={team.id} className="group relative">
                    {/* Team Header Stripe */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-neon-purple to-transparent opacity-30"></div>

                    <div className="bg-dark-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
                        {/* Team Banner Info */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    {team.logo ? (
                                        <img
                                            src={team.logo}
                                            alt={team.name}
                                            className="w-16 h-16 object-cover rounded-2xl border-2 border-neon-pink/30 shadow-[0_0_20px_rgba(255,0,212,0.2)]"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-dark-800 border-2 border-dark-600 flex items-center justify-center">
                                            <Users className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-neon-pink text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                        {team.tag || 'SQD'}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-neon-pink transition-colors">
                                        {team.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Target className="w-3 h-3 text-neon-pink" />
                                            {team.tournament?.name || 'Open Circuit'}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                        <span className="flex items-center gap-1 text-neon-blue">
                                            <Users className="w-3 h-3" />
                                            {team.players?.length || 0} OPERATIVES
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {showActions && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onManageRoster(team)}
                                        className="p-3 bg-white/5 hover:bg-neon-pink/10 border border-white/5 hover:border-neon-pink/30 rounded-2xl text-gray-400 hover:text-neon-pink transition-all group/btn"
                                        title="Assign/Remove Players"
                                    >
                                        <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(team.id)}
                                        className="p-3 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl text-gray-400 hover:text-red-500 transition-all group/btn"
                                        title="Expunge Squad"
                                    >
                                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Roster Grid */}
                        <div className="p-6 lg:p-8">
                            {team.players && team.players.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {team.players.map((player, idx) => (
                                        <div
                                            key={player.id || idx}
                                            className="relative p-4 bg-dark-800/40 border border-white/5 rounded-2xl hover:border-neon-pink/20 transition-all hover:bg-dark-800/60 overflow-hidden group/player"
                                        >
                                            {/* Role indicator */}
                                            <div className="absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 bg-neon-pink opacity-[0.03] group-hover/player:opacity-[0.08] transition-opacity rotate-45"></div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-500 group-hover/player:text-white transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-white truncate uppercase italic group-hover/player:text-neon-pink transition-colors">
                                                        {player.inGameName}
                                                    </h4>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter truncate">
                                                            {player.inGameId ? `ID: ${player.inGameId}` : 'NO FIELD ID'}
                                                        </span>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Shield className="w-2.5 h-2.5 text-neon-blue/60" />
                                                            <span className="text-[8px] font-black text-neon-blue/80 uppercase tracking-widest">
                                                                {player.role || 'ASSAULT'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl text-center bg-white/[0.01]">
                                    <Users className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em]">No active operatives in registry</p>
                                    <button
                                        onClick={() => onManageRoster(team)}
                                        className="mt-4 text-[10px] font-black text-neon-pink hover:underline uppercase tracking-widest"
                                    >
                                        Deploy Squad Roster
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SquadListView;
