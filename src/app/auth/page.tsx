'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Phone, User, Briefcase } from 'lucide-react';
import styles from './page.module.css';

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    // Role selection state (fan or creator)
    const [role, setRole] = useState<'fan' | 'creator'>('fan');

    // Phone auth state
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pre-select role from URL parameter
    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'creator' || roleParam === 'fan') {
            setRole(roleParam);
        }
    }, [searchParams]);

    const sendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length < 13) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const recaptchaContainer = document.getElementById('recaptcha-container');
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
            // Verify OTP with Firebase
            const userCredential = await confirmationResult.confirm(otp);
            const firebaseToken = await userCredential.user.getIdToken();

            // Send to backend with selected role
            const response = await api.post('/auth/phone/verify', {
                firebase_token: firebaseToken,
                phone: phoneNumber,
                role: role, // Send selected role
            });

            // Login with JWT tokens
            await login(response.data.access_token, response.data.refresh_token);

            // Route based on whether user is new and their role
            const isNewUser = response.data.is_new_user;
            const userRole = response.data.role?.toLowerCase();

            if (isNewUser) {
                // New users go to onboarding
                if (userRole === 'creator') {
                    router.push('/creator/onboarding');
                } else {
                    router.push('/onboarding/fan');
                }
            } else {
                // Returning users go to their dashboard
                if (userRole === 'creator') {
                    router.push('/creator/dashboard');
                } else {
                    router.push('/home');
                }
            }
        } catch (error: any) {
            console.error('OTP Verification Error:', error);
            setError(error.response?.data?.detail || 'Invalid OTP');
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.authCard}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>OnlyForU</h1>
                    <p className={styles.subtitle}>Connect. Resolve. Engage.</p>
                </div>

                {/* Role Tabs */}
                <div className={styles.roleTabs}>
                    <button
                        type="button"
                        className={`${styles.roleTab} ${role === 'fan' ? styles.activeTab : ''}`}
                        onClick={() => setRole('fan')}
                    >
                        <User size={20} />
                        <span>Join as User</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.roleTab} ${role === 'creator' ? styles.activeTab : ''}`}
                        onClick={() => setRole('creator')}
                    >
                        <Briefcase size={20} />
                        <span>Join as Creator</span>
                    </button>
                </div>

                {/* Phone Input Step */}
                {step === 'phone' && (
                    <form onSubmit={sendOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="phone" className={styles.label}>
                                Mobile Number
                            </label>
                            <div className={styles.phoneInput}>
                                <Phone size={20} className={styles.phoneIcon} />
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <Button type="submit" fullWidth loading={loading}>
                            Send OTP
                        </Button>

                        <p className={styles.hint}>Verify with a quick OTP</p>
                    </form>
                )}

                {/* OTP Verification Step */}
                {step === 'otp' && (
                    <form onSubmit={verifyOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="otp" className={styles.label}>
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className={styles.input}
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <Button type="submit" fullWidth loading={loading}>
                            Verify & Continue
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('phone');
                                setOtp('');
                                setError('');
                            }}
                            className={styles.backButton}
                        >
                            ← Change Number
                        </button>
                    </form>
                )}

                {/* reCAPTCHA container */}
                <div id="recaptcha-container"></div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.terms}>
                        By continuing, you agree to our{' '}
                        <a href="/terms" className={styles.link}>Terms</a> &{' '}
                        <a href="/privacy" className={styles.link}>Privacy Policy</a>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPageContent />
        </Suspense>
    );
}
