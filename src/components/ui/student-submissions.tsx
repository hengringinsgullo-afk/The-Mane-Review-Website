import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit, 
  Eye, 
  Trash2,
  Calendar
} from 'lucide-react';
import { articleOperations, reviewOperations, type DatabaseArticle, type ArticleReview } from '../../lib/supabase';
import { ArticleSubmissionForm } from './article-submission-form';

interface StudentSubmissionsProps {
  studentId?: string;
  onNavigateToArticle?: (slug: string) => void;
}

interface ArticleWithReviews extends DatabaseArticle {
  reviews?: (ArticleReview & { reviewer: { name: string; role: string } })[];
}

export function StudentSubmissions({ studentId, onNavigateToArticle }: StudentSubmissionsProps) {
  const [articles, setArticles] = useState<ArticleWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<DatabaseArticle | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentArticles();
    }
  }, [studentId]);

  const loadStudentArticles = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const articlesData = await articleOperations.getArticlesByUser(studentId);
      
      // Load reviews for each article
      const articlesWithReviews = await Promise.all(
        articlesData.map(async (article) => {
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

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await articleOperations.deleteArticle(id);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  const getStatusBadge = (status: DatabaseArticle['status']) => {
    const statusConfig = {
      draft: { color: 'secondary', icon: FileText, label: 'Draft' },
      review: { color: 'warning', icon: Clock, label: 'Under Review' },
      published: { color: 'success', icon: CheckCircle2, label: 'Published' },
      rejected: { color: 'destructive', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge 
        variant={config.color === 'warning' ? 'secondary' : 
                config.color === 'success' ? 'default' :
                config.color === 'destructive' ? 'destructive' : 'secondary'}
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
      day: 'numeric'
    });
  };

  const canEdit = (article: DatabaseArticle) => {
    return article.status === 'draft' || article.status === 'rejected';
  };

  const canDelete = (article: DatabaseArticle) => {
    return article.status === 'draft';
  };

  if (showSubmissionForm) {
    return (
      <ArticleSubmissionForm
        userId={studentId}
        userName={editingArticle?.author_name}
        existingArticle={editingArticle || undefined}
        onSuccess={() => {
          setShowSubmissionForm(false);
          setEditingArticle(null);
          loadStudentArticles();
        }}
        onCancel={() => {
          setShowSubmissionForm(false);
          setEditingArticle(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your Submissions</h2>
          <p className="text-muted-foreground">
            Track your article submissions and review feedback
          </p>
        </div>
        <Button onClick={() => setShowSubmissionForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Submit New Article
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by submitting your first article for review
            </p>
            <Button onClick={() => setShowSubmissionForm(true)}>
              Submit Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
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
                        <Calendar className="h-3 w-3" />
                        <span>Submitted {formatDate(article.created_at)}</span>
                      </span>
                      <span>{article.est_read_min} min read</span>
                      <span>{article.category}</span>
                      <span className="capitalize">{article.region}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {article.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigateToArticle?.(article.slug)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {canEdit(article) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingArticle(article);
                          setShowSubmissionForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    {canDelete(article) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteArticle(article.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {/* Review Feedback */}
              {article.reviews && article.reviews.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Review Feedback</h4>
                    {article.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-muted/50 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {review.reviewer.name} ({review.reviewer.role})
                          </span>
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
              
              {/* Submission Notes */}
              {article.submission_notes && (
                <CardContent className="pt-0">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-1">Your Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {article.submission_notes}
                    </p>
                  </div>
                </CardContent>
              )}
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
