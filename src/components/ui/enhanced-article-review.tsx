import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './dialog';
import { Textarea } from './textarea';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
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
  Edit,
  Search,
  Filter,
  Download,
  Send,
  Globe,
  Tag,
  TrendingUp,
  BookOpen,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Star,
  UserCheck,
  Hash,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { articleOperations, reviewOperations, type DatabaseArticle, type ArticleReview } from '../../lib/supabase';
import { toast } from 'sonner';

interface EnhancedArticleReviewProps {
  editorId?: string;
  editorName?: string;
  onNavigateToArticle?: (slug: string) => void;
  onActionComplete?: () => void;
}

interface ArticleWithReviews extends DatabaseArticle {
  reviews?: ArticleReview[];
}

export function EnhancedArticleReview({ 
  editorId, 
  editorName,
  onNavigateToArticle,
  onActionComplete 
}: EnhancedArticleReviewProps) {
  const [articles, setArticles] = useState<ArticleWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithReviews | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<ArticleWithReviews | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteArticle, setDeleteArticle] = useState<ArticleWithReviews | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'needs_changes' | null>(null);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [suggestedExcerpt, setSuggestedExcerpt] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Block body scroll when modals are open
  useEffect(() => {
    if (showPreviewModal || showDeleteModal || showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPreviewModal, showDeleteModal, showReviewModal]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const allArticles = await articleOperations.getArticlesUnderReview();
      
      // Load reviews for each article
      const articlesWithReviews = await Promise.all(
        allArticles.map(async (article) => {
          try {
            const reviews = await reviewOperations.getArticleReviews(article.id);
            return { ...article, reviews };
          } catch {
            return { ...article, reviews: [] };
          }
        })
      );
      
      setArticles(articlesWithReviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!editorId || !selectedArticle || !reviewDecision) return;
    
    try {
      setSubmittingReview(true);
      
      // Submit the review
      await reviewOperations.submitReview(
        selectedArticle.id, 
        editorId, 
        reviewDecision, 
        reviewComments
      );

      // Update article status based on decision
      if (reviewDecision === 'approved') {
        await articleOperations.updateArticle(selectedArticle.id, {
          status: 'published',
          published_at: new Date().toISOString(),
          reviewer_id: editorId,
          review_notes: reviewComments,
          title: suggestedTitle || selectedArticle.title,
          excerpt: suggestedExcerpt || selectedArticle.excerpt,
          tags: suggestedTags.length > 0 ? suggestedTags : selectedArticle.tags
        });
        
        toast.success('Article approved and published!');
      } else if (reviewDecision === 'rejected') {
        await articleOperations.updateArticle(selectedArticle.id, {
          status: 'rejected',
          reviewer_id: editorId,
          review_notes: reviewComments
        });
        
        toast.error('Article rejected');
      } else {
        // needs_changes - keep status as review but add notes
        await articleOperations.updateArticle(selectedArticle.id, {
          status: 'review', // Keep in review so author can see feedback
          reviewer_id: editorId,
          review_notes: reviewComments
        });
        
        toast.info('Changes requested - Article remains in review');
      }
      
      // Refresh and reset
      await loadArticles();
      setShowReviewModal(false);
      resetReviewForm();
      onActionComplete?.();
      
    } catch (err) {
      toast.error('Failed to submit review');
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const resetReviewForm = () => {
    setSelectedArticle(null);
    setReviewComments('');
    setReviewDecision(null);
    setSuggestedTitle('');
    setSuggestedExcerpt('');
    setSuggestedTags([]);
  };

  const openReviewModal = (article: ArticleWithReviews) => {
    setSelectedArticle(article);
    setSuggestedTitle(article.title);
    setSuggestedExcerpt(article.excerpt || '');
    setSuggestedTags(article.tags);
    setShowReviewModal(true);
  };

  // Filter and sort articles
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = filterRegion === 'all' || article.region === filterRegion;
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
      
      return matchesSearch && matchesRegion && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.author_name || '').localeCompare(b.author_name || '');
        default:
          return 0;
      }
    });

  const pendingArticles = filteredArticles.filter(a => a.status === 'review');
  const reviewedArticles = filteredArticles.filter(a => a.reviews && a.reviews.length > 0);

  const getStatusBadge = (status: DatabaseArticle['status']) => {
    const configs = {
      draft: { colour: 'secondary', icon: FileText, label: 'Draft' },
      review: { colour: 'warning', icon: Clock, label: 'Under Review' },
      published: { colour: 'success', icon: CheckCircle2, label: 'Published' },
      rejected: { colour: 'destructive', icon: XCircle, label: 'Rejected' }
    };
    const config = configs[status] || configs.draft;
    const Icon = config.icon;
    
    return (
      <Badge 
        variant={config.colour as any}
        className="flex items-center gap-1"
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getWordCount = (text: string) => text.trim().split(/\s+/).length;
  const getReadingTime = (text: string) => Math.ceil(getWordCount(text) / 200); // 200 words per minute

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading articles for review...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Editorial Review Center
            </h2>
            <p className="text-muted-foreground mt-1">
              Review and manage article submissions with precision
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{pendingArticles.length}</p>
              <p className="text-sm text-muted-foreground">Awaiting Review</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{reviewedArticles.length}</p>
              <p className="text-sm text-muted-foreground">Reviewed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="South America">South America</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Markets">Markets</SelectItem>
                <SelectItem value="Opinion">Opinion</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="author">Author A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingArticles.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Recently Reviewed ({reviewedArticles.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Articles Tab */}
        <TabsContent value="pending" className="mt-6">
          {pendingArticles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No articles are currently waiting for review. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl font-semibold flex-1">{article.title}</h3>
                          {getStatusBadge(article.status)}
                        </div>
                        
                        {article.excerpt && (
                          <p className="text-muted-foreground line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {getWordCount(article.body)} words
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {getReadingTime(article.body)} min read
                          </span>
                          <Badge variant="outline">
                            <Globe className="h-3 w-3 mr-1" />
                            {article.region}
                          </Badge>
                          <Badge variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {article.category}
                          </Badge>
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {article.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setPreviewArticle(article);
                            setShowPreviewModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>

                        <Button 
                          size="sm"
                          onClick={() => openReviewModal(article)}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-4 w-4" />
                          Review
                        </Button>

                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setDeleteArticle(article);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviewed Articles Tab */}
        <TabsContent value="reviewed" className="mt-6">
          {reviewedArticles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Recent Reviews</h3>
                <p className="text-muted-foreground">
                  Articles you've reviewed will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviewedArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{article.title}</h3>
                          {getStatusBadge(article.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.author_name}</span>
                          <span>•</span>
                          <span>Submitted {new Date(article.created_at).toLocaleDateString()}</span>
                          {article.published_at && (
                            <>
                              <span>•</span>
                              <span>Published {new Date(article.published_at).toLocaleDateString()}</span>
                            </>
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
                          View Live
                        </Button>
                      )}
                    </div>

                    {article.reviews && article.reviews.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {article.reviews.map((review) => (
                          <div key={review.id} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                Review by {editorName || 'Editor'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                                <Badge 
                                  variant={
                                    review.status === 'approved' ? 'default' :
                                    review.status === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {review.status}
                                </Badge>
                              </div>
                            </div>
                            {review.comments && (
                              <p className="text-sm text-muted-foreground">{review.comments}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreviewModal && previewArticle && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl w-full max-w-5xl flex flex-col"
            style={{ maxHeight: '95vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background border-b p-6 flex-shrink-0 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{previewArticle.title}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>{previewArticle.category}</Badge>
                  <Badge variant="outline">{previewArticle.region}</Badge>
                  {previewArticle.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  By {previewArticle.author_name} • {new Date(previewArticle.created_at).toLocaleString()}
                </div>

                {previewArticle.cover_image && (
                  <img 
                    src={previewArticle.cover_image} 
                    alt={previewArticle.cover_alt || previewArticle.title}
                    className="w-full rounded-lg"
                  />
                )}

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap leading-relaxed">{previewArticle.body}</div>
                </div>

                {previewArticle.submission_notes && (
                  <Alert className="mt-6">
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Author's Notes:</strong> {previewArticle.submission_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteArticle && (
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
                Are you sure you want to delete "{deleteArticle.title}"? This action cannot be undone.
              </p>
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The author will not be notified of this deletion.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await articleOperations.deleteArticle(deleteArticle.id);
                      toast.success('Article deleted successfully');
                      setShowDeleteModal(false);
                      await loadArticles();
                      onActionComplete?.();
                    } catch (err) {
                      toast.error('Failed to delete article');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Article
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Review Modal */}
      {showReviewModal && selectedArticle && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl w-full max-w-3xl flex flex-col"
            style={{ maxHeight: '95vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background border-b p-6 flex-shrink-0 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Review Article</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 pb-6">
                {/* Article Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedArticle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Author</p>
                        <p className="font-medium">{selectedArticle.author_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{new Date(selectedArticle.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Word Count</p>
                        <p className="font-medium">{getWordCount(selectedArticle.body)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reading Time</p>
                        <p className="font-medium">{getReadingTime(selectedArticle.body)} minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Editorial Improvements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Editorial Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="suggested-title">Suggested Title</Label>
                      <Input
                        id="suggested-title"
                        value={suggestedTitle}
                        onChange={(e) => setSuggestedTitle(e.target.value)}
                        placeholder="Keep original or suggest improvement..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="suggested-excerpt">Suggested Excerpt</Label>
                      <Textarea
                        id="suggested-excerpt"
                        value={suggestedExcerpt}
                        onChange={(e) => setSuggestedExcerpt(e.target.value)}
                        placeholder="Brief summary for article preview..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Suggested Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestedTags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                            <button
                              onClick={() => setSuggestedTags(suggestedTags.filter((_, i) => i !== idx))}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Input
                          placeholder="Add tag..."
                          className="w-32"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              setSuggestedTags([...suggestedTags, e.currentTarget.value]);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Decision */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={reviewDecision === 'approved' ? 'default' : 'outline'}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => setReviewDecision('approved')}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant={reviewDecision === 'needs_changes' ? 'secondary' : 'outline'}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => setReviewDecision('needs_changes')}
                      >
                        <Edit className="h-5 w-5" />
                        <span>Changes</span>
                      </Button>
                      <Button
                        variant={reviewDecision === 'rejected' ? 'destructive' : 'outline'}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => setReviewDecision('rejected')}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span>Reject</span>
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="review-comments">
                        Review Comments {reviewDecision === 'approved' ? '(Optional)' : '(Required)'}
                      </Label>
                      <Textarea
                        id="review-comments"
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        placeholder={
                          reviewDecision === 'approved' 
                            ? "Great work! Any additional notes..."
                            : reviewDecision === 'rejected'
                            ? "Please explain why this article cannot be published..."
                            : "What changes need to be made..."
                        }
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    {reviewDecision === 'approved' && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          This article will be published immediately after approval.
                        </AlertDescription>
                      </Alert>
                    )}

                    {reviewDecision === 'rejected' && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          The author will be notified of the rejection with your feedback.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-shrink-0 border-t p-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReviewSubmit}
                disabled={
                  submittingReview || 
                  !reviewDecision || 
                  (reviewDecision !== 'approved' && !reviewComments.trim())
                }
              >
                {submittingReview ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}