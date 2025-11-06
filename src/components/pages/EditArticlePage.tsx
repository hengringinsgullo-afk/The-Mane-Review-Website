import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ArticleSubmissionForm } from '../ui/article-submission-form';
import { articleOperations, type DatabaseArticle } from '../../lib/supabase';
import { Alert, AlertDescription } from '../ui/alert';

interface EditArticlePageProps {
  articleId: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export function EditArticlePage({ articleId, userId, userName, userRole, onNavigate, onBack }: EditArticlePageProps) {
  const [article, setArticle] = useState<DatabaseArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await articleOperations.getArticleById(articleId);
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Article not found');
      
      setArticle(data);
    } catch (err) {
      console.error('Error loading article:', err);
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onNavigate('admin');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading article...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Article not found'}</AlertDescription>
            </Alert>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-primary">Edit Article</h1>
        <p className="text-muted-foreground mt-2">
          Make changes to this article. Changes will be saved immediately.
        </p>
      </div>

      <ArticleSubmissionForm
        userId={userId}
        userName={userName}
        userRole={userRole}
        existingArticle={article}
        onSuccess={handleSuccess}
        onCancel={onBack}
      />
    </div>
  );
}
