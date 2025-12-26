import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './TierCard.module.css';

interface TierCardProps {
    title: string;
    subtitle?: string; // Outcome framing
    price: number;
    features: string[];
    isPopular?: boolean;
    onSubscribe: () => void;
    buttonLabel?: string;
    period?: string;
}

export const TierCard: React.FC<TierCardProps> = ({
    title,
    subtitle,
    price,
    features,
    isPopular,
    onSubscribe,
    buttonLabel = 'Book Now',
    period = ''
}) => {
    return (
        <div className={`${styles.card} ${isPopular ? styles.popular : ''}`}>
            {isPopular && <div className={styles.badge}>Most Popular</div>}

            <div style={{ marginBottom: 12 }}>
                <h3 className={styles.title}>{title}</h3>
                {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>}
            </div>
            <div className={styles.priceRow}>
                <span className={styles.currency}>₹</span>
                <span className={styles.price}>{price}</span>
                {period && <span className={styles.period}>{period}</span>}
            </div>

            <ul className={styles.features}>
                {features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                        <Check size={16} className={styles.checkIcon} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                variant={isPopular ? 'primary' : 'primary'}
                fullWidth
                onClick={onSubscribe}
            >
                {buttonLabel}
            </Button>
        </div>
    );
};
