'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Zap, Users, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<'creator' | 'fan'>('fan');

    // Handle initial role from query param
    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'creator' || roleParam === 'fan') {
            setRole(roleParam as 'creator' | 'fan');
        }
    }, [searchParams]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', {
                email,
                password,
                full_name: fullName,
                role,
            });

            router.push('/auth?message=Account created! Please login.');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </button>

                <div className={styles.header}>
                    <h1 className={styles.title}>Join OnlyForU</h1>
                    <p className={styles.subtitle}>Start your journey with us</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Only show role selection if not pre-selected via URL */}
                    {!searchParams.get('role') && (
                        <div className={styles.roleSelection}>
                            <p className={styles.label}>Register as:</p>
                            <div className={styles.roleGrid}>
                                <button
                                    type="button"
                                    onClick={() => setRole('fan')}
                                    className={`${styles.roleCard} ${role === 'fan' ? styles.selected : ''}`}
                                >
                                    <Users size={24} />
                                    <span>Fan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('creator')}
                                    className={`${styles.roleCard} ${role === 'creator' ? styles.selected : ''}`}
                                >
                                    <Zap size={24} />
                                    <span>Creator</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {searchParams.get('role') && (
                        <div className={styles.roleBadge}>
                            Registering as <strong>{role === 'creator' ? 'Creator' : 'Fan'}</strong>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="John Doe"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="8+ characters"
                            disabled={loading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <Button type="submit" fullWidth loading={loading} disabled={loading}>
                        Create Account
                    </Button>

                    <div className={styles.footer}>
                        <p>
                            Already have an account?{' '}
                            <button type="button" onClick={() => router.push('/auth')} className={styles.link}>
                                Log in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
