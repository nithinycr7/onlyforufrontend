'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, X } from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

const STEPS = ['Profile', 'Services'];

interface CreatorSettingsProps {
    embedded?: boolean;
    onSaveComplete?: () => void;
}

export default function CreatorSettings({ embedded = false, onSaveComplete }: CreatorSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        niche: '',
        language: 'telugu',
        youtube: '',
        instagram: '',
        profile_image_url: '',
        packages: [] as any[]
    });

    // Check authentication and load profile
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token && !embedded) {
            router.push('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                const response = await api.get('/creators/me');
                const profile = response.data;

                setFormData({
                    displayName: profile.display_name || '',
                    bio: profile.bio || '',
                    niche: profile.niche || '',
                    language: profile.language || 'telugu',
                    youtube: profile.social_links?.youtube || '',
                    instagram: profile.social_links?.instagram || '',
                    profile_image_url: profile.profile_image_url || '',
                    packages: profile.packages?.filter((p: any) => p.is_active).map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        price: p.price_inr,
                        desc: p.subtitle || '',
                        active: true,
                        isExisting: true
                    })) || []
                });
            } catch (err) {
                console.error('Failed to load profile:', err);
                if (!embedded) {
                    alert('Failed to load profile. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router, embedded]);

    const handleSave = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setSaving(true);
            try {
                const socials: any = {};
                if (formData.youtube) socials.youtube = formData.youtube;
                if (formData.instagram) socials.instagram = formData.instagram;

                // Update profile
                await api.put('/creators/profile', {
                    display_name: formData.displayName,
                    bio: formData.bio || "Creator on FansFunFoffer",
                    niche: formData.niche || 'General',
                    language: formData.language.toLowerCase(),
                    social_links: socials,
                    profile_image_url: formData.profile_image_url,
                    packages: []
                });

                // Handle package updates
                for (const pkg of formData.packages) {
                    const packageData = {
                        title: pkg.title,
                        subtitle: pkg.desc,
                        price_inr: parseFloat(pkg.price as any),
                        package_type: 'consultation',
                        features: []
                    };

                    if (pkg.isExisting) {
                        await api.put(`/creators/packages/${pkg.id}`, packageData);
                    } else {
                        await api.post('/creators/packages', packageData);
                    }
                }

                setSaved(true);

                if (onSaveComplete) {
                    onSaveComplete();
                } else {
                    setTimeout(() => {
                        if (embedded) {
                            window.location.reload();
                        } else {
                            router.push('/creator-dashboard');
                        }
                    }, 2000);
                }
            } catch (err) {
                console.error("Save failed:", err);
                alert("Failed to save changes. Please try again.");
            } finally {
                setSaving(false);
            }
        }
    };

    const addPackage = () => {
        const newId = Date.now();
        setFormData({
            ...formData,
            packages: [...formData.packages, {
                id: newId,
                title: '',
                price: 0,
                desc: '',
                active: true,
                isExisting: false
            }]
        });
    };

    const removePackage = async (id: number | string) => {
        const pkg = formData.packages.find(p => p.id === id);

        if (pkg?.isExisting) {
            try {
                await api.delete(`/creators/packages/${id}`);
            } catch (err) {
                console.error('Failed to delete package:', err);
                alert('Failed to delete package');
                return;
            }
        }

        setFormData({
            ...formData,
            packages: formData.packages.filter(p => p.id !== id)
        });
    };

    const updatePackage = (id: number | string, field: string, value: any) => {
        setFormData({
            ...formData,
            packages: formData.packages.map(p => p.id === id ? { ...p, [field]: value } : p)
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (saved) {
        return (
            <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h1>Profile Updated!</h1>
                <p>Your changes have been saved successfully.</p>
                {!embedded && <p style={{ marginTop: '16px' }}>Redirecting...</p>}
            </div>
        );
    }

    const content = (
        <>
            {/* Progress Steps */}
            <div className={styles.steps}>
                {STEPS.map((step, idx) => (
                    <div key={idx} className={`${styles.step} ${idx <= currentStep ? styles.stepActive : ''}`}>
                        <div className={styles.stepNumber}>{idx + 1}</div>
                        <span className={styles.stepLabel}>{step}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {/* Step 0: Profile */}
                {currentStep === 0 && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Edit Your Profile</h2>
                        <p className={styles.stepSubtitle}>Update your creator information</p>

                        <AvatarUpload
                            initialImage={formData.profile_image_url}
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

                {/* Step 1: Packages */}
                {currentStep === 1 && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Manage Your Services</h2>
                        <p className={styles.stepSubtitle}>Add, edit, or remove your service offerings</p>

                        {/* Link to Detailed Service Creation */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            color: 'white'
                        }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Create Detailed Services</h3>
                            <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: '14px' }}>
                                Use our comprehensive service creation form with response modes, follow-ups, SLA settings, and more!
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/creator-dashboard/services/create')}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                → Go to Service Creation Form
                            </button>
                        </div>

                        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                            Or manage existing services below (basic editing):
                        </p>

                        {formData.packages.map((pkg) => (
                            <div key={pkg.id} className={styles.packageCard}>
                                <div className={styles.packageHeader}>
                                    <h3>{pkg.isExisting ? 'Existing Service' : 'New Service'}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removePackage(pkg.id)}
                                        className={styles.removeBtn}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Title *</label>
                                    <Input
                                        value={pkg.title}
                                        onChange={(e) => updatePackage(pkg.id, 'title', e.target.value)}
                                        placeholder="e.g., 30-Min Resolution Call"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Description *</label>
                                    <Input
                                        value={pkg.desc}
                                        onChange={(e) => updatePackage(pkg.id, 'desc', e.target.value)}
                                        placeholder="What's included in this service?"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Price (₹) *</label>
                                    <Input
                                        type="number"
                                        value={pkg.price}
                                        onChange={(e) => updatePackage(pkg.id, 'price', e.target.value)}
                                        placeholder="999"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addPackage}
                            className={styles.addPackageBtn}
                        >
                            <Plus size={20} /> Add Another Service
                        </button>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className={styles.navigation}>
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        >
                            Back
                        </Button>
                    )}
                    <Button type="submit" fullWidth={currentStep === 0} disabled={saving}>
                        {saving ? 'Saving...' : (currentStep === STEPS.length - 1 ? 'Save Changes' : 'Next')}
                    </Button>
                </div>
            </form>
        </>
    );

    // If embedded (in profile page), return content without container
    if (embedded) {
        return <div>{content}</div>;
    }

    // If standalone, wrap in container
    return (
        <main className={styles.container}>
            <div className={styles.card}>
                {content}
            </div>
        </main>
    );
}
