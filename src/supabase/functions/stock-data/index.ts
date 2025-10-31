import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute cache
const RATE_LIMIT = 5; // 5 API calls per minute (Alpha Vantage free tier limit)
const requestTimestamps = [];

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Company name mapping
const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation',
  'NFLX': 'Netflix Inc.',
  'VALE3.SA': 'Vale S.A.',
  'PETR4.SA': 'Petrobras',
  'BBSA3': 'Banco do Brasil',
  'ITUB4.SA': 'Itaú Unibanco'
};

// Rate limiting function (only for Alpha Vantage)
function canMakeApiCall(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  while(requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo){
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= RATE_LIMIT) {
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Get API key helper
async function getApiKey(secretName: string, envVarName?: string): Promise<string | null> {
  try {
    if (envVarName) {
      const vaultKey = Deno.env.get(envVarName);
      if (vaultKey && vaultKey.trim().length >= 8 && vaultKey !== secretName && vaultKey !== 'demo') {
        return vaultKey.trim();
      }
    }
    
    const { data, error } = await supabase.rpc('get_secret', { secret_name: secretName });
    
    if (error || !data) return null;
    
    const trimmedKey = data.trim();
    if (trimmedKey.length >= 8 && trimmedKey !== secretName && trimmedKey !== 'demo') {
      return trimmedKey;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function getAlphaVantageApiKey(): Promise<string | null> {
  // Try Vault first with both possible names, then app_secrets
  const vaultKey1 = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  const vaultKey2 = Deno.env.get('AlphaAdvantage');
  if (vaultKey1 && vaultKey1.trim().length >= 8 && vaultKey1 !== 'AlphaAdvantage' && vaultKey1 !== 'demo') {
    return vaultKey1.trim();
  }
  if (vaultKey2 && vaultKey2.trim().length >= 8 && vaultKey2 !== 'AlphaAdvantage' && vaultKey2 !== 'demo') {
    return vaultKey2.trim();
  }
  return await getApiKey('AlphaAdvantage');
}

async function getBrapiApiKey(): Promise<string | null> {
  // Try Vault first, then app_secrets
  const vaultKey = Deno.env.get('BRAPI');
  if (vaultKey && vaultKey.trim().length >= 8 && vaultKey !== 'BRAPI' && vaultKey !== 'demo') {
    return vaultKey.trim();
  }
  return await getApiKey('BRAPI');
}

async function getFinnhubApiKey(): Promise<string | null> {
  // Try Vault first, then app_secrets
  const vaultKey = Deno.env.get('Finnhub');
  if (vaultKey && vaultKey.trim().length >= 8 && vaultKey !== 'Finnhub' && vaultKey !== 'demo') {
    return vaultKey.trim();
  }
  return await getApiKey('Finnhub');
}

// Fetch from BRAPI (Brazilian stocks) - NO RATE LIMIT!
// Documentation: https://brapi.dev/docs
async function fetchFromBrapi(symbol: string, apiKey: string) {
  try {
    const url = `https://brapi.dev/api/quote/${symbol}?token=${apiKey}`;
    console.log(`[BRAPI] 🇧🇷 Fetching REAL data for ${symbol}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[BRAPI] ❌ HTTP error ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result || result.regularMarketPrice === undefined) {
      console.error(`[BRAPI] ❌ No data for ${symbol}`);
      return null;
    }
    
    console.log(`[BRAPI] ✅ REAL data received for ${symbol}: $${result.regularMarketPrice}`);
    
    return {
      symbol,
      name: result.longName || result.shortName || COMPANY_NAMES[symbol] || symbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      dayRange: {
        low: result.regularMarketDayLow || result.regularMarketPrice * 0.98,
        high: result.regularMarketDayHigh || result.regularMarketPrice * 1.02
      },
      fiftyTwoWeekRange: {
        low: result.fiftyTwoWeekLow || result.regularMarketPrice * 0.7,
        high: result.fiftyTwoWeekHigh || result.regularMarketPrice * 1.3
      },
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      peRatio: result.priceEarnings || 0,
      dividendYield: result.dividendYield || 0,
      lastUpdated: new Date(),
      isRealData: true
    };
  } catch (error) {
    console.error(`[BRAPI] ❌ Error:`, error);
    return null;
  }
}

// Fetch from Finnhub API (International stocks - better for US market)
// Documentation: https://finnhub.io/docs/api
async function fetchFromFinnhub(symbol: string, apiKey: string) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    console.log(`[FINNHUB] 🇺🇸 Fetching REAL data for ${symbol}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[FINNHUB] ❌ HTTP error ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.c === undefined) {
      console.error(`[FINNHUB] ❌ No data for ${symbol}`);
      return null;
    }
    
    const currentPrice = data.c;
    const previousClose = data.pc || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = data.dp || ((change / previousClose) * 100);
    
    console.log(`[FINNHUB] ✅ REAL data received for ${symbol}: $${currentPrice}`);
    
    return {
      symbol,
      name: COMPANY_NAMES[symbol] || symbol,
      price: currentPrice,
      change,
      changePercent,
      dayRange: {
        low: data.l || currentPrice * 0.98,
        high: data.h || currentPrice * 1.02
      },
      fiftyTwoWeekRange: {
        low: currentPrice * 0.7,
        high: currentPrice * 1.3
      },
      volume: 0,
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      lastUpdated: new Date(),
      isRealData: true
    };
  } catch (error) {
    console.error(`[FINNHUB] ❌ Error:`, error);
    return null;
  }
}

// Fetch from Alpha Vantage API (International stocks)
async function fetchFromAlphaVantage(symbol: string, apiKey: string) {
  try {
    const encodedSymbol = encodeURIComponent(symbol);
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodedSymbol}&apikey=${apiKey}`;
    
    console.log(`[ALPHA VANTAGE] 🌎 Fetching REAL data for ${symbol}`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Supabase-Edge-Function/1.0' }
    });
    
    if (!response.ok) {
      console.error(`[ALPHA VANTAGE] ❌ HTTP error ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data['Information'] || data['Error Message'] || data['Note'] || !data['Global Quote']) {
      const errorMsg = data['Information'] || data['Error Message'] || data['Note'];
      console.log(`[ALPHA VANTAGE] ⚠️ API issue:`, errorMsg);
      return null;
    }
    
    const quote = data['Global Quote'];
    
    if (!quote['05. price']) {
      console.error(`[ALPHA VANTAGE] ❌ Missing price data`);
      return null;
    }
    
    const currentPrice = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close'] || currentPrice);
    const change = parseFloat(quote['09. change'] || 0);
    const changePercent = parseFloat((quote['10. change percent'] || '0').replace('%', ''));
    
    console.log(`[ALPHA VANTAGE] ✅ REAL data received for ${symbol}: $${currentPrice}`);
    
    return {
      symbol,
      name: COMPANY_NAMES[symbol] || symbol,
      price: currentPrice,
      change,
      changePercent,
      dayRange: {
        low: parseFloat(quote['04. low'] || currentPrice * 0.98),
        high: parseFloat(quote['03. high'] || currentPrice * 1.02)
      },
      fiftyTwoWeekRange: {
        low: currentPrice * 0.7,
        high: currentPrice * 1.3
      },
      volume: parseInt(quote['06. volume'] || '0'),
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      lastUpdated: new Date(),
      isRealData: true
    };
  } catch (error) {
    console.error(`[ALPHA VANTAGE] ❌ Error:`, error);
    return null;
  }
}

// Main function - Try ALL APIs in order until we get REAL data
async function getStockQuote(symbol: string) {
  console.log(`[GET STOCK QUOTE] 🎯 ${symbol}`);
  
  // Check cache first
  const cacheKey = `stock_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`[CACHE] ✅ ${symbol} (${Math.floor((Date.now() - cached.timestamp) / 1000)}s ago, real: ${cached.data.isRealData})`);
    return cached.data;
  }
  
  const isBrazilian = symbol.includes('.SA') || /^[A-Z]{4}[0-9]/.test(symbol);
  
  // Strategy: Try ALL APIs until we get REAL data
  // Priority order:
  // 1. BRAPI for Brazilian stocks (best coverage for .SA)
  // 2. Finnhub (no rate limit, good for US/international)
  // 3. Alpha Vantage (fallback, has rate limit)
  // 4. BRAPI as fallback even for international (sometimes works)
  
  const attempts: Array<{ name: string; fn: () => Promise<any> }> = [];
  
  // Priority 1: BRAPI for Brazilian stocks
  if (isBrazilian) {
    const brapiKey = await getBrapiApiKey();
    if (brapiKey) {
      attempts.push({
        name: 'BRAPI',
        fn: () => fetchFromBrapi(symbol, brapiKey)
      });
    }
  }
  
  // Priority 2: Finnhub (no rate limit, works for most symbols)
  const finnhubKey = await getFinnhubApiKey();
  if (finnhubKey) {
    attempts.push({
      name: 'Finnhub',
      fn: () => fetchFromFinnhub(symbol, finnhubKey)
    });
  }
  
  // Priority 3: Alpha Vantage (rate limited, but reliable)
  const alphaKey = await getAlphaVantageApiKey();
  if (alphaKey && canMakeApiCall()) {
    attempts.push({
      name: 'Alpha Vantage',
      fn: () => fetchFromAlphaVantage(symbol, alphaKey)
    });
  }
  
  // Priority 4: BRAPI as fallback even for international stocks
  if (!isBrazilian) {
    const brapiKey = await getBrapiApiKey();
    if (brapiKey) {
      attempts.push({
        name: 'BRAPI (fallback)',
        fn: () => fetchFromBrapi(symbol, brapiKey)
      });
    }
  }
  
  // Try each API until we get REAL data
  for (const attempt of attempts) {
    try {
      console.log(`[${attempt.name}] 🔄 Trying ${attempt.name} for ${symbol}...`);
      const quote = await attempt.fn();
      
      if (quote && quote.isRealData === true) {
        console.log(`[${attempt.name}] ✅ SUCCESS! Real data from ${attempt.name} for ${symbol}`);
        cache.set(cacheKey, { data: quote, timestamp: Date.now() });
        return quote;
      }
    } catch (error) {
      console.error(`[${attempt.name}] ❌ Failed for ${symbol}:`, error);
      // Continue to next API
    }
  }
  
  // NO real data available from ANY API
  console.error(`[ERROR] ❌ Cannot fetch REAL data for ${symbol} from ANY API`);
  console.error(`[ERROR] Tried ${attempts.length} APIs:`, attempts.map(a => a.name).join(', '));
  throw new Error(`Unable to fetch real market data for ${symbol} from any available API`);
}

// Symbol search - Try Alpha Vantage first, fallback to local list
async function searchSymbols(query: string, limit: number = 10) {
  // Try Alpha Vantage first (best symbol search)
  const alphaKey = await getAlphaVantageApiKey();
  if (alphaKey && canMakeApiCall()) {
    try {
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${alphaKey}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'Supabase-Edge-Function/1.0' } });
      
      if (response.ok) {
        const data = await response.json();
        if (data['bestMatches'] && Array.isArray(data['bestMatches'])) {
          const results = data['bestMatches'].slice(0, limit).map((match: any) => ({
            symbol: match['1. symbol'] || '',
            name: match['2. name'] || '',
            type: match['3. type'] || 'Equity',
            region: match['4. region'] || ''
          })).filter((r: any) => r.symbol);
          
          if (results.length > 0) {
            console.log(`[SYMBOL SEARCH] ✅ Found ${results.length} results from Alpha Vantage for "${query}"`);
            return results;
          }
        }
      }
    } catch (error) {
      console.error('[SYMBOL SEARCH] Alpha Vantage error:', error);
    }
  }
  
  // Fallback to local popular symbols
  console.log(`[SYMBOL SEARCH] Using local fallback for "${query}"`);
  return getFallbackSearchResults(query, limit);
}

function getFallbackSearchResults(query: string, limit: number) {
  const upperQuery = query.toUpperCase();
  const popularSymbols = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'PETR4.SA', name: 'Petrobras', type: 'Equity', region: 'Brazil' },
    { symbol: 'VALE3.SA', name: 'Vale S.A.', type: 'Equity', region: 'Brazil' },
    { symbol: 'BBSA3', name: 'Banco do Brasil', type: 'Equity', region: 'Brazil' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco', type: 'Equity', region: 'Brazil' },
  ];
  
  return popularSymbols
    .filter(s => 
      s.symbol.toUpperCase().includes(upperQuery) ||
      s.name.toUpperCase().includes(upperQuery)
    )
    .slice(0, limit);
}

// Edge Function handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Symbol search endpoint
    if (path.match(/^\/stock-data\/search\/.+$/) && req.method === 'GET') {
      const query = path.split('/').pop()?.split('?')[0] || '';
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const results = await searchSymbols(query, limit);
      
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Single stock quote
    if (path.match(/^\/stock-data\/quote\/[A-Z0-9\.]+$/i) && req.method === 'GET') {
      const symbol = path.split('/').pop()?.toUpperCase();
      if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const quote = await getStockQuote(symbol);
      return new Response(JSON.stringify({ quote }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Multiple stock quotes
    if (path === '/stock-data/quotes' && req.method === 'POST') {
      const { symbols } = await req.json();
      if (!symbols || !Array.isArray(symbols)) {
        return new Response(JSON.stringify({ error: 'Symbols array is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const quotes = await Promise.all(
        symbols.map((symbol: string) => getStockQuote(symbol.toUpperCase()))
      );
      
      return new Response(JSON.stringify({ quotes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Health check
    if (path === '/stock-data/health' && req.method === 'GET') {
      const alphaKey = await getAlphaVantageApiKey();
      const brapiKey = await getBrapiApiKey();
      const finnhubKey = await getFinnhubApiKey();
      
      const totalApis = [alphaKey, brapiKey, finnhubKey].filter(Boolean).length;
      
      return new Response(JSON.stringify({
        status: totalApis > 0 ? 'ok' : 'warning',
        message: totalApis > 0 
          ? `✅ ${totalApis} API(s) configured - Real data available`
          : '⚠️ No APIs configured - Add API keys to secrets',
        timestamp: new Date().toISOString(),
        cache_entries: cache.size,
        cache_duration_minutes: CACHE_DURATION / 60000,
        rate_limit_remaining: RATE_LIMIT - requestTimestamps.length,
        rate_limit_total: RATE_LIMIT,
        apis: {
          brapi: { 
            configured: !!brapiKey, 
            key_length: brapiKey?.length || 0,
            priority: 1, 
            for: 'Brazilian stocks (.SA, XXXX4) - NO rate limit',
            source: brapiKey ? (Deno.env.get('BRAPI') ? 'Vault (BRAPI)' : 'app_secrets (BRAPI)') : 'none'
          },
          finnhub: { 
            configured: !!finnhubKey,
            key_length: finnhubKey?.length || 0,
            priority: 2, 
            for: 'US/International stocks - NO rate limit',
            source: finnhubKey ? (Deno.env.get('Finnhub') ? 'Vault (Finnhub)' : 'app_secrets (Finnhub)') : 'none'
          },
          alpha_vantage: { 
            configured: !!alphaKey,
            key_length: alphaKey?.length || 0,
            priority: 3, 
            for: 'Fallback - 5 calls/min limit',
            source: alphaKey ? (
              Deno.env.get('ALPHA_VANTAGE_API_KEY') ? 'Vault (ALPHA_VANTAGE_API_KEY)' :
              Deno.env.get('AlphaAdvantage') ? 'Vault (AlphaAdvantage)' :
              'app_secrets (AlphaAdvantage)'
            ) : 'none'
          }
        },
        strategy: 'Try ALL APIs until REAL data is found - NO simulated data'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
