import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArticleCard } from '../ui/article-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrendingUp, TrendingDown, Globe, Calendar, Building } from 'lucide-react';
import { regionalIndices } from '../../lib/data';
import { Region, Article } from '../../lib/types';
import { supabase } from '../../lib/supabase';

interface MarketsPageProps { region?: Region; onNavigate: (page: string, data?: any) => void; userRole?: string; onEditArticle?: (articleId: string) => void; }
type SortOption = 'latest' | 'popular' | 'featured';

export function MarketsPage({ region: initialRegion, onNavigate, userRole, onEditArticle }: MarketsPageProps) {
  const [activeRegion, setActiveRegion] = useState<Region>(initialRegion || 'USA');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [articles, setArticles] = useState<Article[]>([]);
  const regions: Region[] = ['USA', 'Europe', 'South America', 'Asia'];

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data: dbArticles } = await supabase.from('articles').select('*').eq('status', 'published').eq('region', activeRegion);
        const convertedArticles: Article[] = (dbArticles || []).map(article => ({ id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt || '', body: article.body, coverImage: article.cover_image, coverAlt: article.cover_alt, region: article.region as any, category: article.category as any, tags: article.tags, authorId: article.author_id, authorRole: article.author_role as any, status: 'published', publishedAt: new Date(article.published_at), updatedAt: new Date(article.updated_at), featured: article.featured, estReadMin: article.est_read_min, views: article.views }));
        let sorted = [...convertedArticles];
        switch (sortBy) { case 'latest': sorted.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()); break; case 'popular': sorted.sort((a, b) => (b.views || 0) - (a.views || 0)); break; case 'featured': sorted.sort((a, b) => { if (a.featured && !b.featured) return -1; if (!a.featured && b.featured) return 1; return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime(); }); break; }
        setArticles(sorted);
      } catch (error) { setArticles([]); }
    };
    loadArticles();
  }, [activeRegion, sortBy]);

  const getRegionIndices = (region: Region) => regionalIndices[region] || [];
  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return { color: isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', icon: isPositive ? TrendingUp : TrendingDown, text: `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)` };
  };
  const getRegionDescription = (region: Region) => ({ 'South America': 'Track Latin American markets including Brazil\'s Ibovespa, Argentina\'s Merval, and Chile\'s IPSA, with insights on emerging market opportunities.', USA: 'Follow U.S. markets including the S&P 500, Nasdaq, and Dow Jones, with analysis of Federal Reserve policy and sector trends.', Europe: 'Monitor European markets and the Euro Stoxx 50, covering ECB decisions, Brexit impacts, and continental investment themes.', Asia: 'Explore Asian markets from Tokyo to Hong Kong, covering tech innovation, trade dynamics, and economic growth across the region.' }[region]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-6">
        <h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}>Markets</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Global market insights, analysis, and investment perspectives across major economies.</p>
        <div className="max-w-3xl mx-auto mt-4 p-3 text-center"><p className="text-sm text-muted-foreground"><strong>Note:</strong> Market values shown are placeholders. We're working on integrating live data.</p></div>
      </div>
      <Tabs value={activeRegion} onValueChange={(value) => setActiveRegion(value as Region)}>
        <TabsList className="w-full !flex h-auto flex-wrap justify-center gap-4 md:gap-5 bg-muted/50 p-4 rounded-2xl">
          {regions.map((region) => (<TabsTrigger key={region} value={region} className="!flex-none min-w-[160px] px-6 py-3 gap-2 text-base font-semibold justify-center rounded-xl transition-all duration-200" style={{ border: '2px solid', borderColor: activeRegion === region ? '#1e3a8a' : '#9ca3af', backgroundColor: activeRegion === region ? '#1e3a8a' : '#ffffff', color: activeRegion === region ? '#ffffff' : '#111827', boxShadow: activeRegion === region ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none' }}><Globe className="h-4 w-4" style={{ color: activeRegion === region ? '#ffffff' : '#374151' }} /><span className="text-lg md:text-xl font-bold tracking-wide">{region}</span></TabsTrigger>))}
        </TabsList>
        {regions.map((region) => (<TabsContent key={region} value={region} className="space-y-12 mt-0"><div className="text-center pt-4 pb-16 bg-muted/30 rounded-lg"><h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-headline)', fontSize: '40px' }}>{region} Markets</h2><p className="text-muted-foreground max-w-3xl mx-auto mb-6">{getRegionDescription(region)}</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{getRegionIndices(region).map((index) => { const changeData = formatChange(index.change, index.changePercent); const ChangeIcon = changeData.icon; return (<Card key={index.symbol} className="h-full"><CardHeader className="pb-6"><div className="flex items-center justify-between"><CardTitle className="text-lg">{index.name}</CardTitle><Badge variant="outline" className="font-mono text-xs">{index.symbol}</Badge></div></CardHeader><CardContent><div className="space-y-4"><div className="text-2xl font-bold">{index.price.toLocaleString()}</div><div className={`flex items-center gap-2 ${changeData.color}`}><ChangeIcon className="h-4 w-4" /><span className="text-sm font-medium">{changeData.text}</span></div></div></CardContent></Card>); })}</div><div className="space-y-10 mt-16 pt-8"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><h3 className="text-2xl font-semibold">Latest Analysis</h3><Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="latest">Latest</SelectItem><SelectItem value="popular">Most Read</SelectItem><SelectItem value="featured">Featured</SelectItem></SelectContent></Select></div>{articles.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{articles.map((article) => (<ArticleCard key={article.id} article={article} onClick={(slug) => onNavigate('article', { slug })} showRegion={false} userRole={userRole} onEdit={onEditArticle} />))}</div>) : (<Card className="p-8 text-center"><CardContent><div className="space-y-3"><Globe className="h-12 w-12 text-muted-foreground mx-auto" /><h4 className="text-lg font-medium">No articles yet</h4><p className="text-muted-foreground">We're working on bringing you the latest {region} market analysis. Check back soon!</p><Button variant="outline" onClick={() => onNavigate('home')} className="mt-4">Explore Other Regions</Button></div></CardContent></Card>)}</div></TabsContent>))}
      </Tabs>
    </div>
  );
}