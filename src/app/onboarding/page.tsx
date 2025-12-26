'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const STEPS = [
    {
        icon: "🥘",
        title: "Your favorite creators, just a message away",
        desc: "Get exclusive content, personalized replies, and behind-the-scenes access from Telugu creators you love."
    },
    {
        icon: "✅",
        title: "Verified Creators Only",
        desc: "We verify every creator so you can subscribe with confidence. No fakes, just real connections."
    },
    {
        icon: "₹",
        title: "Affordable Access",
        desc: "Join creator clubs starting from just ₹49/month. Support your favorites without breaking the bank."
    },
    {
        // Step 4 is Role Selection
        isRoleSelection: true,
        title: "I want to...",
    }
];

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const router = useRouter();

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        setStep(STEPS.length - 1); // Go to role selection
    };

    const handleRoleSelect = (role: 'creator' | 'fan') => {
        // Navigate to Auth with role param
        router.push(`/auth?role=${role}`);
    };

    const currentStepData = STEPS[step];

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                {step < STEPS.length - 1 && (
                    <Button variant="ghost" onClick={handleSkip}>
                        Skip
                    </Button>
                )}
                {step === STEPS.length - 1 && (
                    <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                        Sign In
                    </Button>
                )}
            </header>

            <div className={styles.content} key={step}>
                {currentStepData.isRoleSelection ? (
                    <>
                        <h1 className={styles.title}>{currentStepData.title}</h1>
                        <div className={styles.roleContainer}>
                            {/* Creator Card */}
                            <div className={styles.roleCard} onClick={() => handleRoleSelect('creator')}>
                                <div className={styles.roleHeader}>
                                    <div className={styles.roleIcon}>👤</div>
                                </div>
                                <div className={styles.roleTitle}>Create & Earn</div>
                                <div className={styles.roleDesc}>Share exclusive content with fans and earn monthly income.</div>
                                <Button variant="primary" fullWidth>Start Creating <ArrowRight size={16} /></Button>
                            </div>

                            {/* Fan Card */}
                            <div className={styles.roleCard} onClick={() => handleRoleSelect('fan')}>
                                <div className={styles.roleHeader}>
                                    <div className={styles.roleIcon}>⭐</div>
                                </div>
                                <div className={styles.roleTitle}>Explore Creators</div>
                                <div className={styles.roleDesc}>Subscribe to your favorite talents and get exclusive access.</div>
                                <Button variant="secondary" fullWidth>Discover <ArrowRight size={16} /></Button>
                            </div>
                        </div>
                        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                            Already have an account? <span onClick={() => router.push('/auth/login')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign In</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.illustration}>
                            {currentStepData.icon}
                        </div>
                        <h1 className={styles.title}>{currentStepData.title}</h1>
                        <p className={styles.description}>{currentStepData.desc}</p>
                    </>
                )}
            </div>

            <div className={styles.footer}>
                {!currentStepData.isRoleSelection && (
                    <>
                        <div className={styles.dots}>
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                                />
                            ))}
                        </div>
                        <Button variant="primary" fullWidth onClick={handleNext}>
                            Get Started <ArrowRight size={18} />
                        </Button>
                    </>
                )}
            </div>
        </main>
    );
}
