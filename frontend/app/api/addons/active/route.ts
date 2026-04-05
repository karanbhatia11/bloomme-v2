import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
        const response = await fetch(`${BACKEND_URL}/api/addons/active`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Active add-ons error:', error);
        return NextResponse.json(
            { error: error.message, activeAddOns: [] },
            { status: 500 }
        );
    }
}
