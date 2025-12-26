'use client';

import { Home, Star, MessageCircle, User, MoreHorizontal, LayoutGrid, Briefcase, Users, LucideIcon, Calendar, Package } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Layout.module.css';

type TabItem = {
    icon: LucideIcon;
    label: string;
    path: string;
    badge?: string;
};

const FAN_TABS: TabItem[] = [
    { icon: Home, label: 'Discover', path: '/home' },
    { icon: Star, label: 'My Bookings', path: '/fan/bookings' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
];

const CREATOR_TABS: TabItem[] = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/creator-dashboard' },
    { icon: Calendar, label: 'Bookings', path: '/creator-dashboard/bookings' },
    { icon: Package, label: 'Services', path: '/creator-dashboard/services' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // Prioritize role from user object, then fallback to localStorage
        if (user?.role) {
            setRole(user.role.toLowerCase());
        } else {
            const savedRole = localStorage.getItem('user_role');
            setRole(savedRole);
        }
    }, [user]);

    const tabs = role === 'creator' ? CREATOR_TABS : FAN_TABS;

    return (
        <nav className={styles.bottomNav}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.path || (tab.path !== '/home' && pathname.startsWith(tab.path));
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.path}
                        className={`${styles.tab} ${isActive ? styles.active : ''}`}
                        onClick={() => router.push(tab.path)}
                    >
                        <div className={styles.iconWrapper}>
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {tab.badge && <span className={styles.navBadge}>{tab.badge}</span>}
                        </div>
                        <span className={styles.label}>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
