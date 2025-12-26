'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './services.module.css';

interface ServiceFormData {
    title: string;
    subtitle: string;
    description: string;
    price_inr: number;
    response_modes: string[];
    features: string[];
    sla_hours: number;
    includes_followups: boolean;
    max_followups: number;
    followup_window_days: number;
    max_slots_per_month: number | null;
    is_popular: boolean;
    display_order: number;
}

export default function CreateServicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ServiceFormData>({
        title: '',
        subtitle: '',
        description: '',
        price_inr: 999,
        response_modes: ['voice'],
        features: [''],
        sla_hours: 48,
        includes_followups: false,
        max_followups: 0,
        followup_window_days: 7,
        max_slots_per_month: null,
        is_popular: false,
        display_order: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleResponseModeToggle = (mode: string) => {
        setFormData(prev => ({
            ...prev,
            response_modes: prev.response_modes.includes(mode)
                ? prev.response_modes.filter(m => m !== mode)
                : [...prev.response_modes, mode]
        }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        if (formData.features.length < 10) {
            setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Filter out empty features
            const cleanedFeatures = formData.features.filter(f => f.trim() !== '');

            // Import api client
            const { api } = await import('@/lib/api');

            const response = await api.post('/creator/services', {
                ...formData,
                features: cleanedFeatures
            });

            router.push('/creator-dashboard/services');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Add New Service</h1>
                <button
                    className={styles.backBtn}
                    onClick={() => router.back()}
                >
                    ← Back
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Basic Info */}
                <section className={styles.section}>
                    <h2>Basic Information</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Quick Life Advice"
                            required
                            minLength={5}
                            maxLength={200}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subtitle">Subtitle</label>
                        <input
                            id="subtitle"
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                            placeholder="e.g., One specific question answered"
                            maxLength={300}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed explanation of what this service includes..."
                            rows={4}
                            required
                        />
                    </div>
                </section>

                {/* Pricing */}
                <section className={styles.section}>
                    <h2>Pricing</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="price">Price (INR) *</label>
                        <input
                            id="price"
                            type="number"
                            value={formData.price_inr}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_inr: parseInt(e.target.value) }))}
                            min={99}
                            max={99999}
                            required
                        />
                        <small>Minimum ₹99, Maximum ₹99,999</small>
                    </div>
                </section>

                {/* Response Mode */}
                <section className={styles.section}>
                    <h2>Response Mode *</h2>
                    <p className={styles.sectionDesc}>How will you deliver this service?</p>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={formData.response_modes.includes('voice')}
                                onChange={() => handleResponseModeToggle('voice')}
                            />
                            <span>Voice Note</span>
                        </label>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={formData.response_modes.includes('video')}
                                onChange={() => handleResponseModeToggle('video')}
                            />
                            <span>Video Response</span>
                        </label>

                        <label className={styles.checkbox} title="Coming in Phase 2">
                            <input
                                type="checkbox"
                                disabled
                            />
                            <span className={styles.disabled}>Live Call (Coming Soon)</span>
                        </label>
                    </div>
                </section>

                {/* SLA */}
                <section className={styles.section}>
                    <h2>Response Time (SLA) *</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="sla">Response within</label>
                        <select
                            id="sla"
                            value={formData.sla_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, sla_hours: parseInt(e.target.value) }))}
                        >
                            <option value={24}>24 hours</option>
                            <option value={48}>48 hours</option>
                            <option value={72}>72 hours</option>
                            <option value={168}>1 week</option>
                        </select>
                    </div>
                </section>

                {/* Follow-ups */}
                <section className={styles.section}>
                    <h2>Follow-ups</h2>

                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.includes_followups}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                includes_followups: e.target.checked,
                                max_followups: e.target.checked ? 1 : 0
                            }))}
                        />
                        <span>Include follow-ups</span>
                    </label>

                    {formData.includes_followups && (
                        <div className={styles.subSection}>
                            <div className={styles.formGroup}>
                                <label htmlFor="maxFollowups">Maximum follow-ups</label>
                                <select
                                    id="maxFollowups"
                                    value={formData.max_followups}
                                    onChange={(e) => setFormData(prev => ({ ...prev, max_followups: parseInt(e.target.value) }))}
                                >
                                    <option value={1}>1 follow-up</option>
                                    <option value={2}>2 follow-ups</option>
                                    <option value={3}>3 follow-ups</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="followupWindow">Follow-up window</label>
                                <select
                                    id="followupWindow"
                                    value={formData.followup_window_days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, followup_window_days: parseInt(e.target.value) }))}
                                >
                                    <option value={7}>7 days</option>
                                    <option value={14}>14 days</option>
                                    <option value={30}>30 days</option>
                                </select>
                            </div>
                        </div>
                    )}
                </section>

                {/* Features */}
                <section className={styles.section}>
                    <h2>Features *</h2>
                    <p className={styles.sectionDesc}>What's included in this service?</p>

                    <div className={styles.featuresList}>
                        {formData.features.map((feature, index) => (
                            <div key={index} className={styles.featureItem}>
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    placeholder={`Feature ${index + 1}`}
                                    required={index === 0}
                                />
                                {formData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {formData.features.length < 10 && (
                        <button
                            type="button"
                            onClick={addFeature}
                            className={styles.addBtn}
                        >
                            + Add Feature
                        </button>
                    )}
                </section>

                {/* Advanced Options */}
                <section className={styles.section}>
                    <h2>Advanced Options</h2>

                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.is_popular}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                        />
                        <span>Mark as Popular (shows badge)</span>
                    </label>

                    <div className={styles.formGroup}>
                        <label htmlFor="displayOrder">Display Order</label>
                        <input
                            id="displayOrder"
                            type="number"
                            value={formData.display_order}
                            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                            min={0}
                        />
                        <small>Lower numbers appear first</small>
                    </div>
                </section>

                {/* Submit */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelBtn}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading || formData.response_modes.length === 0}
                    >
                        {loading ? 'Creating...' : 'Create Service'}
                    </button>
                </div>
            </form>
        </div>
    );
}
