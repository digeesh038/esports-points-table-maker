/**
 * Dynamically load the Razorpay Checkout SDK.
 * Safe to call multiple times — will only add script once.
 * Returns true if SDK loaded, false on network error.
 */
export const loadRazorpay = () => {
    // Already loaded
    if (window.Razorpay) return Promise.resolve(true);

    // Already injected but not yet loaded — wait for it
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
        return new Promise((resolve) => {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
        });
    }

    // Inject fresh
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error('Razorpay SDK failed to load — check network connection');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};
