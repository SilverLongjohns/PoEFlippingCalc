import { NextResponse } from 'next/server';
import { AppCache } from '@/lib/cache';
import { League, ApiResponse } from '@/lib/types';

const cache = new AppCache(3600); // 1 hour TTL
const CACHE_KEY = 'leagues';

export async function GET() {
  const cached = cache.get<League[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({
      data: cached,
      error: null,
      cachedAt: cache.getCachedAt(CACHE_KEY) ?? null,
    } satisfies ApiResponse<League[]>);
  }

  try {
    const response = await fetch(
      'https://api.pathofexile.com/leagues?type=main&realm=pc&compact=1',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PoECurrencyFlipper/1.0 (contact: github.com)',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Leagues API error: ${response.status}`);
    }

    const leagues: League[] = await response.json();
    cache.set(CACHE_KEY, leagues);

    return NextResponse.json({
      data: leagues,
      error: null,
      cachedAt: cache.getCachedAt(CACHE_KEY) ?? null,
    } satisfies ApiResponse<League[]>);
  } catch (error) {
    console.error('Leagues fetch failed:', error);
    return NextResponse.json(
      { data: null, error: (error as Error).message, cachedAt: null } satisfies ApiResponse<League[]>,
      { status: 502 }
    );
  }
}
