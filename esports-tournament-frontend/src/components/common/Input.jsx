import React from 'react';

const Input = ({ label, icon, error, required, className = "", ...props }) => {
    return (
        <div className="space-y-2.5">
            {label && (
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-neon-blue transition-colors">
                        {icon && <span className="opacity-50">{icon}</span>}
                        {label}
                        {required && <span className="text-neon-pink animate-pulse">*</span>}
                    </label>
                    <span className="text-[8px] font-mono text-gray-700 tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity uppercase">Input_Validated</span>
                </div>
            )}

            <div className="relative group perspective-1000">
                {/* Background Glow Effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-blue/0 via-neon-blue/0 to-neon-blue/0 rounded-2xl group-focus-within:from-neon-blue/20 group-focus-within:via-neon-purple/20 group-focus-within:to-neon-pink/20 transition-all duration-500 blur-sm"></div>

                <input
                    {...props}
                    required={required}
                    autoComplete="off"
                    className={`
                        relative w-full rounded-2xl bg-[#0d1117] border border-white/10 
                        px-5 py-4
                        text-sm text-white placeholder:text-gray-700
                        focus:outline-none focus:border-neon-blue/50 focus:bg-[#0f141d]
                        transition-all duration-300 font-medium
                        shadow-inner shadow-black/40
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''} 
                        ${className}
                    `}
                />

                {/* Right side decoration */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <div className="w-1 h-3 bg-white/10 rounded-full group-focus-within:bg-neon-blue"></div>
                    <div className="w-1 h-2 bg-white/10 rounded-full"></div>
                </div>
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

export default Input;
