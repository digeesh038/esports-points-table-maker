import { motion } from 'framer-motion';
import clsx from 'clsx';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const baseStyles = 'font-bold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-neon-blue hover:scale-105 active:scale-95',
        secondary: 'bg-dark-700 text-white border border-neon-blue hover:bg-dark-600 hover:shadow-neon-blue',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-neon-pink hover:scale-105 active:scale-95',
        ghost: 'bg-transparent text-neon-blue hover:bg-dark-700 border border-transparent hover:border-neon-blue',
        outline: 'bg-transparent text-white border-2 border-neon-blue hover:bg-neon-blue/10',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            {...props}
        >
            {loading && (
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            {!loading && children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </motion.button>
    );
};

export default Button;