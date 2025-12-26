import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const classNames = [
        styles.badge,
        styles[variant],
        styles[size],
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classNames}>
            {children}
        </span>
    );
};
