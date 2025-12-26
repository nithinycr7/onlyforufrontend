'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './services.module.css';

interface Service {
    id: string;
    title: string;
    subtitle: string;
    price_inr: number;
    response_modes: string[];
    is_active: boolean;
    is_popular: boolean;
    current_slots_used: number;
    max_slots_per_month: number | null;
    total_purchases: number;
    avg_rating: number;
}

export default function ServicesListPage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { api } = await import('@/lib/api');
            const response = await api.get('/creator/services');
            setServices(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const { api } = await import('@/lib/api');
            await api.delete(`/creator/services/${serviceId}`);
            fetchServices(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.detail || err.message || 'Failed to delete service');
        }
    };

    const toggleActive = async (serviceId: string, currentStatus: boolean) => {
        try {
            const { api } = await import('@/lib/api');
            await api.put(`/creator/services/${serviceId}`, { is_active: !currentStatus });
            fetchServices(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.detail || err.message || 'Failed to update service');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading services...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>My Services</h1>
                    <p className={styles.subtitle}>Manage your consultation services</p>
                </div>
                <button
                    className={styles.createBtn}
                    onClick={() => router.push('/creator-dashboard/services/create')}
                >
                    + Add New Service
                </button>
            </div>

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            {services.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📦</div>
                    <h2>No services yet</h2>
                    <p>Create your first consultation service to start earning</p>
                    <button
                        className={styles.createBtn}
                        onClick={() => router.push('/creator-dashboard/services/create')}
                    >
                        Create Service
                    </button>
                </div>
            ) : (
                <div className={styles.servicesList}>
                    {services.map(service => (
                        <div key={service.id} className={styles.serviceCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3>{service.title}</h3>
                                    {service.subtitle && (
                                        <p className={styles.serviceSubtitle}>{service.subtitle}</p>
                                    )}
                                </div>
                                <div className={styles.badges}>
                                    {service.is_popular && (
                                        <span className={styles.popularBadge}>⭐ Popular</span>
                                    )}
                                    <span className={service.is_active ? styles.activeBadge : styles.inactiveBadge}>
                                        {service.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Price</span>
                                    <span className={styles.statValue}>₹{service.price_inr}</span>
                                </div>

                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Response Mode</span>
                                    <span className={styles.statValue}>
                                        {service.response_modes.map(mode => (
                                            mode === 'voice' ? '🎤' : mode === 'video' ? '🎥' : '📞'
                                        )).join(' ')}
                                    </span>
                                </div>

                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Total Sales</span>
                                    <span className={styles.statValue}>{service.total_purchases}</span>
                                </div>

                                {service.max_slots_per_month && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Slots Used</span>
                                        <span className={styles.statValue}>
                                            {service.current_slots_used} / {service.max_slots_per_month}
                                        </span>
                                    </div>
                                )}

                                {service.avg_rating > 0 && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Rating</span>
                                        <span className={styles.statValue}>⭐ {service.avg_rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => router.push(`/creator-dashboard/services/edit/${service.id}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => toggleActive(service.id, service.is_active)}
                                >
                                    {service.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(service.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
