import TeamCard from './TeamCard';
import Loader from '../common/Loader';

const TeamList = ({ teams, loading, showActions = false, onApprove, onReject, onAddPlayer, onDelete, className }) => {
    if (loading) {
        return <Loader text="Loading teams..." />;
    }

    if (!teams || teams.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No teams found.</p>
            </div>
        );
    }

    return (
        <div className={className || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {teams.map((team) => (
                <TeamCard
                    key={team.id}
                    team={team}
                    showActions={showActions}
                    onApprove={onApprove}
                    onReject={onReject}
                    onAddPlayer={() => onAddPlayer && onAddPlayer(team)}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
export default TeamList;