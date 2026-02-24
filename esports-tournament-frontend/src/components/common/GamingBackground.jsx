import { motion } from 'framer-motion';

const GamingBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#050508]">
            {/* Base Grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #1e293b 1px, transparent 1px),
                        linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                }}
            />

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-blue/10 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -120, 120, 0],
                    y: [0, 80, -80, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-purple/10 rounded-full blur-[120px]"
            />

            {/* Moving Light Streaks */}
            <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ top: '-10%', left: `${20 * i}%`, opacity: 0 }}
                        animate={{
                            top: '110%',
                            opacity: [0, 0.3, 0],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "easeInOut"
                        }}
                        className="absolute w-px h-64 bg-gradient-to-b from-transparent via-neon-blue to-transparent shadow-[0_0_15px_#00f0ff]"
                    />
                ))}
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -200],
                            opacity: [0, 0.4, 0],
                            rotate: [0, 180]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 bg-neon-blue shadow-[0_0_5px_#00f0ff]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Scanline Effect */}
            <motion.div
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-white/5 z-10"
            />

            {/* Grain/Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default GamingBackground;
