import { NinjaClient } from '../ninja';
import { NinjaCurrencyOverview } from '../types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockCurrencyResponse: NinjaCurrencyOverview = {
  lines: [
    {
      currencyTypeName: 'Divine Orb',
      detailsId: 'divine-orb',
      chaosEquivalent: 150,
      pay: { id: 1, league_id: 1, pay_currency_id: 1, get_currency_id: 2, sample_time_utc: '', count: 50, value: 0.0067, data_point_count: 5, includes_secondary: false, listing_count: 100 },
      receive: { id: 2, league_id: 1, pay_currency_id: 2, get_currency_id: 1, sample_time_utc: '', count: 80, value: 150, data_point_count: 5, includes_secondary: false, listing_count: 120 },
    },
  ],
  currencyDetails: [
    { id: 1, name: 'Divine Orb', icon: 'https://example.com/divine.png', tradeId: 'divine' },
  ],
};

describe('NinjaClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches currency and fragment data for a league', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCurrencyResponse,
    });

    const client = new NinjaClient();
    const result = await client.getRates('Standard');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://poe.ninja/api/data/currencyoverview?league=Standard&type=Currency',
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://poe.ninja/api/data/currencyoverview?league=Standard&type=Fragment',
      expect.any(Object)
    );
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.currencyDetails.length).toBeGreaterThan(0);
  });

  it('throws on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const client = new NinjaClient();
    await expect(client.getRates('Standard')).rejects.toThrow();
  });
});
