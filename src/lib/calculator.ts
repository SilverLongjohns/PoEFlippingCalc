import {
  NinjaCurrencyOverview,
  NinjaCurrencyLine,
  NinjaCurrencyDetail,
  CurrencyInfo,
  FlipOpportunity,
  FlipFilters,
  SortField,
} from './types';

const DEFAULT_FILTERS: FlipFilters = {
  minProfit: 0,
  minListings: 0,
  sortBy: 'profitPerTrade',
};

const MIN_CHAOS_VALUE = 0.1;
const TRADES_PER_LISTING = 0.5;
// Max allowed ratio between sell and buy prices.
// If sell/buy > this, the pay-side data is unreliable (sparse/outlier listings).
// A healthy flip spread is typically 1-15%, so 1.5x is generous.
const MAX_SPREAD_RATIO = 1.5;

export class FlipCalculator {
  calculateFlips(
    data: NinjaCurrencyOverview,
    filters: FlipFilters = DEFAULT_FILTERS
  ): FlipOpportunity[] {
    const detailsMap = this.buildDetailsMap(data.currencyDetails);
    const viableLines = data.lines.filter(
      (line) => line.chaosEquivalent >= MIN_CHAOS_VALUE
    );

    const flips: FlipOpportunity[] = [];

    const divineLine = viableLines.find(
      (l) => l.currencyTypeName === 'Divine Orb'
    );
    const divineDetail = detailsMap.get('Divine Orb');
    const chaosDetail = detailsMap.get('Chaos Orb');

    // 1. Same-base chaos flips
    // poe.ninja field meanings (from the OTHER party's perspective):
    //   pay:     others pay X to get chaos → YOU sell X at this rate → sell price = 1/pay.value
    //   receive: others receive X for chaos → YOU buy X at this rate → buy price = receive.value
    for (const line of viableLines) {
      if (!line.pay || !line.receive) continue;

      const buyPriceChaos = line.receive.value;       // cost to buy 1 unit (chaos you spend)
      const sellPriceChaos = 1 / line.pay.value;      // revenue selling 1 unit (chaos you get)

      if (buyPriceChaos <= 0 || sellPriceChaos <= 0) continue;

      // Skip if sell/buy ratio is unrealistic — indicates bad pay-side data
      if (sellPriceChaos / buyPriceChaos > MAX_SPREAD_RATIO) continue;

      const profitPerTrade = sellPriceChaos - buyPriceChaos;
      if (profitPerTrade <= filters.minProfit) continue;

      const minListings = Math.min(line.pay.listing_count, line.receive.listing_count);
      if (minListings < filters.minListings) continue;

      const detail = detailsMap.get(line.currencyTypeName);

      flips.push({
        buyCurrency: {
          name: line.currencyTypeName,
          icon: detail?.icon ?? null,
          tradeId: detail?.tradeId ?? line.detailsId,
          chaosEquivalent: line.chaosEquivalent,
        },
        sellCurrency: {
          name: 'Chaos Orb',
          icon: chaosDetail?.icon ?? null,
          tradeId: 'chaos',
          chaosEquivalent: 1,
        },
        buyRate: buyPriceChaos,
        sellRate: sellPriceChaos,
        profitPerTrade,
        profitPerHour: profitPerTrade * minListings * TRADES_PER_LISTING,
        roi: (profitPerTrade / buyPriceChaos) * 100,
        buyListingCount: line.pay.listing_count,
        sellListingCount: line.receive.listing_count,
        steps: [
          { action: 'buy', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: buyPriceChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: line.receive.listing_count },
          { action: 'sell', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: sellPriceChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: line.pay.listing_count },
        ],
      });
    }

    // 2. Cross-base flips involving Divine Orb
    if (divineLine && divineLine.pay && divineLine.receive) {
      const divineBuyPriceChaos = divineLine.receive.value;        // cost to buy 1 divine
      const divineSellPriceChaos = 1 / divineLine.pay.value;       // revenue selling 1 divine

      for (const line of viableLines) {
        if (line.currencyTypeName === 'Divine Orb') continue;
        if (!line.pay || !line.receive) continue;

        const detail = detailsMap.get(line.currencyTypeName);

        // Direction A: Buy X with chaos -> sell X for divines -> sell divines for chaos
        const buyXWithChaos = line.receive.value;                  // cost to buy 1 X
        const xToDivines = line.chaosEquivalent / divineLine.chaosEquivalent;
        const sellViaDivine = xToDivines * divineSellPriceChaos;
        const profitA = sellViaDivine - buyXWithChaos;

        if (sellViaDivine / buyXWithChaos > MAX_SPREAD_RATIO) continue;
        if (profitA > filters.minProfit) {
          const minListingsA = Math.min(line.pay.listing_count, divineLine.receive.listing_count);
          if (minListingsA >= filters.minListings) {
            flips.push({
              buyCurrency: {
                name: line.currencyTypeName,
                icon: detail?.icon ?? null,
                tradeId: detail?.tradeId ?? line.detailsId,
                chaosEquivalent: line.chaosEquivalent,
              },
              sellCurrency: {
                name: 'Divine Orb',
                icon: divineDetail?.icon ?? null,
                tradeId: divineDetail?.tradeId ?? 'divine',
                chaosEquivalent: divineLine.chaosEquivalent,
              },
              buyRate: buyXWithChaos,
              sellRate: sellViaDivine,
              profitPerTrade: profitA,
              profitPerHour: profitA * minListingsA * TRADES_PER_LISTING,
              roi: (profitA / buyXWithChaos) * 100,
              buyListingCount: line.pay.listing_count,
              sellListingCount: divineLine.receive.listing_count,
              steps: [
                { action: 'buy', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: buyXWithChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: line.receive.listing_count },
                { action: 'sell', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: xToDivines, priceCurrency: 'Divine Orb', priceCurrencyIcon: divineDetail?.icon ?? null, listings: line.pay.listing_count },
                { action: 'sell', currency: 'Divine Orb', currencyIcon: divineDetail?.icon ?? null, price: divineSellPriceChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: divineLine.pay.listing_count },
              ],
            });
          }
        }

        // Direction B: Buy divines with chaos -> buy X with divines -> sell X for chaos
        const divinesPerX = line.chaosEquivalent / divineLine.chaosEquivalent;
        const buyXViaDivine = divineBuyPriceChaos * divinesPerX;
        const sellXForChaos = 1 / line.pay.value;                 // revenue selling 1 X

        if (sellXForChaos / buyXViaDivine > MAX_SPREAD_RATIO) continue;
        const profitB = sellXForChaos - buyXViaDivine;

        if (profitB > filters.minProfit) {
          const minListingsB = Math.min(divineLine.pay.listing_count, line.receive.listing_count);
          if (minListingsB >= filters.minListings) {
            flips.push({
              buyCurrency: {
                name: `${line.currencyTypeName} (via Divine)`,
                icon: detail?.icon ?? null,
                tradeId: detail?.tradeId ?? line.detailsId,
                chaosEquivalent: line.chaosEquivalent,
              },
              sellCurrency: {
                name: 'Chaos Orb',
                icon: chaosDetail?.icon ?? null,
                tradeId: 'chaos',
                chaosEquivalent: 1,
              },
              buyRate: buyXViaDivine,
              sellRate: sellXForChaos,
              profitPerTrade: profitB,
              profitPerHour: profitB * minListingsB * TRADES_PER_LISTING,
              roi: (profitB / buyXViaDivine) * 100,
              buyListingCount: divineLine.pay.listing_count,
              sellListingCount: line.receive.listing_count,
              steps: [
                { action: 'buy', currency: 'Divine Orb', currencyIcon: divineDetail?.icon ?? null, price: divineBuyPriceChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: divineLine.receive.listing_count },
                { action: 'buy', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: divinesPerX, priceCurrency: 'Divine Orb', priceCurrencyIcon: divineDetail?.icon ?? null, listings: line.receive.listing_count },
                { action: 'sell', currency: line.currencyTypeName, currencyIcon: detail?.icon ?? null, price: sellXForChaos, priceCurrency: 'Chaos Orb', priceCurrencyIcon: chaosDetail?.icon ?? null, listings: line.pay.listing_count },
              ],
            });
          }
        }
      }
    }

    return this.sortFlips(flips, filters.sortBy);
  }

  private sortFlips(flips: FlipOpportunity[], sortBy: SortField): FlipOpportunity[] {
    return flips.sort((a, b) => b[sortBy] - a[sortBy]);
  }

  private buildDetailsMap(details: NinjaCurrencyDetail[]): Map<string, NinjaCurrencyDetail> {
    const map = new Map<string, NinjaCurrencyDetail>();
    for (const d of details) {
      map.set(d.name, d);
    }
    return map;
  }
}
