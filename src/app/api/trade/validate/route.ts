import { NextRequest, NextResponse } from 'next/server';
import { TradeClient } from '@/lib/trade';
import { ValidationResult, ApiResponse } from '@/lib/types';

const client = new TradeClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { league, wantCurrency, haveCurrency } = body;

    if (!league || !wantCurrency || !haveCurrency) {
      return NextResponse.json(
        { data: null, error: 'league, wantCurrency, and haveCurrency are required', cachedAt: null },
        { status: 400 }
      );
    }

    const result = await client.validateFlip(league, wantCurrency, haveCurrency);

    return NextResponse.json({
      data: result,
      error: null,
      cachedAt: null,
    } satisfies ApiResponse<ValidationResult>);
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes('429') || message.includes('Rate limited') ? 429 : 502;
    return NextResponse.json(
      { data: null, error: message, cachedAt: null },
      { status }
    );
  }
}
