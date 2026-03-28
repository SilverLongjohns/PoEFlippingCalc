import { TradeClient } from '../trade';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TradeClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('parses exchange endpoint response with inline listings', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({}),
      json: async () => ({
        result: {
          hash1: {
            listing: {
              account: { name: 'Player1' },
              whisper: 'whisper text',
              indexed: '2026-03-28T00:00:00Z',
              offers: [
                {
                  exchange: { amount: 150, currency: 'chaos' },
                  item: { amount: 1, currency: 'divine', stock: 5 },
                },
              ],
            },
          },
          hash2: {
            listing: {
              account: { name: 'Player2' },
              whisper: 'whisper text 2',
              indexed: '2026-03-27T00:00:00Z',
              offers: [
                {
                  exchange: { amount: 148, currency: 'chaos' },
                  item: { amount: 1, currency: 'divine', stock: 3 },
                },
              ],
            },
          },
        },
      }),
    });

    const client = new TradeClient();
    const result = await client.validateFlip('Standard', 'divine', 'chaos');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.viable).toBe(true);
    expect(result.listings.length).toBe(2);
    expect(result.listings[0].accountName).toBe('Player1');
    expect(result.listings[0].buyAmount).toBe(150);
    expect(result.listings[0].sellAmount).toBe(1);
    expect(result.listings[0].conversionRate).toBe(150);
  });

  it('returns not viable when no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({}),
      json: async () => ({
        result: {},
      }),
    });

    const client = new TradeClient();
    const result = await client.validateFlip('Standard', 'divine', 'chaos');

    expect(result.viable).toBe(false);
    expect(result.listings.length).toBe(0);
  });
});
