'use client';

import React from 'react';
import styles from './AIProcessingStatus.module.css';

interface AIProcessingStatusProps {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
}

export default function AIProcessingStatus({
    status,
    error,
}: AIProcessingStatusProps) {
    if (status === 'completed') {
        return null; // Don't show anything when completed
    }

    return (
        <div className={styles.container}>
            {status === 'pending' && (
                <div className={styles.pending}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>⏳</span>
                    </div>
                    <div className={styles.content}>
                        <h4 className={styles.title}>AI Analysis Queued</h4>
                        <p className={styles.message}>
                            Waiting to process this question...
                        </p>
                    </div>
                </div>
            )}

            {status === 'processing' && (
                <div className={styles.processing}>
                    <div className={styles.iconContainer}>
                        <div className={styles.spinner}></div>
                    </div>
                    <div className={styles.content}>
                        <h4 className={styles.title}>AI is Analyzing...</h4>
                        <p className={styles.message}>
                            Generating summary, detecting sentiment, and extracting key points
                        </p>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill}></div>
                        </div>
                    </div>
                </div>
            )}

            {status === 'failed' && (
                <div className={styles.failed}>
                    <div className={styles.iconContainer}>
                        <span className={styles.icon}>❌</span>
                    </div>
                    <div className={styles.content}>
                        <h4 className={styles.title}>AI Processing Failed</h4>
                        <p className={styles.message}>
                            {error || 'Unable to generate AI summary. You can still view the original question.'}
                        </p>
                        <button className={styles.retryButton}>
                            Retry Analysis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
