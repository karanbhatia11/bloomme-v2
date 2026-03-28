'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';

export default function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('adminToken');
        if (savedToken) {
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    const handleLogin = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('adminToken', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('adminToken');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-gray-600">Loading...</div>
        </div>;
    }

    return (
        <>
            {!token ? (
                <AdminLogin onLogin={handleLogin} />
            ) : (
                <AdminDashboard token={token} onLogout={handleLogout} />
            )}
        </>
    );
}
