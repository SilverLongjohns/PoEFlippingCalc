import { NinjaCurrencyOverview } from './types';

const BASE_URL = 'https://poe.ninja/api/data/currencyoverview';

export class NinjaClient {
  async getRates(league: string): Promise<NinjaCurrencyOverview> {
    const [currency, fragment] = await Promise.all([
      this.fetchOverview(league, 'Currency'),
      this.fetchOverview(league, 'Fragment'),
    ]);

    return {
      lines: [...currency.lines, ...fragment.lines],
      currencyDetails: [...currency.currencyDetails, ...fragment.currencyDetails],
    };
  }

  private async fetchOverview(league: string, type: 'Currency' | 'Fragment'): Promise<NinjaCurrencyOverview> {
    const url = `${BASE_URL}?league=${encodeURIComponent(league)}&type=${type}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PoECurrencyFlipper/1.0 (contact: github.com)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`poe.ninja API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
