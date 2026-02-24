import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentForm from '../components/tournament/TournamentForm';
import tournamentsAPI from '../api/tournaments';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Plus } from 'lucide-react';

const CreateTournamentPage = () => {
    const { isGuest } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isGuest) {
            toast.error('Access restricted for guests.');
            navigate('/dashboard/tournaments');
        }
    }, [isGuest, navigate]);

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            const response = await tournamentsAPI.create(formData);
            toast.success('Tournament created successfully!');
            navigate(`/dashboard/tournaments/${response.data.tournament.id}`);
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to create tournament';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(188,19,254,0.15)]">
                    <Trophy className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-neon-purple" />
                        <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic tracking-tight">
                            NEW TOURNAMENT
                        </h1>
                    </div>
                    <p className="text-[11px] font-mono text-gray-600 uppercase tracking-[0.25em] mt-0.5">
                        Configure your tournament settings
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-[#0d0d14] border border-white/8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
                <div className="p-8">
                    <TournamentForm onSubmit={handleSubmit} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default CreateTournamentPage;