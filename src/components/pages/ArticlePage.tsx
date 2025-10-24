import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ArticleCard } from '../ui/article-card';
import { Clock, Calendar, User, ArrowLeft } from 'lucide-react';
import { Article } from '../../lib/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { supabase } from '../../lib/supabase';

interface ArticlePageProps { slug: string; onNavigate: (page: string, data?: any) => void; }

export function ArticlePage({ slug, onNavigate }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data: dbArticle } = await supabase.from('articles').select('*').eq('slug', slug).eq('status', 'published').single();
        if (dbArticle) {
          const converted: any = { id: dbArticle.id, slug: dbArticle.slug, title: dbArticle.title, excerpt: dbArticle.excerpt || '', body: dbArticle.body, coverImage: dbArticle.cover_image, coverAlt: dbArticle.cover_alt, region: dbArticle.region as any, category: dbArticle.category as any, tags: dbArticle.tags, authorId: dbArticle.author_id, author_name: dbArticle.author_name, authorRole: dbArticle.author_role as any, status: 'published', publishedAt: new Date(dbArticle.published_at), updatedAt: new Date(dbArticle.updated_at), featured: dbArticle.featured, estReadMin: dbArticle.est_read_min, views: dbArticle.views };
          setArticle(converted);
        }
      } catch (error) { console.error('Error loading article:', error); } finally { setLoading(false); }
    };
    loadArticle();
  }, [slug]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!article) return;
      try {
        const { data: dbArticles } = await supabase.from('articles').select('*').eq('status', 'published').neq('id', article.id).limit(3);
        if (dbArticles) {
          const converted: Article[] = dbArticles.map(a => ({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt || '', body: a.body, coverImage: a.cover_image, coverAlt: a.cover_alt, region: a.region as any, category: a.category as any, tags: a.tags, authorId: a.author_id, authorRole: a.author_role as any, status: 'published', publishedAt: new Date(a.published_at), updatedAt: new Date(a.updated_at), featured: a.featured, estReadMin: a.est_read_min, views: a.views }));
          setRelatedArticles(converted);
        }
      } catch (error) { console.error('Error loading related articles:', error); }
    };
    loadRelated();
  }, [article]);

  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const getRegionColor = (region: string) => ({ Brazil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', USA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', Europe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', Asia: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' }[region as keyof typeof colors] || 'bg-gray-100 text-gray-800');
  
  const renderContent = (body: string) => body.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('# ')) return (<h1 key={index} className="text-3xl font-bold mb-8 text-primary" style={{ fontFamily: 'var(--font-headline)' }}>{paragraph.replace('# ', '')}</h1>);
    if (paragraph.startsWith('## ')) return (<h2 key={index} className="text-2xl font-semibold mb-6 text-primary" style={{ fontFamily: 'var(--font-headline)' }}>{paragraph.replace('## ', '')}</h2>);
    if (paragraph.startsWith('### ')) return (<h3 key={index} className="text-xl font-medium mb-4 text-primary">{paragraph.replace('### ', '')}</h3>);
    return (<p key={index} className="mb-6 leading-relaxed text-foreground">{paragraph}</p>);
  });

  if (loading) return (<div className="container mx-auto px-4 py-12"><div className="text-center">Loading article...</div></div>);
  if (!article) return (<div className="container mx-auto px-4 py-12"><Card className="p-8 text-center"><CardContent><h2 className="text-2xl font-bold mb-4">Article Not Found</h2><p className="text-muted-foreground mb-4">The article you're looking for doesn't exist or has been moved.</p><Button onClick={() => onNavigate('home')}>Return Home</Button></CardContent></Card></div>);

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" onClick={() => onNavigate('back')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <header className="space-y-8 mb-16 pb-12 border-b">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge className={getRegionColor(article.region)} style={{ padding: '6px 12px', fontSize: '14px' }}>{article.region}</Badge>
          {article.featured && (<Badge className="bg-secondary text-secondary-foreground" style={{ padding: '6px 12px', fontSize: '14px' }}>Featured</Badge>)}
          {article.authorRole === 'Student' && (<Badge className="bg-muted text-muted-foreground" style={{ padding: '6px 12px', fontSize: '14px' }}><User className="h-3 w-3 mr-1" />Student Contributor</Badge>)}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6" style={{ fontFamily: 'var(--font-headline)' }}>{article.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.excerpt}</p>
        <div className="flex flex-wrap gap-3 mb-16">{article.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-sm px-4 py-2">{tag}</Badge>))}</div>
        <div className="flex flex-wrap items-center gap-8 pt-8">
          <div>
            <div className="font-semibold text-foreground text-lg mb-1">{(article as any).author_name || 'Anonymous'}</div>
            <div className="text-sm text-muted-foreground">{article.authorRole}</div>
          </div>
          <Separator orientation="vertical" className="h-12 hidden sm:block" />
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Calendar className="h-5 w-5" /><span>{article.publishedAt && formatDate(article.publishedAt)}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{article.estReadMin} min read</span></div>
          </div>
        </div>
      </header>
      {article.coverImage && (<div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden"><ImageWithFallback src={article.coverImage} alt={article.coverAlt || article.title} className="w-full h-full object-cover" /></div>)}
      <div className="prose prose-lg max-w-none mb-12">{renderContent(article.body)}</div>
      {relatedArticles.length > 0 && (<section className="mt-16 pt-8 border-t"><h2 className="text-2xl font-bold text-primary mb-6" style={{ fontFamily: 'var(--font-headline)' }}>Related Articles</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{relatedArticles.map((related) => (<ArticleCard key={related.id} article={related} onClick={(slug) => onNavigate('article', { slug })} />))}</div></section>)}
    </article>
  );
}