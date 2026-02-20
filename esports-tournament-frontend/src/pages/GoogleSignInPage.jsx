import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const GoogleSignInPage = () => {
    const { googleLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential);

        if (!res?.success) {
            toast.error(res?.error || 'Google sign-in failed');
            return;
        }

        toast.success('Welcome! 🎮');
        navigate('/dashboard', { replace: true });
    };

    const handleError = () => {
        toast.error('Google sign-in failed. Please try again.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="w-full max-w-md">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            🎮 Tournament Console
                        </h1>
                        <p className="text-gray-400">
                            Sign in with Google to continue
                        </p>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-500 bg-gray-800 transition-all checked:border-neon-blue checked:bg-neon-blue group-hover:border-neon-blue"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-sm text-gray-300 select-none">
                                I confirm that I am <span className="text-neon-blue font-bold">18 years or older</span>. I have read and agree to the <Link to="/privacy" className="text-neon-blue hover:underline" target="_blank">Privacy Policy</Link> and <Link to="/terms" className="text-neon-blue hover:underline" target="_blank">Terms of Service</Link>.
                            </div>
                        </label>
                    </div>

                    {/* Google Sign-In Button */}
                    <div className={`flex justify-center transition-all duration-300 ${!agreed ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={handleError}
                            theme="filled_black"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                            width="300"
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleSignInPage;
