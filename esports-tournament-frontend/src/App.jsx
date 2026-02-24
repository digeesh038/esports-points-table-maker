import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { StandingsProvider } from './contexts/StandingsContext';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

import HomePage from './pages/HomePage';
import GoogleSignInPage from './pages/GoogleSignInPage';
import DashboardPage from './pages/DashboardPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import TournamentsPage from './pages/TournamentsPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import PublicTournamentPage from './pages/PublicTournamentPage';
import EditTournamentPage from './pages/EditTournamentPage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import StageManagementPage from './pages/StageManagementPage';
import LegalPage from './pages/LegalPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <StandingsProvider>
                        <Routes>

                            {/* 🌍 Public */}
                            {/* 🌍 Public */}
                            <Route element={<MainLayout><Outlet /></MainLayout>}>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/tournaments" element={<TournamentsPage />} />
                                <Route path="/tournaments/public/:id" element={<PublicTournamentPage />} />
                                <Route path="/leaderboard/:id" element={<LeaderboardPage />} />
                                <Route path="/terms" element={<LegalPage />} />
                                <Route path="/privacy" element={<LegalPage />} />
                            </Route>

                            {/* 🔐 Auth */}
                            <Route path="/login" element={<GoogleSignInPage />} />
                            <Route path="/auth" element={<GoogleSignInPage />} />
                            <Route path="/signup" element={<GoogleSignInPage />} />

                            {/* 🛡 Protected */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<DashboardLayout />}>
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/dashboard/profile" element={<ProfilePage />} />
                                    <Route path="/dashboard/organizations" element={<OrganizationsPage />} />
                                    <Route path="/dashboard/organizations/:id" element={<OrganizationDetailPage />} />
                                    <Route path="/dashboard/tournaments" element={<TournamentsPage />} />
                                    <Route path="/dashboard/tournaments/create" element={<CreateTournamentPage />} />
                                    <Route path="/dashboard/tournaments/:id/edit" element={<EditTournamentPage />} />
                                    <Route path="/dashboard/tournaments/:tournamentId/stages/:stageId" element={<StageManagementPage />} />
                                    <Route path="/dashboard/tournaments/:id" element={<TournamentDetailPage />} />
                                    <Route path="/dashboard/teams" element={<TeamsPage />} />
                                    <Route path="/dashboard/matches" element={<MatchesPage />} />
                                </Route>
                            </Route>

                        </Routes>
                    </StandingsProvider>
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
