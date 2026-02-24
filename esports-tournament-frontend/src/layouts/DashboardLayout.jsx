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
        <div className="min-h-screen bg-[#050508] relative overflow-hidden">
            {/* Global Dashboard Ornaments */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Large Ambient Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Subtle Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '100px 100px'
                    }}
                />
            </div>

            <Navbar />
            <StandingsOverlay />

            <main className="p-4 md:p-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Scanline */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent blur-sm pointer-events-none" />
        </div>
    );
};

export default DashboardLayout;
