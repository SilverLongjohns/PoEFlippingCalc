import { NextRequest, NextResponse } from 'next/server';
import { AppCache } from '@/lib/cache';
import { NinjaClient } from '@/lib/ninja';
import { FlipCalculator } from '@/lib/calculator';
import { NinjaCurrencyOverview, FlipOpportunity, ApiResponse } from '@/lib/types';

const cache = new AppCache(300); // 5 minute TTL (same as ninja rates)
const client = new NinjaClient();
const calculator = new FlipCalculator();

// Server returns ALL flips with no filtering/sorting.
// Sorting and filtering is done client-side to avoid stale-closure
// issues and to allow instant filter changes without re-fetching.
export async function GET(request: NextRequest) {
  const league = request.nextUrl.searchParams.get('league');
  if (!league) {
    return NextResponse.json(
      { data: null, error: 'league parameter is required', cachedAt: null },
      { status: 400 }
    );
  }

  // Use cached ninja data if available
  const cacheKey = `ninja-rates-${league}`;
  let rates = cache.get<NinjaCurrencyOverview>(cacheKey);

  if (!rates) {
    try {
      rates = await client.getRates(league);
      cache.set(cacheKey, rates);
    } catch (error) {
      return NextResponse.json(
        { data: null, error: (error as Error).message, cachedAt: null },
        { status: 502 }
      );
    }
  }

  const flips = calculator.calculateFlips(rates);

  return NextResponse.json({
    data: flips,
    error: null,
    cachedAt: cache.getCachedAt(cacheKey) ?? null,
  } satisfies ApiResponse<FlipOpportunity[]>);
}
