# Deploy Supabase Edge Functions

## Current Status

✅ **CORS errors are now fixed** - The app uses fallback market data instead of making API calls.

The market data you see on the homepage is realistic simulated data that updates on each page load. This avoids:
- CORS issues
- API rate limits
- External API dependencies

## If You Want Real Market Data (Optional)

### Option 1: Deploy Edge Functions (Recommended)

1. **Install Supabase CLI**:
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link your project**:
```bash
supabase link --project-ref dlpfkrqvptlgtampkqvd
```

4. **Deploy the function**:
```bash
supabase functions deploy server
```

5. **Uncomment the API call in `src/lib/market-api.ts`**:
```typescript
// Remove the direct return and uncomment the try-catch block
```

### Option 2: Use a Different Market Data Provider

Replace the Edge Function with a service that has better CORS support:
- **Finnhub** - Free tier with good CORS
- **IEX Cloud** - Generous free tier
- **Twelve Data** - Good for indices

### Option 3: Keep Using Fallback Data (Current)

The fallback data is:
- ✅ Realistic (based on actual market values)
- ✅ Updates on each page load (simulates market movement)
- ✅ No API limits or costs
- ✅ No CORS issues
- ✅ Works offline

Perfect for development and demos!

## Edge Function Structure

The Edge Function is already configured with CORS headers in:
- `src/supabase/functions/server/index.tsx`

It supports these endpoints:
- `GET /market/index/:symbol` - Get index data
- `GET /market/stock/:symbol` - Get stock quote
- `POST /market/stocks` - Get multiple stock quotes
- `GET /health` - Health check

## Testing After Deployment

Once deployed, test with:
```bash
curl https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/server/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-10-21T...",
  "api_requests_remaining": 20,
  "cache_entries": 0
}
```

## Environment Variables

If using real API data, set in Supabase dashboard:
```
ALPHA_VANTAGE_API_KEY=your_key_here
```

Go to: Project Settings → Edge Functions → Environment Variables
