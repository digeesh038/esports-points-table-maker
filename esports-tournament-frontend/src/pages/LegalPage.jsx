import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, scaleControl } from 'lucide-react';
import GamingBackground from '../components/common/GamingBackground';

const LegalPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] relative overflow-hidden py-20 px-6">
            <GamingBackground />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex mb-6 p-4 rounded-2xl bg-neon-blue/10 border border-neon-blue/20"
                    >
                        <Shield className="w-10 h-10 text-neon-blue" />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase mb-4">
                        Legal <span className="text-neon-blue">Protocols</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                        System Governance // Terms & Privacy v4.0.2
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Terms of Service Section */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-12"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <FileText className="w-6 h-6 text-neon-blue" />
                            <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Terms of Service</h2>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-400 space-y-6 text-sm md:text-base leading-relaxed">
                            <p>
                                Welcome to the Tournament Console. By accessing our platform, you agree to abide by these Strategic Protocols.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">1. Operational Conduct</h3>
                            <p>
                                Users must maintain professional conduct during all tournament phases. Harassment, cheating, or exploitation of system vulnerabilities is strictly prohibited and will result in immediate entity termination.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">2. Intellectual Property</h3>
                            <p>
                                All assets, logos, and proprietary scanning algorithms are the sole property of the Platform. Unauthorized replication of system architecture is a breach of federal digital laws.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">3. Tournament Authority</h3>
                            <p>
                                Platform administrators and organization leaders hold final authority on match outcomes and disciplinary actions. Decisions are final once committed to the ledger.
                            </p>
                        </div>
                    </motion.section>

                    {/* Privacy Policy Section */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-12"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <Lock className="w-6 h-6 text-neon-purple" />
                            <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Privacy Policy</h2>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-400 space-y-6 text-sm md:text-base leading-relaxed">
                            <p>
                                Your data security is our primary directive. We encrypt all operative telemetry.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">1. Data Collection</h3>
                            <p>
                                we collect essential identification data (Google ID, Profile Meta) to facilitate secure link-ups and competitive tracking.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">2. Information Usage</h3>
                            <p>
                                Statistics and performance telemetry are used solely for leaderboard generation and skill-level synchronization throughout the network.
                            </p>
                            <h3 className="text-white font-bold uppercase mt-8 text-sm tracking-wider">3. Data Protection</h3>
                            <p>
                                All sensitive information is stored in deep-cold encrypted repositories. We do not sell operative data to third-party syndicates.
                            </p>
                        </div>
                    </motion.section>
                </div>

                {/* Footer Status */}
                <div className="mt-16 text-center text-[10px] font-mono text-gray-700 uppercase tracking-[0.5em]">
                    End of Protocol // Secure Access Active
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
