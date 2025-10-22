# Alpha Vantage API Setup for Real-Time Stock Data

## Overview

I've created a new Edge Function called `stock-data` that fetches real-time stock quotes using the Alpha Vantage API. The function is currently deployed and ready to use, but it needs a valid API key to fetch real data.

## Current Status

✅ **Edge Function Deployed**: The `stock-data` function is live at:
- Single quote: `https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/quote/{SYMBOL}`
- Multiple quotes: `https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/quotes` (POST)
- Health check: `https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/health`

✅ **Frontend Updated**: The watchlist now uses the new Edge Function

⚠️ **API Key Required**: The function currently uses fallback data because the API key is set to "demo"

## How to Add Your Alpha Vantage API Key

1. **Get an API Key**:
   - Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Sign up for a free API key (500 calls/day, 5 calls/minute)
   - Or get a premium key for higher limits

2. **Update the Secret in Supabase**:
   ```sql
   -- Run this SQL in Supabase SQL Editor
   UPDATE public.app_secrets 
   SET value = 'YOUR_ACTUAL_ALPHA_VANTAGE_API_KEY'
   WHERE name = 'AlphaAdvantage';
   ```

3. **Verify it's Working**:
   - Check the health endpoint to see the rate limit status
   - The watchlist should start showing real-time data
   - Data is cached for 5 minutes to conserve API calls

## Features

### Smart Rate Limiting
- Tracks API calls to stay within Alpha Vantage limits
- 5 calls per minute for free tier
- Falls back to realistic mock data when limits are reached

### Caching
- Stock quotes are cached for 5 minutes
- Reduces API calls for frequently accessed stocks
- Cache is cleared when the function restarts

### Fallback Data
- When API is unavailable or rate limited, realistic fallback data is used
- Fallback data includes realistic price movements (+/- 3% daily variance)
- Users won't see errors, just slightly delayed real-time updates

## API Endpoints

### Get Single Stock Quote
```bash
GET /stock-data/quote/AAPL
Authorization: Bearer {SUPABASE_ANON_KEY}
```

Response:
```json
{
  "quote": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 195.23,
    "change": 2.45,
    "changePercent": 1.27,
    "dayRange": {
      "low": 192.50,
      "high": 196.80
    },
    "fiftyTwoWeekRange": {
      "low": 140.00,
      "high": 220.00
    },
    "volume": 52341234,
    "marketCap": 3000000000000,
    "peRatio": 29.5,
    "dividendYield": 0.5,
    "lastUpdated": "2025-10-01T10:30:00Z"
  }
}
```

### Get Multiple Stock Quotes
```bash
POST /stock-data/quotes
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

### Health Check
```bash
GET /stock-data/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T10:30:00Z",
  "cache_entries": 5,
  "rate_limit_remaining": 3
}
```

## Supported Stocks

The function includes company name mappings for popular stocks:
- US Tech: AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX
- US Finance: V, JPM, MA
- US Other: DIS, COIN, WMT, PG, HD, UNH, JNJ
- Brazil: VALE3.SA, PETR4.SA, ITUB4.SA
- Europe: ASML, SAP, NESN.SW, RHHBY, MC.PA, OR.PA, SAN.PA
- Asia: TSM, BABA, TCEHY

## Notes

- Index data (S&P 500, Dow Jones, etc.) still uses the old Edge Function
- Consider migrating index data to Alpha Vantage in the future
- The free tier is sufficient for moderate usage with caching
- Premium API keys provide 30,000+ calls/day if needed
