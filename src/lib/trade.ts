import { ValidationResult, TradeListing } from './types';
import { RateLimiter } from './rateLimiter';
import { AppCache } from './cache';

const TRADE_BASE_URL = 'https://www.pathofexile.com/api/trade';
const USER_AGENT = process.env.NEXT_PUBLIC_USER_AGENT || 'PoEFlippingCalc/1.0';

const VALIDATE_CACHE_TTL = 120; // 2 minute cache for validation results
const GLOBAL_MAX_REQUESTS = 30; // max GGG trade requests per window
const GLOBAL_WINDOW_MS = 60_000; // 1 minute window

export class TradeClient {
  private rateLimiter = new RateLimiter();
  private validateCache = new AppCache(VALIDATE_CACHE_TTL);
  private requestTimestamps: number[] = [];

  private pruneTimestamps(): void {
    const cutoff = Date.now() - GLOBAL_WINDOW_MS;
    this.requestTimestamps = this.requestTimestamps.filter((t) => t > cutoff);
  }

  private isGloballyThrottled(): boolean {
    this.pruneTimestamps();
    return this.requestTimestamps.length >= GLOBAL_MAX_REQUESTS;
  }

  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  async validateFlip(
    league: string,
    wantCurrency: string,
    haveCurrency: string,
    poesessid?: string
  ): Promise<ValidationResult> {
    // Check cache first
    const cacheKey = `validate-${league}-${wantCurrency}-${haveCurrency}`;
    const cached = this.validateCache.get<ValidationResult>(cacheKey);
    if (cached) return cached;

    // Global throttle — reject if too many requests in the window
    if (this.isGloballyThrottled()) {
      throw new Error('Rate limited — too many validation requests. Try again in a minute.');
    }

    const searchBody = {
      exchange: {
        status: { option: 'online' },
        have: [haveCurrency],
        want: [wantCurrency],
      },
    };

    const searchUrl = `${TRADE_BASE_URL}/exchange/${encodeURIComponent(league)}`;

    if (!this.rateLimiter.canMakeRequest()) {
      const delay = this.rateLimiter.getDelayMs();
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const sessionId = poesessid || process.env.POESESSID;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    };
    if (sessionId) {
      headers['Cookie'] = `POESESSID=${sessionId}`;
    }

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchBody),
    });

    this.recordRequest();

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Trade API error: ${response.status}${body ? ` - ${body.slice(0, 200)}` : ''}${sessionId ? ' (session provided)' : ' (no session)'}`);
    }

    this.rateLimiter.updateFromHeaders(response.headers);

    const data = await response.json();

    // Exchange endpoint returns result as an object keyed by hash, not an array
    const resultEntries = data.result
      ? Object.values(data.result) as any[]
      : [];

    if (resultEntries.length === 0) {
      return {
        buyCurrency: wantCurrency,
        sellCurrency: haveCurrency,
        viable: false,
        listings: [],
        avgRate: null,
      };
    }

    const listings: TradeListing[] = resultEntries
      .slice(0, 20)
      .filter((entry: any) => entry.listing?.offers?.length > 0)
      .map((entry: any) => {
        const offer = entry.listing.offers[0];
        const exchangeAmount = offer.exchange.amount;  // what you pay (haveCurrency)
        const itemAmount = offer.item.amount;           // what you get (wantCurrency)
        const stock = offer.item.stock ?? 0;

        return {
          accountName: entry.listing.account.name,
          whisper: entry.listing.whisper ?? '',
          stock,
          buyAmount: exchangeAmount,
          sellAmount: itemAmount,
          conversionRate: exchangeAmount / itemAmount,
          listingAge: entry.listing.indexed,
        };
      });

    const avgRate =
      listings.length > 0
        ? listings.reduce((sum, l) => sum + l.conversionRate, 0) / listings.length
        : null;

    const result: ValidationResult = {
      buyCurrency: wantCurrency,
      sellCurrency: haveCurrency,
      viable: listings.length > 0,
      listings,
      avgRate,
    };

    this.validateCache.set(cacheKey, result);
    return result;
  }
}
