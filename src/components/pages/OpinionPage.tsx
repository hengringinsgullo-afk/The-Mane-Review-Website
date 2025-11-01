import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArticleCard } from '../ui/article-card';
import { GraduationCap, Users, ExternalLink, PenTool, Plus, Trash2 } from 'lucide-react';
import { mockArticles } from '../../lib/data';
import { articleOperations } from '../../lib/supabase';
import { ArticleSubmissionForm } from '../ui/article-submission-form';
import { toast } from 'sonner';
import type { Article } from '../../lib/types';

interface OpinionPageProps { 
  onNavigate: (page: string, data?: any) => void; 
  user?: any; 
}

type SortOption = 'latest' | 'popular';

export function OpinionPage({ onNavigate, user }: OpinionPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [showAll, setShowAll] = useState(false);
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    console.log('[OpinionPage] showSubmissionForm changed:', showSubmissionForm);
    
    // Block body scroll when modal is open
    if (showSubmissionForm || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSubmissionForm, showDeleteModal]);

  useEffect(() => { 
    loadPublishedArticles(); 
  }, []);

  const loadPublishedArticles = async () => {
    try { 
      setLoading(true); 
      const dbArticles = await articleOperations.getPublishedArticles(); 
      const convertedArticles: Article[] = dbArticles
        .filter(article => article.category === 'Opinion')
        .map(dbArticle => ({ 
          id: dbArticle.id, 
          slug: dbArticle.slug, 
          title: dbArticle.title, 
          excerpt: dbArticle.excerpt || '', 
          body: dbArticle.body, 
          coverImage: dbArticle.cover_image, 
          coverAlt: dbArticle.cover_alt, 
          region: dbArticle.region as any, 
          category: dbArticle.category as any, 
          tags: dbArticle.tags, 
          authorId: dbArticle.author_id, 
          authorRole: dbArticle.author_role as any, 
          status: 'published' as const, 
          publishedAt: dbArticle.published_at ? new Date(dbArticle.published_at) : new Date(), 
          updatedAt: new Date(dbArticle.updated_at), 
          featured: dbArticle.featured, 
          estReadMin: dbArticle.est_read_min, 
          views: dbArticle.views 
        })); 
      setPublishedArticles(convertedArticles); 
    } catch (error) { 
      console.error('Failed to load articles:', error); 
      setPublishedArticles(mockArticles.filter(article => article.status === 'published' && article.category === 'Opinion')); 
    } finally { 
      setLoading(false); 
    }
  };

  const allOpinionArticles = [
    ...publishedArticles, 
    ...mockArticles.filter(article => 
      article.status === 'published' && 
      article.category === 'Opinion' && 
      !publishedArticles.some(pub => pub.id === article.id)
    )
  ].sort((a, b) => { 
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0); 
    return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime(); 
  });
  
  const articlesForGrid = showAll ? allOpinionArticles : allOpinionArticles.slice(0, 6);

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      await articleOperations.deleteArticle(articleToDelete.id);
      toast.success('Article deleted successfully');
      setShowDeleteModal(false);
      setArticleToDelete(null);
      await loadPublishedArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('Failed to delete article');
    }
  };

  const renderBrowseTab = () => (
    <>
      <section className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
            New Articles
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Explore the latest finance and investing perspectives from our St. Paul's contributors.
          </p>
        </div>

        {loading ? (
          <Card className="p-10 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </CardContent>
          </Card>
        ) : articlesForGrid.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articlesForGrid.map((article) => (
              <div key={article.id} className="relative group">
                <ArticleCard 
                  article={article} 
                  onClick={(slug) => onNavigate('article', { slug })} 
                />
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArticleToDelete(article);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <CardContent>
              <div className="space-y-5">
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto" />
                <h4 className="text-lg font-medium">No opinion pieces yet</h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're building our opinion section. Check back soon!
                </p>
                <Button variant="ghost" onClick={() => onNavigate('home')}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 mt-12 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-secondary" />
            <span>Student Contributors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our opinion section elevates thoughtful analysis and original investment takes from St. Paul's School students. 
            These voices bring an academic rigor and first-hand perspective to complex financial topics.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground">
              <Users className="h-3 w-3 mr-1" />
              Student Editorial Programme
            </Badge>
            <Badge variant="outline">Youth Perspectives</Badge>
            <Badge variant="outline">Educational Content</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5 text-primary" />
            <span>Contribute Your Voice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">For Students</h4>
              <p className="text-sm text-muted-foreground mb-3">
                St. Paul's School students can submit opinion pieces on financial markets, investment trends, 
                and economic policy for review and publication.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 400-1000 word limit</li>
                <li>• Original analysis required</li>
                <li>• Proper source citations</li>
                <li>• Subject to editorial review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">How to Submit & Join</h4>
              {user ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You're signed in! Click the button below to submit your opinion piece directly.
                  </p>
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => setShowSubmissionForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Submit Article
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your article will be reviewed by our editorial team before publication.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    To submit articles or join The Mane Review team, please sign in or contact:
                  </p>
                  <a href="mailto:hg3@stpauls.br" className="text-primary font-medium hover:underline flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    hg3@stpauls.br
                  </a>
                  <p className="text-xs text-muted-foreground mt-3">
                    We'll guide you through the submission process and answer any questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <div className="text-center space-y-8">
        <h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}>
          Opinion
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Essays on markets, investing, and economic thinking written by St. Paul's School students and guided by our editorial team.
        </p>
      </div>
      <div className="space-y-8">
        {renderBrowseTab()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && articleToDelete && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delete Article?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete "{articleToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteArticle}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Article
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Submission Modal */}
      {showSubmissionForm && user && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
          onClick={() => setShowSubmissionForm(false)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl w-full max-w-4xl flex flex-col"
            style={{ 
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background border-b p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Submit Article for Review</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill out the form below to submit your opinion piece for editorial review.
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSubmissionForm(false)}
                  className="shrink-0"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <ArticleSubmissionForm 
                userId={user.id} 
                userName={user.name || user.email} 
                userRole={user.role}
                onSuccess={() => { 
                  setShowSubmissionForm(false); 
                  loadPublishedArticles(); 
                }} 
                onCancel={() => setShowSubmissionForm(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
