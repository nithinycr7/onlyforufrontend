'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import styles from './page.module.css';

export default function BasicInfoPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.put('/auth/me', {
                full_name: name,
                email: email
            });

            // After capturing info, redirect to home
            router.push('/home');
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome to OnlyForU! 🚀</h1>
                <p className={styles.subtitle}>
                    Just one last step! Enter your details to complete your profile.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            placeholder="e.g. Nithin Kumar"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <Button type="submit" fullWidth size="lg" loading={loading} disabled={loading}>
                        Complete Profile
                    </Button>
                </form>
            </div>
        </main>
    );
}
