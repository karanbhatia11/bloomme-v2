'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function VerifyEmailForm() {
    const searchParams = useSearchParams();
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

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now log in.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify email.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
                console.error('Verification error:', err);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin mb-4">
                                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Verifying Email</h1>
                            <p className="text-gray-600 mt-2">Please wait while we verify your email address...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
                            <p className="text-gray-600 mt-2">{message}</p>
                            <Link
                                href="/login"
                                className="mt-6 block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                            <p className="text-gray-600 mt-2">{message}</p>
                            <Link
                                href="/signup"
                                className="mt-6 block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                Sign Up Again
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
