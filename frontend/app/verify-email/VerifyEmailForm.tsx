'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/common/Navigation';
import { Footer } from '@/components/sections/Footer';

export function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    // Auto-login and redirect to dashboard
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setStatus('success');
                    setTimeout(() => router.push('/dashboard'), 1500);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify email.');
                }
            } catch {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <>
            <Navigation />
            <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface via-surface to-surface-container-low">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-surface-container text-center"
                >
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <span className="material-symbols-outlined text-3xl text-primary">hourglass_top</span>
                            </div>
                            <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">Verifying your email…</h1>
                            <p className="text-on-surface-variant text-sm">Just a moment.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
                            </div>
                            <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">Email verified!</h1>
                            <p className="text-on-surface-variant text-sm">Taking you to your dashboard…</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-3xl text-error">error</span>
                            </div>
                            <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">Verification failed</h1>
                            <p className="text-on-surface-variant text-sm mb-6">{message}</p>
                            <Link
                                href="/login"
                                className="inline-block bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-lg font-bold text-sm"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}
                </motion.div>
            </main>
            <Footer />
        </>
    );
}
