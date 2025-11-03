import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  GripVertical, 
  RefreshCw,
  AlertCircle,
  Users,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { MarketDataService } from '../../lib/market-api';
import { watchlistOperations, WatchlistItem } from '../../lib/supabase';
import { MarketQuote } from '../../lib/types';
import { SymbolSearchService, SymbolSearchResult } from '../../lib/symbol-search';
import { toast } from 'sonner';

interface WatchlistPageProps {
  user?: { id: string; name: string; role: string } | null;
  onNavigate: (page: string, data?: any) => void;
}

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc' | null;

interface WatchlistItemWithQuote extends WatchlistItem {
  quote?: MarketQuote;
  loading?: boolean;
}

export function WatchlistPage({ user, onNavigate }: WatchlistPageProps) {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItemWithQuote[]>([]);
  const [communityWatchlist, setCommunityWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [symbolSuggestions, setSymbolSuggestions] = useState<SymbolSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
    loadCommunityWatchlist();
  }, [user?.id]);

  useEffect(() => {
    // Only refresh quotes if we have items and they don't have quotes yet
    if (watchlistItems.length > 0 && activeTab === 'personal') {
      const itemsWithoutQuotes = watchlistItems.filter(item => !item.quote && !item.loading);
      if (itemsWithoutQuotes.length > 0) {
        refreshQuotesForItems(itemsWithoutQuotes.map(({ quote, loading, ...item }) => item));
      }
    }
  }, [watchlistItems.length]);

  // Debounced symbol search for autocomplete
  useEffect(() => {
    if (!newSymbol.trim() || newSymbol.length < 1) {
      setSymbolSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await SymbolSearchService.searchSymbols(newSymbol.trim(), 10);
        setSymbolSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error searching symbols:', error);
        setSymbolSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [newSymbol]);

  const loadWatchlist = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const items = await watchlistOperations.getUserWatchlist(user.id);
      setWatchlistItems(items.map(item => ({ ...item, loading: true })));
      
      // Load quotes for all items
      if (items.length > 0) {
        await refreshQuotesForItems(items);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityWatchlist = async () => {
    try {
      const mostTracked = await watchlistOperations.getMostTrackedSymbols(20);
      const symbols = mostTracked.map((item: any) => item.symbol);
      
      if (symbols.length > 0) {
        const quotes = await MarketDataService.getMultipleStockQuotes(symbols);
        setCommunityWatchlist(
          mostTracked.map((item: any, index: number) => ({
            symbol: item.symbol,
            trackingCount: item.tracking_count,
            quote: quotes[index]
          }))
        );
      }
    } catch (error) {
      console.error('Error loading community watchlist:', error);
    }
  };

  const refreshQuotesForItems = async (items: WatchlistItem[], forceRefresh: boolean = false) => {
    const symbols = items.map(item => item.symbol);
    if (symbols.length === 0) return;

    try {
      console.log('Fetching quotes for symbols:', symbols, forceRefresh ? '(FORCE REFRESH)' : '');
      const quotes = await MarketDataService.getMultipleStockQuotes(symbols, forceRefresh);
      console.log('Quotes received:', quotes);
      
      // Ensure quotes array matches items array length
      const quotesMap = new Map<string, MarketQuote>();
      quotes.forEach((quote: MarketQuote, index: number) => {
        if (quote && quote.symbol) {
          quotesMap.set(quote.symbol.toUpperCase(), quote);
        }
      });
      
      setWatchlistItems(items.map((item) => {
        const quote = quotesMap.get(item.symbol.toUpperCase());
        return {
          ...item,
          quote: quote || undefined,
          loading: false
        };
      }));
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setWatchlistItems(items.map(item => ({ ...item, loading: false })));
    }
  };

  const refreshQuotes = async (forceRefresh: boolean = false) => {
    if (watchlistItems.length === 0) return;
    
    setRefreshing(true);
    try {
      const items = watchlistItems.map(({ quote, loading, ...item }) => item);
      await refreshQuotesForItems(items, forceRefresh);
      toast.success(forceRefresh ? 'Watchlist updated with fresh data (cache bypassed)' : 'Watchlist updated');
    } catch (error) {
      console.error('Error refreshing quotes:', error);
      toast.error('Failed to refresh quotes. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const addSymbol = async () => {
    if (!user?.id || !newSymbol.trim()) return;
    
    const symbol = newSymbol.trim().toUpperCase();
    setAddingSymbol(true);
    
    try {
      // First verify the symbol exists by fetching a quote
      let quote: MarketQuote | null = null;
      try {
        quote = await MarketDataService.getStockQuote(symbol);
        console.log('Quote received for', symbol, quote);
        
        // Validate quote structure
        if (!quote || !quote.symbol) {
          console.warn('Invalid quote structure:', quote);
          // Still allow adding to watchlist even if quote is invalid
        }
      } catch (quoteError: any) {
        console.warn('Error fetching quote (will still add to watchlist):', quoteError);
        // Continue even if quote fetch fails - we'll add to watchlist anyway
      }

      // Add to watchlist
      await watchlistOperations.addToWatchlist(user.id, symbol);
      
      // Reload watchlist to get fresh data
      await loadWatchlist();
      
      setNewSymbol('');
      toast.success(`Added ${symbol} to watchlist`);
    } catch (error: any) {
      console.error('Error adding symbol:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message?.includes('duplicate') || error.code === '23505') {
        toast.error(`${symbol} is already in your watchlist`);
      } else if (error.message) {
        toast.error(`Failed to add ${symbol}: ${error.message}`);
      } else {
        toast.error(`Failed to add ${symbol}. Please try again.`);
      }
    } finally {
      setAddingSymbol(false);
    }
  };

  const removeSymbol = async (symbol: string) => {
    if (!user?.id) return;
    
    try {
      await watchlistOperations.removeFromWatchlist(user.id, symbol);
      setWatchlistItems(items => items.filter(item => item.symbol !== symbol));
      toast.success(`Removed ${symbol} from watchlist`);
    } catch (error) {
      console.error('Error removing symbol:', error);
      toast.error('Failed to remove symbol');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedItems = () => {
    let items = [...watchlistItems];
    
    if (searchQuery) {
      items = items.filter(item => 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quote?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (!sortField) return items;
    
    return items.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case 'price':
          aVal = a.quote?.price || 0;
          bVal = b.quote?.price || 0;
          break;
        case 'change':
          aVal = a.quote?.change || 0;
          bVal = b.quote?.change || 0;
          break;
        case 'changePercent':
          aVal = a.quote?.changePercent || 0;
          bVal = b.quote?.changePercent || 0;
          break;
        case 'volume':
          aVal = a.quote?.volume || 0;
          bVal = b.quote?.volume || 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Helper function to detect if symbol is Brazilian
  const isBrazilianStock = (symbol?: string) => {
    if (!symbol) return false;
    return symbol.includes('.SA') || /^[A-Z]{4}[0-9]/.test(symbol);
  };

  const formatPrice = (price?: number, symbol?: string) => {
    if (price === undefined || price === null) return 'N/A';
    const currency = isBrazilianStock(symbol) ? 'R$' : '$';
    return `${currency}${price.toFixed(2)}`;
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}>
            Watchlist
          </h1>
          <Card className="p-8 max-w-2xl mx-auto">
            <CardContent className="space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">Sign in required</h2>
              <p className="text-muted-foreground">
                Please sign in to create and manage your personal watchlist.
              </p>
              <Button onClick={() => onNavigate('auth')} className="mt-4">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-6">
        <h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}>
          Watchlist
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center border-b pb-2 overflow-x-auto">
        <Button
          variant={activeTab === 'personal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('personal')}
          className="whitespace-nowrap"
        >
          My Watchlist
        </Button>
        <Button
          variant={activeTab === 'community' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('community')}
          className="whitespace-nowrap"
        >
          <Users className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Community </span>Watchlist
        </Button>
      </div>

      {activeTab === 'personal' ? (
        <>
          {/* Add Symbol */}
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Add to Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search ticker (e.g., AAPL, PETR4)"
                      value={newSymbol}
                      onChange={(e) => {
                        setNewSymbol(e.target.value.toUpperCase());
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        if (symbolSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding to allow clicks on suggestions
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSymbol.trim()) {
                          addSymbol();
                          setShowSuggestions(false);
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                        }
                      }}
                      disabled={addingSymbol}
                      className="pr-8"
                    />
                    {loadingSuggestions && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Button 
                    onClick={addSymbol} 
                    disabled={addingSymbol || !newSymbol.trim()}
                    className="w-full sm:w-auto"
                  >
                    {addingSymbol ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add to Watchlist
                  </Button>
                </div>
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && symbolSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {symbolSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.symbol}-${index}`}
                        type="button"
                        onClick={() => {
                          setNewSymbol(suggestion.symbol);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{suggestion.symbol}</div>
                            <div className="text-xs text-muted-foreground">{suggestion.name}</div>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                            <span className="hidden sm:inline">{suggestion.region}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          {watchlistItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={refreshQuotes}
                disabled={refreshing}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh Quotes</span>
              </Button>
            </div>
          )}

          {/* Watchlist Table */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading watchlist...</p>
              </CardContent>
            </Card>
          ) : watchlistItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add tickers above to start tracking stocks
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Card View (iPhone optimized - Compact & Expandable) */}
              <div className="block md:hidden space-y-2">
                {getSortedItems().length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No symbols match your search
                    </CardContent>
                  </Card>
                ) : (
                  getSortedItems().map((item) => {
                    const isExpanded = expandedCard === item.id;
                    return (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                      >
                        <CardContent className="p-3">
                          {/* Compact View - Always Visible */}
                          <div className="flex items-center justify-between">
                            {/* Left: Symbol & Company */}
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-base font-bold">{item.symbol}</h3>
                                {item.quote && item.quote.isRealData === false && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    Sim
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.quote?.name || 'Loading...'}
                              </p>
                            </div>
                            
                            {/* Center: Price */}
                            <div className="text-right mr-3">
                              <p className="text-base font-bold">
                                {item.loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  formatPrice(item.quote?.price, item.symbol)
                                )}
                              </p>
                            </div>
                            
                            {/* Right: Change % */}
                            <div className="flex items-center gap-2">
                              {item.quote && (
                                <Badge
                                  variant={item.quote.changePercent >= 0 ? 'default' : 'destructive'}
                                  className="text-xs px-2 py-0.5"
                                >
                                  {item.quote.changePercent >= 0 ? '+' : ''}
                                  {item.quote.changePercent.toFixed(2)}%
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSymbol(item.symbol);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded View - Shows on Click */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t space-y-2 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Change Value</p>
                                  {item.quote && (
                                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                                      item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {item.quote.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3" />
                                      )}
                                      {formatPrice(item.quote.change, item.symbol)}
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Volume</p>
                                  <p className="text-sm font-semibold">
                                    {item.quote ? formatNumber(item.quote.volume) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-center text-muted-foreground pt-1">
                                Tap to collapse
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View - COMPLETELY HIDDEN ON MOBILE */}
              <div className="hidden md:block">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort('symbol')}
                            className="flex items-center hover:text-foreground"
                          >
                            Ticker
                            <SortIcon field="symbol" />
                          </button>
                        </TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort('price')}
                            className="flex items-center hover:text-foreground"
                          >
                            Price
                            <SortIcon field="price" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort('change')}
                            className="flex items-center hover:text-foreground"
                          >
                            Change
                            <SortIcon field="change" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort('changePercent')}
                            className="flex items-center hover:text-foreground"
                          >
                            Change %
                            <SortIcon field="changePercent" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort('volume')}
                            className="flex items-center hover:text-foreground"
                          >
                            Volume
                            <SortIcon field="volume" />
                          </button>
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedItems().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No symbols match your search
                          </TableCell>
                        </TableRow>
                      ) : (
                        getSortedItems().map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell className="font-semibold">
                              <div className="flex items-center gap-2">
                                {item.symbol}
                                {item.quote && item.quote.isRealData === false && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                    Simulado
                                  </Badge>
                                )}
                                {item.quote && item.quote.isRealData === true && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Real
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.quote?.name || 'Loading...'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                formatPrice(item.quote?.price, item.symbol)
                              )}
                            </TableCell>
                            <TableCell>
                              {item.quote && (
                                <div className={`flex items-center gap-1 ${
                                  item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.quote.change >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {formatPrice(item.quote.change, item.symbol)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.quote && (
                                <Badge
                                  variant={item.quote.changePercent >= 0 ? 'default' : 'destructive'}
                                >
                                  {item.quote.changePercent >= 0 ? '+' : ''}
                                  {item.quote.changePercent.toFixed(2)}%
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.quote ? formatNumber(item.quote.volume) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSymbol(item.symbol)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <Card className="block md:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Most Tracked
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tap to see details
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {communityWatchlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  Loading...
                </div>
              ) : (
                communityWatchlist.map((item) => {
                  const isExpanded = expandedCard === item.symbol;
                  return (
                    <Card 
                      key={item.symbol} 
                      className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => setExpandedCard(isExpanded ? null : item.symbol)}
                    >
                      <CardContent className="p-3">
                        {/* Compact View */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-base font-bold">{item.symbol}</h3>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                <Users className="h-2.5 w-2.5 mr-0.5" />
                                {item.trackingCount}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.quote?.name || 'N/A'}
                            </p>
                          </div>
                          
                          <div className="text-right mr-3">
                            <p className="text-base font-bold">
                              {formatPrice(item.quote?.price, item.symbol)}
                            </p>
                          </div>
                          
                          <div>
                            {item.quote && (
                              <Badge
                                variant={item.quote.changePercent >= 0 ? 'default' : 'destructive'}
                                className="text-xs px-2 py-0.5"
                              >
                                {item.quote.changePercent >= 0 ? '+' : ''}
                                {item.quote.changePercent.toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded View */}
                        {isExpanded && item.quote && (
                          <div className="mt-3 pt-3 border-t animate-in slide-in-from-top-2">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Change Value</p>
                              <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${
                                item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.quote.change >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {formatPrice(item.quote.change, item.symbol)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Tap to collapse
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Most Tracked Symbols
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Symbols tracked by the most users in the community
              </p>
            </CardHeader>
            <CardContent>
              {communityWatchlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  Loading community watchlist...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Change %</TableHead>
                      <TableHead>Tracked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communityWatchlist.map((item) => (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-semibold">{item.symbol}</TableCell>
                        <TableCell>{item.quote?.name || 'N/A'}</TableCell>
                        <TableCell>{formatPrice(item.quote?.price, item.symbol)}</TableCell>
                        <TableCell>
                          {item.quote && (
                            <div className={`flex items-center gap-1 ${
                              item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.quote.change >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {formatPrice(item.quote.change, item.symbol)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.quote && (
                            <Badge
                              variant={item.quote.changePercent >= 0 ? 'default' : 'destructive'}
                            >
                              {item.quote.changePercent >= 0 ? '+' : ''}
                              {item.quote.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {item.trackingCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
