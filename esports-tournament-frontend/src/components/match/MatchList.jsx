import MatchCard from './MatchCard';
import Loader from '../common/Loader';

const MatchList = ({ matches, loading, onEditResults, onEditDetails, onLock, onDelete }) => {
    if (loading) {
        return <Loader text="Loading matches..." fullScreen={false} />;
    }

    if (!matches || matches.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No matches found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
                <MatchCard
                    key={match.id}
                    match={match}
                    onEditResults={onEditResults}
                    onEditDetails={onEditDetails}
                    onLock={onLock}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
export default MatchList;