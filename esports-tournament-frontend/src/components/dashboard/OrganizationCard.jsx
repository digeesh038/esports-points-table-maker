import Card from '../common/Card';
import { Building2, Globe, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OrganizationCard = ({ org, onDelete }) => {
    const { isGuest } = useAuth();

    return (
        <div className="card-interactive min-h-[220px] flex flex-col group h-full">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-all pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-dark-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-blue/30 overflow-hidden shadow-inner transition-all duration-500">
                        {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <Building2 className="w-8 h-8 text-neon-blue opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                        )}
                    </div>
                    {!isGuest && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete(org.id);
                            }}
                            className="p-2.5 bg-dark-900 border border-white/5 hover:border-red-500/50 text-gray-600 hover:text-red-500 rounded-xl transition-all active:scale-95 group/del"
                            title="Delete Organization"
                        >
                            <Trash2 className="w-4 h-4 group-hover/del:animate-pulse" />
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-black italic tracking-tighter text-white group-hover:text-neon-blue transition-all duration-300 mb-2 truncate">
                        {org.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium mb-4 h-10 overflow-hidden">
                        {org.description || 'System data: No descriptive metadata available for this organization unit.'}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col xs:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                        {org.website && (
                            <a
                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-neon-blue flex items-center transition-colors"
                            >
                                <Globe className="w-3 h-3 mr-2" />
                                WEB_PORTAL
                            </a>
                        )}
                    </div>
                    <Link
                        to={`/dashboard/organizations/${org.id}`}
                        className="w-full xs:w-auto flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue group-hover:text-white transition-all bg-neon-blue/5 h-10 md:h-8 px-6 md:px-4 rounded-xl md:rounded-lg border border-neon-blue/20 hover:bg-neon-blue"
                    >
                        MANAGE
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrganizationCard;
