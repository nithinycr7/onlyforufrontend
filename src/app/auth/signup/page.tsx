'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft } from 'lucide-react';
import styles from '../auth.module.css';

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'fan';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role === 'creator') {
            router.push('/creator/onboarding'); // Logic for creator flow
        } else {
            router.push('/home'); // Logic for fan
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className={styles.title}>
                    Sign up as a {role === 'creator' ? 'Creator' : 'Fan'}
                </h1>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <Input
                    label="Phone (Optional)"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                <div className={styles.checkboxContainer}>
                    <input type="checkbox" className={styles.checkbox} required />
                    <span>I am 18+ years old and agree to the <span className={styles.link}>Terms</span> & <span className={styles.link}>Privacy Policy</span></span>
                </div>

                <Button type="submit" fullWidth>Create Account</Button>
            </form>

            <div className={styles.divider}>OR</div>

            <Button variant="secondary" fullWidth>
                Continue with Google
            </Button>

            <div className={styles.footer}>
                Already have an account? <span className={styles.link} onClick={() => router.push('/auth/login')}>Sign In</span>
            </div>
        </main>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupContent />
        </Suspense>
    );
}
