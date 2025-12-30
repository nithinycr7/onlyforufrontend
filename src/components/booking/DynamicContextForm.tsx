'use client';

import React from 'react';
import styles from './DynamicContextForm.module.css';

interface Field {
    name: string;
    label: string;
    type: 'text' | 'date' | 'time' | 'geo' | 'chips' | 'link' | 'select' | 'image';
    required: boolean;
    options?: string[];
    placeholder?: string;
}

interface DynamicContextFormProps {
    template: { fields: Field[] };
    formData: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

export const DynamicContextForm: React.FC<DynamicContextFormProps> = ({ template, formData, onChange }) => {
    if (!template || !template.fields) return null;

    const renderField = (field: Field) => {
        const value = formData[field.name] || '';

        switch (field.type) {
            case 'chips':
                return (
                    <div className={styles.chipsGroup}>
                        {field.options?.map(option => (
                            <button
                                key={option}
                                type="button"
                                className={`${styles.chip} ${value === option ? styles.active : ''}`}
                                onClick={() => onChange(field.name, option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );

            case 'select':
                return (
                    <select
                        className={styles.select}
                        value={value}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    >
                        <option value="">Select option...</option>
                        {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        className={styles.input}
                        value={value}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    />
                );

            case 'time':
                return (
                    <input
                        type="time"
                        className={styles.input}
                        value={value}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required}
                    />
                );

            case 'image':
                return (
                    <div className={styles.imageHint}>
                        <p>📸 Please ensure you upload this in the "Files" section below.</p>
                    </div>
                );

            default:
                return (
                    <input
                        type={field.type === 'link' ? 'url' : 'text'}
                        className={styles.input}
                        value={value}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        required={field.required}
                    />
                );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Smart Context</h3>
                <p>Extra details to help your creator provide a better response</p>
            </div>
            <div className={styles.grid}>
                {template.fields.map(field => (
                    <div key={field.name} className={styles.fieldGroup}>
                        <label className={styles.label}>
                            {field.label} {field.required && <span className={styles.required}>*</span>}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>
        </div>
    );
};
