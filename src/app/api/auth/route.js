import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'login' | 'signup'

    if (!action || !['login', 'signup'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use ?action=login or ?action=signup' }, { status: 400 });
    }

    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Authentication failed' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json({ success: false, error: 'Network error. Is the backend running?' }, { status: 503 });
  }
}
