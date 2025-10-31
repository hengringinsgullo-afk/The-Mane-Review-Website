import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketQuote as MarketQuoteType } from '../../lib/types';

interface MarketQuoteProps {
  quote: MarketQuoteType;
  showDetails?: boolean;
  className?: string;
}

export function MarketQuote({ quote, showDetails = false, className = '' }: MarketQuoteProps) {
  const isPositive = quote.change >= 0;
  const isNeutral = quote.change === 0;
  
  // Helper function to detect if symbol is Brazilian
  const isBrazilianStock = (symbol: string) => {
    return symbol.includes('.SA') || /^[A-Z]{4}[0-9]/.test(symbol);
  };
  
  const formatPrice = (price: number) => {
    const currency = isBrazilianStock(quote.symbol) ? 'R$' : '$';
    if (price >= 1000000000) {
      return `${currency}${(price / 1000000000).toFixed(2)}B`;
    }
    if (price >= 1000000) {
      return `${currency}${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return `${currency}${(price / 1000).toFixed(2)}K`;
    }
    return `${currency}${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getTrendIcon = () => {
    if (isNeutral) return <Minus className="h-4 w-4" />;
    return isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (isNeutral) return 'text-muted-foreground';
    return isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getBadgeVariant = () => {
    if (isNeutral) return 'secondary';
    return isPositive ? 'default' : 'destructive';
  };

  return (
    <Card className={`transition-all hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium truncate">{quote.name}</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {quote.symbol}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Price and Change */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">
              {formatPrice(quote.price)}
            </div>
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {formatPrice(Math.abs(quote.change))} ({Math.abs(quote.changePercent).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex justify-start">
            <Badge variant={getBadgeVariant()} className="text-xs">
              {isPositive ? '+' : isNeutral ? '' : '-'}{Math.abs(quote.changePercent).toFixed(2)}%
            </Badge>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-2 border-t">
              <div>
                <div className="flex justify-between">
                  <span>Day Range</span>
                  <span>{formatPrice(quote.dayRange.low)} - {formatPrice(quote.dayRange.high)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Volume</span>
                  <span>{formatVolume(quote.volume)}</span>
                </div>
              </div>
              <div>
                {quote.marketCap && (
                  <div className="flex justify-between">
                    <span>Market Cap</span>
                    <span>{formatPrice(quote.marketCap)}</span>
                  </div>
                )}
                {quote.peRatio && (
                  <div className="flex justify-between mt-1">
                    <span>P/E Ratio</span>
                    <span>{quote.peRatio.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-right">
            Updated: {new Date(quote.lastUpdated).toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}