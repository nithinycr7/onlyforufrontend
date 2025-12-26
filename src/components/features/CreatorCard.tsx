'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './CreatorCard.module.css';
import { useRouter } from 'next/navigation';

interface CreatorCardProps {
    id: string;
    name: string;
    image: string; // URL
    profilePic: string; // URL
    niche: string;
    isVerified?: boolean;
    fans: number;
    price: number;
    bio: string;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
    id,
    name,
    image,
    profilePic,
    niche,
    isVerified,
    fans,
    price,
    bio
}) => {
    const router = useRouter();

    return (
        <div className={styles.card} onClick={() => router.push(`/creator/${id}`)}>
            <div className={styles.coverImage} style={{ backgroundImage: `url(${image})` }}>
                <div className={styles.nicheTag}>{niche}</div>
            </div>
            <div className={styles.content}>
                <div className={styles.profileRow}>
                    <div className={styles.profilePic} style={{ backgroundImage: `url(${profilePic})` }} />
                </div>

                <div className={styles.header}>
                    <h3 className={styles.name}>
                        {name}
                        {isVerified && <CheckCircle2 size={16} fill="var(--success)" color="#fff" style={{ marginLeft: 4 }} />}
                    </h3>
                </div>

                <p className={styles.bio}>{bio}</p>

                <div className={styles.stats}>
                    <span>{fans} fans</span>
                    <span className={styles.dot}>•</span>
                    <span>₹{price}/mo</span>
                </div>

                <Button variant="secondary" className={styles.cta} fullWidth>
                    View Profile
                </Button>
            </div>
        </div>
    );
};
