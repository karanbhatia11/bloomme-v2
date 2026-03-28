import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:5000';

async function handleRequest(
    request: NextRequest,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
) {
    try {
        const { searchParams } = request.nextUrl;
        const pathname = request.nextUrl.pathname; // e.g., /api/admin/stats

        // Extract the path after /api and forward it
        const backendPath = pathname.replace('/api', ''); // /admin/stats

        const token = request.headers.get('Authorization');

        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': token })
            }
        };

        if (method !== 'GET' && method !== 'DELETE') {
            const body = await request.json();
            fetchOptions.body = JSON.stringify(body);
        }

        const url = `${BACKEND_URL}${backendPath}${searchParams.toString() ? `?${searchParams}` : ''}`;

        const response = await fetch(url, fetchOptions);
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: response.status });
        } catch {
            // If response is not JSON, return as is
            return NextResponse.json(
                { error: `Backend returned non-JSON response: ${text}` },
                { status: response.status || 500 }
            );
        }
    } catch (error: any) {
        console.error('Admin API error:', error);
        return NextResponse.json(
            { error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
    return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
    return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
    return handleRequest(request, 'DELETE');
}
