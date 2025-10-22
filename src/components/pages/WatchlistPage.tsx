import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { MarketQuote } from '../ui/market-quote';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Plus, X, TrendingUp, Users, User, Info } from 'lucide-react';
import { communityWatchlist } from '../../lib/data';
import { MarketQuote as MarketQuoteType } from '../../lib/types';
import { MarketDataService, fallbackQuote } from '../../lib/market-api';
import { toast } from 'sonner@2.0.3';

interface WatchlistPageProps {
  user?: { name: string; role: string } | null;
  onNavigate: (page: string, data?: any) => void;
}

export function WatchlistPage({ user, onNavigate }: WatchlistPageProps) {
  const [communityQuotes, setCommunityQuotes] = useState<MarketQuoteType[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);
  const [userQuotes, setUserQuotes] = useState<MarketQuoteType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock user watchlist symbols
  const mockUserSymbols = ['MSFT', 'GOOGL', 'NVDA', 'AMZN'];

  // Fetch market data
  const fetchCommunityData = async () => {
    try {
      const activeItems = communityWatchlist
        .filter(item => item.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const symbols = activeItems.map(item => item.symbol);
      const quotes = await MarketDataService.getCommunityWatchlistData(symbols);

      setCommunityQuotes(quotes);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching community watchlist data:', error);

      // Fallback is handled by the service
      const activeItems = communityWatchlist
        .filter(item => item.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const fallbackData = activeItems.map(item => fallbackQuote(item.symbol, item.name));
      setCommunityQuotes(fallbackData);
    }
  };

  const fetchUserWatchlistData = async (symbols: string[]) => {
    try {
      const quotes = await MarketDataService.getMultipleStockQuotes(symbols);
      setUserQuotes(quotes);
    } catch (error) {
      console.error('Error fetching user watchlist data:', error);

      // Fallback is handled by the service
      const fallbackData = symbols.map(symbol =>
        fallbackQuote(symbol, getStockName(symbol))
      );
      setUserQuotes(fallbackData);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Fetch community data
      await fetchCommunityData();

      // Set user watchlist if logged in
      if (user) {
        setUserWatchlist(mockUserSymbols);
        await fetchUserWatchlistData(mockUserSymbols);
      }

      setIsLoading(false);
    };

    loadData();

    // Set up periodic updates (every 2 minutes)
    const interval = setInterval(async () => {
      await fetchCommunityData();
      if (user && userWatchlist.length > 0) {
        await fetchUserWatchlistData(userWatchlist);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [user]);

  const getStockName = (symbol: string) => {
    const names: Record<string, string> = {
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'NVDA': 'NVIDIA Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'DIS': 'Walt Disney Co.',
      'COIN': 'Coinbase Global Inc.',
      'V': 'Visa Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'AAPL': 'Apple Inc.'
    };
    return names[symbol] || symbol;
  };

  const getCommunityRationale = (symbol: string) => {
    const item = communityWatchlist.find(item => item.symbol === symbol);
    return item?.rationale || '';
  };

  const addToUserWatchlist = async (symbol: string) => {
    if (!user) {
      toast.error('Please log in to add stocks to your watchlist');
      return;
    }

    if (userWatchlist.includes(symbol)) {
      toast.error('Stock already in your watchlist');
      return;
    }

    try {
      const quote = await MarketDataService.getStockQuote(symbol);
      setUserWatchlist(prev => [...prev, symbol]);
      setUserQuotes(prev => [...prev, quote]);
      setSearchTerm('');
      setIsAddingStock(false);
      toast.success(`${symbol} added to your watchlist`);
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);

      // Fallback to mock data
      const fallbackData = fallbackQuote(symbol, getStockName(symbol));
      setUserWatchlist(prev => [...prev, symbol]);
      setUserQuotes(prev => [...prev, fallbackData]);
      setSearchTerm('');
      setIsAddingStock(false);
      toast.success(`${symbol} added to your watchlist (using demo data)`);
    }
  };

  const removeFromUserWatchlist = (symbol: string) => {
    setUserWatchlist(prev => prev.filter(s => s !== symbol));
    setUserQuotes(prev => prev.filter(q => q.symbol !== symbol));
    toast.success(`${symbol} removed from your watchlist`);
  };

  const popularStocks = ['AAPL', 'TSLA', 'META', 'NFLX', 'DIS', 'COIN'];

  const refreshData = async () => {
    await fetchCommunityData();
    if (user && userWatchlist.length > 0) {
      await fetchUserWatchlistData(userWatchlist);
    }
    toast.success('Market data refreshed');
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-8">
        <h1 
          className="font-bold text-primary leading-none mb-6"
          style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}
        >
          Watchlist
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track curated ideas from The Mane Review community and build your own list of tickers to follow.
        </p>

        {/* Data Status */}
        <div className="flex items-center justify-center space-x-4 text-sm mt-4">
          {lastUpdate && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          )}
          {!lastUpdate && (
            <span className="text-muted-foreground">Fetching latest data…</span>
          )}
        </div>
      </div>

      {/* Personal Watchlist */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-4">
            <h2
              className="text-3xl font-bold text-primary flex items-center gap-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              <User className="h-7 w-7 text-secondary" />
              <span>My Watchlist</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Collect the stocks, ETFs, and ideas you want to monitor. We'll keep price changes, ranges, and key stats in one place for you.
            </p>
          </div>

          {user && (
            <Dialog open={isAddingStock} onOpenChange={setIsAddingStock}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to My Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-6">
                    <label className="text-sm font-medium">Stock Symbol</label>
                    <Input
                      placeholder="Enter symbol (e.g., AAPL)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </div>

                  <div className="space-y-5">
                    <label className="text-sm font-medium">Popular Stocks</label>
                    <div className="grid grid-cols-3 gap-3">
                      {popularStocks.map((symbol) => (
                        <Button
                          key={symbol}
                          variant="outline"
                          size="sm"
                          onClick={() => addToUserWatchlist(symbol)}
                          disabled={userWatchlist.includes(symbol)}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => addToUserWatchlist(searchTerm)}
                      disabled={!searchTerm || userWatchlist.includes(searchTerm)}
                      className="flex-1"
                    >
                      Add {searchTerm || 'Symbol'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingStock(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {user ? (
          userQuotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userQuotes.map((quote) => (
                <div key={quote.symbol} className="space-y-4">
                  <MarketQuote quote={quote} showDetails />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => removeFromUserWatchlist(quote.symbol)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <CardContent>
                <div className="space-y-5">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">Your watchlist is empty</h3>
                  <p className="text-muted-foreground">
                    Add stocks to track their performance and stay updated with price movements.
                  </p>
                  <Button onClick={() => setIsAddingStock(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="space-y-3">
                <User className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Log in to build your list</h3>
                <p className="text-muted-foreground">
                  Create an account to save tickers and sync your personal watchlist across devices.
                </p>
                <Button onClick={() => onNavigate('login')}>
                  Login / Register
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Community Watchlist */}
      <section className="space-y-10">
                    <div className="space-y-3">
          <h2
            className="text-3xl font-bold text-primary flex items-center gap-2"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            <Users className="h-7 w-7 text-secondary" />
            <span>Community Watchlist</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            The community watchlist is curated by our advisors and highlights companies we're tracking for their fundamentals, momentum, or long-term potential.
          </p>
        </div>

        <Card className="bg-muted/30 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span>Investment Club Picks</span>
            </CardTitle>
          </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
              Each selection comes with a short rationale from our team so you can dig deeper and decide whether the idea fits your own strategy.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityQuotes.map((quote) => (
            <div key={quote.symbol} className="space-y-3">
              <MarketQuote quote={quote} showDetails />
              <Card className="bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Why we're watching</p>
                      <p className="text-xs text-muted-foreground">
                        {getCommunityRationale(quote.symbol)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => addToUserWatchlist(quote.symbol)}
                  disabled={userWatchlist.includes(quote.symbol)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {userWatchlist.includes(quote.symbol) ? 'In Your List' : 'Add to My Watchlist'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <Card className="bg-muted/20 border-secondary/20 mt-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-2">Investment Disclaimer</p>
              <p className="text-muted-foreground">
                All data is for educational purposes only. This is not financial advice.
                Please consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
