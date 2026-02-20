import { Outlet } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-black to-black">

            {/* Center wrapper */}
            <div className="w-full max-w-md px-4">
                <div className="bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/5">

                    {/* Header */}
                    {(title || subtitle) && (
                        <div className="text-center mb-6">
                            {title && (
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    {children ?? <Outlet />}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
