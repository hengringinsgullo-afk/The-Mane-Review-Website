import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArticleCard } from '../ui/article-card';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { mockArticles } from '../../lib/data';
import { MarketIndex, Article } from '../../lib/types';
import { MarketDataService, fallbackIndex } from '../../lib/market-api';
import { supabase } from '../../lib/supabase';

interface HomePageProps { onNavigate: (page: string, data?: any) => void; userRole?: string; onEditArticle?: (articleId: string) => void; }

export function HomePage({ onNavigate, userRole, onEditArticle }: HomePageProps) {
  const [sampleIndices, setSampleIndices] = useState<MarketIndex[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [opinionArticles, setOpinionArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data: dbArticles } = await supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false });
        if (dbArticles) {
          const converted: Article[] = dbArticles.map(article => ({ id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt || '', body: article.body, coverImage: article.cover_image, coverAlt: article.cover_alt, region: article.region as any, category: article.category as any, tags: article.tags, authorId: article.author_id, authorRole: article.author_role as any, status: 'published', publishedAt: new Date(article.published_at), updatedAt: new Date(article.updated_at), featured: article.featured, estReadMin: article.est_read_min, views: article.views }));
          setLatestArticles(converted.slice(0, 6));
          setOpinionArticles(converted.filter(a => a.category === 'Opinion').slice(0, 3));
        }
      } catch (error) { console.error('Error loading articles:', error); }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setDataLoading(true);
        const timeoutId = setTimeout(() => { setSampleIndices([fallbackIndex('^GSPC', 'S&P 500'), fallbackIndex('^BVSP', 'Ibovespa'), fallbackIndex('^STOXX50E', 'Euro Stoxx 50')]); setDataLoading(false); }, 5000);
        const indices = await MarketDataService.getMultipleIndexData(['^GSPC', '^BVSP', '^STOXX50E']);
        clearTimeout(timeoutId);
        setSampleIndices(indices);
      } catch (error) { setSampleIndices([fallbackIndex('^GSPC', 'S&P 500'), fallbackIndex('^BVSP', 'Ibovespa'), fallbackIndex('^STOXX50E', 'Euro Stoxx 50')]); } finally { setDataLoading(false); }
    };
    fetchMarketData();
  }, []);

  return (
    <div className="space-y-20">
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="w-[10.2rem] h-[10.2rem] mx-auto mb-6 flex items-center justify-center">
              <ImageWithFallback src="https://nyc.cloud.appwrite.io/v1/storage/buckets/68cb0104003c3661bc1d/files/68cb01480033069cead5/view?project=68cb00b4003411fc77a1&mode=admin" alt="The Mane Review Main Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">Making markets approachable for anyone interested in investing, finance, and economic thinking.</p>
          </div>
          {!dataLoading && (
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {sampleIndices.map((index) => (<Card key={index.symbol} className="bg-muted/30"><CardContent className="p-6"><div className="text-sm text-muted-foreground mb-2">{index.name}</div><div className="flex items-center justify-between"><span className="text-lg font-semibold">{index.price.toLocaleString()}</span><div className={`flex items-center space-x-1 ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}><TrendingUp className={`h-4 w-4 ${index.change < 0 ? 'rotate-180' : ''}`} /><span className="text-sm font-medium">{index.changePercent > 0 ? '+' : ''}{index.changePercent.toFixed(2)}%</span></div></div></CardContent></Card>))}
            </div>
          )}
          {!dataLoading && (<div className="hidden md:block max-w-2xl mx-auto mt-6 mb-8 p-3 text-center"><p className="text-sm text-muted-foreground"><strong>Note:</strong> Market values shown are placeholders. We're working on live data integration.</p></div>)}
          <div className="hidden md:flex flex-col sm:flex-row gap-6 justify-center mt-16">
            <Button size="lg" onClick={() => onNavigate('markets')} className="bg-primary hover:bg-primary/90">Read Markets<ChevronRight className="ml-2 h-4 w-4" /></Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('watchlist')}>See Watchlist</Button>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>Newest Articles</h2>
          <Button variant="ghost" onClick={() => onNavigate('markets')} className="text-secondary hover:text-secondary/80">View all<ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{latestArticles.map((article) => (<ArticleCard key={article.id} article={article} onClick={(slug) => onNavigate('article', { slug })} userRole={userRole} onEdit={onEditArticle} />))}</div>
      </section>
      <section className="container mx-auto px-4 pt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-32 h-1 bg-secondary mb-4"></div>
            <h2 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'var(--font-headline)' }}>From Opinion</h2>
            <p className="text-muted-foreground">Insights and perspectives from our student contributors</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate('opinion')} className="text-secondary hover:text-secondary/80">View all<ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
        {opinionArticles.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{opinionArticles.map((article) => (<ArticleCard key={article.id} article={article} onClick={(slug) => onNavigate('article', { slug })} showRegion={false} userRole={userRole} onEdit={onEditArticle} />))}</div>) : (<Card className="p-8 text-center"><CardContent><p className="text-muted-foreground">Student opinion pieces coming soon. Check back for fresh perspectives from our contributors.</p></CardContent></Card>)}
      </section>
    </div>
  );
}