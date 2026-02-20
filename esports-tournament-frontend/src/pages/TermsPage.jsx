import MainLayout from '../layouts/MainLayout';

const TermsPage = () => {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-6 py-16 text-gray-800 bg-white shadow-xl rounded-2xl my-10 border border-gray-200">
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Terms of Service</h1>
                    <p className="text-gray-500 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to <span className="font-bold text-gray-800">Esports Manager</span>. By accessing our platform, you agree to these Terms of Service. This platform manages sensitive competitive data, including tournament results, player identities, and match logs. Integrity and security are our top priorities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">2. Handling of Sensitive Data</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            As a Tournament Organizer or Participant, you acknowledge that you may have access to sensitive information, including but not limited to:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li><strong>Player Personal Information:</strong> Real names, email addresses, and game IDs (UIDs).</li>
                            <li><strong>Match Integrity Data:</strong> Anti-cheat logs, dispute evidence, and private lobby keys.</li>
                            <li><strong>Financial Information:</strong> Prize pool distribution details (if applicable).</li>
                        </ul>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            You agree strictly <strong>NOT</strong> to share, leak, or misuse this data. Unauthorized disclosure of private lobby keys or player personal data will result in immediate account termination and potential legal action.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">3. Competitive Integrity & Fair Play</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The integrity of esports relies on accurate data. You agree that:
                        </p>
                        <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-600">
                            <li>All match results submitted must be accurate and verifiable.</li>
                            <li>Falsifying scores or colluding to manipulate leaderboards is strictly prohibited.</li>
                            <li>Any attempt to reverse-engineer the scoring algorithm or access unauthorized API endpoints is a violation of these terms.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">4. Age Restriction (18+)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Due to the handling of competitive data and potential prize pool management, you must be <strong>18 years or older</strong> to use this service. By registering, you confirm you meet this age requirement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-neon-blue pl-4">5. User Accountability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You are responsible for all activity that occurs under your account. If you suspect your account credentials or sensitive tournament data (like API keys) have been compromised, you must notify us immediately.
                        </p>
                    </section>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
                        <p className="text-sm text-gray-500 text-center">
                            Questions about these terms? Contact our legal team at <a href="mailto:legal@esportsmanager.com" className="text-neon-blue font-bold hover:underline">legal@esportsmanager.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TermsPage;
