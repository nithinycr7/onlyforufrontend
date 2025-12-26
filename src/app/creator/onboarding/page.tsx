'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, X } from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

const STEPS = ['Profile'];

export default function CreatorOnboarding() {
    const router = useRouter();

    // Check authentication manually
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const [currentStep, setCurrentStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        niche: '',
        language: 'telugu',
        youtube: '',
        instagram: '',
        profile_image_url: ''
    });

    const handleSubmit = async () => {
        try {
            const socials: any = {};
            if (formData.youtube) socials.youtube = formData.youtube;
            if (formData.instagram) socials.instagram = formData.instagram;

            const payload = {
                display_name: formData.displayName,
                bio: formData.bio || "Creator on OnlyForYou",
                niche: formData.niche || 'General',
                language: formData.language.toLowerCase(),
                social_links: socials,
                profile_image_url: formData.profile_image_url,
                packages: [] // No packages during onboarding
            };

            // Get token from localStorage
            const token = localStorage.getItem('access_token');

            await api.post('/creators/onboard', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSubmitted(true);
            // Redirect to dashboard
            setTimeout(() => router.push('/creator-dashboard'), 1500);
        } catch (err) {
            console.error("Onboarding failed:", err);
            alert("Failed to create profile. Please try again.");
        }
    };



    if (submitted) {
        return (
            <main className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h1>Profile Created!</h1>
                    <p>Your creator profile has been created successfully.</p>
                    <p style={{ marginTop: '16px' }}>Redirecting to your dashboard...</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                {/* Progress Steps */}
                <div className={styles.steps}>
                    {STEPS.map((step, idx) => (
                        <div key={idx} className={`${styles.step} ${idx <= currentStep ? styles.stepActive : ''}`}>
                            <div className={styles.stepNumber}>{idx + 1}</div>
                            <span className={styles.stepLabel}>{step}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    {/* Step 0: Profile */}
                    {currentStep === 0 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Create Your Profile</h2>
                            <p className={styles.stepSubtitle}>Tell us about yourself</p>

                            <AvatarUpload
                                onUploadComplete={(url) => setFormData({ ...formData, profile_image_url: url })}
                            />

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Display Name *</label>
                                <Input
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    placeholder="Your creator name"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Bio *</label>
                                <textarea
                                    className={styles.textarea}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell your audience about yourself..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Niche *</label>
                                <Input
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    placeholder="e.g., Comedy, Education, Cooking"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Language</label>
                                <select
                                    className={styles.select}
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option value="telugu">Telugu</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="tamil">Tamil</option>
                                    <option value="english">English</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>YouTube Channel (optional)</label>
                                <Input
                                    value={formData.youtube}
                                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                                    placeholder="https://youtube.com/@yourchannel"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Instagram (optional)</label>
                                <Input
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    placeholder="https://instagram.com/yourhandle"
                                />
                            </div>
                        </div>
                    )}



                    {/* Navigation Buttons */}
                    <div className={styles.navigation}>
                        <Button type="submit" fullWidth>
                            Complete Onboarding
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
