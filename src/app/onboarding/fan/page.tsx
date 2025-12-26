'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { User, Mail } from 'lucide-react';
import styles from './page.module.css';

export default function FanOnboardingPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setError('Please enter your name');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Update user profile
            await api.put('/auth/me', {
                full_name: fullName,
                email: email || undefined, // Only send if provided
            });

            // Redirect to home
            router.push('/home');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to update profile');
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.onboardingCard}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <User size={48} className={styles.icon} />
                    </div>
                    <h1 className={styles.title}>Welcome to OnlyForU!</h1>
                    <p className={styles.subtitle}>
                        Let's set up your profile to get started
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>
                            Full Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email <span className={styles.optional}>(Optional)</span>
                        </label>
                        <div className={styles.emailInput}>
                            <Mail size={20} className={styles.emailIcon} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className={styles.input}
                            />
                        </div>
                        <p className={styles.hint}>
                            We'll use this for important notifications
                        </p>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <Button type="submit" fullWidth loading={loading}>
                        Continue to Home
                    </Button>
                </form>
            </div>
        </main>
    );
}
