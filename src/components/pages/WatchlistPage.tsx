import React from 'react';
import { Card, CardContent } from '../ui/card';
import { TrendingUp } from 'lucide-react';

interface WatchlistPageProps {
  user?: { name: string; role: string } | null;
  onNavigate: (page: string, data?: any) => void;
}

export function WatchlistPage({ user, onNavigate }: WatchlistPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <div className="text-center space-y-8">
        <h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}>Watchlist</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Track curated ideas from The Mane Review community and build your own list of tickers to follow.</p>
      </div>
      <Card className="p-16 text-center max-w-3xl mx-auto">
        <CardContent>
          <div className="space-y-6">
            <TrendingUp className="h-20 w-20 text-muted-foreground mx-auto" />
            <h2 className="text-4xl font-bold">Coming Soon</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">We're building an exciting watchlist feature where you can track your favorite stocks and follow community-curated investment ideas.</p>
            <p className="text-sm text-muted-foreground">Both Personal Watchlist and Community Watchlist will be available soon. Stay tuned!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}