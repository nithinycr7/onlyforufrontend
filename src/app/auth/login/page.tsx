'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Dummy login logic
        router.push('/home');
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className={styles.title}>Welcome Back</h1>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                    <span className={styles.link} style={{ fontSize: '14px' }}>Forgot Password?</span>
                </div>

                <Button type="submit" fullWidth>Sign In</Button>
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <span
                        style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer' }}
                        onClick={() => router.push('/creator/onboarding')}
                    >
                        (Demo: Skip to Creator Onboarding)
                    </span>
                </div>
            </form>

            <div className={styles.divider}>OR</div>

            <Button variant="secondary" fullWidth>
                Continue with Google
            </Button>

            <div className={styles.footer}>
                Don&apos;t have an account? <span className={styles.link} onClick={() => router.push('/auth?role=creator')}>Sign Up</span>

            </div>
        </main>
    );
}
