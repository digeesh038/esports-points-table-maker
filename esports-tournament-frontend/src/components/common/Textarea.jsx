import React from 'react';

const Textarea = ({ label, icon, error, required, className = "", ...props }) => {
    return (
        <div className="space-y-2.5">
            {label && (
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-neon-blue transition-colors">
                        {icon && <span className="opacity-50">{icon}</span>}
                        {label}
                        {required && <span className="text-neon-pink animate-pulse">*</span>}
                    </label>
                </div>
            )}

            <div className="relative group perspective-1000">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-blue/0 via-neon-blue/0 to-neon-blue/0 rounded-2xl group-focus-within:from-neon-blue/20 group-focus-within:via-neon-purple/20 group-focus-within:to-neon-pink/20 transition-all duration-500 blur-sm"></div>

                <textarea
                    {...props}
                    required={required}
                    className={`
                        relative w-full rounded-2xl bg-[#0d1117] border border-white/10 
                        px-5 py-4 min-h-[120px] resize-none
                        text-sm text-white placeholder:text-gray-700
                        focus:outline-none focus:border-neon-blue/50 focus:bg-[#0f141d]
                        transition-all duration-300 font-medium
                        shadow-inner shadow-black/40
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''} 
                        ${className}
                    `}
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 px-1 animate-fade-in">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    <p className="text-[10px] text-red-500 font-black italic uppercase tracking-widest">
                        Syntax_Error: {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Textarea;
