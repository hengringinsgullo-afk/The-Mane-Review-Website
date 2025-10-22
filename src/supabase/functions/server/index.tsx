import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { 
  handleGetStockQuote, 
  handleGetMultipleStockQuotes, 
  handleGetIndexData,
  handleHealthCheck
} from './market_data.tsx';

const app = new Hono();

// CORS middleware with explicit configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: false,
}));

app.use('*', logger(console.log));

// Health check with API status
app.get('/health', handleHealthCheck);
app.get('/make-server-b9128d58/health', handleHealthCheck);

// Market data routes - support both with and without prefix
app.get('/market/stock/:symbol', handleGetStockQuote);
app.post('/market/stocks', handleGetMultipleStockQuotes);
app.get('/market/index/:symbol', handleGetIndexData);

// Legacy routes with prefix
app.get('/make-server-b9128d58/market/stock/:symbol', handleGetStockQuote);
app.post('/make-server-b9128d58/market/stocks', handleGetMultipleStockQuotes);
app.get('/make-server-b9128d58/market/index/:symbol', handleGetIndexData);

Deno.serve(app.fetch);