import Navbar from '../components/common/Navbar';
import { Link, useLocation, Outlet } from 'react-router-dom';
import StandingsOverlay from '../components/leaderboard/StandingsOverlay';
import {
    LayoutDashboard,
    Trophy,
    Users,
    Target,
    BarChart3,
    Building2,
} from 'lucide-react';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <StandingsOverlay />
            <main className="p-4 md:p-8 animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
