// --- poe.ninja response types ---

export interface NinjaPriceData {
  id: number;
  league_id: number;
  pay_currency_id: number;
  get_currency_id: number;
  sample_time_utc: string;
  count: number;
  value: number;
  data_point_count: number;
  includes_secondary: boolean;
  listing_count: number;
}

export interface NinjaCurrencyLine {
  currencyTypeName: string;
  detailsId: string;
  chaosEquivalent: number;
  pay: NinjaPriceData | null;
  receive: NinjaPriceData | null;
}

export interface NinjaCurrencyDetail {
  id: number;
  name: string;
  icon: string | null;
  tradeId?: string;
}

export interface NinjaCurrencyOverview {
  lines: NinjaCurrencyLine[];
  currencyDetails: NinjaCurrencyDetail[];
}

// --- Normalized internal types ---

export interface CurrencyInfo {
  name: string;
  icon: string | null;
  tradeId: string;
  chaosEquivalent: number;
}

export interface CurrencyRate {
  currencyName: string;
  chaosEquivalent: number;
  payValue: number | null;     // chaos per 1 unit (buying from others)
  receiveValue: number | null; // chaos per 1 unit (selling to others)
  payListingCount: number;
  receiveListingCount: number;
}

// --- Flip types ---

export type SortField = 'profitPerTrade' | 'profitPerHour' | 'roi';

export interface TradeStep {
  action: 'buy' | 'sell';
  currency: string;          // currency being bought/sold
  currencyIcon: string | null;
  price: number;             // rate for this step
  priceCurrency: string;     // what you're paying/receiving in (e.g. "Chaos Orb", "Divine Orb")
  priceCurrencyIcon: string | null;
  listings: number;
}

export interface FlipOpportunity {
  buyCurrency: CurrencyInfo;
  sellCurrency: CurrencyInfo;
  buyRate: number;           // total chaos cost to buy 1 buyCurrency
  sellRate: number;          // total chaos received selling 1 buyCurrency
  profitPerTrade: number;    // in chaos equivalent
  profitPerHour: number;     // profit * estimated trades/hr
  roi: number;               // percentage
  buyListingCount: number;
  sellListingCount: number;
  steps: TradeStep[];        // step-by-step instructions for executing the flip
  validated?: 'pending' | 'validated' | 'not_viable';
}

export interface FlipFilters {
  minProfit: number;
  minListings: number;
  sortBy: SortField;
}

// --- GGG Trade API types ---

export interface TradeExchangeQuery {
  exchange: {
    status: { option: string };
    have: string[];
    want: string[];
    minimum?: number;
  };
}

export interface TradeListing {
  accountName: string;
  whisper: string;
  stock: number;
  buyAmount: number;
  sellAmount: number;
  conversionRate: number;
  listingAge: string;
}

export interface ValidationResult {
  buyCurrency: string;
  sellCurrency: string;
  viable: boolean;
  listings: TradeListing[];
  avgRate: number | null;
}

// --- League types ---

export interface League {
  id: string;
  realm: string;
  startAt: string;
  endAt: string | null;
}

// --- API response wrapper ---

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  cachedAt: string | null;
}
