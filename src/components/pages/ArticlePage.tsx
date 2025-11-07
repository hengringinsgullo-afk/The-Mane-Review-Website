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
  const getRegionColor = (region: string) => ({ Brazil: 'bg-green-100 text-green-800', USA: 'bg-blue-100 text-blue-800', Europe: 'bg-purple-100 text-purple-800', Asia: 'bg-orange-100 text-orange-800' }[region] || 'bg-gray-100 text-gray-800');
  const renderContent = (body: string) => {
    return body.split('\n\n').map((block, i) => {
      const trimmed = block.trim();
      
      // Main Heading (H1) - Large, editorial style with generous spacing
      if (trimmed.startsWith('# ')) {
        return (
          <h1 
            key={i} 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 mt-16 first:mt-0 text-primary leading-tight tracking-tight" 
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      
      // Section Heading (H2) - Professional subheading with breathing room
      if (trimmed.startsWith('## ')) {
        return (
          <h2 
            key={i} 
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 mt-12 text-primary leading-snug border-l-4 border-primary pl-6 py-2" 
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      
      // Subsection Heading (H3) - Elegant tertiary heading
      if (trimmed.startsWith('### ')) {
        return (
          <h3 
            key={i} 
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-5 mt-10 text-secondary leading-snug" 
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      
      // Minor Heading (H4) - Smaller emphasis with good spacing
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 
            key={i} 
            className="text-base sm:text-lg md:text-xl font-semibold mb-4 mt-8 text-foreground"
          >
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      
      // Blockquote - Styled quote with generous padding
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote 
            key={i} 
            className="border-l-4 border-secondary pl-6 py-5 my-10 italic text-sm sm:text-base text-muted-foreground bg-muted/30 rounded-r-lg break-words"
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      
      // Bold text emphasis
      const processedText = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
      
      // Regular paragraph - Professional body text with excellent line height and spacing
      return (
        <p 
          key={i} 
          className="mb-7 leading-loose text-base text-foreground/90 break-words"
          style={{ lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    });
  };

  if (loading) return (<div className="container mx-auto px-4 py-12"><div className="text-center">Loading...</div></div>);
  if (!article) return (<div className="container mx-auto px-4 py-12"><Card className="p-8 text-center"><CardContent><h2 className="text-2xl font-bold mb-4">Article Not Found</h2><p className="text-muted-foreground mb-4">The article you're looking for doesn't exist.</p><Button onClick={() => onNavigate('home')}>Return Home</Button></CardContent></Card></div>);

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" onClick={() => onNavigate('back')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <header className="space-y-8 mb-16 pb-12 border-b">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge className={getRegionColor(article.region)} style={{ padding: '6px 12px', fontSize: '14px' }}>{article.region}</Badge>
          {article.featured && (<Badge className="bg-secondary text-secondary-foreground" style={{ padding: '6px 12px', fontSize: '14px' }}>Featured</Badge>)}
          {article.authorRole === 'Student' && (<Badge className="bg-muted text-muted-foreground" style={{ padding: '6px 12px', fontSize: '14px' }}><User className="h-3 w-3 mr-1" />Student Contributor</Badge>)}
          {article.authorRole === 'Founder' && (<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" style={{ padding: '6px 12px', fontSize: '14px' }}><User className="h-3 w-3 mr-1" />Expert</Badge>)}
        </div>
        <h1 className="font-bold text-primary leading-tight mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '48px', lineHeight: '1.1' }}>{article.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.excerpt}</p>
        <div className="flex flex-wrap gap-4 mb-12">{article.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-sm px-4 py-2">{tag}</Badge>))}</div>
        <div className="flex flex-wrap items-center gap-8 pt-6 pb-12"><div><div className="font-semibold text-foreground text-lg mb-1">{(article as any).author_name || 'Anonymous'}</div><div className="text-sm text-muted-foreground">{article.authorRole}</div></div><Separator orientation="vertical" className="h-12 hidden sm:block" /><div className="flex items-center gap-2 text-base text-muted-foreground"><Calendar className="h-5 w-5" /><span>{article.publishedAt && formatDate(article.publishedAt)}</span></div><div className="flex items-center gap-2 text-base text-muted-foreground"><Clock className="h-5 w-5" /><span>{article.estReadMin} min read</span></div></div>
      </header>
      {article.coverImage && (<div className="relative aspect-[16/9] mb-8 mt-12 rounded-lg overflow-hidden"><ImageWithFallback src={article.coverImage} alt={article.coverAlt || article.title} className="w-full h-full object-cover" /></div>)}
      <div className="prose prose-lg max-w-none mb-12">{renderContent(article.body)}</div>
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 mb-16"><CardContent className="p-6"><div className="text-sm text-amber-900 dark:text-amber-100"><p className="font-medium mb-2">Educational Content Disclaimer</p><p>This article is provided for educational purposes only and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.</p></div></CardContent></Card>
      {relatedArticles.length > 0 && (<section className="space-y-8 mt-16"><h2 className="text-3xl font-bold text-primary mb-8" style={{ fontFamily: 'var(--font-headline)' }}>Related Articles</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{relatedArticles.map((related) => (<ArticleCard key={related.id} article={related} onClick={(slug) => onNavigate('article', { slug })} />))}</div></section>)}
    </article>
  );
}