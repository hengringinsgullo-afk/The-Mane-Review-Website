import React from 'react';
import { Separator } from '../ui/separator';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4"><div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"><span className="text-secondary-foreground text-sm font-bold">M</span></div><span className="text-xl font-semibold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>The Mane Review</span></div>
            <p className="text-muted-foreground mb-4 max-w-md">Making markets approachable for anyone interested in investing, finance, and economic thinking.</p>
            <div className="flex space-x-4"><a href="https://instagram.com/themanereview_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary transition-colors" aria-label="Follow us on Instagram"><Instagram className="h-5 w-5" /></a></div>
          </div>
          <div><h3 className="font-semibold mb-4">Explore</h3><ul className="space-y-2 text-sm"><li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Markets</a></li><li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Opinion</a></li><li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Watchlist</a></li><li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li></ul></div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col space-y-4"><div className="text-sm text-muted-foreground text-center p-3 bg-muted/30 rounded-lg"><strong>Note:</strong> All stock and commodity values displayed are placeholder values. We are working hard to integrate live market data. Educational content only. Not financial advice.</div><div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"><div className="text-sm text-muted-foreground">© 2024 The Mane Review. All rights reserved.</div><div className="text-sm text-muted-foreground max-w-md text-center md:text-right">All information provided is for educational purposes only.</div></div></div>
      </div>
    </footer>
  );
}