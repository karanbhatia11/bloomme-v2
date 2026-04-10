import { Suspense } from 'react';
import { VerifyEmailForm } from './VerifyEmailForm';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin mb-4">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"></div>
                    </div>
                    <p className="text-gray-600">Verifying email...</p>
                </div>
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}
