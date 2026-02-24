import Card from '../common/Card';
import { Building2, Globe, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OrganizationCard = ({ org, onDelete }) => {
    const { isGuest } = useAuth();

    return (
        <div className="group relative">
            {/* Action Bar Overlay (Hidden by default, shows on hover) */}
            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                {!isGuest && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete(org.id);
                        }}
                        className="p-3 bg-red-500/10 backdrop-blur-md border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all active:scale-95 shadow-lg"
                        title="TERMINATE_ENTITY"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="bg-[#0d0d12]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden transition-all duration-700 hover:border-neon-blue/40 hover:shadow-[0_20px_60px_-20px_rgba(0,240,255,0.15)] group">
                {/* Decorative Grid Trace */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-dark-950 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-neon-blue/50 overflow-hidden shadow-2xl transition-all duration-700 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10" />
                        ) : (
                            <Building2 className="w-10 h-10 text-neon-blue opacity-50 group-hover:opacity-100 transition-opacity duration-700 relative z-10" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_#00f0ff]" />
                            <span className="text-[9px] font-mono text-neon-blue font-bold uppercase tracking-[0.3em]">Verified_Entity</span>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-neon-blue transition-all duration-500 truncate leading-none">
                            {org.name}
                        </h3>
                    </div>
                </div>

                <div className="flex-1 mb-8">
                    <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        {org.description || 'System data: No descriptive metadata encrypted for this organization unit.'}
                    </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        {org.website && (
                            <a
                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-neon-blue hover:border-neon-blue/40 transition-all"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    <Link
                        to={`/dashboard/organizations/${org.id}`}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 hover:bg-neon-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] px-6 py-3.5 rounded-2xl border border-white/10 hover:border-neon-blue transition-all duration-500"
                    >
                        Launch Console
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Glow Effect */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neon-blue/5 blur-[100px] group-hover:bg-neon-blue/10 transition-all duration-700" />
            </div>
        </div>
    );
};

export default OrganizationCard;
