import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ArticleCard } from '../ui/article-card';
import { 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Copy, 
  ExternalLink,
  ArrowLeft 
} from 'lucide-react';
import { mockArticles, mockUsers } from '../../lib/data';
import { Article } from '../../lib/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface ArticlePageProps {
  slug: string;
  onNavigate: (page: string, data?: any) => void;
}

export function ArticlePage({ slug, onNavigate }: ArticlePageProps) {
  const article = mockArticles.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button onClick={() => onNavigate('home')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const author = mockUsers.find(u => u.id === article.authorId);
  
  // Get related articles (same region or tags)
  const relatedArticles = mockArticles
    .filter(a => 
      a.id !== article.id && 
      a.status === 'published' && 
      (a.region === article.region || a.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getRegionColor = (region: string) => {
    const colors = {
      Brazil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      USA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Europe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Asia: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleShare = (platform: 'copy' | 'twitter' | 'linkedin') => {
    const url = `${window.location.origin}/articles/${article.slug}`;
    const title = article.title;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
    }
  };

  // Convert markdown-style content to basic HTML (simplified)
  const renderContent = (body: string) => {
    return body
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold mb-8 text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
              {paragraph.replace('# ', '')}
            </h1>
          );
        }
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-semibold mb-6 text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-medium mb-4 text-primary">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        return (
          <p key={index} className="mb-6 leading-relaxed text-foreground">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => onNavigate('back')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Article Header */}
      <header className="space-y-6 mb-8">
        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={getRegionColor(article.region)}>
            {article.region}
          </Badge>
          {article.featured && (
            <Badge className="bg-secondary text-secondary-foreground">
              Featured
            </Badge>
          )}
          {article.authorRole === 'Student' && (
            <Badge className="bg-muted text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              Student Contributor
            </Badge>
          )}
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 
          className="text-6xl md:text-7xl font-bold text-primary leading-tight"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>

        {/* Author and Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {author && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-secondary-foreground text-xs font-medium">
                    {author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{author.name}</div>
                  <div className="text-xs">{article.authorRole}</div>
                </div>
              </div>
            )}
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{article.publishedAt && formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.estReadMin} min read</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground mr-2">Share:</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('copy')}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('twitter')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('linkedin')}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        {renderContent(article.body)}
      </div>

      {/* Educational Disclaimer */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 mb-12">
        <CardContent className="p-4">
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-1">Educational Content Disclaimer</p>
            <p>
              This article is provided for educational purposes only and should not be considered 
              as financial advice. Always consult with a qualified financial advisor before making 
              investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard
                key={relatedArticle.id}
                article={relatedArticle}
                onClick={(slug) => onNavigate('article', { slug })}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
