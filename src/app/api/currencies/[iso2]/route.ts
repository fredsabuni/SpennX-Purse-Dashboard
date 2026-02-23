import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for the SpennX Beta API.
 * Handles: GET /api/currencies/[iso2]
 *
 * This avoids CORS issues by routing browser requests through
 * the Next.js server, which then calls the SpennX Beta API.
 */

const BETA_API_BASE = process.env.NEXT_PUBLIC_SPENNX_BETA_URL || 'https://beta.spennx.com/api/v1';
const API_TOKEN = process.env.NEXT_PUBLIC_SPENNX_API_TOKEN || '';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ iso2: string }> }
) {
    const { iso2 } = await params;

    if (!iso2) {
        return NextResponse.json({ error: 'Missing iso2 parameter' }, { status: 400 });
    }

    if (!API_TOKEN) {
        return NextResponse.json(
            { error: 'API token not configured. Set NEXT_PUBLIC_SPENNX_API_TOKEN in .env.local' },
            { status: 500 }
        );
    }

    try {
        // Carry forward the iso2 requested and token
        const response = await fetch(`${BETA_API_BASE}/currencies/${iso2}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `SpennX API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[Currencies Proxy] Error fetching ${iso2}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch currency data' },
            { status: 500 }
        );
    }
}
