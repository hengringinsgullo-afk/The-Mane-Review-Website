import React, { useState } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Home, Keyboard } from 'lucide-react';
import { cn } from './utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  currentPage: string;
  className?: string;
}

const pageLabels: Record<string, string> = {
  home: 'Home',
  markets: 'Markets',
  opinion: 'Opinion',
  watchlist: 'Watchlist',
  about: 'About',
  article: 'Article',
  auth: 'Authentication',
  admin: 'Admin Dashboard',
  account: 'My Account'
};

export function NavigationControls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onHome,
  currentPage,
  className
}: NavigationControlsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className="h-8 w-8"
          title="Go back (Alt + ←)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onForward}
          disabled={!canGoForward}
          className="h-8 w-8"
          title="Go forward (Alt + →)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onHome}
          className="h-8 w-8"
          title="Go to home (Alt + Home)"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {pageLabels[currentPage] || currentPage}
        </span>
      </div>

      {/* Keyboard shortcuts help */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-2"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Go back</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Alt + ←</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Go forward</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Alt + →</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Go to home</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Alt + Home</kbd>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
