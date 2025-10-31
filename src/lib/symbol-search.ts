import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1`;

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

// Popular symbols list for fallback
const POPULAR_SYMBOLS: SymbolSearchResult[] = [
  // US Tech
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Equity', region: 'United States' },
  
  // US Finance
  { symbol: 'V', name: 'Visa Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Equity', region: 'United States' },
  { symbol: 'BAC', name: 'Bank of America Corp.', type: 'Equity', region: 'United States' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'Equity', region: 'United States' },
  
  // US Consumer
  { symbol: 'DIS', name: 'Walt Disney Co.', type: 'Equity', region: 'United States' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', type: 'Equity', region: 'United States' },
  
  // US Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Equity', region: 'United States' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'Equity', region: 'United States' },
  
  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', region: 'United States' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', region: 'United States' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', region: 'United States' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', region: 'United States' },
  
  // Brazil
  { symbol: 'PETR4.SA', name: 'Petrobras', type: 'Equity', region: 'Brazil' },
  { symbol: 'VALE3.SA', name: 'Vale S.A.', type: 'Equity', region: 'Brazil' },
  { symbol: 'ITUB4.SA', name: 'Itaú Unibanco', type: 'Equity', region: 'Brazil' },
  { symbol: 'BBDC4.SA', name: 'Banco Bradesco S.A.', type: 'Equity', region: 'Brazil' },
  { symbol: 'ABEV3.SA', name: 'Ambev S.A.', type: 'Equity', region: 'Brazil' },
  
  // Europe
  { symbol: 'ASML', name: 'ASML Holding N.V.', type: 'Equity', region: 'Netherlands' },
  { symbol: 'SAP', name: 'SAP SE', type: 'Equity', region: 'Germany' },
  { symbol: 'NESN.SW', name: 'Nestlé S.A.', type: 'Equity', region: 'Switzerland' },
  { symbol: 'MC.PA', name: 'LVMH Moët Hennessy', type: 'Equity', region: 'France' },
  
  // Asia
  { symbol: 'TSM', name: 'Taiwan Semiconductor', type: 'Equity', region: 'Taiwan' },
  { symbol: 'BABA', name: 'Alibaba Group', type: 'Equity', region: 'China' },
  { symbol: '005930.KS', name: 'Samsung Electronics', type: 'Equity', region: 'South Korea' },
];

export class SymbolSearchService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
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

  static async searchSymbols(query: string, limit: number = 10): Promise<SymbolSearchResult[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const upperQuery = query.toUpperCase();
    
    // First, try to get results from API
    try {
      const data = await this.makeRequest(`/stock-data/search/${encodeURIComponent(query)}?limit=${limit}`);
      if (data && data.results && Array.isArray(data.results)) {
        return data.results;
      }
    } catch (error) {
      console.warn('Symbol search API error, using local fallback:', error);
    }

    // Fallback to local popular symbols
    return POPULAR_SYMBOLS
      .filter(symbol => 
        symbol.symbol.toUpperCase().includes(upperQuery) ||
        symbol.name.toUpperCase().includes(upperQuery)
      )
      .slice(0, limit);
  }

  static getPopularSymbols(limit: number = 20): SymbolSearchResult[] {
    return POPULAR_SYMBOLS.slice(0, limit);
  }
}

