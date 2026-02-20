/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                /* REQUIRED for @apply border-border */
                border: "#2a2f45",

                /* Dark theme colors */
                "dark-950": "#050508",
                "dark-900": "#0a0a0f",
                "dark-800": "#12121e",
                "dark-700": "#1a1a2e",
                "dark-600": "#2a2f45",

                /* Neon accent colors */
                "neon-blue": "#00f0ff",
                "neon-purple": "#a855f7",
                "neon-pink": "#ec4899",
                "neon-green": "#39ff14",

                /* Your existing primary palette (kept) */
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                },
            },

            /* Neon shadows used in buttons & hover effects */
            boxShadow: {
                "neon-blue": "0 0 20px rgba(0, 240, 255, 0.5)",
                "neon-purple": "0 0 20px rgba(168, 85, 247, 0.5)",
                "neon-pink": "0 0 20px rgba(236, 72, 153, 0.5)",
            },

            /* Optional animations (safe to keep) */
            animation: {
                shimmer: "shimmer 2s infinite linear",
                "bounce-slow": "bounce 3s infinite",
                "load-progress": "load 2s ease-in-out infinite",
            },

            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                load: {
                    "0%": { width: "0%" },
                    "50%": { width: "100%" },
                    "100%": { width: "0%" },
                },
            },
        },
    },
    plugins: [],
};
