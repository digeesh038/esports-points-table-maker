import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LiveLeaderboard from '../components/leaderboard/LiveLeaderboard';
import tournamentsAPI from '../api/tournaments';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { FileText, Download, Trophy, Target, LayoutGrid, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import leaderboardAPI from '../api/leaderboard';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';

const LeaderboardPage = () => {
    const { id: tournamentId } = useParams();
    const navigate = useNavigate();
    const { isGuest } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [selectedStageId, setSelectedStageId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournament();
        fetchAllTournaments();
    }, [tournamentId]);

    const fetchAllTournaments = async () => {
        if (isGuest) return;
        try {
            const response = await tournamentsAPI.getAll({ mine: true });
            setTournaments(response?.data?.tournaments || response?.tournaments || []);
        } catch (error) {
            console.error('Failed to sync tournament registry', error);
        }
    };

    const fetchTournament = async () => {
        if (isGuest) {
            const mockTournaments = {
                'dummy-1': {
                    id: 'dummy-1',
                    name: 'FREE FIRE: GLOBAL SHOWDOWN',
                    game: 'free_fire',
                    format: 'battle_royale',
                    stages: [
                        { id: 'mock-stage-1', name: 'Qualifiers', status: 'active' },
                        { id: 'mock-stage-2', name: 'Grand Finals', status: 'upcoming' }
                    ]
                }
            };

            const mockData = mockTournaments[tournamentId] || mockTournaments['dummy-1'];
            setTournament(mockData);
            setSelectedStageId('overall');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await tournamentsAPI.getById(tournamentId);

            const tournamentData = response?.data?.tournament || response?.tournament;
            setTournament(tournamentData);
            setSelectedStageId('overall'); // Default to overall
        } catch (error) {
            toast.error('Failed to load leaderboard data stream');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportImage = async () => {
        if (isGuest) {
            toast.error('Export restricted for guests.');
            return;
        }

        const element = document.getElementById('leaderboard-capture-area');
        if (!element) {
            toast.error('Leaderboard content not found.');
            return;
        }

        try {
            const toastId = toast.loading('Generating leaderboard image...');

            // Create a clone to ensure consistent internal layout for capture
            const clone = element.cloneNode(true);

            // Style the clone to force desktop-width layout (1200px standard)
            // This prevents mobile view/responsive shifts from affecting the download
            Object.assign(clone.style, {
                position: 'fixed',
                top: '-10000px',
                left: '-10000px',
                width: '1200px', // Standard width for alignment
                height: 'auto',
                zIndex: '-1',
                padding: '40px' // Ensure padding is consistent
            });

            document.body.appendChild(clone);

            // Give browser a moment to render the clone layout
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(clone, {
                backgroundColor: '#0f0505', // Match the dark theme background
                scale: 2, // 2x Scale for retina quality
                logging: false,
                useCORS: true,
                allowTaint: true,
                width: 1200,
                windowWidth: 1200
            });

            document.body.removeChild(clone);
            toast.dismiss(toastId);

            const link = document.createElement('a');
            link.download = `leaderboard-${selectedStageId || 'live'}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Leaderboard image saved!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.dismiss();
            toast.error('Failed to capture image.');
        }
    };

    const handleExportPDF = async () => {
        if (isGuest) {
            toast.error('Export restricted for guests.');
            return;
        }
        if (!selectedStageId) {
            toast.error('Select a stage first.');
            return;
        }

        try {
            const toastId = toast.loading('Generating Points Table PDF...');
            // Simplified logic: If overall, use tournament export, else stage export
            const blob = selectedStageId === 'overall'
                ? await tournamentsAPI.exportTeams(tournamentId)
                : await leaderboardAPI.exportExcel(selectedStageId);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PointsTable-${selectedStageId === 'overall' ? 'Overall' : selectedStageId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss(toastId);
            toast.success('Points Table PDF saved!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF.');
            console.error(error);
        }
    };

    const handleExportTeams = async () => {
        if (isGuest) {
            toast.error('Export restricted for guests.');
            return;
        }
        if (!tournamentId) return;

        try {
            const blob = await tournamentsAPI.exportTeams(tournamentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teams-${tournamentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Teams exported successfully (PDF).');
        } catch (error) {
            toast.error('Export failed: ' + (error.response?.data?.message || 'Unknown error'));
            console.error(error);
        }
    };

    if (loading) return <Loader text="Loading standings..." />;

    if (!tournament) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <Trophy className="w-20 h-20 text-dark-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-500 italic">Tournament not found.</h2>
                <Link to="/" className="text-neon-blue mt-4 hover:underline">Return to Hub</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center hover:border-neon-blue transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-neon-blue" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono uppercase tracking-widest text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">
                                {isGuest ? 'Spectator View' : 'Live Feed'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent italic">
                            {(tournament.name || 'Tournament').toUpperCase()}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="bg-dark-800/40 border border-dark-600 hover:border-neon-blue/50 hover:bg-dark-700 text-gray-400 hover:text-white py-2 px-4 rounded-xl flex items-center justify-center transition-all text-xs font-bold uppercase tracking-widest"
                            title="Save as PDF (Points Table)"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Save PDF
                        </button>
                    </div>
                    {/* Public status indicator */}
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Status</p>
                        <p className="text-neon-green text-sm font-bold flex items-center">
                            <span className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Stage Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-6">
                    <Card className="bg-[#0a0a11] border-white/5 p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <LayoutGrid className="w-4 h-4 text-neon-purple/70" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Navigation</h3>
                        </div>

                        <div className="space-y-2">
                            {/* Overall Standing Button */}
                            <button
                                onClick={() => setSelectedStageId('overall')}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${selectedStageId === 'overall'
                                    ? 'bg-neon-blue/15 border-neon-blue/50 text-white shadow-[0_0_15px_rgba(0,183,255,0.1)]'
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <Trophy className={`w-4 h-4 ${selectedStageId === 'overall' ? 'text-neon-blue' : 'text-gray-700'}`} />
                                <span className="font-bold uppercase tracking-tight text-sm">Overall</span>
                            </button>

                            <div className="h-px bg-white/5 my-4" />

                            {tournament.stages?.map((stage, idx) => (
                                <button
                                    key={stage.id}
                                    onClick={() => setSelectedStageId(stage.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${selectedStageId === stage.id
                                        ? 'bg-neon-purple/15 border-neon-purple/50 text-white shadow-[0_0_15px_rgba(188,19,254,0.1)]'
                                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black font-mono shrink-0 ${selectedStageId === stage.id ? 'text-neon-purple' : 'text-gray-700'}`}>
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-bold text-sm tracking-tight">{stage.name}</span>
                                    {selectedStageId === stage.id && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-neon-purple rounded-full shadow-[0_0_8px_rgba(188,19,254,0.8)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Tournament Switcher (Only for owners) */}
                    {!isGuest && tournaments.length > 1 && (
                        <Card className="bg-[#0a0a11] border-white/5 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-4 h-4 text-neon-blue/70" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Switch Tournament</h3>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {tournaments.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            if (t.id === tournamentId) return;
                                            navigate(`/leaderboard/${t.id}`);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold truncate ${t.id === tournamentId
                                            ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                                            }`}
                                    >
                                        {t.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="bg-[#0a0a11]/50 border-white/5 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-4 h-4 text-neon-blue/70" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Tournament Info</h3>
                        </div>
                        <div className="space-y-4 text-xs font-mono">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-600 uppercase">Game</span>
                                <span className="text-gray-300 font-bold uppercase tracking-tighter">{tournament.game?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-600 uppercase">Stages</span>
                                <span className="text-neon-purple font-bold italic">{tournament.stages?.length || 0}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    {selectedStageId ? (
                        <ErrorBoundary>
                            <div className="bg-[#0d0d14] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <LiveLeaderboard
                                    stageId={selectedStageId}
                                    tournamentId={tournamentId}
                                    tournamentName={tournament.name}
                                />
                            </div>
                        </ErrorBoundary>
                    ) : (
                        <Card className="bg-[#0a0a11] border-dashed border-2 border-white/10 py-32 text-center rounded-2xl">
                            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest italic">Waiting for Sync</h3>
                            <p className="text-gray-600 mt-2 text-sm">Select a phase from the navigation to view live standings.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;