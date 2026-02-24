import { Shield, Lock, FileText, Eye, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LegalPage = () => {
    return (
        <div className="min-h-screen py-20 px-4 md:px-8 relative overflow-hidden bg-[#050508]">
            {/* Global Ornaments (Inherited look) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '100px 100px'
                    }}
                />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="mb-16">
                    <Link to="/login" className="inline-flex items-center gap-2 text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] mb-8 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Terminal
                    </Link>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-neon-blue/40 via-transparent to-transparent" />
                        <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.4em] opacity-60">
                            Central Intelligence // Legal
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                        <span className="text-white">LEGAL</span> <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-blue to-neon-purple drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">PROTOCOLS</span>
                    </h1>
                    <p className="text-gray-500 mt-6 text-sm md:text-base font-medium max-w-2xl border-l-2 border-neon-blue/30 pl-4 py-1">
                        Last Synchronization: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sticky Side Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6">Navigation</h4>
                            <a href="#terms" className="block p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-neon-blue/30 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                                01. Terms of Service
                            </a>
                            <a href="#privacy" className="block p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-neon-purple/30 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                                02. Privacy Policy
                            </a>
                            <div className="pt-8">
                                <div className="p-6 rounded-3xl bg-neon-blue/5 border border-neon-blue/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-4 h-4 text-neon-blue" />
                                        <span className="text-[9px] font-black text-neon-blue uppercase tracking-widest">Security Verified</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        All data processing pipelines are encrypted and compliant with global esports standards.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-20">
                        {/* Terms Section */}
                        <section id="terms" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-neon-blue/10 border border-neon-blue/20 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-neon-blue" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                                    Terms of <span className="text-neon-blue">Service</span>
                                </h2>
                            </div>

                            <div className="bg-[#0d0d12]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 md:p-12 space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-blue opacity-50 font-mono text-sm">01.</span> Introduction
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        Welcome to <span className="font-bold text-white">Tournament Console</span>. By accessing our platform, you agree to these Terms of Service. This platform manages sensitive competitive data, including tournament results, player identities, and match logs. Integrity and security are our top priorities.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-blue opacity-50 font-mono text-sm">02.</span> Handling of Sensitive Data
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        As a Tournament Organizer or Participant, you acknowledge that you may have access to sensitive information, including but not limited to:
                                    </p>
                                    <ul className="space-y-4">
                                        {[
                                            { label: 'Player Personal Information', desc: 'Real names, email addresses, and game IDs (UIDs).' },
                                            { label: 'Match Integrity Data', desc: 'Anti-cheat logs, dispute evidence, and private lobby keys.' },
                                            { label: 'Financial Information', desc: 'Prize pool distribution details (if applicable).' }
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <Zap className="w-4 h-4 text-neon-blue shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{item.label}</p>
                                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-gray-500 text-xs italic bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                        Strict Protocol: Unauthorized disclosure of private lobby keys or player personal data will result in immediate account termination and potential legal action.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-blue opacity-50 font-mono text-sm">03.</span> Competitive Integrity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                All match results submitted must be accurate and verifiable. Falsifying scores is strictly prohibited.
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                Any attempt to reverse-engineer scoring or access unauthorized API nodes is a violation of protocol.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-blue opacity-50 font-mono text-sm">04.</span> Age Requirement (18+)
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        Due to the handling of competitive data and potential prize pool management, you must be <span className="text-white font-bold">18 years or older</span> to use this service. By registering, you confirm you meet this age requirement.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Privacy Section */}
                        <section id="privacy" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/20 rounded-xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-neon-purple" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                                    Privacy <span className="text-neon-purple">Policy</span>
                                </h2>
                            </div>

                            <div className="bg-[#0d0d12]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 md:p-12 space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-purple opacity-50 font-mono text-sm">01.</span> Data Protection
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        We understand that competitive esports involves sensitive data. We collect minimal personal information and prioritize data encryption. In-game identifiers, match logs, and contact info are strictly protected.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-purple opacity-50 font-mono text-sm">02.</span> Collection Usage
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            'Verifying player eligibility (age, region, rank).',
                                            'Processing automated match results via API integration.',
                                            'Generating public leaderboards and tournament brackets.',
                                            'Detecting and investigating potential rule violations.'
                                        ].map((text, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                                                <div className="w-1 h-1 rounded-full bg-neon-purple" />
                                                {text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                        <span className="text-neon-purple opacity-50 font-mono text-sm">03.</span> Third Party Sharing
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                        We do <span className="text-white font-bold underline decoration-neon-purple underline-offset-4">NOT</span> sell your personal data. We only share match statistics for public leaderboards and necessary data with anti-cheat partners or payment processors for prize verification.
                                    </p>

                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
                                        <Eye className="w-8 h-8 text-neon-purple mx-auto mb-4 opacity-40" />
                                        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                                            Your in-game name and team affiliation will be visible publicly on tournament pages as part of the competitive record.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em] text-center">
                                        For data deletion requests: <a href="mailto:privacy@tournamentconsole.com" className="text-neon-purple hover:underline">privacy@tournamentconsole.com</a>
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
