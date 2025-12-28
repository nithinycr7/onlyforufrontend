'use client';

import React from 'react';
import styles from './AIQuestionSummary.module.css';

interface AIQuestionSummaryProps {
    summary: string;
    sentiment: string;
    stakes: string;
    keyPoints: string[];
    language?: string;
}

const sentimentEmojis: Record<string, string> = {
    anxious: '😰',
    excited: '🤩',
    confused: '😕',
    neutral: '😐',
    grateful: '🙏',
    frustrated: '😤',
};

const stakesColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
};

export default function AIQuestionSummary({
    summary,
    sentiment,
    stakes,
    keyPoints,
    language = 'en',
}: AIQuestionSummaryProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <span className={styles.aiIcon}>✨</span>
                    AI Summary
                </h3>
                <span className={styles.badge}>Creator-Only</span>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
                <p>{summary}</p>
            </div>

            {/* Sentiment & Stakes */}
            <div className={styles.metadata}>
                <div className={styles.metadataItem}>
                    <span className={styles.label}>Sentiment</span>
                    <div className={styles.sentimentBadge}>
                        <span className={styles.emoji}>
                            {sentimentEmojis[sentiment] || '😐'}
                        </span>
                        <span className={styles.sentimentText}>
                            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                        </span>
                    </div>
                </div>

                <div className={styles.metadataItem}>
                    <span className={styles.label}>Stakes</span>
                    <div
                        className={styles.stakesBadge}
                        style={{ backgroundColor: stakesColors[stakes] || '#6b7280' }}
                    >
                        {stakes.charAt(0).toUpperCase() + stakes.slice(1)}
                    </div>
                </div>
            </div>

            {/* Key Points */}
            {keyPoints && keyPoints.length > 0 && (
                <div className={styles.keyPoints}>
                    <h4 className={styles.keyPointsTitle}>Key Points to Address</h4>
                    <ul className={styles.keyPointsList}>
                        {keyPoints.map((point, index) => (
                            <li key={index} className={styles.keyPoint}>
                                <span className={styles.bullet}>•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Language indicator */}
            {language !== 'en' && (
                <div className={styles.languageNote}>
                    <span className={styles.languageIcon}>🌐</span>
                    Summary translated to {language}
                </div>
            )}
        </div>
    );
}
