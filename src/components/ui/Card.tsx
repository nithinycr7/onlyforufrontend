import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick,
    padding = 'md',
    ...props
}) => {
    const classNames = [
        styles.card,
        hover && styles.hover,
        onClick && styles.clickable,
        styles[`padding-${padding}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames} onClick={onClick} {...props}>
            {children}
        </div>
    );
};
