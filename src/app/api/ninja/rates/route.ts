import { NextRequest, NextResponse } from 'next/server';
import { AppCache } from '@/lib/cache';
import { NinjaClient } from '@/lib/ninja';
import { NinjaCurrencyOverview, ApiResponse } from '@/lib/types';

const cache = new AppCache(300); // 5 minute TTL
const client = new NinjaClient();

export async function GET(request: NextRequest) {
  const league = request.nextUrl.searchParams.get('league');
  if (!league) {
    return NextResponse.json(
      { data: null, error: 'league parameter is required', cachedAt: null },
      { status: 400 }
    );
  }

  const cacheKey = `ninja-rates-${league}`;
  const cached = cache.get<NinjaCurrencyOverview>(cacheKey);
  if (cached) {
    return NextResponse.json({
      data: cached,
      error: null,
      cachedAt: cache.getCachedAt(cacheKey) ?? null,
    } satisfies ApiResponse<NinjaCurrencyOverview>);
  }

  try {
    const rates = await client.getRates(league);
    cache.set(cacheKey, rates);

    return NextResponse.json({
      data: rates,
      error: null,
      cachedAt: cache.getCachedAt(cacheKey) ?? null,
    } satisfies ApiResponse<NinjaCurrencyOverview>);
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message, cachedAt: null },
      { status: 502 }
    );
  }
}
