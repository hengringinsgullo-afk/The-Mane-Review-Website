import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Clock, User } from 'lucide-react';
import { Article } from '../../lib/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ArticleCardProps { article: Article; onClick: (slug: string) => void; showRegion?: boolean; className?: string; }

export function ArticleCard({ article, onClick, showRegion = true, className = '' }: ArticleCardProps) {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  const getRegionColor = (region: string) => {
    const colors = { Brazil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', USA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', Europe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', Asia: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  const getAuthorBadgeColor = (role: string) => role === 'Student' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground';

  return (
    <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-border hover:border-secondary/20 ${className}`} onClick={() => onClick(article.slug)}>
      <CardContent className="p-0">
        {article.coverImage && (<div className="relative aspect-[16/9] overflow-hidden rounded-t-lg"><ImageWithFallback src={article.coverImage} alt={article.coverAlt || article.title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />{article.featured && (<div className="absolute top-3 left-3"><Badge className="bg-secondary text-secondary-foreground">Featured</Badge></div>)}</div>)}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {showRegion && (<Badge variant="secondary" className={getRegionColor(article.region)}>{article.region}</Badge>)}
            {article.authorRole === 'Student' && (<Badge className={getAuthorBadgeColor(article.authorRole)}><User className="h-3 w-3 mr-1" />Student Contributor</Badge>)}
            {article.authorRole === 'Founder' && (<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><User className="h-3 w-3 mr-1" />Expert</Badge>)}
            {article.tags.slice(0, 2).map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}
          </div>
          <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-secondary transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>{article.title}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center"><Clock className="h-3 w-3 mr-1" />{article.estReadMin} min read</div>
            {article.publishedAt && (<span>{formatDate(article.publishedAt)}</span>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}