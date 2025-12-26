'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Phone, Mail } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    // Form selection state
    const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');

    // common state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone login state
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/access-token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            await login(response.data.access_token, response.data.refresh_token);

            const userRole = response.data.role?.toLowerCase();
            if (userRole === 'creator') {
                router.push('/profile');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Login failed');
            setLoading(false);
        }
    };

    const sendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length < 13) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const recaptchaContainer = document.getElementById('recaptcha-batch');
            if (!recaptchaContainer) throw new Error('reCAPTCHA container not found');

            const { RecaptchaVerifier } = await import('firebase/auth');
            const appVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                size: 'invisible',
            });

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
        } catch (error: any) {
            console.error('Firebase Error:', error);
            setError(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        if (!confirmationResult) return;

        setError('');
        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            const firebaseToken = await result.user.getIdToken();

            const response = await api.post('/auth/phone/verify', {
                firebase_token: firebaseToken,
                phone: phoneNumber,
            });

            await login(response.data.access_token, response.data.refresh_token);

            if (response.data.is_new_user) {
                router.push('/onboarding/basic-info');
            } else {
                router.push('/home');
            }
        } catch (error: any) {
            console.error('OTP Error:', error);
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (!value.startsWith('+91')) value = '+91';
        value = '+91' + value.slice(3).replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <h1 className={styles.brandTitle}>OnlyForU</h1>
                    <p className={styles.brandSubtitle}>Connect. Resolve. Engage.</p>
                </div>

                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeBtn} ${authMode === 'phone' ? styles.active : ''}`}
                        onClick={() => { setAuthMode('phone'); setError(''); }}
                    >
                        <Phone size={18} /> Phone
                    </button>
                    <button
                        className={`${styles.modeBtn} ${authMode === 'email' ? styles.active : ''}`}
                        onClick={() => { setAuthMode('email'); setError(''); }}
                    >
                        <Mail size={18} /> Email
                    </button>
                </div>

                {authMode === 'phone' ? (
                    <div className={styles.phoneSection}>
                        {step === 'phone' ? (
                            <form onSubmit={sendOTP} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        className={styles.input}
                                        placeholder="+91 00000 00000"
                                        disabled={loading}
                                    />
                                    <p className={styles.hint}>Verify with a quick OTP</p>
                                </div>
                                {error && <div className={styles.error}>{error}</div>}
                                <Button type="submit" fullWidth loading={loading} disabled={loading || phoneNumber.length < 13}>
                                    Send OTP
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={verifyOTP} className={styles.form}>
                                <div className={styles.otpInfo}>
                                    <p>Code sent to <strong>{phoneNumber}</strong></p>
                                    <button type="button" onClick={() => { setStep('phone'); setError(''); }} className={styles.link}>
                                        Change
                                    </button>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className={styles.input}
                                        placeholder="000 000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                {error && <div className={styles.error}>{error}</div>}
                                <Button type="submit" fullWidth loading={loading} disabled={loading || otp.length !== 6}>
                                    Verify & Login
                                </Button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className={styles.emailSection}>
                        <form onSubmit={handleEmailSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="creator@onlyforu.app"
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
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <Button type="submit" fullWidth loading={loading} disabled={loading}>
                                Access Dashboard
                            </Button>
                        </form>
                    </div>
                )}

                <div id="recaptcha-batch"></div>

                <div className={styles.footer}>
                    <p>By continuing, you agree to our Terms & Privacy Policy</p>
                    <div className={styles.creatorPromo}>
                        <span>New Creator?</span>
                        <button className={styles.link} onClick={() => router.push('/auth?role=creator')}>
                            Join OnlyForU
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
