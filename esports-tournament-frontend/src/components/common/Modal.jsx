import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
            {/* Background overlay with high-end blur */}
            <div
                className="fixed inset-0 bg-[#02040a]/90 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal panel with cyberpunk aesthetics */}
            <div className="relative inline-block align-bottom bg-[#0a0c10] border border-white/10 rounded-[2rem] text-left shadow-[0_0_80px_rgba(0,0,0,0.8)] transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full overflow-hidden animate-fade-in">

                {/* Decorative neon bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_15px_rgba(0,183,255,0.5)]"></div>

                {/* Header with technical aesthetic */}
                <div className="px-8 py-7 border-b border-white/5 bg-[#0d1117]/80 flex items-center justify-between relative backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,183,255,0.4)]"></div>
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-[0.15em]">
                                {title}
                            </h3>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 p-2.5 rounded-2xl transition-all border border-transparent hover:border-red-500/30 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Content area */}
                <div className="custom-scrollbar overflow-y-auto max-h-[85vh] bg-gradient-to-b from-[#0a0c10] to-[#04060b]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
