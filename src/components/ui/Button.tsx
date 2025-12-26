import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean; // Keep backward compatibility or map to loading
    loading?: boolean;   // New prop
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, loading, fullWidth, icon, children, disabled, ...props }, ref) => {

        const isBusy = isLoading || loading;

        const classNames = [
            styles.button,
            styles[variant],
            styles[size],
            fullWidth && styles.fullWidth,
            isBusy && styles.loading,
            className
        ].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                className={classNames}
                disabled={disabled || isBusy}
                {...props}
            >
                {isBusy && (
                    <span className={styles.spinner}>
                        <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                        </svg>
                    </span>
                )}
                {!isBusy && icon && <span className={styles.icon}>{icon}</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
