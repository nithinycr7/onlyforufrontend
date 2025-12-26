'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide TopBar and BottomNav on these routes
    const isAuthRoute = pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/onboarding') || pathname.startsWith('/creator/onboarding');

    return (
        <>
            {!isAuthRoute && <TopBar />}
            {children}
            {!isAuthRoute && <BottomNav />}
        </>
    );
}
