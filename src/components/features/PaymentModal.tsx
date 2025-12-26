'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    amount: number;
    creatorName?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    planName,
    amount,
    creatorName = 'Creator'
}) => {
    const router = useRouter();
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    useEffect(() => {
        if (isOpen) setStep('details');
    }, [isOpen]);


    if (!isOpen) return null;

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
        }, 2000);
    };

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${step === 'success' ? styles.successMode : ''}`}>

                {step === 'details' && (
                    <>
                        <div className={styles.handle} onClick={onClose} />
                        <div className={styles.header}>
                            <h3 className={styles.title}>Subscribe to {creatorName}</h3>
                            <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.summaryCard}>
                                <div className={styles.tierName}>{planName}</div>
                                <div className={styles.priceRow}>
                                    <span className={styles.currency}>₹</span>{amount} <span className={styles.period}></span>
                                </div>
                                <ul className={styles.benefits}>
                                    <li>✓ Exclusive content access</li>
                                    <li>✓ Direct messaging included</li>
                                    <li>✓ Cancel anytime</li>
                                </ul>
                            </div>

                            <div className={styles.paymentMethods}>
                                <p className={styles.label}>Select Payment Method</p>
                                <div className={`${styles.method} ${styles.selected}`}>
                                    <span className={styles.radioSelected} />
                                    <span>UPI (GPay, PhonePe)</span>
                                </div>
                                <div className={styles.method}>
                                    <span className={styles.radio} />
                                    <span>Credit / Debit Card</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <Button fullWidth onClick={handlePay}>Proceed to Pay ₹{amount}</Button>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div className={styles.centerContent}>
                        <div className={styles.spinner} />
                        <p>Processing Payment...</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className={styles.centerContent}>
                        <div className={styles.successIcon}>
                            <Check size={40} color="#fff" />
                        </div>
                        <h3 className={styles.successTitle}>Subscription Active!</h3>
                        <p className={styles.successDesc}>You are now subscribed to {creatorName}.</p>
                        <Button fullWidth onClick={() => {
                            // Mock Logic for Demo:
                            // Pradeep -> Fun Thread (ID 2)
                            // Vismai/Others -> Learn Request (ID 1)
                            const targetId = creatorName && creatorName.includes('Pradeep') ? '2' : '1';
                            router.push(`/messages/${targetId}`);
                            onClose();
                        }}>Start Messaging</Button>
                    </div>
                )}

            </div>
        </div>
    );
};
