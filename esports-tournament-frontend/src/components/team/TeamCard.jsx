import { Users, Mail, Phone, CheckCircle, XCircle, Clock, Shield, UserPlus, Trash2, CreditCard, Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeamCard = ({ team, onApprove, onReject, onAddPlayer, onDelete, showActions = false, onViewReceipt }) => {
    const { isGuest } = useAuth();
    const statusConfig = {
        pending: {
            icon: <Clock className="w-5 h-5 text-yellow-500" />,
            style: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
            label: 'Pending'
        },
        approved: {
            icon: <CheckCircle className="w-5 h-5 text-neon-green" />,
            style: 'bg-neon-green/10 text-neon-green border-neon-green/30',
            label: 'Approved'
        },
        rejected: {
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            style: 'bg-red-500/10 text-red-500 border-red-500/30',
            label: 'Rejected'
        },
    };

    const config = statusConfig[team.status] || statusConfig.pending;

    return (
        <div className="bg-dark-800/40 backdrop-blur-md border border-dark-600 rounded-2xl p-6 group hover:border-neon-pink/30 transition-all relative overflow-hidden shadow-xl">
            {/* Background texture */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Shield className="w-24 h-24 text-white" />
            </div>

            {/* Payment Badge */}
            {team.paymentStatus === 'completed' && (
                <div className="absolute top-0 left-0 z-20">
                    <div className="bg-neon-green/90 text-black text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-br-xl flex items-center gap-1 shadow-lg shadow-neon-green/10">
                        <CreditCard className="w-2.5 h-2.5" />
                        PAID
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-dark-700 rounded-2xl border border-dark-600 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-neon-pink/50 transition-colors">
                        {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-7 h-7 text-neon-pink opacity-70" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-neon-pink transition-colors">
                            {team.name}
                            {team.tag && (
                                <span className="ml-2 text-xs font-mono text-gray-500 tracking-tighter">[{team.tag.toUpperCase()}]</span>
                            )}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${config.style} tracking-[0.1em]`}>
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>
                {showActions && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onDelete !== 'function') {
                                console.error('onDelete is not a function in TeamCard');
                                return;
                            }
                            if (window.confirm('Are you sure you want to delete this team?')) {
                                onDelete(team.id);
                            }
                        }}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl border border-red-500/20 transition-all flex items-center justify-center shrink-0 relative z-50"
                        title="Delete Team"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-3 mb-6 relative z-10">
                <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center mr-3 border border-dark-600">
                        <Shield className="w-4 h-4 text-neon-pink/70" />
                    </div>
                    <span className="font-medium">Captain: {team.contactName || team.captainName || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center mr-3 border border-dark-600">
                        <Mail className="w-4 h-4 text-neon-pink/70" />
                    </div>
                    <span className="font-medium truncate">{team.contactEmail || team.captainEmail}</span>
                </div>
            </div>

            {team.players && team.players.length > 0 ? (
                <div className="mb-6 pt-4 border-t border-dark-700">
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Team Members</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {team.players.slice(0, 4).map((player) => (
                            <div key={player.id} className="text-xs text-gray-500 flex items-center bg-dark-900/40 p-1.5 rounded-lg border border-dark-700/50">
                                <div className="w-1.5 h-1.5 bg-neon-pink rounded-full mr-2 opacity-50"></div>
                                <span className="truncate font-mono">{player.inGameName}</span>
                            </div>
                        ))}
                        {team.players.length > 4 && (
                            <div className="text-xs text-gray-600 font-mono p-1.5 italic">
                                + {team.players.length - 4} more...
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onAddPlayer}
                        className="mt-3 w-full text-[10px] font-black text-gray-500 hover:text-neon-pink uppercase tracking-widest transition-colors py-2 border border-dark-600 rounded-lg hover:border-neon-pink/30"
                    >
                        {isGuest ? 'VIEW TEAM' : 'MANAGE TEAM'}
                    </button>
                </div>
            ) : (
                <div className="mb-6 pt-4 border-t border-dark-700">
                    <div className="flex flex-col items-center justify-center py-4 bg-dark-900/20 rounded-xl border border-dashed border-dark-600">
                        <UserPlus className="w-5 h-5 text-gray-600 mb-2" />
                        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">No Players</span>
                        <button
                            onClick={onAddPlayer}
                            className="mt-2 text-[10px] font-black text-neon-pink hover:text-white uppercase tracking-tighter transition-colors"
                        >
                            {isGuest ? 'VIEW DETAILS' : 'ADD PLAYERS'}
                        </button>
                    </div>
                </div>
            )}

            {team.paymentStatus === 'completed' && onViewReceipt && (
                <button
                    onClick={() => onViewReceipt(team)}
                    className="mb-4 w-full py-2 bg-neon-blue/5 text-neon-blue border border-neon-blue/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all flex items-center justify-center gap-2 group/receipt hover:shadow-[0_0_15px_rgba(0,183,255,0.3)]"
                >
                    <Receipt className="w-3.5 h-3.5 group-hover/receipt:scale-110 transition-transform" />
                    View Payment Receipt
                </button>
            )}

            {showActions && team.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => onApprove(team.id)}
                        className="flex-1 py-2.5 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => onReject(team.id)}
                        className="flex-1 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeamCard;