import Navbar from '../components/common/Navbar';
import StandingsOverlay from '../components/leaderboard/StandingsOverlay';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <StandingsOverlay />
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
