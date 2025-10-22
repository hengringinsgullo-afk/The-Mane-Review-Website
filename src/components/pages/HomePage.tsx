import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArticleCard } from '../ui/article-card';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { mockArticles } from '../../lib/data';
import { MarketIndex } from '../../lib/types';
import { MarketDataService, fallbackIndex } from '../../lib/market-api';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [sampleIndices, setSampleIndices] = useState<MarketIndex[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Get the latest articles
  const publishedArticles = mockArticles
    .filter(article => article.status === 'published')
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());

  const latestArticles = publishedArticles.slice(0, 6);
  const opinionArticles = publishedArticles
    .filter(article => article.category === 'Opinion')
    .slice(0, 3);

  // Fetch market data for hero section
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setDataLoading(true);
        console.log('Starting market data fetch...');
        
        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.log('Market data fetch timed out, using fallback');
          const fallbackData = [
            fallbackIndex('^GSPC', 'S&P 500'),
            fallbackIndex('^BVSP', 'Ibovespa'),
            fallbackIndex('^STOXX50E', 'Euro Stoxx 50')
          ];
          setSampleIndices(fallbackData);
          setDataLoading(false);
        }, 5000); // 5 second timeout
        
        const indexSymbols = ['^GSPC', '^BVSP', '^STOXX50E']; // S&P 500, Ibovespa, Euro Stoxx 50
        const indices = await MarketDataService.getMultipleIndexData(indexSymbols);
        
        clearTimeout(timeoutId);
        setSampleIndices(indices);
        console.log('Market data fetch completed successfully');
      } catch (error) {
        console.error('Error fetching market data for homepage:', error);
        
        // Fallback data is handled by the service
        const fallbackData = [
          fallbackIndex('^GSPC', 'S&P 500'),
          fallbackIndex('^BVSP', 'Ibovespa'),
          fallbackIndex('^STOXX50E', 'Euro Stoxx 50')
        ];
        setSampleIndices(fallbackData);
      } finally {
        setDataLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="w-[10.2rem] h-[10.2rem] mx-auto mb-6 flex items-center justify-center">
              <ImageWithFallback
                src="https://nyc.cloud.appwrite.io/v1/storage/buckets/68cb0104003c3661bc1d/files/68cb01480033069cead5/view?project=68cb00b4003411fc77a1"
                alt="The Mane Review Main Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Making markets approachable for anyone interested in investing, finance, and economic thinking.
            </p>
          </div>

          {/* Market Snapshot */}
          {!dataLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {sampleIndices.map((index) => (
                <Card key={index.symbol} className="bg-muted/30">
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{index.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{index.price.toLocaleString()}</span>
                      <div className={`flex items-center space-x-1 ${
                        index.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${index.change < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium">
                          {index.changePercent > 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button 
              size="lg" 
              onClick={() => onNavigate('markets')}
              className="bg-primary hover:bg-primary/90"
            >
              Read Markets
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate('watchlist')}
            >
              See Watchlist
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 
            className="text-3xl font-bold text-primary"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Newest Articles
          </h2>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('markets')}
            className="text-secondary hover:text-secondary/80"
          >
            View all
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={(slug) => onNavigate('article', { slug })}
            />
          ))}
        </div>
      </section>

      {/* From Opinion */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 
              className="text-3xl font-bold text-primary mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              From Opinion
            </h2>
            <p className="text-muted-foreground">
              Insights and perspectives from our student contributors at St. Paul's School
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('opinion')}
            className="text-secondary hover:text-secondary/80"
          >
            View all
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {opinionArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opinionArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={(slug) => onNavigate('article', { slug })}
                showRegion={false}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground">
                Student opinion pieces coming soon. Check back for fresh perspectives from our contributors.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}