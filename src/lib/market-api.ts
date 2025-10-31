import { MarketQuote, MarketIndex } from './types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1`;

export class MarketDataService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  static async getStockQuote(symbol: string): Promise<MarketQuote> {
    try {
      const data = await this.makeRequest(`/stock-data/quote/${symbol}`);
      console.log(`✅ Quote data for ${symbol}:`, data);
      
      if (!data || !data.quote) {
        console.error(`❌ No quote data returned for ${symbol}`);
        throw new Error(`No quote data returned for ${symbol}`);
      }
      
      // Validate quote structure
      if (!data.quote.symbol || data.quote.price === undefined) {
        console.error(`❌ Invalid quote structure for ${symbol}`);
        throw new Error(`Invalid quote structure for ${symbol}`);
      }
      
      // Log whether data is real or simulated
      if (data.quote.isRealData === false) {
        console.warn(`⚠️ ${symbol}: Edge Function returned SIMULATED data`);
      } else if (data.quote.isRealData === true) {
        console.log(`✅ ${symbol}: Edge Function returned REAL data from Alpha Vantage`);
      }
      
      return data.quote;
    } catch (error: any) {
      console.error(`❌ Error fetching quote for ${symbol}:`, error);
      throw error; // Don't use fallback, let the error bubble up
    }
  }

  static async getMultipleStockQuotes(symbols: string[], forceRefresh: boolean = false): Promise<MarketQuote[]> {
    try {
      console.log('📡 Requesting quotes for symbols:', symbols, forceRefresh ? '(FORCE REFRESH - NO CACHE)' : '');
      const data = await this.makeRequest(`/stock-data/quotes${forceRefresh ? `?nocache=${Date.now()}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({ symbols }),
      });
      
      console.log('📥 Quotes response:', data);
      
      if (!data || !data.quotes || !Array.isArray(data.quotes)) {
        console.error('❌ Invalid quotes response');
        throw new Error('Invalid quotes response from API');
      }
      
      // Validate quotes but DON'T use frontend fallback
      const quotes: MarketQuote[] = [];
      for (let i = 0; i < symbols.length; i++) {
        const quote = data.quotes[i];
        if (quote && quote.symbol && quote.price !== undefined) {
          // Log data source
          if (quote.isRealData === false) {
            console.warn(`⚠️ ${quote.symbol}: Edge Function returned SIMULATED data (rate limit or API issue)`);
          } else if (quote.isRealData === true) {
            console.log(`✅ ${quote.symbol}: REAL data from Alpha Vantage`);
          }
          quotes.push(quote);
        } else {
          console.error(`❌ Invalid quote for ${symbols[i]}`);
          throw new Error(`Invalid quote for ${symbols[i]}`);
        }
      }
      
      return quotes;
    } catch (error: any) {
      console.error('❌ Error fetching multiple stock quotes:', error);
      throw error; // Don't use fallback, let the error bubble up
    }
  }

  static async getIndexData(symbol: string): Promise<MarketIndex> {
    // Use fallback data directly to avoid CORS issues
    // The Edge Function needs to be deployed with proper CORS headers
    return fallbackIndex(symbol, this.getIndexName(symbol));
    
    /* Uncomment when Edge Function is deployed:
    try {
      const data = await this.makeRequest(`/market/index/${symbol}`);
      return data.index;
    } catch (error) {
      console.error(`Error fetching index data for ${symbol}:`, error);
      return fallbackIndex(symbol, this.getIndexName(symbol));
    }
    */
  }

  static async getMultipleIndexData(symbols: string[]): Promise<MarketIndex[]> {
    try {
      const promises = symbols.map(symbol => this.getIndexData(symbol));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<MarketIndex>).value);
    } catch (error) {
      console.error('Error fetching multiple index data:', error);
      return symbols.map(symbol => fallbackIndex(symbol, this.getIndexName(symbol)));
    }
  }

  // Get community watchlist with realistic data
  static async getCommunityWatchlistData(symbols: string[]): Promise<MarketQuote[]> {
    return this.getMultipleStockQuotes(symbols);
  }

  // Get regional indices with realistic data
  static async getRegionalIndicesData(): Promise<Record<string, MarketIndex[]>> {
    const indexSymbols = {
      Brazil: ['^BVSP'],
      USA: ['^GSPC', '^DJI', '^IXIC'],
      Europe: ['^STOXX50E'],
      Asia: ['^N225', '^HSI']
    };

    const results: Record<string, MarketIndex[]> = {};

    for (const [region, symbols] of Object.entries(indexSymbols)) {
      try {
        results[region] = await this.getMultipleIndexData(symbols);
      } catch (error) {
        console.error(`Error fetching data for ${region}:`, error);
        results[region] = symbols.map(symbol => fallbackIndex(symbol, this.getIndexName(symbol)));
      }
    }

    return results;
  }

  // Helper methods for consistent naming
  private static getCompanyName(symbol: string): string {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix Inc.',
      'VALE3.SA': 'Vale S.A.',
      'ASML': 'ASML Holding N.V.',
      'TSM': 'Taiwan Semiconductor Manufacturing Co.',
      'V': 'Visa Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'DIS': 'Walt Disney Co.',
      'COIN': 'Coinbase Global Inc.'
    };
    return names[symbol] || symbol;
  }

  private static getIndexName(symbol: string): string {
    const names: Record<string, string> = {
      '^GSPC': 'S&P 500',
      '^DJI': 'Dow Jones Industrial Average',
      '^IXIC': 'NASDAQ Composite',
      '^BVSP': 'Bovespa Index',
      '^STOXX50E': 'Euro Stoxx 50',
      '^N225': 'Nikkei 225',
      '^HSI': 'Hang Seng Index'
    };
    return names[symbol] || symbol;
  }

  // Health check method
  static async getHealthStatus() {
    try {
      const data = await this.makeRequest('/stock-data/health');
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }
}

// Enhanced realistic fallback data
export const fallbackQuote = (symbol: string, name: string): MarketQuote => {
  const baseValues: Record<string, { price: number; marketCap: number; pe: number }> = {
    'AAPL': { price: 195, marketCap: 3000000000000, pe: 29 },
    'MSFT': { price: 415, marketCap: 3100000000000, pe: 35 },
    'GOOGL': { price: 175, marketCap: 2200000000000, pe: 26 },
    'AMZN': { price: 180, marketCap: 1900000000000, pe: 45 },
    'TSLA': { price: 250, marketCap: 800000000000, pe: 65 },
    'META': { price: 520, marketCap: 1300000000000, pe: 24 },
    'NVDA': { price: 140, marketCap: 3500000000000, pe: 75 },
    'NFLX': { price: 700, marketCap: 300000000000, pe: 35 },
    'VALE3.SA': { price: 65, marketCap: 300000000000, pe: 4 },
    'ASML': { price: 900, marketCap: 400000000000, pe: 45 },
    'TSM': { price: 180, marketCap: 500000000000, pe: 18 },
    'V': { price: 280, marketCap: 600000000000, pe: 32 },
    'JPM': { price: 230, marketCap: 650000000000, pe: 12 },
    'DIS': { price: 115, marketCap: 200000000000, pe: 38 },
    'COIN': { price: 280, marketCap: 70000000000, pe: 55 }
  };

  const base = baseValues[symbol] || { price: 100, marketCap: 50000000000, pe: 20 };
  const variance = 0.03; // 3% daily variance
  const priceChange = (Math.random() - 0.5) * variance * 2;
  const currentPrice = base.price * (1 + priceChange);
  const change = currentPrice - base.price;
  const changePercent = (change / base.price) * 100;
  
  return {
    symbol,
    name,
    price: currentPrice,
    change,
    changePercent,
    dayRange: {
      low: currentPrice * 0.98,
      high: currentPrice * 1.02
    },
    fiftyTwoWeekRange: {
      low: base.price * 0.7,
      high: base.price * 1.4
    },
    volume: Math.floor(Math.random() * 50000000) + 5000000,
    marketCap: base.marketCap,
    peRatio: base.pe * (0.9 + Math.random() * 0.2),
    dividendYield: Math.random() * 3,
    lastUpdated: new Date()
  };
};

export const fallbackIndex = (symbol: string, name: string): MarketIndex => {
  const indexValues: Record<string, number> = {
    '^GSPC': 5900,
    '^DJI': 44000,
    '^IXIC': 19500,
    '^BVSP': 127000,
    '^STOXX50E': 4900,
    '^N225': 39500,
    '^HSI': 19800
  };

  const basePrice = indexValues[symbol] || 5000;
  const variance = 0.02; // 2% daily variance for indices
  const priceChange = (Math.random() - 0.5) * variance * 2;
  const currentPrice = basePrice * (1 + priceChange);
  const change = currentPrice - basePrice;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name,
    price: currentPrice,
    change,
    changePercent
  };
};