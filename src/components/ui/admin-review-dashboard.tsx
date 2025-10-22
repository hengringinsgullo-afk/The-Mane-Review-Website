import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Textarea } from './textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  FileText,
  User,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Edit
} from 'lucide-react';
import { articleOperations, reviewOperations, type DatabaseArticle, type ArticleReview } from '../../lib/supabase';

interface AdminReviewDashboardProps {
  editorId?: string;
  onNavigateToArticle?: (slug: string) => void;
}

interface ArticleWithReviews extends DatabaseArticle {
  reviews?: ArticleReview[];
}

export function AdminReviewDashboard({ editorId, onNavigateToArticle }: AdminReviewDashboardProps) {
  const [articlesUnderReview, setArticlesUnderReview] = useState<ArticleWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingArticle, setReviewingArticle] = useState<DatabaseArticle | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadArticlesForReview();
  }, []);

  const loadArticlesForReview = async () => {
    try {
      setLoading(true);
      const articles = await articleOperations.getArticlesUnderReview();
      
      // Load reviews for each article
      const articlesWithReviews = await Promise.all(
        articles.map(async (article) => {
          try {
            const reviews = await reviewOperations.getArticleReviews(article.id);
            return { ...article, reviews };
          } catch {
            return { ...article, reviews: [] };
          }
        })
      );
      
      setArticlesUnderReview(articlesWithReviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (articleId: string, status: 'approved' | 'rejected' | 'needs_changes') => {
    if (!editorId) return;
    
    try {
      setSubmittingReview(true);
      await reviewOperations.submitReview(articleId, editorId, status, reviewComments);
      
      // Refresh the list
      await loadArticlesForReview();
      
      setReviewingArticle(null);
      setReviewComments('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: DatabaseArticle['status']) => {
    const statusConfig = {
      draft: { colour: 'secondary', icon: FileText, label: 'Draft' },
      review: { colour: 'warning', icon: Clock, label: 'Under Review' },
      published: { colour: 'success', icon: CheckCircle2, label: 'Published' },
      rejected: { colour: 'destructive', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge 
        variant={config.colour === 'warning' ? 'secondary' : 
                config.colour === 'success' ? 'default' :
                config.colour === 'destructive' ? 'destructive' : 'secondary'}
        className="flex items-center space-x-1"
      >
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const pendingArticles = articlesUnderReview.filter(article => article.status === 'review');
  const reviewedArticles = articlesUnderReview.filter(article => 
    article.reviews && article.reviews.length > 0
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles for review...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Editorial Review Dashboard</h2>
          <p className="text-muted-foreground">
            Review and manage student article submissions
          </p>
        </div>
        <Button onClick={loadArticlesForReview} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingArticles.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {reviewedArticles.filter(a => 
                    a.reviews?.some(r => r.status === 'approved')
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {reviewedArticles.filter(a => 
                    a.reviews?.some(r => r.status === 'rejected')
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending Review ({pendingArticles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Recently Reviewed ({reviewedArticles.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No articles are currently waiting for review.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        {getStatusBadge(article.status)}
                      </div>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{article.author_name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted {formatDate(article.created_at)}</span>
                        </span>
                        <span>{getWordCount(article.body)} words</span>
                        <span className="capitalize">{article.region}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{article.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {article.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap">{article.body}</div>
                            </div>
                            {article.submission_notes && (
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                                <h4 className="text-sm font-medium mb-1">Author's Notes</h4>
                                <p className="text-sm">{article.submission_notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog 
                        open={reviewingArticle?.id === article.id} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setReviewingArticle(null);
                            setReviewComments('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => setReviewingArticle(article)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Article</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-medium mb-2">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                By {article.author_name} • {getWordCount(article.body)} words
                              </p>
                              <p className="text-sm">
                                {article.excerpt || article.body.substring(0, 200) + '...'}
                              </p>
                            </div>
                            
                            <div>
                              <label htmlFor="review-comments" className="block text-sm font-medium mb-2">
                                Review Comments
                              </label>
                              <Textarea
                                id="review-comments"
                                placeholder="Provide feedback to the author..."
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                rows={4}
                              />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => handleReviewSubmit(article.id, 'needs_changes')}
                                disabled={submittingReview}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Request Changes
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReviewSubmit(article.id, 'rejected')}
                                disabled={submittingReview}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleReviewSubmit(article.id, 'approved')}
                                disabled={submittingReview}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {submittingReview ? 'Publishing...' : 'Approve & Publish'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                {article.submission_notes && (
                  <CardContent className="pt-0">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Author's Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {article.submission_notes}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recent reviews</h3>
                <p className="text-muted-foreground">
                  Recently reviewed articles will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            reviewedArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        {getStatusBadge(article.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{article.author_name}</span>
                        <span>Submitted {formatDate(article.created_at)}</span>
                        {article.published_at && (
                          <span>Published {formatDate(article.published_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    {article.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigateToArticle?.(article.slug)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Published
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                {article.reviews && article.reviews.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Review History</h4>
                      {article.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-muted/50 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Editorial Review</span>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{formatDate(review.created_at)}</span>
                              {getStatusBadge(review.status as any)}
                            </div>
                          </div>
                          {review.comments && (
                            <p className="text-sm text-muted-foreground">
                              {review.comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
