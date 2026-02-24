import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentForm from '../components/tournament/TournamentForm';
import tournamentsAPI from '../api/tournaments';
import paymentsAPI from '../api/payments';
import { loadRazorpay } from '../utils/payment';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';

const PLATFORM_FEE = 99; // INR — activation fee for paid tournaments

const CreateTournamentPage = () => {
    const { isGuest, user } = useAuth();
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

            // ─── PAID TOURNAMENT ─────────────────────────────────────────────────
            if (formData.isPaid && Number(formData.entryFee) > 0) {

                // 1. Load Razorpay SDK
                const sdkLoaded = await loadRazorpay();
                if (!sdkLoaded) {
                    toast.error('Razorpay SDK failed to load. Check internet connection.');
                    return;
                }

                // 2. Create a Razorpay order on our backend
                let orderRes;
                try {
                    orderRes = await paymentsAPI.createPlatformOrder({
                        amount: PLATFORM_FEE,
                        currency: 'INR',
                        tournamentName: formData.name,
                    });
                } catch (e) {
                    toast.error(e.response?.data?.message || 'Failed to initiate payment. Try again.');
                    return;
                }

                const { orderId, amount, currency, keyId } = orderRes.data.data;

                // 3. Open Razorpay Checkout (handles UPI, Card, Net Banking, QR automatically)
                await new Promise((resolve, reject) => {
                    const options = {
                        key: keyId,
                        amount,
                        currency,
                        name: 'Esports Manager',
                        description: `Activation Fee — ${formData.name}`,
                        order_id: orderId,
                        // Razorpay generates its own QR / UPI / payment UI — no manual entry needed
                        handler: async (razorpayResponse) => {
                            try {
                                // 4. Send payment proof + tournament data to backend
                                //    Backend VERIFIES HMAC then creates tournament atomically
                                const createRes = await paymentsAPI.verifyAndCreateTournament({
                                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                                    razorpay_signature: razorpayResponse.razorpay_signature,
                                    tournamentData: formData,
                                });

                                toast.success('✅ Payment verified & Tournament is LIVE!');
                                navigate(`/dashboard/tournaments/${createRes.data.data.tournament.id}`);
                                resolve();
                            } catch (err) {
                                const msg = err.response?.data?.message || 'Server verification failed';
                                toast.error(`❌ ${msg}`);
                                reject(err);
                            }
                        },
                        prefill: {
                            name: user?.name || '',
                            email: user?.email || '',
                        },
                        theme: { color: '#8B5CF6' },
                        modal: {
                            ondismiss: () => {
                                toast('Payment cancelled. Tournament was NOT created.', { icon: '⚠️' });
                                setLoading(false);
                                resolve(); // don't create tournament
                            },
                        },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                });

                return; // everything handled in promise above
            }

            // ─── FREE TOURNAMENT ─────────────────────────────────────────────────
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

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-neon-green/5 border border-neon-green/20 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-[11px] font-black text-neon-green uppercase tracking-widest mb-1">Secure Payment Gateway</p>
                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                        All payments are processed by <span className="text-white">Razorpay</span>. For paid tournaments, a one-time activation fee of <span className="text-white">₹{PLATFORM_FEE}</span> is required. Your tournament is created <span className="text-white">only after server-side payment verification</span> — no fake payments possible.
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