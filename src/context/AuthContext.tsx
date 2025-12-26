'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'creator' | 'fan';
    is_verified: boolean;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, refreshToken: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const token = getCookie('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get('/auth/me');
            setUser(response.data);

            // Sync localStorage role for other components
            if (response.data.role) {
                localStorage.setItem('user_role', response.data.role.toLowerCase());
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            // If token is invalid, logout
            if ((error as any).response?.status === 401) {
                logout();
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchUser();

        // Listen for 401 events from api interceptor
        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = async (token: string, refreshToken: string, role?: string) => {
        setCookie('token', token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
        setCookie('refresh_token', refreshToken, { maxAge: 60 * 60 * 24 * 30 });

        // Also set localStorage for compatibility with api.ts interceptor
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refreshToken);
            if (role) {
                localStorage.setItem('user_role', role.toLowerCase());
            }
        }

        // Fetch user details after login to sync state
        await fetchUser();
        router.refresh();
    };

    const logout = () => {
        deleteCookie('token');
        deleteCookie('refresh_token');

        // Also clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_role');
        }

        setUser(null);
        router.push('/auth');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
