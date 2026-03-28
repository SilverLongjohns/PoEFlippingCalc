import { FlipCalculator } from '../calculator';
import { NinjaCurrencyOverview } from '../types';

const mockData: NinjaCurrencyOverview = {
  lines: [
    {
      currencyTypeName: 'Divine Orb',
      detailsId: 'divine-orb',
      chaosEquivalent: 150,
      pay: { id: 1, league_id: 1, pay_currency_id: 1, get_currency_id: 2, sample_time_utc: '', count: 50, value: 0.0067, data_point_count: 5, includes_secondary: false, listing_count: 100 },
      receive: { id: 2, league_id: 1, pay_currency_id: 2, get_currency_id: 1, sample_time_utc: '', count: 80, value: 148, data_point_count: 5, includes_secondary: false, listing_count: 120 },
    },
    {
      currencyTypeName: 'Exalted Orb',
      detailsId: 'exalted-orb',
      chaosEquivalent: 18,
      pay: { id: 3, league_id: 1, pay_currency_id: 1, get_currency_id: 3, sample_time_utc: '', count: 30, value: 0.058, data_point_count: 5, includes_secondary: false, listing_count: 60 },
      receive: { id: 4, league_id: 1, pay_currency_id: 3, get_currency_id: 1, sample_time_utc: '', count: 40, value: 17, data_point_count: 5, includes_secondary: false, listing_count: 80 },
    },
  ],
  currencyDetails: [
    { id: 1, name: 'Chaos Orb', icon: 'https://example.com/chaos.png', tradeId: 'chaos' },
    { id: 2, name: 'Divine Orb', icon: 'https://example.com/divine.png', tradeId: 'divine' },
    { id: 3, name: 'Exalted Orb', icon: 'https://example.com/exalted.png', tradeId: 'exalted' },
  ],
};

describe('FlipCalculator', () => {
  const calculator = new FlipCalculator();

  it('returns an array of FlipOpportunity', () => {
    const flips = calculator.calculateFlips(mockData);
    expect(Array.isArray(flips)).toBe(true);
    flips.forEach((flip) => {
      expect(flip).toHaveProperty('buyCurrency');
      expect(flip).toHaveProperty('sellCurrency');
      expect(flip).toHaveProperty('profitPerTrade');
      expect(flip).toHaveProperty('roi');
      expect(flip).toHaveProperty('profitPerHour');
    });
  });

  it('only includes profitable flips (profitPerTrade > 0)', () => {
    const flips = calculator.calculateFlips(mockData);
    flips.forEach((flip) => {
      expect(flip.profitPerTrade).toBeGreaterThan(0);
    });
  });

  it('sorts by profitPerTrade descending by default', () => {
    const flips = calculator.calculateFlips(mockData);
    for (let i = 1; i < flips.length; i++) {
      expect(flips[i - 1].profitPerTrade).toBeGreaterThanOrEqual(flips[i].profitPerTrade);
    }
  });

  it('filters out flips below minimum profit', () => {
    const flips = calculator.calculateFlips(mockData, {
      minProfit: 999999,
      minListings: 0,
      sortBy: 'profitPerTrade',
    });
    expect(flips.length).toBe(0);
  });

  it('filters out flips with insufficient listings', () => {
    const flips = calculator.calculateFlips(mockData, {
      minProfit: 0,
      minListings: 999999,
      sortBy: 'profitPerTrade',
    });
    expect(flips.length).toBe(0);
  });

  it('pre-filters currencies below 0.1 chaos equivalent', () => {
    const dataWithCheap: NinjaCurrencyOverview = {
      lines: [
        ...mockData.lines,
        {
          currencyTypeName: 'Scroll of Wisdom',
          detailsId: 'scroll-of-wisdom',
          chaosEquivalent: 0.01,
          pay: null,
          receive: null,
        },
      ],
      currencyDetails: [
        ...mockData.currencyDetails,
        { id: 99, name: 'Scroll of Wisdom', icon: null, tradeId: 'scroll' },
      ],
    };
    const flips = calculator.calculateFlips(dataWithCheap);
    const hasScroll = flips.some(
      (f) => f.buyCurrency.name === 'Scroll of Wisdom' || f.sellCurrency.name === 'Scroll of Wisdom'
    );
    expect(hasScroll).toBe(false);
  });
});
