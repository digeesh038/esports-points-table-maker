import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

// ── Hard-fail if keys are missing ─────────────────────────────────────────────
// Never allow the app to run with blank/placeholder credentials.
if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.startsWith('rzp_test_your') || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === 'your_key_secret') {
    console.error('');
    console.error('══════════════════════════════════════════════════════════');
    console.error('  🚫  FATAL: Razorpay API keys are not configured!');
    console.error('');
    console.error('  Add the following to your .env file:');
    console.error('    RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX');
    console.error('    RAZORPAY_KEY_SECRET=your_real_key_secret');
    console.error('');
    console.error('  Get your keys from: https://dashboard.razorpay.com/app/keys');
    console.error('══════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
}

const razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

console.log(`✅ Razorpay initialized | Mode: ${RAZORPAY_KEY_ID.startsWith('rzp_live') ? '🟢 LIVE' : '🟡 TEST'}`);

export default razorpayClient;
