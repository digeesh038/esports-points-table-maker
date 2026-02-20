import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, User, Edit2, Check, X, XCircle, Users } from 'lucide-react';
import teamsAPI from '../../api/teams';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

const RosterManager = ({ team, onUpdate }) => {
    const { isGuest } = useAuth();
    const [players, setPlayers] = useState([]);
    const [newPlayer, setNewPlayer] = useState({ inGameName: '', inGameId: '', role: '' });
    const [loading, setLoading] = useState(false);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState({});

    useEffect(() => {
        if (team) {
            if (isGuest) {
                const cached = localStorage.getItem(`guest_roster_${team.id}`);
                setPlayers(cached ? JSON.parse(cached) : (team.players || []));
            } else {
                setPlayers(team.players || []);
            }
        }
    }, [team, isGuest]);

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        if (!newPlayer.inGameName) return;

        if (isGuest) {
            const createdPlayer = { ...newPlayer, id: `guest-${Date.now()}` };
            const updatedPlayers = [...players, createdPlayer];
            setPlayers(updatedPlayers);
            localStorage.setItem(`guest_roster_${team.id}`, JSON.stringify(updatedPlayers));
            setNewPlayer({ inGameName: '', inGameId: '', role: '' });
            toast.success('GUEST_MODE: Data saved locally');
            if (onUpdate) onUpdate();
            return;
        }

        try {
            setLoading(true);
            const response = await teamsAPI.addMember(team.id, newPlayer);

            const createdPlayer = response.data?.player || response.player;

            if (createdPlayer) {
                setPlayers([...players, createdPlayer]);
            } else {
                const newP = { ...newPlayer, id: Date.now() };
                setPlayers([...players, newP]);
            }

            setNewPlayer({ inGameName: '', inGameId: '', role: '' });
            toast.success('Player added successfully');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update squad: ' + (error.response?.data?.message || error.message));
            console.error('Add player error:', error.response || error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPlayer = (player) => {
        setEditingPlayerId(player.id);
        setEditingPlayer({ ...player });
    };

    const handleCancelEdit = () => {
        setEditingPlayerId(null);
        setEditingPlayer({});
    };

    const handleSaveEdit = async (playerId) => {
        if (isGuest) {
            const updatedPlayers = players.map(p =>
                p.id === playerId ? { ...p, ...editingPlayer } : p
            );
            setPlayers(updatedPlayers);
            localStorage.setItem(`guest_roster_${team.id}`, JSON.stringify(updatedPlayers));
            setEditingPlayerId(null);
            setEditingPlayer({});
            toast.success('GUEST_MODE: Updated locally');
            if (onUpdate) onUpdate();
            return;
        }

        try {
            const response = await teamsAPI.updateMember(team.id, playerId, {
                inGameName: editingPlayer.inGameName,
                inGameId: editingPlayer.inGameId,
                role: editingPlayer.role
            });

            const updatedPlayer = response.data?.player || response.player;

            setPlayers(players.map(p =>
                p.id === playerId ? (updatedPlayer || { ...p, ...editingPlayer }) : p
            ));

            setEditingPlayerId(null);
            setEditingPlayer({});
            toast.success('Player updated successfully');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update player: ' + (error.response?.data?.message || error.message));
            console.error('Update player error:', error.response || error);
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!confirm('Are you sure you want to remove this player?')) return;

        if (isGuest) {
            const updatedPlayers = players.filter(p => p.id !== playerId);
            setPlayers(updatedPlayers);
            localStorage.setItem(`guest_roster_${team.id}`, JSON.stringify(updatedPlayers));
            toast.success('GUEST_MODE: Removed');
            if (onUpdate) onUpdate();
            return;
        }

        const originalPlayers = [...players];
        try {
            // Optimistic update
            setPlayers(players.filter(p => p.id !== playerId));

            await teamsAPI.removeMember(team.id, playerId);
            toast.success('Player removed');
            if (onUpdate) onUpdate();
        } catch (error) {
            // Revert optimistic update
            setPlayers(originalPlayers);
            toast.error('Failed to remove player');
            console.error('Delete player error:', error.response || error);
        }
    };

    if (!team) return <div className="p-8 text-center text-gray-500 italic">No team selected.</div>;

    return (
        <div className="space-y-6">
            {/* Warning for rejected teams */}
            {team.status === 'rejected' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <div>
                            <p className="text-red-500 font-bold text-sm">TEAM DENIED - ROSTER LOCKED</p>
                            <p className="text-red-400 text-xs mt-1">This team has been rejected. Roster modifications are not allowed.</p>
                        </div>
                    </div>
                </div>
            )}

            {isGuest && (
                <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-neon-blue shadow-[0_0_8px_rgba(0,183,255,0.5)]" />
                        <div>
                            <p className="text-neon-blue font-bold text-sm uppercase">Guest Sandbox Active</p>
                            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Modifications are persisted locally to your session.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-dark-800/50 p-4 rounded-xl border border-dark-600">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-2 text-neon-pink" />
                    Active Team Roster
                </h3>

                {players.length === 0 ? (
                    <p className="text-gray-500 italic text-xs text-center py-4">No players listed yet.</p>
                ) : (
                    <div className="space-y-2">
                        {players.map((player, idx) => (
                            <div key={player.id || `player-${idx}`} className="flex items-center justify-between bg-dark-900/50 p-2 rounded-lg border border-white/5 group">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center border border-dark-700">
                                        <User className="w-4 h-4 text-neon-blue" />
                                    </div>

                                    {editingPlayerId === player.id ? (
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <Input
                                                value={editingPlayer.inGameName}
                                                onChange={(e) => setEditingPlayer({ ...editingPlayer, inGameName: e.target.value })}
                                                placeholder="IGN"
                                                className="bg-dark-800 border-dark-600 text-xs p-2"
                                            />
                                            <Input
                                                value={editingPlayer.inGameId || ''}
                                                onChange={(e) => setEditingPlayer({ ...editingPlayer, inGameId: e.target.value })}
                                                placeholder="Game ID"
                                                className="bg-dark-800 border-dark-600 text-xs p-2"
                                            />
                                            <Input
                                                value={editingPlayer.role || ''}
                                                onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                                                placeholder="Role"
                                                className="bg-dark-800 border-dark-600 text-xs p-2"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-white font-bold text-sm">{player.inGameName}</p>
                                            <div className="flex gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                                {player.role && <span>ROLE: {player.role}</span>}
                                                {player.inGameId && <span>ID: {player.inGameId}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {team.status !== 'rejected' && !isGuest && (
                                        <div className="flex gap-2">
                                            {editingPlayerId === player.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveEdit(player.id)}
                                                        className="text-neon-green hover:text-white transition-colors p-2 hover:bg-neon-green/10 rounded"
                                                        title="Save Changes"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/10 rounded"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEditPlayer(player)}
                                                        className="text-neon-blue hover:text-white transition-colors p-2 hover:bg-neon-blue/10 rounded"
                                                        title="Edit Player"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemovePlayer(player.id)}
                                                        className="text-red-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded"
                                                        title="Remove Player"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {team.status !== 'rejected' && !isGuest && (
                <form onSubmit={handleAddPlayer} className="bg-dark-800/20 p-4 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-black text-neon-green tracking-widest flex items-center italic">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Player
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            placeholder="In-Game Name (IGN)"
                            value={newPlayer.inGameName}
                            onChange={(e) => setNewPlayer({ ...newPlayer, inGameName: e.target.value })}
                            required
                            className="bg-dark-900 border-dark-700"
                        />
                        <Input
                            placeholder="Game ID (Optional)"
                            value={newPlayer.inGameId}
                            onChange={(e) => setNewPlayer({ ...newPlayer, inGameId: e.target.value })}
                            className="bg-dark-900 border-dark-700"
                        />
                        <Input
                            placeholder="Role (e.g. Sniper)"
                            value={newPlayer.role}
                            onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })}
                            className="bg-dark-900 border-dark-700 md:col-span-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green hover:text-black py-2.5 text-[10px] font-black uppercase tracking-widest"
                    >
                        {loading ? 'SAVING...' : 'SAVE TO ROSTER'}
                    </Button>
                </form>
            )}
        </div>
    );
};

export default RosterManager;
