import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');
        console.log('[Dashboard Stats Proxy] Token:', token?.substring(0, 20) + '...');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
        console.log('[Dashboard Stats Proxy] Calling:', `${BACKEND_URL}/api/dashboard/stats`);

        const response = await fetch(`${BACKEND_URL}/api/dashboard/stats`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });

        console.log('[Dashboard Stats Proxy] Backend response status:', response.status);
        const data = await response.json();
        console.log('[Dashboard Stats Proxy] Backend response data:', data);

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
