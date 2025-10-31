import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './utils';

interface BreadcrumbItem {
  label: string;
  page: string;
  data?: any;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (page: string, data?: any) => void;
  className?: string;
}

export function Breadcrumbs({ items, onNavigate, className }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              )}
              {isLast ? (
                <span className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(item.page, item.data)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
