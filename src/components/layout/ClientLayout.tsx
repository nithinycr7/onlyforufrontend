'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { useAuth } from '@/context/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    // Hide TopBar and BottomNav on these routes
    const isAuthRoute = pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/onboarding') || pathname.startsWith('/creator/onboarding');

    // Hide bottom nav on home if not logged in
    const isHomeUnauth = pathname === '/home' && !user && !loading;

    return (
        <>
            {!isAuthRoute && <TopBar />}
            {children}
            {!isAuthRoute && !isHomeUnauth && <BottomNav />}
        </>
    );
}
