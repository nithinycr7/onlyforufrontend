'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { Check, ArrowLeft, ShieldCheck, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function BookingConfirmationPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;
    const { user } = useAuth(); // Correctly inside component

    // Get details from URL
    const title = searchParams.get('title') || 'Consultation Service';
    const price = searchParams.get('price') || '0';
    const creatorName = searchParams.get('creatorName') || 'Creator';
    const creatorId = searchParams.get('creatorId');

    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);

            if (!creatorId) {
                alert("Missing Creator ID. Please go back and try again.");
                return;
            }

            // 1. Create Booking
            const response = await api.post('/bookings', {
                creator_id: creatorId,
                service_id: null, // Flexible booking
                service_title: title,
                service_subtitle: 'Consultation',
                amount_paid: parseFloat(price)
            });

            const bookingId = response.data.id;
            const amount = parseFloat(price);

            // 2. If amount > 0, Initiate Payment
            if (amount > 0) {
                try {
                    // Load Razorpay Script
                    const { loadRazorpay } = await import('@/lib/razorpay');
                    const isLoaded = await loadRazorpay();

                    if (!isLoaded) {
                        alert('Failed to load payment gateway');
                        setLoading(false);
                        return;
                    }

                    // Create Payment Order
                    const orderRes = await api.post('/payments/create-order', {
                        booking_id: bookingId
                    });

                    const order = orderRes.data;

                    const options = {
                        key: order.key_id,
                        amount: order.amount,
                        currency: order.currency,
                        name: "OnlyForU",
                        description: `Consultation with ${creatorName}`,
                        order_id: order.order_id,
                        handler: async function (response: any) {
                            try {
                                // Verify Payment
                                await api.post('/payments/verify', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                });

                                // Success! Navigate to question submission
                                router.push(`/bookings/${bookingId}/submit-question?serviceName=${encodeURIComponent(title)}&creatorName=${encodeURIComponent(creatorName)}`);
                            } catch (verifyError) {
                                console.error('Verification failed', verifyError);
                                alert("Payment verification failed. Please contact support.");
                            }
                        },
                        prefill: {
                            name: user?.full_name || 'Fan User',
                            email: user?.email || 'fan@example.com',
                            contact: user?.phone || '9999999999'
                        },
                        theme: {
                            color: "#6366f1"
                        },
                        // Ensure UPI is prominent
                        config: {
                            display: {
                                blocks: {
                                    utib: { // UPI block
                                        name: "Pay via UPI",
                                        instruments: [
                                            {
                                                method: "upi"
                                            }
                                        ]
                                    },
                                    other: {
                                        name: "Other Payment Methods",
                                        instruments: [
                                            {
                                                method: "card"
                                            },
                                            {
                                                method: "netbanking"
                                            }
                                        ]
                                    }
                                },
                                sequence: ["block.utib", "block.other"],
                                preferences: {
                                    show_default_blocks: true
                                }
                            }
                        },
                        modal: {
                            ondismiss: function () {
                                setLoading(false);
                            }
                        }
                    };

                    const paymentObject = new (window as any).Razorpay(options);
                    paymentObject.open();
                    return; // Don't redirect yet

                } catch (paymentError) {
                    console.error("Payment init failed, falling back to demo mode", paymentError);
                    alert("Payment system error. Proceeding in Demo Mode.");
                }
            }

            // Navigate to question submission (Free or Demo fallback)
            router.push(`/bookings/${bookingId}/submit-question?serviceName=${encodeURIComponent(title)}&creatorName=${encodeURIComponent(creatorName)}`);

        } catch (error: any) {
            console.error('Booking creation failed:', error);
            const msg = error.response?.data?.detail || 'Failed to create booking. Please try again.';
            alert(msg);
        } finally {
            if (parseFloat(price) <= 0) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--space-4)', maxWidth: '600px', margin: '0 auto' }}>
            <Button
                variant="ghost"
                onClick={() => router.back()}
                style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}
            >
                <ArrowLeft size={18} /> Back
            </Button>

            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>Confirm Booking</h1>

            <Card style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{title}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--gray-600)' }}>
                            <span>with</span>
                            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{creatorName}</span>
                            <ShieldCheck size={14} color="var(--primary-500)" />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <span style={{ color: 'var(--gray-600)' }}>Total Price</span>
                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>₹{price}</span>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        What you get
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{ background: 'var(--success-50)', padding: '4px', borderRadius: '50%', color: 'var(--success-600)' }}>
                                <Check size={14} />
                            </div>
                            <span>Personalized response regarding your query</span>
                        </li>
                        <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{ background: 'var(--info-50)', padding: '4px', borderRadius: '50%', color: 'var(--info-600)' }}>
                                <Clock size={14} />
                            </div>
                            <span>Response within 24-48 hours</span>
                        </li>
                        <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{ background: 'var(--warning-50)', padding: '4px', borderRadius: '50%', color: 'var(--warning-600)' }}>
                                <MessageSquare size={14} />
                            </div>
                            <span>1 Follow-up question included</span>
                        </li>
                    </ul>
                </div>

                <Button
                    fullWidth
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={loading}
                >
                    Confirm & Pay ₹{price}
                </Button>
                <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-3)' }}>
                    You won't be charged (Demo Mode)
                </p>
            </Card>
        </div>
    );
}
