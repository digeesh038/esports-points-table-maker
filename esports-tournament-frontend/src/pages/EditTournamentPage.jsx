import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TournamentForm from '../components/tournament/TournamentForm';
import tournamentsAPI from '../api/tournaments';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { ChevronLeft, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EditTournamentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isGuest } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (isGuest) {
            toast.error('Access restricted for guests.');
            navigate('/dashboard/tournaments');
            return;
        }
        fetchTournament();
    }, [id, isGuest, navigate]);

    const fetchTournament = async () => {
        try {
            setFetching(true);
            const response = await tournamentsAPI.getById(id);
            setInitialData(response?.data?.tournament || response?.tournament);
        } catch (error) {
            toast.error('Failed to load tournament data');
            navigate('/dashboard/tournaments');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            await tournamentsAPI.update(id, formData);
            toast.success('Tournament updated successfully!');
            navigate(`/dashboard/tournaments/${id}`);
        } catch (error) {
            const apiMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg;
            toast.error(apiMessage || 'Failed to update tournament');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Loader text="Loading tournament config..." />;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => navigate(-1)}
                    className="w-11 h-11 rounded-xl bg-dark-800/60 border border-white/10 flex items-center justify-center hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all group flex-shrink-0"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-neon-blue transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <Settings className="w-5 h-5 text-neon-purple flex-shrink-0" />
                        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            EDIT TOURNAMENT
                        </h1>
                    </div>
                    <p className="text-[11px] font-mono text-gray-600 uppercase tracking-[0.25em]">
                        Modifying: <span className="text-neon-blue/80">{initialData?.name || '...'}</span>
                    </p>
                </div>
                <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-neon-purple/70" />
                </div>
            </div>

            {/* Form Card — full width, generous padding */}
            <div className="bg-[#0d0d14] border border-white/8 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
                <div className="p-8 md:p-12">
                    <TournamentForm
                        onSubmit={handleSubmit}
                        loading={loading}
                        initialData={initialData}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditTournamentPage;
