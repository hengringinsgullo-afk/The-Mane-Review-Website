// Mock data for The Mane Review

import { Article, MarketQuote, CommunityWatchlistItem, MarketIndex, User, EarningsCall } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Henrique Gullo',
    email: 'henrique@themanereviw.com',
    role: 'Admin'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@stpauls.edu',
    role: 'Student'
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    email: 'marcus@themanereviw.com',
    role: 'Editor'
  }
];

// Mock Articles
export const mockArticles: Article[] = [];

// Regional Market Indices
export const regionalIndices: Record<string, MarketIndex[]> = {
  'South America': [
    {
      symbol: '^BVSP',
      name: 'Ibovespa (Brazil)',
      price: 126847.32,
      change: 1247.89,
      changePercent: 0.99
    },
    {
      symbol: '^MERV',
      name: 'Merval (Argentina)',
      price: 1678234.56,
      change: 34567.89,
      changePercent: 2.10
    },
    {
      symbol: '^IPSA',
      name: 'IPSA (Chile)',
      price: 5234.67,
      change: -45.23,
      changePercent: -0.86
    },
    {
      symbol: 'VALE3.SA',
      name: 'Vale (Mining)',
      price: 78.45,
      change: 1.23,
      changePercent: 1.59
    },
    {
      symbol: 'PETR4.SA',
      name: 'Petrobras (Energy)',
      price: 38.92,
      change: 0.78,
      changePercent: 2.05
    },
    {
      symbol: 'ITUB4.SA',
      name: 'Itaú Unibanco (Banking)',
      price: 32.15,
      change: -0.45,
      changePercent: -1.38
    }
  ],
  USA: [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      price: 4718.50,
      change: -23.45,
      changePercent: -0.49
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      price: 36124.23,
      change: 45.78,
      changePercent: 0.13
    },
    {
      symbol: '^IXIC',
      name: 'Nasdaq',
      price: 14567.98,
      change: -67.23,
      changePercent: -0.46
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 189.45,
      change: 2.34,
      changePercent: 1.25
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft',
      price: 378.92,
      change: -5.67,
      changePercent: -1.47
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet',
      price: 142.67,
      change: 1.89,
      changePercent: 1.34
    },
    {
      symbol: 'AMZN',
      name: 'Amazon',
      price: 157.34,
      change: -2.45,
      changePercent: -1.53
    },
    {
      symbol: 'TSLA',
      name: 'Tesla',
      price: 234.56,
      change: 8.90,
      changePercent: 3.94
    }
  ],
  Europe: [
    {
      symbol: '^STOXX50E',
      name: 'Euro Stoxx 50',
      price: 4456.78,
      change: 12.34,
      changePercent: 0.28
    },
    {
      symbol: '^FTSE',
      name: 'FTSE 100 (UK)',
      price: 7892.34,
      change: -45.67,
      changePercent: -0.58
    },
    {
      symbol: '^GDAXI',
      name: 'DAX (Germany)',
      price: 16234.56,
      change: 123.45,
      changePercent: 0.77
    },
    {
      symbol: '^FCHI',
      name: 'CAC 40 (France)',
      price: 7345.67,
      change: 34.56,
      changePercent: 0.47
    },
    {
      symbol: 'ASML',
      name: 'ASML Holding',
      price: 678.90,
      change: 12.34,
      changePercent: 1.85
    },
    {
      symbol: 'NESN.SW',
      name: 'Nestlé',
      price: 112.34,
      change: -1.23,
      changePercent: -1.08
    },
    {
      symbol: 'SAP',
      name: 'SAP SE',
      price: 156.78,
      change: 2.45,
      changePercent: 1.59
    },
    {
      symbol: 'MC.PA',
      name: 'LVMH',
      price: 789.45,
      change: 15.67,
      changePercent: 2.02
    }
  ],
  Asia: [
    {
      symbol: '^N225',
      name: 'Nikkei 225 (Japan)',
      price: 33486.89,
      change: -234.56,
      changePercent: -0.69
    },
    {
      symbol: '^HSI',
      name: 'Hang Seng (Hong Kong)',
      price: 17892.45,
      change: 156.78,
      changePercent: 0.88
    },
    {
      symbol: '^STI',
      name: 'STI (Singapore)',
      price: 3234.56,
      change: 12.34,
      changePercent: 0.38
    },
    {
      symbol: '^KS11',
      name: 'KOSPI (South Korea)',
      price: 2489.34,
      change: -23.45,
      changePercent: -0.93
    },
    {
      symbol: 'TSM',
      name: 'Taiwan Semiconductor',
      price: 567.89,
      change: 8.90,
      changePercent: 1.59
    },
    {
      symbol: '7203.T',
      name: 'Toyota Motor',
      price: 2345.67,
      change: 34.56,
      changePercent: 1.50
    },
    {
      symbol: '005930.KS',
      name: 'Samsung Electronics',
      price: 67890.00,
      change: -567.89,
      changePercent: -0.83
    },
    {
      symbol: '9988.HK',
      name: 'Alibaba Group',
      price: 89.45,
      change: 2.34,
      changePercent: 2.69
    },
    {
      symbol: '0700.HK',
      name: 'Tencent Holdings',
      price: 345.67,
      change: -4.56,
      changePercent: -1.30
    }
  ]
};

// Community Watchlist (curated by Investment Club)
export const communityWatchlist: CommunityWatchlistItem[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    rationale: 'Strong ecosystem and services growth, AI integration potential',
    active: true,
    sortOrder: 1
  },
  {
    id: '2',
    symbol: 'VALE3.SA',
    name: 'Vale S.A.',
    rationale: 'Leading iron ore producer, benefiting from infrastructure demand',
    active: true,
    sortOrder: 2
  },
  {
    id: '3',
    symbol: 'ASML',
    name: 'ASML Holding N.V.',
    rationale: 'Monopoly in EUV lithography for advanced semiconductors',
    active: true,
    sortOrder: 3
  },
  {
    id: '4',
    symbol: 'TSM',
    name: 'Taiwan Semiconductor',
    rationale: 'Dominant foundry player in AI chip manufacturing',
    active: true,
    sortOrder: 4
  }
];

// Mock market quotes (would come from real-time API)
export const generateMockQuote = (symbol: string, name: string): MarketQuote => {
  const basePrice = Math.random() * 500 + 50;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name,
    price: basePrice,
    change,
    changePercent,
    dayRange: {
      low: basePrice - Math.abs(change) * 1.5,
      high: basePrice + Math.abs(change) * 1.5
    },
    fiftyTwoWeekRange: {
      low: basePrice * 0.7,
      high: basePrice * 1.4
    },
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    peRatio: Math.random() * 50 + 5,
    dividendYield: Math.random() * 8,
    lastUpdated: new Date()
  };
};

// Upcoming earnings calls for companies >$10B market cap
export const upcomingEarningsCalls: Record<string, EarningsCall[]> = {
  USA: [
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      marketCap: 3100.5,
      earningsDate: new Date('2025-01-21T16:30:00Z'),
      estimatedEPS: 2.18,
      previousEPS: 2.10,
      sector: 'Technology',
      region: 'USA'
    },
    {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      marketCap: 2850.2,
      earningsDate: new Date('2025-01-23T16:30:00Z'),
      estimatedEPS: 2.78,
      previousEPS: 2.69,
      sector: 'Technology',
      region: 'USA'
    },
    {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc.',
      marketCap: 1700.8,
      earningsDate: new Date('2025-01-26T16:30:00Z'),
      estimatedEPS: 1.85,
      previousEPS: 1.73,
      sector: 'Technology',
      region: 'USA'
    },
    {
      symbol: 'AMZN',
      companyName: 'Amazon.com Inc.',
      marketCap: 1450.3,
      earningsDate: new Date('2025-01-27T16:30:00Z'),
      estimatedEPS: 0.74,
      previousEPS: 0.65,
      sector: 'Consumer Discretionary',
      region: 'USA'
    },
    {
      symbol: 'TSLA',
      companyName: 'Tesla Inc.',
      marketCap: 780.6,
      earningsDate: new Date('2025-01-28T16:30:00Z'),
      estimatedEPS: 0.73,
      previousEPS: 0.66,
      sector: 'Consumer Discretionary',
      region: 'USA'
    },
    {
      symbol: 'META',
      companyName: 'Meta Platforms Inc.',
      marketCap: 890.4,
      earningsDate: new Date('2025-01-30T16:30:00Z'),
      estimatedEPS: 4.62,
      previousEPS: 4.39,
      sector: 'Technology',
      region: 'USA'
    }
  ],
  Europe: [
    {
      symbol: 'ASML',
      companyName: 'ASML Holding N.V.',
      marketCap: 280.7,
      earningsDate: new Date('2025-01-22T08:00:00Z'),
      estimatedEPS: 4.92,
      previousEPS: 4.45,
      sector: 'Technology',
      region: 'Europe'
    },
    {
      symbol: 'SAP',
      companyName: 'SAP SE',
      marketCap: 225.3,
      earningsDate: new Date('2025-01-24T07:30:00Z'),
      estimatedEPS: 1.95,
      previousEPS: 1.88,
      sector: 'Technology',
      region: 'Europe'
    },
    {
      symbol: 'NESN.SW',
      companyName: 'Nestlé S.A.',
      marketCap: 315.2,
      earningsDate: new Date('2025-01-29T07:00:00Z'),
      estimatedEPS: 3.82,
      previousEPS: 3.78,
      sector: 'Consumer Staples',
      region: 'Europe'
    }
  ],
  Asia: [
    {
      symbol: 'TSM',
      companyName: 'Taiwan Semiconductor Manufacturing Company',
      marketCap: 520.8,
      earningsDate: new Date('2025-01-25T06:00:00Z'),
      estimatedEPS: 1.28,
      previousEPS: 1.15,
      sector: 'Technology',
      region: 'Asia'
    },
    {
      symbol: '7203.T',
      companyName: 'Toyota Motor Corporation',
      marketCap: 245.6,
      earningsDate: new Date('2025-01-27T06:30:00Z'),
      estimatedEPS: 4.65,
      previousEPS: 4.22,
      sector: 'Consumer Discretionary',
      region: 'Asia'
    },
    {
      symbol: '005930.KS',
      companyName: 'Samsung Electronics Co., Ltd.',
      marketCap: 380.9,
      earningsDate: new Date('2025-01-31T05:00:00Z'),
      estimatedEPS: 5.12,
      previousEPS: 4.88,
      sector: 'Technology',
      region: 'Asia'
    }
  ],
  'South America': [
    {
      symbol: 'VALE3.SA',
      companyName: 'Vale S.A.',
      marketCap: 55.8,
      earningsDate: new Date('2025-01-26T10:00:00Z'),
      estimatedEPS: 1.45,
      previousEPS: 1.38,
      sector: 'Materials',
      region: 'Brazil'
    },
    {
      symbol: 'PETR4.SA',
      companyName: 'Petróleo Brasileiro S.A. - Petrobras',
      marketCap: 78.9,
      earningsDate: new Date('2025-01-28T09:30:00Z'),
      estimatedEPS: 2.23,
      previousEPS: 2.10,
      sector: 'Energy',
      region: 'Brazil'
    },
    {
      symbol: 'ITUB4.SA',
      companyName: 'Itaú Unibanco Holding S.A.',
      marketCap: 42.3,
      earningsDate: new Date('2025-01-30T10:30:00Z'),
      estimatedEPS: 0.85,
      previousEPS: 0.79,
      sector: 'Financial Services',
      region: 'Brazil'
    }
  ]
};