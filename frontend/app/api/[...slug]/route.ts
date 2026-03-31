import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

async function handleRequest(request: NextRequest, method: string) {
    try {
        const { searchParams, pathname } = request.nextUrl;
        const backendPath = pathname; // Keep /api prefix — backend routes are registered under /api/...
        const token = request.headers.get('Authorization');

        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        };

        if (method !== 'GET' && method !== 'DELETE') {
            const body = await request.json().catch(() => null);
            if (body) fetchOptions.body = JSON.stringify(body);
        }

        const url = `${BACKEND_URL}${backendPath}${searchParams.toString() ? `?${searchParams}` : ''}`;
        const response = await fetch(url, fetchOptions);
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: response.status });
        } catch {
            return NextResponse.json({ error: text }, { status: response.status || 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) { return handleRequest(request, 'GET'); }
export async function POST(request: NextRequest) { return handleRequest(request, 'POST'); }
export async function PUT(request: NextRequest) { return handleRequest(request, 'PUT'); }
export async function DELETE(request: NextRequest) { return handleRequest(request, 'DELETE'); }
