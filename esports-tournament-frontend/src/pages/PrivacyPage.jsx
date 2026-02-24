import MainLayout from '../layouts/MainLayout';
import { Shield, Eye, Lock } from 'lucide-react';

const PrivacyPage = () => {
    return (
        
            <div className="max-w-4xl mx-auto px-6 py-16 text-gray-800 bg-white shadow-xl rounded-2xl my-10 border border-gray-200">
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Privacy Policy</h1>
                    <p className="text-gray-500 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-neon-blue">
                            <Shield className="w-8 h-8" />
                            1. How We Protect Your Sensitive Data
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We understand that competitive esports involves sensitive data. We collect minimal personal information and prioritize data encryption. The following is strictly protected:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li><strong>In-Game Identifiers:</strong> Player UIDs, IGNs, and regional server data are stored securely.</li>
                            <li><strong>Match Logs:</strong> Data uploaded for automated scoring (including anti-cheat logs) is encrypted and accessible only to authorized tournament administrators.</li>
                            <li><strong>Contact Information:</strong> Email addresses and Discord IDs used for prize distribution are never sold or shared.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-neon-purple">
                            <Eye className="w-8 h-8" />
                            2. Data Collection Usage
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            We collect data solely for the purpose of:
                        </p>
                        <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-600">
                            <li>Verifying player eligibility (age, region, rank).</li>
                            <li>Processing automated match results via API integration.</li>
                            <li>Generating public leaderboards and tournament brackets.</li>
                            <li>Detecting and investigating potential cheating or rule violations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-500">
                            <Lock className="w-8 h-8" />
                            3. Data Sharing & Third Parties
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            We do <strong>NOT</strong> sell your personal data. We only share specific data necessary for tournament operations:
                        </p>
                        <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-600">
                            <li><strong>Public Leaderboards:</strong> Your in-game name and team affiliation will be visible publicly on tournament pages.</li>
                            <li><strong>Anti-Cheat Partners:</strong> Only raw gameplay data (not personal contact info) may be shared with anti-cheat providers for verification.</li>
                            <li><strong>Payment Processors:</strong> Necessary financial data for prize payouts is handled directly by secure payment gateways (e.g., Stripe, PayPal), not us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">4. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You have the right to request deletion of your account and associated personal data at any time. However, anonymized match statistics may be retained for historical tournament records.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">5. Security Incident Response</h2>
                        <p className="text-gray-600 leading-relaxed">
                            In the unlikely event of a data breach compromising sensitive player information, we will notify affected users within 72 hours via their registered email address.
                        </p>
                    </section>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
                        <p className="text-sm text-gray-500 text-center">
                            For privacy concerns or data deletion requests, contact our Data Protection Officer at <a href="mailto:privacy@esportsmanager.com" className="text-neon-blue font-bold hover:underline">privacy@esportsmanager.com</a>
                        </p>
                    </div>
                </div>
            </div>
    );
};

export default PrivacyPage;
