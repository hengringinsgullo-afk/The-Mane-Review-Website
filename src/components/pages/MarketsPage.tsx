import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArticleCard } from '../ui/article-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrendingUp, TrendingDown, Globe, Calendar, Building } from 'lucide-react';
import { mockArticles, regionalIndices } from '../../lib/data';
import { Region, Article } from '../../lib/types';

interface MarketsPageProps {
  region?: Region;
  onNavigate: (page: string, data?: any) => void;
}

type SortOption = 'latest' | 'popular' | 'featured';

export function MarketsPage({ region: initialRegion, onNavigate }: MarketsPageProps) {
  const [activeRegion, setActiveRegion] = useState<Region>(initialRegion || 'USA');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [articles, setArticles] = useState<Article[]>([]);

  const regions: Region[] = ['USA', 'Europe', 'South America', 'Asia'];

  useEffect(() => {
    // Filter and sort articles based on region and sort option
    let filteredArticles = mockArticles.filter(
      article => article.status === 'published' && 
                 article.category === 'Markets' && 
                 article.region === activeRegion
    );

    switch (sortBy) {
      case 'latest':
        filteredArticles.sort((a, b) => 
          new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
        );
        break;
      case 'popular':
        filteredArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'featured':
        filteredArticles.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
        });
        break;
    }

    setArticles(filteredArticles);
  }, [activeRegion, sortBy]);

  const getRegionIndices = (region: Region) => {
    return regionalIndices[region] || [];
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return {
      color: isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      icon: isPositive ? TrendingUp : TrendingDown,
      text: `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`
    };
  };

  const getRegionDescription = (region: Region) => {
    const descriptions = {
      'South America': 'Track Latin American markets including Brazil\'s Ibovespa, Argentina\'s Merval, and Chile\'s IPSA, with insights on emerging market opportunities.',
      USA: 'Follow U.S. markets including the S&P 500, Nasdaq, and Dow Jones, with analysis of Federal Reserve policy and sector trends.',
      Europe: 'Monitor European markets and the Euro Stoxx 50, covering ECB decisions, Brexit impacts, and continental investment themes.',
      Asia: 'Explore Asian markets from Tokyo to Hong Kong, covering tech innovation, trade dynamics, and economic growth across the region.'
    };
    return descriptions[region];
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-8">
        <h1 
          className="font-bold text-primary leading-none mb-6"
          style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}
        >
          Markets
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Global market insights, analysis, and investment perspectives across major economies.
        </p>
      </div>

      {/* Region Tabs */}
      <Tabs value={activeRegion} onValueChange={(value) => setActiveRegion(value as Region)}>
        <TabsList className="w-full !flex h-auto flex-wrap justify-center gap-4 md:gap-5 bg-muted/50 p-4 rounded-2xl">
          {regions.map((region) => (
            <TabsTrigger
              key={region}
              value={region}
              className="!flex-none min-w-[160px] px-6 py-3 gap-2 text-base font-semibold justify-center rounded-xl transition-all duration-200"
              style={{
                border: '2px solid',
                borderColor: activeRegion === region ? '#1e3a8a' : '#9ca3af',
                backgroundColor: activeRegion === region ? '#1e3a8a' : '#ffffff',
                color: activeRegion === region ? '#ffffff' : '#111827',
                boxShadow: activeRegion === region ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none'
              }}
            >
              <Globe 
                className="h-4 w-4" 
                style={{ color: activeRegion === region ? '#ffffff' : '#374151' }}
              />
              <span className="text-lg md:text-xl font-bold tracking-wide">
                {region}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {regions.map((region) => (
          <TabsContent key={region} value={region} className="space-y-12 mt-0">
            {/* Region Header */}
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-headline)', fontSize: '30px' }}>
                {region} Markets
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {getRegionDescription(region)}
              </p>
            </div>

            {/* Market Indices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getRegionIndices(region).map((index) => {
                const changeData = formatChange(index.change, index.changePercent);
                const ChangeIcon = changeData.icon;
                
                return (
                  <Card key={index.symbol} className="h-full">
                    <CardHeader className="pb-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{index.name}</CardTitle>
                        <Badge variant="outline" className="font-mono text-xs">
                          {index.symbol}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">
                          {index.price.toLocaleString()}
                        </div>
                        <div className={`flex items-center gap-2 ${changeData.color}`}>
                          <ChangeIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {changeData.text}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upcoming Earnings */}
            <div className="space-y-8 mt-16 pt-8 pb-8">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <h3 className="text-2xl font-semibold">Upcoming Earnings</h3>
                <Badge variant="secondary" className="text-xs">
                  Market Cap &gt; $10B
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Major companies in {region} reporting earnings in the next 30 days
              </p>
              
              <Card className="p-8 text-center">
                <CardContent>
                  <div className="space-y-3">
                    <Building className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Earnings data will be available soon. We're working on integrating live earnings schedules for major companies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Articles Section */}
            <div className="space-y-10 mt-16 pt-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-semibold">Latest Analysis</h3>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Read</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => (
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
                    <div className="space-y-3">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h4 className="text-lg font-medium">No articles yet</h4>
                      <p className="text-muted-foreground">
                        We're working on bringing you the latest {region} market analysis. Check back soon!
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => onNavigate('home')}
                        className="mt-4"
                      >
                        Explore Other Regions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
